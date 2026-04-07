const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/history – Fetch past analysis results with filters
router.get('/', async (req, res) => {
  try {
    const { oil_type, date_from, date_to, limit = 50, offset = 0, quality } = req.query;

    let query = supabase
      .from('analysis_results')
      .select(`
        id, device_id, oil_type, purity, adulteration, quality, qualityLabel,
        likely_adulterants, contaminants, health_advisory, timestamp, created_at
      `)
      .order('timestamp', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (oil_type && oil_type !== 'all') query = query.eq('oil_type', oil_type);
    if (quality) query = query.eq('quality', quality);
    if (date_from) query = query.gte('timestamp', date_from);
    if (date_to) query = query.lte('timestamp', date_to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count });
  } catch (err) {
    console.error('[GET /api/history] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/:id – Get individual reading detail
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
