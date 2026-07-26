/**
 * communityReportService.js
 * Community Adulteration Reporting System & 75m Hotspot Clustering Engine
 * Connects to Firebase Firestore "community_reports" collection
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/supabase';

const COLLECTION_NAME = 'community_reports';
const LOCAL_STORAGE_REPORTS_KEY = 'spectratrust_community_reports_v1';
const LOCAL_USER_ID_KEY = 'spectratrust_user_uuid';

/**
 * Get or create unique persistent device/user identifier
 */
export function getOrCreateUserId() {
  let uid = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!uid) {
    uid = `USER-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString(36)}`;
    localStorage.setItem(LOCAL_USER_ID_KEY, uid);
  }
  return uid;
}

/**
 * Haversine formula to compute distance between two lat/lng pairs in kilometers
 */
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Calculate dynamic Risk Score (0 - 100) and Risk Level
 */
export function calculateRiskScore({ avgAdulteration = 0, reportCount = 1, avgConfidence = 90, lastReportDate = Date.now() }) {
  const adulterationWeight = 0.40 * Math.min(100, Math.max(0, avgAdulteration));
  const countScale = Math.min(10, reportCount) * 10; // 1 report = 10, 5 = 50, 10+ = 100
  const countWeight = 0.30 * countScale;
  const confidenceWeight = 0.20 * Math.min(100, Math.max(0, avgConfidence));

  // Recency bonus: last 24h = 100, 7 days = 80, 30 days = 50, older = 20
  const hoursSince = Math.abs(Date.now() - new Date(lastReportDate).getTime()) / (1000 * 60 * 60);
  let recencyScore = 20;
  if (hoursSince <= 24) recencyScore = 100;
  else if (hoursSince <= 168) recencyScore = 80;
  else if (hoursSince <= 720) recencyScore = 50;
  const recencyWeight = 0.10 * recencyScore;

  const rawScore = Math.round(adulterationWeight + countWeight + confidenceWeight + recencyWeight);
  const score = Math.min(100, Math.max(0, rawScore));

  let level = 'Low';
  if (score > 80) level = 'Critical';
  else if (score > 60) level = 'High';
  else if (score > 30) level = 'Moderate';

  return { score, level };
}

/**
 * Check if the user has already submitted a report within 75 meters in the last 24 hours
 */
export function check24HourDuplicate(reports, userId, lat, lng, radiusKm = 0.075) {
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  return reports.some((rep) => {
    // Check if user match
    const isSameUser = rep.userId === userId || rep.user_id === userId;
    if (!isSameUser) return false;

    // Check time (< 24 hours)
    const reportTime = new Date(rep.timestamp || rep.created_at || 0).getTime();
    if (now - reportTime > twentyFourHoursMs) return false;

    // Check distance (< 75m)
    const dist = getHaversineDistance(lat, lng, rep.latitude, rep.longitude);
    return dist <= radiusKm;
  });
}

/**
 * Spatial Clustering Engine: Groups reports within radiusKm (~75 meters = 0.075 km)
 */
export function clusterReportsToHotspots(reportsList, maxRadiusKm = 0.075) {
  if (!reportsList || reportsList.length === 0) return [];

  const clusters = [];
  const visited = new Set();

  reportsList.forEach((report, index) => {
    if (visited.has(index)) return;

    const currentGroup = [report];
    visited.add(index);

    const lat1 = parseFloat(report.latitude);
    const lng1 = parseFloat(report.longitude);

    if (isNaN(lat1) || isNaN(lng1)) return;

    // Find all neighboring reports within maxRadiusKm (75 meters)
    reportsList.forEach((other, otherIdx) => {
      if (visited.has(otherIdx)) return;
      const lat2 = parseFloat(other.latitude);
      const lng2 = parseFloat(other.longitude);

      if (isNaN(lat2) || isNaN(lng2)) return;

      const dist = getHaversineDistance(lat1, lng1, lat2, lng2);
      if (dist <= maxRadiusKm) {
        currentGroup.push(other);
        visited.add(otherIdx);
      }
    });

    // Compute cluster metrics
    const count = currentGroup.length;
    let sumLat = 0;
    let sumLng = 0;
    let sumAdulteration = 0;
    let sumConfidence = 0;
    let latestTime = 0;

    const oilCounts = {};
    let isAuthorityVerified = false;
    let shopName = '';
    let vendorName = '';
    let addressStr = '';

    currentGroup.forEach((item) => {
      const iLat = parseFloat(item.latitude);
      const iLng = parseFloat(item.longitude);
      sumLat += iLat;
      sumLng += iLng;

      const adult = parseFloat(item.adulterationPercentage || item.adulteration_percentage || item.adulteration || 0);
      sumAdulteration += adult;

      const conf = parseFloat(item.predictionConfidence || item.confidence_score || 90);
      sumConfidence += conf;

      const itemTime = new Date(item.timestamp || item.created_at || Date.now()).getTime();
      if (itemTime > latestTime) latestTime = itemTime;

      const oil = item.oilType || item.oil_type || 'Edible Oil';
      oilCounts[oil] = (oilCounts[oil] || 0) + 1;

      if (item.verificationLevel === 'authority' || item.verified_by_authority || item.status === 'verified') {
        isAuthorityVerified = true;
      }

      if (!shopName && item.shopName) shopName = item.shopName;
      if (!vendorName && item.vendorName) vendorName = item.vendorName;
      if (!addressStr && item.address) addressStr = item.address;
    });

    const centroidLat = sumLat / count;
    const centroidLng = sumLng / count;
    const avgAdulteration = parseFloat((sumAdulteration / count).toFixed(1));
    const avgConfidence = Math.round(sumConfidence / count);

    // Find most common oil type
    let mostCommonOil = currentGroup[0].oilType || currentGroup[0].oil_type || 'Edible Oil';
    let maxOilCount = 0;
    Object.entries(oilCounts).forEach(([oil, c]) => {
      if (c > maxOilCount) {
        maxOilCount = c;
        mostCommonOil = oil;
      }
    });

    const { score: riskScore, level: riskLevel } = calculateRiskScore({
      avgAdulteration,
      reportCount: count,
      avgConfidence,
      lastReportDate: latestTime
    });

    clusters.push({
      id: `hotspot-cluster-${index}-${count}`,
      latitude: centroidLat,
      longitude: centroidLng,
      reportCount: count,
      avgAdulteration,
      avgConfidence,
      mostCommonOil,
      latestReportDate: new Date(latestTime).toISOString(),
      latestReportTimestamp: latestTime,
      riskScore,
      riskLevel,
      verificationLevel: isAuthorityVerified ? 'authority' : 'community',
      shopName: shopName || `${mostCommonOil} Detection Site`,
      vendorName: vendorName || 'Local Supplier',
      address: addressStr || `Near ${centroidLat.toFixed(4)}, ${centroidLng.toFixed(4)}`,
      reports: currentGroup
    });
  });

  return clusters;
}

/**
 * Seed default community reports to populate hotspots
 */
export const SEED_COMMUNITY_REPORTS = [
  {
    reportId: 'seed-rep-1',
    userId: 'USER-SYSTEM-01',
    latitude: 23.0255,
    longitude: 72.5874,
    oilType: 'Mustard Oil',
    adulterationPercentage: 31.6,
    predictionConfidence: 95,
    temperature: 28.4,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    vendorName: 'Shree Ji Traders',
    shopName: 'Shree Ji Oil Depot',
    comments: 'Strong chemical smell and pale color deviation.',
    photoURL: null,
    status: 'verified',
    verificationLevel: 'authority'
  },
  {
    reportId: 'seed-rep-2',
    userId: 'USER-SYSTEM-02',
    latitude: 23.0257,
    longitude: 72.5876, // within 75m of seed-rep-1
    oilType: 'Mustard Oil',
    adulterationPercentage: 34.2,
    predictionConfidence: 94,
    temperature: 28.5,
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    vendorName: 'Shree Ji Traders',
    shopName: 'Shree Ji Oil Depot',
    comments: 'Repeat test confirmed paraffin blend.',
    photoURL: null,
    status: 'pending',
    verificationLevel: 'community'
  },
  {
    reportId: 'seed-rep-3',
    userId: 'USER-SYSTEM-03',
    latitude: 21.2035,
    longitude: 72.8422,
    oilType: 'Cottonseed Oil',
    adulterationPercentage: 28.2,
    predictionConfidence: 92,
    temperature: 29.1,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    vendorName: 'Vrindavan Mills',
    shopName: 'Vrindavan Edible Oils',
    comments: 'High viscosity and off-flavor.',
    photoURL: null,
    status: 'pending',
    verificationLevel: 'community'
  },
  {
    reportId: 'seed-rep-4',
    userId: 'USER-SYSTEM-04',
    latitude: 22.2850,
    longitude: 70.7960,
    oilType: 'Groundnut Oil',
    adulterationPercentage: 21.5,
    predictionConfidence: 89,
    temperature: 27.8,
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    vendorName: 'SP Traders',
    shopName: 'Sardar Patel Oil Merchants',
    comments: 'Palm oil mix detected.',
    photoURL: null,
    status: 'pending',
    verificationLevel: 'community'
  }
];

/**
 * Fetch all community reports from Firestore (with seed fallback)
 */
export async function fetchCommunityReports() {
  const localCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY) || '[]');
  let firestoreReports = [];

  if (db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        firestoreReports.push({ reportId: docSnap.id, ...docSnap.data() });
      });
    } catch (err) {
      console.warn('[CommunityReportService] Firestore fetch notice:', err.message);
    }
  }

  // Combine Firestore, LocalCache, and Seed data without duplicates
  const map = new Map();
  [...SEED_COMMUNITY_REPORTS, ...localCache, ...firestoreReports].forEach((rep) => {
    const key = rep.reportId || `${rep.latitude}-${rep.longitude}-${rep.timestamp}`;
    map.set(key, rep);
  });

  return Array.from(map.values());
}

/**
 * Subscribe to realtime community report updates from Firestore
 */
export function subscribeCommunityReports(onUpdate) {
  if (!db) {
    fetchCommunityReports().then(onUpdate);
    return () => {};
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreReports = [];
        snapshot.forEach((docSnap) => {
          firestoreReports.push({ reportId: docSnap.id, ...docSnap.data() });
        });
        const localCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY) || '[]');
        const map = new Map();
        [...SEED_COMMUNITY_REPORTS, ...localCache, ...firestoreReports].forEach((rep) => {
          const key = rep.reportId || `${rep.latitude}-${rep.longitude}-${rep.timestamp}`;
          map.set(key, rep);
        });
        onUpdate(Array.from(map.values()));
      },
      (err) => {
        console.warn('[CommunityReportService] Firestore snapshot notice:', err.message);
        fetchCommunityReports().then(onUpdate);
      }
    );
  } catch (e) {
    console.warn('[CommunityReportService] Firestore subscription error:', e);
    fetchCommunityReports().then(onUpdate);
    return () => {};
  }
}

/**
 * Submit a new Community Adulteration Report
 * Checks 24-hour duplicate rule before saving to Firestore
 */
export async function submitCommunityReport(reportPayload) {
  const userId = reportPayload.userId || getOrCreateUserId();
  const currentReports = await fetchCommunityReports();

  const isDuplicate = check24HourDuplicate(
    currentReports,
    userId,
    reportPayload.latitude,
    reportPayload.longitude,
    0.075 // 75 meters
  );

  if (isDuplicate) {
    return {
      success: false,
      duplicate: true,
      message: 'You have already submitted a report for this location recently.'
    };
  }

  const finalRecord = {
    userId,
    latitude: parseFloat(reportPayload.latitude),
    longitude: parseFloat(reportPayload.longitude),
    accuracy: reportPayload.accuracy || 10,
    oilType: reportPayload.oilType || 'Edible Oil',
    adulterationPercentage: parseFloat(reportPayload.adulterationPercentage || 0),
    predictionConfidence: Math.round(reportPayload.predictionConfidence || 90),
    temperature: parseFloat(reportPayload.temperature || 28.5),
    timestamp: reportPayload.timestamp || new Date().toISOString(),
    vendorName: reportPayload.vendorName || '',
    shopName: reportPayload.shopName || '',
    comments: reportPayload.comments || '',
    photoURL: reportPayload.photoURL || null,
    sensorReadings: reportPayload.sensorReadings || {},
    status: 'pending',
    verificationLevel: 'community',
    created_at: new Date().toISOString()
  };

  let firestoreId = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...finalRecord,
        createdAtServer: serverTimestamp()
      });
      firestoreId = docRef.id;
      finalRecord.reportId = firestoreId;
      console.log('[CommunityReportService] Report saved to Firebase Firestore with ID:', firestoreId);
    } catch (err) {
      console.warn('[CommunityReportService] Firestore write fallback:', err.message);
      finalRecord.reportId = `rep-local-${Date.now()}`;
    }
  } else {
    finalRecord.reportId = `rep-local-${Date.now()}`;
  }

  // Save to local storage cache
  try {
    const localCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY) || '[]');
    localCache.unshift(finalRecord);
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(localCache.slice(0, 100)));
  } catch (e) {
    console.warn('[CommunityReportService] LocalStorage save notice:', e);
  }

  return {
    success: true,
    reportId: finalRecord.reportId,
    data: finalRecord
  };
}
