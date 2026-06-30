require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const seedTestingCentres = [
  {
    id: 'center_1',
    name: 'Gujarat Food & Drug Laboratory (FDA)',
    address: 'Sector-10A, Gandhinagar, Gujarat 382010',
    latitude: 23.2201,
    longitude: 72.6468,
    working_hours: '09:00 AM - 06:00 PM',
    phone: '+91 79 2325 3482',
    email: 'contact@gujfda.gov.in',
    available_tests: ['Purity', 'Chemical Adulteration', 'Heavy Metals', 'Pesticide Residue'],
    status: 'Open',
    rating: 4.8,
    created_at: new Date().toISOString()
  },
  {
    id: 'center_2',
    name: 'FSSAI National Food Laboratory (NFL)',
    address: 'Sector 14, Ghaziabad, Uttar Pradesh 201002',
    latitude: 28.6738,
    longitude: 77.4402,
    working_hours: '09:00 AM - 06:00 PM',
    phone: '+91 120 270 2165',
    email: 'director.nflgzb@fssai.gov.in',
    available_tests: ['Full Spectral Purity', 'Toxicity', 'Micro-biological', 'Foreign Fats'],
    status: 'Open',
    rating: 4.9,
    created_at: new Date().toISOString()
  },
  {
    id: 'center_3',
    name: 'Eurofins Food Testing Lab India',
    address: 'A-3, Industrial Area, Phase-I, New Delhi 110020',
    latitude: 28.5355,
    longitude: 77.2711,
    working_hours: '09:00 AM - 06:00 PM',
    phone: '+91 11 6625 2100',
    email: 'enquiryindia@eurofins.com',
    available_tests: ['Mineral Oil Adulteration', 'Fatty Acid Profile', 'Heavy Metals'],
    status: 'Open',
    rating: 4.5,
    created_at: new Date().toISOString()
  },
  {
    id: 'center_4',
    name: 'TÜV SÜD South Asia Testing Centre',
    address: 'Industrial Estate, Sanathnagar, Hyderabad 500018',
    latitude: 17.4580,
    longitude: 78.4310,
    working_hours: '09:00 AM - 06:00 PM',
    phone: '+91 40 6001 3333',
    email: 'info.in@tuvsud.com',
    available_tests: ['Purity', 'Acid Value', 'Peroxide Value', 'Argemone Oil check'],
    status: 'Open',
    rating: 4.6,
    created_at: new Date().toISOString()
  },
  {
    id: 'center_5',
    name: 'National Test House Food Lab',
    address: 'Block CP, Sector V, Salt Lake, Kolkata 700091',
    latitude: 22.5735,
    longitude: 88.4330,
    working_hours: '09:00 AM - 06:00 PM',
    phone: '+91 33 2367 3426',
    email: 'nth-kolkata@gov.in',
    available_tests: ['Rancidity', 'FSSAI Standard Verification', 'Coloring Agents'],
    status: 'Open',
    rating: 4.4,
    created_at: new Date().toISOString()
  }
];

const seedGovernmentAlerts = [
  {
    id: 'alert_1',
    product_name: 'Kacchi Ghani Mustard Oil',
    brand_name: 'Brand X Foods',
    category: 'Product Recall',
    reason: 'Excessive argemone oil presence detected via spectral signature scan.',
    issued_by: 'FSSAI Central Command',
    issue_date: new Date().toISOString().split('T')[0],
    affected_states: ['Gujarat', 'Maharashtra', 'Delhi'],
    severity: 'Critical',
    recommended_action: 'Avoid Consumption & Return Product',
    created_at: new Date().toISOString()
  },
  {
    id: 'alert_2',
    product_name: 'Standard Refined Sunflower Oil',
    brand_name: 'Swastik Edibles',
    category: 'Government Ban',
    reason: 'Unpermitted color additives (Metanil Yellow) detected exceeding legal limits.',
    issued_by: 'Ministry of Health & Welfare',
    issue_date: new Date().toISOString().split('T')[0],
    affected_states: ['All States'],
    severity: 'High',
    recommended_action: 'Dispose Safely & Report Retailer',
    created_at: new Date().toISOString()
  },
  {
    id: 'alert_3',
    product_name: 'Virgin Extra Olive Oil',
    brand_name: 'Tuscany Imports',
    category: 'Safety Warning',
    reason: 'Sub-standard density indicating artificial adulterant mask.',
    issued_by: 'FSSAI Western Division',
    issue_date: new Date().toISOString().split('T')[0],
    affected_states: ['Karnataka', 'Tamil Nadu'],
    severity: 'Medium',
    recommended_action: 'Return Product to Merchant',
    created_at: new Date().toISOString()
  }
];

const seedShops = [
  {
    id: 'shop_1',
    name: 'Kisan Kirana Store',
    latitude: 23.0225,
    longitude: 72.5714,
    oil_type: 'Mustard Oil',
    status: 'adulterated',
    trust_score: 45,
    created_at: new Date().toISOString()
  },
  {
    id: 'shop_2',
    name: 'Pure Food Bazaar',
    latitude: 23.0338,
    longitude: 72.5250,
    oil_type: 'Sunflower Oil',
    status: 'safe',
    trust_score: 95,
    created_at: new Date().toISOString()
  },
  {
    id: 'shop_3',
    name: 'Reliable Grocers',
    latitude: 23.0120,
    longitude: 72.5850,
    oil_type: 'Coconut Oil',
    status: 'suspicious',
    trust_score: 68,
    created_at: new Date().toISOString()
  }
];

const seedNgos = [
  {
    id: 'ngo_1',
    name: 'Robin Hood Army - Ahmedabad',
    address: 'Vastrapur Community Kitchen, Ahmedabad, Gujarat 380015',
    phone: '+91 98980 12345',
    operating_hours: '09:00 AM - 09:00 PM',
    food_types: ['Veg', 'Cooked Food'],
    capacity: '500 meals/day',
    urgency: 'High',
    pickup_available: true,
    rating: 4.8,
    verified: true,
    reg_number: 'RHA-IND-2014-9821',
    description: 'Zero-funds volunteer organization routing surplus food from restaurants directly to communities.',
    latitude: 23.0338,
    longitude: 72.5250,
    status: 'Available',
    past_donations: 4200,
    created_at: new Date().toISOString()
  },
  {
    id: 'ngo_2',
    name: 'Zomato Feeding India - Mumbai Hub',
    address: 'Bandra Reclamation Center, Mumbai, Maharashtra 400050',
    phone: '+91 91234 56789',
    operating_hours: '09:00 AM - 09:00 PM',
    food_types: ['Veg', 'Cooked Food', 'Dry Rations'],
    capacity: '1200 meals/day',
    urgency: 'Medium',
    pickup_available: true,
    rating: 4.9,
    verified: true,
    reg_number: 'FIP-NGO-1029',
    description: 'Non-profit combating hunger and malnutrition in India via systemic redistribution networks.',
    latitude: 19.0522,
    longitude: 72.8258,
    status: 'Busy',
    past_donations: 9800,
    created_at: new Date().toISOString()
  }
];

async function seed() {
  console.log('🌱 Authenticating seed user...');
  try {
    try {
      await signInWithEmailAndPassword(auth, 'seeder@spectratrust.org', 'SeedSecurePass123!');
      console.log('Logged in successfully!');
    } catch (e) {
      console.log('User not found, registering new seed user...');
      await createUserWithEmailAndPassword(auth, 'seeder@spectratrust.org', 'SeedSecurePass123!');
      console.log('Registered and logged in successfully!');
    }

    console.log('🌱 Starting Firestore Seed Process...');
    
    // 1. Seed Testing Centres
    const tcCol = collection(db, 'testing_centres');
    const tcSnap = await getDocs(tcCol);
    if (tcSnap.empty) {
      console.log('Seeding testing centres...');
      for (const tc of seedTestingCentres) {
        await setDoc(doc(db, 'testing_centres', tc.id), tc);
      }
    }

    // 2. Seed Government Alerts
    const gaCol = collection(db, 'government_alerts');
    const gaSnap = await getDocs(gaCol);
    if (gaSnap.empty) {
      console.log('Seeding government alerts...');
      for (const ga of seedGovernmentAlerts) {
        await setDoc(doc(db, 'government_alerts', ga.id), ga);
      }
    }

    // 3. Seed Shops
    const sCol = collection(db, 'shops');
    const sSnap = await getDocs(sCol);
    if (sSnap.empty) {
      console.log('Seeding shops...');
      for (const s of seedShops) {
        await setDoc(doc(db, 'shops', s.id), s);
      }
    }

    // 4. Seed NGOs
    const nCol = collection(db, 'ngos');
    const nSnap = await getDocs(nCol);
    if (nSnap.empty) {
      console.log('Seeding NGOs...');
      for (const n of seedNgos) {
        await setDoc(doc(db, 'ngos', n.id), n);
      }
    }

    console.log('🎉 Firestore Seed Complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  }
}

seed();
