import { useState } from 'react';
import { X, Play, RefreshCw, Globe, ShieldCheck, Dumbbell, Activity, Check } from 'lucide-react';
import { getExerciseSteps, capitalize } from '../../services/fitness/exerciseService';

export default function ExerciseDetailModal({ isOpen, onClose, exercise, onSwap, onAddToWorkout }) {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [gifLoaded, setGifLoaded] = useState(false);

  if (!isOpen || !exercise) return null;

  const steps = getExerciseSteps(exercise, lang);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex justify-between items-center bg-[#0d1117]">
          <div>
            <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-widest block">
              {capitalize(exercise.body_part)} • {capitalize(exercise.equipment)}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{capitalize(exercise.name)}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle EN / HI */}
            <div className="flex bg-gray-800 p-0.5 rounded-xl text-xs font-bold border border-gray-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-[#0052ff] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all ${lang === 'hi' ? 'bg-[#0052ff] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                हिंदी
              </button>
            </div>

            <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* Large Animation GIF / Visual Display */}
          <div className="w-full h-64 sm:h-72 bg-black rounded-2xl border border-gray-800 overflow-hidden relative flex items-center justify-center">
            {exercise.gifUrl ? (
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                onLoad={() => setGifLoaded(true)}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = exercise.imageUrl || 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg';
                }}
              />
            ) : (
              <img
                src={exercise.imageUrl || 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg'}
                alt={exercise.name}
                className="w-full h-full object-contain p-2"
              />
            )}

            {/* Media License Attribution Overlay */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-gray-400 border border-gray-800">
              {exercise.attribution || '© Gym visual — Educational/Non-commercial dataset'}
            </div>
          </div>

          {/* Targeted Muscle & Equipment Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 space-y-0.5">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Body Part</span>
              <span className="font-extrabold text-white">{capitalize(exercise.body_part)}</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 space-y-0.5">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Target Muscle</span>
              <span className="font-extrabold text-[#0052ff]">{capitalize(exercise.target)}</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 space-y-0.5">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Equipment</span>
              <span className="font-extrabold text-amber-400">{capitalize(exercise.equipment)}</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 space-y-0.5">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Secondary</span>
              <span className="font-extrabold text-emerald-400 truncate block">
                {exercise.secondary_muscles?.map(capitalize).join(', ') || 'Core'}
              </span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <span>Execution Instructions ({lang === 'hi' ? 'हिंदी मार्गदर्शन' : 'English Guide'})</span>
            </h4>

            <div className="space-y-2">
              {steps.map((stepText, idx) => (
                <div key={idx} className="flex gap-3 bg-gray-900 p-3.5 rounded-2xl border border-gray-800 text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-[#0052ff] text-white font-black flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed text-xs">{stepText}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-gray-800 bg-[#0d1117] flex items-center justify-between gap-3">
          {onSwap ? (
            <button
              onClick={() => onSwap(exercise)}
              className="py-2.5 px-4 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 font-bold text-xs hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Swap Exercise
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {onAddToWorkout && (
              <button
                onClick={() => onAddToWorkout(exercise)}
                className="py-2.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1"
              >
                <Check size={14} /> Add to Custom Workout
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-[#0052ff] text-white font-black text-xs hover:bg-blue-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
