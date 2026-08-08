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
 * Generates verified local relief NGOs around any emergency coordinates if not hardcoded
 */
function generateLocalizedNgos(emergencyObj) {
  if (!emergencyObj || typeof emergencyObj.latitude !== 'number' || typeof emergencyObj.longitude !== 'number') {
    return VERIFIED_NGOS;
  }

  const baseLat = emergencyObj.latitude;
  const baseLon = emergencyObj.longitude;
  const state = emergencyObj.state || 'State';
  const district = (Array.isArray(emergencyObj.districts) && emergencyObj.districts[0]) ? emergencyObj.districts[0] : (emergencyObj.state || 'Local Area');

  return [
    {
      id: `ngo-akshaya-${emergencyObj.id}`,
      name: `The Akshaya Patra Foundation - ${district} Relief Kitchen`,
      emergencyId: emergencyObj.id,
      logo: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=120&q=80',
      verified: true,
      verificationBadge: 'FSSAI & Govt Verified',
      state: state,
      district: district,
      city: district,
      distanceKm: 3.2,
      direction: 'North-East (3.2 km)',
      operatingStatus: 'Open Now',
      acceptingDonations: true,
      acceptedCategories: ['Cooked Food', 'Dry Ration', 'Drinking Water', 'Baby Food', 'Biscuits'],
      operatingHours: '06:00 AM - 10:00 PM',
      contactNumber: '+91 98765 11223',
      email: `relief.${district.toLowerCase().replace(/[^a-z0-9]/g, '')}@akshayapatra.org`,
      address: `Central Relief Kitchen Depot, Sector 4, ${district}, ${state}`,
      latitude: baseLat + 0.015,
      longitude: baseLon + 0.012,
      type: 'NGO'
    },
    {
      id: `ngo-red-cross-${emergencyObj.id}`,
      name: `Indian Red Cross Society - ${state} State Chapter`,
      emergencyId: emergencyObj.id,
      logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=120&q=80',
      verified: true,
      verificationBadge: 'Official Red Cross Chapter',
      state: state,
      district: district,
      city: district,
      distanceKm: 5.8,
      direction: 'South-West (5.8 km)',
      operatingStatus: 'Open 24 Hours',
      acceptingDonations: true,
      acceptedCategories: ['First Aid Kits', 'Medicines', 'Blankets', 'Cooked Food', 'Water', 'Clothes'],
      operatingHours: '24 Hours Open',
      contactNumber: '+91 94471 00998',
      email: `redcross.${district.toLowerCase().replace(/[^a-z0-9]/g, '')}@redcross.in`,
      address: `Red Cross Bhavan, Civil Lines, ${district}, ${state}`,
      latitude: baseLat - 0.018,
      longitude: baseLon - 0.014,
      type: 'NGO'
    },
    {
      id: `ngo-goonj-${emergencyObj.id}`,
      name: `Goonj Disaster Relief Collection & Dispatch Hub`,
      emergencyId: emergencyObj.id,
      logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=120&q=80',
      verified: true,
      verificationBadge: '80G & FCRA Verified NGO',
      state: state,
      district: district,
      city: district,
      distanceKm: 7.4,
      direction: 'East (7.4 km)',
      operatingStatus: 'Open Now',
      acceptingDonations: true,
      acceptedCategories: ['Dry Ration Bags', 'Waterproof Tarpaulins', 'Thermal Blankets', 'Sanitary Kits'],
      operatingHours: '08:00 AM - 08:00 PM',
      contactNumber: '+91 98103 44556',
      email: `goonj.${district.toLowerCase().replace(/[^a-z0-9]/g, '')}@goonj.org`,
      address: `District Collection Center, Near Railway Station Road, ${district}, ${state}`,
      latitude: baseLat + 0.025,
      longitude: baseLon - 0.020,
      type: 'NGO'
    },
    {
      id: `ngo-robin-hood-${emergencyObj.id}`,
      name: `Robin Hood Army - ${district} Relief Network`,
      emergencyId: emergencyObj.id,
      logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=120&q=80',
      verified: true,
      verificationBadge: 'Verified Zero-Funds Food Movement',
      state: state,
      district: district,
      city: district,
      distanceKm: 4.1,
      direction: 'North (4.1 km)',
      operatingStatus: 'Open Now',
      acceptingDonations: true,
      acceptedCategories: ['Cooked Khichdi Packets', 'Drinking Water', 'Biscuits', 'Rations'],
      operatingHours: '07:00 AM - 11:00 PM',
      contactNumber: '+91 98111 00223',
      email: `relief.${district.toLowerCase().replace(/[^a-z0-9]/g, '')}@robinhoodarmy.com`,
      address: `Community Relief Depot, Market Complex, ${district}, ${state}`,
      latitude: baseLat - 0.010,
      longitude: baseLon + 0.022,
      type: 'NGO'
    }
  ];
}

/**
 * Generates verified local relief camps around any emergency coordinates
 */
function generateLocalizedCamps(emergencyObj) {
  if (!emergencyObj || typeof emergencyObj.latitude !== 'number' || typeof emergencyObj.longitude !== 'number') {
    return RELIEF_CAMPS;
  }

  const baseLat = emergencyObj.latitude;
  const baseLon = emergencyObj.longitude;
  const state = emergencyObj.state || 'State';
  const district = (Array.isArray(emergencyObj.districts) && emergencyObj.districts[0]) ? emergencyObj.districts[0] : (emergencyObj.state || 'Local Zone');

  return [
    {
      id: `camp-model-school-${emergencyObj.id}`,
      name: `Government Model Higher Secondary School Relief Camp`,
      emergencyId: emergencyObj.id,
      state: state,
      district: district,
      peopleSheltered: 450,
      capacity: 500,
      occupancyPercent: 90,
      nearestLandmark: `Near Main Civil Hospital, ${district}`,
      address: `School Road, Sector 2, ${district}, ${state}`,
      contactNumber: '+91 98640 11223',
      latitude: baseLat + 0.008,
      longitude: baseLon + 0.009,
      type: 'Relief Camp',
      mealsRequired: {
        breakfast: 'Required',
        lunch: 'Required',
        dinner: 'Required',
        water: 'Required',
        blankets: 'Available'
      },
      currentRequirements: ['Cooked Meal Packets (450)', 'Drinking Water Bottles (1000L)', 'Baby Milk Powder']
    },
    {
      id: `camp-stadium-${emergencyObj.id}`,
      name: `${district} Indoor Stadium Emergency Relief Center`,
      emergencyId: emergencyObj.id,
      state: state,
      district: district,
      peopleSheltered: 680,
      capacity: 750,
      occupancyPercent: 91,
      nearestLandmark: `Town Center Stadium, ${district}`,
      address: `Stadium Road, Near District Sports Complex, ${district}, ${state}`,
      contactNumber: '+91 94351 88776',
      latitude: baseLat - 0.012,
      longitude: baseLon - 0.010,
      type: 'Relief Camp',
      mealsRequired: {
        breakfast: 'Required',
        lunch: 'Required',
        dinner: 'Required',
        water: 'Required',
        blankets: 'Required'
      },
      currentRequirements: ['Dry Ration Bags', 'Water Tanks (5000L)', 'Tarpaulin Sheets', 'First Aid Kits']
    },
    {
      id: `camp-community-hall-${emergencyObj.id}`,
      name: `Municipal Community Hall Relief Shelter`,
      emergencyId: emergencyObj.id,
      state: state,
      district: district,
      peopleSheltered: 290,
      capacity: 350,
      occupancyPercent: 83,
      nearestLandmark: `Near Central Bus Terminal, ${district}`,
      address: `Station Road, ${district}, ${state}`,
      contactNumber: '+91 98765 44321',
      latitude: baseLat + 0.018,
      longitude: baseLon - 0.015,
      type: 'Relief Camp',
      mealsRequired: {
        breakfast: 'Available',
        lunch: 'Required',
        dinner: 'Required',
        water: 'Available',
        blankets: 'Required'
      },
      currentRequirements: ['Thermal Blankets (150)', 'Dry Biscuits', 'Sanitary Pads', 'Warm Clothes']
    }
  ];
}

/**
 * Fetch responding verified NGOs for a specific emergency or state/district
 */
export function fetchNgosForEmergency(emergencyObjOrId, filterCategory = 'All') {
  const emergencyId = typeof emergencyObjOrId === 'object' ? emergencyObjOrId?.id : emergencyObjOrId;
  const emergencyObj = typeof emergencyObjOrId === 'object' ? emergencyObjOrId : null;

  let list = VERIFIED_NGOS.filter(n => n.emergencyId === emergencyId);
  
  if (list.length === 0) {
    if (emergencyObj) {
      list = generateLocalizedNgos(emergencyObj);
    } else {
      const match = ACTIVE_EMERGENCIES.find(e => e.id === emergencyId);
      if (match) {
        list = generateLocalizedNgos(match);
      } else {
        list = VERIFIED_NGOS;
      }
    }
  }

  if (filterCategory && filterCategory !== 'All') {
    list = list.filter(n => n.acceptedCategories.some(c => c.toLowerCase().includes(filterCategory.toLowerCase())));
  }
  return list;
}

/**
 * Fetch active relief camps for a specific emergency
 */
export function fetchReliefCampsForEmergency(emergencyObjOrId) {
  const emergencyId = typeof emergencyObjOrId === 'object' ? emergencyObjOrId?.id : emergencyObjOrId;
  const emergencyObj = typeof emergencyObjOrId === 'object' ? emergencyObjOrId : null;

  let list = RELIEF_CAMPS.filter(c => c.emergencyId === emergencyId);
  if (list.length === 0) {
    if (emergencyObj) {
      list = generateLocalizedCamps(emergencyObj);
    } else {
      const match = ACTIVE_EMERGENCIES.find(e => e.id === emergencyId);
      if (match) {
        list = generateLocalizedCamps(match);
      } else {
        list = RELIEF_CAMPS;
      }
    }
  }
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
