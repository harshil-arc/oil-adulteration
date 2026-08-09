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
 * Fetch live food recall alerts directly from US FDA / OpenFDA Enforcement API
 */
export async function fetchLiveOpenFdaRecalls() {
  try {
    const res = await fetch('https://api.fda.gov/food/enforcement.json?limit=10');
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.results || [];

    const liveItems = results.map((item, idx) => {
      const year = item.report_date ? item.report_date.slice(0, 4) : '2026';
      const month = item.report_date ? item.report_date.slice(4, 6) : '08';
      const day = item.report_date ? item.report_date.slice(6, 8) : '01';
      const pubDate = `${year}-${month}-${day}`;

      let severity = 'High';
      if (item.classification?.includes('Class I')) severity = 'Critical';
      else if (item.classification?.includes('Class III')) severity = 'Medium';

      return {
        id: `openfda-live-${item.event_id || idx}-${idx}`,
        title: `OpenFDA Real-Time Recall: ${item.recalling_firm || 'Official Producer'} - ${item.product_description?.slice(0, 65) || 'Food Item'}...`,
        category: 'Food Recalls',
        authority: 'US FDA / OpenFDA Enforcement Registry',
        sourceName: 'US FDA Enforcement Directives (api.fda.gov)',
        sourceUrl: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`,
        publicationDate: pubDate,
        productName: item.product_description?.slice(0, 80) || 'Packaged Food Product',
        brand: item.recalling_firm || 'Imported Brand',
        company: item.recalling_firm || 'Food Processing Corp',
        oilType: 'Processed Food / Edible Items',
        batchInfo: item.code_info?.slice(0, 60) || 'Lot / Code Info On Package',
        testingLab: 'FDA Central Microbial & Quality Testing Laboratory',
        labParameterTested: 'Pathogen / Chemical / MRL Regulatory Standard',
        detectedLevel: item.reason_for_recall?.slice(0, 90) || 'Non-compliance with food safety purity standards',
        legalAction: `FDA ${item.classification || 'Recall Notice'} - Status: ${item.status || 'Active Enforcement'}`,
        affectedStates: [item.state || 'Nationwide', 'International Distribution'],
        severity: severity,
        sourceBadge: 'Live OpenFDA API',
        thumbnailImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        description: item.product_description || 'Enforcement directive issued following quality control evaluation.',
        reason: item.reason_for_recall || 'Product recalled due to regulatory non-compliance.',
        recommendedAction: 'Inspect household inventory. Discontinue usage and return to vendor if batch code matches.',
        tags: ['OpenFDA Live', 'Real-Time Recall', 'Food Safety Alert'],
        isFeatured: false
      };
    });

    if (liveItems.length > 0) {
      // Merge live items with static verified dataset to update local cache
      const combined = [...liveItems, ...VERIFIED_INTELLIGENCE_ALERTS];
      // Deduplicate by ID
      const uniqueMap = new Map();
      combined.forEach(it => uniqueMap.set(it.id, it));
      const uniqueList = Array.from(uniqueMap.values());
      localStorage.setItem(CACHE_KEY, JSON.stringify(uniqueList));
      return uniqueList;
    }

    return [];
  } catch (err) {
    console.warn('[Food Intelligence] OpenFDA fetch error:', err);
    return [];
  }
}

/**
 * Fetch verified alerts with category, search query, state & severity filtering
 */
export function fetchVerifiedAlerts({ category = 'All', searchQuery = '', stateFilter = 'All', severityFilter = 'All', customList = null } = {}) {
  let list = [];

  if (customList && Array.isArray(customList) && customList.length > 0) {
    list = [...customList];
  } else {
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
