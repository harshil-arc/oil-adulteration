import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AnalyticsPage() {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('analysis_results').select('*').order('timestamp', { ascending: false }).limit(20)
      .then(({data}) => { 
        if (data) setDbData(data);
        setLoading(false);
      });
  }, []);

  const totalScans = dbData.length;
  const avgPurity = totalScans > 0 ? Math.round(dbData.reduce((acc, val) => acc + val.purity, 0) / totalScans) : '--';
  const flagged = dbData.filter(d => d.quality === 'Unsafe').length;

  const weeklyData = dbData.slice(0, 7).map(d => ({
    day: new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
    purity: d.purity
  })).reverse();

  const recentScans = dbData.map(d => {
    let status = 'Pure';
    if (d.quality === 'Moderate') status = 'Warn';
    if (d.quality === 'Unsafe') status = 'Critical';
    return {
      id: d.id,
      loc: d.oil_type ? `${d.oil_type} Analysis` : 'Unknown Sample',
      time: new Date(d.timestamp).toLocaleString([], { dateStyle:'short', timeStyle:'short' }),
      purity: d.purity,
      status: status
    };
  });

  const getBadgeColor = (status) => {
    if (status === 'Pure') return 'bg-[#e0f2ec] text-[#177e5e] border border-[#a2d7c2]';
    if (status === 'Warn') return 'bg-orange-50 text-orange-600 border border-orange-200';
    return 'bg-red-50 text-red-600 border border-red-200';
  };

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Analytics & History</h1>
        <p className="text-xs text-[#1d9e75] font-bold uppercase tracking-widest mt-0.5">Network Grid Overview</p>
      </div>

      {/* 3 Summary Stat Tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card py-4 px-3 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Total Scans</p>
          <p className="text-2xl font-black text-gray-800">{loading ? '-' : totalScans}</p>
        </div>
        <div className="card py-4 px-3 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Avg Purity</p>
          <p className="text-2xl font-black text-[#1d9e75]">{loading ? '-' : avgPurity}{!loading && avgPurity !== '--' && <span className="text-sm text-gray-400">%</span>}</p>
        </div>
        <div className="card py-4 px-3 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
          <p className="text-[10px] font-bold text-red-400 tracking-widest uppercase">Flagged</p>
          <p className="text-2xl font-black text-red-500">{loading ? '-' : flagged}</p>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="card shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-[#1d9e75]" />
          <h2 className="text-xs font-bold text-gray-800 tracking-wide uppercase">Purity Trend (7 Days)</h2>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={5} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip 
                cursor={{ fill: '#f7f9f7' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e8ede8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                itemStyle={{ color: '#1d9e75', fontWeight: 'bold' }}
              />
              <Bar dataKey="purity" fill="#1d9e75" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scrollable Recent Scans list */}
      <div>
        <h2 className="text-xs font-bold text-gray-800 tracking-wide uppercase mb-3 px-1">Recent Network Scans</h2>
        <div className="flex flex-col gap-3">
          {recentScans.length === 0 && !loading && (
            <div className="text-center py-6 text-gray-400 text-sm">No analysis history available yet.</div>
          )}
          {recentScans.map((scan) => (
            <div key={scan.id} className="card shadow-sm py-3 px-4 flex items-center justify-between transition-colors hover:bg-[#f7f9f7]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 mt-0.5">
                  <MapPin size={14} />
                </div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-gray-800">{scan.loc}</h3>
                  <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">{scan.time}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-black text-gray-800">{scan.purity}</span>
                  <span className="text-[10px] text-gray-400 font-bold">%</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${getBadgeColor(scan.status)}`}>
                  {scan.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
