const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { predictDemand } = require('../services/predictionService');
const { calculateWaste } = require('../services/wasteService');
const { checkDonationTrigger } = require('../services/donationService');

// POST /api/mess/predict - Get demand prediction
router.post('/predict', async (req, res) => {
  try {
    const inputData = req.body;
    const prediction = predictDemand(inputData);
    res.json({ success: true, prediction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mess/log - Log daily food metrics
router.post('/log', async (req, res) => {
  try {
    const { date, preparedKg, leftoverKg, actualStudentsEaten } = req.body;
    
    // Calculate waste
    const wasteData = calculateWaste(preparedKg, leftoverKg);
    const donationData = checkDonationTrigger(leftoverKg);

    // Normally we would save to Supabase `mess_food_logs` here
    /*
    const { data, error } = await supabase.from('mess_food_logs').insert({
      date,
      food_prepared_kg: preparedKg,
      food_consumed_kg: wasteData.consumedKg,
      food_leftover_kg: leftoverKg,
      waste_percentage: wasteData.wastePercentage,
      status: wasteData.status
    }).select().single();
    */

    // Returning simulated response based on the logic
    res.json({ 
      success: true, 
      wasteData,
      donationAlert: donationData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mess/donations - Get all pending donations
router.get('/donations', async (req, res) => {
  try {
    /*
    const { data, error } = await supabase.from('ngo_donations').select('*').order('created_at', { ascending: false });
    */
    // Simulated data for demo
    res.json({ 
      success: true, 
      donations: [
        { id: 1, date: new Date().toISOString(), quantity_kg: 8.5, status: 'pending', food_type_details: 'Rice, Lentils, Veg' }
      ] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
