import { useState } from 'react';
import { X, RefreshCw, Play, Minus, Plus } from 'lucide-react';

export default function LeapExerciseDetailModal({ isOpen, onClose, exercise, onReplace }) {
  const [activeTab, setActiveTab] = useState('Video'); // 'Video', 'Muscle', 'How to do'
  const [durationSec, setDurationSec] = useState(30);

  if (!isOpen || !exercise) return null;

  const formatSec = (s) => `00:${s < 10 ? '0' : ''}${s}`;

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 font-sans flex flex-col justify-between overflow-y-auto animate-fade-in">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-slate-100">
        <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">{exercise.name || 'JUMPING JACKS'}</h2>

        <button
          onClick={() => {
            if (onReplace) onReplace(exercise);
          }}
          className="flex items-center gap-1 text-[#0052ff] font-bold text-xs hover:underline"
        >
          <RefreshCw size={14} /> Replace
        </button>
      </div>

      {/* Hero Visual Media Display */}
      <div className="w-full h-56 bg-slate-50 flex flex-col items-center justify-center relative p-4 border-b border-slate-100">
        <div className="w-28 h-28 rounded-3xl bg-blue-50 border-2 border-[#0052ff] flex items-center justify-center text-5xl shadow-lg shadow-blue-500/10 animate-bounce">
          🏋️‍♂️
        </div>

        {/* Tab Selector Pill Buttons */}
        <div className="flex bg-slate-200 p-1 rounded-full text-xs font-bold mt-4 gap-1">
          {['Video', 'Muscle', 'How to do'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full transition-all ${
                activeTab === tab ? 'bg-[#0052ff] text-white shadow-md' : 'text-slate-600 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body Content */}
      <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1 max-w-lg mx-auto w-full">
        
        {/* DURATION CONTROLLER */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="font-black text-slate-900 text-sm tracking-wider uppercase">DURATION</span>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDurationSec(prev => Math.max(10, prev - 5))}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-800 font-black text-base flex items-center justify-center hover:bg-slate-100"
            >
              -
            </button>

            <span className="font-mono text-xl font-black text-slate-900">{formatSec(durationSec)}</span>

            <button
              onClick={() => setDurationSec(prev => prev + 5)}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-800 font-black text-base flex items-center justify-center hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="space-y-2">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">INSTRUCTIONS</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {exercise.instructions?.[0] || 'Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.'}
          </p>
          <p className="text-slate-600 leading-relaxed font-medium">
            Return to the start position then do the next rep. This exercise provides a full-body workout and works all your large muscle groups.
          </p>
        </div>

        {/* FOCUS AREA */}
        <div className="space-y-3 pt-2">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">FOCUS AREA</h3>
          <div className="grid grid-cols-2 gap-2 text-slate-800 font-bold">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" /> Shoulders</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" /> Quadriceps</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" /> Adductors</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" /> Chest</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" /> Calves</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0052ff]" /> Glutes</div>
          </div>

          {/* FRONT & BACK HUMAN ANATOMY DIAGRAM */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-around items-center pt-4">
            {/* Front View Diagram */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-24 h-48 bg-slate-200 rounded-full relative flex items-center justify-center text-4xl shadow-inner">
                🧍‍♂️
                {/* Highlighted muscle overlays */}
                <div className="absolute top-10 inset-x-3 h-8 bg-[#0052ff]/40 rounded-lg animate-pulse" />
                <div className="absolute bottom-6 inset-x-4 h-12 bg-[#0052ff]/40 rounded-lg animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Front View</span>
            </div>

            {/* Back View Diagram */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-24 h-48 bg-slate-200 rounded-full relative flex items-center justify-center text-4xl shadow-inner">
                🧍‍♂️
                {/* Highlighted muscle overlays */}
                <div className="absolute top-12 inset-x-3 h-10 bg-[#0052ff]/40 rounded-lg animate-pulse" />
                <div className="absolute bottom-8 inset-x-4 h-10 bg-[#0052ff]/40 rounded-lg animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Back View</span>
            </div>
          </div>
        </div>

        {/* COMMON MISTAKES */}
        <div className="space-y-3 pt-2">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">COMMON MISTAKES</h3>
          <div className="space-y-3 text-slate-700 font-medium">
            <div className="flex gap-3">
              <span className="font-black text-[#0052ff] text-sm">1</span>
              <div>
                <b className="text-slate-900 block">Landing too hard</b>
                <p className="text-slate-500 text-xs mt-0.5">When you jump in the air and come down, you are putting too much impact or pressure on your feet or knees.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="font-black text-[#0052ff] text-sm">2</span>
              <div>
                <b className="text-slate-900 block">Not keeping the knees bent</b>
                <p className="text-slate-500 text-xs mt-0.5">Failing to keep knees soft can cause the exercise to be less effective.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="font-black text-[#0052ff] text-sm">3</span>
              <div>
                <b className="text-slate-900 block">Not engaging the core</b>
                <p className="text-slate-500 text-xs mt-0.5">Requires the core muscles to be engaged throughout the entire exercise.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BREATHING TIPS */}
        <div className="space-y-2 pt-2">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">BREATHING TIPS</h3>
          <ul className="space-y-1.5 text-slate-700 font-medium list-disc pl-4 text-xs">
            <li>Inhale as you jump your feet apart.</li>
            <li>Exhale as you jump your feet back together.</li>
            <li>Take deep breaths to fully oxygenate your body.</li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-20">
        <span className="font-mono font-bold text-slate-500 text-xs">1/12</span>

        <button
          onClick={onClose}
          className="py-3.5 px-10 rounded-full bg-[#0052ff] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all"
        >
          CLOSE
        </button>
      </div>

    </div>
  );
}
