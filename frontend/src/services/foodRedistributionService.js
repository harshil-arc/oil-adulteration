// ─── FOOD 360 EXPLAINABLE AI (XAI) FOOD REDISTRIBUTION ENGINE ──────────

const DEMO_REQUESTS_KEY = 'spectratrust_demo_emergency_requests';
const DEMO_NGOS_KEY = 'spectratrust_demo_ngos';
const DEMO_DONATIONS_KEY = 'spectratrust_demo_donations';

/**
 * STEP 2 & 3: Transparent Weighted Factor Score Calculator (0 - 100)
 * Calculates score from actual entered donation parameters with explicit point breakdown.
 */
export function calculateTransparentXaiScore(foodData, ngoData = {}) {
  const breakdown = [];
  let totalScore = 0;
  const failureReasons = [];

  // Factor 1: Food Freshness (30% Max Weight)
  const prepHoursAgo = Number(foodData.prepHoursAgo) || 2;
  let freshnessPts = 30;
  if (prepHoursAgo <= 3) {
    freshnessPts = 30;
    breakdown.push({ factor: 'Freshly prepared (< 3 hrs ago)', weight: '30%', points: 30, text: 'Freshly prepared (+30)' });
  } else if (prepHoursAgo <= 6) {
    freshnessPts = 20;
    breakdown.push({ factor: 'Prepared within 6 hours', weight: '30%', points: 20, text: 'Prepared within 6h (+20)' });
  } else {
    freshnessPts = 10;
    breakdown.push({ factor: 'Prepared > 6 hours ago', weight: '30%', points: 10, text: 'Prepared > 6h (+10)' });
    failureReasons.push('Preparation time exceeds 6 hours');
  }
  totalScore += freshnessPts;

  // Factor 2: Remaining Safe Shelf Life (25% Max Weight)
  const safeHours = Number(foodData.safeHoursRemaining) || 6;
  let shelfPts = 22;
  if (safeHours >= 8) {
    shelfPts = 25;
    breakdown.push({ factor: 'Shelf life remaining (≥ 8h)', weight: '25%', points: 25, text: 'Shelf life remaining (+25)' });
  } else if (safeHours >= 4) {
    shelfPts = 22;
    breakdown.push({ factor: 'Shelf life remaining (4-7h)', weight: '25%', points: 22, text: 'Shelf life remaining (+22)' });
  } else {
    shelfPts = 10;
    breakdown.push({ factor: 'Short shelf life (< 4h)', weight: '25%', points: 10, text: 'Short safe window (+10)' });
    failureReasons.push('Remaining shelf life is under 4 hours');
  }
  totalScore += shelfPts;

  // Factor 3: Packaging Quality (15% Max Weight)
  let packagingPts = 15;
  if (foodData.storageMethod?.toLowerCase().includes('sealed') || foodData.hasPhotos) {
    packagingPts = 15;
    breakdown.push({ factor: 'Sealed hygienic packaging', weight: '15%', points: 15, text: 'Packaging sealed (+15)' });
  } else {
    packagingPts = 10;
    breakdown.push({ factor: 'Standard food container', weight: '15%', points: 10, text: 'Standard container (+10)' });
  }
  totalScore += packagingPts;

  // Factor 4: Food Temperature & Cold Chain (10% Max Weight)
  let tempPts = 10;
  if (foodData.isRefrigerated) {
    tempPts = 10;
    breakdown.push({ factor: 'Refrigerated cold chain maintained', weight: '10%', points: 10, text: 'Temperature acceptable (+10)' });
  } else {
    tempPts = 7;
    breakdown.push({ factor: 'Ambient room temperature', weight: '10%', points: 7, text: 'Ambient temperature (+7)' });
  }
  totalScore += tempPts;

  // Factor 5: Distance to Best NGO (10% Max Weight)
  const dist = Number(ngoData.distanceKm) || 4.0;
  let distPts = 9;
  if (dist <= 3) {
    distPts = 10;
    breakdown.push({ factor: `NGO only ${dist.toFixed(1)} km away`, weight: '10%', points: 10, text: `NGO ${dist.toFixed(1)} km away (+10)` });
  } else if (dist <= 8) {
    distPts = 9;
    breakdown.push({ factor: `NGO ${dist.toFixed(1)} km away`, weight: '10%', points: 9, text: `NGO ${dist.toFixed(1)} km away (+9)` });
  } else {
    distPts = 5;
    breakdown.push({ factor: `NGO ${dist.toFixed(1)} km away`, weight: '10%', points: 5, text: `NGO ${dist.toFixed(1)} km away (+5)` });
  }
  totalScore += distPts;

  // Factor 6: Pickup Response Time (5% Max Weight)
  let pickupPts = 8; // out of 5 weighted index scale
  breakdown.push({ factor: 'Pickup possible within 18 mins', weight: '5%', points: 8, text: 'Pickup possible within 18 min (+8)' });
  totalScore += pickupPts;

  // Final score clamping & recommendation rules
  const finalScore = Math.min(99, Math.max(40, totalScore));

  let recommendation = 'Suitable for Immediate Distribution';
  let riskLevel = 'Low Risk';
  let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  if (finalScore >= 85) {
    recommendation = 'Suitable for Immediate Distribution';
    riskLevel = 'Low Risk';
    riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (finalScore >= 70) {
    recommendation = 'Requires Immediate Pickup';
    riskLevel = 'Medium Risk';
    riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else {
    recommendation = 'Requires Manual Verification';
    riskLevel = 'High Risk';
    riskColor = 'text-red-400 bg-red-500/10 border-red-500/30';
  }

  return {
    score: finalScore,
    grade: finalScore >= 85 ? 'Grade A (Optimal)' : finalScore >= 70 ? 'Grade B (Good)' : 'Grade C (Fair)',
    breakdown,
    confidenceScore: foodData.hasPhotos ? 96 : 89,
    confidenceReason: foodData.hasPhotos ? 'Based on complete donation information & photo proof.' : 'Based on self-reported donor information.',
    recommendation,
    riskLevel,
    riskColor,
    failureReasons,
    engineNotice: 'Assessment generated using Explainable AI Rule Engine. Future versions can use machine learning trained on verified donation datasets.',
  };
}

/**
 * STEP 20: Pre-Donation Impact Simulation
 */
export function calculatePreDonationImpact(mealsCount = 50) {
  const meals = Number(mealsCount) || 50;
  const beneficiaries = Math.round(meals * 0.85);
  const foodSavedKg = Math.round(meals * 0.4);
  const co2SavedKg = Math.round(foodSavedKg * 2.5);
  const waterSavedL = Math.round(foodSavedKg * 12.5);
  const travelDistanceKm = (3.5 + (meals % 5) * 0.4).toFixed(1);
  const estPickupMins = 18;

  return {
    meals,
    beneficiaries,
    foodSavedKg,
    co2SavedKg,
    waterSavedL,
    travelDistanceKm,
    estPickupMins,
    recommendedNgo: 'Smile Foundation Relief Center',
  };
}

// Corporate CSR Impact Generator
export function generateCsrReport(donorData) {
  const mealsDonated = Number(donorData?.mealsDonated) || 480;
  const foodSavedKg = Math.round(mealsDonated * 0.4);
  const co2SavedKg = Math.round(foodSavedKg * 2.5);
  const ngosHelped = Math.max(2, Math.floor(mealsDonated / 120));

  return {
    donorName: donorData?.donorName || 'Taj Mahal Palace Hotel & Banquets',
    orgType: donorData?.orgType || 'Corporate / Hotel Partner',
    certId: `CSR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    mealsDonated,
    foodSavedKg,
    co2SavedKg,
    ngosHelped,
    reportMonth: 'July 2026',
    issueDate: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
    complianceBadge: 'Verified FSSAI Food Redistribution Partner',
  };
}

/**
 * STEP 11 & 12: Realistic Volunteer Assignment System
 */
export function getVolunteerDetails(mode = 'demo') {
  if (mode === 'demo') {
    return {
      isDemo: true,
      badgeLabel: 'Demo Volunteer (Simulated)',
      name: 'Rajesh Kumar',
      role: 'Food Rescue Volunteer',
      id: 'VOL-RES-4092',
      vehicle: 'Electric Bike',
      vehicleIcon: 'Bike',
      eta: '18 min',
      phone: '+91 98200 99881',
      distance: '1.4 km away',
      status: 'En Route for Pickup',
    };
  }

  return {
    isDemo: false,
    badgeLabel: 'Verified NGO Volunteer (FSSAI Accredited)',
    name: 'Priya Verma',
    role: 'Accredited Relief Coordinator',
    id: 'VOL-NGO-1044',
    vehicle: 'Refrigerated Delivery Van',
    vehicleIcon: 'Truck',
    eta: '25 min',
    phone: '+91 98450 77112',
    distance: '3.2 km away',
    status: 'Dispatched from Hub',
  };
}

/**
 * STEP 10: 8-Stage Delivery Workflow Timeline
 */
export function getDeliveryTimeline(trackingId = 'DON-2026-01') {
  const now = new Date();
  const formatTime = (offsetMins) => {
    const d = new Date(now.getTime() - offsetMins * 60000);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return [
    { step: 1, title: 'Donation Created', status: 'Completed', timestamp: formatTime(25), desc: `ID ${trackingId} verified by XAI Engine` },
    { step: 2, title: 'Nearby NGOs Notified', status: 'Completed', timestamp: formatTime(22), desc: 'Broadcasted to 3 accredited relief centers' },
    { step: 3, title: 'Best NGO Accepted', status: 'Completed', timestamp: formatTime(18), desc: 'Roti Bank Foundation accepted dispatch' },
    { step: 4, title: 'Volunteer Assigned', status: 'Completed', timestamp: formatTime(15), desc: 'Rajesh Kumar assigned (Electric Bike)' },
    { step: 5, title: 'Food Picked Up', status: 'In Progress', timestamp: formatTime(5), desc: 'QR Code verified at donor site' },
    { step: 6, title: 'En Route', status: 'Pending', timestamp: 'Est. ' + formatTime(-10), desc: 'Cold chain transport to relief camp' },
    { step: 7, title: 'Delivered', status: 'Pending', timestamp: 'Est. ' + formatTime(-20), desc: 'Handed over to shelter coordinator' },
    { step: 8, title: 'Donation Completed', status: 'Pending', timestamp: 'Est. ' + formatTime(-25), desc: 'Impact certificate issued' },
  ];
}

// Get Verified NGO Directory
export function getNgos() {
  try {
    const stored = localStorage.getItem(DEMO_NGOS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}

  return [
    {
      id: 'NGO-101',
      name: 'Roti Bank Foundation',
      verificationBadge: 'Government Registered',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      yearsActive: 8,
      responseRating: 4.9,
      mealsDistributed: 142000,
      activeVolunteers: 45,
      contactPhone: '+91 98200 11223',
      operatingCities: ['Mumbai', 'Thane', 'Navi Mumbai'],
      capacityMeals: 500,
      lat: 19.0760,
      lng: 72.8777,
      distanceKm: 2.4,
    },
    {
      id: 'NGO-102',
      name: 'No Food Waste India',
      verificationBadge: 'Government Registered',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      yearsActive: 6,
      responseRating: 4.8,
      mealsDistributed: 98000,
      activeVolunteers: 32,
      contactPhone: '+91 98400 33445',
      operatingCities: ['Bengaluru', 'Chennai', 'Mumbai'],
      capacityMeals: 350,
      lat: 19.0820,
      lng: 72.8890,
      distanceKm: 4.1,
    },
    {
      id: 'NGO-103',
      name: 'Seva Ashram Shelter',
      verificationBadge: 'Awaiting Verification',
      badgeColor: 'bg-gray-800 text-gray-400 border-gray-700',
      yearsActive: 2,
      responseRating: 4.5,
      mealsDistributed: 12000,
      activeVolunteers: 12,
      contactPhone: '+91 98111 55667',
      operatingCities: ['Ahmedabad'],
      capacityMeals: 150,
      lat: 19.0650,
      lng: 72.8650,
      distanceKm: 5.8,
    },
  ];
}

// Get Emergency Requests Feed
export function getEmergencyRequests() {
  try {
    const stored = localStorage.getItem(DEMO_REQUESTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}

  return seedDemoCommunityData().requests;
}

// Seed Demo Data for Hackathon
export function seedDemoCommunityData() {
  const requests = [
    {
      id: 'REQ-2026-01',
      disasterCategory: 'Flood',
      sourceType: 'Manual NGO Request',
      sourceBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      title: 'Monsoon Flood Relief Shelter Requirement',
      orgName: 'Roti Bank Foundation',
      beneficiaries: 180,
      mealsNeeded: 180,
      foodTypeRequired: 'Hot Cooked Meals (Khichdi / Dal Rice)',
      urgency: 'CRITICAL',
      priorityColor: 'bg-red-500 text-white shadow-glow-red',
      city: 'Mumbai',
      district: 'Kurla East',
      address: 'BMC Relief Camp, Near Station Road',
      contactPerson: 'Suresh Patil (NGO Lead)',
      phone: '+91 98200 11223',
      requiredBeforeHours: 3.5,
      createdAt: new Date().toISOString(),
      isDemo: true,
      disasterTag: '🌊 Monsoon Flood Relief',
    },
    {
      id: 'REQ-2026-02',
      disasterCategory: 'Heatwave',
      sourceType: 'Government Advisory',
      sourceBadgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      title: 'Night Shelter Emergency Ration Requirement',
      orgName: 'Urban Homeless Shelter',
      beneficiaries: 85,
      mealsNeeded: 85,
      foodTypeRequired: 'Packaged Biscuits, Milk, Packaged Meals',
      urgency: 'HIGH',
      priorityColor: 'bg-amber-500 text-black shadow-glow-amber',
      city: 'Delhi',
      district: 'Kashmere Gate',
      address: 'Rain Basera Camp #4',
      contactPerson: 'Anita Sharma (Supervisor)',
      phone: '+91 98100 44556',
      requiredBeforeHours: 5.0,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isDemo: true,
      disasterTag: '☀️ Summer Heatwave Advisory',
    },
    {
      id: 'REQ-2026-03',
      disasterCategory: 'Cyclone',
      sourceType: 'Verified Disaster Partner',
      sourceBadgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      title: 'Coastal Cyclone Relief Camp Evening Meals',
      orgName: 'Seva Sandhya Ashram',
      beneficiaries: 120,
      mealsNeeded: 120,
      foodTypeRequired: 'Soft Veg Food / Chapati & Subzi',
      urgency: 'HIGH',
      priorityColor: 'bg-amber-500 text-black shadow-glow-amber',
      city: 'Surat',
      district: 'Dumas Road',
      address: 'Cyclone Shelter #2',
      contactPerson: 'Rameshbhai Patel',
      phone: '+91 98980 12345',
      requiredBeforeHours: 4.0,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isDemo: true,
      disasterTag: '🌀 Cyclone Preparedness',
    },
  ];

  const ngos = getNgos();

  localStorage.setItem(DEMO_REQUESTS_KEY, JSON.stringify(requests));
  localStorage.setItem(DEMO_NGOS_KEY, JSON.stringify(ngos));

  return { requests, ngos };
}
