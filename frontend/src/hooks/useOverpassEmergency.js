/**
 * frontend/src/hooks/useOverpassEmergency.js
 * Custom ViewModel Hook for OpenStreetMap Overpass Emergency Services
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchNearbyOverpassResources, 
  calculateOverpassCounts,
  fetchIpLocation,
  searchLocationNominatim 
} from '../services/overpassService';

const DEFAULT_LAT = 28.6139; // Default center (New Delhi / India Center)
const DEFAULT_LON = 77.2090;

export function useOverpassEmergency() {
  // Coordinates State
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'locating' | 'located' | 'ip_located' | 'denied' | 'preset'
  const [locationName, setLocationName] = useState('Detecting Location...');

  // Geocoding Search State
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Query Controls
  const [radius, setRadius] = useState(10000); // 10 km default
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'alphabetical' | 'category'
  const [searchQuery, setSearchQuery] = useState('');

  // Data & Async State
  const [rawResources, setRawResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Multi-Stage Resilient GPS & Location Detection
  const requestGpsLocation = useCallback(async () => {
    setLocationStatus('locating');
    setLocationName('Detecting GPS & Network Location...');

    // Helper for IP-based geolocation fallback
    const tryIpFallback = async () => {
      try {
        const ipLoc = await fetchIpLocation();
        if (ipLoc && ipLoc.lat && ipLoc.lon) {
          setCoords({ lat: ipLoc.lat, lon: ipLoc.lon });
          setLocationStatus('ip_located');
          setLocationName(ipLoc.city || `City (Lat: ${ipLoc.lat.toFixed(2)}, Lon: ${ipLoc.lon.toFixed(2)})`);
          return true;
        }
      } catch (e) {
        console.warn('[GPS Hook] IP location fallback failed:', e);
      }
      return false;
    };

    if (!navigator.geolocation) {
      const ok = await tryIpFallback();
      if (!ok) {
        setLocationStatus('denied');
        setLocationName('New Delhi (Default Center)');
      }
      return;
    }

    // Try High Accuracy Geolocation first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus('located');
        setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      async (err) => {
        console.warn('[GPS Hook] High accuracy failed, trying standard accuracy...', err.message);
        // Try low accuracy browser location
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            setLocationStatus('located');
            setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          },
          async (err2) => {
            console.warn('[GPS Hook] Browser location denied/failed. Using IP Geolocation...', err2.message);
            const ok = await tryIpFallback();
            if (!ok) {
              setLocationStatus('denied');
              setLocationName('Location Access Denied (Select City Below)');
            }
          },
          { timeout: 6000, enableHighAccuracy: false }
        );
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  }, []);

  // Search Address / City via Nominatim
  const handleAddressSearch = async (queryText) => {
    setAddressSearchQuery(queryText);
    if (!queryText || queryText.trim().length < 2) {
      setAddressSearchResults([]);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const results = await searchLocationNominatim(queryText);
      setAddressSearchResults(results);
    } catch (e) {
      console.warn('[Address Search Error]', e);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Preset location handler
  const setPresetLocation = (lat, lon, name) => {
    setCoords({ lat, lon });
    setLocationStatus('preset');
    setLocationName(name);
    setAddressSearchResults([]);
    setAddressSearchQuery('');
  };

  // Load Resources from Overpass API
  const loadResources = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchNearbyOverpassResources(coords.lat, coords.lon, radius, forceRefresh);
      if (res.success && Array.isArray(res.resources)) {
        setRawResources(res.resources);
        setLastUpdated(new Date(res.timestamp || Date.now()));
        if (res.resources.length === 0) {
          setError('No emergency resources found nearby. Try increasing the search radius.');
        }
      } else {
        setError('No emergency resources found nearby. Try increasing the search radius.');
      }
    } catch (err) {
      console.error('[useOverpassEmergency Error]', err);
      setError('Failed to load emergency services. Check connection or try again.');
    } finally {
      setLoading(false);
    }
  }, [coords.lat, coords.lon, radius]);

  // Request GPS on initial mount
  useEffect(() => {
    requestGpsLocation();
  }, [requestGpsLocation]);

  // Load resources whenever coordinates or radius change
  useEffect(() => {
    loadResources(false);
  }, [coords.lat, coords.lon, radius, loadResources]);

  // Filtered & Sorted Resource List
  const filteredResources = useMemo(() => {
    let list = [...rawResources];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search by Name, Category, or Address
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.categoryLabel.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
      );
    }

    // Sort List
    list.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'category') {
        return a.categoryLabel.localeCompare(b.categoryLabel);
      } else {
        // 'nearest' first (default)
        return a.distanceKm - b.distanceKm;
      }
    });

    return list;
  }, [rawResources, selectedCategory, searchQuery, sortBy]);

  // Calculate dynamic category counts for Summary Card
  const counts = useMemo(() => {
    return calculateOverpassCounts(rawResources);
  }, [rawResources]);

  return {
    resources: filteredResources,
    allResources: rawResources,
    counts,
    loading,
    error,
    lastUpdated,
    coords,
    setCoords,
    locationStatus,
    locationName,
    requestGpsLocation,
    setPresetLocation,
    addressSearchQuery,
    addressSearchResults,
    isSearchingAddress,
    handleAddressSearch,
    radius,
    setRadius,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    refresh: () => loadResources(true)
  };
}
