const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { analyzeOil } = require('../services/analysisService');
const { validateDeviceApiKey } = require('../middleware/auth');

// POST /api/data – Receive data from ESP32 and analyze
router.post('/', validateDeviceApiKey, async (req, res) => {
  try {
    const { device_id, oil_type, sensor_values, timestamp } = req.body;

    if (!device_id || !oil_type || !sensor_values) {
      return res.status(400).json({ error: 'Missing required fields: device_id, oil_type, sensor_values' });
    }

    const { ir_value, uv_value, density, temperature } = sensor_values;
    if (ir_value == null || uv_value == null || density == null || temperature == null) {
      return res.status(400).json({ error: 'sensor_values must include ir_value, uv_value, density, temperature' });
    }

    // Fetch device to see if it has a shop_id
    const { data: existingDevice } = await supabase.from('devices').select('shop_id').eq('device_id', device_id).single();
    
    let shop_id = existingDevice?.shop_id;
    
    // If no shop_id, assign a mock shop for testing (from seed data)
    if (!shop_id) {
       const { data: shops } = await supabase.from('shops').select('id').limit(1);
       if (shops && shops.length > 0) {
          shop_id = shops[0].id;
       }
    }

    // Upsert device record
    await supabase.from('devices').upsert({
      device_id,
      shop_id,
      name: `ESP32 Sensor ${device_id}`,
      status: 'online',
      last_seen: new Date().toISOString(),
    }, { onConflict: 'device_id' });

    // Save raw reading
    const { data: reading, error: readingError } = await supabase
      .from('oil_readings')
      .insert({
        device_id,
        oil_type,
        ir_value,
        uv_value,
        density,
        temperature,
        timestamp: timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (readingError) throw readingError;

    // Run analysis
    const analysis = analyzeOil(sensor_values, oil_type);

    // Save analysis result
    const { data: result, error: resultError } = await supabase
      .from('analysis_results')
      .insert({
        reading_id: reading.id,
        device_id,
        oil_type,
        purity: analysis.purity,
        adulteration: analysis.adulteration,
        quality: analysis.quality,
        likely_adulterants: analysis.likely_adulterants,
        contaminants: analysis.contaminants,
        health_advisory: analysis.health_advisory,
        sensor_snapshot: sensor_values,
        timestamp: timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (resultError) throw resultError;

    // Map Integration: Update assigned shop based on the analysis
    if (shop_id) {
      const mappedStatus = analysis.quality === 'Unsafe' ? 'adulterated' : analysis.quality === 'Moderate' ? 'moderate' : 'safe';
      
      await supabase.from('shops').update({
        last_purity: analysis.purity,
        status: mappedStatus,
        updated_at: new Date().toISOString()
      }).eq('id', shop_id);
    }

    if (resultError) throw resultError;

    // Create alert if adulteration exceeds threshold
    const threshold = parseFloat(process.env.ADULTERATION_THRESHOLD || '20');
    if (analysis.adulteration > threshold) {
      await supabase.from('alerts').insert({
        reading_id: reading.id,
        device_id,
        oil_type,
        severity: analysis.adulteration > 35 ? 'critical' : 'warning',
        message: `${oil_type} adulteration detected at ${analysis.adulteration}%. Adulterants: ${analysis.likely_adulterants.join(', ')}`,
        adulteration: analysis.adulteration,
      });
    }

    // Emit real-time event to connected Socket.io clients
    const io = req.app.get('io');
    if (io) {
      io.emit('new_reading', {
        reading,
        analysis: result,
        device_id,
        oil_type,
      });
    }

    res.status(201).json({
      success: true,
      reading_id: reading.id,
      analysis: {
        purity: analysis.purity,
        adulteration: analysis.adulteration,
        quality: analysis.quality,
        qualityLabel: analysis.qualityLabel,
        likely_adulterants: analysis.likely_adulterants,
        contaminants: analysis.contaminants,
        health_advisory: analysis.health_advisory,
      },
    });
  } catch (err) {
    console.error('[POST /api/data] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST /api/analyze – Analyze sensor values without saving (for quick checks)
router.post('/analyze', (req, res) => {
  try {
    const { oil_type, sensor_values } = req.body;
    if (!oil_type || !sensor_values) {
      return res.status(400).json({ error: 'Missing oil_type or sensor_values' });
    }
    const result = analyzeOil(sensor_values, oil_type);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
