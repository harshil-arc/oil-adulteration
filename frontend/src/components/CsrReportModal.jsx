import { useRef } from 'react';
import { Award, Download, X, ShieldCheck, Heart, Zap, CheckCircle2 } from 'lucide-react';
import { generateCsrReport } from '../services/foodRedistributionService';

export default function CsrReportModal({ isOpen, onClose, donorName = 'Taj Palace Banquets' }) {
  const reportRef = useRef(null);

  if (!isOpen) return null;

  const report = generateCsrReport({ donorName });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Award className="text-[#d4af37]" size={20} />
            <h3 className="text-sm font-black text-[var(--text-color)]">Corporate CSR & Impact Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="px-3 py-1.5 rounded-xl bg-[#d4af37] text-black font-black text-xs flex items-center gap-1 hover:scale-105 transition-transform shadow-glow-gold">
              <Download size={14} /> Download Certificate (PDF/PNG)
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT BODY */}
        <div ref={reportRef} className="p-6 sm:p-8 space-y-6 theme-bg text-[var(--text-color)]">
          
          <div className="border-b-2 border-[#d4af37] pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#d4af37] block mb-1">FOOD 360 FOOD SAFETY NETWORK</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">CSR & Sustainability Impact Report</h1>
              <p className="text-xs text-gray-400 mt-0.5">Zero Food Waste & Carbon Reduction Compliance</p>
            </div>
            <div className="text-right bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] text-xs font-mono">
              <p className="font-bold text-[#d4af37]">{report.certId}</p>
              <p className="text-gray-400">{report.issueDate}</p>
            </div>
          </div>

          {/* Org & Month Banner */}
          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Recognized Corporate Partner</span>
              <h3 className="text-xl font-black text-white">{report.donorName}</h3>
              <p className="text-xs text-emerald-400 font-semibold">{report.orgType}</p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold">
              ✓ {report.complianceBadge}
            </span>
          </div>

          {/* 4 Impact Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-pink-500/30">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Meals Donated</span>
              <p className="text-3xl font-black text-pink-400 font-mono">{report.mealsDonated}</p>
              <span className="text-[10px] text-pink-300 font-bold">100% Quality Verified</span>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Food Waste Saved</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">{report.foodSavedKg} kg</p>
              <span className="text-[10px] text-emerald-300 font-bold">Landfill Diversion</span>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-blue-500/30">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">CO₂ Prevented</span>
              <p className="text-3xl font-black text-blue-400 font-mono">{report.co2SavedKg} kg</p>
              <span className="text-[10px] text-blue-300 font-bold">Greenhouse Footprint</span>
            </div>
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-purple-500/30">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">NGO Partners</span>
              <p className="text-3xl font-black text-purple-400 font-mono">{report.ngosHelped}</p>
              <span className="text-[10px] text-purple-300 font-bold">Direct Beneficiaries</span>
            </div>
          </div>

          {/* Verification Footer Disclaimer */}
          <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 text-xs text-gray-400 text-center space-y-1">
            <p className="font-bold text-gray-300">CSR Compliance Verification:</p>
            <p>"This certificate verifies that all food redistributed by {report.donorName} satisfied Spectrophotometric safety standards and was transferred directly to accredited relief organizations."</p>
          </div>

        </div>

      </div>
    </div>
  );
}
