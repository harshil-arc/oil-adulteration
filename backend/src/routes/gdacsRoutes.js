/**
 * gdacsRoutes.js
 * Express Routes for GDACS Disaster & Emergency Live Feed
 */

const express = require('express');
const router = express.Router();
const { getGdacsAlerts } = require('../services/gdacsService');

/**
 * GET /api/gdacs
 * GET /api/gdacs/alerts
 * Query Params:
 *  - refresh: boolean (force bypass cache)
 *  - type: string (filter by disasterType)
 *  - severity: string (Green, Orange, Red)
 *  - country: string (filter by country)
 */
router.get(['/', '/alerts'], async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
    const result = await getGdacsAlerts(forceRefresh);

    let filtered = [...result.alerts];

    if (req.query.type && req.query.type !== 'All') {
      const targetType = req.query.type.toLowerCase();
      filtered = filtered.filter(a => a.disasterType.toLowerCase() === targetType);
    }

    if (req.query.severity && req.query.severity !== 'All') {
      const targetSev = req.query.severity.toLowerCase();
      filtered = filtered.filter(a => a.severity.toLowerCase() === targetSev);
    }

    if (req.query.country) {
      const qCountry = req.query.country.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.country.toLowerCase().includes(qCountry) ||
        a.location.toLowerCase().includes(qCountry)
      );
    }

    res.json({
      success: true,
      source: result.source,
      timestamp: result.timestamp,
      cachedUntil: result.cachedUntil,
      count: filtered.length,
      alerts: filtered
    });
  } catch (err) {
    console.error('[GDACS Route Error]', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GDACS live alerts',
      alerts: []
    });
  }
});

module.exports = router;
