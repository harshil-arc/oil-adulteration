import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Award, Flame, Calendar, TrendingUp, Activity, Trophy, Zap } from 'lucide-react';

export default function FitnessAnalyticsView({ profile = {}, workoutLogs = [] }) {
  
  // Weight & BMI Trend Data
  const weightTrendData = useMemo(() => {
    const baseW = profile.weight || 70;
    return [
      { day: 'Wk 1', weight: baseW + 2, bmi: 23.5 },
      { day: 'Wk 2', weight: baseW + 1, bmi: 23.2 },
      { day: 'Wk 3', weight: baseW, bmi: 22.9 },
      { day: 'Wk 4', weight: baseW - 0.8, bmi: 22.6 }
    ];
  }, [profile.weight]);

  // Calorie Burn Data
  const calorieBurnData = useMemo(() => {
    return [
      { day: 'Mon', calories: 320 },
      { day: 'Tue', calories: 280 },
      { day: 'Wed', calories: 120 },
      { day: 'Thu', calories: 350 },
      { day: 'Fri', calories: 310 },
      { day: 'Sat', calories: 420 },
      { day: 'Sun', calories: 90 }
    ];
  }, []);

  // Muscle Distribution Data
  const muscleDistribution = useMemo(() => {
    return [
      { name: 'Chest', value: 30, color: '#d4af37' },
      { name: 'Back', value: 25, color: '#3b82f6' },
      { name: 'Legs', value: 20, color: '#10b981' },
      { name: 'Core', value: 15, color: '#f59e0b' },
      { name: 'Shoulders', value: 10, color: '#8b5cf6' }
    ];
  }, []);

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 rounded-3xl border border-[#d4af37]/30 bg-[#d4af37]/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-[#d4af37]">BMI Trend Status</span>
            <Activity size={16} className="text-[#d4af37]" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{profile.bmi || 22.9} <span className="text-xs text-emerald-400 font-normal">Normal</span></p>
          <p className="text-[10px] text-gray-400">Height: {profile.height}cm • Target: {profile.targetWeight}kg</p>
        </div>

        <div className="card p-5 rounded-3xl border border-blue-500/30 bg-blue-500/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-blue-400">Weekly Calorie Burn</span>
            <Flame size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">1,890 <span className="text-xs text-gray-400 font-normal">kcal</span></p>
          <p className="text-[10px] text-gray-400">+12% vs previous week</p>
        </div>

        <div className="card p-5 rounded-3xl border border-purple-500/30 bg-purple-500/10 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-purple-400">Personal Records (PRs)</span>
            <Trophy size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">8 <span className="text-xs text-gray-400 font-normal">Milestones</span></p>
          <p className="text-[10px] text-gray-400">Push-Up Max: 35 reps</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight & BMI Trend Graph */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">Body Composition Progress</span>
              <h3 className="text-sm font-black text-white">Weight (kg) & BMI Trend</h3>
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrendData}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                <Line type="monotone" dataKey="weight" stroke="#d4af37" strokeWidth={3} dot={{ fill: '#d4af37' }} />
                <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Calorie Burn Bar Chart */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider block">Metabolic Burn Analysis</span>
              <h3 className="text-sm font-black text-white">Daily Calorie Expenditure</h3>
            </div>
            <Flame size={16} className="text-amber-400" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieBurnData}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Muscle Group Distribution & PR Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Muscle Distribution */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Target Training Distribution</span>
          <h3 className="text-sm font-black text-white">Muscle Group Split Ratio</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={muscleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4}>
                    {muscleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-[11px] w-full">
              {muscleDistribution.map(m => (
                <div key={m.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                    {m.name}
                  </span>
                  <span className="font-bold text-white">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PR Wall */}
        <div className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider block">Hall of Fame</span>
          <h3 className="text-sm font-black text-white">Personal Best Milestones (PRs)</h3>

          <div className="space-y-2">
            {[
              { title: 'Push-Ups Max Reps', value: '35 Reps', date: 'Yesterday', icon: '🥇' },
              { title: 'Plank Hold Time', value: '2 mins 15s', date: '3 days ago', icon: '⚡' },
              { title: 'Dumbbell Row PR', value: '18 kg', date: '1 week ago', icon: '🏋️‍♂️' }
            ].map((pr, idx) => (
              <div key={idx} className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{pr.icon}</span>
                  <div>
                    <h4 className="font-black text-white text-xs">{pr.title}</h4>
                    <p className="text-[10px] text-gray-400">{pr.date}</p>
                  </div>
                </div>
                <span className="font-mono font-black text-[#d4af37] text-xs bg-[#d4af37]/10 px-3 py-1 rounded-xl border border-[#d4af37]/30">
                  {pr.value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
