import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, ChevronRight, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('analysis_results').select('*').order('timestamp', { ascending: false }).limit(5)
      .then(({data}) => { 
        if (data) setReadings(data);
        setLoading(false);
      });
      
    // Quick real-time sub
    const channel = supabase.channel('home_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analysis_results' }, (payload) => {
        setReadings(prev => [payload.new, ...prev].slice(0, 5));
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalScans = readings.length; // usually would be a count query, but mock for now
  const safeScans = readings.filter(r => r.quality !== 'Unsafe').length;
  const unsafeScans = readings.filter(r => r.quality === 'Unsafe').length;

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Hey, Inspector 👋</h1>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#333] flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#d4af37] rounded-full shadow-glow-gold" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/20 transition-colors shadow-glow-gold text-nowrap">
            <Sparkles size={14} fill="currentColor" />
            ASK AI
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-[20px] p-6 shadow-glow-gold border border-[#d4af37]/30 bg-[#141414]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[10px] font-bold text-[#d4af37] uppercase tracking-widest mb-4">
            <Sparkles size={10} />
            AI Powered
          </div>
          <h2 className="text-3xl font-black text-white mb-2 leading-tight">Test Your Oil</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-[200px] leading-relaxed">
            Detect adulterants instantly with your ESP32 sensor.
          </p>
          <button 
            onClick={() => navigate('/scan')}
            className="btn-primary w-fit pr-4"
          >
            <span>START SCAN</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card flex flex-col items-center justify-center py-4 px-2 hover:bg-[#1c1c1c] transition-colors border-[#333]">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Scans</p>
          <p className="text-2xl font-black text-white">{loading ? '-' : totalScans}</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 hover:bg-[#1c1c1c] transition-colors border-[#d4af37]/20">
          <p className="text-[9px] font-bold text-[#d4af37] uppercase tracking-widest mb-1">Safe</p>
          <p className="text-2xl font-black text-white">{loading ? '-' : safeScans}</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 hover:bg-[#1c1c1c] transition-colors border-red-500/20">
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Unsafe</p>
          <p className="text-2xl font-black text-white">{loading ? '-' : unsafeScans}</p>
        </div>
      </div>

      {/* Recent Scans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Scans</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:text-[#f5c842]"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
             <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-[#333] border-t-[#d4af37] rounded-full animate-spin"/></div>
          ) : readings.length === 0 ? (
            <div className="card border-dashed border-[#333] bg-transparent flex flex-col items-center justify-center py-8">
              <Droplets size={32} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No scans yet.</p>
              <button onClick={() => navigate('/scan')} className="text-[#d4af37] text-xs font-bold uppercase mt-2">Tap Start Scan to begin</button>
            </div>
          ) : (
            readings.map(scan => {
              const isSafe = scan.quality !== 'Unsafe';
              const badgeClass = isSafe ? 'badge-safe' : 'badge-unsafe';
              const StatusIcon = isSafe ? CheckCircle : AlertTriangle;

              return (
                <div key={scan.id} className="card border-[#333] p-4 flex items-center justify-between hover:bg-[#1c1c1c] transition-colors shadow-none cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSafe ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{scan.oil_type || 'Unknown Sample'}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(scan.timestamp).toLocaleDateString()} • {scan.vendor || 'Unknown Vendor'}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] ${badgeClass}`}>
                    {scan.quality}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
