import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Globe, Wifi, Moon, Shield, Info, FileText, 
  BookOpen, LogOut, ChevronRight, Edit3, ShieldAlert
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, safe: 0, unsafe: 0 });
  const [reports, setReports] = useState([]);
  
  useEffect(() => {
    supabase.from('analysis_results').select('*')
      .then(({data}) => {
        if (!data) return;
        const total = data.length;
        const unsafe = data.filter(r => r.quality === 'Unsafe');
        setStats({
          total,
          safe: total - unsafe.length,
          unsafe: unsafe.length
        });
        setReports(unsafe.slice(0, 2)); // Mock FSSAI reports from unsafe scans
      });
  }, []);

  const settingsList = [
    { icon: Bell, title: 'Notifications', value: 'On' },
    { icon: Globe, title: 'Language', value: 'English' },
    { icon: Wifi, title: 'Default Connection Method', value: 'Bluetooth' },
    { icon: Moon, title: 'Dark Mode (AMOLED)', value: 'Enabled', noArrow: true },
    { icon: Shield, title: 'Privacy & Security' },
    { icon: Info, title: 'About PureOil' },
    { icon: FileText, title: 'FSSAI Guidelines' },
    { icon: BookOpen, title: 'Learning Center' }
  ];

  const handleSignOut = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white animate-fade-in relative z-20 pb-10">
       <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

       {/* Header */}
       <div className="px-5 pt-8 pb-4 relative z-10">
         <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
       </div>

       <div className="flex-1 px-5 flex flex-col gap-6 relative z-10">
          
          {/* Avatar Area */}
          <div className="flex items-center gap-4">
             <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-[#d4af37] p-1 shadow-glow-gold">
                   <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] flex items-center justify-center border border-[#333]">
                      <span className="text-2xl font-bold text-[#d4af37]">AD</span>
                   </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#d4af37] text-black rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                  <Edit3 size={12} />
                </div>
             </div>
             <div>
                <h2 className="text-xl font-bold text-white leading-tight">Inspector Admin</h2>
                <p className="text-gray-400 text-sm mb-2">admin@pureoil.gov.in</p>
                <button className="btn-secondary py-1.5 px-4 text-xs">
                   Edit Profile
                </button>
             </div>
          </div>

          {/* Stats Row */}
          <div className="card border-[#333] grid grid-cols-3 divide-x divide-[#333] p-0">
             <div className="flex flex-col items-center justify-center py-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Scans</p>
                <p className="text-[#d4af37] font-black text-xl">{stats.total}</p>
             </div>
             <div className="flex flex-col items-center justify-center py-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Safe</p>
                <p className="text-green-500 font-black text-xl">{stats.safe}</p>
             </div>
             <div className="flex flex-col items-center justify-center py-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Unsafe</p>
                <p className="text-red-500 font-black text-xl">{stats.unsafe}</p>
             </div>
          </div>

          {/* My Reports */}
          <div>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-bold text-white tracking-wider">My FSSAI Reports</h3>
               <button className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest">View All</button>
            </div>
            
            <div className="flex flex-col gap-3">
              {reports.length === 0 ? (
                <div className="card text-center py-6 border-dashed border-[#333] bg-transparent">
                  <p className="text-sm text-gray-500 font-medium">No violation reports generated yet.</p>
                </div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="card p-3 border-[#333] flex items-center justify-between hover:border-[#d4af37]/30 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                           <FileText size={18} />
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm">FSSAI Notice - {r.oil_type}</p>
                           <p className="text-xs text-gray-400">Generated {new Date(r.timestamp).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <button className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-lg border border-[#d4af37]/20">VIEW PDF</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Settings */}
          <div>
             <h3 className="text-sm font-bold text-white tracking-wider mb-3">Settings</h3>
             <div className="card border-[#333] p-0 overflow-hidden flex flex-col divide-y divide-[#1c1c1c]">
                {settingsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-[#1c1c1c] transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3">
                        <item.icon size={18} className="text-[#d4af37]" />
                        <span className="text-sm font-medium text-gray-200">{item.title}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {item.value && <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">{item.value}</span>}
                        {!item.noArrow && <ChevronRight size={16} className="text-gray-600 group-hover:text-[#d4af37] transition-colors" />}
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Sign Out */}
          <button 
            onClick={handleSignOut}
            className="mt-2 w-full py-4 flex items-center justify-center gap-2 border border-red-500/30 rounded-[20px] text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all bg-red-500/5 mb-8"
          >
             <LogOut size={18} />
             SIGN OUT
          </button>
       </div>
    </div>
  );
}
