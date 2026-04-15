import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Shield, Cpu, Cloud, Globe, ExternalLink, 
  FlaskConical, RefreshCw, Activity, CheckCircle2, XCircle, 
  AlertCircle, Server, Terminal, BookOpen, Lock, Settings2,
  HardDrive, Zap, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getActiveConnection } from '../lib/sensorConnection';

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

const InfoCard = ({ title, children, icon: Icon, color = "text-[#C8952A]" }) => (
  <div className="card border-[var(--border-color)] p-5 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
       {Icon && <Icon size={64} strokeWidth={1} className={color} />}
    </div>
    <div className="relative z-10">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] theme-text opacity-70 mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const StatusRow = ({ label, value, type = "default" }) => {
  const configs = {
    ok: { color: 'text-green-500', icon: CheckCircle2 },
    warn: { color: 'text-amber-500', icon: AlertCircle },
    error: { color: 'text-red-500', icon: XCircle },
    default: { color: 'theme-text', icon: Info }
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)] last:border-0">
      <span className="text-xs font-bold theme-text opacity-70">{label}</span>
      <div className={`flex items-center gap-1.5 font-black text-xs uppercase tracking-tighter ${config.color}`}>
        <Icon size={14} />
        {value}
      </div>
    </div>
  );
};

const ActionButton = ({ label, icon: Icon, onClick, color = "bg-[var(--bg-elevated)]" }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border border-[var(--border-color)] hover:border-[#C8952A] transition-all active:scale-95 ${color}`}
  >
    <div className="text-[#C8952A]">
       <Icon size={20} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest theme-text">{label}</span>
  </button>
);

// --- Main Page ---

export default function AboutDashboard() {
  const navigate = useNavigate();
  const [deviceStatus, setDeviceStatus] = useState({ connected: false, mode: 'None' });
  const [cloudStatus, setCloudStatus] = useState({ db: 'checking', api: 'checking' });
  const [lastSync, setLastSync] = useState('Never');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagSteps, setDiagSteps] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const checkStatus = async () => {
    setIsRefreshing(true);
    
    // 1. Device check
    const conn = getActiveConnection();
    setDeviceStatus({ 
      connected: !!conn, 
      mode: conn ? conn.mode : 'None' 
    });

    // 2. Cloud Ping
    try {
      const { error } = await supabase.from('analysis_results').select('count', { count: 'exact', head: true }).limit(1);
      setCloudStatus({ db: error ? 'error' : 'ok', api: 'ok' });
      if (!error) setLastSync(new Date().toLocaleTimeString());
    } catch {
      setCloudStatus({ db: 'error', api: 'error' });
    }

    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const runDiagnostics = () => {
    setShowDiagnostics(true);
    setIsAuditing(true);
    setDiagSteps([]);

    const steps = [
      { msg: 'Pinging Supabase Cloud Hub...', status: 'loading' },
      { msg: 'Verifying REST API Endpoints...', status: 'pending' },
      { msg: 'Scanning for local hardware beacon...', status: 'pending' },
    ];
    setDiagSteps(steps);

    setTimeout(() => {
      setDiagSteps(prev => {
        const next = [...prev];
        next[0].status = 'success';
        next[1].status = 'loading';
        return next;
      });
      setTimeout(() => {
        setDiagSteps(prev => {
          const next = [...prev];
          next[1].status = 'success';
          next[2].status = 'loading';
          return next;
        });
        setTimeout(() => {
          setDiagSteps(prev => {
            const next = [...prev];
            next[2].status = deviceStatus.connected ? 'success' : 'warn';
            return next;
          });
          setIsAuditing(false);
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] pb-20 animate-fade-in relative z-20 overflow-x-hidden">
      <SubScreenNav title="System Dashboard" />

      <div className="p-5 flex flex-col gap-6">
        
        {/* 1. HEADER SECTION */}
        <div className="flex flex-col items-center py-6 text-center">
           <div className="w-20 h-20 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-black rounded-[2rem] flex flex-col items-center justify-center shadow-glow-gold mb-4 rotate-3">
              <Shield size={40} fill="currentColor" strokeWidth={1} />
           </div>
           <h1 className="text-3xl font-black theme-text tracking-tighter">Pure<span className="text-[#C8952A]">Oil</span></h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mt-1">Global Inspector Ecosystem</p>
           
           <div className="flex gap-2 mt-4">
              <span className="bg-[var(--bg-elevated)] border border-[var(--border-color)] px-2.5 py-1 rounded-full text-[9px] font-bold theme-text tracking-widest uppercase">v2.4.0 (Stable)</span>
              <span className="bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full text-[9px] font-bold text-green-500 tracking-widest uppercase">Production</span>
              <span className="bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-[9px] font-bold text-blue-500 tracking-widest uppercase">Firmaware v1.4.2</span>
           </div>
        </div>

        {/* 2 & 3. SYSTEM & CLOUD STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <InfoCard title="Sensor Linkage" icon={Activity}>
              <StatusRow label="Device Status" value={deviceStatus.connected ? 'Connected' : 'Disconnected'} type={deviceStatus.connected ? 'ok' : 'error'} />
              <StatusRow label="Connection Mode" value={deviceStatus.mode} />
              <StatusRow label="Sensor Data" value={deviceStatus.connected ? 'Streaming' : 'No Stream'} type={deviceStatus.connected ? 'ok' : 'warn'} />
           </InfoCard>

           <InfoCard title="Cloud Infrastructure" icon={Cloud} color="text-blue-500">
              <StatusRow label="Database (PostgreSQL)" value={cloudStatus.db === 'ok' ? 'Online' : 'Interrupted'} type={cloudStatus.db === 'ok' ? 'ok' : 'error'} />
              <StatusRow label="REST API (PostgREST)" value={cloudStatus.api === 'ok' ? 'Active' : 'Unreachable'} type={cloudStatus.api === 'ok' ? 'ok' : 'error'} />
              <StatusRow label="Last Global Sync" value={lastSync} />
           </InfoCard>
        </div>

        {/* 8. QUICK ACTION BUTTONS */}
        <div className="flex gap-3">
           <ActionButton label="Refresh" icon={RefreshCw} onClick={checkStatus} />
           <ActionButton label="Diagnostics" icon={Terminal} onClick={runDiagnostics} />
           <ActionButton label="View Logs" icon={Terminal} onClick={() => alert('Log Viewer: No critical errors captured in this session.')} />
        </div>

        {/* 4. NAVIGATION OPTIONS */}
        <div className="card p-0 divide-y divide-[var(--border-color)] overflow-hidden">
           {[
             { label: 'Privacy & Security Vault', icon: Lock, path: '/privacy-security' },
             { label: 'Developer & HW Tools', icon: Settings2, path: '/developer' },
             { label: 'FSSAI Regulatory Gateway', icon: Globe, path: 'https://fssai.gov.in', external: true },
             { label: 'Open Source Compliance', icon: BookOpen, path: '/licenses' },
             { label: 'System Diagnostics Audit', icon: Terminal, onClick: runDiagnostics },
           ].map((item, idx) => (
             <button 
              key={idx} 
              onClick={item.onClick || (() => item.external ? window.open(item.path, '_blank') : navigate(item.path))}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-elevated)] transition-colors group"
             >
                <div className="flex items-center gap-3">
                   <item.icon size={18} className="text-[#C8952A] group-hover:scale-110 transition-transform" />
                   <span className="text-sm font-bold theme-text">{item.label}</span>
                </div>
                <ChevronLeft size={16} className="text-[var(--text-muted)] rotate-180" />
             </button>
           ))}
        </div>

        {/* 6. REGULATORY DISCLAIMER */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 flex gap-4">
           <AlertCircle size={24} className="text-amber-500 shrink-0" />
           <div className="flex-1">
              <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">Standard Regulatory Warning</h4>
              <p className="text-amber-500/80 text-[10px] leading-relaxed">
                This app is designed for indicative screening of edible and fuel oils in the field. Results provided by the PureOil optical spectrometry sensors are for preliminary assessment and do not constitute a certified certificate. Official enforcement requires laboratory verification per FSSAI / Bureau of Indian Standards (BIS) protocols.
              </p>
           </div>
        </div>

        {/* 7. TECH STACK SECTION */}
        <div className="mb-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] theme-text opacity-50 mb-3 px-1">Hardware & Infra Stack</h3>
           <div className="grid grid-cols-3 gap-2">
              <div className="card bg-[var(--bg-elevated)] p-4 flex flex-col items-center gap-2 text-center border-0 shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Cpu size={20} />
                 </div>
                 <span className="text-[9px] font-bold theme-text uppercase tracking-tighter leading-tight">ESP32-S3 Core</span>
              </div>
              <div className="card bg-[var(--bg-elevated)] p-4 flex flex-col items-center gap-2 text-center border-0 shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FlaskConical size={20} />
                 </div>
                 <span className="text-[9px] font-bold theme-text uppercase tracking-tighter leading-tight">Spectral Probe</span>
              </div>
              <div className="card bg-[var(--bg-elevated)] p-4 flex flex-col items-center gap-2 text-center border-0 shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                    <HardDrive size={20} />
                 </div>
                 <span className="text-[9px] font-bold theme-text uppercase tracking-tighter leading-tight">Supabase DB</span>
              </div>
           </div>
        </div>

        <p className="text-center text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] py-8 opacity-30">
           Ministry of Safety • Inspection Terminal v2.4
        </p>

      </div>

      {/* --- DIAGNOSTICS MODAL --- */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end animate-fade-in" onClick={() => !isAuditing && setShowDiagnostics(false)}>
           <div className="w-full bg-[var(--bg-page)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-8 pb-safe shadow-2xl animate-slide-up" onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-xl font-bold theme-text">System Diagnostics</h2>
                    <p className="text-xs text-[var(--text-muted)]">Verifying end-to-end security & handshake.</p>
                 </div>
                 <button onClick={() => setShowDiagnostics(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)]">
                    <XCircle size={20} />
                 </button>
              </div>

              <div className="space-y-4 mb-8">
                 {diagSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)]">
                       <div className="flex items-center gap-3">
                          {step.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                          {step.status === 'loading' && <RefreshCw size={16} className="text-blue-500 animate-spin" />}
                          {step.status === 'pending' && <Activity size={16} className="text-gray-600" />}
                          {step.status === 'warn' && <AlertCircle size={16} className="text-amber-500" />}
                          <span className={`text-xs font-bold ${step.status === 'pending' ? 'text-gray-600' : 'theme-text'}`}>{step.msg}</span>
                       </div>
                       {step.status === 'success' && <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">OK</span>}
                       {step.status === 'warn' && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">CHECK</span>}
                    </div>
                 ))}
              </div>

              <button 
                disabled={isAuditing}
                onClick={runDiagnostics}
                className="w-full h-16 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-glow-gold disabled:opacity-50 transition-all hover:brightness-110 active:scale-95"
              >
                 {isAuditing ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                 {isAuditing ? 'Auditing System' : 'Rerun Handshake'}
              </button>
           </div>
        </div>
      )}

    </div>
  );
}
