/**
 * OverpassInteractiveMap.jsx
 * Leaflet OpenStreetMap with Category-Color Coded Custom Markers & Popups
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Phone, ExternalLink, MapPin } from 'lucide-react';
import { OVERPASS_CATEGORIES, getNavigationUrl } from '../../models/overpassModel';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Category Marker Icon Creator
function createCategoryMarkerIcon(categoryKey) {
  const config = OVERPASS_CATEGORIES[categoryKey] || OVERPASS_CATEGORIES.NGO;
  const color = config.color;
  const symbol = config.symbol;

  return new L.DivIcon({
    className: 'custom-overpass-marker',
    html: `<div style="
      background: ${color};
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      left: -15px;
      top: -30px;
      position: relative;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2.5px solid #ffffff;
      box-shadow: 0 0 14px ${color}aa;
      cursor: pointer;
    ">
      <span style="transform: rotate(45deg); font-size: 13px;">${symbol}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
}

// User GPS Pulse Icon Creator
function createUserLocationIcon() {
  return new L.DivIcon({
    className: 'custom-user-gps-marker',
    html: `<div style="
      background: #3b82f6;
      width: 20px;
      height: 20px;
      left: -10px;
      top: -10px;
      position: relative;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

// Map Controller Component to adjust map view dynamically and handle click pinning
function MapViewController({ userCoords, resources, onSelectLocation }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (onSelectLocation && e.latlng) {
        onSelectLocation(e.latlng.lat, e.latlng.lng, `Pinned: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
      }
    }
  });

  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();

        if (userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lon === 'number' && !isNaN(userCoords.lat) && !isNaN(userCoords.lon)) {
          const validResources = (resources || []).filter(
            r => r && typeof r.latitude === 'number' && typeof r.longitude === 'number' && !isNaN(r.latitude) && !isNaN(r.longitude) && r.latitude !== 0 && r.longitude !== 0
          );

          if (validResources.length > 0) {
            const boundsPoints = validResources.map(r => [r.latitude, r.longitude]);
            boundsPoints.push([userCoords.lat, userCoords.lon]);
            const bounds = L.latLngBounds(boundsPoints);
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            } else {
              map.setView([userCoords.lat, userCoords.lon], 13);
            }
          } else {
            map.setView([userCoords.lat, userCoords.lon], 13);
          }
        }
      } catch (err) {
        console.warn('[Overpass MapViewController Error]', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [userCoords?.lat, userCoords?.lon, resources?.length, map]);

  return null;
}

export default function OverpassInteractiveMap({ userCoords, resources = [], onSelectLocation }) {
  const center = [userCoords?.lat || 28.6139, userCoords?.lon || 77.2090];
  const userIcon = createUserLocationIcon();

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden border border-gray-200 dark:border-[#30363d] shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController userCoords={userCoords} resources={resources} onSelectLocation={onSelectLocation} />

        {/* User GPS Location Marker */}
        {userCoords?.lat && userCoords?.lon && (
          <Marker position={[userCoords.lat, userCoords.lon]} icon={userIcon}>
            <Popup>
              <div className="p-1 text-xs text-center font-bold">
                📍 You Are Here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Resource Markers */}
        {resources.map((resource) => {
          const icon = createCategoryMarkerIcon(resource.category);
          const navUrl = getNavigationUrl(resource.latitude, resource.longitude, resource.name, userCoords?.lat, userCoords?.lon);

          return (
            <Marker
              key={resource.id}
              position={[resource.latitude, resource.longitude]}
              icon={icon}
            >
              <Popup className="overpass-map-popup">
                <div className="p-1 max-w-[250px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${resource.categoryConfig.badgeBg}`}>
                      {resource.categoryConfig.symbol} {resource.categoryLabel}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 font-mono">
                      {resource.distanceKm} km away
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-gray-900 leading-tight mb-1">
                    {resource.name}
                  </h3>

                  <div className="flex items-start gap-1 text-[10px] font-semibold text-gray-600 mb-2">
                    <MapPin size={11} className="text-red-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{resource.address}</span>
                  </div>

                  {resource.phone && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-2">
                      <Phone size={10} className="text-blue-500 shrink-0" />
                      <a href={`tel:${resource.phone}`} className="font-mono font-bold hover:underline">
                        {resource.phone}
                      </a>
                    </div>
                  )}

                  <a
                    href={navUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-sm"
                  >
                    <Navigation size={12} />
                    <span>Navigate Now</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-md p-2 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-around text-[9px] font-bold text-gray-700 dark:text-gray-300 overflow-x-auto scrollbar-none">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> NGO</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Hospital</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Shelter</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Police</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Fire</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Ambulance</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Food Bank</span>
      </div>
    </div>
  );
}
