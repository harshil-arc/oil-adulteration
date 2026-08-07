/**
 * frontend/src/models/overpassModel.js
 * Frontend Data Model & Mappings for OpenStreetMap Overpass Emergency Services
 */

export const OVERPASS_CATEGORIES = {
  All: {
    id: 'All',
    label: 'All Services',
    color: '#6b7280',
    symbol: '🔍',
    badgeBg: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30'
  },
  NGO: {
    id: 'NGO',
    label: 'NGO & Relief',
    color: '#22c55e', // Green 🟢
    symbol: '🟢',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  Hospital: {
    id: 'Hospital',
    label: 'Hospital',
    color: '#ef4444', // Red 🔴
    symbol: '🔴',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
  },
  Clinic: {
    id: 'Clinic',
    label: 'Clinic',
    color: '#f43f5e',
    symbol: '🩺',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
  },
  Shelter: {
    id: 'Shelter',
    label: 'Shelter',
    color: '#f97316', // Orange 🟠
    symbol: '🟠',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  Police: {
    id: 'Police',
    label: 'Police',
    color: '#3b82f6', // Blue 🔵
    symbol: '🔵',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  Fire: {
    id: 'Fire',
    label: 'Fire Station',
    color: '#a855f7', // Purple 🟣
    symbol: '🟣',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  Ambulance: {
    id: 'Ambulance',
    label: 'Ambulance',
    color: '#eab308', // Yellow 🟡
    symbol: '🟡',
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
  },
  FoodBank: {
    id: 'FoodBank',
    label: 'Food Bank',
    color: '#10b981', // Food 🍲
    symbol: '🍲',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  }
};

export const RADIUS_OPTIONS = [
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km (Default)' },
  { value: 20000, label: '20 km' },
  { value: 50000, label: '50 km' }
];

export const LOCATION_PRESETS = [
  { label: 'Current GPS Location', lat: null, lon: null },
  { label: 'Guwahati (Assam)', lat: 26.1445, lon: 91.7362 },
  { label: 'New Delhi (NCR)', lat: 28.6139, lon: 77.2090 },
  { label: 'Mumbai (Maharashtra)', lat: 19.0760, lon: 72.8777 },
  { label: 'Bengaluru (Karnataka)', lat: 12.9716, lon: 77.5946 },
  { label: 'Chennai (Tamil Nadu)', lat: 13.0827, lon: 80.2707 },
  { label: 'Kolkata (West Bengal)', lat: 22.5726, lon: 88.3639 }
];

/**
 * Calculates Haversine distance in km
 */
export function getHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Generates direct Maps navigation URL (Google Maps or OpenStreetMap)
 */
export function getNavigationUrl(lat, lon, label = '') {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
