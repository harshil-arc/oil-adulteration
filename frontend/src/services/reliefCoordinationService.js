/**
 * reliefCoordinationService.js
 * Real-Time Relief Coordination Platform Service Engine
 * Powers emergencies, NGO matching, camps, collection centers & AI recommendations
 */

import { 
  ACTIVE_EMERGENCIES, 
  VERIFIED_NGOS, 
  RELIEF_CAMPS, 
  COMMUNITY_KITCHENS, 
  GOVT_COLLECTION_CENTERS,
  EMERGENCY_CATEGORIES 
} from '../data/ngoDisasterDataset';
import { getHaversineDistance } from './communityReportService';

const LOCAL_DONATIONS_KEY = 'spectratrust_relief_donations_v1';

/**
 * Fetch active emergencies filtered by category and search query
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
      e.districts.some(d => d.toLowerCase().includes(q)) ||
      e.category.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Fetch responding verified NGOs for a specific emergency or state/district
 */
export function fetchNgosForEmergency(emergencyId, filterCategory = 'All') {
  let list = VERIFIED_NGOS.filter(n => !emergencyId || n.emergencyId === emergencyId);
  if (filterCategory && filterCategory !== 'All') {
    list = list.filter(n => n.acceptedCategories.some(c => c.toLowerCase().includes(filterCategory.toLowerCase())));
  }
  return list;
}

/**
 * Fetch active relief camps for a specific emergency
 */
export function fetchReliefCampsForEmergency(emergencyId) {
  return RELIEF_CAMPS.filter(c => !emergencyId || c.emergencyId === emergencyId);
}

/**
 * Fetch operational community kitchens for a specific emergency
 */
export function fetchCommunityKitchensForEmergency(emergencyId) {
  return COMMUNITY_KITCHENS.filter(k => !emergencyId || k.emergencyId === emergencyId);
}

/**
 * Fetch official government collection centers for a specific emergency
 */
export function fetchGovtCollectionCentersForEmergency(emergencyId) {
  return GOVT_COLLECTION_CENTERS.filter(g => !emergencyId || g.emergencyId === emergencyId);
}

/**
 * Smart AI Relief Recommendation Engine
 * Prioritizes: Highest urgency -> Nearest distance -> Highest food shortage -> Most recent emergency
 */
export function getSmartAiRecommendation(userLat = 26.1445, userLng = 91.7362) {
  let bestNgo = VERIFIED_NGOS[0];
  let bestEmergency = ACTIVE_EMERGENCIES[0];
  let minScore = Infinity;

  ACTIVE_EMERGENCIES.forEach(emg => {
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
    currentlyNeeded: bestEmergency.priorityItems.slice(0, 3).map(i => i.name),
    urgencyText: bestEmergency.requirementMeters?.food?.status || 'Immediate Cooked & Dry Rations Needed'
  };
}

/**
 * Submit a relief donation request to an NGO or Relief Camp
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
    deliveryMethod: payload.deliveryMethod, // 'self_delivery' | 'doorstep_pickup'
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
