/**
 * gdacsModel.js
 * Model for GDACS (Global Disaster Alert and Coordination System) Alerts
 * Normalizes raw GDACS XML/RSS data into a clean, structured JSON object.
 */

// Category Mapping helper
function classifyDisasterType(eventtype, title = '', description = '') {
  const typeCode = (eventtype || '').toUpperCase();
  const text = `${title} ${description}`.toLowerCase();

  if (typeCode === 'FL' || text.includes('flood') || text.includes('inundation')) {
    return { type: 'Flood', icon: 'flood' };
  }
  if (typeCode === 'EQ' || text.includes('earthquake') || text.includes('quake') || text.includes('seismic')) {
    return { type: 'Earthquake', icon: 'earthquake' };
  }
  if (typeCode === 'TC' || text.includes('cyclone') || text.includes('typhoon') || text.includes('hurricane')) {
    return { type: 'Cyclone', icon: 'cyclone' };
  }
  if (typeCode === 'VO' || text.includes('volcano') || text.includes('volcanic') || text.includes('eruption')) {
    return { type: 'Volcano', icon: 'volcano' };
  }
  if (typeCode === 'TS' || text.includes('tsunami') || text.includes('tidal wave')) {
    return { type: 'Tsunami', icon: 'tsunami' };
  }
  if (typeCode === 'WF' || text.includes('wildfire') || text.includes('forest fire') || text.includes('bushfire')) {
    return { type: 'Wildfire', icon: 'wildfire' };
  }
  if (typeCode === 'ST' || text.includes('storm') || text.includes('gale') || text.includes('tornado')) {
    return { type: 'Storm', icon: 'storm' };
  }
  if (typeCode === 'DR' || text.includes('drought') || text.includes('dry spell')) {
    return { type: 'Drought', icon: 'drought' };
  }
  if (typeCode === 'LS' || text.includes('landslide') || text.includes('mudslide') || text.includes('avalanche')) {
    return { type: 'Landslide', icon: 'landslide' };
  }

  return { type: 'Other', icon: 'alert-triangle' };
}

// Severity Normalization helper
function normalizeSeverity(alertlevel, score = 0, title = '') {
  if (!alertlevel) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('red') || score >= 2) return 'Red';
    if (lowerTitle.includes('orange') || score >= 1) return 'Orange';
    return 'Green';
  }

  const level = alertlevel.trim().toLowerCase();
  if (level.includes('red') || level.includes('high')) return 'Red';
  if (level.includes('orange') || level.includes('medium')) return 'Orange';
  return 'Green';
}

// Clean HTML tags from text
function stripHtml(htmlStr = '') {
  return htmlStr.replace(/<[^>]*>?/gm, '').trim();
}

// Extract country/location if missing
function parseLocationInfo(rawCountry, rawTitle = '') {
  let country = rawCountry || '';
  let location = rawCountry || '';

  if (!country && rawTitle) {
    const match = rawTitle.match(/in\s+([A-Za-z\s]+?)(?:\s+\d+|\s+on|\s*\(|\.|\,|$)/i);
    if (match && match[1]) {
      country = match[1].trim();
      location = country;
    }
  }

  if (!country) country = 'Global / International Waters';
  if (!location) location = country;

  return { country, location };
}

/**
 * Transforms a raw parsed XML item into a normalized GDACS Disaster object
 */
function createGdacsAlert(rawItem) {
  const title = rawItem.title || 'Live Disaster Alert';
  const description = stripHtml(rawItem.description || '');
  const eventtype = rawItem.eventtype || rawItem['gdacs:eventtype'] || '';
  const alertlevel = rawItem.alertlevel || rawItem['gdacs:alertlevel'] || '';
  const alertscore = parseFloat(rawItem.alertscore || rawItem['gdacs:alertscore'] || 0);

  const { type: disasterType, icon } = classifyDisasterType(eventtype, title, description);
  const severity = normalizeSeverity(alertlevel, alertscore, title);
  
  const rawCountry = rawItem.country || rawItem['gdacs:country'] || '';
  const { country, location } = parseLocationInfo(rawCountry, title);

  // Parse Coordinates
  let lat = parseFloat(rawItem.lat || rawItem['geo:lat'] || 0);
  let long = parseFloat(rawItem.long || rawItem['geo:long'] || 0);

  if ((!lat && !long) && (rawItem['georss:point'] || rawItem.point)) {
    const ptStr = rawItem['georss:point'] || rawItem.point || '';
    const parts = ptStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]);
      long = parseFloat(parts[1]);
    }
  }

  const id = rawItem.guid || rawItem['gdacs:eventid'] || `GDACS-${Math.abs(lat).toFixed(2)}-${Math.abs(long).toFixed(2)}-${Date.now()}`;
  const date = rawItem.pubDate || rawItem['gdacs:fromdate'] || rawItem['gdacs:dateadded'] || new Date().toUTCString();
  const link = rawItem.link || `https://www.gdacs.org/report.aspx?eventtype=${eventtype}&eventid=${rawItem['gdacs:eventid'] || ''}`;

  return {
    id,
    title,
    disasterType,
    severity,
    country,
    location,
    latitude: isNaN(lat) ? 0 : lat,
    longitude: isNaN(long) ? 0 : long,
    date,
    description,
    link,
    icon
  };
}

module.exports = {
  createGdacsAlert,
  classifyDisasterType,
  normalizeSeverity
};
