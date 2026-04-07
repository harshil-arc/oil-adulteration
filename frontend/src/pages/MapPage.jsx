import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Search, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getShops } from '../lib/api';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;

const customIcon = (color) => {
  let hex;
  if (color === 'red') hex = '#ef4444'; // Danger
  else if (color === 'yellow') hex = '#eab308'; // Watch
  else hex = '#22c55e'; // Safe

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
      border-radius: 3rem 3rem 0;
      transform: rotate(45deg);
      border: 2px solid #000;
      box-shadow: 0 0 10px ${hex}80;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);

  // default center for India (approx) if no data
  const [mapCenter] = useState([22.9734, 78.6569]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getShops();
      const shopData = res.data?.data || [];
      const mapped = shopData.filter(s => s.latitude && s.longitude).map(s => {
        let status = 'safe';
        if (s.trust_score < 40) status = 'red';
        else if (s.trust_score < 70) status = 'yellow';
        else status = 'green';

        return { ...s, color: status };
      });
      setVendors(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(query.toLowerCase()) || 
    v.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] animate-fade-in relative z-20">
      {/* Top Header */}
      <div className="absolute top-0 z-[400] w-full px-5 pt-6 pb-2 glass rounded-none border-b border-[#333]">
         <div className="flex items-center justify-between mb-4">
           <h1 className="text-xl font-bold text-[#d4af37]">Vendor Map</h1>
           <button className="p-2 rounded-full hover:bg-[#1c1c1c] transition-colors text-white">
             <Filter size={20} />
           </button>
         </div>

         {/* Search Bar */}
         <div className="relative">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
             <Search size={18} />
           </div>
           <input 
             value={query}
             onChange={e => setQuery(e.target.value)}
             type="text" 
             placeholder="Search area or oil vendor..." 
             className="w-full bg-[#1c1c1c] border border-[#333] focus:border-[#d4af37] text-white rounded-full py-3.5 pl-12 pr-4 outline-none text-sm placeholder:text-gray-500 shadow-glow-gold transition-colors"
           />
         </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 w-full bg-[#141414] relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={5} 
          scrollWheelZoom={true} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
             url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {filtered.map(vendor => (
             <Marker 
               key={vendor.id} 
               position={[vendor.latitude, vendor.longitude]} 
               icon={customIcon(vendor.color)}
               eventHandlers={{
                 click: () => setSelectedVendor(vendor)
               }}
             >
             </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Selected Vendor Bottom Sheet overlay */}
      {selectedVendor && (
        <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+70px)] left-0 w-full px-4 z-[400]">
          <div className="card rounded-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border border-[#d4af37]/30 bg-[#141414]/95 backdrop-blur-xl relative animate-slide-up">
             <button 
               onClick={() => setSelectedVendor(null)}
               className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1c1c1c] flex flex-col items-center justify-center text-gray-400 hover:text-white"
             >
               ✕
             </button>

             <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 
                  ${selectedVendor.color === 'red' ? 'bg-red-500/10 border-red-500 text-red-500' : 
                    selectedVendor.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
                  {selectedVendor.color === 'red' ? <ShieldAlert size={20} /> : selectedVendor.color === 'yellow' ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div className="flex-1 pr-6">
                   <h3 className="text-white font-bold text-lg leading-tight mb-1">{selectedVendor.name}</h3>
                   <p className="text-gray-400 text-xs">{selectedVendor.address}</p>
                </div>
             </div>

             <div className="flex justify-between items-center bg-[#0a0a0a] rounded-xl p-3 mb-4 border border-[#333]">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Safety Ticket</p>
                  <p className="text-white text-sm font-bold">{selectedVendor.color === 'red' ? '⚠️ Adulterated' : selectedVendor.color === 'yellow' ? '👀 On Watch' : '✅ Verified Pure'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Score</p>
                  <p className="text-[#d4af37] font-black text-lg">{selectedVendor.trust_score}/100</p>
                </div>
             </div>

             {selectedVendor.color === 'red' && (
               <button className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.3)] border-0 text-white w-full pr-4">
                 <span>REPORT VENDOR TO FSSAI</span>
                 <ArrowRight size={18} />
               </button>
             )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+70px)] left-0 w-full px-5 py-3 z-[300] flex items-center justify-center pointer-events-none">
         <div className="glass px-4 py-2 rounded-full flex gap-4 text-[10px] font-bold tracking-widest uppercase text-white shadow-glow-gold border border-[#d4af37]/20 pointer-events-auto">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Safe</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Watch</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Danger</span>
         </div>
      </div>
    </div>
  );
}
