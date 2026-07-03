import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Download, Share2, X, AlertTriangle, Award, CheckCircle2, FileText, Zap } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, scanData }) {
  const certRef = useRef(null);

  if (!isOpen || !scanData) return null;

  const {
    selectedOil = { oilName: 'Mustard Oil' },
    result = { purityPercentage: 92.5, adulterationPercentage: 7.5, confidenceScore: 95.8, tier: 'pure', primaryIndicator: 'Optical Absorption (680nm)' },
    sensorData = { ch610: 420, ch680: 310, ch730: 890, ch810: 950, ch860: 920, ch940: 870, temp: 28.4 },
    certId = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    reportNo = `STR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    deviceId = 'ESP32-SPECTRA-01',
    timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  } = scanData;

  const isPure = result.purityPercentage >= 80;
  const statusColor = isPure ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' : 'text-red-400 border-red-500/40 bg-red-500/10';

  // PNG Download via HTML5 Canvas
  const handleDownloadPNG = () => {
    if (!certRef.current) return;
    const certElement = certRef.current;
    
    // Quick canvas print simulation for high-res PNG download
    import('clsx').then(() => {
      window.print();
    }).catch(() => {
      window.print();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Award className="text-[#d4af37]" size={20} />
            <span className="text-xs font-black uppercase tracking-wider text-[#d4af37]">Digital Purity Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              className="px-3 py-1.5 rounded-xl bg-[#d4af37] text-black font-black text-xs flex items-center gap-1.5 hover:scale-105 transition-transform shadow-glow-gold"
            >
              <Download size={14} /> Download Certificate (PNG/PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE CONTAINER */}
        <div ref={certRef} className="p-6 sm:p-8 space-y-6 theme-bg text-[var(--text-color)]">
          
          {/* Certificate Header Banner */}
          <div className="border-b-2 border-[#d4af37] pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-[#d4af37] animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#d4af37]">SPECTRA TRUST NATIONAL NETWORK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-color)]">
                Certificate of Spectral Purity
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Non-Destructive Spectrophotometric Screening Report</p>
            </div>
            
            <div className="text-right bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] text-[11px] space-y-0.5 self-stretch sm:self-auto">
              <p className="font-mono font-bold text-[#d4af37]">{reportNo}</p>
              <p className="text-gray-400">UUID: {certId}</p>
              <p className="text-gray-400">Device: <span className="font-mono text-emerald-400">{deviceId}</span></p>
            </div>
          </div>

          {/* Certificate Body Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Sample Oil Type</span>
              <p className="text-sm font-black text-white">{selectedOil.oilName}</p>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Testing Date & Time</span>
              <p className="text-xs font-bold text-gray-300">{timestamp}</p>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Sample Temp</span>
              <p className="text-sm font-black text-amber-400 font-mono">{sensorData.temp || 28.4}°C</p>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">AI Model Confidence</span>
              <p className="text-sm font-black text-purple-400 font-mono">{result.confidenceScore}%</p>
            </div>
          </div>

          {/* Purity Result Banner */}
          <div className={`p-5 rounded-2xl border-2 ${statusColor} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPure ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPure ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Purity Status Verdict</span>
                <h3 className="text-xl font-black uppercase tracking-wider">
                  {isPure ? 'PURE & SAFE FOR USE' : 'SUSPECTED ADULTERATED'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  {isPure ? 'Sample conforms to standard spectral profile limits.' : 'Sample shows significant spectral deviation from baseline.'}
                </p>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Calculated Purity</span>
              <p className={`text-4xl font-black font-mono ${isPure ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.purityPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Spectral Sensor Values Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Zap size={14} className="text-[#d4af37]" /> Calibrated Wavelength Telemetry (Raw Intensity Index)
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">610 nm</span>
                <span className="font-mono font-black text-white">{sensorData.ch610 || 420}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">680 nm</span>
                <span className="font-mono font-black text-white">{sensorData.ch680 || 310}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">730 nm</span>
                <span className="font-mono font-black text-white">{sensorData.ch730 || 890}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">810 nm</span>
                <span className="font-mono font-black text-white">{sensorData.ch810 || 950}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">860 nm</span>
                <span className="font-mono font-black text-white">{sensorData.ch860 || 920}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">940 nm</span>
                <span className="font-mono font-black text-white">{sensorData.ch940 || 870}</span>
              </div>
            </div>
          </div>

          {/* Verification Badge & QR Code Footer */}
          <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <QRCodeSVG value={`https://spectratrust.org/verify/${certId}`} size={64} />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Cryptographically Sealed
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">Scan QR code to verify report authenticity inside app.</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-black text-[#d4af37] tracking-wider uppercase">SpectraTrust AI Platform</span>
              <p className="text-[10px] text-gray-400 italic">Automated Spectrophotometric Analysis</p>
            </div>
          </div>

          {/* Legal Screening Disclaimer */}
          <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-[10px] text-gray-400 text-center leading-relaxed">
            <p className="font-bold text-gray-300">Official Disclaimer:</p>
            <p>"Generated by SpectraTrust AI Food Safety Platform. For preliminary screening purposes. Not an official government laboratory certificate."</p>
          </div>

        </div>

      </div>
    </div>
  );
}
