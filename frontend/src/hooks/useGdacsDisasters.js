/**
 * frontend/src/hooks/useGdacsDisasters.js
 * ViewModel / Custom Hook for GDACS Disaster Dashboard
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchGdacsAlerts, 
  calculateGdacsStats, 
  generateGdacsAiSummary 
} from '../services/gdacsService';

const SEVERITY_WEIGHT = { Red: 3, Orange: 2, Green: 1 };
const AUTO_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function useGdacsDisasters() {
  const [rawAlerts, setRawAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter & Search & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'severity' | 'country'

  // Load Data
  const loadAlerts = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchGdacsAlerts(forceRefresh);
      if (res.success && Array.isArray(res.alerts)) {
        setRawAlerts(res.alerts);
        setLastUpdated(new Date(res.timestamp || Date.now()));
        if (res.alerts.length === 0) {
          setError('No live disaster alerts available at the moment.');
        }
      } else {
        setError('No live disaster alerts available at the moment.');
      }
    } catch (err) {
      console.error('[useGdacsDisasters Error]', err);
      setError('No live disaster alerts available at the moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load & 10-Minute Auto-Refresh
  useEffect(() => {
    loadAlerts(false);

    const intervalId = setInterval(() => {
      console.log('[useGdacsDisasters] Auto-refreshing 10-minute GDACS feed...');
      loadAlerts(true);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadAlerts]);

  // Filtered & Sorted Alerts List
  const filteredAlerts = useMemo(() => {
    let list = [...rawAlerts];

    // Filter by Disaster Category
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(item => 
        item.disasterType.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search by Country or Disaster Type
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.country.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.disasterType.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q)
      );
    }

    // Sort List
    list.sort((a, b) => {
      if (sortBy === 'severity') {
        const weightA = SEVERITY_WEIGHT[a.severity] || 0;
        const weightB = SEVERITY_WEIGHT[b.severity] || 0;
        if (weightB !== weightA) return weightB - weightA; // Highest severity first
        return (b.rawDate || 0) - (a.rawDate || 0); // then newest
      } else if (sortBy === 'country') {
        return a.country.localeCompare(b.country);
      } else {
        // 'newest' first (default)
        return (b.rawDate || 0) - (a.rawDate || 0);
      }
    });

    return list;
  }, [rawAlerts, selectedCategory, searchQuery, sortBy]);

  // Automatically calculate stats from all raw alerts
  const stats = useMemo(() => {
    return calculateGdacsStats(rawAlerts);
  }, [rawAlerts]);

  // Dynamically generate AI Summary from raw alerts
  const aiSummary = useMemo(() => {
    return generateGdacsAiSummary(rawAlerts);
  }, [rawAlerts]);

  return {
    alerts: filteredAlerts,
    allAlerts: rawAlerts,
    stats,
    aiSummary,
    loading,
    error,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    refresh: () => loadAlerts(true)
  };
}
