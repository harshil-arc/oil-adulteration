import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Search, MapPin, Phone, Globe, Clock, Star, Navigation, 
  Calendar, ShieldCheck, ChevronRight, Filter, ExternalLink, ArrowLeft, Building
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

const labIcon = new L.DivIcon({
  className: 'custom-lab-marker',
  html: `<div style="
    background-color: #3b82f6;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
    color: #fff;
    font-size: 12px;
    font-weight: bold;
  ">🔬</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const TESTING_LABORATORIES = [
  {
    id: 'lab-1',
    name: 'NABL Central Food & Oil Testing Laboratory',
    type: 'Government (FSSAI Accredited)',
    address: 'Navrangpura, Near Gujarat University, Ahmedabad, Gujarat 380009',
    city: 'Ahmedabad',
    pinCode: '380009',
    lat: 23.0338,
    lng: 72.5250,
    distance: 2.4,
    rating: 4.8,
    status: 'Open Now',
    phone: '+91 79 2630 1142',
    email: 'contact@nablahmedabad.gov.in',
    website: 'https://nabl-india.org',
    testsAvailable: ['Edible Oil Purity & Gas Chromatography', 'Argemone & Mineral Oil Detection', 'Microbiology & Heavy Metals', 'Chemical Analysis'],
    estTurnaround: '24 Hours'
  },
  {
    id: 'lab-2',
    name: 'SGS Food & Chemical Analysis Center',
    type: 'Private Approved',
    address: 'S.G. Highway, Prahlad Nagar, Ahmedabad, Gujarat 380015',
    city: 'Ahmedabad',
    pinCode: '380015',
    lat: 23.0120,
    lng: 72.5100,
    distance: 4.8,
    rating: 4.6,
    status: 'Open Now',
    phone: '+91 79 4000 8800',
    email: 'info.india@sgs.com',
    website: 'https://sgs.com',
    testsAvailable: ['Oil Adulteration Spectral Testing', 'Pesticide Residue Analysis', 'Nutrition Label Verification'],
    estTurnaround: '12 Hours (Express)'
  },
  {
    id: 'lab-3',
    name: 'Surat Municipal Regional Food Lab',
    type: 'Government (FSSAI Accredited)',
    address: 'Surat Food Inspection Cell, Muglisara, Surat, Gujarat 395003',
    city: 'Surat',
    pinCode: '395003',
    lat: 21.1980,
    lng: 72.8250,
    distance: 14.2,
    rating: 4.7,
    status: 'Open Now',
    phone: '+91 261 242 2288',
    email: 'foodsafety@surat.gov.in',
    website: 'https://suratmunicipal.gov.in',
    testsAvailable: ['Edible Oil Spectroscopy', 'Butter & Ghee Fat Analysis', 'Food Safety Audits'],
    estTurnaround: '48 Hours'
  },
  {
    id: 'lab-4',
    name: 'TUV SUD South Asia Food Lab',
    type: 'Private Approved',
    address: 'MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
    city: 'Mumbai',
    pinCode: '400093',
    lat: 19.1150,
    lng: 72.8650,
    distance: 28.5,
    rating: 4.9,
    status: 'Open Now',
    phone: '+91 22 6688 2000',
    email: 'info@tuvsud.com',
    website: 'https://tuvsud.com',
    testsAvailable: ['High-Performance Liquid Chromatography (HPLC)', 'Fatty Acid Profile', 'Microbiology & Toxicology'],
    estTurnaround: '24 Hours'
  }
];

export default function MapPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'Government', 'Private'
  const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]); // Default Ahmedabad
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedLab, setSelectedLab] = useState(null);

  // Filtered Laboratories
  const filteredLabs = useMemo(() => {
    return TESTING_LABORATORIES.filter(lab => {
      const matchesType = filterType === 'all' || lab.type.toLowerCase().includes(filterType.toLowerCase());
      const matchesQuery = query.trim() === '' || (
        lab.name.toLowerCase().includes(query.toLowerCase()) ||
        lab.city.toLowerCase().includes(query.toLowerCase()) ||
        lab.pinCode.includes(query) ||
        lab.address.toLowerCase().includes(query.toLowerCase())
      );
      return matchesType && matchesQuery;
    });
  }, [filterType, query]);

  // Handle GPS Location Search
  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter([lat, lng]);
        setMapZoom(13);
      }, () => alert("Could not resolve location"));
    }
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-24 pt-safe px-4 max-w-5xl mx-auto space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Building className="text-[#d4af37]" size={20} />
              Food & Oil Testing Centre Directory
            </h1>
            <p className="text-xs text-gray-400">NABL & FSSAI Accredited Laboratories for Official Sample Verification</p>
          </div>
        </div>
      </div>

      {/* Search & Location Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search by City, District, State, or PIN Code (e.g. 380009)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-white rounded-xl py-3 pl-9 pr-4 outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleGPSLocation} className="btn-secondary py-3 px-4 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <Navigation size={14} /> Near Me
          </button>

          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-white p-3 rounded-xl outline-none"
          >
            <option value="all">All Lab Types</option>
            <option value="Government">Government (FSSAI)</option>
            <option value="Private">Private NABL</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Component */}
      <div className="h-72 w-full border border-[var(--border-color)] rounded-3xl overflow-hidden relative z-0">
        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="w-full h-full" zoomControl={false}>
          <TileLayer
            url={document.documentElement.classList.contains('dark')
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; ESRI / CartoDB / FSSAI'
          />
          <ChangeMapView center={mapCenter} zoom={mapZoom} />

          {filteredLabs.map(lab => (
            <Marker key={lab.id} position={[lab.lat, lab.lng]} icon={labIcon}>
              <Popup>
                <div className="p-2 space-y-1 text-xs text-black">
                  <h4 className="font-bold text-sm">{lab.name}</h4>
                  <p>{lab.type}</p>
                  <p>📍 {lab.distance} km away</p>
                  <button onClick={() => setSelectedLab(lab)} className="mt-2 text-[10px] bg-black text-white px-3 py-1 rounded font-bold w-full">
                    View & Book →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Laboratory List Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#d4af37]" />
          Accredited Laboratories ({filteredLabs.length} Available)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLabs.map(lab => (
            <div key={lab.id} className="card p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37]/50 space-y-3 transition-all">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-0.5 rounded-md border border-[#d4af37]/30">
                    {lab.type}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{lab.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {lab.address}</p>
                </div>
                <div className="text-right text-xs shrink-0">
                  <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-1 rounded-lg">
                    ★ {lab.rating}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">{lab.distance} km away</p>
                </div>
              </div>

              {/* Tests Offered */}
              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-gray-300">Available Tests:</p>
                <div className="flex flex-wrap gap-1">
                  {lab.testsAvailable.map((t, idx) => (
                    <span key={idx} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs">
                <div className="flex items-center gap-3">
                  <a href={`tel:${lab.phone}`} className="text-blue-400 font-bold flex items-center gap-1 hover:underline">
                    <Phone size={14} /> Call
                  </a>
                  <a href={lab.website} target="_blank" rel="noreferrer" className="text-gray-400 flex items-center gap-1 hover:text-white">
                    <Globe size={14} /> Website
                  </a>
                </div>

                <button 
                  onClick={() => alert(`Appointment booking request sent to ${lab.name}`)}
                  className="btn-primary py-2 px-3 text-xs flex items-center gap-1"
                >
                  <Calendar size={14} /> Book Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
