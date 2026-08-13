import { useState } from 'react';
import { AlertTriangle, MapPin, ShieldAlert, X, ChevronRight } from 'lucide-react';
import CommunityReportModal from './CommunityReportModal';

export default function AdulterationWarningCard({ scanData, threshold = 20 }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isAdulterated = scanData?.result?.tier === 'heavy' || scanData?.result?.result === 'ADULTERATED';
  const adulterationPercentage = typeof scanData?.result?.adulterationPercentage === 'number' ? scanData.result.adulterationPercentage : 0;

  // Only display if adulterated and user has not dismissed card
  if (!isAdulterated || dismissed) {
    return null;
  }

  return (
    <>
      <div className="w-full bg-gradient-to-r from-red-950/60 via-amber-950/50 to-red-950/60 border border-red-500/40 p-5 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in my-4">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400 mt-0.5 shadow-glow-red">
              <AlertTriangle size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-red-400 tracking-wide">⚠ Suspected Adulteration Detected</h4>
                <span className="bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  {adulterationPercentage > 0 ? `${adulterationPercentage.toFixed(1)}% Adulterated` : 'Adulterated Sample'}
                </span>
              </div>

              <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                This oil sample appears to be adulterated based on spectral analysis.
              </p>
              <p className="text-xs text-amber-300/90 font-medium mt-1">
                Would you like to help protect other consumers by reporting this location?
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-gray-400 hover:text-white rounded-full bg-black/40 border border-gray-800 transition-colors shrink-0"
            title="Dismiss Warning"
          >
            <X size={14} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-red-500/20 relative z-10">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-red-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <ShieldAlert size={16} /> Report to Community Map
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="py-3 px-4 bg-black/50 hover:bg-black/80 text-gray-300 border border-gray-700 font-bold text-xs rounded-2xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        scanData={scanData}
      />
    </>
  );
}
