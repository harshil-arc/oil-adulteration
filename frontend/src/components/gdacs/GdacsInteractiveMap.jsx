/**
 * GdacsInteractiveMap.jsx
 * Leaflet OpenStreetMap with Severity-Color Coded Custom Pins & Popups for GDACS Disasters
 */

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { SEVERITY_CONFIG } from '../../models/gdacsModel';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Severity DivIcon creator
function createSeverityMarkerIcon(severity = 'Green', disasterType = '') {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Green;
  const color = config.hex;

  let emoji = '⚠️';
  const typeLower = (disasterType || '').toLowerCase();
  if (typeLower.includes('flood')) emoji = '🌊';
  else if (typeLower.includes('earthquake')) emoji = '🌋';
  else if (typeLower.includes('cyclone') || typeLower.includes('storm')) emoji = '🌀';
  else if (typeLower.includes('volcano')) emoji = '🌋';
  else if (typeLower.includes('wildfire')) emoji = '🔥';
  else if (typeLower.includes('tsunami')) emoji = '🌊';
  else if (typeLower.includes('drought')) emoji = '☀️';

  return new L.DivIcon({
    className: 'custom-gdacs-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      left: -16px;
      top: -32px;
      position: relative;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2.5px solid #ffffff;
      box-shadow: 0 0 16px ${color}aa;
      cursor: pointer;
    ">
      <span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

// Controller component to center map when alerts update
function MapCenterController({ alerts }) {
  const map = useMap();
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const valid = alerts.filter(a => a.latitude !== 0 || a.longitude !== 0);
      if (valid.length > 0) {
        // Fit bounds or fly to first item
        const bounds = L.latLngBounds(valid.map(a => [a.latitude, a.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      }
    }
  }, [alerts, map]);
  return null;
}

export default function GdacsInteractiveMap({ alerts = [] }) {
  const mapAlerts = useMemo(() => {
    return alerts.filter(a => typeof a.latitude === 'number' && typeof a.longitude === 'number' && !isNaN(a.latitude) && !isNaN(a.longitude));
  }, [alerts]);

  const defaultCenter = [20.0, 0.0]; // Global Center

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden border border-gray-200 dark:border-[#30363d] shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={2}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController alerts={mapAlerts} />

        {mapAlerts.map((alert) => {
          const icon = createSeverityMarkerIcon(alert.severity, alert.disasterType);
          const sevConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.Green;

          return (
            <Marker
              key={alert.id}
              position={[alert.latitude, alert.longitude]}
              icon={icon}
            >
              <Popup className="gdacs-map-popup">
                <div className="p-1 max-w-[260px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${sevConfig.badgeBg}`}>
                      {sevConfig.label} Severity ({alert.severity})
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      {alert.disasterType}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-gray-900 leading-tight mb-1">
                    {alert.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 mb-1">
                    <MapPin size={12} className="text-red-500 shrink-0" />
                    <span>{alert.country}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                    <Calendar size={11} className="shrink-0" />
                    <span>{alert.date}</span>
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-snug mb-2">
                    {alert.description}
                  </p>

                  <a
                    href={alert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors shadow-sm"
                  >
                    <span>Read More on GDACS</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
