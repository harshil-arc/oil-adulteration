import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Hourglass, ChevronRight, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

// Tier → display config (handles both old quality strings and new tier strings)
const TIER_CONFIG = {
  pure:     { label: 'PURE',        color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', Icon: ShieldCheck },
  Safe:     { label: 'PURE',        color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', Icon: ShieldCheck },
  moderate: { label: 'MODERATE',    color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', Icon: AlertTriangle },
  Moderate: { label: 'MODERATE',    color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', Icon: AlertTriangle },
  heavy:    { label: 'ADULTERATED', color: 'text-red-500',  bg: 'bg-red-500/10',   border: 'border-red-500/20',   Icon: XCircle },
  Unsafe:   { label: 'ADULTERATED', color: 'text-red-500',  bg: 'bg-red-500/10',   border: 'border-red-500/20',   Icon: XCircle },
};

function getTierConfig(scan) {
  const key = scan.quality || scan.tier || 'Safe';
  return TIER_CONFIG[key] || TIER_CONFIG.Safe;
}

export default function History() {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('analysis_results')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setDbData(data);
        setLoading(false);
      });
  }, []);

  const chartData = dbData
    .filter(d => d.purity != null)
    .slice(0, 15)
    .map(d => ({
      date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: d.purity,
    }))
    .reverse();

  const filteredScans = dbData.filter(s =>
    (s.oil_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.vendor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-fade-in min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#d4af37] tracking-tight">Scan History</h1>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search size={18} />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            placeholder="Search oil type or location..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-[#d4af37] py-3 pl-11 pr-4 rounded-xl outline-none text-sm transition-colors theme-text placeholder:text-[var(--text-muted)]"
          />
        </div>
        <button className="w-12 border border-[var(--border-color)] bg-[var(--bg-elevated)] rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[#d4af37] transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {chartData.length > 0 && (
        <div className="card flex flex-col p-5 shadow-glow-gold">
          <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Purity Trend (Last Tests)</h2>
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
                <Line type="monotone" dataKey="score" stroke="#d4af37" strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--bg-card)', stroke: '#d4af37', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#d4af37', stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pb-8">
        <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 pl-1">Analysis Log</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[#d4af37] rounded-full animate-spin" />
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)]">
            <div className="w-16 h-16 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mb-4 border border-[var(--border-color)]">
              <Hourglass size={24} className="text-[#d4af37]" />
            </div>
            <p className="theme-text font-bold mb-1">No history yet</p>
            <p className="text-xs text-[var(--text-muted)]">Complete an oil purity analysis to see records here.</p>
          </div>
        ) : (
          filteredScans.map(scan => {
            const tc = getTierConfig(scan);
            const purity = scan.purity ?? null;
            const timestamp = scan.timestamp || scan.created_at;

            return (
              <div
                key={scan.id}
                onClick={() => navigate(`/scan/${scan.id}`)}
                className="card p-4 flex items-center justify-between hover:border-[#d4af37]/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tc.bg} border ${tc.border}`}>
                    <tc.Icon size={18} className={tc.color} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm theme-text mb-0.5">{scan.oil_type || 'Oil Test'}</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                      {timestamp
                        ? new Date(timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                        : '—'}
                      {scan.vendor ? ` • ${scan.vendor}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {purity != null && (
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black font-mono ${tc.color}`}>{Number(purity).toFixed(1)}%</span>
                      <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase">purity</span>
                    </div>
                  )}
                  <div className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full ${tc.bg} ${tc.color} border ${tc.border}`}>
                    {tc.label}
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[#d4af37] transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
