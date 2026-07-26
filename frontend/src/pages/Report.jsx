import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, CheckSquare, ExternalLink, ArrowLeft, 
  FileText, Phone, Building, Info, AlertTriangle, Sparkles, CheckCircle2
} from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingPortal, setLoadingPortal] = useState(null); // 'fssai' | 'nch' | 'state' | null
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyFssaiUrl = () => {
    navigator.clipboard.writeText('https://foodsafetyconnect.fssai.gov.in/');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Check if opened with recent scan data from Analysis page
  const scanData = location.state?.scanData;
  const isAdulteratedScan = scanData && (scanData.purity < 80 || scanData.adulteration > 20 || scanData.quality === 'Unsafe');

  // External Portal URLs
  const OFFICIAL_PORTALS = {
    fssai: 'https://foodsafetyconnect.fssai.gov.in/',
    nch: 'https://consumerhelpline.gov.in/',
    state: 'https://www.fssai.gov.in/cms/commissioners-of-food-safety.php'
  };

  const handleLaunchPortal = (portalKey) => {
    const url = OFFICIAL_PORTALS[portalKey];
    if (!url) return;

    setLoadingPortal(portalKey);

    setTimeout(() => {
      try {
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (!win) {
          window.location.href = url;
        }
      } catch (err) {
        alert(`Could not automatically open the browser. Please visit the official portal directly:\n${url}`);
      } finally {
        setLoadingPortal(null);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* Government Blue Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600 opacity-[0.07] rounded-full blur-[140px] pointer-events-none" />

      {/* ── 1. HEADER ────────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                Report Food <span className="text-blue-400">Adulteration</span>
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={10} /> Official Gateway
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Government of India Regulatory Portals</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">

        {/* ── 2. SCAN RESULT INTEGRATION (If redirected from scan analysis) ── */}
        {scanData && (
          <div className="card p-5 rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-[var(--bg-card)] to-amber-950/30 relative overflow-hidden shadow-glow-red">
            <div className="flex items-center gap-2 text-red-400 border-b border-red-500/20 pb-2.5 mb-3">
              <AlertTriangle size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Possible Adulteration Detected</h3>
            </div>

            <p className="text-xs text-gray-300 leading-snug mb-4">
              Our AI-assisted screening indicates that this sample may be adulterated. This result is only a preliminary screening and is <strong>NOT</strong> a legally certified laboratory report.
            </p>

            {/* Scan Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-black/40 p-3 rounded-2xl border border-red-500/20 mb-4 text-xs font-mono font-bold">
              <div>
                <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Oil Type</span>
                <span className="text-white text-xs">{scanData.oilType || scanData.oil_type || 'Mustard Oil'}</span>
              </div>
              <div className="border-l border-gray-800">
                <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Purity</span>
                <span className="text-red-400 text-xs">{scanData.purity ? parseFloat(scanData.purity).toFixed(1) : '45.0'}%</span>
              </div>
              <div className="border-l border-gray-800">
                <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">AI Confidence</span>
                <span className="text-purple-400 text-xs">{scanData.confidence || 98}%</span>
              </div>
              <div className="border-l border-gray-800">
                <span className="text-[8px] text-gray-400 uppercase tracking-widest block font-sans">Scan Time</span>
                <span className="text-gray-300 text-[10px]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <a
              href="https://foodsafetyconnect.fssai.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-red flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform block text-center cursor-pointer"
            >
              <ExternalLink size={16} /> Report Through Official Government Portal (FSSAI)
            </a>
          </div>
        )}

        {/* ── 3. TITLE & SUBTITLE HEADER CARD ────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-blue-950/20 shadow-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Report Food Adulteration</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Government Regulatory Gateway</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)]">
            If you suspect that a food product is adulterated, file an official complaint with the appropriate government authority. Official agencies have the legal authority to investigate and take action.
          </p>

          <div className="space-y-2 pt-1 text-xs text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Report suspected food adulteration directly to regulatory authorities.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Complaints should be submitted to the official government portal.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Keep your purchase bill, product photographs, and packaging ready before filing a complaint.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>If available, note the product batch number and manufacturing details.</span>
            </div>
          </div>
        </div>

        {/* ── 4. PRE-FILING CHECKLIST SECTION ────────────────────────────── */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CheckSquare size={16} /> Pre-Filing Document Checklist
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Ensure Ready Before Filing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { title: 'Product Name', desc: 'Exact name printed on label' },
              { title: 'Brand Name', desc: 'Manufacturer or brand title' },
              { title: 'Batch Number', desc: 'Printed on bottle / pouch (if available)' },
              { title: 'Manufacturing Date', desc: 'Mfd date / Best before date' },
              { title: 'Purchase Bill', desc: 'Store receipt or GST invoice' },
              { title: 'Product Photos', desc: 'Clear front & back label photos' },
              { title: 'Place of Purchase', desc: 'Store name & full address' },
              { title: 'Description', desc: 'Observed smell, taste, color, or defect' }
            ].map((item, idx) => (
              <div key={idx} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. OFFICIAL ACTION BUTTONS ──────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 pl-1 flex items-center justify-between">
            <span>Official Government Reporting Portals</span>
            <span className="text-[9px] text-emerald-400 font-mono">100% Direct Govt Links</span>
          </h3>

          {/* BUTTON 1: FSSAI (Direct <a> Tag) */}
          <div className="space-y-2">
            <a
              href="https://foodsafetyconnect.fssai.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/40 hover:border-blue-300 transition-all text-left group shadow-glow-blue relative overflow-hidden flex items-center justify-between block cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black">1. Report to FSSAI</span>
                  <span className="bg-white/20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Food Safety Connect
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Official FSSAI Food Safety Connect portal (foodsafetyconnect.fssai.gov.in)
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ExternalLink size={20} />
              </div>
            </a>

            {/* Alternative FSSAI Portal Mirrors / Fallbacks */}
            <div className="flex gap-2 text-[10px] font-bold">
              <a
                href="https://foscos.fssai.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>FoSCoS Portal Mirror</span> <ExternalLink size={10} />
              </a>
              <a
                href="https://www.fssai.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>FSSAI Main Site</span> <ExternalLink size={10} />
              </a>
            </div>

            {/* Direct URL Display & 1-Tap Copy Bar */}
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-blue-500/20 text-xs font-mono">
              <span className="text-gray-300 truncate text-[11px]">https://foodsafetyconnect.fssai.gov.in/</span>
              <button
                onClick={handleCopyFssaiUrl}
                className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:text-white rounded-lg text-[10px] font-sans font-bold shrink-0 flex items-center gap-1"
              >
                {copiedUrl ? <CheckCircle2 size={12} className="text-emerald-400" /> : null}
                {copiedUrl ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>

          {/* BUTTON 2: NATIONAL CONSUMER HELPLINE (Direct <a> Tag) */}
          <a
            href="https://consumerhelpline.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400/40 hover:border-emerald-300 transition-all text-left group shadow-glow-teal relative overflow-hidden flex items-center justify-between block cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black">2. National Consumer Helpline</span>
                <span className="bg-white/20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Toll Free 1915
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Department of Consumer Affairs grievance portal (consumerhelpline.gov.in)
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
          </a>

          {/* BUTTON 3: FIND STATE FOOD SAFETY DEPARTMENT (Direct <a> Tag) */}
          <a
            href="https://www.fssai.gov.in/cms/commissioners-of-food-safety.php"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-5 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-slate-700 hover:border-slate-500 transition-all text-left group relative overflow-hidden flex items-center justify-between block cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black">3. Find State Food Safety Dept</span>
                <span className="bg-slate-700 text-slate-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  State Directory
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Locate Food Safety Commissioners for your state / district.
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Building size={20} />
            </div>
          </a>
        </div>

        {/* ── 6. PERMANENT DISCLAIMER ────────────────────────────────────── */}
        <div className="card p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20 text-xs text-gray-300 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-[10px] tracking-wider">
            <Info size={14} /> Legal Advisory Disclaimer
          </div>
          <p className="leading-relaxed text-[11px] text-gray-400">
            This application provides AI-assisted screening based on sensor data. Scan results are indicative only and should not be considered official laboratory evidence. Government authorities may require additional information or laboratory testing before taking action.
          </p>
        </div>

      </div>
    </div>
  );
}
