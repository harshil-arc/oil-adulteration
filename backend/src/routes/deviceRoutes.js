const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { validateUserSession } = require('../middleware/auth');

// GET /api/devices – list all devices
router.get('/', validateUserSession, async (req, res) => {
  try {
    const { data, error } = await supabase.from('devices').select('*').order('last_seen', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/devices/:device_id/status
router.patch('/:device_id/status', validateUserSession, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('devices')
      .update({ status, last_seen: new Date().toISOString() })
      .eq('device_id', req.params.device_id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
