/**
 * GdacsAlertDetailModal.jsx
 * Full Detailed Modal View for GDACS Live Disaster Advisories
 * Displays comprehensive fetched disaster information, coordinates, risk metrics & emergency protocols.
 */

import React, { useState } from 'react';
import { 
  X, MapPin, Calendar, Compass, AlertTriangle, ShieldCheck, 
  ExternalLink, Copy, Check, Phone, Building2, Tent, Radio,
  Droplets, Activity, Wind, Flame, Waves, CloudRain, Sun, Mountain 
} from 'lucide-react';
import { SEVERITY_CONFIG } from '../../models/gdacsModel';

// Category Icon Resolver
function CategoryIcon({ disasterType, className = "w-6 h-6" }) {
  const type = (disasterType || '').toLowerCase();

  if (type.includes('flood')) return <Droplets className={className} />;
  if (type.includes('earthquake')) return <Activity className={className} />;
  if (type.includes('cyclone') || type.includes('storm')) return <Wind className={className} />;
  if (type.includes('volcano')) return <Flame className={className} />;
  if (type.includes('tsunami')) return <Waves className={className} />;
  if (type.includes('wildfire')) return <Flame className={className} />;
  if (type.includes('storm')) return <CloudRain className={className} />;
  if (type.includes('drought')) return <Sun className={className} />;
  if (type.includes('landslide')) return <Mountain className={className} />;

  return <AlertTriangle className={className} />;
}

// Disaster Specific Safety Protocols
function getSafetyProtocol(disasterType) {
  const type = (disasterType || '').toLowerCase();

  if (type.includes('flood')) {
    return [
      'Seek higher ground immediately and stay away from river banks & drainage channels.',
      'Do not attempt to walk, swim, or drive through moving flood waters.',
      'Disconnect electrical appliances if safe to do so; avoid contact with standing water.'
    ];
  }
  if (type.includes('landslide')) {
    return [
      'Evacuate steep slopes, river valleys, and landslide-prone hill tracks immediately.',
      'Listen for unusual sounds like trees cracking or boulders knocking together.',
      'Stay alert during heavy rainfall for sudden surges of mud and debris flow.'
    ];
  }
  if (type.includes('cyclone') || type.includes('storm')) {
    return [
      'Stay indoors and stay away from glass windows and doors.',
      'Ensure emergency battery lights, power banks, and non-perishable rations are stocked.',
      'Do not step outside during the eye of the storm as severe winds resume suddenly.'
    ];
  }
  if (type.includes('earthquake')) {
    return [
      'Drop, Cover, and Hold On under heavy sturdy furniture or an interior door frame.',
      'Move away from windows, heavy mirrors, overhead lights, and high cabinets.',
      'If outdoors, move to an open area away from power lines, trees, and tall buildings.'
    ];
  }
  return [
    'Monitor official NDMA & local disaster authority advisories closely.',
    'Keep emergency SOS contacts ready and maintain a packed survival kit.',
    'Follow official evacuation orders promptly without delay.'
  ];
}

export default function GdacsAlertDetailModal({ alert, onClose, onSelectHospital, onSelectReliefCamp }) {
  const [copied, setCopied] = useState(false);

  if (!alert) return null;

  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.Green;
  const safetySteps = getSafetyProtocol(alert.disasterType);

  const handleCopyAlert = () => {
    const text = `🚨 DISASTER ADVISORY: ${alert.title}\n📍 Location: ${alert.location}, ${alert.country}\n⚠️ Severity: ${alert.severity}\n📅 Date: ${alert.date}\n\nSummary:\n${alert.description}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <div className="relative w-full max-w-2xl bg-[#11151e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-white space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0 shadow-md">
              <CategoryIcon disasterType={alert.disasterType} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                  {alert.disasterType} ADVISORY
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${severityConfig.badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${severityConfig.dotClass}`} />
                  {alert.severity === 'Red' ? 'RED (HIGH RISK)' : alert.severity === 'Orange' ? 'ORANGE (MEDIUM RISK)' : `${alert.severity} (LOW)`}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                GDACS Global Live Disaster Advisory Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title Headline */}
        <div>
          <h2 className="text-lg md:text-xl font-black text-white leading-snug">
            {alert.title}
          </h2>
        </div>

        {/* Metadata Cards Grid (4 Info Tiles) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#161c28] border border-gray-800 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <MapPin size={12} className="text-red-400" />
              LOCATION
            </span>
            <span className="text-xs font-bold text-white truncate mt-1">
              {alert.country}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#161c28] border border-gray-800 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Calendar size={12} className="text-blue-400" />
              TIMESTAMP
            </span>
            <span className="text-xs font-bold text-white truncate mt-1">
              {alert.date}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#161c28] border border-gray-800 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Compass size={12} className="text-emerald-400" />
              COORDINATES
            </span>
            <span className="text-xs font-mono font-bold text-white truncate mt-1">
              {alert.latitude ? alert.latitude.toFixed(2) : '0.00'}°, {alert.longitude ? alert.longitude.toFixed(2) : '0.00'}°
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#161c28] border border-gray-800 flex flex-col justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Radio size={12} className="text-amber-400" />
              STATUS
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider truncate mt-1">
              ACTIVE MONITORING
            </span>
          </div>
        </div>

        {/* Detailed Description Box */}
        <div className="p-5 rounded-2xl bg-[#161c28] border border-gray-800 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            Full Advisory Situation Report
          </h3>
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed pt-1">
            {alert.description}
          </p>
        </div>

        {/* Recommended Safety Protocols */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <ShieldCheck size={16} />
            Immediate Safety & Response Protocol ({alert.disasterType})
          </h3>
          <ul className="space-y-2 text-xs text-emerald-200">
            {safetySteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyAlert}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Details!' : 'Copy Summary'}</span>
            </button>

            <a
              href="tel:112"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Phone size={14} />
              <span>Call 112 SOS</span>
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={alert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>External GDACS Source</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
