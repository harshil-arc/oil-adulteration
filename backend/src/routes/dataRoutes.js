const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { analyzeOil } = require('../services/analysisService');
const { validateDeviceApiKey } = require('../middleware/auth');

// POST /api/data – Receive data from ESP32 and analyze
router.post('/', validateDeviceApiKey, async (req, res) => {
  try {
    const { device_id, oil_type, sensor_values, timestamp } = req.body;

    // 1. Core Validation
    if (!device_id || !oil_type || !sensor_values) {
      return res.status(400).json({ error: 'Missing required fields: device_id, oil_type, sensor_values' });
    }

    const { tds_ppm, turbidity_ntu, ph, density_gcm3, temperature_c, viscosity_cp, refractive_index } = sensor_values;
    const required = ['tds_ppm', 'turbidity_ntu', 'ph', 'density_gcm3', 'temperature_c', 'viscosity_cp', 'refractive_index'];
    for (const field of required) {
      if (sensor_values[field] == null) {
        return res.status(400).json({ error: `Missing sensor field: ${field}` });
      }
    }

    // 2. Freshness Check (REQR 2)
    const dataTime = new Date(timestamp || new Date()).getTime();
    const now = Date.now();
    if (now - dataTime > 10000) {
      return res.status(400).json({ error: 'Data rejected: Sensor reading is older than 10 seconds' });
    }

    // 3. Sensor Sanity Validation (REQR 4)
    if (tds_ppm < 0 || tds_ppm > 2000) return res.status(400).json({ error: 'Invalid sensor readings detected: TDS out of range' });
    if (turbidity_ntu < 0 || turbidity_ntu > 1000) return res.status(400).json({ error: 'Invalid sensor readings detected: Turbidity out of range' });
    if (ph < 0 || ph > 14) return res.status(400).json({ error: 'Invalid sensor readings detected: pH out of range' });
    if (density_gcm3 < 0.7 || density_gcm3 > 1.3) return res.status(400).json({ error: 'Invalid sensor readings detected: Density out of range' });

    // 4. Device State Management (REQR 1)
    const { data: device } = await supabase.from('devices').select('id, shop_id').eq('device_id', device_id).single();
    
    // Auto-upsert device status
    await supabase.from('devices').upsert({
      device_id,
      status: 'online',
      last_seen: new Date().toISOString(),
    }, { onConflict: 'device_id' });

    // 5. Run Analysis
    const analysis = analyzeOil(sensor_values, oil_type);

    // 6. Save Reading & Result
    const { data: reading, error: readingError } = await supabase
      .from('oil_readings')
      .insert({
        device_id,
        oil_type,
        tds_ppm,
        turbidity_ntu,
        ph,
        density_gcm3,
        temperature_c,
        viscosity_cp,
        refractive_index,
        timestamp: timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (readingError) throw readingError;

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

    // 7. Real-time Broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('live_tensor_data', { device_id, sensor_values, timestamp });
      io.emit('device_status', { device_id, status: 'online', last_seen: new Date() });
      io.emit('new_reading', { reading, analysis: result, device_id });
    }

    res.status(201).json({ success: true, analysis: result });
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
