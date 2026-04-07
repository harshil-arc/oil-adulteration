const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/alerts – Fetch alerts
router.get('/', async (req, res) => {
  try {
    const { acknowledged, limit = 20 } = req.query;

    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (acknowledged !== undefined) query = query.eq('acknowledged', acknowledged === 'true');

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/alerts/:id/acknowledge
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
