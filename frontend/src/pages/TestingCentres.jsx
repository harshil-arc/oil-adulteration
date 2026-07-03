import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, Building, Search, MapPin, Navigation, Phone, Globe, 
  Mail, Clock, Star, ShieldCheck, Calendar, Filter, Share2, CheckCircle2, X, RefreshCw,
  Car, Footprints, ExternalLink, FileText, Info, Award, Check
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

// ── Marker Color Generator based on Lab Accreditation Type ────────────────────
const createLabIcon = (color, symbol) => new L.DivIcon({
  className: 'custom-lab-marker',
  html: `<div style="
    background: ${color};
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 0 12px ${color}90;
    color: #ffffff;
    font-size: 14px;
  ">${symbol}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Marker icons:
// Blue = Government Lab, Green = FSSAI Certified Referral, Purple = Private Accredited Lab
const govtMarkerIcon = createLabIcon('linear-gradient(135deg, #2563eb, #1d4ed8)', '🏛️');
const fssaiMarkerIcon = createLabIcon('linear-gradient(135deg, #16a34a, #15803d)', '🟢');
const pvtMarkerIcon = createLabIcon('linear-gradient(135deg, #9333ea, #7e22ce)', '🔬');

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// ── Pan-India States and Cities Registry ──────────────────────────────────────
const PAN_INDIA_CITIES = {
  'Gujarat': [
    { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, pin: '380009' },
    { city: 'Surat', lat: 21.1702, lng: 72.8311, pin: '395003' },
    { city: 'Vadodara', lat: 22.3072, lng: 73.1812, pin: '390001' },
    { city: 'Rajkot', lat: 22.3039, lng: 70.8022, pin: '360001' },
    { city: 'Anand', lat: 22.5645, lng: 72.9289, pin: '388001' },
    { city: 'Bhavnagar', lat: 21.7645, lng: 72.1519, pin: '364001' },
    { city: 'Gandhinagar', lat: 23.2156, lng: 72.6369, pin: '382010' }
  ],
  'Maharashtra': [
    { city: 'Mumbai', lat: 19.0760, lng: 72.8777, pin: '400001' },
    { city: 'Pune', lat: 18.5204, lng: 73.8567, pin: '411001' },
    { city: 'Nagpur', lat: 21.1458, lng: 79.0882, pin: '440001' },
    { city: 'Nashik', lat: 19.9975, lng: 73.7898, pin: '422001' }
  ],
  'Delhi NCR': [
    { city: 'New Delhi', lat: 28.6139, lng: 77.2090, pin: '110001' },
    { city: 'Gurugram', lat: 28.4595, lng: 77.0266, pin: '122001' },
    { city: 'Noida', lat: 28.5355, lng: 77.3910, pin: '201301' }
  ],
  'Karnataka': [
    { city: 'Bengaluru', lat: 12.9716, lng: 77.5946, pin: '560001' },
    { city: 'Mysuru', lat: 12.2958, lng: 76.6394, pin: '570001' }
  ],
  'Tamil Nadu': [
    { city: 'Chennai', lat: 13.0827, lng: 80.2707, pin: '600001' },
    { city: 'Coimbatore', lat: 11.0168, lng: 76.9558, pin: '641001' }
  ],
  'Telangana': [
    { city: 'Hyderabad', lat: 17.3850, lng: 78.4867, pin: '500001' }
  ],
  'West Bengal': [
    { city: 'Kolkata', lat: 22.5726, lng: 88.3639, pin: '700001' }
  ],
  'Uttar Pradesh': [
    { city: 'Lucknow', lat: 26.8467, lng: 80.9462, pin: '226001' },
    { city: 'Kanpur', lat: 26.4499, lng: 80.3319, pin: '208001' }
  ]
};

// Generator for labs
function generateLabsForCity(state, cityObj) {
  const city = cityObj.city;
  const lat = cityObj.lat;
  const lng = cityObj.lng;
  const pin = cityObj.pin;

  return [
    {
      id: `lab-govt-${city}`,
      name: `NABL Central Food & Edible Oil Laboratory (${city})`,
      type: 'Government',
      isFssaiApproved: true,
      fssaiBadge: 'FSSAI Referral Laboratory',
      state: state,
      city: city,
      district: city,
      pinCode: pin,
      address: `Civil Lines, Near Government Science Complex, ${city}, ${state} ${pin}`,
      lat: lat + 0.008,
      lng: lng + 0.006,
      distance: 2.1,
      driveTime: '6 mins',
      walkTime: '20 mins',
      rating: 4.9,
      reviewsCount: 184,
      openStatus: 'Open Now • 08:30 AM - 06:30 PM',
      phone: `+91 ${Math.floor(70 + Math.random() * 20)} ${Math.floor(2000 + Math.random() * 8000)} 1100`,
      email: `lab.${city.toLowerCase().replace(/\s+/g, '')}@fssai.gov.in`,
      website: 'https://fssai.gov.in',
      workingHours: 'Mon-Sat: 8:30 AM - 6:30 PM',
      testsAvailable: ['Oil Testing', 'Food Testing', 'Milk Testing', 'Water Testing', 'Spice Testing', 'Sample Collection'],
      testCost: '₹350 - ₹1,200',
      estTurnaround: '24 Hours',
      description: `Official FSSAI Referral and NABL ISO/IEC 17025 accredited central laboratory serving ${city}. Equipped with Gas Chromatography-Mass Spectrometry (GC-MS) and AS7343 high-resolution spectral analyzers.`,
      requiredDocs: ['Sample Bottle (Minimum 100ml)', 'FSSAI Form B / Personal Identity Proof', 'Purchase Receipt (if commercial complaint)']
    },
    {
      id: `lab-fssai-${city}`,
      name: `State Food Safety Analytical Research Centre (${city})`,
      type: 'FSSAI Referral',
      isFssaiApproved: true,
      fssaiBadge: 'FSSAI State Accredited',
      state: state,
      city: city,
      district: city,
      pinCode: pin,
      address: `State Public Health Complex, Ring Road, ${city}, ${state} ${pin}`,
      lat: lat - 0.005,
      lng: lng + 0.007,
      distance: 3.4,
      driveTime: '10 mins',
      walkTime: '35 mins',
      rating: 4.8,
      reviewsCount: 142,
      openStatus: 'Open Now • 09:00 AM - 05:30 PM',
      phone: `+91 ${Math.floor(70 + Math.random() * 20)} ${Math.floor(3000 + Math.random() * 6000)} 2200`,
      email: `publichealth.${city.toLowerCase().replace(/\s+/g, '')}@gov.in`,
      website: 'https://fssai.gov.in',
      workingHours: 'Mon-Fri: 9:00 AM - 5:30 PM',
      testsAvailable: ['Oil Testing', 'Food Testing', 'Milk Testing', 'Water Testing'],
      testCost: '₹400 - ₹1,000',
      estTurnaround: '36 Hours',
      description: `State public health analytical laboratory specializing in food adulteration detection, heavy metal analysis, and pesticide residue profiling.`,
      requiredDocs: ['Sealed Food/Oil Sample', 'Identity Document']
    },
    {
      id: `lab-pvt-${city}`,
      name: `SGS India Food Spectrometry & Chemical Analysis Hub (${city})`,
      type: 'Private',
      isFssaiApproved: true,
      fssaiBadge: 'NABL Accredited Private Lab',
      state: state,
      city: city,
      district: city,
      pinCode: pin,
      address: `Industrial Development Zone, Main Bypass Road, ${city}, ${state} ${pin}`,
      lat: lat - 0.007,
      lng: lng - 0.005,
      distance: 4.8,
      driveTime: '12 mins',
      walkTime: '45 mins',
      rating: 4.7,
      reviewsCount: 112,
      openStatus: 'Open Now • 09:00 AM - 08:00 PM',
      phone: `+91 ${Math.floor(70 + Math.random() * 20)} ${Math.floor(4000 + Math.random() * 5000)} 8800`,
      email: `info.${city.toLowerCase().replace(/\s+/g, '')}@sgs.com`,
      website: 'https://sgs.com',
      workingHours: 'Mon-Sun: 9:00 AM - 8:00 PM',
      testsAvailable: ['Oil Testing', 'Food Testing', 'Spice Testing', 'Chemical Analysis'],
      testCost: '₹500 - ₹1,800',
      estTurnaround: '12 Hours (Express)',
      description: `Global leader in inspection, verification, testing, and certification. Express 12-hour turnaround available for commercial and consumer oil purity verification.`,
      requiredDocs: ['Sample Bottle', 'Contact Details']
    }
  ];
}

export default function TestingCentresPage() {
  const navigate = useNavigate();
  
  // Location Selection State
  const [selectedState, setSelectedState] = useState('Gujarat');
  const [selectedCityName, setSelectedCityName] = useState('Ahmedabad');
  const [pinCodeQuery, setPinCodeQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCities, setRecentCities] = useState(['Ahmedabad', 'Mumbai', 'Surat', 'Delhi']);

  // Filters State
  const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'Government', 'FSSAI Referral', 'Private'
  const [testTypeFilter, setTestTypeFilter] = useState('All'); // 'All', 'Oil Testing', 'Food Testing', 'Water Testing', etc.
  const [sortBy, setSortBy] = useState('Nearest'); // 'Nearest', 'Highest Rated'

  // Modal States
  const [viewingLabDetails, setViewingLabDetails] = useState(null);
  const [bookingLab, setBookingLab] = useState(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState({
    testCategory: 'Oil Testing',
    date: new Date().toISOString().split('T')[0],
    slot: '10:00 AM - 12:00 PM',
    purpose: 'Personal Consumption',
    phone: '',
    sampleType: 'Mustard Oil'
  });

  // Current city details
  const currentCityObj = useMemo(() => {
    const stateCities = PAN_INDIA_CITIES[selectedState] || [];
    const found = stateCities.find(c => c.city === selectedCityName);
    return found || stateCities[0] || { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, pin: '380009' };
  }, [selectedState, selectedCityName]);

  // Map state
  const [mapCenter, setMapCenter] = useState([currentCityObj.lat, currentCityObj.lng]);
  const [mapZoom, setMapZoom] = useState(12);

  // Update map center when city changes
  useEffect(() => {
    setMapCenter([currentCityObj.lat, currentCityObj.lng]);
  }, [currentCityObj]);

  // Handle Auto GPS Location
  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter([lat, lng]);
        setMapZoom(13);
      }, () => alert("Could not resolve current location"));
    }
  };

  // Generate pan-India labs list dynamically
  const allGeneratedLabs = useMemo(() => {
    let list = [];
    Object.keys(PAN_INDIA_CITIES).forEach(st => {
      PAN_INDIA_CITIES[st].forEach(cityObj => {
        list.push(...generateLabsForCity(st, cityObj));
      });
    });
    return list;
  }, []);

  // Filtered and Sorted Laboratories List
  const filteredLabs = useMemo(() => {
    let result = allGeneratedLabs.filter(lab => {
      const matchesCity = pinCodeQuery.trim() !== '' 
        ? lab.pinCode.includes(pinCodeQuery.trim()) 
        : (lab.state === selectedState && lab.city === selectedCityName);
      
      const matchesType = typeFilter === 'All' || lab.type === typeFilter;
      const matchesTest = testTypeFilter === 'All' || lab.testsAvailable.includes(testTypeFilter);
      const matchesSearch = searchQuery.trim() === '' || (
        lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.pinCode.includes(searchQuery)
      );
      return (matchesCity || pinCodeQuery.trim() !== '' || searchQuery.trim() !== '') && matchesType && matchesTest && matchesSearch;
    });

    if (sortBy === 'Nearest') {
      result.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'Highest Rated') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allGeneratedLabs, selectedState, selectedCityName, pinCodeQuery, typeFilter, testTypeFilter, searchQuery, sortBy]);

  // Handle Appointment Booking Submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  const handleCitySelect = (cityName) => {
    setSelectedCityName(cityName);
    if (!recentCities.includes(cityName)) {
      setRecentCities(prev => [cityName, ...prev.slice(0, 3)]);
    }
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe px-4 max-w-5xl mx-auto space-y-5">
      
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Certified Laboratories Directory</span>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Building className="text-blue-400" size={22} />
              Food Testing Centres
            </h1>
          </div>
        </div>
      </div>

      {/* ── STEP 1: LOCATION SELECTION BAR ──────────────────────────────────── */}
      <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-[#d4af37]" /> Select Location (State & City)
          </h3>
          <button onClick={handleGPSLocation} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-[#d4af37] hover:border-[#d4af37]">
            <Navigation size={13} /> Current GPS Location
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* State Dropdown */}
          <div>
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">State</label>
            <select 
              value={selectedState} 
              onChange={e => {
                const newState = e.target.value;
                setSelectedState(newState);
                const firstCity = PAN_INDIA_CITIES[newState][0].city;
                handleCitySelect(firstCity);
              }}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-color)] p-3 rounded-xl outline-none font-bold focus:border-[#d4af37]"
            >
              {Object.keys(PAN_INDIA_CITIES).map(st => (
                <option key={st} value={st} className="bg-[#18181b] text-white">
                  🇮🇳 {st}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">City / District</label>
            <select 
              value={selectedCityName} 
              onChange={e => handleCitySelect(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-color)] p-3 rounded-xl outline-none font-bold focus:border-[#d4af37]"
            >
              {(PAN_INDIA_CITIES[selectedState] || []).map(c => (
                <option key={c.city} value={c.city} className="bg-[#18181b] text-white">
                  📍 {c.city}
                </option>
              ))}
            </select>
          </div>

          {/* PIN Code Search */}
          <div>
            <label className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">PIN Code Search</label>
            <input 
              type="text" 
              placeholder="e.g. 380009 or 400001"
              value={pinCodeQuery}
              onChange={e => setPinCodeQuery(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-color)] p-3 rounded-xl outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Recently Searched Cities Chips */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-color)]">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recent:</span>
          <div className="flex flex-wrap gap-1.5">
            {recentCities.map(rc => (
              <button
                key={rc}
                onClick={() => setSelectedCityName(rc)}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                  selectedCityName === rc 
                    ? 'bg-[#d4af37] text-black border-[#d4af37] font-black' 
                    : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)] hover:border-gray-500'
                }`}
              >
                📍 {rc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STEP 2: DEDICATED LABORATORY GIS MAP ─────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Building size={14} className="text-blue-400" /> Laboratory GIS Map View
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Govt Lab</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> FSSAI Certified</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Private Lab</span>
          </div>
        </div>

        <div className="h-80 w-full border border-[var(--border-color)] rounded-3xl overflow-hidden relative z-0 shadow-lg">
          <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
            <TileLayer
              url={document.documentElement.classList.contains('dark')
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              }
              attribution='&copy; ESRI / CartoDB / NABL Accredited Laboratories'
            />
            <ChangeMapView center={mapCenter} zoom={mapZoom} />

            {filteredLabs.map(lab => {
              const markerIcon = lab.type === 'Government' 
                ? govtMarkerIcon 
                : lab.type === 'FSSAI Referral' 
                ? fssaiMarkerIcon 
                : pvtMarkerIcon;

              return (
                <Marker key={lab.id} position={[lab.lat, lab.lng]} icon={markerIcon}>
                  <Popup>
                    <div className="p-2 space-y-2 text-xs text-black max-w-xs">
                      <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        lab.type === 'Government' ? 'bg-blue-600' : lab.type === 'FSSAI Referral' ? 'bg-green-600' : 'bg-purple-600'
                      }`}>
                        {lab.type}
                      </span>
                      <h4 className="font-bold text-sm leading-snug">{lab.name}</h4>
                      <p className="text-[11px] text-gray-700">📍 {lab.address}</p>
                      <p className="text-[10px] text-gray-600">🕒 {lab.workingHours}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-bold text-blue-700">{lab.distance} km away</span>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-black text-white px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1"
                        >
                          <Navigation size={10} /> Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* ── STEP 3: FILTERS & SEARCH BAR ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search Lab Name, City, or PIN Code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-color)] rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-color)] p-3 rounded-xl outline-none font-bold"
            >
              <option value="All" className="bg-[#18181b] text-white">All Lab Ownership</option>
              <option value="Government" className="bg-[#18181b] text-white">🏛️ Government Labs</option>
              <option value="FSSAI Referral" className="bg-[#18181b] text-white">🟢 FSSAI Referral Labs</option>
              <option value="Private" className="bg-[#18181b] text-white">🟣 Private Accredited Labs</option>
            </select>

            <select 
              value={testTypeFilter} 
              onChange={e => setTestTypeFilter(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-color)] p-3 rounded-xl outline-none font-bold"
            >
              <option value="All" className="bg-[#18181b] text-white">All Test Services</option>
              <option value="Oil Testing" className="bg-[#18181b] text-white">🛢️ Oil Testing</option>
              <option value="Food Testing" className="bg-[#18181b] text-white">🥗 Food Testing</option>
              <option value="Milk Testing" className="bg-[#18181b] text-white">🥛 Milk Testing</option>
              <option value="Water Testing" className="bg-[#18181b] text-white">💧 Water Testing</option>
              <option value="Spice Testing" className="bg-[#18181b] text-white">🌶️ Spice Testing</option>
              <option value="Sample Collection" className="bg-[#18181b] text-white">📦 Sample Collection</option>
            </select>

            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-color)] p-3 rounded-xl outline-none font-bold"
            >
              <option value="Nearest" className="bg-[#18181b] text-white">Nearest First</option>
              <option value="Highest Rated" className="bg-[#18181b] text-white">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── STEP 4: LABORATORY CARDS DIRECTORY LIST ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#d4af37]" />
            Accredited Testing Laboratories ({filteredLabs.length} Found in {selectedCityName}, {selectedState})
          </h3>
        </div>

        {filteredLabs.length === 0 ? (
          <div className="card p-8 rounded-3xl text-center space-y-3 border border-[var(--border-color)]">
            <Building size={36} className="text-gray-500 mx-auto" />
            <h4 className="text-base font-black text-white">No certified food testing laboratories found in this city.</h4>
            <p className="text-xs text-gray-400">Showing nearest available laboratories in adjacent regions:</p>
            <div className="pt-2 flex justify-center gap-2">
              <button 
                onClick={() => { setSelectedState('Gujarat'); setSelectedCityName('Ahmedabad'); }}
                className="btn-secondary py-2 px-4 text-xs"
              >
                View Laboratories in Ahmedabad
              </button>
              <button 
                onClick={() => { setSelectedState('Maharashtra'); setSelectedCityName('Mumbai'); }}
                className="btn-secondary py-2 px-4 text-xs"
              >
                View Laboratories in Mumbai
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLabs.map(lab => (
              <div key={lab.id} className="card p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37]/50 space-y-4 transition-all">
                
                {/* Card Top Details */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                        lab.type === 'Government' 
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                          : lab.type === 'FSSAI Referral'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }`}>
                        {lab.type}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        ✓ {lab.fssaiBadge}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-1.5 leading-snug">{lab.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">📍 {lab.address}</p>
                  </div>

                  <div className="text-right text-xs shrink-0">
                    <span className="bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Star size={12} fill="#f59e0b" /> {lab.rating} ({lab.reviewsCount})
                    </span>
                    <p className="text-xs font-black text-blue-400 mt-1">{lab.distance} km away</p>
                  </div>
                </div>

                {/* Travel Time & Operating Hours */}
                <div className="grid grid-cols-3 gap-2 text-[11px] bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <div>
                    <span className="text-gray-400 block font-bold">Drive / Walk:</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <Car size={12} className="text-blue-400" /> {lab.driveTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-bold">Status:</span>
                    <span className="font-bold text-emerald-400 truncate block mt-0.5">{lab.openStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-bold">Est Turnaround:</span>
                    <span className="font-bold text-white block mt-0.5">{lab.estTurnaround}</span>
                  </div>
                </div>

                {/* Available Tests Offered */}
                <div className="space-y-1 text-xs">
                  <span className="text-gray-400 font-bold">Available Tests:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lab.testsAvailable.map((test, idx) => (
                      <span key={idx} className="bg-gray-800 text-gray-300 text-[10px] px-2.5 py-1 rounded-lg border border-gray-700 font-medium">
                        ✓ {test}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[var(--border-color)] gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary py-2 px-3 text-[11px] flex items-center gap-1 hover:text-white"
                    >
                      <Navigation size={13} /> Navigate
                    </a>

                    <a 
                      href={`tel:${lab.phone}`} 
                      className="btn-secondary py-2 px-3 text-[11px] flex items-center gap-1 hover:text-white"
                    >
                      <Phone size={13} /> Call
                    </a>

                    <button
                      onClick={() => setViewingLabDetails(lab)}
                      className="btn-secondary py-2 px-3 text-[11px] flex items-center gap-1 text-[#d4af37]"
                    >
                      <Info size={13} /> Details
                    </button>
                  </div>

                  <button 
                    onClick={() => setBookingLab(lab)} 
                    className="btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5"
                  >
                    <Calendar size={14} /> Book Test
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── STEP 5: LAB DETAILS PAGE / MODAL ─────────────────────────────────── */}
      {viewingLabDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-lg w-full space-y-5 my-auto max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                  ✓ {viewingLabDetails.fssaiBadge}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{viewingLabDetails.name}</h3>
                <p className="text-xs text-gray-400">📍 {viewingLabDetails.address}</p>
              </div>
              <button onClick={() => setViewingLabDetails(null)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <h4 className="font-bold text-[#d4af37] uppercase tracking-wider text-[10px]">Laboratory Overview</h4>
                <p className="text-gray-300 leading-relaxed">{viewingLabDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Testing Charges</span>
                  <span className="text-white font-mono font-bold text-sm mt-0.5 block">{viewingLabDetails.testCost}</span>
                </div>
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Expected Report Time</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm mt-0.5 block">{viewingLabDetails.estTurnaround}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Testing Services Offered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingLabDetails.testsAvailable.map((t, i) => (
                    <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-xl font-bold">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Required Documents & Sample Guidelines</h4>
                <ul className="space-y-1.5">
                  {viewingLabDetails.requiredDocs.map((doc, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)] flex gap-2">
                <button
                  onClick={() => { setBookingLab(viewingLabDetails); setViewingLabDetails(null); }}
                  className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2"
                >
                  <Calendar size={14} /> Book Sample Testing
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${viewingLabDetails.lat},${viewingLabDetails.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary py-3 px-4 text-xs flex items-center gap-1.5"
                >
                  <Navigation size={14} /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 6: APPOINTMENT BOOKING MODAL ───────────────────────────────── */}
      {bookingLab && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-md w-full space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Book Sample Testing</span>
                <h3 className="text-base font-black text-white">{bookingLab.name}</h3>
              </div>
              <button onClick={() => { setBookingLab(null); setBookingSubmitted(false); }} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {bookingSubmitted ? (
              <div className="text-center space-y-3 py-4 animate-scale-up">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black text-white">Sample Testing Request Booked!</h4>
                <p className="text-xs text-gray-400">Appointment Reference: <span className="font-bold text-[#d4af37]">APT-2026-{Math.floor(1000 + Math.random() * 9000)}</span></p>
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl text-left text-xs space-y-1">
                  <p><span className="text-gray-400">Laboratory:</span> <span className="text-white font-bold">{bookingLab.name}</span></p>
                  <p><span className="text-gray-400">Sample Category:</span> <span className="text-emerald-400 font-bold">{bookingData.testCategory} ({bookingData.sampleType})</span></p>
                  <p><span className="text-gray-400">Testing Purpose:</span> <span className="text-white font-bold">{bookingData.purpose}</span></p>
                  <p><span className="text-gray-400">Date & Slot:</span> <span className="text-white font-bold">{bookingData.date} ({bookingData.slot})</span></p>
                </div>
                <button onClick={() => { setBookingLab(null); setBookingSubmitted(false); }} className="btn-primary w-full py-2.5 text-xs">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1 font-bold">Testing Purpose</label>
                  <select 
                    value={bookingData.purpose}
                    onChange={e => setBookingData({ ...bookingData, purpose: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none font-bold"
                  >
                    <option className="bg-[#18181b] text-white">Personal Consumption Verification</option>
                    <option className="bg-[#18181b] text-white">Commercial / Business Compliance</option>
                    <option className="bg-[#18181b] text-white">FSSAI Complaint Investigation</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-bold font-mono">Sample Type / Category</label>
                  <select 
                    value={bookingData.testCategory} 
                    onChange={e => setBookingData({ ...bookingData, testCategory: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none font-bold"
                  >
                    {bookingLab.testsAvailable.map((t, i) => (
                      <option key={i} value={t} className="bg-[#18181b] text-white">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-bold">Preferred Date</label>
                  <input 
                    type="date" 
                    required
                    value={bookingData.date}
                    onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-bold">Time Slot</label>
                  <select 
                    value={bookingData.slot}
                    onChange={e => setBookingData({ ...bookingData, slot: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none font-bold"
                  >
                    <option className="bg-[#18181b] text-white">09:00 AM - 11:00 AM</option>
                    <option className="bg-[#18181b] text-white">11:00 AM - 01:00 PM</option>
                    <option className="bg-[#18181b] text-white">02:00 PM - 04:00 PM</option>
                    <option className="bg-[#18181b] text-white">04:00 PM - 06:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-bold">Contact Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    required
                    value={bookingData.phone}
                    onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none font-bold"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-3 text-xs mt-2">
                  Confirm Lab Appointment →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
