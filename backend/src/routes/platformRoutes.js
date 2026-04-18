const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { predictEventDemand } = require('../services/eventPredictionService');
const { triggerDisasterMode, getDisasterStatus, resolveDisaster } = require('../services/disasterService');
const { selectOptimalNGO } = require('../services/redistributionService');

// 1. Event Prediction Route
router.post('/predict', async (req, res) => {
  try {
    const predictionResult = predictEventDemand(req.body);
    
    // Log to DB
    if (req.body.event_id) {
       await supabase.from('predictions').insert([{
         event_id: req.body.event_id,
         predicted_food_kg: predictionResult.predicted_food_kg,
         waste_risk_score: predictionResult.waste_risk_score,
         confidence: predictionResult.confidence,
         ai_recommendation: predictionResult.ai_recommendation
       }]);
    }
    
    res.json({ success: true, data: predictionResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Disaster Activation Route
router.post('/disaster/trigger', (req, res) => {
  const { zone, severity } = req.body;
  const status = triggerDisasterMode(zone, severity);
  res.json({ success: true, status });
});

router.get('/disaster/status', (req, res) => {
  res.json({ success: true, status: getDisasterStatus() });
});

router.post('/disaster/resolve', (req, res) => {
  res.json({ success: true, status: resolveDisaster() });
});

module.exports = router;
