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
    <div className="rounded-3xl bg-[#11151e] border border-gray-800 p-6 shadow-xl space-y-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            EMERGENCY RESPONSE & SOS ACTIONS
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Immediate assistance, emergency contacts & readiness tools
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
          SOS READY
        </span>
      </div>

      {/* Grid of 6 Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {/* 1. Call 112 */}
        <a
          href="tel:112"
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer group"
        >
          <Phone size={24} className="mb-2 group-hover:animate-bounce" />
          <span className="text-xs font-black uppercase tracking-wider">CALL 112</span>
          <span className="text-[9px] text-red-100 font-bold mt-0.5">National Emergency</span>
        </a>

        {/* 2. Nearest Hospital */}
        <button
          onClick={() => onSelectHospital ? onSelectHospital() : alert('Searching for nearest verified hospitals...')}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#162036] hover:bg-[#1c2947] border border-blue-500/40 text-blue-400 transition-all cursor-pointer group shadow-md"
        >
          <Building2 size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider text-blue-300">NEAREST HOSPITAL</span>
          <span className="text-[9px] text-gray-400 font-medium mt-0.5">Medical Assistance</span>
        </button>

        {/* 3. Relief Camp */}
        <button
          onClick={() => onSelectReliefCamp ? onSelectReliefCamp() : alert('Showing active relief camps on map...')}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#122b24] hover:bg-[#183b32] border border-emerald-500/40 text-emerald-400 transition-all cursor-pointer group shadow-md"
        >
          <Tent size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">RELIEF CAMP</span>
          <span className="text-[9px] text-gray-400 font-medium mt-0.5">Shelter & Rations</span>
        </button>

        {/* 4. Share Location */}
        <button
          onClick={handleShareLocation}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#231a3a] hover:bg-[#2e234c] border border-purple-500/40 text-purple-400 transition-all cursor-pointer group shadow-md"
        >
          {copiedLocation ? (
            <CheckCircle size={24} className="mb-2 text-emerald-400 animate-bounce" />
          ) : (
            <Navigation size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-black uppercase tracking-wider text-purple-300">
            {copiedLocation ? 'GPS COPIED!' : 'SHARE LOCATION'}
          </span>
          <span className="text-[9px] text-gray-400 font-medium mt-0.5">Send Coords to Rescue</span>
        </button>

        {/* 5. Emergency Kit Checklist */}
        <button
          onClick={() => setKitModalOpen(true)}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#2b2416] hover:bg-[#382f1d] border border-amber-500/40 text-amber-400 transition-all cursor-pointer group shadow-md"
        >
          <PackageCheck size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">EMERGENCY KIT</span>
          <span className="text-[9px] text-gray-400 font-medium mt-0.5">Readiness Checklist</span>
        </button>

        {/* 6. Offline Safety Guide */}
        <button
          onClick={() => setGuideModalOpen(true)}
          className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#152733] hover:bg-[#1b3445] border border-cyan-500/40 text-cyan-400 transition-all cursor-pointer group shadow-md"
        >
          <BookOpen size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300">OFFLINE GUIDE</span>
          <span className="text-[9px] text-gray-400 font-medium mt-0.5">Survival Guidelines</span>
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
