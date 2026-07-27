import { useState } from 'react';
import { Search, Dumbbell, ShieldAlert, ChevronRight, Sparkles, Filter, CheckCircle2, ArrowLeft } from 'lucide-react';
import { EXERCISE_DATABASE } from '../../services/aiFitnessEngine';

export default function ExerciseLibraryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'HIIT', 'Yoga', 'Stretching'];

  const filtered = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-xs">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border-color)]">
        <div>
          <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block mb-0.5">Comprehensive AI Movement Database</span>
          <h3 className="text-xl font-black text-white">Exercise Knowledge & Anatomy Library</h3>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search exercise or muscle..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedExercise(null);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 border text-xs ${
              selectedCategory === cat
                ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-glow-gold'
                : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)] hover:border-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Detail View or Grid */}
      {selectedExercise ? (
        <div className="card p-6 rounded-3xl border border-[#d4af37]/30 bg-[var(--bg-card)] space-y-5 animate-fade-in">
          <button onClick={() => setSelectedExercise(null)} className="text-[#d4af37] font-bold flex items-center gap-1">
            <ArrowLeft size={16} /> Back to All Exercises
          </button>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">
                {selectedExercise.category} • {selectedExercise.difficulty} Level
              </span>
              <h2 className="text-2xl font-black text-white">{selectedExercise.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{selectedExercise.primaryMuscle} • {selectedExercise.equipment}</p>
            </div>

            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold font-mono">
              ~{selectedExercise.caloriesPerMin * 10} kcal / 10 mins
            </span>
          </div>

          {/* Target Anatomy */}
          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
            <span className="font-extrabold text-white block uppercase tracking-wider text-[10px]">Target Anatomy Breakdown</span>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-xl font-bold text-[10px]">
                Primary: {selectedExercise.primaryMuscle}
              </span>
              {selectedExercise.secondaryMuscles?.map(m => (
                <span key={m} className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-xl text-[10px]">
                  Secondary: {m}
                </span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="font-black text-white uppercase tracking-wider text-xs">Step-by-Step Instructions</h4>
            <div className="space-y-2">
              {selectedExercise.instructions?.map((step, i) => (
                <div key={i} className="flex gap-3 bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0 text-xs">
                    {i + 1}
                  </span>
                  <span className="text-gray-300 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes & Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/30 space-y-2">
              <h5 className="font-bold text-amber-400 uppercase text-[10px]">Common Mistakes to Avoid</h5>
              <ul className="space-y-1 text-gray-300 text-[11px]">
                {selectedExercise.commonMistakes?.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/30 space-y-2">
              <h5 className="font-bold text-purple-400 uppercase text-[10px]">Safety & Joint Protection</h5>
              <p className="text-gray-300 text-[11px]">{selectedExercise.safetyTips}</p>
            </div>
          </div>

          {/* Alternatives */}
          {selectedExercise.alternatives && (
            <div className="pt-2 border-t border-[var(--border-color)]">
              <span className="text-gray-400 font-bold block mb-2">Recommended Alternative Exercises:</span>
              <div className="flex gap-2">
                {selectedExercise.alternatives.map(alt => (
                  <span key={alt} className="bg-[var(--bg-elevated)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] font-semibold text-white text-[11px]">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Exercise Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(ex => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37] transition-all cursor-pointer flex justify-between items-center group shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white group-hover:text-[#d4af37] transition-colors">{ex.name}</h4>
                  <span className="text-[9px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{ex.primaryMuscle} • {ex.equipment}</p>
              </div>

              <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
