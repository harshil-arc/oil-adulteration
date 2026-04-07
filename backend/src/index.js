require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const os = require('os');

const dataRoutes = require('./routes/dataRoutes');
const historyRoutes = require('./routes/historyRoutes');
const alertRoutes = require('./routes/alertRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const shopRoutes = require('./routes/shopRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for local network access
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('simulate_scan', async (data) => {
    // Simulate a real-time scan progress event
    const steps = [
      { progress: 20, status: 'INITIALIZING SENSORS' },
      { progress: 40, status: 'CALIBRATING IR BEAM' },
      { progress: 60, status: 'SCANNING SPECTRUM' },
      { progress: 80, status: 'ANALYZING DENSITY' },
      { progress: 100, status: 'COMPLETE' },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 800));
      socket.emit('scan_progress', { ...step, ...data });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ── Middleware ────────────────────────────────────────────
// Allow all origins for easier local network usage
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Diagnostics: Get Local IP ─────────────────────────────
app.get('/api/network', (req, res) => {
  const interfaces = os.networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Limit to IPv4 and non-internal
      if (iface.family === 'IPv4' && !iface.internal) {
        results.push({ name, address: iface.address });
      }
    }
  }
  
  res.json({
    localIp: results[0]?.address || '127.0.0.1',
    allInterfaces: results,
    backendUrl: `http://${results[0]?.address || 'localhost'}:4000`,
    esp32Endpoint: `http://${results[0]?.address || 'localhost'}:4000/api/data`
  });
});

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Pure Catalyst Backend',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/data', dataRoutes);
app.use('/api/ingest-reading', dataRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/complaints', complaintRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 4000;
// Listen on 0.0.0.0 to enable local network access
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Pure Catalyst Backend running on all interfaces`);
  console.log(`📡 Local Access: http://localhost:${PORT}`);
  
  // Log the actual local IP for user convenience
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`📡 Network Access: http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log(`\n🗄️  Supabase Connected\n`);
});

module.exports = { app, server };
