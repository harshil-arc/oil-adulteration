/**
 * ngoDisasterDataset.js
 * Real-Time Relief Coordination Platform Dataset
 * Connects Active Emergencies with Verified NGOs, Relief Camps, Community Kitchens & Govt Collection Centers
 */

export const EMERGENCY_CATEGORIES = [
  'All',
  'Flood',
  'Earthquake',
  'Cyclone',
  'Landslide',
  'Heatwave',
  'Fire',
  'Drought',
  'Pandemic',
  'Industrial Accident',
  'Community Relief',
  'Humanitarian Crisis'
];

export const ACTIVE_EMERGENCIES = [
  {
    id: 'emg-assam-floods-2026',
    title: 'Assam Brahmaputra Flash Floods 2026',
    category: 'Flood',
    state: 'Assam',
    districts: ['Kamrup Metropolitan', 'Morigaon', 'Darrang', 'Dhubri'],
    status: 'Critical',
    severity: 'Critical',
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    affectedPopulation: 125000,
    activeCampsCount: 27,
    respondingNgosCount: 14,
    foodRequirement: 'Very High',
    latitude: 26.1445,
    longitude: 91.7362,
    weather: 'Heavy Rainfall (85mm/hr)',
    governmentAdvisory: 'Red Alert issued by NDMA & Assam SDMA. High ground evacuation in progress along Brahmaputra basin.',
    startDate: '2026-07-20',
    situationSummary: 'Torrential monsoon downpours triggered severe overflow of the Brahmaputra River, submerging 412 villages across Kamrup and Morigaon districts. Immediate cooked food and drinking water distribution required for displaced families in temporary shelters.',
    requirementMeters: {
      food: { percent: 88, urgency: 'Critical', status: '88% Shortage - Immediate Cooked Rations Required' },
      water: { percent: 92, urgency: 'Critical', status: '92% Shortage - 20,000L Packaged Water Needed' },
      medicines: { percent: 75, urgency: 'High', status: '75% Needed - Anti-cholera & First Aid Kits' },
      blankets: { percent: 65, urgency: 'Medium', status: '65% Needed - Dry Bedding & Tarpaulins' },
      sanitation: { percent: 70, urgency: 'High', status: '70% Needed - Hygiene & Hygiene Kits' }
    },
    priorityItems: [
      { name: 'Cooked Food Packets', category: 'Cooked Food', priority: 'Critical', unit: 'packets' },
      { name: 'Packaged Drinking Water (1L)', category: 'Drinking Water', priority: 'Critical', unit: 'bottles' },
      { name: 'Baby Milk Powder & Food', category: 'Baby Food', priority: 'Critical', unit: 'tins' },
      { name: 'Rice & Pulses (Ration)', category: 'Dry Food', priority: 'High', unit: 'kg' },
      { name: 'Biscuits & Energy Bars', category: 'Biscuits', priority: 'High', unit: 'packs' },
      { name: 'Water Purification Tablets', category: 'Medicines', priority: 'Critical', unit: 'strips' },
      { name: 'Waterproof Blankets', category: 'Blankets', priority: 'Medium', unit: 'pieces' },
      { name: 'Sanitary & Hygiene Kits', category: 'Sanitary Kits', priority: 'High', unit: 'kits' }
    ],
    timeline: [
      { stage: 'Emergency Reported', time: '2026-07-20 06:30 AM', desc: 'Brahmaputra river crossed danger level (+1.8m).' },
      { stage: 'Government Response', time: '2026-07-20 09:15 AM', desc: 'SDRF & NDRF battalion deployed to Kamrup Metro.' },
      { stage: 'NGOs Arrived', time: '2026-07-20 01:00 PM', desc: 'Helping Hands & Akshaya Patra mobilized emergency kitchens.' },
      { stage: 'Relief Camps Opened', time: '2026-07-21 08:00 AM', desc: '27 Government School shelters operational.' },
      { stage: 'Food Distribution Active', time: '2026-07-22 10:00 AM', desc: '14,500 meals served daily across shelters.' }
    ]
  },
  {
    id: 'emg-wayanad-landslide-2026',
    title: 'Wayanad Hillside Landslide Emergency',
    category: 'Landslide',
    state: 'Kerala',
    districts: ['Wayanad', 'Kozhikode'],
    status: 'Active',
    severity: 'High',
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    affectedPopulation: 42000,
    activeCampsCount: 12,
    respondingNgosCount: 9,
    foodRequirement: 'High',
    latitude: 11.6854,
    longitude: 76.1320,
    weather: 'Continuous Drizzle (18°C)',
    governmentAdvisory: 'Yellow alert active. Avoid hilly terrain routes near Meppadi and Chooralmala.',
    startDate: '2026-07-22',
    situationSummary: 'Debris flow damaged residential hamlets along hill slopes in Meppadi. Relief camps operational in Kalpetta higher secondary schools.',
    requirementMeters: {
      food: { percent: 65, urgency: 'High', status: '65% Shortage - Dry Rations & Biscuit Packs' },
      water: { percent: 50, urgency: 'Medium', status: '50% Shortage - Clean Water Supplies' },
      medicines: { percent: 80, urgency: 'High', status: '80% Needed - Antiseptics & Pain Relief' },
      blankets: { percent: 85, urgency: 'Critical', status: '85% Needed - Heavy Thermal Blankets' },
      sanitation: { percent: 60, urgency: 'Medium', status: '60% Needed - Hygiene Supplies' }
    },
    priorityItems: [
      { name: 'Thermal Blankets', category: 'Blankets', priority: 'Critical', unit: 'pieces' },
      { name: 'First Aid & Trauma Kits', category: 'Medicines', priority: 'Critical', unit: 'kits' },
      { name: 'Ready-to-Eat Meal Packs', category: 'Cooked Food', priority: 'High', unit: 'packs' },
      { name: 'Baby Milk Powder', category: 'Baby Food', priority: 'High', unit: 'tins' },
      { name: 'Warm Clothes (Children & Adults)', category: 'Clothes', priority: 'High', unit: 'sets' }
    ],
    timeline: [
      { stage: 'Emergency Reported', time: '2026-07-22 04:15 AM', desc: 'Debris flow reported near Meppadi valley.' },
      { stage: 'Government Response', time: '2026-07-22 06:00 AM', desc: 'Kerala Fire & Rescue team deployed.' },
      { stage: 'NGOs Arrived', time: '2026-07-22 11:30 AM', desc: 'Seva Bharathi & Red Cross Kerala established relief depots.' },
      { stage: 'Relief Camps Opened', time: '2026-07-22 03:00 PM', desc: '12 School shelters activated.' }
    ]
  },
  {
    id: 'emg-cyclone-biparjoy',
    title: 'Cyclone Biparjoy Coastal Relief',
    category: 'Cyclone',
    state: 'Gujarat',
    districts: ['Kutch', 'Jamnagar', 'Devbhumi Dwarka'],
    status: 'Stabilizing',
    severity: 'High',
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    affectedPopulation: 85000,
    activeCampsCount: 18,
    respondingNgosCount: 11,
    foodRequirement: 'Moderate',
    latitude: 23.2420,
    longitude: 69.6669,
    weather: 'Windy (45km/h)',
    governmentAdvisory: 'Coastal restriction active. Restoration of power lines and supply chains in progress.',
    startDate: '2026-07-18',
    situationSummary: 'Strong coastal gale winds and storm surges affected low-lying fishing villages in Kutch and Dwarka districts.',
    requirementMeters: {
      food: { percent: 45, urgency: 'Medium', status: '45% Shortage - Wheat Flour & Oil Rations' },
      water: { percent: 40, urgency: 'Medium', status: '40% Shortage - Drinking Water Tanks' },
      medicines: { percent: 50, urgency: 'Medium', status: '50% Needed - Basic Dispensary Supplies' },
      blankets: { percent: 35, urgency: 'Low', status: '35% Needed - Standard Blankets' },
      sanitation: { percent: 40, urgency: 'Medium', status: '40% Needed - Soap & Sanitation' }
    },
    priorityItems: [
      { name: 'Wheat Flour (Atta)', category: 'Flour', priority: 'High', unit: 'kg' },
      { name: 'Edible Cooking Oil', category: 'Dry Food', priority: 'High', unit: 'liters' },
      { name: 'Drinking Water Cans (20L)', category: 'Drinking Water', priority: 'Medium', unit: 'cans' },
      { name: 'Dry Biscuits & Snacks', category: 'Biscuits', priority: 'Medium', unit: 'packs' }
    ],
    timeline: [
      { stage: 'Emergency Reported', time: '2026-07-18 10:00 AM', desc: 'Cyclone landfall warning issued by IMD.' },
      { stage: 'Government Response', time: '2026-07-18 02:00 PM', desc: '75,000 coastal residents relocated.' },
      { stage: 'NGOs Arrived', time: '2026-07-19 09:00 AM', desc: 'Relief kitchens active in Bhuj and Dwarka.' }
    ]
  }
];

export const VERIFIED_NGOS = [
  {
    id: 'ngo-akshaya-patra-assam',
    name: 'The Akshaya Patra Foundation',
    emergencyId: 'emg-assam-floods-2026',
    logo: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=120&q=80',
    verified: true,
    verificationBadge: 'FSSAI & Govt Verified',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    city: 'Guwahati',
    distanceKm: 4.2,
    operatingStatus: 'Open Now',
    acceptingDonations: true,
    acceptedCategories: ['Cooked Food', 'Dry Ration', 'Water', 'Biscuits', 'Baby Food'],
    operatingHours: '06:00 AM - 10:00 PM',
    contactNumber: '+91 98765 43210',
    email: 'relief.guwahati@akshayapatra.org',
    address: 'Plot 14, Industrial Estate, Bamunimaidam, Guwahati, Assam',
    latitude: 26.1850,
    longitude: 91.7820,
    type: 'NGO'
  },
  {
    id: 'ngo-helping-hands-assam',
    name: 'Helping Hands Assam Relief Network',
    emergencyId: 'emg-assam-floods-2026',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=120&q=80',
    verified: true,
    verificationBadge: 'Registered 80G NGO',
    state: 'Assam',
    district: 'Morigaon',
    city: 'Morigaon',
    distanceKm: 12.8,
    operatingStatus: 'Open 24 Hours',
    acceptingDonations: true,
    acceptedCategories: ['Dry Ration', 'Medicines', 'Clothes', 'Blankets', 'Water', 'Sanitary Kits'],
    operatingHours: '24 Hours Open',
    contactNumber: '+91 94350 12345',
    email: 'morigaon.relief@helpinghands.org',
    address: 'Near Morigaon Civil Hospital, Morigaon, Assam',
    latitude: 26.2500,
    longitude: 92.3380,
    type: 'NGO'
  },
  {
    id: 'ngo-red-cross-kerala',
    name: 'Indian Red Cross Society - Kerala State',
    emergencyId: 'emg-wayanad-landslide-2026',
    logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=120&q=80',
    verified: true,
    verificationBadge: 'Official Red Cross Chapter',
    state: 'Kerala',
    district: 'Wayanad',
    city: 'Kalpetta',
    distanceKm: 6.5,
    operatingStatus: 'Open Now',
    acceptingDonations: true,
    acceptedCategories: ['Medicines', 'Blankets', 'Clothes', 'Cooked Food', 'Water', 'Baby Food'],
    operatingHours: '07:00 AM - 09:00 PM',
    contactNumber: '+91 94471 99887',
    email: 'wayanad@redcrosskerala.org',
    address: 'Red Cross Bhavan, Pinangode Road, Kalpetta, Wayanad, Kerala',
    latitude: 11.6080,
    longitude: 76.0820,
    type: 'NGO'
  },
  {
    id: 'ngo-seva-bharti-gujarat',
    name: 'Seva Bharathi Gujarat Relief Foundation',
    emergencyId: 'emg-cyclone-biparjoy',
    logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=120&q=80',
    verified: true,
    verificationBadge: 'Govt Recognized NGO',
    state: 'Gujarat',
    district: 'Kutch',
    city: 'Bhuj',
    distanceKm: 8.1,
    operatingStatus: 'Open Now',
    acceptingDonations: true,
    acceptedCategories: ['Dry Ration', 'Flour', 'Water', 'Blankets', 'Clothes'],
    operatingHours: '08:00 AM - 08:00 PM',
    contactNumber: '+91 98252 33445',
    email: 'kutch.relief@sevabharathi.org',
    address: 'Near Jubilee Ground, Bhuj, Kutch, Gujarat',
    latitude: 23.2500,
    longitude: 69.6700,
    type: 'NGO'
  }
];

export const RELIEF_CAMPS = [
  {
    id: 'camp-guwahati-govt-school',
    name: 'Government Model Higher Secondary Relief Camp',
    emergencyId: 'emg-assam-floods-2026',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    peopleSheltered: 480,
    capacity: 500,
    occupancyPercent: 96,
    nearestLandmark: 'Opposite Guwahati Medical College, Bhangagarh',
    contactNumber: '+91 98640 11223',
    latitude: 26.1550,
    longitude: 91.7650,
    type: 'Relief Camp',
    mealsRequired: {
      breakfast: 'Required',
      lunch: 'Required',
      dinner: 'Required',
      water: 'Required',
      blankets: 'Available'
    },
    currentRequirements: ['Cooked Meal Packets (500)', 'Drinking Water Bottles (1000L)', 'Baby Milk Powder']
  },
  {
    id: 'camp-morigaon-stadium',
    name: 'Morigaon District Stadium Relief Center',
    emergencyId: 'emg-assam-floods-2026',
    state: 'Assam',
    district: 'Morigaon',
    peopleSheltered: 720,
    capacity: 800,
    occupancyPercent: 90,
    nearestLandmark: 'Morigaon Town Center',
    contactNumber: '+91 94351 88776',
    latitude: 26.2450,
    longitude: 92.3450,
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
    id: 'camp-kalpetta-school',
    name: 'Kalpetta Higher Secondary Relief Shelter',
    emergencyId: 'emg-wayanad-landslide-2026',
    state: 'Kerala',
    district: 'Wayanad',
    peopleSheltered: 310,
    capacity: 400,
    occupancyPercent: 78,
    nearestLandmark: 'Kalpetta Bus Stand',
    contactNumber: '+91 94470 55443',
    latitude: 11.6100,
    longitude: 76.0850,
    type: 'Relief Camp',
    mealsRequired: {
      breakfast: 'Available',
      lunch: 'Required',
      dinner: 'Required',
      water: 'Available',
      blankets: 'Required'
    },
    currentRequirements: ['Thermal Blankets (150)', 'Dry Biscuits', 'Sanitary Pads', 'Warm Sweaters']
  }
];

export const COMMUNITY_KITCHENS = [
  {
    id: 'kitchen-guwahati-community',
    name: 'Guwahati Central Community Kitchen',
    emergencyId: 'emg-assam-floods-2026',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    mealsServedToday: 3450,
    dailyCapacity: 5000,
    foodNeeded: 'Rice, Pulses, Mustard Oil, Spices',
    volunteerAvailability: 'Need 12 Volunteers for Meal Packaging',
    contactNumber: '+91 98641 99001',
    address: 'Paltan Bazaar Community Hall, Guwahati',
    latitude: 26.1750,
    longitude: 91.7520,
    type: 'Community Kitchen'
  },
  {
    id: 'kitchen-kalpetta-seva',
    name: 'Wayanad Disaster Relief Kitchen',
    emergencyId: 'emg-wayanad-landslide-2026',
    state: 'Kerala',
    district: 'Wayanad',
    mealsServedToday: 1800,
    dailyCapacity: 2500,
    foodNeeded: 'Rice, Vegetables, Cooking Oil',
    volunteerAvailability: 'Need 5 Cooks & 8 Drivers',
    contactNumber: '+91 94472 11223',
    address: 'Meppadi Road, Kalpetta, Wayanad',
    latitude: 11.6150,
    longitude: 76.0900,
    type: 'Community Kitchen'
  }
];

export const GOVT_COLLECTION_CENTERS = [
  {
    id: 'govt-kamrup-collectorate',
    name: 'District Collectorate Food & Relief Warehouse',
    emergencyId: 'emg-assam-floods-2026',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    type: 'Government Collection Center',
    centerType: 'Collector Office Depot',
    acceptedSupplies: ['Bulk Dry Grain Bags', 'Bottled Water Crates', 'Medical Boxes', 'Blanket Bundles'],
    openingHours: '08:00 AM - 08:00 PM',
    contactNumber: '+91 361 2540080',
    address: 'DC Office Campus, Hengrabari, Guwahati, Assam',
    latitude: 26.1480,
    longitude: 91.7900
  },
  {
    id: 'govt-wayanad-disaster-cell',
    name: 'District Disaster Management Authority (DDMA) Depot',
    emergencyId: 'emg-wayanad-landslide-2026',
    state: 'Kerala',
    district: 'Wayanad',
    type: 'Government Collection Center',
    centerType: 'District Warehouse',
    acceptedSupplies: ['Medical Supplies', 'New Clothes', 'Bedding Sets', 'Emergency Lights'],
    openingHours: '09:00 AM - 07:00 PM',
    contactNumber: '+91 4936 204151',
    address: 'Civil Station, Kalpetta, Wayanad, Kerala',
    latitude: 11.6050,
    longitude: 76.0790
  }
];
