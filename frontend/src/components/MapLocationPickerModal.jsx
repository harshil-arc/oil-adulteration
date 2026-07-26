import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X, Check, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom Map Marker Icon
const pickerIcon = new L.DivIcon({
  className: 'custom-picker-pin',
  html: `<div style="
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    left: -14px;
    top: -28px;
    position: relative;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #ffffff;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
  ">
    <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={pickerIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        }
      }}
    />
  );
}

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MapLocationPickerModal({ isOpen, onClose, initialCoords, onSelectLocation }) {
  const [position, setPosition] = useState(initialCoords || [23.0255, 72.5874]); // Default Ahmedabad

  useEffect(() => {
    if (initialCoords && initialCoords[0] && initialCoords[1]) {
      setPosition(initialCoords);
    } else {
      // Default to India center if empty
      setPosition([22.9734, 78.6569]);
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (position && position[0] && position[1]) {
      onSelectLocation({
        latitude: parseFloat(position[0].toFixed(6)),
        longitude: parseFloat(position[1].toFixed(6))
      });
      onClose();
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          alert('Could not retrieve device location: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <MapPin className="text-amber-400" size={18} />
            <h3 className="text-sm font-black text-white">Select Location on Map</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Map Body */}
        <div className="relative w-full h-[400px] bg-gray-900">
          <MapContainer
            center={position}
            zoom={14}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeMapView center={position} />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>

          {/* Floating Instructions */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 backdrop-blur-md text-gray-200 text-xs px-4 py-2 rounded-full border border-gray-700 shadow-lg flex items-center gap-2 font-medium">
            <MapPin size={14} className="text-amber-400" /> Click or drag marker to target store location
          </div>

          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            className="absolute bottom-4 right-4 z-[1000] p-3 bg-amber-500 text-black rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-2 text-xs font-black uppercase tracking-wider"
          >
            <Crosshair size={16} /> Use GPS
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Selected: <span className="text-amber-400 font-mono font-bold">{position[0]?.toFixed(5)}, {position[1]?.toFixed(5)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-amber flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
            >
              <Check size={16} /> Confirm Location
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
