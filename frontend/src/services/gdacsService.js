/**
 * frontend/src/services/gdacsService.js
 * Frontend Service for GDACS Live Disaster Alerts & AI Summary Engine
 */

import { normalizeFrontendAlert } from '../models/gdacsModel';
import { ACTIVE_EMERGENCIES } from '../data/ngoDisasterDataset';

const BACKEND_GDACS_URL = '/api/gdacs';
const FRONTEND_CACHE_KEY = 'gdacs_live_alerts_v2';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Converts static Indian Active Emergency entries to GDACS Alert structure
 */
function convertIndianEmergencyToGdacsAlert(emg) {
  return normalizeFrontendAlert({
    id: emg.id,
    title: emg.title,
    disasterType: emg.category || 'Flood',
    severity: emg.severity === 'Critical' ? 'Red' : emg.severity === 'High' ? 'Orange' : 'Green',
    country: 'India',
    location: `${emg.state} (${Array.isArray(emg.districts) ? emg.districts.slice(0, 2).join(', ') : emg.districts || ''})`,
    latitude: emg.latitude,
    longitude: emg.longitude,
    date: emg.updatedAt || new Date().toISOString(),
    description: emg.situationSummary || emg.governmentAdvisory || 'Active emergency monitored by State Disaster Management Authority.',
    link: 'https://www.gdacs.org',
    icon: (emg.category || '').toLowerCase()
  });
}

/**
 * Merges raw live GDACS alerts with Indian regional active emergencies
 */
function mergeGdacsAndIndianAlerts(gdacsAlerts = []) {
  const mergedMap = new Map();

  // 1. Add Indian active emergencies
  ACTIVE_EMERGENCIES.forEach(emg => {
    const alertObj = convertIndianEmergencyToGdacsAlert(emg);
    mergedMap.set(alertObj.id, alertObj);
  });

  // 2. Add GDACS live alerts
  gdacsAlerts.forEach(rawAlert => {
    const alertObj = normalizeFrontendAlert(rawAlert);
    if (!mergedMap.has(alertObj.id)) {
      mergedMap.set(alertObj.id, alertObj);
    }
  });

  return Array.from(mergedMap.values());
}

/**
 * Calculate dynamic statistics from active GDACS alerts list
 */
export function calculateGdacsStats(alerts = []) {
  const stats = {
    total: alerts.length,
    floods: 0,
    earthquakes: 0,
    cyclones: 0,
    wildfires: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0
  };

  alerts.forEach(alert => {
    const type = (alert.disasterType || '').toLowerCase();
    if (type === 'flood') stats.floods++;
    else if (type === 'earthquake') stats.earthquakes++;
    else if (type === 'cyclone' || type === 'storm') stats.cyclones++;
    else if (type === 'wildfire') stats.wildfires++;

    if (alert.severity === 'Red') stats.highSeverity++;
    else if (alert.severity === 'Orange') stats.mediumSeverity++;
    else stats.lowSeverity++;
  });

  return stats;
}

/**
 * Dynamically Generate AI Summary based on real-time GDACS data
 */
export function generateGdacsAiSummary(alerts = []) {
  if (!alerts || alerts.length === 0) {
    return {
      summaryText: "Current Situation • No active global disaster warnings detected.",
      highestRiskRegion: "None",
      recommendedAction: "Maintain standard emergency preparedness.",
      breakdown: []
    };
  }

  const stats = calculateGdacsStats(alerts);

  const breakdownParts = [];
  if (stats.floods > 0) breakdownParts.push(`${stats.floods} Flood alert${stats.floods > 1 ? 's' : ''}`);
  if (stats.earthquakes > 0) breakdownParts.push(`${stats.earthquakes} Earthquake${stats.earthquakes > 1 ? 's' : ''}`);
  if (stats.cyclones > 0) breakdownParts.push(`${stats.cyclones} Cyclone${stats.cyclones > 1 ? 's' : ''}`);
  if (stats.wildfires > 0) breakdownParts.push(`${stats.wildfires} Wildfire${stats.wildfires > 1 ? 's' : ''}`);

  if (breakdownParts.length === 0) {
    breakdownParts.push(`${stats.total} Active alert${stats.total > 1 ? 's' : ''}`);
  }

  const countryCounts = {};
  alerts.forEach(alert => {
    const country = alert.country || 'Global';
    if (!countryCounts[country]) {
      countryCounts[country] = { count: 0, weight: 0 };
    }
    countryCounts[country].count++;
    countryCounts[country].weight += alert.severity === 'Red' ? 5 : alert.severity === 'Orange' ? 2 : 1;
  });

  let highestRiskRegion = 'India & South Asia Risk Zone';
  let maxWeight = -1;
  Object.keys(countryCounts).forEach(c => {
    if (countryCounts[c].weight > maxWeight) {
      maxWeight = countryCounts[c].weight;
      highestRiskRegion = c;
    }
  });

  let recommendedAction = "Monitor official emergency advisories before travelling.";
  if (stats.highSeverity > 0) {
    recommendedAction = `Immediate caution advised in high-risk zones. Check official GDACS & local NDMA disaster management bulletins.`;
  } else if (stats.mediumSeverity > 0) {
    recommendedAction = `Stay informed on weather & seismic updates. Prepare emergency kits in affected regions.`;
  }

  const summaryText = `Current Situation • ${breakdownParts.join(' • ')} Highest Risk Region: ${highestRiskRegion} Recommended Action: ${recommendedAction}`;

  return {
    summaryText,
    highestRiskRegion,
    recommendedAction,
    breakdown: breakdownParts
  };
}

/**
 * Fetch GDACS Alerts with 10-Minute Caching & Graceful Fallback
 */
export async function fetchGdacsAlerts(forceRefresh = false) {
  // Check Local Cache first if forceRefresh is false
  if (!forceRefresh) {
    try {
      const cachedStr = localStorage.getItem(FRONTEND_CACHE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const age = Date.now() - (cached.timestamp || 0);
        if (age < CACHE_TTL_MS && Array.isArray(cached.alerts) && cached.alerts.length > 0) {
          console.log('[Frontend GDACS] Using cached alerts (Age:', Math.round(age / 1000), 's, Count:', cached.alerts.length, ')');
          return {
            success: true,
            alerts: cached.alerts.map(normalizeFrontendAlert),
            source: 'cache',
            timestamp: cached.timestamp
          };
        }
      }
    } catch (e) {
      console.warn('[Frontend GDACS] Cache read warning:', e);
    }
  }

  // Try Fetching from Backend API
  try {
    const res = await fetch(`${BACKEND_GDACS_URL}?refresh=${forceRefresh ? 'true' : 'false'}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        const merged = mergeGdacsAndIndianAlerts(data.alerts);
        try {
          localStorage.setItem(FRONTEND_CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            alerts: merged
          }));
        } catch (e) { /* ignore quota error */ }

        return {
          success: true,
          alerts: merged,
          source: data.source || 'backend_api',
          timestamp: Date.now()
        };
      }
    }
  } catch (err) {
    console.warn('[Frontend GDACS] Backend API unreachable, falling back to direct GDACS or local dataset:', err.message);
  }

  // Fallback merged dataset
  const fallbackAlerts = mergeGdacsAndIndianAlerts([]);

  return {
    success: true,
    alerts: fallbackAlerts,
    source: 'fallback_live_dataset',
    timestamp: Date.now()
  };
}
