/**
 * overpassRoutes.js
 * Express routes for OpenStreetMap Overpass Emergency API
 */

const express = require('express');
const router = express.Router();
const { getNearbyEmergencyResources } = require('../services/overpassService');

/**
 * GET /api/overpass/nearby
 * Query Params:
 *  - lat: float (Latitude, default 26.1445)
 *  - lon: float (Longitude, default 91.7362)
 *  - radius: number (meters, default 10000)
 *  - refresh: boolean (force bypass cache)
 */
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 26.1445;
    const lon = parseFloat(req.query.lon) || 91.7362;
    const radius = parseInt(req.query.radius, 10) || 10000;
    const forceRefresh = req.query.refresh === 'true';

    const result = await getNearbyEmergencyResources(lat, lon, radius, forceRefresh);
    res.json(result);
  } catch (err) {
    console.error('[Overpass Route Error]', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby emergency resources',
      resources: [],
      counts: {}
    });
  }
});

module.exports = router;
