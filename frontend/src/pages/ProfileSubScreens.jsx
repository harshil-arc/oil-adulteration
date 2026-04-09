import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import { Download } from 'lucide-react';

// Reusable Top Nav for Sub Screens
const SubScreenNav = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-5 border-b border-[#333] sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-40">
      <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-[#1c1c1c] text-white hover:bg-[#333] transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h1 className="text-white font-bold tracking-widest uppercase text-sm">
        {title}
      </h1>
    </div>
  );
};

// 1. Privacy & Security Screen
export function PrivacySecurity() {
  const { settings, updateSetting, profile } = useApp();
  
  const handleExportData = async () => {
    const { data, error } = await supabase
      .from('oil_readings')
      .select('*');
    
    if (error) return alert("Failed to export data.");
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pureoil_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleDeleteData = async () => {
    if (!confirm("⚠️ CAUTION: This will permanently delete all your specific sensor readings and analysis results from the database. This cannot be undone. Proceed?")) return;
    
    try {
      // Note: Real implementation would target user_id or specific device_id
      const { error } = await supabase.from('oil_readings').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      if (error) throw error;
      alert("✅ All your sensor data has been purged successfully.");
    } catch (e) {
      alert("Error purging data: " + e.message);
    }
  };

  const handleChangePin = () => {
    const newPin = prompt("Enter a new 4-digit App PIN (or leave empty to disable):");
    if (newPin === null) return;
    if (newPin && !/^\d{4}$/.test(newPin)) {
      return alert("Invalid PIN. Please enter exactly 4 digits.");
    }
    updateSetting('appPin', newPin || null);
    alert(newPin ? "✅ PIN Security Enabled" : "🔓 PIN Security Disabled");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pb-24 animate-fade-in relative z-20">
      <SubScreenNav title="Privacy & Security" />
      <div className="p-5 flex flex-col gap-6">
        
        <div className="card p-0 border-[#333] flex flex-col divide-y divide-[#1c1c1c]">
          <div onClick={handleChangePin} className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1c1c1c] transition-colors">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-[#d4af37]" />
              <div>
                <span className="font-bold text-sm block leading-tight">App Lock / PIN</span>
                <span className="text-xs text-gray-500">{settings.appPin ? '🔒 Enabled' : '🔓 Disabled'}</span>
              </div>
            </div>
            <ChevronLeft size={16} className="text-gray-600 rotate-180" />
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint size={18} className="text-[#d4af37]" />
              <div>
                <span className="font-bold text-sm block leading-tight">Biometric Unlock</span>
                <span className="text-xs text-gray-400">Face ID / Fingerprint fallback (PWA)</span>
              </div>
            </div>
            <div className="w-12 h-6 bg-[#333] rounded-full relative flex items-center px-1 opacity-50">
               <div className="w-4 h-4 bg-gray-500 rounded-full" />
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff size={18} className="text-[#d4af37]" />
              <div>
                <span className="font-bold text-sm block leading-tight">Anonymous Analytics</span>
                <span className="text-xs text-gray-500">Share crash data with dev team</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={settings.dataSharing} onChange={() => updateSetting('dataSharing', !settings.dataSharing)} />
               <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleExportData} className="flex items-center gap-3 p-4 card border-[#333] text-white bg-[#141414] hover:bg-[#1c1c1c] transition-colors">
            <Download size={18} className="text-[#d4af37]" />
            <span className="font-bold text-sm">Export My Data (JSON)</span>
          </button>

          <button onClick={handleDeleteData} className="flex items-center gap-3 p-4 card border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors">
            <Trash2 size={18} />
            <span className="font-bold text-sm">Delete My Data Record</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. About PureOil Screen
export function AboutApp() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pb-24 animate-fade-in relative z-20">
      <SubScreenNav title="About PureOil" />
      <div className="p-5 flex flex-col items-center flex-1">
         <div className="w-24 h-24 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-black rounded-[2rem] flex flex-col items-center justify-center shadow-glow-gold relative overflow-hidden mt-10 mb-6">
           <Shield size={48} strokeWidth={1} fill="currentColor" />
         </div>
         <h1 className="text-3xl font-black text-white">Pure<span className="text-[#d4af37]">Oil</span></h1>
         <p className="text-gray-500 text-xs mt-1 font-bold tracking-widest uppercase">Version 2.4.0 (Build 402)</p>

         <div className="w-full mt-12 card border-[#333] p-0 flex flex-col divide-y divide-[#1c1c1c]">
           <button className="p-4 flex items-center justify-between text-left hover:bg-[#1c1c1c] transition-colors">
             <span className="text-sm font-bold text-gray-200">Developer</span>
             <span className="text-xs text-gray-500">Ministry of Health Setup</span>
           </button>
           <button onClick={() => window.open('https://fssai.gov.in', '_blank')} className="p-4 flex items-center justify-between text-left hover:bg-[#1c1c1c] transition-colors">
             <span className="text-sm font-bold text-gray-200">FSSAI Authority Gateway</span>
             <ExternalLink size={16} className="text-[#d4af37]" />
           </button>
           <button className="p-4 flex items-center justify-between text-left hover:bg-[#1c1c1c] transition-colors">
             <span className="text-sm font-bold text-gray-200">Open Source Licenses</span>
             <ChevronLeft size={16} className="text-gray-600 rotate-180" />
           </button>
         </div>

         <p className="mt-auto text-center text-xs text-gray-600 max-w-[250px]">
           © 2026 PureOil Ecosystem. All rights reserved. Designed for professional field inspection.
         </p>
      </div>
    </div>
  );
}

// 3. Learning Center
export function LearningCenter() {
  const videos = [
    { title: "How to connect your ESP32 Wi-Fi", duration: "2:45" },
    { title: "Interpreting Optical Spectra", duration: "4:12" },
    { title: "Filing an FSSAI Action Report", duration: "3:05" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pb-24 animate-fade-in relative z-20">
      <SubScreenNav title="Learning Center" />
      <div className="p-5 flex flex-col gap-6">
        
        <div>
          <h2 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase mb-3">Video Tutorials</h2>
          <div className="flex flex-col gap-3">
            {videos.map((vid, idx) => (
              <div key={idx} className="card p-3 border-[#333] flex items-center gap-4 hover:border-[#d4af37]/50 cursor-pointer transition-colors group">
                <div className="w-24 h-16 bg-[#1c1c1c] rounded-lg border border-[#333] flex items-center justify-center relative overflow-hidden group-hover:border-[#d4af37]">
                  <PlayCircle size={24} className="text-[#d4af37] z-10" />
                  <div className="absolute inset-0 bg-[#d4af37]/5 group-hover:bg-[#d4af37]/20 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight mb-1">{vid.title}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{vid.duration} • Official</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase mb-3 mt-4">Manuals & Guides</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="card border-[#333] p-4 flex flex-col gap-3 hover:bg-[#1c1c1c] cursor-pointer text-center items-center">
               <BookOpen size={24} className="text-gray-400" />
               <span className="font-bold text-xs">Standard Operating Procedure</span>
            </div>
            <div className="card border-[#333] p-4 flex flex-col gap-3 hover:bg-[#1c1c1c] cursor-pointer text-center items-center">
               <AlertCircle size={24} className="text-gray-400" />
               <span className="font-bold text-xs">Troubleshooting Sensor</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// 4. Reports List
export function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('violation_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setReports(data);
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pb-24 animate-fade-in relative z-20">
      <SubScreenNav title="Compliance Reports" />
      
      <div className="p-5 flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-2 border-[#333] border-t-[#d4af37] rounded-full animate-spin" />
             <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Loading Reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-20 border-dashed border-[#333] bg-transparent flex flex-col items-center">
             <FileText size={48} className="text-[#1c1c1c] mb-4" />
             <p className="text-sm text-gray-500 font-bold mb-1">No violation reports found.</p>
             <p className="text-[10px] text-gray-600 uppercase tracking-widest">Only confirmed unsafe scans generate reports.</p>
          </div>
        ) : (
          reports.map(r => (
            <div key={r.id} className="card p-4 border-[#333] flex flex-col gap-3 hover:bg-[#1c1c1c] cursor-pointer">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-black text-sm text-white">{r.brand}</h3>
                   <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Ref: {r.id}</p>
                 </div>
                 <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 font-bold text-[10px] tracking-widest uppercase border border-red-500/20">
                   {r.status}
                 </span>
               </div>
               
               <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#333]">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Violation</p>
                 <p className="text-[#d4af37] font-bold text-xs">{r.violation}</p>
               </div>
               
               <div className="flex justify-between items-center mt-1">
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{new Date(r.created_at || r.date).toLocaleDateString()}</p>
                  <button className="text-[10px] text-[#d4af37] font-bold tracking-widest uppercase flex items-center gap-1">
                    VIEW DETAILS <ChevronLeft size={14} className="rotate-180" />
                  </button>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
