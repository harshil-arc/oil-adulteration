import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Hourglass, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function History() {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('analysis_results').select('*').order('timestamp', { ascending: false }).limit(30)
      .then(({data}) => { 
        if (data) setDbData(data);
        setLoading(false);
      });
  }, []);

  const chartData = dbData.slice(0, 15).map(d => ({
    date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: d.purity
  })).reverse();

  const filteredScans = dbData.filter(s => 
    (s.oil_type || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.vendor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black text-[#d4af37] tracking-tight">Scan History</h1>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
         <div className="relative flex-1">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
             <Search size={18} />
           </div>
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             type="text" 
             placeholder="Search vendors or oil type..." 
             className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-[#d4af37] py-3 pl-11 pr-4 rounded-xl outline-none text-sm transition-colors theme-text placeholder:text-[var(--text-muted)]"
           />
         </div>
         <button className="w-12 border border-[var(--border-color)] bg-[var(--bg-elevated)] rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[#d4af37] transition-colors">
           <Filter size={18} />
         </button>
      </div>

      {/* Chart */}
      <div className="card flex flex-col p-5 shadow-glow-gold">
         <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">30-Day Trend (Purity %)</h2>
         <div className="h-40 w-full mb-1">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
               <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
               <Tooltip 
                 cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 2 }}
                 contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                 itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
               />
               <Line type="monotone" dataKey="score" stroke="#d4af37" strokeWidth={3} dot={{r: 4, fill: 'var(--bg-card)', stroke: '#d4af37', strokeWidth: 2}} activeDot={{r: 6, fill: '#d4af37', stroke: '#fff'}} />
             </LineChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 pb-8">
         <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 pl-1">Scan Log</h2>
         
         {loading ? (
             <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[#d4af37] rounded-full animate-spin"/></div>
         ) : filteredScans.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)]">
             <div className="w-16 h-16 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-color)]">
               <Hourglass size={24} className="text-[#d4af37]" />
             </div>
             <p className="theme-text font-bold mb-1">No history yet</p>
             <p className="text-xs text-[var(--text-muted)]">Your oil purity history will appear here.</p>
           </div>
         ) : (
           filteredScans.map(scan => {
             const isSafe = scan.quality !== 'Unsafe';
             return (
               <div key={scan.id} className="card p-4 flex items-center justify-between hover:border-[#d4af37]/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSafe ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border ${isSafe ? 'border-green-500/20' : 'border-red-500/20'}`}>
                      {isSafe ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm theme-text mb-0.5">{scan.oil_type || 'Custom Scan'}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">
                        {new Date(scan.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})} • {scan.vendor || 'Unknown Location'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${isSafe ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                      {scan.quality}
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[#d4af37] transition-colors" />
                  </div>
               </div>
             )
           })
         )}
      </div>

    </div>
  );
}
