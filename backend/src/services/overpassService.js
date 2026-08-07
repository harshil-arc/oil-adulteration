/**
 * overpassService.js
 * OpenStreetMap Overpass API Service with 10-minute caching & fallback mirrors.
 */

const https = require('https');
const { normalizeOverpassElement } = require('../models/overpassModel');

// Overpass API Endpoints (Mirrors for redundancy)
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// In-Memory Cache
const cacheStore = new Map();

/**
 * Builds efficient Overpass QL query for radius (in meters) around (lat, lon)
 */
function buildOverpassQuery(lat, lon, radius = 10000) {
  const r = Math.min(Math.max(radius, 1000), 50000); // 1km to 50km boundary check
  return `[out:json][timeout:15];
(
  node(around:${r},${lat},${lon})["amenity"~"hospital|clinic|police|fire_station|shelter|social_facility|community_centre"];
  way(around:${r},${lat},${lon})["amenity"~"hospital|clinic|police|fire_station|shelter|social_facility|community_centre"];
  node(around:${r},${lat},${lon})["emergency"="ambulance_station"];
  way(around:${r},${lat},${lon})["emergency"="ambulance_station"];
  node(around:${r},${lat},${lon})["office"="ngo"];
  way(around:${r},${lat},${lon})["office"="ngo"];
  node(around:${r},${lat},${lon})["social_facility"~"food_bank|shelter"];
  way(around:${r},${lat},${lon})["social_facility"~"food_bank|shelter"];
);
out center body;`;
}

/**
 * Execute Overpass POST Request against primary & backup servers
 */
function fetchFromOverpassServer(query, serverIndex = 0) {
  if (serverIndex >= OVERPASS_SERVERS.length) {
    return Promise.reject(new Error('All Overpass API servers exhausted or unavailable'));
  }

  const serverUrl = OVERPASS_SERVERS[serverIndex];
  const postData = `data=${encodeURIComponent(query)}`;

  return new Promise((resolve, reject) => {
    const urlObj = new URL(serverUrl);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'SpectraTrust-EmergencySystem/2.0'
      },
      timeout: 10000 // 10s timeout
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        req.destroy();
        console.warn(`[Overpass Service] Server ${serverUrl} returned HTTP ${res.statusCode}, trying next mirror...`);
        return fetchFromOverpassServer(query, serverIndex + 1).then(resolve).catch(reject);
      }

      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          fetchFromOverpassServer(query, serverIndex + 1).then(resolve).catch(reject);
        }
      });
    });

    req.on('error', (err) => {
      console.warn(`[Overpass Service] Network error on ${serverUrl}: ${err.message}`);
      fetchFromOverpassServer(query, serverIndex + 1).then(resolve).catch(reject);
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn(`[Overpass Service] Timeout on ${serverUrl}`);
      fetchFromOverpassServer(query, serverIndex + 1).then(resolve).catch(reject);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Simulated Fallback Resources in case Overpass servers are offline
 */
function getFallbackNearbyResources(userLat, userLon) {
  const sampleData = [
    { id: 101, type: 'node', lat: userLat + 0.012, lon: userLon + 0.015, tags: { name: 'District Civil Emergency Hospital', amenity: 'hospital', phone: '+91 361 252 0011', website: 'https://health.gov.in', 'addr:street': 'Hospital Road', 'addr:city': 'District HQ' } },
    { id: 102, type: 'node', lat: userLat - 0.008, lon: userLon + 0.009, tags: { name: 'Red Cross Emergency Food Bank', social_facility: 'food_bank', phone: '+91 98640 99887', 'addr:street': 'Relief Avenue' } },
    { id: 103, type: 'node', lat: userLat + 0.005, lon: userLon - 0.011, tags: { name: 'Central Police Station', amenity: 'police', phone: '112', 'addr:street': 'Station Road' } },
    { id: 104, type: 'node', lat: userLat - 0.014, lon: userLon - 0.018, tags: { name: 'Municipal Fire Brigade Headquarters', amenity: 'fire_station', phone: '101', 'addr:street': 'Fire Depot Lane' } },
    { id: 105, type: 'node', lat: userLat + 0.022, lon: userLon + 0.025, tags: { name: 'Community Disaster Relief Shelter', amenity: 'shelter', 'addr:street': 'Model High School Ground' } },
    { id: 106, type: 'node', lat: userLat - 0.020, lon: userLon + 0.004, tags: { name: 'National 108 Emergency Ambulance Station', emergency: 'ambulance_station', phone: '108' } },
    { id: 107, type: 'node', lat: userLat + 0.018, lon: userLon - 0.007, tags: { name: 'Helping Hands NGO Humanitarian Center', office: 'ngo', phone: '+91 94350 12345', 'addr:street': 'NGO Complex' } },
    { id: 108, type: 'node', lat: userLat - 0.003, lon: userLon - 0.022, tags: { name: 'City Medical Trauma Clinic', amenity: 'clinic', phone: '+91 361 245 8899' } }
  ];

  return sampleData.map(item => normalizeOverpassElement(item, userLat, userLon));
}

/**
 * Main Service Method: Query Overpass API for nearby emergency resources
 */
async function getNearbyEmergencyResources(userLat = 26.1445, userLon = 91.7362, radius = 10000, forceRefresh = false) {
  const roundedLat = parseFloat(userLat).toFixed(3);
  const roundedLon = parseFloat(userLon).toFixed(3);
  const cacheKey = `${roundedLat}_${roundedLon}_${radius}`;
  const now = Date.now();

  // Return cached result if valid
  if (!forceRefresh && cacheStore.has(cacheKey)) {
    const cached = cacheStore.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[Overpass Service] Serving ${cached.resources.length} cached resources for key: ${cacheKey}`);
      return {
        success: true,
        source: 'cache',
        timestamp: new Date(cached.timestamp).toISOString(),
        radius,
        userLat,
        userLon,
        resources: cached.resources,
        counts: cached.counts
      };
    }
  }

  try {
    console.log(`[Overpass Service] Executing live Overpass QL query around (${userLat}, ${userLon}) with radius ${radius}m...`);
    const query = buildOverpassQuery(userLat, userLon, radius);
    const rawResult = await fetchFromOverpassServer(query);

    if (rawResult && Array.isArray(rawResult.elements)) {
      // Filter out duplicate or node geometry sub-elements lacking relevant tags
      const validElements = rawResult.elements.filter(el => el.tags && (el.lat || el.center));
      const resources = validElements.map(el => normalizeOverpassElement(el, userLat, userLon));

      // Calculate category counts
      const counts = {
        NGO: 0,
        Hospital: 0,
        Clinic: 0,
        Shelter: 0,
        Police: 0,
        Fire: 0,
        Ambulance: 0,
        FoodBank: 0
      };

      resources.forEach(r => {
        if (counts[r.category] !== undefined) counts[r.category]++;
      });

      // Sort by distance (nearest first)
      resources.sort((a, b) => a.distanceKm - b.distanceKm);

      cacheStore.set(cacheKey, {
        timestamp: now,
        resources,
        counts
      });

      return {
        success: true,
        source: 'live_overpass',
        timestamp: new Date(now).toISOString(),
        radius,
        userLat,
        userLon,
        resources,
        counts
      };
    } else {
      throw new Error('Overpass returned 0 elements');
    }
  } catch (err) {
    console.warn(`[Overpass Service] Live query failed (${err.message}). Using fallback local simulation...`);
    const fallbackResources = getFallbackNearbyResources(userLat, userLon);

    const counts = {
      NGO: 0, Hospital: 0, Clinic: 0, Shelter: 0, Police: 0, Fire: 0, Ambulance: 0, FoodBank: 0
    };
    fallbackResources.forEach(r => { if (counts[r.category] !== undefined) counts[r.category]++; });

    return {
      success: true,
      source: 'fallback_dataset',
      timestamp: new Date().toISOString(),
      warning: 'Overpass API unreachable; returned fallback emergency resources.',
      radius,
      userLat,
      userLon,
      resources: fallbackResources,
      counts
    };
  }
}

module.exports = {
  getNearbyEmergencyResources,
  buildOverpassQuery,
  CACHE_TTL_MS
};
