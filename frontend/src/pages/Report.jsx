import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, CheckSquare, ExternalLink, ArrowLeft, 
  FileText, Phone, Building, Info, AlertTriangle, Sparkles, CheckCircle2,
  Clipboard, ClipboardCheck, Zap
} from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);

  const scanData = location.state?.scanData;
  const isAdulteratedScan = scanData && (
    scanData.purity < 80 ||
    scanData.adulteration > 20 ||
    scanData.quality === 'Unsafe' ||
    scanData.status?.toLowerCase().includes('adulterat')
  );

  useEffect(() => {
    if (isAdulteratedScan && !autoOpened) {
      const timer = setTimeout(() => {
        try {
          window.open('https://foscos.fssai.gov.in/', '_blank', 'noopener,noreferrer');
          setAutoOpened(true);
        } catch (_) {}
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAdulteratedScan, autoOpened]);

  const handleCopyFssaiUrl = () => {
    navigator.clipboard.writeText('https://foscos.fssai.gov.in/');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const buildDossierText = () => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
    const oilType = scanData?.oilType || scanData?.oil_type || 'Edible Oil';
    const purity  = scanData?.purity != null ? `${parseFloat(scanData.purity).toFixed(1)}%` : 'N/A';
    const conf    = scanData?.confidence != null ? `${scanData.confidence}%` : 'N/A';
    return `--- FSSAI FOOD ADULTERATION COMPLAINT ---\n\nOil Type Tested : ${oilType}\nPurity Score    : ${purity}\nAI Confidence   : ${conf}\nScan Timestamp  : ${timestamp}\nDetection Tool  : Food 360 Spectral Analyser (ESP32 + AS7343)\nApp Reference   : ${scanData?.reportNo || 'Auto-Generated'}\n\nFINDING: This oil sample has been flagged as potentially adulterated by\nan AI-assisted spectrophotometric screening device.\n\nACTION REQUESTED: Please investigate and take regulatory action.\n\nNOTE: Preliminary AI screening only. Lab confirmation recommended.\n\nSubmitted via Food 360 App — foscos.fssai.gov.in\n-----------------------------------------`;
  };

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(buildDossierText());
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 3000);
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 relative overflow-x-hidden">

      {/* Ambient glow — very subtle, won't affect readability */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-blue-600 opacity-[0.04] rounded-full blur-[120px] pointer-events-none dark:opacity-[0.08]" />

      {/* ── HEADER ── */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              Report Food <span className="text-blue-500">Adulteration</span>
            </h1>
            <span className="bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={10} /> Official Gateway
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-medium">Government of India Regulatory Portals</p>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto">

        {/* ── ADULTERATED SCAN CARD (shown only when navigated from scan) ── */}
        {isAdulteratedScan && (
          <div className="rounded-3xl border border-red-500/50 bg-red-50 dark:bg-red-950/30 p-5 space-y-4">
            {autoOpened && (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl px-3 py-2">
                <Zap size={12} className="shrink-0" />
                FSSAI portal auto-opened in a new tab
              </div>
            )}

            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-500/20 pb-2.5">
              <AlertTriangle size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest">Possible Adulteration Detected</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-snug">
              Our AI-assisted screening indicates this sample may be adulterated. This is a preliminary screening and is <strong className="text-[var(--text-primary)]">NOT</strong> a legally certified laboratory report.
            </p>

            {/* Scan Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] text-xs font-mono font-bold">
              <div>
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block font-sans mb-0.5">Oil Type</span>
                <span className="text-[var(--text-primary)]">{scanData.oilType || scanData.oil_type || 'Edible Oil'}</span>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block font-sans mb-0.5">Purity</span>
                <span className="text-red-500">{scanData.purity ? parseFloat(scanData.purity).toFixed(1) : 'Low'}%</span>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block font-sans mb-0.5">AI Confidence</span>
                <span className="text-purple-500">{scanData.confidence || 95}%</span>
              </div>
              <div className="border-l border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block font-sans mb-0.5">Scan Time</span>
                <span className="text-[var(--text-secondary)]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Clipboard Assistant */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-500/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <p className="text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">1-Tap Complaint Clipboard Assistant</p>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                Copy your scan details as pre-formatted complaint text, then paste it directly into the FSSAI portal form.
              </p>
              <button
                onClick={handleCopyDossier}
                className="w-full py-3.5 rounded-2xl border border-amber-400 dark:border-amber-500/50 bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                {copiedDossier ? (
                  <><ClipboardCheck size={16} className="text-emerald-600 dark:text-emerald-400" /> Complaint Text Copied!</>
                ) : (
                  <><Clipboard size={16} /> Copy Scan Details for FSSAI Portal</>
                )}
              </button>
            </div>

            {/* Primary CTA */}
            <a
              href="https://foscos.fssai.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-red-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity block text-center cursor-pointer shadow-md"
            >
              <ExternalLink size={16} /> Open FSSAI Portal & File Complaint
            </a>
          </div>
        )}

        {/* ── INTRO CARD ── */}
        <div className="card p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)] leading-tight">Report Food Adulteration</h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Government Regulatory Gateway</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)]">
            If you suspect a food product is adulterated, file an official complaint with the appropriate government authority. Official agencies have the legal authority to investigate and take action.
          </p>

          <div className="space-y-2 pt-1">
            {[
              'Report suspected food adulteration directly to regulatory authorities.',
              'Complaints must be submitted to the official government portal.',
              'Keep your purchase bill, product photographs, and packaging ready.',
              'Note the product batch number and manufacturing details if available.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRE-FILING CHECKLIST ── */}
        <div className="card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <CheckSquare size={15} /> Pre-Filing Document Checklist
            </h3>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Have These Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { title: 'Product Name',       desc: 'Exact name printed on label' },
              { title: 'Brand Name',         desc: 'Manufacturer or brand title' },
              { title: 'Batch Number',       desc: 'Printed on bottle / pouch (if available)' },
              { title: 'Manufacturing Date', desc: 'Mfd date / Best before date' },
              { title: 'Purchase Bill',      desc: 'Store receipt or GST invoice' },
              { title: 'Product Photos',     desc: 'Clear front & back label photos' },
              { title: 'Place of Purchase',  desc: 'Store name & full address' },
              { title: 'Description',        desc: 'Observed smell, taste, color, or defect' },
            ].map((item, idx) => (
              <div key={idx} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-black">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── OFFICIAL PORTALS SECTION ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Official Government Portals</h3>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">100% Direct Govt Links</span>
          </div>

          {/* PORTAL 1: FoSCoS */}
          <div className="space-y-2">
            <a
              href="https://foscos.fssai.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-500/40 hover:opacity-95 transition-all text-left flex items-center justify-between block cursor-pointer shadow-md"
            >
              <div className="space-y-1 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-black text-white">1. Open FSSAI FoSCoS Portal</span>
                  <span className="bg-white/25 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Then → Consumer Grievance
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  foscos.fssai.gov.in → click "Consumer Grievance" in top nav
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ExternalLink size={20} />
              </div>
            </a>

            {/* URL bar */}
            <div className="flex items-center justify-between bg-[var(--bg-elevated)] px-3 py-2.5 rounded-xl border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-secondary)] font-mono truncate">https://foscos.fssai.gov.in/</span>
              <button
                onClick={handleCopyFssaiUrl}
                className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors ml-2"
              >
                {copiedUrl ? <CheckCircle2 size={12} className="text-emerald-500" /> : null}
                {copiedUrl ? 'Copied!' : 'Copy URL'}
              </button>
            </div>

            {/* ── STEP-BY-STEP GUIDE ── */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-950/25 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-blue-200 dark:border-blue-500/20 pb-2.5">
                <FileText size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-[11px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">How to File Your Complaint on FoSCoS</p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    step: '01',
                    title: 'Open the FoSCoS Portal',
                    desc: 'Tap the blue button above. The official FSSAI FoSCoS website will open in your browser.',
                    accent: { light: 'bg-blue-100 border-blue-300 text-blue-700', dark: 'dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-400' },
                    titleColor: 'text-blue-700 dark:text-blue-400',
                  },
                  {
                    step: '02',
                    title: 'Click "Consumer Grievance" in the Top Menu',
                    desc: 'On the FoSCoS page, look at the navigation bar at the top and click "Consumer Grievance" (it is between "Annual Return" and "FSSAI").',
                    accent: { light: 'bg-indigo-100 border-indigo-300 text-indigo-700', dark: 'dark:bg-indigo-500/15 dark:border-indigo-500/40 dark:text-indigo-400' },
                    titleColor: 'text-indigo-700 dark:text-indigo-400',
                  },
                  {
                    step: '03',
                    title: 'Register or Login',
                    desc: 'Create a free account using your mobile number or email, or log in if you already have one.',
                    accent: { light: 'bg-purple-100 border-purple-300 text-purple-700', dark: 'dark:bg-purple-500/15 dark:border-purple-500/40 dark:text-purple-400' },
                    titleColor: 'text-purple-700 dark:text-purple-400',
                  },
                  {
                    step: '04',
                    title: 'Select "Lodge Grievance" & Fill the Form',
                    desc: 'Enter the food business name, shop address, product details, and describe the adulteration you observed.',
                    accent: { light: 'bg-amber-100 border-amber-300 text-amber-700', dark: 'dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-400' },
                    titleColor: 'text-amber-700 dark:text-amber-400',
                  },
                  {
                    step: '05',
                    title: 'Paste Our Clipboard Text as Evidence',
                    desc: 'In the "Description" field, paste the scan details you copied from the Clipboard Assistant above as supporting technical evidence.',
                    accent: { light: 'bg-emerald-100 border-emerald-300 text-emerald-700', dark: 'dark:bg-emerald-500/15 dark:border-emerald-500/40 dark:text-emerald-400' },
                    titleColor: 'text-emerald-700 dark:text-emerald-400',
                  },
                  {
                    step: '06',
                    title: 'Upload Photos & Submit',
                    desc: 'Attach photos of the oil bottle, label, and purchase receipt. Click Submit — you will receive a Ticket Number to track your complaint status.',
                    accent: { light: 'bg-teal-100 border-teal-300 text-teal-700', dark: 'dark:bg-teal-500/15 dark:border-teal-500/40 dark:text-teal-400' },
                    titleColor: 'text-teal-700 dark:text-teal-400',
                  },
                ].map(({ step, title, desc, accent, titleColor }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 font-black text-[10px] font-mono ${accent.light} ${accent.dark}`}>
                      {step}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black leading-tight ${titleColor}`}>{title}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-snug mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Helpline banner */}
              <div className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded-xl px-3 py-2.5 border border-[var(--border-color)] mt-1">
                <Phone size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[10px] text-[var(--text-secondary)]">
                  <strong className="text-emerald-700 dark:text-emerald-400">Helpline:</strong>{' '}
                  Call <span className="font-mono font-black text-[var(--text-primary)]">1800-11-2100</span>{' '}
                  (Toll Free) to file your complaint by phone instead.
                </p>
              </div>
            </div>
          </div>

          {/* PORTAL 2: National Consumer Helpline */}
          <a
            href="https://consumerhelpline.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-500/40 hover:opacity-95 transition-all text-left flex items-center justify-between block cursor-pointer shadow-md"
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-white">2. National Consumer Helpline</span>
                <span className="bg-white/25 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Toll Free 1915
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Department of Consumer Affairs (consumerhelpline.gov.in)
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
          </a>

          {/* PORTAL 3: State Food Safety Dept */}
          <a
            href="https://www.fssai.gov.in/cms/commissioners-of-food-safety.php"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-5 rounded-3xl bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-blue-400 dark:hover:border-slate-500 transition-all text-left flex items-center justify-between block cursor-pointer"
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-[var(--text-primary)]">3. Find State Food Safety Dept</span>
                <span className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[var(--border-color)]">
                  State Directory
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Locate Food Safety Commissioners for your state / district.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center shrink-0 text-[var(--text-secondary)]">
              <Building size={20} />
            </div>
          </a>
        </div>

        {/* ── DISCLAIMER ── */}
        <div className="rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black uppercase text-[10px] tracking-wider">
            <Info size={14} /> Legal Advisory Disclaimer
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            This application provides AI-assisted screening based on sensor data. Scan results are indicative only and should not be considered official laboratory evidence. Government authorities may require additional information or laboratory testing before taking action.
          </p>
        </div>

      </div>
    </div>
  );
}
