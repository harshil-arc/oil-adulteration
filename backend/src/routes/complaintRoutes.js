const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/complaints – Submit a new complaint
router.post('/', async (req, res) => {
  try {
    const { shop_id, description, lat, lng, contact_info, image_url } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        shop_id,
        description,
        status: 'pending',
        image_url,
        lat,
        lng,
        contact_info
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    console.error('[POST /api/complaints] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET /api/complaints – List complaints
router.get('/', async (req, res) => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select(`
        *,
        shops (name, oil_type)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error('[GET /api/complaints] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// PATCH /api/complaints/:id/verify – Verify a complaint and mark shop as adulturated
router.patch('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Update complaint status
    const { data: complaint, error: compError } = await supabase
      .from('complaints')
      .update({ status: 'verified' })
      .eq('id', id)
      .select()
      .single();

    if (compError) throw compError;

    // 2. If it's tied to a shop, drastically lower its purity and set status to adulterated
    if (complaint.shop_id) {
      const { error: shopError } = await supabase
        .from('shops')
        .update({
          status: 'adulterated',
          last_purity: 10, // Simulated horrific drop in purity on complaint
          updated_at: new Date().toISOString()
        })
        .eq('id', complaint.shop_id);

      if (shopError) throw shopError;
    }

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error('[PATCH /api/complaints/verify] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// PATCH /api/complaints/:id/reject – Reject a complaint
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: complaint, error } = await supabase
      .from('complaints')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error('[PATCH /api/complaints/reject] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


module.exports = router;
