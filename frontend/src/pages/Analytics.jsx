import { useState } from 'react';
import { BarChart3, TrendingDown, CheckCircle, HeartHandshake, Leaf, Target, Calendar } from 'lucide-react';

const STATS = {
  totalFoodSavedKg: 2847,
  mealsSaved: 7118,
  predictionAccuracy: 88.4,
  wasteReductionPercent: 34,
  eventsManaged: 47,
  ngoDeliveries: 23,
};

const WEEKLY_DATA = [
  { day: 'Mon', predicted: 320, actual: 290, waste: 30 },
  { day: 'Tue', predicted: 260, actual: 270, waste: 20 },
  { day: 'Wed', predicted: 410, actual: 380, waste: 45 },
  { day: 'Thu', predicted: 190, actual: 175, waste: 18 },
  { day: 'Fri', predicted: 520, actual: 490, waste: 60 },
  { day: 'Sat', predicted: 880, actual: 820, waste: 95 },
  { day: 'Sun', predicted: 730, actual: 680, waste: 72 },
];

const maxActual = Math.max(...WEEKLY_DATA.map(d => d.actual));
const maxWaste = Math.max(...WEEKLY_DATA.map(d => d.waste));

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col theme-bg min-h-screen pb-24 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 border-b theme-border">
        <h1 className="text-[19px] font-black theme-text flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-500" /> Analytics Hub
        </h1>
        <p className="theme-text-muted text-[10px] uppercase tracking-[0.2em] mt-0.5">Platform Intelligence · All Events</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 px-5 mt-4">
        {['overview', 'demand', 'waste'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${activeTab === t ? 'bg-blue-500 text-white border-blue-500' : 'theme-elevated theme-border theme-text'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-5 mt-5">

        {activeTab === 'overview' && (
          <>
            {/* Hero stat */}
            <div className="theme-card border border-green-500/20 rounded-[20px] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Leaf size={15} className="text-green-500" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.15em]">Total Impact</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[52px] font-black leading-none theme-text">{STATS.totalFoodSavedKg.toLocaleString()}</span>
                <span className="text-base font-bold theme-text-secondary mb-2">kg saved</span>
              </div>
              <p className="text-[11px] theme-text-secondary">Equivalent to <span className="font-bold theme-text">{STATS.mealsSaved.toLocaleString()} meals</span> served to those in need.</p>
            </div>

            {/* 2×2 stat grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Prediction Accuracy" value={`${STATS.predictionAccuracy}%`} icon={<Target size={16} className="text-blue-500" />} color="blue" />
              <StatCard label="Waste Reduction" value={`${STATS.wasteReductionPercent}%`} icon={<TrendingDown size={16} className="text-green-500" />} color="green" />
              <StatCard label="Events Managed" value={STATS.eventsManaged} icon={<Calendar size={16} className="text-purple-500" />} color="purple" />
              <StatCard label="NGO Deliveries" value={STATS.ngoDeliveries} icon={<HeartHandshake size={16} className="text-pink-500" />} color="pink" />
            </div>

            {/* Accuracy breakdown */}
            <div className="theme-card border theme-border rounded-[20px] p-5">
              <h3 className="text-[11px] font-bold theme-text-muted uppercase tracking-[0.15em] mb-4">Accuracy by Event Type</h3>
              <div className="flex flex-col gap-3">
                {[['Wedding', 91], ['Corporate', 88], ['Festival', 82], ['Party', 86]].map(([type, acc]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs font-bold theme-text w-20 shrink-0">{type}</span>
                    <div className="flex-1 h-2 theme-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${acc}%` }} />
                    </div>
                    <span className="text-xs font-black theme-text w-10 text-right">{acc}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'demand' && (
          <>
            <div className="theme-card border theme-border rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-bold theme-text-muted uppercase tracking-[0.15em]">Predicted vs Actual (kg)</h3>
                <span className="text-[9px] theme-text-muted">This week</span>
              </div>
              <div className="flex items-end gap-2 h-36 mb-2">
                {WEEKLY_DATA.map((d) => (
                  <div key={d.day} className="flex-1 flex items-end gap-0.5">
                    <div className="flex-1 bg-blue-500/30 rounded-t" style={{ height: `${(d.predicted / maxActual) * 100}%` }} />
                    <div className="flex-1 bg-blue-500 rounded-t" style={{ height: `${(d.actual / maxActual) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-3">
                {WEEKLY_DATA.map(d => <span key={d.day} className="flex-1 text-center text-[8px] theme-text-muted">{d.day}</span>)}
              </div>
              <div className="flex gap-4 pt-4 border-t theme-border">
                <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-blue-500/30" /><span className="text-[10px] theme-text-muted">Predicted</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-blue-500" /><span className="text-[10px] theme-text-muted">Actual</span></div>
              </div>
            </div>

            <div className="theme-card border theme-border rounded-[20px] p-5">
              <h3 className="text-[11px] font-bold theme-text-muted uppercase tracking-[0.15em] mb-4">Daily Accuracy</h3>
              {WEEKLY_DATA.map(d => {
                const acc = Math.round((Math.min(d.predicted, d.actual) / Math.max(d.predicted, d.actual)) * 100);
                return (
                  <div key={d.day} className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold theme-text w-8">{d.day}</span>
                    <div className="flex-1 h-1.5 theme-elevated rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${acc >= 90 ? 'bg-green-500' : acc >= 80 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${acc}%` }} />
                    </div>
                    <span className={`text-xs font-black w-10 text-right ${acc >= 90 ? 'text-green-500' : acc >= 80 ? 'text-orange-400' : 'text-red-500'}`}>{acc}%</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'waste' && (
          <>
            <div className="theme-card border theme-border rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-bold theme-text-muted uppercase tracking-[0.15em]">Food Waste (kg/day)</h3>
                <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                  <TrendingDown size={9} className="rotate-180" /> +12% trend
                </span>
              </div>
              <div className="flex items-end gap-2 h-36 mb-2">
                {WEEKLY_DATA.map((d) => (
                  <div key={d.day} className="flex-1">
                    <div
                      className={`w-full rounded-t transition-all ${d.waste === maxWaste ? 'bg-red-500' : 'bg-orange-400/60'}`}
                      style={{ height: `${(d.waste / maxWaste) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-4">
                {WEEKLY_DATA.map(d => <span key={d.day} className="flex-1 text-center text-[8px] theme-text-muted">{d.day}</span>)}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t theme-border">
                <MiniStat label="Total Waste" value={`${WEEKLY_DATA.reduce((s, d) => s + d.waste, 0)} kg`} />
                <MiniStat label="Daily Avg" value={`${(WEEKLY_DATA.reduce((s, d) => s + d.waste, 0) / 7).toFixed(0)} kg`} />
                <MiniStat label="Peak Day" value="Saturday" bad />
              </div>
            </div>

            <div className="theme-card border theme-border rounded-[20px] p-5 mb-4">
              <h3 className="text-[11px] font-bold theme-text-muted uppercase tracking-[0.15em] mb-4">Waste by Event Type</h3>
              {[['Wedding', 38, 'red'], ['Festival', 28, 'orange'], ['Corporate', 22, 'blue'], ['Party', 12, 'green']].map(([type, pct, color]) => (
                <div key={type} className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold theme-text w-20 shrink-0">{type}</span>
                  <div className="flex-1 h-2 theme-elevated rounded-full overflow-hidden">
                    <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: `${pct * 2.5}%` }} />
                  </div>
                  <span className="text-xs font-black theme-text-secondary w-8 text-right">{pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const borders = { blue: 'border-blue-500/15', green: 'border-green-500/15', purple: 'border-purple-500/15', pink: 'border-pink-500/15' };
  return (
    <div className={`theme-card rounded-[18px] p-4 border ${borders[color]}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-[24px] font-black theme-text leading-none">{value}</p>
      <p className="text-[9px] theme-text-muted uppercase tracking-widest mt-1.5 font-bold">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, bad }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] theme-text-muted uppercase tracking-widest font-bold">{label}</span>
      <span className={`text-xs font-black ${bad ? 'text-red-500' : 'theme-text'}`}>{value}</span>
    </div>
  );
}
