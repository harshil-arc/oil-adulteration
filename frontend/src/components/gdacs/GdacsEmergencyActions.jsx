/**
 * GdacsEmergencyActions.jsx
 * Emergency Section with quick actions:
 * - Call 112
 * - Nearest Hospital
 * - Relief Camp
 * - Share Location
 * - Emergency Kit Checklist
 * - Offline Safety Guide
 */

import React, { useState } from 'react';
import { Phone, Building2, Tent, Navigation, PackageCheck, BookOpen, CheckCircle, Copy } from 'lucide-react';
import GdacsEmergencyKitModal from './GdacsEmergencyKitModal';
import GdacsOfflineGuideModal from './GdacsOfflineGuideModal';

export default function GdacsEmergencyActions({ onSelectReliefCamp, onSelectHospital }) {
  const [kitModalOpen, setKitModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  // Quick Action: Share Location
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `Emergency Location: Lat ${pos.coords.latitude.toFixed(4)}, Long ${pos.coords.longitude.toFixed(4)}`;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(coords);
            setCopiedLocation(true);
            setTimeout(() => setCopiedLocation(false), 3000);
          } else {
            alert(coords);
          }
        },
        () => {
          alert('Unable to fetch precise GPS coordinates. Ensure location permissions are granted.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
            Emergency Response & SOS Actions
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Immediate assistance, emergency contacts & readiness tools
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-red-500/10 text-red-500 border border-red-500/20">
          SOS Ready
        </span>
      </div>

      {/* Grid of 6 Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 1. Call 112 */}
        <a
          href="tel:112"
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-md shadow-red-600/20 transition-all cursor-pointer group"
        >
          <Phone size={24} className="mb-2 group-hover:animate-bounce" />
          <span className="text-xs font-black uppercase tracking-wider">Call 112</span>
          <span className="text-[9px] text-red-100/80 font-medium">National Emergency</span>
        </a>

        {/* 2. Nearest Hospital */}
        <button
          onClick={() => onSelectHospital ? onSelectHospital() : alert('Searching for nearest verified hospitals...')}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 transition-all cursor-pointer group"
        >
          <Building2 size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">Nearest Hospital</span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Medical Assistance</span>
        </button>

        {/* 3. Relief Camp */}
        <button
          onClick={() => onSelectReliefCamp ? onSelectReliefCamp() : alert('Showing active relief camps on map...')}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer group"
        >
          <Tent size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">Relief Camp</span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Shelter & Rations</span>
        </button>

        {/* 4. Share Location */}
        <button
          onClick={handleShareLocation}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 transition-all cursor-pointer group"
        >
          {copiedLocation ? (
            <CheckCircle size={24} className="mb-2 text-emerald-500 animate-bounce" />
          ) : (
            <Navigation size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-black uppercase tracking-wider">
            {copiedLocation ? 'GPS Copied!' : 'Share Location'}
          </span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Send Coords to Rescue</span>
        </button>

        {/* 5. Emergency Kit Checklist */}
        <button
          onClick={() => setKitModalOpen(true)}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 transition-all cursor-pointer group"
        >
          <PackageCheck size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">Emergency Kit</span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Readiness Checklist</span>
        </button>

        {/* 6. Offline Safety Guide */}
        <button
          onClick={() => setGuideModalOpen(true)}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 transition-all cursor-pointer group"
        >
          <BookOpen size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">Offline Guide</span>
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Survival Guidelines</span>
        </button>
      </div>

      {/* Modals */}
      <GdacsEmergencyKitModal 
        isOpen={kitModalOpen} 
        onClose={() => setKitModalOpen(false)} 
      />
      <GdacsOfflineGuideModal 
        isOpen={guideModalOpen} 
        onClose={() => setGuideModalOpen(false)} 
      />
    </div>
  );
}
