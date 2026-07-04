import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Phone, DollarSign, Clock, Thermometer, Container } from 'lucide-react';

export default function SampleGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-fade-in">
      <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-2xl w-full space-y-5 my-auto max-h-[90vh] overflow-y-auto text-xs">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
          <div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">Official FSSAI & NABL Guidelines</span>
            <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
              <FileText className="text-[#d4af37]" size={22} /> Food & Oil Sample Submission Guide
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Overview Box */}
        <div className="bg-[#d4af37]/10 p-4 rounded-2xl border border-[#d4af37]/30 text-gray-300 space-y-1.5">
          <span className="font-black text-[#d4af37] uppercase tracking-wider text-[10px] flex items-center gap-1">
            <ShieldCheck size={14} /> FSSAI Accredited Sample Standard
          </span>
          <p className="leading-relaxed">
            Follow this official protocol to submit cooking oil, ghee, milk, or packaged food samples to NABL accredited laboratories for legally admissible purity reports.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 font-black text-white text-sm">
              <Container className="text-blue-400" size={18} />
              <span>1. Container & Volume</span>
            </div>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li><strong>Oil/Ghee:</strong> Min 100ml in clean PET or glass bottle.</li>
              <li><strong>Milk/Dairy:</strong> Min 250ml in sterilized glass container.</li>
              <li><strong>Spices/Solid Food:</strong> Min 200g in sealed pouch.</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 font-black text-white text-sm">
              <AlertTriangle className="text-amber-400" size={18} />
              <span>2. Prevent Contamination</span>
            </div>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Do NOT touch inner neck or cap rim with fingers.</li>
              <li>Ensure container is 100% dry and moisture-free.</li>
              <li>Seal cap with tamper-evident tape or wax seal.</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 font-black text-white text-sm">
              <Thermometer className="text-rose-400" size={18} />
              <span>3. Transport Precautions</span>
            </div>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li>Keep away from direct sunlight & hot car trunks.</li>
              <li>Maintain milk/dairy at 4°C using ice gel pack.</li>
              <li>Deliver sample to lab within 24 hours of collection.</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 font-black text-white text-sm">
              <DollarSign className="text-emerald-400" size={18} />
              <span>4. Fee & Timeline</span>
            </div>
            <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
              <li><strong>Govt Testing Fee:</strong> ₹350 - ₹1,200 per sample.</li>
              <li><strong>Processing Time:</strong> 24 to 48 Hours.</li>
              <li>Digital report sent via SMS, Email & FSSAI portal.</li>
            </ul>
          </div>

        </div>

        {/* Emergency Helpline Banner */}
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="font-bold text-emerald-400 text-xs block">National Food Safety Helpline</span>
            <span className="text-base font-black text-white font-mono">1800-11-2100 (Toll Free)</span>
          </div>
          <a href="tel:1800112100" className="btn-primary py-2 px-4 text-xs font-black flex items-center gap-1.5 shrink-0">
            <Phone size={14} /> Call FSSAI Emergency
          </a>
        </div>

        <button onClick={onClose} className="btn-secondary w-full py-3 text-xs font-black uppercase">
          Got It, Close Guide
        </button>

      </div>
    </div>
  );
}
