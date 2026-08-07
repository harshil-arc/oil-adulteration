/**
 * frontend/src/models/gdacsModel.js
 * Frontend Data Model & Constants for GDACS Disaster Data
 */

export const DISASTER_CATEGORIES = [
  { id: 'All', label: 'All', iconName: 'Grid' },
  { id: 'Flood', label: 'Flood', iconName: 'Droplets', color: '#3b82f6' },
  { id: 'Earthquake', label: 'Earthquake', iconName: 'Activity', color: '#eab308' },
  { id: 'Cyclone', label: 'Cyclone', iconName: 'Wind', color: '#06b6d4' },
  { id: 'Volcano', label: 'Volcano', iconName: 'Flame', color: '#f97316' },
  { id: 'Tsunami', label: 'Tsunami', iconName: 'Waves', color: '#2563eb' },
  { id: 'Wildfire', label: 'Wildfire', iconName: 'Flame', color: '#ef4444' },
  { id: 'Storm', label: 'Storm', iconName: 'CloudRain', color: '#8b5cf6' },
  { id: 'Drought', label: 'Drought', iconName: 'Sun', color: '#d97706' },
  { id: 'Landslide', label: 'Landslide', iconName: 'Mountain', color: '#78350f' },
  { id: 'Other', label: 'Other', iconName: 'AlertTriangle', color: '#6b7280' },
];

export const SEVERITY_CONFIG = {
  Green: {
    label: 'Low',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    hex: '#22c55e',
    dotClass: 'bg-emerald-500 shadow-emerald-500/50'
  },
  Orange: {
    label: 'Medium',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    hex: '#f97316',
    dotClass: 'bg-amber-500 shadow-amber-500/50'
  },
  Red: {
    label: 'High',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    hex: '#ef4444',
    dotClass: 'bg-red-500 shadow-red-500/50 animate-pulse'
  }
};

/**
 * Normalizes raw alert data from API
 */
export function normalizeFrontendAlert(raw) {
  const severity = raw.severity && SEVERITY_CONFIG[raw.severity] ? raw.severity : 'Green';
  
  return {
    id: raw.id || `ALERT-${Math.random().toString(36).substr(2, 9)}`,
    title: raw.title || 'Disaster Alert',
    disasterType: raw.disasterType || 'Other',
    severity: severity,
    country: raw.country || 'Global',
    location: raw.location || raw.country || 'Global Location',
    latitude: typeof raw.latitude === 'number' ? raw.latitude : parseFloat(raw.latitude) || 0,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : parseFloat(raw.longitude) || 0,
    date: raw.date ? new Date(raw.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString(),
    rawDate: raw.date ? new Date(raw.date) : new Date(),
    description: raw.description || 'No description available for this live advisory.',
    link: raw.link || 'https://www.gdacs.org',
    icon: raw.icon || 'alert-triangle'
  };
}
