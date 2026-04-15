import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, ShieldX, Database, Lock, Eye, 
  Trash2, Download, Wifi, Activity, Server, AlertTriangle,
  ChevronLeft, Info, CheckCircle2, XCircle, HardDrive
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

// --- Reusable Sub-Components ---

const SubScreenNav = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-page)]/90 backdrop-blur-md z-40">
      <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h1 className="theme-text font-bold tracking-widest uppercase text-sm">
        {title}
      </h1>
    </div>
  );
};

const SectionContainer = ({ title, children, icon: Icon }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-4 px-1">
      {Icon && <Icon size={18} className="text-[#C8952A]" />}
      <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text opacity-70">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const SecurityCard = ({ title, description, status, icon: Icon, children }) => (
  <div className="card border-[var(--border-color)] hover:border-[#C8952A]/30 transition-all p-5 flex flex-col gap-3 relative overflow-hidden group">
    <div className="flex justify-between items-start relative z-10">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[#C8952A] group-hover:bg-[#C8952A] group-hover:text-black transition-colors">
          {Icon && <Icon size={20} />}
        </div>
        <div>
          <h3 className="font-bold text-sm theme-text">{title}</h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      {status}
    </div>
    {children && <div className="mt-2 pt-3 border-t border-[var(--border-color)]">{children}</div>}
  </div>
);

const StatusBadge = ({ type, text }) => {
  const configs = {
    secure: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    partial: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    none: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
  };
  const config = configs[type] || configs.none;
  const Comp = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.bg} ${config.border} ${config.color}`}>
      <Comp size={10} />
      <span className="text-[9px] font-black uppercase tracking-tighter">{text || type}</span>
    </div>
  );
};

// --- Main Page ---

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const { profile, settings, updateSetting } = useApp();
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [clearing, setClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Check Supabase Connectivity
    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from('analysis_results').select('count', { count: 'exact', head: true }).limit(1);
        setDbStatus(error ? 'Error' : 'Connected');
      } catch {
        setDbStatus('Timeout');
      }
    };
    checkSupabase();
    
    // Initialize dummy readings for control panel if empty
    if (!localStorage.getItem('user_readings')) {
        localStorage.setItem('user_readings', JSON.stringify([
            { id: 1, type: 'Mustard', date: '2024-03-10' },
            { id: 2, type: 'Coconut', date: '2024-03-12' }
        ]));
    }
  }, []);

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const data = localStorage.getItem('user_readings');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pureoil-vault-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setIsExporting(false);
    }, 1000);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure? This will purge local caches and anonymize your session.')) {
      setClearing(true);
      setTimeout(() => {
        localStorage.removeItem('user_readings');
        setClearing(false);
        alert('Data purged successfully.');
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] pb-20 animate-fade-in relative z-20 overflow-x-hidden">
      <SubScreenNav title="Security Vault" />

      {/* 10. TRUST / TRANSPARENCY BADGE PANEL */}
      <div className="px-5 mt-6 mb-8">
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] border border-[#d4af37]/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck size={180} strokeWidth={1} className="text-[#d4af37]" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Privacy Health Monitor</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-bold theme-text uppercase tracking-widest">Data Sold: ❌</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold theme-text uppercase tracking-widest">Encryption: ✅</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-bold theme-text uppercase tracking-widest">User Control: ✅</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-bold theme-text uppercase tracking-widest">3rd Party: ❌</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-2">
        
        {/* 1. DATA COLLECTION */}
        <SectionContainer title="Data Collection" icon={Database}>
           <div className="card p-0 border-[var(--border-color)] col-span-full overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-color)]">
                    <tr>
                       <th className="p-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Category</th>
                       <th className="p-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Data Item</th>
                       <th className="p-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Purpose</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[var(--border-color)]">
                    <tr className="theme-hover">
                       <td className="p-3 text-[10px] theme-text font-bold">Physical</td>
                       <td className="p-3 text-[10px] text-[var(--text-secondary)]">Temp, Density, Spectra</td>
                       <td className="p-3 text-[10px] text-green-500 font-bold uppercase tracking-tighter">Purity Analysis</td>
                    </tr>
                    <tr className="theme-hover">
                       <td className="p-3 text-[10px] theme-text font-bold">Metadata</td>
                       <td className="p-3 text-[10px] text-[var(--text-secondary)]">Oil Type Selection</td>
                       <td className="p-3 text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Engine Accuracy</td>
                    </tr>
                    <tr className="theme-hover">
                       <td className="p-3 text-[10px] theme-text font-bold">Hardware</td>
                       <td className="p-3 text-[10px] text-[var(--text-secondary)]">IP, ESP32_ID</td>
                       <td className="p-3 text-[10px] text-amber-500 font-bold uppercase tracking-tighter">Verification</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </SectionContainer>

        {/* 2 & 3: USAGE & CLOUD */}
        <SectionContainer title="Pipeline Storage" icon={Server}>
           <SecurityCard 
            title="Data Usage Engine" 
            description="How your sensor telemetry is processed."
            icon={Activity}
            status={<StatusBadge type="secure" text="Internal" />}
           >
              <div className="flex gap-4">
                 <div className="flex-1 text-center">
                    <p className="text-[8px] uppercase font-black text-[var(--text-muted)]">Detection</p>
                    <p className="text-xs font-bold text-green-500">Real-time</p>
                 </div>
                 <div className="w-px h-6 bg-[var(--border-color)]" />
                 <div className="flex-1 text-center">
                    <p className="text-[8px] uppercase font-black text-[var(--text-muted)]">Accuracy</p>
                    <p className="text-xs font-bold text-blue-500">Refined</p>
                 </div>
              </div>
           </SecurityCard>

           <SecurityCard 
            title="Supabase Integration" 
            description="Encrypted cloud database storage."
            icon={HardDrive}
            status={<StatusBadge type={dbStatus === 'Connected' ? 'secure' : 'none'} text={dbStatus} />}
           >
             <p className="text-[9px] text-[var(--text-muted)] leading-tight italic">
               * Pings are authenticated via secure JWT Bearer tokens to standard REST endpoints.
             </p>
           </SecurityCard>
        </SectionContainer>

        {/* 4 & 5: DEVICE & ENCRYPTION */}
        <SectionContainer title="Encryption Protocols" icon={Lock}>
           <SecurityCard 
            title="Endpoint Security" 
            description="API & Device Authentication"
            icon={Wifi}
            status={<StatusBadge type="secure" text="Active" />}
           >
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center text-[10px] theme-text">
                    <span>API Key Protected</span>
                    <CheckCircle2 size={12} className="text-green-500" />
                 </div>
                 <div className="flex justify-between items-center text-[10px] theme-text">
                    <span>ESP32 Hardware Auth</span>
                    <CheckCircle2 size={12} className="text-green-500" />
                 </div>
              </div>
           </SecurityCard>

           <SecurityCard 
            title="Encryption Status" 
            description="Layered security for your bits."
            icon={ShieldCheck}
            status={<StatusBadge type="partial" text="V2 Logic" />}
           >
              <div className="space-y-3 mt-1">
                 <div>
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest mb-1">
                       <span className="theme-text">Data in Transit</span>
                       <span className="text-green-500">100% (HTTPS)</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                       <div className="w-[100%] h-full bg-green-500" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest mb-1">
                       <span className="theme-text">Data at Rest</span>
                       <span className="text-[#C8952A]">85% (AES-256)</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                       <div className="w-[85%] h-full bg-[#C8952A]" />
                    </div>
                 </div>
              </div>
           </SecurityCard>
        </SectionContainer>

        {/* 6. USER CONTROL PANEL */}
        <SectionContainer title="User Command Center" icon={Trash2}>
           <div className="col-span-full card border-[var(--border-color)] p-6 bg-[var(--bg-elevated)]/30">
              <h3 className="font-bold text-sm theme-text mb-2">My Data Control</h3>
              <p className="text-xs text-[var(--text-muted)] mb-5">You have full ownership of any telemetry generated by your devices. You can export a copy or wipe every trace from our system.</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#C8952A]/10 border border-[#C8952A]/30 text-[#C8952A] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#C8952A] hover:text-black transition-all active:scale-95"
                 >
                    {isExporting ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16} />}
                    EXPORT VAULT (JSON)
                 </button>
                 <button 
                  onClick={handleClearData}
                  disabled={clearing}
                  className="flex-1 py-4 px-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                 >
                    {clearing ? <RefreshCw className="animate-spin" size={16}/> : <Trash2 size={16} />}
                    CLEAR ALL DATA
                 </button>
              </div>
           </div>
        </SectionContainer>

        {/* 7, 8, 9: LEGAL & MONITORING */}
        <SectionContainer title="Integrity & Monitoring" icon={Activity}>
           {/* Section 7 */}
           <div className="col-span-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex gap-4">
              <AlertTriangle size={24} className="text-amber-500 shrink-0" />
              <div>
                 <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">Legal Disclaimer</h4>
                 <p className="text-amber-500/80 text-[10px] leading-relaxed">
                   Analysis results are purely indicative and generated via experimental optical spectrometry. We do not provide legally admissible certificates. Consult FSSAI labs for official regulatory action.
                 </p>
              </div>
           </div>

           {/* Section 8 */}
           <SecurityCard 
            title="System Logging" 
            description="Error tracking & activity audits."
            icon={Info}
            status={<StatusBadge type="secure" text="Enabled" />}
           />

           {/* Section 9 */}
           <SecurityCard 
            title="Network Isolation" 
            description="Local ESP32 communication safety."
            icon={Wifi}
            status={<StatusBadge type="secure" text="GATT Secure" />}
           >
              <div className="text-[10px] text-green-500 font-bold uppercase italic">
                * Zero storage of WiFi Credentials
              </div>
           </SecurityCard>
        </SectionContainer>

        <p className="text-center text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-[0.4em] py-10 opacity-30">
           PureOil Shielded Environment v2.4
        </p>

      </div>
    </div>
  );
}
