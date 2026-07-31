/**
 * foodSafetyIntelligenceService.js
 * Food Safety Intelligence Center Service Engine
 * Aggregates, filters, caches, and manages verified food safety alerts & bookmarks.
 */

import { VERIFIED_INTELLIGENCE_ALERTS } from '../data/foodSafetyIntelligenceData';

const BOOKMARKS_KEY = 'spectratrust_food_intelligence_bookmarks_v1';
const NOTIF_PREFS_KEY = 'spectratrust_food_intelligence_notif_prefs_v1';
const CACHE_KEY = 'spectratrust_food_intelligence_alerts_cache_v1';

/**
 * Fetch verified alerts with category, search query, state & severity filtering
 */
export function fetchVerifiedAlerts({ category = 'All', searchQuery = '', stateFilter = 'All', severityFilter = 'All' } = {}) {
  let list = [];

  // Try cached alerts or fallback to primary verified dataset
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      list = JSON.parse(cached);
    } else {
      list = [...VERIFIED_INTELLIGENCE_ALERTS];
      localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    }
  } catch (e) {
    list = [...VERIFIED_INTELLIGENCE_ALERTS];
  }

  // Ensure dataset items are populated
  if (!list || list.length === 0) {
    list = [...VERIFIED_INTELLIGENCE_ALERTS];
  }

  // Filter by Category
  if (category && category !== 'All') {
    list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by State
  if (stateFilter && stateFilter !== 'All') {
    list = list.filter(item => {
      const states = Array.isArray(item.affectedStates) ? item.affectedStates : [item.affectedStates || 'Pan-India'];
      return states.some(s => String(s).toLowerCase().includes(stateFilter.toLowerCase()) || String(s).toLowerCase() === 'pan-india');
    });
  }

  // Filter by Severity
  if (severityFilter && severityFilter !== 'All') {
    list = list.filter(item => String(item.severity || '').toLowerCase() === severityFilter.toLowerCase());
  }

  // Filter by Search Query (Brand, Company, Oil, Milk, Ghee, Honey, Rice, Wheat, District, State, Product)
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(item => {
      const states = Array.isArray(item.affectedStates) ? item.affectedStates : [item.affectedStates || 'Pan-India'];
      const tags = Array.isArray(item.tags) ? item.tags : [];
      return (
        String(item.title || '').toLowerCase().includes(q) ||
        String(item.productName || '').toLowerCase().includes(q) ||
        String(item.brand || '').toLowerCase().includes(q) ||
        String(item.company || '').toLowerCase().includes(q) ||
        String(item.oilType || '').toLowerCase().includes(q) ||
        String(item.authority || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q) ||
        states.some(s => String(s).toLowerCase().includes(q)) ||
        tags.some(t => String(t).toLowerCase().includes(q))
      );
    });
  }

  return list;
}

/**
 * Toggle bookmark for an alert ID
 */
export function toggleBookmark(alertId) {
  try {
    const current = getBookmarkedAlertIds();
    let updated = [];
    if (current.includes(alertId)) {
      updated = current.filter(id => id !== alertId);
    } else {
      updated = [...current, alertId];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated.includes(alertId);
  } catch (e) {
    return false;
  }
}

/**
 * Get list of bookmarked alert IDs
 */
export function getBookmarkedAlertIds() {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save user notification preferences
 */
export function saveNotificationPreferences(prefs) {
  try {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get user notification preferences
 */
export function getNotificationPreferences() {
  try {
    const data = localStorage.getItem(NOTIF_PREFS_KEY);
    return data ? JSON.parse(data) : {
      oilAlerts: true,
      milkAlerts: true,
      gheeAlerts: true,
      honeyAlerts: true,
      myStateOnly: false,
      criticalOnly: true,
      selectedState: 'Gujarat'
    };
  } catch (e) {
    return {
      oilAlerts: true,
      milkAlerts: true,
      gheeAlerts: true,
      honeyAlerts: true,
      myStateOnly: false,
      criticalOnly: true,
      selectedState: 'Gujarat'
    };
  }
}
