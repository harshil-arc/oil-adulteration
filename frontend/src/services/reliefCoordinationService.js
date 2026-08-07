/**
 * reliefCoordinationService.js
 * Real-Time Relief Coordination Platform Service Engine
 * Powers live GDACS disaster integration, active emergencies across India & globally, NGO matching & AI recommendations
 */

import { 
  ACTIVE_EMERGENCIES, 
  VERIFIED_NGOS, 
  RELIEF_CAMPS, 
  COMMUNITY_KITCHENS, 
  GOVT_COLLECTION_CENTERS 
} from '../data/ngoDisasterDataset';
import { getHaversineDistance } from './communityReportService';
import { fetchGdacsAlerts } from './gdacsService';

const LOCAL_DONATIONS_KEY = 'spectratrust_relief_donations_v1';

/**
 * Transforms a raw GDACS Alert item into a full Active Emergency object
 */
function convertGdacsAlertToEmergency(gdacsAlert) {
  const isIndia = (gdacsAlert.country || '').toLowerCase().includes('india') || 
                  (gdacsAlert.title || '').toLowerCase().includes('india');

  return {
    id: gdacsAlert.id || `gdacs-${Math.random().toString(36).substr(2, 9)}`,
    title: gdacsAlert.title,
    category: gdacsAlert.disasterType || 'Flood',
    state: gdacsAlert.country || 'Global',
    districts: [gdacsAlert.location || gdacsAlert.country || 'Region'],
    status: gdacsAlert.severity === 'Red' ? 'Critical' : gdacsAlert.severity === 'Orange' ? 'High Alert' : 'Active Warning',
    severity: gdacsAlert.severity === 'Red' ? 'Critical' : gdacsAlert.severity === 'Orange' ? 'High' : 'Moderate',
    updatedAt: gdacsAlert.date || new Date().toISOString(),
    affectedPopulation: gdacsAlert.severity === 'Red' ? 150000 : gdacsAlert.severity === 'Orange' ? 65000 : 25000,
    activeCampsCount: gdacsAlert.severity === 'Red' ? 24 : gdacsAlert.severity === 'Orange' ? 12 : 6,
    respondingNgosCount: gdacsAlert.severity === 'Red' ? 15 : gdacsAlert.severity === 'Orange' ? 8 : 4,
    foodRequirement: gdacsAlert.severity === 'Red' ? 'Very High' : 'Moderate',
    latitude: gdacsAlert.latitude || 20.5937,
    longitude: gdacsAlert.longitude || 78.9629,
    weather: `GDACS Real-Time Live Feed (${gdacsAlert.disasterType})`,
    governmentAdvisory: `Official GDACS ${gdacsAlert.severity} Alert. ${gdacsAlert.description}`,
    startDate: gdacsAlert.date ? new Date(gdacsAlert.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    situationSummary: gdacsAlert.description || 'Live disaster warning broadcasted via Global Disaster Alert and Coordination System.',
    isLiveGdacs: true,
    isIndia: isIndia,
    link: gdacsAlert.link,
    requirementMeters: {
      food: { percent: gdacsAlert.severity === 'Red' ? 85 : 60, urgency: gdacsAlert.severity === 'Red' ? 'Critical' : 'High', status: 'Rations & Prepared Food Packets Needed' },
      water: { percent: gdacsAlert.severity === 'Red' ? 90 : 55, urgency: gdacsAlert.severity === 'Red' ? 'Critical' : 'Medium', status: 'Clean Drinking Water Supplies Required' },
      medicines: { percent: 70, urgency: 'High', status: 'First Aid & Trauma Relief Supplies' },
      blankets: { percent: 65, urgency: 'Medium', status: 'Shelter Bedding & Tarpaulins' },
      sanitation: { percent: 60, urgency: 'Medium', status: 'Hygiene & Hygiene Supplies' }
    },
    priorityItems: [
      { name: 'Cooked Food Packets', category: 'Cooked Food', priority: 'Critical', unit: 'packets' },
      { name: 'Packaged Drinking Water (1L)', category: 'Drinking Water', priority: 'Critical', unit: 'bottles' },
      { name: 'First Aid & Emergency Kits', category: 'Medicines', priority: 'High', unit: 'kits' },
      { name: 'Waterproof Tarpaulins', category: 'Blankets', priority: 'High', unit: 'units' }
    ],
    timeline: [
      { stage: 'GDACS Live Broadcast', time: gdacsAlert.date || 'Just now', desc: 'Real-time alert published on GDACS RSS feed.' },
      { stage: 'Local Response Activated', time: 'Active', desc: 'Disaster management authorities & relief NGOs notified.' }
    ]
  };
}

/**
 * Synchronous fetch active emergencies (merges static dataset)
 */
export function fetchActiveEmergencies(category = 'All', searchQuery = '') {
  let list = [...ACTIVE_EMERGENCIES];

  if (category && category !== 'All') {
    list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.state.toLowerCase().includes(q) ||
      (Array.isArray(e.districts) && e.districts.some(d => d.toLowerCase().includes(q))) ||
      e.category.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Async fetch active emergencies integrating live GDACS RSS feed + Indian Disaster Database
 */
export async function fetchLiveMergedActiveEmergencies(category = 'All', searchQuery = '') {
  let liveList = [];

  try {
    const gdacsResult = await fetchGdacsAlerts(false);
    if (gdacsResult.success && Array.isArray(gdacsResult.alerts)) {
      liveList = gdacsResult.alerts.map(convertGdacsAlertToEmergency);
    }
  } catch (err) {
    console.warn('[ReliefService] Live GDACS fetch warning:', err);
  }

  // Combine static Indian emergencies with live GDACS feed items (avoid duplicates by title)
  const combinedMap = new Map();

  // Add static Indian dataset first
  ACTIVE_EMERGENCIES.forEach(item => combinedMap.set(item.id, item));

  // Add live GDACS feed items
  liveList.forEach(item => {
    if (!combinedMap.has(item.id)) {
      combinedMap.set(item.id, item);
    }
  });

  let list = Array.from(combinedMap.values());

  // Category filtering
  if (category && category !== 'All') {
    list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  // Search filtering
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.state.toLowerCase().includes(q) ||
      (Array.isArray(e.districts) && e.districts.some(d => d.toLowerCase().includes(q))) ||
      e.category.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Fetch responding verified NGOs for a specific emergency or state/district
 */
export function fetchNgosForEmergency(emergencyId, filterCategory = 'All') {
  let list = VERIFIED_NGOS.filter(n => !emergencyId || n.emergencyId === emergencyId || emergencyId.startsWith('gdacs-'));
  if (list.length === 0) {
    // If dynamic GDACS alert, return all verified NGOs
    list = VERIFIED_NGOS;
  }
  if (filterCategory && filterCategory !== 'All') {
    list = list.filter(n => n.acceptedCategories.some(c => c.toLowerCase().includes(filterCategory.toLowerCase())));
  }
  return list;
}

/**
 * Fetch active relief camps for a specific emergency
 */
export function fetchReliefCampsForEmergency(emergencyId) {
  let list = RELIEF_CAMPS.filter(c => !emergencyId || c.emergencyId === emergencyId);
  if (list.length === 0) list = RELIEF_CAMPS;
  return list;
}

/**
 * Fetch operational community kitchens for a specific emergency
 */
export function fetchCommunityKitchensForEmergency(emergencyId) {
  let list = COMMUNITY_KITCHENS.filter(k => !emergencyId || k.emergencyId === emergencyId);
  if (list.length === 0) list = COMMUNITY_KITCHENS;
  return list;
}

/**
 * Fetch official government collection centers for a specific emergency
 */
export function fetchGovtCollectionCentersForEmergency(emergencyId) {
  let list = GOVT_COLLECTION_CENTERS.filter(g => !emergencyId || g.emergencyId === emergencyId);
  if (list.length === 0) list = GOVT_COLLECTION_CENTERS;
  return list;
}

/**
 * Smart AI Relief Recommendation Engine
 */
export function getSmartAiRecommendation(userLat = 26.1445, userLng = 91.7362, emergencies = ACTIVE_EMERGENCIES) {
  const targetList = emergencies.length > 0 ? emergencies : ACTIVE_EMERGENCIES;
  let bestNgo = VERIFIED_NGOS[0];
  let bestEmergency = targetList[0];
  let minScore = Infinity;

  targetList.forEach(emg => {
    const dist = getHaversineDistance(userLat, userLng, emg.latitude, emg.longitude);
    const ngos = VERIFIED_NGOS.filter(n => n.emergencyId === emg.id);
    const urgencyMult = emg.severity === 'Critical' ? 0.5 : emg.severity === 'High' ? 0.75 : 1.0;
    const foodShortageMult = emg.requirementMeters?.food?.percent ? (100 - emg.requirementMeters.food.percent) / 100 : 0.5;

    const rankScore = dist * urgencyMult * (1 + foodShortageMult);

    if (rankScore < minScore) {
      minScore = rankScore;
      bestEmergency = emg;
      if (ngos.length > 0) bestNgo = ngos[0];
    }
  });

  const distKm = getHaversineDistance(userLat, userLng, bestEmergency.latitude, bestEmergency.longitude);
  const travelMins = Math.round(distKm * 1.2 + 10);

  return {
    emergency: bestEmergency,
    ngo: bestNgo,
    distanceKm: parseFloat(distKm.toFixed(1)),
    travelMinutes: travelMins,
    currentlyNeeded: (bestEmergency.priorityItems || []).slice(0, 3).map(i => i.name),
    urgencyText: bestEmergency.requirementMeters?.food?.status || 'Immediate Cooked & Dry Rations Needed'
  };
}

/**
 * Submit a relief donation request
 */
export async function dispatchReliefDonation(payload) {
  const record = {
    donationId: `DON-${Math.floor(100000 + Math.random() * 900000)}`,
    emergencyId: payload.emergencyId,
    targetName: payload.targetName,
    targetType: payload.targetType || 'NGO',
    itemCategory: payload.itemCategory,
    quantity: payload.quantity,
    unit: payload.unit || 'units',
    deliveryMethod: payload.deliveryMethod,
    pickupAddress: payload.pickupAddress || '',
    dateSlot: payload.dateSlot,
    timeSlot: payload.timeSlot,
    donorName: payload.donorName || 'Generous Donor',
    donorPhone: payload.donorPhone || '',
    status: 'Confirmed & Dispatched',
    createdAt: new Date().toISOString()
  };

  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_DONATIONS_KEY) || '[]');
    local.unshift(record);
    localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(local.slice(0, 50)));
  } catch (e) {
    console.warn('[ReliefService] Local storage save error:', e);
  }

  return { success: true, donation: record };
}
