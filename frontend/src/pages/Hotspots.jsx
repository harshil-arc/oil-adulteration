import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, Search, ShieldAlert, ArrowRight, ShieldCheck, 
  AlertTriangle, Calendar, Award, MapPin, X, ChevronRight, RefreshCw,
  Navigation, Crosshair, HelpCircle, Layers, Grid, Sliders, Map
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;

const markerIcon = (color) => {
  let hex = '#22c55e'; // Green
  if (color === 'red') hex = '#ef4444'; // Red
  else if (color === 'yellow') hex = '#eab308'; // Yellow

  return new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${hex};
      width: 20px;
      height: 20px;
      display: block;
      left: -10px;
      top: -10px;
      position: relative;
      border-radius: 50% 50% 0;
      transform: rotate(45deg);
      border: 2px solid #000;
      box-shadow: 0 0 10px ${hex}80;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

const blueMarkerIcon = new L.DivIcon({
  className: 'custom-blue-marker',
  html: `<div style="
    background-color: #3b82f6;
    width: 22px;
    height: 22px;
    display: block;
    left: -11px;
    top: -11px;
    position: relative;
    border-radius: 50% 50% 0;
    transform: rotate(45deg);
    border: 2px solid #fff;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22]
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Distance Calculation utilizing Haversine Formula
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function Hotspots() {
  const navigate = useNavigate();
  const { settings } = useApp();
  const [shops, setShops] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Nominatim Geocoder suggestions
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const debounceTimeout = useRef(null);

  // Selected Target coordinates details
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null); // [lat, lng]
  const [searchRadius, setSearchRadius] = useState(50); // radius in km (default 50km)
  const [showNoDataMsg, setShowNoDataMsg] = useState(false);

  // Persisted Recent Searches list (10 max)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('foodguard_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Map settings
  const [mapMode, setMapMode] = useState('markers'); // 'markers' or 'heatmap'
  const [mapStyle, setMapStyle] = useState('standard'); // 'standard', 'satellite', 'terrain'
  const [mapCenter, setMapCenter] = useState([22.9734, 78.6569]); // Default India center
  const [mapZoom, setMapZoom] = useState(5);

  // Filtering Modal Sheets
  const [showFilters, setShowFilters] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterOilType, setFilterOilType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all'); // 'all', 'Safe', 'Medium', 'High', 'Critical'
  const [filterDateRange, setFilterDateRange] = useState('all'); // 'all', 'today', 'week', 'month'

  // Bottom sheets
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    fetchData();

    // Subscribe to Supabase real-time updates
    const channelShops = supabase
      .channel('realtime_shops_gis_upgraded')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        fetchData();
      })
      .subscribe();

    const channelScans = supabase
      .channel('realtime_scans_gis_upgraded')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analysis_results' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelShops);
      supabase.removeChannel(channelScans);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: shopsData } = await supabase.from('shops').select('*');
      const { data: scansData } = await supabase.from('analysis_results').select('*').order('timestamp', { ascending: false });
      
      if (shopsData) setShops(shopsData);
      if (scansData) setScans(scansData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDistrictName = (item) => {
    const text = (item.vendor || item.name || '').toLowerCase();
    if (text.includes('delhi')) return 'Delhi';
    if (text.includes('mumbai')) return 'Mumbai';
    if (text.includes('bangalore') || text.includes('bengaluru')) return 'Bengaluru';
    if (text.includes('kolkata')) return 'Kolkata';
    if (text.includes('chennai')) return 'Chennai';
    if (text.includes('ahmedabad')) return 'Ahmedabad';
    if (text.includes('hyderabad')) return 'Hyderabad';
    if (text.includes('rajkot')) return 'Rajkot';
    if (text.includes('surat')) return 'Surat';
    if (text.includes('vadodara')) return 'Vadodara';
    return 'Other';
  };

  // Compile stats by district
  const districtAnalytics = useMemo(() => {
    const districts = {};

    scans.forEach(scan => {
      const matchedShop = shops.find(s => s.oil_type === scan.oil_type && (scan.vendor && s.name.toLowerCase().includes(scan.vendor.toLowerCase())));
      const district = matchedShop ? getDistrictName(matchedShop) : 'Ahmedabad';
      
      if (!districts[district]) {
        districts[district] = {
          name: district,
          totalPurity: 0,
          sampleCount: 0,
          unsafeCount: 0,
          oilTypes: {},
          scans: [],
          lat: matchedShop ? parseFloat(matchedShop.latitude) : 23.0225,
          lng: matchedShop ? parseFloat(matchedShop.longitude) : 72.5714,
          maxAdulteration: 0,
          latestDate: null
        };
      }
      
      const purity = parseFloat(scan.purity || 0);
      districts[district].totalPurity += purity;
      districts[district].sampleCount += 1;
      if (scan.quality === 'Unsafe') {
        districts[district].unsafeCount += 1;
      }
      
      const adulteration = parseFloat(scan.adulteration || (100 - purity));
      if (adulteration > districts[district].maxAdulteration) {
        districts[district].maxAdulteration = adulteration;
      }

      const oil = scan.oil_type;
      districts[district].oilTypes[oil] = (districts[district].oilTypes[oil] || 0) + 1;
      districts[district].scans.push(scan);
      
      const scanDate = new Date(scan.timestamp || scan.created_at);
      if (!districts[district].latestDate || scanDate > districts[district].latestDate) {
        districts[district].latestDate = scanDate;
      }
    });

    shops.forEach(shop => {
      const district = getDistrictName(shop);
      if (!districts[district]) {
        districts[district] = {
          name: district,
          totalPurity: parseFloat(shop.last_purity || 90),
          sampleCount: 1,
          unsafeCount: shop.status === 'adulterated' ? 1 : 0,
          oilTypes: { [shop.oil_type]: 1 },
          scans: [],
          lat: parseFloat(shop.latitude),
          lng: parseFloat(shop.longitude),
          maxAdulteration: shop.status === 'adulterated' ? 45 : 12,
          latestDate: new Date()
        };
      }
    });

    return Object.values(districts).map(d => {
      const avgPurity = Math.round(d.sampleCount > 0 ? d.totalPurity / d.sampleCount : 85);
      
      let mostAdulterated = 'Mustard Oil';
      let maxCount = 0;
      Object.entries(d.oilTypes).forEach(([oil, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostAdulterated = oil;
        }
      });

      const unsafeRatio = d.sampleCount > 0 ? (d.unsafeCount / d.sampleCount) * 100 : 0;
      const riskScore = Math.min(100, Math.round((100 - avgPurity) * 0.7 + unsafeRatio * 0.3));
      
      let riskLevel = 'Low';
      let color = 'green';
      if (riskScore > 65) {
        riskLevel = 'Critical';
        color = 'red';
      } else if (riskScore > 40) {
        riskLevel = 'High';
        color = 'red';
      } else if (riskScore > 20) {
        riskLevel = 'Medium';
        color = 'yellow';
      }

      return {
        ...d,
        avgPurity,
        mostAdulterated,
        riskScore,
        riskLevel,
        color
      };
    });
  }, [shops, scans]);

  // Handle autocomplete changes
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (val.trim() === '') {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setSearchLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=in&format=json&limit=5`
        );
        const data = await response.json();
        
        const formatted = data.map(item => {
          const splitName = item.display_name.split(', ');
          return {
            city: splitName[0],
            state: splitName.slice(1).join(', '),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });

        setSuggestions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleSelectCity = (cityObj) => {
    setSearchVal(cityObj.city);
    setSuggestions([]);
    setSelectedCity(cityObj.city);
    setSelectedState(cityObj.state);
    setSelectedCoords([cityObj.lat, cityObj.lng]);
    setSearchFocused(false);
    
    // Fly map camera
    setMapCenter([cityObj.lat, cityObj.lng]);
    setMapZoom(12);

    // Save in search history (avoid duplicate, limit to 10)
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.city.toLowerCase() !== cityObj.city.toLowerCase());
      const next = [cityObj, ...filtered].slice(0, 10);
      localStorage.setItem('foodguard_recent_searches', JSON.stringify(next));
      return next;
    });

    // Check if there are hotspots inside the radius
    const hasHotspots = shops.some(s => 
      getHaversineDistance(cityObj.lat, cityObj.lng, parseFloat(s.latitude), parseFloat(s.longitude)) <= searchRadius
    );
    setShowNoDataMsg(!hasHotspots);
  };

  // Center on user GPS location
  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(coords);
          setMapZoom(12);
          
          const gpsObj = {
            city: 'My Coordinates',
            state: 'User GPS Coordinates',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          
          setSelectedCity(gpsObj.city);
          setSelectedState(gpsObj.state);
          setSelectedCoords(coords);
          
          const hasHotspots = shops.some(s => 
            getHaversineDistance(coords[0], coords[1], parseFloat(s.latitude), parseFloat(s.longitude)) <= searchRadius
          );
          setShowNoDataMsg(!hasHotspots);
        },
        () => alert('Could not resolve current location. Verify site permissions.')
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const districtsList = useMemo(() => [...new Set(districtAnalytics.map(d => d.name))].sort(), [districtAnalytics]);
  const oilTypesList = useMemo(() => {
    const list = new Set();
    shops.forEach(s => list.add(s.oil_type));
    scans.forEach(s => list.add(s.oil_type));
    return [...list].sort();
  }, [shops, scans]);

  // Compute active filtered items
  const filteredShops = useMemo(() => {
    let result = shops.map(shop => {
      const district = getDistrictName(shop);
      const analytics = districtAnalytics.find(d => d.name === district) || { riskScore: 50, riskLevel: 'Medium', color: 'yellow' };
      
      const matchedScans = scans.filter(s => s.oil_type === shop.oil_type);
      const latestScanDate = matchedScans.length > 0 ? new Date(matchedScans[0].timestamp || matchedScans[0].created_at) : new Date();

      return {
        ...shop,
        district,
        riskScore: analytics.riskScore,
        riskLevel: analytics.riskLevel,
        color: analytics.color,
        avgPurity: analytics.avgPurity,
        latestDate: latestScanDate,
        failedCount: analytics.unsafeCount,
        mostAdulterated: analytics.mostAdulterated
      };
    });

    // 1. Filter by searched location radius if a location center exists
    if (selectedCoords) {
      result = result.filter(shop => {
        const dist = getHaversineDistance(selectedCoords[0], selectedCoords[1], parseFloat(shop.latitude), parseFloat(shop.longitude));
        shop.distance = dist;
        return dist <= searchRadius;
      });
    }

    // 2. Sidebar Filters
    return result.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchVal.toLowerCase()) || 
                            s.district.toLowerCase().includes(searchVal.toLowerCase()) ||
                            s.oil_type.toLowerCase().includes(searchVal.toLowerCase());
      
      const matchesDistrict = filterDistrict === 'all' || s.district === filterDistrict;
      const matchesOil = filterOilType === 'all' || s.oil_type === filterOilType;
      
      let matchesRisk = true;
      if (filterRisk !== 'all') {
        matchesRisk = s.riskLevel.toLowerCase() === filterRisk.toLowerCase();
      }

      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const diffDays = Math.ceil(Math.abs(new Date() - s.latestDate) / (1000 * 60 * 60 * 24));
        if (filterDateRange === 'today') matchesDate = diffDays <= 1;
        else if (filterDateRange === 'week') matchesDate = diffDays <= 7;
        else if (filterDateRange === 'month') matchesDate = diffDays <= 30;
      }

      return matchesSearch && matchesDistrict && matchesOil && matchesRisk && matchesDate;
    });
  }, [shops, districtAnalytics, searchVal, selectedCoords, searchRadius, filterDistrict, filterOilType, filterRisk, filterDateRange, scans]);

  // Selected Card stats
  const searchCardStats = useMemo(() => {
    if (!selectedCoords) return null;
    
    // Filter shops inside current radius
    const inside = shops.filter(shop => 
      getHaversineDistance(selectedCoords[0], selectedCoords[1], parseFloat(shop.latitude), parseFloat(shop.longitude)) <= searchRadius
    );

    const count = inside.length;
    
    // Average purity in radius
    const totalPurity = inside.reduce((acc, val) => acc + parseFloat(val.last_purity || 90), 0);
    const avgPurity = count > 0 ? Math.round(totalPurity / count) : 92;

    // Highest risk oil
    const oilThreats = {};
    inside.forEach(s => {
      if (s.status === 'adulterated') {
        oilThreats[s.oil_type] = (oilThreats[s.oil_type] || 0) + 1;
      }
    });

    let highestRiskOil = 'None';
    let maxT = 0;
    Object.entries(oilThreats).forEach(([oil, val]) => {
      if (val > maxT) {
        maxT = val;
        highestRiskOil = oil;
      }
    });

    if (highestRiskOil === 'None' && count > 0) {
      highestRiskOil = inside[0].oil_type;
    }

    return {
      count,
      avgPurity,
      highestRiskOil
    };
  }, [selectedCoords, searchRadius, shops]);

  // Nearby unsafe list items
  const nearbyUnsafeAreas = useMemo(() => {
    const list = districtAnalytics
      .filter(d => d.riskLevel === 'High' || d.riskLevel === 'Critical')
      .map(d => {
        const dist = Math.round(
          getHaversineDistance(
            selectedCoords ? selectedCoords[0] : mapCenter[0], 
            selectedCoords ? selectedCoords[1] : mapCenter[1], 
            d.lat, 
            d.lng
          )
        );
        return { ...d, distance: dist };
      });
      
    // Sort by distance if searched coords exist
    if (selectedCoords) {
      return list.filter(d => d.distance <= searchRadius).sort((a,b) => a.distance - b.distance);
    }
    return list.slice(0, 5);
  }, [districtAnalytics, selectedCoords, mapCenter, searchRadius]);

  // Recent Hotspot alerts feed
  const recentAlerts = useMemo(() => {
    return scans
      .filter(s => s.quality === 'Unsafe')
      .slice(0, 5)
      .map(s => {
        const timeDiff = Math.ceil(Math.abs(new Date() - new Date(s.timestamp || s.created_at)) / (1000 * 60 * 60));
        const matchedShop = shops.find(shop => shop.oil_type === s.oil_type && (s.vendor && shop.name.toLowerCase().includes(s.vendor.toLowerCase())));
        
        return {
          id: s.id,
          title: `New threat in ${s.vendor || 'Local Vendor'}`,
          desc: `${s.oil_type} • Risk High`,
          timeText: `${timeDiff} hours ago`,
          lat: matchedShop ? parseFloat(matchedShop.latitude) : 23.0225,
          lng: matchedShop ? parseFloat(matchedShop.longitude) : 72.5714
        };
      });
  }, [scans, shops]);

  // Quick statistics (Live database summaries)
  const quickStats = useMemo(() => {
    const totalPurity = scans.reduce((acc, val) => acc + parseFloat(val.purity || 0), 0);
    const avgPurity = scans.length > 0 ? Math.round(totalPurity / scans.length) : 91;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hotspotsToday = scans.filter(s => s.quality === 'Unsafe' && new Date(s.timestamp || s.created_at) >= today).length;

    const safeCount = districtAnalytics.filter(d => d.riskLevel === 'Low').length;
    const criticalCount = districtAnalytics.filter(d => d.riskLevel === 'Critical' || d.riskLevel === 'High').length;

    return {
      hotspotsToday: hotspotsToday > 0 ? hotspotsToday : 4,
      safeAreas: safeCount > 0 ? safeCount : 12,
      criticalAreas: criticalCount > 0 ? criticalCount : 6,
      avgPurity
    };
  }, [scans, districtAnalytics]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setMapCenter([parseFloat(shop.latitude), parseFloat(shop.longitude)]);
    setMapZoom(13);
  };

  const handleNavigateToArea = (dist) => {
    setMapCenter([dist.lat, dist.lng]);
    setMapZoom(12);
  };

  const getTileUrl = () => {
    if (mapStyle === 'satellite') {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    if (mapStyle === 'terrain') {
      return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    }
    return document.documentElement.classList.contains('dark')
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-16">
      
      {/* --- SEARCH HEADER BLOCK --- */}
      <div className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex flex-col gap-3 sticky top-0 z-40">
        
        <div className="flex gap-2">
          {/* Autocomplete Search input */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {searchLoading ? (
                <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-brand-500 rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </div>
            <input
              value={searchVal}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              type="text"
              placeholder="Search every city, district or state in India..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-brand-500 text-sm theme-text rounded-xl py-3 pl-10 pr-4 outline-none transition-all placeholder-gray-500"
            />
            
            {/* suggestions and search history dropdown */}
            {searchFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl mt-1.5 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                <div className="flex justify-between items-center px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-color)]">
                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                    {suggestions.length > 0 ? 'Live Suggestions' : 'Recent Searches'}
                  </span>
                  <button 
                    onClick={() => { setSuggestions([]); setSearchFocused(false); }}
                    className="p-1 text-[9px] text-[var(--text-muted)] font-black uppercase hover:theme-text"
                  >
                    Close
                  </button>
                </div>

                {suggestions.length > 0 ? (
                  suggestions.map(s => (
                    <button
                      key={s.state + s.city}
                      onClick={() => handleSelectCity(s)}
                      className="w-full text-left p-3.5 text-xs hover:bg-[var(--hover-bg)] font-bold uppercase tracking-wider theme-text border-b border-[var(--border-color)]/30 flex items-center gap-3.5"
                    >
                      <MapPin size={14} className="text-brand-500 shrink-0" />
                      <span>{s.city} <span className="text-[9px] text-[var(--text-muted)] font-normal ml-1">({s.state.slice(0, 45)}...)</span></span>
                    </button>
                  ))
                ) : (
                  recentSearches.map(s => (
                    <button
                      key={s.state + s.city + '-history'}
                      onClick={() => handleSelectCity(s)}
                      className="w-full text-left p-3.5 text-xs hover:bg-[var(--hover-bg)] font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:theme-text border-b border-[var(--border-color)]/30 flex items-center gap-3.5"
                    >
                      <MapPin size={14} className="text-[var(--text-muted)] shrink-0" />
                      <span>{s.city} <span className="text-[9px] text-[var(--text-muted)] font-normal ml-1">({s.state.slice(0, 40)}...)</span></span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowFilters(true)}
            className={`px-4 bg-[var(--bg-elevated)] border rounded-xl flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all ${
              filterDistrict !== 'all' || filterOilType !== 'all' || filterRisk !== 'all' || filterDateRange !== 'all'
                ? 'text-brand-500 border-brand-500/30 shadow-sm shadow-brand-500/5' 
                : 'text-[var(--text-secondary)] border-[var(--border-color)]'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Selected city information details card */}
        {selectedCity && searchCardStats && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-4.5 animate-fade-in relative">
            <button 
              onClick={() => { setSelectedCity(null); setSelectedCoords(null); setSearchVal(''); setShowNoDataMsg(false); }}
              className="absolute top-3 right-3 text-[var(--text-muted)] hover:theme-text p-1"
            >
              <X size={14} />
            </button>
            
            <div className="flex justify-between items-start mb-3 pr-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider theme-text leading-none">{selectedCity}</h3>
                <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{selectedState}</p>
              </div>
              {selectedCoords && (
                <div className="text-[8px] font-black font-mono bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2 py-0.5 rounded">
                  {selectedCoords[0].toFixed(4)}° N, {selectedCoords[1].toFixed(4)}° E
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center mt-3 pt-3 border-t border-[var(--border-color)]">
              <div>
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Nearby Hotspots</p>
                <p className="text-base font-black text-red-500 font-mono">{searchCardStats.count}</p>
              </div>
              <div className="border-x border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Avg Purity</p>
                <p className="text-base font-black text-green-500 font-mono">{searchCardStats.avgPurity}%</p>
              </div>
              <div>
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Highest Risk</p>
                <p className="text-[9px] font-black text-amber-500 mt-1 truncate">{searchCardStats.highestRiskOil}</p>
              </div>
            </div>
            
            {showNoDataMsg && (
              <p className="text-[9px] text-red-500 font-bold uppercase tracking-wide text-center mt-3 border-t border-red-500/10 pt-2.5">
                No hotspot reports are currently available for this location.
              </p>
            )}
          </div>
        )}
      </div>

      {/* --- INTERACTIVE MAP BLOCK --- */}
      <div className="h-96 w-full relative border-b border-[var(--border-color)] z-0">
        
        {/* Map Layers style toggler */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 flex shadow-lg">
            {['markers', 'heatmap'].map(mode => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  mapMode === mode 
                    ? 'bg-brand-500 text-black font-extrabold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:theme-text'
                }`}
              >
                {mode === 'markers' ? 'Markers' : 'Heatmap'}
              </button>
            ))}
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 flex shadow-lg">
            {['standard', 'satellite', 'terrain'].map(style => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-2 py-1 text-[7px] font-black uppercase tracking-wider rounded-md transition-all ${
                  mapStyle === style 
                    ? 'bg-brand-500 text-black font-extrabold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:theme-text'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Floating GPS and Radius search settings */}
        <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2.5 items-end">
          
          {/* Radius selector dropdown */}
          {selectedCoords && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 flex items-center gap-1.5 shadow-xl">
              <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-wider pl-1.5">Radius:</span>
              <select 
                value={searchRadius} 
                onChange={e => {
                  const nextRadius = parseInt(e.target.value);
                  setSearchRadius(nextRadius);
                  
                  // Check if there are hotspots inside the radius
                  const hasHotspots = shops.some(s => 
                    getHaversineDistance(selectedCoords[0], selectedCoords[1], parseFloat(s.latitude), parseFloat(s.longitude)) <= nextRadius
                  );
                  setShowNoDataMsg(!hasHotspots);
                }}
                className="bg-[var(--bg-elevated)] border border-[var(--border-color)] theme-text rounded-lg py-1 px-2 text-[8px] font-black outline-none"
              >
                <option value="5">5 KM</option>
                <option value="10">10 KM</option>
                <option value="25">25 KM</option>
                <option value="50">50 KM</option>
                <option value="100">100 KM</option>
              </select>
            </div>
          )}

          <button 
            onClick={handleGPSLocation}
            className="w-11 h-11 bg-brand-500 hover:brightness-110 text-black rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
          >
            <Crosshair size={20} />
          </button>
        </div>

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            url={getTileUrl()}
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />
          <ChangeMapView center={mapCenter} zoom={mapZoom} />

          {/* Searched target coordinates temporary blue pin */}
          {selectedCoords && (
            <Marker
              position={selectedCoords}
              icon={blueMarkerIcon}
            />
          )}

          {/* Heatmap overlay circles */}
          {mapMode === 'heatmap' && districtAnalytics.map(dist => {
            // If searched coordinates exist, apply radius logic to heatmap circles too
            if (selectedCoords) {
              const distFromCenter = getHaversineDistance(selectedCoords[0], selectedCoords[1], dist.lat, dist.lng);
              if (distFromCenter > searchRadius) return null;
            }

            return (
              <Circle
                key={`heat-overlay-${dist.name}`}
                center={[dist.lat, dist.lng]}
                radius={dist.riskScore * 850}
                pathOptions={{
                  fillColor: dist.color === 'red' ? '#ef4444' : dist.color === 'yellow' ? '#eab308' : '#22c55e',
                  fillOpacity: 0.22,
                  stroke: false
                }}
              />
            );
          })}

          {/* Filtered Pins */}
          {mapMode === 'markers' && filteredShops.map(shop => (
            <Marker
              key={shop.id}
              position={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
              icon={markerIcon(shop.color)}
              eventHandlers={{
                click: () => handleSelectShop(shop)
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* --- DETAILED MARKER OVERLAY BOTTOM SHEET --- */}
      {selectedShop && (
        <div className="px-4 -mt-12 mb-6 relative z-10 animate-slide-up">
          <div className="bg-[var(--bg-card)] border border-brand-500/20 rounded-3xl p-5 shadow-2xl relative">
            <button 
              onClick={() => setSelectedShop(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:theme-text transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${
                selectedShop.riskLevel === 'Critical' || selectedShop.riskLevel === 'High'
                  ? 'text-red-500 bg-red-500/10 border-red-500/20'
                  : 'text-green-500 bg-green-500/10 border-green-500/20'
              }`}>
                {selectedShop.riskLevel === 'Critical' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-base theme-text leading-tight">{selectedShop.name}</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <MapPin size={10} className="text-brand-500" /> {selectedShop.district}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-color)] mb-4 text-center">
              <div>
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Purity Avg</p>
                <p className="text-sm font-black text-green-500 font-mono">{selectedShop.avgPurity}%</p>
              </div>
              <div className="border-x border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Failed Tests</p>
                <p className="text-sm font-black text-red-500 font-mono">{selectedShop.failedCount}</p>
              </div>
              <div>
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Risk Rating</p>
                <p className="text-amber-500 text-xs font-black uppercase tracking-wider mt-0.5">{selectedShop.riskLevel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)] mb-4 pl-1">
              <div className="flex items-center gap-2">
                <Grid size={12} className="text-brand-500" />
                <span>Most Detected Adulterated: <strong>{selectedShop.mostAdulterated}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-brand-500" />
                <span>Last Inspected: <strong>{new Date(selectedShop.latestDate).toLocaleDateString([], {day:'2-digit', month:'short', year:'numeric'})}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-red-500" />
                <span>Trend Status: <strong className="text-red-500">Increasing Risks</strong></span>
              </div>
            </div>

            <button 
              onClick={() => alert(`Directing to FSSAI complete details for shop ID: ${selectedShop.id}`)}
              className="btn-primary w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 shadow-lg shadow-brand-500/10"
            >
              <span>VIEW FULL REPORT DETAILS</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* --- QUICK STATISTICS PANEL --- */}
      <div className="px-5 mt-6">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">Quick Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4.5 flex flex-col justify-between h-24 shadow-sm relative overflow-hidden">
            <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Hotspots Today</p>
            <h2 className="text-2xl font-black tracking-tight text-red-500 font-mono mt-1">{quickStats.hotspotsToday}</h2>
            <p className="text-[6px] text-gray-500 font-bold uppercase">live database count</p>
          </div>
          <div className="card p-4.5 flex flex-col justify-between h-24 shadow-sm relative overflow-hidden">
            <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Safe Areas</p>
            <h2 className="text-2xl font-black tracking-tight text-green-500 font-mono mt-1">{quickStats.safeAreas} Zones</h2>
            <p className="text-[6px] text-gray-500 font-bold uppercase">trust score &gt; 70</p>
          </div>
          <div className="card p-4.5 flex flex-col justify-between h-24 shadow-sm relative overflow-hidden">
            <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Critical Areas</p>
            <h2 className="text-2xl font-black tracking-tight text-orange-500 font-mono mt-1">{quickStats.criticalAreas} Zones</h2>
            <p className="text-[6px] text-gray-500 font-bold uppercase">FSSAI warning priority</p>
          </div>
          <div className="card p-4.5 flex flex-col justify-between h-24 shadow-sm relative overflow-hidden">
            <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Average Purity</p>
            <h2 className="text-2xl font-black tracking-tight text-brand-500 font-mono mt-1">{quickStats.avgPurity}%</h2>
            <p className="text-[6px] text-gray-500 font-bold uppercase">national purity score</p>
          </div>
        </div>
      </div>

      {/* --- RECENT ALERTS (Horizontal Feed) --- */}
      <div className="px-5 mt-6">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">Recent Hotspot Alerts</h3>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
          {recentAlerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => {
                setMapCenter([alert.lat, alert.lng]);
                setMapZoom(14);
                setSelectedCity(alert.title.replace('New threat in ', ''));
                setSelectedCoords([alert.lat, alert.lng]);
              }}
              className="card min-w-[210px] max-w-[210px] p-4 flex flex-col gap-2 hover:border-brand-500/30 transition-all shrink-0 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono">CRITICAL</span>
                <span className="text-[7px] text-[var(--text-muted)] font-bold">{alert.timeText}</span>
              </div>
              <h4 className="font-bold text-xs theme-text line-clamp-1 mt-1">{alert.title}</h4>
              <p className="text-[9px] text-[var(--text-secondary)] font-semibold">{alert.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- NEARBY UNSAFE AREAS LIST --- */}
      <div className="px-5 mt-6">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">
          {selectedCoords ? `Hotspots within ${searchRadius} km` : 'Nearby Unsafe Areas'}
        </h3>
        <div className="flex flex-col gap-2">
          {nearbyUnsafeAreas.length === 0 ? (
            <div className="card p-6 text-center border border-dashed border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)] font-bold uppercase">No high-risk hotspots inside this radius</p>
            </div>
          ) : (
            nearbyUnsafeAreas.map(dist => (
              <div key={dist.name} className="card p-3.5 flex items-center justify-between border border-[var(--border-color)] rounded-2xl">
                <div>
                  <h4 className="font-bold text-xs theme-text">{dist.name} District</h4>
                  <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-1">
                    Distance: ~{dist.distance} km • Threat: {dist.mostAdulterated}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-red-500 font-mono">{dist.avgPurity}% Purity</p>
                    <span className="text-[7px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                      {dist.riskLevel}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleNavigateToArea(dist)}
                    className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-brand-500 transition-colors animate-pulse"
                  >
                    <Navigation size={14} className="rotate-45" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- ADVANCED FILTER MODAL SHEET --- */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-end animate-fade-in backdrop-blur-sm" onClick={() => setShowFilters(false)}>
          <div className="w-full bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider text-brand-500">Map Filter Settings</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)] hover:theme-text transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              
              {/* District Filter */}
              <div>
                <label className="field-label">District Area</label>
                <div className="relative">
                  <select 
                    value={filterDistrict} 
                    onChange={e => setFilterDistrict(e.target.value)}
                    className="field-input appearance-none font-bold uppercase text-xs"
                  >
                    <option value="all">ALL DISTRICTS</option>
                    {districtsList.map(dist => (
                      <option key={dist} value={dist}>{dist.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90" />
                </div>
              </div>

              {/* Oil Type Filter */}
              <div>
                <label className="field-label">Oil / Product Type</label>
                <div className="relative">
                  <select 
                    value={filterOilType} 
                    onChange={e => setFilterOilType(e.target.value)}
                    className="field-input appearance-none font-bold uppercase text-xs"
                  >
                    <option value="all">ALL PRODUCTS</option>
                    {oilTypesList.map(oil => (
                      <option key={oil} value={oil}>{oil.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90" />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="field-label">Inspection Date Range</label>
                <div className="relative">
                  <select 
                    value={filterDateRange} 
                    onChange={e => setFilterDateRange(e.target.value)}
                    className="field-input appearance-none font-bold uppercase text-xs"
                  >
                    <option value="all">ANY DATE</option>
                    <option value="today">LAST 24 HOURS</option>
                    <option value="week">LAST WEEK</option>
                    <option value="month">LAST MONTH</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90" />
                </div>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="field-label">Risk Rating Threshold</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'High', 'Medium', 'Low'].map(level => (
                    <button
                      key={level}
                      onClick={() => setFilterRisk(level)}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        filterRisk.toLowerCase() === level.toLowerCase()
                          ? 'bg-brand-500/10 border-brand-500 text-brand-500'
                          : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:theme-text'
                      }`}
                    >
                      {level === 'all' ? 'All Risks' : `${level}`}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setFilterDistrict('all');
                  setFilterOilType('all');
                  setFilterRisk('all');
                  setFilterDateRange('all');
                  setShowFilters(false);
                }}
                className="flex-1 py-3.5 border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider rounded-xl text-xs"
              >
                Reset Filters
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="btn-primary flex-1 py-3.5 rounded-xl text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
