import { useState } from 'react';
import { Play, Compass, BarChart2, User, Clock, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import LeapDayPlanView from './LeapDayPlanView';
import LeapOnboardingWizard from './LeapOnboardingWizard';

export default function LeapTrainingHome({ onStartInteractiveWorkout }) {
  const [activeNavTab, setActiveNavTab] = useState('Training'); // 'Training', 'Discover', 'Report', 'Settings'
  const [activeBodyFocus, setActiveBodyFocus] = useState('Abs'); // 'Abs', 'Arm', 'Chest', 'Leg', 'Shoulder & Back'
  
  // Modals state
  const [dayPlanOpen, setDayPlanOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  // Body Focus Dataset matching screenshots 13 to 18
  const focusCategories = {
    'Abs': [
      { id: 'abs-beg', title: 'Abs Beginner', mins: 15, exercises: 16, bolts: '⚡' },
      { id: 'abs-int', title: 'Abs Intermediate', mins: 24, exercises: 21, bolts: '⚡⚡' },
      { id: 'abs-adv', title: 'Abs Advanced', mins: 27, exercises: 21, bolts: '⚡⚡⚡' }
    ],
    'Arm': [
      { id: 'arm-beg', title: 'Arm Beginner', mins: 16, exercises: 19, bolts: '⚡' },
      { id: 'arm-int', title: 'Arm Intermediate', mins: 22, exercises: 25, bolts: '⚡⚡' },
      { id: 'arm-adv', title: 'Arm Advanced', mins: 30, exercises: 28, bolts: '⚡⚡⚡' }
    ],
    'Chest': [
      { id: 'chest-beg', title: 'Chest Beginner', mins: 8, exercises: 11, bolts: '⚡' },
      { id: 'chest-int', title: 'Chest Intermediate', mins: 12, exercises: 14, bolts: '⚡⚡' },
      { id: 'chest-adv', title: 'Chest Advanced', mins: 17, exercises: 16, bolts: '⚡⚡⚡' }
    ],
    'Leg': [
      { id: 'leg-beg', title: 'Leg Beginner', mins: 22, exercises: 23, bolts: '⚡' },
      { id: 'leg-int', title: 'Leg Intermediate', mins: 30, exercises: 36, bolts: '⚡⚡' },
      { id: 'leg-adv', title: 'Leg Advanced', mins: 39, exercises: 43, bolts: '⚡⚡⚡' }
    ],
    'Shoulder & Back': [
      { id: 'sb-beg', title: 'Shoulder & Back Beginner', mins: 14, exercises: 17, bolts: '⚡' },
      { id: 'sb-int', title: 'Shoulder & Back Intermediate', mins: 18, exercises: 17, bolts: '⚡⚡' },
      { id: 'sb-adv', title: 'Shoulder & Back Advanced', mins: 20, exercises: 17, bolts: '⚡⚡⚡' }
    ]
  };

  const handleOpenDayPlan = (num = 1) => {
    setSelectedDayNumber(num);
    setDayPlanOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 flex flex-col justify-between max-w-xl mx-auto border-x border-slate-200">
      
      {/* ── 1. TRAINING TAB CONTENT (Pages 13-18) ────────────────────────── */}
      {activeNavTab === 'Training' && (
        <div className="p-5 space-y-6 animate-fade-in">
          
          {/* Top Bar Banner Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">HOME WORKOUT</h1>
            <button
              onClick={() => setOnboardingOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0052ff] border border-blue-200 font-black text-xs hover:bg-blue-100 transition-all flex items-center gap-1"
            >
              <Sparkles size={14} /> Recalibrate Plan
            </button>
          </div>

          {/* Giant Hero Banner Card (Screenshots 13-18) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0052ff] to-[#0033cc] text-white space-y-5 shadow-2xl relative overflow-hidden">
            <span className="bg-amber-300 text-slate-900 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              CUSTOMIZED FOR YOU
            </span>

            <h2 className="text-3xl font-black tracking-tight leading-tight">FULL BODY FAT BURN</h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                <span>📅</span>
                <div>
                  <b className="block">8-23 Min</b>
                  <span className="text-[9px] opacity-80">Daily Time</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                <span>📊</span>
                <div>
                  <b className="block">Intermediate</b>
                  <span className="text-[9px] opacity-80">Level</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                <span>🎯</span>
                <div>
                  <b className="block">Full Body</b>
                  <span className="text-[9px] opacity-80">Target area</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                <span>☑️</span>
                <div>
                  <b className="block">No Equipment</b>
                  <span className="text-[9px] opacity-80">Equipment</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenDayPlan(1)}
              className="w-full py-4 rounded-full bg-white text-[#0052ff] font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              START DAY 1 <ArrowRight size={18} />
            </button>
          </div>

          {/* ── BODY FOCUS SECTION (Pages 13-18) ────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Body Focus</h2>

            {/* Category Pill Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {['Abs', 'Arm', 'Chest', 'Leg', 'Shoulder & Back'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveBodyFocus(cat)}
                  className={`px-5 py-2.5 rounded-full font-black text-xs transition-all border shrink-0 ${
                    activeBodyFocus === cat 
                      ? 'bg-blue-50 text-[#0052ff] border-[#0052ff] shadow-sm' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Workouts List for Active Body Focus */}
            <div className="space-y-3">
              {(focusCategories[activeBodyFocus] || []).map(card => (
                <div
                  key={card.id}
                  onClick={() => handleOpenDayPlan(1)}
                  className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-[#0052ff] transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0">
                      🏋️‍♂️
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#0052ff] transition-colors">{card.title}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{card.mins} mins • {card.exercises} Exercises</p>
                      <span className="text-amber-500 font-bold text-xs mt-1 block">{card.bolts}</span>
                    </div>
                  </div>

                  <ArrowRight size={18} className="text-slate-400 group-hover:text-[#0052ff] group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── 2. DISCOVER TAB CONTENT (Pages 19-20) ────────────────────────── */}
      {activeNavTab === 'Discover' && (
        <div className="p-5 space-y-6 animate-fade-in">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discover & Quick Routines</h1>

          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900">For You</h2>
            <div className="space-y-3">
              {[
                { title: 'Butt Lift & Rounder Booty', mins: 7, diff: 'Beginner', icon: '🧘‍♀️' },
                { title: 'Intense Inner Thigh Challenge', mins: 15, diff: 'Intermediate', icon: '🏃‍♀️' }
              ].map((c, i) => (
                <div key={i} onClick={() => handleOpenDayPlan(1)} className="p-4 bg-white rounded-3xl border border-slate-200 flex justify-between items-center cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{c.icon}</span>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{c.title}</h4>
                      <p className="text-xs text-slate-500 font-bold">{c.mins} min • {c.diff}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-black text-slate-900">Stretch & Warm Up</h2>
            <div className="space-y-3">
              {[
                { title: 'Burn 100 Calories', mins: 9, diff: 'Intermediate' },
                { title: 'Fat Burning HIIT', mins: 10, diff: 'Intermediate' },
                { title: '7 Min Lose Arm Fat', mins: 7, diff: 'Beginner' }
              ].map((r, i) => (
                <div key={i} onClick={() => handleOpenDayPlan(1)} className="p-4 bg-white rounded-3xl border border-slate-200 flex justify-between items-center cursor-pointer shadow-sm">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{r.title}</h4>
                    <p className="text-xs text-slate-500 font-bold">{r.mins} min • {r.diff}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0052ff] text-white flex items-center justify-center">
                    ➔
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. REPORT TAB CONTENT ────────────────────────────────────────── */}
      {activeNavTab === 'Report' && (
        <div className="p-5 space-y-6 animate-fade-in text-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workout Reports</h1>
          
          <div className="p-8 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <span className="text-4xl">📊</span>
            <h3 className="text-lg font-black text-slate-900">0 Workouts Completed</h3>
            <p className="text-xs text-slate-500">Complete your first session to unlock detailed reports and calorie graphs!</p>
          </div>
        </div>
      )}

      {/* ── 4. SETTINGS TAB CONTENT ──────────────────────────────────────── */}
      {activeNavTab === 'Settings' && (
        <div className="p-5 space-y-4 animate-fade-in">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>

          <div className="space-y-2">
            {[
              { label: 'Recalibrate AI Fitness Profile', action: () => setOnboardingOpen(true) },
              { label: 'Voice Coach Options', action: () => alert('Voice coach is enabled!') },
              { label: 'Metric Units (kg / lbs)', action: () => alert('Units configured!') }
            ].map((s, i) => (
              <button key={i} onClick={s.action} className="w-full p-4 bg-white rounded-2xl border border-slate-200 text-left font-black text-slate-900 text-xs hover:bg-slate-100">
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 4-ITEM BOTTOM NAVIGATION BAR ─────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-2.5 px-6 flex justify-around items-center z-40 max-w-xl mx-auto">
        <button
          onClick={() => setActiveNavTab('Training')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeNavTab === 'Training' ? 'text-[#0052ff] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Clock size={20} />
          <span className="text-[10px]">Training</span>
        </button>

        <button
          onClick={() => setActiveNavTab('Discover')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeNavTab === 'Discover' ? 'text-[#0052ff] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Compass size={20} />
          <span className="text-[10px]">Discover</span>
        </button>

        <button
          onClick={() => setActiveNavTab('Report')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeNavTab === 'Report' ? 'text-[#0052ff] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <BarChart2 size={20} />
          <span className="text-[10px]">Report</span>
        </button>

        <button
          onClick={() => setActiveNavTab('Settings')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeNavTab === 'Settings' ? 'text-[#0052ff] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <User size={20} />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>

      {/* Day Overview View */}
      <LeapDayPlanView
        isOpen={dayPlanOpen}
        onClose={() => setDayPlanOpen(false)}
        dayNumber={selectedDayNumber}
        onStartWorkout={() => {
          setDayPlanOpen(false);
          if (onStartInteractiveWorkout) onStartInteractiveWorkout();
        }}
      />

      {/* Leap Onboarding Modal */}
      <LeapOnboardingWizard
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={() => setOnboardingOpen(false)}
      />

    </div>
  );
}
