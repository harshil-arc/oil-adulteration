/**
 * overpassModel.js
 * Model and transformer for OpenStreetMap Overpass API emergency resource elements.
 */

// Category colors and config
const OVERPASS_CATEGORIES = {
  NGO: {
    label: 'NGO & Relief',
    color: '#22c55e', // Green 🟢
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: 'Building2',
    symbol: '🏢'
  },
  Hospital: {
    label: 'Hospital',
    color: '#ef4444', // Red 🔴
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    icon: 'Activity',
    symbol: '🏥'
  },
  Clinic: {
    label: 'Clinic & First Aid',
    color: '#f43f5e', // Rose
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    icon: 'Stethoscope',
    symbol: '⚕️'
  },
  Shelter: {
    label: 'Emergency Shelter',
    color: '#f97316', // Orange 🟠
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: 'Tent',
    symbol: '⛺'
  },
  Police: {
    label: 'Police Station',
    color: '#3b82f6', // Blue 🔵
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: 'Shield',
    symbol: '👮'
  },
  Fire: {
    label: 'Fire Station',
    color: '#a855f7', // Purple 🟣
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    icon: 'Flame',
    symbol: '🚒'
  },
  Ambulance: {
    label: 'Ambulance Station',
    color: '#eab308', // Yellow 🟡
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    icon: 'Truck',
    symbol: '🚑'
  },
  FoodBank: {
    label: 'Food Bank',
    color: '#10b981', // Emerald 🍲
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: 'Utensils',
    symbol: '🍲'
  }
};

// Haversine Distance Calculator (Returns distance in kilometers)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(2));
}

// Classify OSM Tags into standard Category
function classifyOsmCategory(tags = {}) {
  const amenity = (tags.amenity || '').toLowerCase();
  const office = (tags.office || '').toLowerCase();
  const social = (tags.social_facility || '').toLowerCase();
  const emergency = (tags.emergency || '').toLowerCase();

  if (social === 'food_bank' || tags.food === 'yes') {
    return 'FoodBank';
  }
  if (amenity === 'hospital') {
    return 'Hospital';
  }
  if (amenity === 'clinic' || amenity === 'doctors') {
    return 'Clinic';
  }
  if (emergency === 'ambulance_station' || amenity === 'ambulance_station') {
    return 'Ambulance';
  }
  if (amenity === 'fire_station') {
    return 'Fire';
  }
  if (amenity === 'police') {
    return 'Police';
  }
  if (amenity === 'shelter' || social === 'shelter' || tags.building === 'shelter') {
    return 'Shelter';
  }
  if (office === 'ngo' || office === 'foundation' || social === 'group_home' || amenity === 'social_facility' || amenity === 'community_centre') {
    return 'NGO';
  }

  return 'NGO';
}

// Extract human-readable Address from OSM tags
function formatOsmAddress(tags = {}, lat, lon) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb'] || tags['addr:neighbourhood']) parts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
  if (tags['addr:city'] || tags['addr:town'] || tags['addr:district']) parts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:district']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

  if (parts.length > 0) return parts.join(', ');
  if (tags['addr:full']) return tags['addr:full'];

  return `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// Generate fallback location name if name tag is missing
function generateDefaultName(category, tags = {}, id) {
  const config = OVERPASS_CATEGORIES[category] || OVERPASS_CATEGORIES.NGO;
  const place = tags['addr:suburb'] || tags['addr:city'] || tags['addr:street'] || 'Local Zone';
  return `${place} ${config.label} #${id}`;
}

/**
 * Normalizes raw Overpass element into structured Emergency Resource object
 */
function normalizeOverpassElement(element, userLat, userLon) {
  const tags = element.tags || {};
  
  // Extract coordinates (node has lat/lon directly; way/relation has center.lat/center.lon)
  const lat = element.lat || (element.center && element.center.lat) || 0;
  const lon = element.lon || (element.center && element.center.lon) || 0;

  const categoryKey = classifyOsmCategory(tags);
  const name = tags.name || tags['name:en'] || generateDefaultName(categoryKey, tags, element.id);
  const address = formatOsmAddress(tags, lat, lon);
  const distanceKm = calculateHaversineDistance(userLat, userLon, lat, lon);
  const phone = tags.phone || tags['contact:phone'] || tags.mobile || null;
  const website = tags.website || tags['contact:website'] || tags.url || null;
  const openingHours = tags.opening_hours || null;
  const osmId = `osm-${element.type}-${element.id}`;

  return {
    id: osmId,
    name,
    category: categoryKey,
    categoryLabel: OVERPASS_CATEGORIES[categoryKey]?.label || categoryKey,
    categoryConfig: OVERPASS_CATEGORIES[categoryKey] || OVERPASS_CATEGORIES.NGO,
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

module.exports = {
  OVERPASS_CATEGORIES,
  calculateHaversineDistance,
  classifyOsmCategory,
  formatOsmAddress,
  normalizeOverpassElement
};
