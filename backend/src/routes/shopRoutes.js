const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/shops – Fetch all shops and their statuses
router.get('/', async (req, res) => {
  try {
    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({ success: true, data: shops });
  } catch (err) {
    console.error('[GET /api/shops] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
