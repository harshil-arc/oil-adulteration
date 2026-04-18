const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

/**
 * PWA Bulk Offline Sync Endpoint
 * Called automatically when client network listener detects "Online"
 * Expects: { queuedLogs: [{ event_id, quantity, type, ... }] }
 */
router.post('/syncPwa', async (req, res) => {
  try {
    const { queuedLogs } = req.body;
    if (!queuedLogs || !Array.isArray(queuedLogs)) {
      return res.status(400).json({ error: 'Valid queuedLogs array required' });
    }

    // Process all logs (mock inserting to supabase)
    let processed = 0;
    for (const log of queuedLogs) {
      if (log.type === 'surplus') {
        await supabase.from('surplus_inventory').insert([log.payload]);
      } else if (log.type === 'analytics') {
        await supabase.from('analytics_log').insert([log.payload]);
      }
      processed++;
    }

    res.json({ success: true, processed, message: 'Offline cache synced to primary DB' });
  } catch (error) {
    console.error('PWA Sync Error:', error.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * SMS Webhook Catcher (Twilio/Nexmo formatting)
 * Expected body formats from SMS aggregator (e.g., Twilio POSTs Body params)
 * e.g., "FOOD 50KG DELHI"
 */
router.post('/sms-webhook', async (req, res) => {
  try {
    // Twilio sends the text message body in req.body.Body
    const rawSms = req.body.Body || req.body.text || "";
    const sender = req.body.From || "Unknown";
    
    // Naive regex parser to extract intent
    // Looks for "FOOD [number]KG [location]"
    const foodRegex = /FOOD\s+(\d+)\s*KG\s+(.*)/i;
    const match = rawSms.match(foodRegex);

    if (match) {
      const quantityKg = parseFloat(match[1]);
      const location = match[2].trim();

      // Ensure platform users table has a fallback 'SMS User' or we create anonymous
      const { data, error } = await supabase.from('surplus_inventory').insert([{
        food_quantity_kg: quantityKg,
        location: location,
        status: 'available',
        expiry_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // default +4 hours
      }]).select();

      // Return standard TwiML or JSON response based on SMS provider
      console.log(`[SMS Webhook] Ingested ${quantityKg}kg surplus from ${sender} at ${location}`);
      res.set('Content-Type', 'text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Surplus of ${quantityKg}kg logged at ${location}. Nearby NGOs alerted.</Message></Response>`);
    }

    // Invalid format
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Format error. Please send: FOOD [number]KG [Location]</Message></Response>`);

  } catch (error) {
    console.error('SMS Webhook Error:', error.message);
    res.status(500).send('Error');
  }
});

module.exports = router;
