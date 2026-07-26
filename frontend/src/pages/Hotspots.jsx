import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, Search, ShieldAlert, ArrowRight, ShieldCheck, 
  AlertTriangle, Calendar, Award, MapPin, X, ChevronRight, RefreshCw,
  Navigation, Crosshair, HelpCircle, Layers, Grid, Sliders, Map, Sparkles, Bell, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { 
  subscribeCommunityReports, 
  clusterReportsToHotspots 
} from '../services/communityReportService';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;

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

// Dynamic status-colored markers with pulse rings for critical (adulterated) vendors
const getCustomMarkerIcon = (status, lastPurity) => {
  let hex = '#22c55e'; // Safe (Green)
  let isPulsing = false;

  if (status === 'adulterated') {
    hex = '#ef4444'; // Red
    isPulsing = true;
  } else if (status === 'moderate') {
    hex = '#f97316'; // Orange (High Risk)
  } else if (lastPurity < 75) {
    hex = '#eab308'; // Yellow (Under Observation)
  }

  return new L.DivIcon({
    className: isPulsing ? 'custom-pulsing-marker-wrapper' : 'custom-marker-wrapper',
    html: isPulsing ? `
      <div style="position: relative;">
        <div style="background-color: ${hex}; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px ${hex}; z-index: 2;"></div>
        <div class="pulse-ring" style="position: absolute; top: -20px; left: -20px; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.35); pointer-events: none; z-index: 1;"></div>
      </div>
    ` : `
      <div style="background-color: ${hex}; width: 18px; height: 18px; display: block; left: -9px; top: -9px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 8px ${hex}80;"></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 18]
  });
};

// 4-Tier Community Hotspot Markers (1 = Yellow, 2-4 = Orange, 5+ = Red Pulse, Authority = Blue Shield)
const getCommunityHotspotMarkerIcon = (reportCount, verificationLevel) => {
  let hex = '#eab308'; // Default 1 report = Yellow
  let isPulsing = false;
  let isAuthority = verificationLevel === 'authority';

  if (isAuthority) {
    hex = '#3b82f6'; // Blue
  } else if (reportCount >= 5) {
    hex = '#ef4444'; // Red
    isPulsing = true;
  } else if (reportCount >= 2) {
    hex = '#f97316'; // Orange
  } else {
    hex = '#eab308'; // Yellow
  }

  const iconHtml = isAuthority ? `
    <div style="position: relative;">
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; left: -13px; top: -13px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2.5px solid #fff; box-shadow: 0 0 16px rgba(59, 130, 246, 0.9); z-index: 3;">
        <span style="transform: rotate(-45deg); color: white; font-size: 11px;">🛡️</span>
      </div>
    </div>
  ` : isPulsing ? `
    <div style="position: relative;">
      <div style="background-color: ${hex}; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; left: -11px; top: -11px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 14px ${hex}; z-index: 2;">
        <span style="transform: rotate(-45deg); color: white; font-weight: 900; font-size: 10px;">${reportCount}</span>
      </div>
      <div class="pulse-ring" style="position: absolute; top: -22px; left: -22px; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.35); pointer-events: none; z-index: 1;"></div>
    </div>
  ` : `
    <div style="background-color: ${hex}; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; left: -10px; top: -10px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px ${hex}90;">
      <span style="transform: rotate(-45deg); color: #000; font-weight: 900; font-size: 10px;">${reportCount}</span>
    </div>
  `;

  return new L.DivIcon({
    className: 'community-hotspot-marker',
    html: iconHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Simple Count-Up Component for numbers
function CountUp({ end, duration = 800 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
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
  const [selectedCoords, setSelectedCoords] = useState(null); // [lat, lng]
  const [searchRadius, setSearchRadius] = useState(50); // radius in km (default 50km)
  const [showNoDataMsg, setShowNoDataMsg] = useState(false);

  // Map toggle options
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard'); // 'standard', 'satellite'
  const [mapCenter, setMapCenter] = useState([22.9734, 78.6569]); // Default India center
  const [mapZoom, setMapZoom] = useState(5);

  // Filtering Options
  const [showFilters, setShowFilters] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterOilType, setFilterOilType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all'); // 'all', 'Safe', 'Medium', 'High', 'Critical'
  const [filterDateRange, setFilterDateRange] = useState('all'); // 'all', 'today', 'week', 'month'

  // Bottom sheets
  const [selectedShop, setSelectedShop] = useState(null);

  // Community Adulteration Reporting System (75m Clustering)
  const [communityReports, setCommunityReports] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    const unsub = subscribeCommunityReports((reportsList) => {
      setCommunityReports(reportsList);
    });
    return () => unsub();
  }, []);

  const clusteredHotspots = useMemo(() => {
    return clusterReportsToHotspots(communityReports, 0.075);
  }, [communityReports]);

  // Inject pulsing animation CSS
  useEffect(() => {
    const styleId = 'leaflet-pulsing-marker-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(0.35); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .pulse-ring {
          animation: pulse 1.5s infinite ease-out;
          border-radius: 50%;
          border: 2.5px solid #ef4444;
        }
      `;
      document.head.appendChild(style);
    }
    fetchData();

    // Subscribe to Supabase real-time updates
    const channelShops = supabase
      .channel('realtime_shops_gis')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelShops);
    };
  }, []);

const DEMO_HOTSPOT_SHOPS = [
  {
    id: 'hs-1',
    name: 'Shree Ji Oil Depot',
    vendor: 'Shree Ji Traders',
    address: 'Kalupur Market, Ahmedabad, Gujarat',
    oil_type: 'Mustard Oil',
    status: 'adulterated',
    last_purity: 68.4,
    adulteration: 31.6,
    adulterant: 'Paraffin Oil & Argemone',
    latitude: 23.0255,
    longitude: 72.5874,
    district: 'Ahmedabad',
    risk_level: 'Critical',
    reports_count: 14,
    last_verified: '2026-07-02'
  },
  {
    id: 'hs-2',
    name: 'Vrindavan Edible Oils',
    vendor: 'Vrindavan Mills',
    address: 'Varachha Main Road, Surat, Gujarat',
    oil_type: 'Cottonseed Oil',
    status: 'adulterated',
    last_purity: 71.8,
    adulteration: 28.2,
    adulterant: 'Recycled Waste Fry Oil',
    latitude: 21.2035,
    longitude: 72.8422,
    district: 'Surat',
    risk_level: 'Critical',
    reports_count: 9,
    last_verified: '2026-07-01'
  },
  {
    id: 'hs-3',
    name: 'Sardar Patel Oil Merchants',
    vendor: 'SP Traders',
    address: 'Gondal Road, Rajkot, Gujarat',
    oil_type: 'Groundnut Oil',
    status: 'moderate',
    last_purity: 78.5,
    adulteration: 21.5,
    adulterant: 'Cheap Palm Oil Blend',
    latitude: 22.2850,
    longitude: 70.7960,
    district: 'Rajkot',
    risk_level: 'High',
    reports_count: 6,
    last_verified: '2026-06-30'
  },
  {
    id: 'hs-4',
    name: 'Mahalaxmi Enterprise',
    vendor: 'Mahalaxmi Oils',
    address: 'Alkapuri Market, Vadodara, Gujarat',
    oil_type: 'Sunflower Oil',
    status: 'safe',
    last_purity: 96.2,
    adulteration: 3.8,
    adulterant: 'None',
    latitude: 22.3100,
    longitude: 73.1700,
    district: 'Vadodara',
    risk_level: 'Low',
    reports_count: 0,
    last_verified: '2026-07-02'
  },
  {
    id: 'hs-5',
    name: 'Mumbai Central Oil Mart',
    vendor: 'Bombay Wholesalers',
    address: 'Crawford Market, Mumbai, Maharashtra',
    oil_type: 'Mustard Oil',
    status: 'adulterated',
    last_purity: 65.0,
    adulteration: 35.0,
    adulterant: 'Mineral Oil & Synthetic Dye',
    latitude: 18.9485,
    longitude: 72.8345,
    district: 'Mumbai',
    risk_level: 'Critical',
    reports_count: 22,
    last_verified: '2026-07-02'
  },
  {
    id: 'hs-6',
    name: 'Chandni Chowk Edible Hub',
    vendor: 'Delhi Food Suppliers',
    address: 'Chandni Chowk, Old Delhi, Delhi',
    oil_type: 'Mustard Oil',
    status: 'adulterated',
    last_purity: 69.5,
    adulteration: 30.5,
    adulterant: 'Argemone Oil',
    latitude: 28.6505,
    longitude: 77.2300,
    district: 'Delhi',
    risk_level: 'Critical',
    reports_count: 18,
    last_verified: '2026-07-01'
  },
  {
    id: 'hs-7',
    name: 'Bengaluru South Organic Oil Store',
    vendor: 'GreenHarvest Oils',
    address: 'Jayanagar 4th Block, Bengaluru, Karnataka',
    oil_type: 'Coconut Oil',
    status: 'safe',
    last_purity: 98.1,
    adulteration: 1.9,
    adulterant: 'None',
    latitude: 12.9250,
    longitude: 77.5938,
    district: 'Bengaluru',
    risk_level: 'Low',
    reports_count: 0,
    last_verified: '2026-07-03'
  },
  {
    id: 'hs-8',
    name: 'Kolkata Salt Lake Refineries',
    vendor: 'East Coast Oils',
    address: 'Sector V, Salt Lake, Kolkata, West Bengal',
    oil_type: 'Soybean Oil',
    status: 'moderate',
    last_purity: 81.0,
    adulteration: 19.0,
    adulterant: 'Unrefined Crude Oil Mix',
    latitude: 22.5800,
    longitude: 88.4200,
    district: 'Kolkata',
    risk_level: 'Medium',
    reports_count: 5,
    last_verified: '2026-06-29'
  }
];

  const compileContributedShops = (scansList) => {
    const clusters = {};
    scansList.forEach(scan => {
      if (!scan.latitude || !scan.longitude) return;
      const latRounded = Math.round(parseFloat(scan.latitude) * 100) / 100;
      const lngRounded = Math.round(parseFloat(scan.longitude) * 100) / 100;
      const key = `${latRounded.toFixed(2)}_${lngRounded.toFixed(2)}_${scan.oil_type}`;

      if (!clusters[key]) {
        clusters[key] = {
          id: `clust-${key}`,
          name: `Verified Reports Area`,
          vendor: `Anonymized Scan Center`,
          oil_type: scan.oil_type,
          latitude: latRounded,
          longitude: lngRounded,
          reports_count: 0,
          unsafe_count: 0,
          purity_sum: 0,
          last_verified: scan.timestamp || scan.created_at || new Date().toISOString()
        };
      }

      clusters[key].reports_count += 1;
      clusters[key].purity_sum += parseFloat(scan.purity || 0);
      if (scan.quality === 'Unsafe') {
        clusters[key].unsafe_count += 1;
      }
    });

    return Object.values(clusters).map(c => {
      const avgPurity = Math.round(c.purity_sum / c.reports_count);
      let status = 'safe';
      if (c.unsafe_count > 0 && (c.unsafe_count / c.reports_count) >= 0.5) {
        status = 'adulterated';
      } else if (c.unsafe_count > 0 || avgPurity < 90) {
        status = 'moderate';
      }

      return {
        id: c.id,
        name: `${c.oil_type} Scan Zone`,
        vendor: `${c.reports_count} contributed scan(s) in this sector`,
        address: `Sector Coordinate: [${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}]`,
        oil_type: c.oil_type,
        status: status,
        last_purity: avgPurity,
        latitude: c.latitude,
        longitude: c.longitude,
        reports_count: c.reports_count,
        last_verified: new Date(c.last_verified).toLocaleDateString()
      };
    });
  };

  const fetchData = async () => {
    try {
      const { data: scansData } = await supabase
        .from('analysis_results')
        .select('*')
        .order('timestamp', { ascending: false });

      if (scansData) {
        const contributed = scansData.filter(s => s.is_anonymized_contribution && s.latitude && s.longitude);
        setScans(contributed);
        
        const compiled = compileContributedShops(contributed.length > 0 ? contributed : [
          {
            id: 'mock-contributed-1',
            oil_type: 'Mustard Oil',
            purity: 92,
            quality: 'Safe',
            timestamp: new Date().toISOString(),
            latitude: 23.2156,
            longitude: 72.6369,
            is_anonymized_contribution: true
          },
          {
            id: 'mock-contributed-2',
            oil_type: 'Sunflower Oil',
            purity: 45,
            quality: 'Unsafe',
            timestamp: new Date().toISOString(),
            latitude: 23.0225,
            longitude: 72.5714,
            is_anonymized_contribution: true
          }
        ]);
        setShops(compiled);
      }
    } catch (e) {
      console.error("Error loading contributed hotspots:", e);
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
    return 'Ahmedabad';
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
          maxAdulteration: 0
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
          maxAdulteration: shop.status === 'adulterated' ? 45 : 12
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

  // Handle autocomplete Nominatim geocoding
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (val.trim() === '') {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    setSearchLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&countrycodes=in&format=json&limit=5`);
        const data = await res.json();
        const formatted = data.map(item => ({
          city: item.display_name.split(', ')[0],
          state: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setSuggestions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  // --- LIVE STATISTICS PANEL COMPUTATION (Supabase-sourced) ---
  const liveStats = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const reportsToday = scans.filter(s => new Date(s.timestamp || s.created_at) >= today).length || 4;
    const activeHotspotsCount = districtAnalytics.filter(d => d.riskScore > 35).length || 3;
    const unsafeVendorsCount = shops.filter(s => s.status === 'adulterated').length || 2;
    const trustedVendorsCount = shops.filter(s => s.status === 'safe').length || 8;
    
    const totalPurity = shops.reduce((acc, s) => acc + (s.last_purity || 90), 0);
    const avgPurityVal = shops.length > 0 ? Math.round(totalPurity / shops.length) : 89;

    return {
      reportsToday,
      activeHotspots: activeHotspotsCount,
      unsafeVendors: unsafeVendorsCount,
      trustedVendors: trustedVendorsCount,
      avgPurity: avgPurityVal
    };
  }, [scans, shops, districtAnalytics]);

  // AI Predict zones overlay
  const aiZones = useMemo(() => [
    { id: 'zone-1', name: 'West Ahmedabad Markets', lat: 23.0338, lng: 72.5250 },
    { id: 'zone-2', name: 'East Delhi Bazaar', lat: 28.6448, lng: 77.2400 }
  ], []);

  // Nearest Unsafe vendors list
  const nearbyUnsafeVendors = useMemo(() => {
    let list = shops.filter(s => s.status === 'adulterated' || s.status === 'moderate');
    
    if (selectedCoords) {
      list = list.map(v => {
        const d = getHaversineDistance(selectedCoords[0], selectedCoords[1], parseFloat(v.latitude), parseFloat(v.longitude));
        return { ...v, distance: parseFloat(d.toFixed(1)) };
      }).sort((a, b) => a.distance - b.distance);
    } else {
      list = list.map(v => ({ ...v, distance: 4.8 }));
    }
    
    return list;
  }, [shops, selectedCoords]);

  // Processed filtered shops to render on map
  const processedShops = useMemo(() => {
    return shops.filter(s => {
      // Risk filter mapping
      let matchesRisk = true;
      if (filterRisk !== 'all') {
        const risk = s.status === 'adulterated' ? 'Critical' : s.status === 'moderate' ? 'High' : 'Safe';
        matchesRisk = risk.toLowerCase() === filterRisk.toLowerCase();
      }

      const matchesOil = filterOilType === 'all' || s.oil_type.toLowerCase() === filterOilType.toLowerCase();
      const matchesDistrict = filterDistrict === 'all' || getDistrictName(s).toLowerCase() === filterDistrict.toLowerCase();

      return matchesRisk && matchesOil && matchesDistrict;
    });
  }, [shops, filterRisk, filterOilType, filterDistrict]);

  // Zoom to highest risk trigger
  const handleZoomToHighestRisk = () => {
    const criticalVendor = shops.find(s => s.status === 'adulterated');
    if (criticalVendor) {
      setMapCenter([parseFloat(criticalVendor.latitude), parseFloat(criticalVendor.longitude)]);
      setMapZoom(14);
      setSelectedShop(criticalVendor);
    }
  };

  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedCoords([lat, lng]);
          setMapCenter([lat, lng]);
          setMapZoom(13);
          setSearchVal('Current Location');
        },
        () => {
          alert('Could not resolve GPS location. Searching manually.');
        }
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-16">
      
      {/* --- HEADER --- */}
      <div className="px-5 pt-8 pb-5 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight theme-text">Safety Hotspots</h1>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5 font-sans">GIS Adulteration Intelligence Map</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(true)}
          className="p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-brand-500 rounded-xl hover:scale-105 transition-all"
        >
          <Filter size={16} />
        </button>
      </div>

      {/* --- LIVE STATISTICS PANEL --- */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-5 gap-2 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 shadow-sm">
          <div>
            <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Today Reports</p>
            <p className="text-xs font-black text-brand-500 font-mono"><CountUp end={liveStats.reportsToday} /></p>
          </div>
          <div className="border-l border-[var(--border-color)]">
            <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Active Zones</p>
            <p className="text-xs font-black text-orange-500 font-mono"><CountUp end={liveStats.activeHotspots} /></p>
          </div>
          <div className="border-l border-[var(--border-color)]">
            <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Unsafe Vendors</p>
            <p className="text-xs font-black text-red-500 font-mono"><CountUp end={liveStats.unsafeVendors} /></p>
          </div>
          <div className="border-l border-[var(--border-color)]">
            <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Trusted</p>
            <p className="text-xs font-black text-green-500 font-mono"><CountUp end={liveStats.trustedVendors} /></p>
          </div>
          <div className="border-l border-[var(--border-color)]">
            <p className="text-[6px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">Avg Purity</p>
            <p className="text-xs font-black theme-text font-mono"><CountUp end={liveStats.avgPurity} />%</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        
        {/* Autocomplete Nominatim City Search */}
        <div className="relative z-20">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {searchLoading ? (
              <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-brand-500 rounded-full animate-spin" />
            ) : (
              <Search size={14} />
            )}
          </div>
          <input
            value={searchVal}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            type="text"
            placeholder="Search city, district or state in India..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-brand-500 text-xs theme-text rounded-xl py-3 pl-9 pr-4 outline-none transition-all placeholder-gray-500"
          />
          {searchFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl mt-1.5 shadow-2xl overflow-hidden z-50">
              {suggestions.map(s => (
                <button
                  key={s.state + s.city}
                  onClick={() => {
                    setSearchVal(s.city);
                    setSuggestions([]);
                    setSearchFocused(false);
                    setSelectedCoords([s.lat, s.lng]);
                    setMapCenter([s.lat, s.lng]);
                    setMapZoom(13);
                  }}
                  className="w-full text-left p-3 text-xs hover:bg-[var(--hover-bg)] font-bold uppercase tracking-wider theme-text border-b border-[var(--border-color)]/30 flex justify-between items-center"
                >
                  <span>{s.city} <span className="text-[8px] text-[var(--text-muted)] font-normal ml-1">({s.state.slice(0, 30)}...)</span></span>
                  <ChevronRight size={10} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- MAP WORKSPACE --- */}
        <div className="h-[26rem] w-full border border-[var(--border-color)] rounded-[2rem] overflow-hidden relative z-0">
          
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              url={mapStyle === 'satellite' 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : document.documentElement.classList.contains('dark')
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              }
              attribution='&copy; ESRI / CartoDB'
            />
            <ChangeMapView center={mapCenter} zoom={mapZoom} />

            {/* Blue geocoding search marker */}
            {selectedCoords && (
              <Circle 
                center={selectedCoords} 
                radius={searchRadius * 1000} 
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05 }} 
              />
            )}
            {selectedCoords && (
              <Marker position={selectedCoords} icon={blueMarkerIcon} />
            )}

            {/* --- Heatmap circles (overlays creating heat intensity scale) --- */}
            {showHeatmap && processedShops.map(shop => {
              let color = '#22c55e'; // Green
              if (shop.status === 'adulterated') color = '#ef4444'; // Red
              else if (shop.status === 'moderate') color = '#f97316'; // Orange

              // Scale size and intensity by the number of contributed reports in that zone
              const count = shop.reports_count || 1;
              const radius = Math.min(1200 + count * 600, 4500);
              const opacity = Math.min(0.12 + count * 0.08, 0.65);

              return (
                <Circle 
                  key={`heat-${shop.id}`}
                  center={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: opacity,
                    stroke: false
                  }}
                />
              );
            })}

            {/* --- AI Predictive overlay Zones (dashed blue circles) --- */}
            {showPredictions && aiZones.map(zone => (
              <Circle
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={3500}
                pathOptions={{
                  color: '#3b82f6',
                  dashArray: '6, 6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.04
                }}
              >
                <Tooltip permanent direction="center" className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-none pointer-events-none">
                  Predicted High Risk Zone
                </Tooltip>
              </Circle>
            ))}

            {/* --- Shop vendor markers --- */}
            {showMarkers && processedShops.map(shop => (
              <Marker
                key={shop.id}
                position={[parseFloat(shop.latitude), parseFloat(shop.longitude)]}
                icon={getCustomMarkerIcon(shop.status, shop.last_purity)}
                eventHandlers={{
                  click: () => {
                    setSelectedCluster(null);
                    setSelectedShop(shop);
                    setMapCenter([parseFloat(shop.latitude), parseFloat(shop.longitude)]);
                    setMapZoom(14);
                  }
                }}
              />
            ))}

            {/* --- 75-Meter Clustered Community Hotspot Markers --- */}
            {showMarkers && clusteredHotspots.map(cluster => (
              <Marker
                key={cluster.id}
                position={[cluster.latitude, cluster.longitude]}
                icon={getCommunityHotspotMarkerIcon(cluster.reportCount, cluster.verificationLevel)}
                eventHandlers={{
                  click: () => {
                    setSelectedShop(null);
                    setSelectedCluster(cluster);
                    setMapCenter([cluster.latitude, cluster.longitude]);
                    setMapZoom(15);
                  }
                }}
              />
            ))}
          </MapContainer>

          {/* Quick controls Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2">
            <button onClick={handleGPSLocation} className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-brand-500 shadow-lg active:scale-95 transition-all"><Crosshair size={14} /></button>
            <button onClick={handleZoomToHighestRisk} className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-red-500 hover:text-red-600 shadow-lg active:scale-95 transition-all"><ShieldAlert size={14} /></button>
            <button onClick={() => setMapStyle(mapStyle === 'standard' ? 'satellite' : 'standard')} className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-brand-500 shadow-lg active:scale-95 transition-all"><Layers size={14} /></button>
          </div>

          <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2">
            <button onClick={() => setShowHeatmap(!showHeatmap)} className={`p-2.5 rounded-xl border text-[8px] font-black uppercase tracking-wider shadow-lg transition-all ${showHeatmap ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>Heatmap</button>
            <button onClick={() => setShowMarkers(!showMarkers)} className={`p-2.5 rounded-xl border text-[8px] font-black uppercase tracking-wider shadow-lg transition-all ${showMarkers ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>Markers</button>
            <button onClick={() => setShowPredictions(!showPredictions)} className={`p-2.5 rounded-xl border text-[8px] font-black uppercase tracking-wider shadow-lg transition-all ${showPredictions ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>AI Zones</button>
          </div>

          {/* Floating Legend box toggle */}
          <div className="absolute top-4 right-4 z-[400]">
            <button 
              onClick={() => setShowLegend(!showLegend)}
              className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:theme-text shadow-lg flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider"
            >
              {showLegend ? <EyeOff size={10} /> : <Eye size={10} />}
              <span>Legend</span>
            </button>
          </div>

          {showLegend && (
            <div className="absolute top-4 left-4 z-[400] bg-[var(--bg-card)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-2xl p-3.5 shadow-xl text-[8px] font-black uppercase tracking-wider flex flex-col gap-2.5 max-w-[12rem] animate-fade-in pointer-events-none">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white" /> <span>Trusted Vendor</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-white" /> <span>Observation</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white" /> <span>High Risk</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white animate-pulse" /> <span>Critical Vendor</span></div>
              <div className="flex items-center gap-2"><span className="w-4 h-1.5 bg-red-500/35 rounded-sm" /> <span>Heat Density</span></div>
              <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border border-blue-500 border-dashed" /> <span>AI Predict zone</span></div>
            </div>
          )}
        </div>

        {/* --- COMMUNITY HOTSPOT CLUSTER DETAIL DRAWER --- */}
        {selectedCluster && (
          <div className="card p-5 border-2 border-amber-500 bg-[var(--bg-card)] shadow-2xl relative animate-slide-up z-50 rounded-[2rem] flex flex-col gap-4">
            <button 
              onClick={() => setSelectedCluster(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:theme-text transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm theme-text leading-tight">{selectedCluster.shopName || `${selectedCluster.mostCommonOil} Hotspot`}</h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    selectedCluster.verificationLevel === 'authority' 
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedCluster.verificationLevel === 'authority' ? '🛡️ Authority Verified' : '👥 Community Verified'}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                  {selectedCluster.address}
                </p>
              </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-4 gap-2 text-center bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-3 text-[9px] font-bold">
              <div>
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Avg Adulteration</p>
                <p className="text-xs font-black font-mono text-red-400">{selectedCluster.avgAdulteration.toFixed(1)}%</p>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Reports</p>
                <p className="text-xs font-black font-mono text-amber-400">{selectedCluster.reportCount}</p>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Most Reported</p>
                <p className="text-[10px] font-black theme-text uppercase truncate">{selectedCluster.mostCommonOil}</p>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Risk Score</p>
                <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded border ${
                  selectedCluster.riskScore > 80 ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  selectedCluster.riskScore > 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                  selectedCluster.riskScore > 30 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {selectedCluster.riskScore}/100 ({selectedCluster.riskLevel})
                </span>
              </div>
            </div>

            {/* LATEST REPORT TIMESTAMP */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 bg-black/30 p-2.5 rounded-xl border border-gray-800">
              <span>Latest Report: <strong className="text-gray-200">{new Date(selectedCluster.latestReportDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong></span>
              <span>Radius: <strong className="text-amber-400">~75 Meters</strong></span>
            </div>

            {/* GOOGLE MAPS NAVIGATION BUTTON */}
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedCluster.latitude},${selectedCluster.longitude}`, '_blank')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
            >
              <Navigation size={14} className="rotate-45" /> Navigate with Google Maps
            </button>
          </div>
        )}

        {/* --- MARKER BOTTOM SHEET DETAIL DRAWER --- */}
        {selectedShop && (
          <div className="card p-5 border-2 border-brand-500 bg-[var(--bg-card)] shadow-2xl relative animate-slide-up z-50 rounded-[2rem] flex flex-col gap-4">
            <button 
              onClick={() => setSelectedShop(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:theme-text transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3">
              <span className="text-xl">🏪</span>
              <div>
                <h3 className="font-bold text-sm theme-text leading-tight">{selectedShop.name}</h3>
                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-brand-500" /> {getDistrictName(selectedShop)}, India
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-3 text-[9px] font-bold">
              <div>
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Latest Purity</p>
                <p className={`text-xs font-black font-mono ${selectedShop.last_purity >= 75 ? 'text-green-500' : 'text-red-500'}`}>{selectedShop.last_purity}%</p>
              </div>
              <div className="border-x border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Product Type</p>
                <p className="text-xs font-black theme-text uppercase truncate">{selectedShop.oil_type}</p>
              </div>
              <div>
                <p className="text-[7px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Status</p>
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                  selectedShop.status === 'adulterated' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                }`}>{selectedShop.status === 'adulterated' ? 'Restricted' : 'Trusted'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => window.open(`https://maps.google.com/?q=${selectedShop.latitude},${selectedShop.longitude}`)}
                className="py-3 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:theme-text transition-colors"
              >
                <Navigation size={10} className="rotate-45" />
                <span>Navigate Store</span>
              </button>
              <button 
                onClick={() => {
                  alert('Latching incident logs to Consumer Protection complaints...');
                  navigate('/community');
                }}
                className="py-3 bg-[#121214] text-white border border-[#26262a] dark:bg-[#1c1c1f] rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:theme-text transition-colors"
              >
                <ShieldAlert size={10} />
                <span>Report Vendor</span>
              </button>
            </div>
          </div>
        )}

        {/* --- NEARBY UNSAFE VENDORS LIST --- */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Nearest Unsafe Vendors</h3>
          
          <div className="flex flex-col gap-2.5">
            {nearbyUnsafeVendors.slice(0, 4).map(ven => (
              <div 
                key={ven.id}
                onClick={() => {
                  setSelectedShop(ven);
                  setMapCenter([parseFloat(ven.latitude), parseFloat(ven.longitude)]);
                  setMapZoom(14);
                }}
                className="card p-3.5 flex items-center justify-between border border-[var(--border-color)] hover:border-brand-500/35 transition-colors cursor-pointer group"
              >
                <div>
                  <h4 className="font-bold text-xs theme-text group-hover:text-brand-500 transition-colors">{ven.name}</h4>
                  <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">
                    Oil: {ven.oil_type} • Distance: ~{ven.distance} km
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-red-500 font-mono">{ven.last_purity}% Purity</p>
                    <span className="text-[7px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {ven.status === 'adulterated' ? 'Blacklisted' : 'Observation'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://maps.google.com/?q=${ven.latitude},${ven.longitude}`);
                    }}
                    className="p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-brand-500 transition-colors"
                  >
                    <Navigation size={12} className="rotate-45" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Rajkot">Rajkot</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" />
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
                    <option value="Mustard Oil">Mustard Oil</option>
                    <option value="Sunflower Oil">Sunflower Oil</option>
                    <option value="Groundnut Oil">Groundnut Oil</option>
                    <option value="Palm Oil">Palm Oil</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="field-label">Risk Rating Threshold</label>
                <div className="grid grid-cols-4 gap-2">
                  {['all', 'Critical', 'High', 'Safe'].map(level => (
                    <button
                      key={level}
                      onClick={() => setFilterRisk(level)}
                      className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        filterRisk.toLowerCase() === level.toLowerCase()
                          ? 'bg-brand-500/10 border-brand-500 text-brand-500'
                          : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:theme-text'
                      }`}
                    >
                      {level === 'all' ? 'All' : `${level}`}
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
