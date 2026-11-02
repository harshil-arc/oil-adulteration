const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { validateAdminSession, validateUserSession } = require('../middleware/auth');

// In-memory clients list for Server-Sent Events (SSE)
let sseClients = [];

// Helper to broadcast EventSource messages to all connected clients
const broadcastSSE = (type, payload) => {
  const message = `data: ${JSON.stringify({ type, payload })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(message);
    } catch (err) {
      console.error('Error writing to SSE client:', err);
    }
  });
};

// Initial mock data to seed Firestore if empty
const INITIAL_DONATIONS = [];

const INITIAL_NOTIFICATIONS = [];

// Seed function to pre-populate database (disabled to keep active listings clean)
const checkAndSeedNourishDb = async () => {};

// Run seeding asynchronously
checkAndSeedNourishDb();

// 1. GET /donations - Fetch all donations
router.get('/donations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nourish_donations')
      .select('*')
      .order('submittedAt', { ascending: false });
      
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching donations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /donations - Submit a new food donation
router.post('/donations', async (req, res) => {
  try {
    const record = {
      ...req.body,
      status: req.body.status || 'Pending Request',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data, error } = await supabase.from('nourish_donations').insert(record);
    if (error) throw error;

    const insertedRecord = Array.isArray(data) ? data[0] : data;
    
    // Broadcast creation to SSE clients
    broadcastSSE('DONATION_CREATED', { donation: insertedRecord, notification: null });
    
    res.status(201).json({ success: true, donation: insertedRecord });
  } catch (err) {
    console.error('Error creating donation:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. PATCH /donations/:id/status - Update donation status (Admin-only validation)
router.patch('/donations/:id/status', validateAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusReason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Retrieve original donation record
    const { data: donation, error: findError } = await supabase
      .from('nourish_donations')
      .eq('id', id)
      .single();
      
    if (findError || !donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Update status in Firestore
    const { data: updatedData, error: updateError } = await supabase
      .from('nourish_donations')
      .eq('id', id)
      .update({
        status,
        statusReason: statusReason || null,
        updatedAt: new Date().toISOString()
      });
      
    if (updateError) throw updateError;
    
    const updatedRecord = Array.isArray(updatedData) ? updatedData[0] : updatedData;

    // Create a user notification matching this update
    const notifRecord = {
      donationId: id,
      donorName: donation.donorName || 'NourishRelief System',
      title: status === 'Confirmed' ? 'Order Confirmed! 🎉' : 'Order Rejected ❌',
      message: status === 'Confirmed'
        ? `Your surplus food listing "${donation.foodTitle}" has been verified and CONFIRMED by Admin. Pickup team dispatches in 20 mins.`
        : `Your surplus food listing "${donation.foodTitle}" was rejected. Reason: ${statusReason || 'Did not meet safety checklist.'}`,
      type: status === 'Confirmed' ? 'CONFIRMED' : 'REJECTED',
      timestamp: new Date().toISOString(),
      read: false
    };

    const { data: notifData } = await supabase.from('nourish_notifications').insert(notifRecord);
    const insertedNotification = Array.isArray(notifData) ? notifData[0] : notifData;

    // Broadcast status change to SSE clients
    broadcastSSE('STATUS_UPDATED', { donation: updatedRecord, notification: insertedNotification });

    res.json({ success: true, donation: updatedRecord, notification: insertedNotification });
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /notifications - Retrieve notifications
router.get('/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nourish_notifications')
      .select('*')
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /notifications/mark-read - Mark all as read
router.post('/notifications/mark-read', async (req, res) => {
  try {
    // Read all unread, and update them to read: true
    const { data: unread } = await supabase
      .from('nourish_notifications')
      .eq('read', false);
      
    if (unread && unread.length > 0) {
      for (const item of unread) {
        await supabase
          .from('nourish_notifications')
          .eq('id', item.id)
          .update({ read: true });
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notifications as read:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /events - Server-Sent Events (SSE) registration route
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const clientObj = { id: clientId, res };
  sseClients.push(clientObj);
  console.log(`[SSE Client Connected] ID: ${clientId}. Total active clients: ${sseClients.length}`);

  // Keep-alive heartbeat every 20 seconds
  const intervalId = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(intervalId);
    sseClients = sseClients.filter(c => c.id !== clientId);
    console.log(`[SSE Client Disconnected] ID: ${clientId}. Total active clients: ${sseClients.length}`);
  });
});

module.exports = router;
