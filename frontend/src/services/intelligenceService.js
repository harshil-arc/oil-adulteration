// ─── FOOD 360 INTELLIGENCE & DEMO SERVICE ──────────────────────────────

const SETTINGS_KEY = 'spectratrust_verification_settings';
const DEMO_HOTSPOTS_KEY = 'spectratrust_demo_hotspots';
const RECENT_SCANS_KEY = 'spectratrust_recent_scans';
const VENDOR_DB_KEY = 'spectratrust_vendors';
const NATIONAL_STATS_KEY = 'spectratrust_national_stats';

// Default verification settings
export function getVerificationSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return {
    mode: 'dev', // 'dev' | 'prod'
    threshold: 1, // Dev default = 1, Prod default = 5
    demoModeActive: true,
  };
}

export function saveVerificationSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Get National Aggregated Stats
export function getNationalStats() {
  try {
    const stored = localStorage.getItem(NATIONAL_STATS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return {
    totalScansToday: 1428,
    totalSafeScans: 1314,
    totalSuspiciousScans: 114,
    districtPurityAvg: 93.4,
    oilWiseStats: [
      { oil: 'Mustard Oil', purity: 95.2, scans: 512 },
      { oil: 'Groundnut Oil', purity: 94.1, scans: 380 },
      { oil: 'Sunflower Oil', purity: 92.8, scans: 290 },
      { oil: 'Palm Oil', purity: 81.5, scans: 246 },
    ],
  };
}

// Process new scan result & apply 3-stage verification pipeline
export function processScanResult(scanRecord) {
  const settings = getVerificationSettings();
  const isSuspicious = scanRecord.purity < 80 || scanRecord.adulteration_percentage > 20;

  // 1. Save to local scan timeline history
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_SCANS_KEY) || '[]');
    const updatedScans = [scanRecord, ...existing.slice(0, 49)];
    localStorage.setItem(RECENT_SCANS_KEY, JSON.stringify(updatedScans));
  } catch (_) {}

  // 2. Update Personal Dashboard Stats
  try {
    const personal = JSON.parse(localStorage.getItem('spectratrust_personal_stats') || '{}');
    const samplesTested = (personal.samplesTested || 0) + 1;
    const unsafeFound = isSuspicious ? (personal.unsafeFound || 0) + 1 : (personal.unsafeFound || 0);
    const avgPurity = Math.round((((personal.avgPurity || 92) * (samplesTested - 1)) + scanRecord.purity) / samplesTested);
    
    localStorage.setItem('spectratrust_personal_stats', JSON.stringify({
      ...personal,
      samplesTested,
      unsafeFound,
      avgPurity,
      complaintStatus: isSuspicious ? 'Report Draft Ready' : 'Verified Safe',
      lastUpdated: new Date().toISOString(),
    }));
  } catch (_) {}

  // 3. Update National Aggregated Stats
  try {
    const national = getNationalStats();
    national.totalScansToday += 1;
    if (isSuspicious) {
      national.totalSuspiciousScans += 1;
    } else {
      national.totalSafeScans += 1;
    }
    localStorage.setItem(NATIONAL_STATS_KEY, JSON.stringify(national));
  } catch (_) {}

  // 4. Update Vendor Intelligence (if vendor specified)
  if (scanRecord.vendor && scanRecord.vendor !== 'Field Test') {
    updateVendorIntelligence(scanRecord.vendor, scanRecord.purity, isSuspicious);
  }

  // 5. Apply 3-Stage Heatmap Pipeline
  const hotspotResult = processHeatmapPipeline(scanRecord, settings, isSuspicious);

  return {
    isSuspicious,
    hotspotResult,
    settings,
  };
}

// 3-Stage Heatmap Pipeline
function processHeatmapPipeline(scanRecord, settings, isSuspicious) {
  if (!isSuspicious) {
    return { stage: 1, public: false, message: 'Scan recorded as Safe.' };
  }

  const existingHotspots = getHotspots();
  const shopName = scanRecord.shop_name || scanRecord.vendor || 'Unknown Vendor / Market';
  const city = scanRecord.city || 'Local District';

  // Find matching existing hotspot report
  let match = existingHotspots.find(h => h.shopName?.toLowerCase() === shopName.toLowerCase());

  if (match) {
    match.reportsCount += 1;
    match.lastReportTime = new Date().toISOString();
    match.purityAvg = Math.round((match.purityAvg + scanRecord.purity) / 2);
  } else {
    match = {
      id: `HOTSPOT-${Date.now()}`,
      shopName,
      city,
      district: scanRecord.district || 'District Center',
      oilType: scanRecord.oil_type || 'Edible Oil',
      reportsCount: 1,
      purityAvg: scanRecord.purity,
      lastReportTime: new Date().toISOString(),
      verified: false,
      isDemo: settings.mode === 'dev',
    };
    existingHotspots.push(match);
  }

  // Check threshold condition
  const requiredThreshold = settings.mode === 'dev' ? 1 : settings.threshold;

  if (match.reportsCount >= requiredThreshold) {
    match.verified = true;
    match.verificationLevel = settings.mode === 'dev' ? 'Development Verified (Demo)' : 'Community Verified';
    saveHotspots(existingHotspots);
    return {
      stage: 3,
      public: true,
      hotspot: match,
      message: settings.mode === 'dev' 
        ? 'Hotspot Published immediately (Development Mode: Threshold = 1).' 
        : `Hotspot Published! Reached threshold of ${requiredThreshold} independent reports.`,
    };
  } else {
    match.verified = false;
    match.verificationLevel = `Stage 2: Pending (${match.reportsCount}/${requiredThreshold} Reports)`;
    saveHotspots(existingHotspots);
    return {
      stage: 2,
      public: false,
      hotspot: match,
      message: `Report stored privately. Needed ${requiredThreshold - match.reportsCount} more independent report(s) before public heatmap publication.`,
    };
  }
}

export function getHotspots() {
  try {
    const stored = localStorage.getItem(DEMO_HOTSPOTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return [];
}

function saveHotspots(hotspots) {
  localStorage.setItem(DEMO_HOTSPOTS_KEY, JSON.stringify(hotspots));
}

// Update Vendor Intelligence Profile
function updateVendorIntelligence(vendorName, purity, isSuspicious) {
  try {
    const vendors = JSON.parse(localStorage.getItem(VENDOR_DB_KEY) || '[]');
    let vendor = vendors.find(v => v.name.toLowerCase() === vendorName.toLowerCase());

    if (!vendor) {
      vendor = {
        id: `VEN-${Date.now()}`,
        name: vendorName,
        totalScans: 0,
        avgPurity: 95,
        safetyScore: 92,
        trustScore: 'High',
        flaggedForMonitoring: false,
      };
      vendors.push(vendor);
    }

    vendor.totalScans += 1;
    vendor.avgPurity = Math.round(((vendor.avgPurity * (vendor.totalScans - 1)) + purity) / vendor.totalScans);

    if (isSuspicious) {
      vendor.safetyScore = Math.max(40, vendor.safetyScore - 12);
      if (vendor.safetyScore < 70) {
        vendor.trustScore = 'Under Monitoring';
        vendor.flaggedForMonitoring = true;
      }
    } else {
      vendor.safetyScore = Math.min(99, vendor.safetyScore + 2);
    }

    localStorage.setItem(VENDOR_DB_KEY, JSON.stringify(vendors));
  } catch (_) {}
}

// Generate Demo Reports (10, 50, or 100)
export function generateDemoReports(count = 50) {
  const cities = [
    { city: 'Mumbai', district: 'Mumbai Suburban', lat: 19.0760, lng: 72.8777 },
    { city: 'Delhi', district: 'Central Delhi', lat: 28.6139, lng: 77.2090 },
    { city: 'Bengaluru', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
    { city: 'Ahmedabad', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { city: 'Jaipur', district: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { city: 'Kolkata', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { city: 'Lucknow', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { city: 'Chennai', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  ];

  const oils = ['Mustard Oil', 'Groundnut Oil', 'Sunflower Oil', 'Palm Oil', 'Sesame Oil'];
  const vendors = ['Kisan Grocery Store', 'Shree Ram Oil Mill', 'Gupta General Store', 'SuperBazar Mart', 'City Spices & Oils'];

  const demoHotspots = [];

  for (let i = 0; i < Math.min(count, 100); i++) {
    const loc = cities[i % cities.length];
    const oil = oils[i % oils.length];
    const vendor = vendors[i % vendors.length];
    const isSuspicious = i % 3 === 0;
    const purity = isSuspicious ? Math.floor(Math.random() * 25) + 55 : Math.floor(Math.random() * 10) + 90;

    demoHotspots.push({
      id: `DEMO-HOTSPOT-${i + 1}`,
      shopName: `${vendor} (${loc.city})`,
      city: loc.city,
      district: loc.district,
      lat: loc.lat + (Math.random() - 0.5) * 0.05,
      lng: loc.lng + (Math.random() - 0.5) * 0.05,
      oilType: oil,
      purityAvg: purity,
      reportsCount: isSuspicious ? Math.floor(Math.random() * 4) + 1 : 0,
      verified: isSuspicious,
      verificationLevel: isSuspicious ? 'Demo Verified [SIMULATED DATA]' : 'Verified Safe',
      lastReportTime: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
      isDemo: true,
    });
  }

  localStorage.setItem(DEMO_HOTSPOTS_KEY, JSON.stringify(demoHotspots));
  return demoHotspots;
}

// Reset Demo Data
export function resetDemoData() {
  localStorage.removeItem(DEMO_HOTSPOTS_KEY);
  localStorage.removeItem(NATIONAL_STATS_KEY);
  return true;
}
