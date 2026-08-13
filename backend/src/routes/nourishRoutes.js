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
const INITIAL_DONATIONS = [
  {
    id: "don-101",
    donorName: "Grand Regency Banquet & Hotel",
    venueType: "Wedding Venue",
    contactPerson: "Vikram Sharma",
    contactPhone: "+91 98765 43210",
    email: "events@grandregency.com",
    address: "742 Royal Palms Boulevard, Civil Lines",
    city: "Mumbai",
    pincode: "400001",
    lat: 18.9388,
    lng: 72.8353,
    foodTitle: "Surplus Wedding Reception Dinner Buffet",
    foodCategory: "Cooked Meals",
    detailedFoodItems: "• Paneer Butter Masala (18 kg)\n• Dal Makhani (15 kg)\n• Jeera Basmati Rice (12 kg)\n• Butter Naan & Roti (200 pcs)\n• Gulab Jamun (150 pcs)",
    quantityServings: 180,
    quantityKg: 55,
    numberOfContainers: 6,
    containerType: "Heavy-Duty Sealed Stainless Steel Insulated Containers",
    cookedTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedExpiryHours: 5,
    dietType: "Vegetarian",
    allergens: ["Dairy", "Nuts", "Gluten"],
    packagingType: "Heavy-Duty Sealed Stainless Trays with Foil Covers",
    photoProofUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop",
    specialNotes: "Freshly prepared for evening banquet. Strictly untouched excess from hot serving stations. Immediate pickup recommended.",
    status: "Pending Request",
    submittedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: "don-102",
    donorName: "The Spice Route Fine Dining",
    venueType: "Restaurant",
    contactPerson: "Chef Anita Roy",
    contactPhone: "+91 98123 76543",
    email: "kitchen@spiceroute.in",
    address: "28 Connaught Place, Block C",
    city: "New Delhi",
    pincode: "110001",
    lat: 28.6315,
    lng: 77.2167,
    foodTitle: "Excess Biryani & Curry Servings",
    foodCategory: "Cooked Meals",
    detailedFoodItems: "• Hyderabadi Dum Biryani (12 kg)\n• Chicken Tikka Gravy (5 kg)\n• Mirchi Ka Salan (3 kg)\n• Raita & Salad Packs (60 packs)",
    quantityServings: 60,
    quantityKg: 20,
    numberOfContainers: 4,
    containerType: "Food-Grade Heat-Sealed Containers",
    cookedTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    estimatedExpiryHours: 6,
    dietType: "Non-Vegetarian",
    allergens: ["Nuts", "Dairy"],
    packagingType: "Individual Food-Grade Plastic Containers with Thermal Lids",
    photoProofUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop",
    specialNotes: "Prepared during lunch service peak. Cleanly packed in tamper-evident containers ready for distribution.",
    status: "Pending Request",
    submittedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: "don-103",
    donorName: "Crown Bakery & Patisserie",
    venueType: "Bakery & Cafe",
    contactPerson: "Siddharth Patel",
    contactPhone: "+91 99000 11223",
    email: "info@crownbakery.com",
    address: "15 Indiranagar 100ft Road",
    city: "Bengaluru",
    pincode: "560038",
    lat: 12.9784,
    lng: 77.6408,
    foodTitle: "Fresh Whole Wheat Bread, Buns & Muffins",
    foodCategory: "Bakery & Sweets",
    detailedFoodItems: "• Artisanal Sourdough Loaves (20 loaves)\n• Whole Wheat Burger Buns (40 pcs)\n• Blueberry Muffins (30 pcs)",
    quantityServings: 90,
    quantityKg: 15,
    numberOfContainers: 3,
    containerType: "Sealed Bakery Craft Paper Boxes",
    cookedTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    estimatedExpiryHours: 36,
    dietType: "Vegetarian",
    allergens: ["Gluten", "Dairy"],
    packagingType: "Clear Food Paper Bags & Cardboard Bakery Boxes",
    photoProofUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    specialNotes: "End-of-day surplus artisanal loaves and muffins. Perfect condition, baked fresh this morning.",
    status: "Pending Request",
    submittedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: "don-104",
    donorName: "Metropolis Corporate Center Canteen",
    venueType: "Corporate Canteen",
    contactPerson: "Meera Deshmukh",
    contactPhone: "+91 97654 32109",
    email: "canteen@metropolis.co.in",
    address: "Tech Park Zone 4, HITEC City",
    city: "Hyderabad",
    pincode: "500081",
    lat: 17.4435,
    lng: 78.3772,
    foodTitle: "Steam Cooked South Indian Lunch Buffet",
    foodCategory: "Cooked Meals",
    detailedFoodItems: "• Steamed Soft Idlis (150 pcs)\n• Vegetable Sambar (15 Liters)\n• Lemon Rice (10 kg)\n• Coconut Chutney (5 Liters)",
    quantityServings: 120,
    quantityKg: 35,
    numberOfContainers: 5,
    containerType: "Stainless Steel Thermal Insulated Cans",
    cookedTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    estimatedExpiryHours: 4,
    dietType: "Vegan",
    allergens: ["Mustard", "Sesame"],
    packagingType: "Stainless Steel Insulated Food Drums",
    photoProofUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=800&auto=format&fit=crop",
    specialNotes: "Freshly cooked Idlis, Sambar, Vegetable Kurma and Lemon Rice from corporate cafeteria.",
    status: "Confirmed",
    statusReason: "Verified by Admin. Food safety certified and photo proof checked.",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    donationId: "don-104",
    donorName: "Metropolis Corporate Center Canteen",
    title: "Order Confirmed! 🎉",
    message: 'Your surplus food listing "Steam Cooked South Indian Lunch Buffet" has been verified and CONFIRMED by Admin. Pickup team dispatches in 20 mins.',
    type: "CONFIRMED",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false
  }
];

// Seed function to pre-populate database
const checkAndSeedNourishDb = async () => {
  try {
    const { data: donations } = await supabase.from('nourish_donations').select('*');
    if (!donations || donations.length === 0) {
      console.log('[Nourish Database] Seeding initial donations...');
      for (const d of INITIAL_DONATIONS) {
        await supabase.from('nourish_donations').insert(d);
      }
      
      const { data: notifications } = await supabase.from('nourish_notifications').select('*');
      if (!notifications || notifications.length === 0) {
        console.log('[Nourish Database] Seeding initial notifications...');
        for (const n of INITIAL_NOTIFICATIONS) {
          await supabase.from('nourish_notifications').insert(n);
        }
      }
    }
  } catch (err) {
    console.warn('[Nourish Database] Seeding failed/skipped:', err.message);
  }
};

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
