import { useState } from 'react';
import { 
  Search, X, Dumbbell, ShieldAlert, CheckCircle2, ChevronRight, 
  Sparkles, Filter, Activity, Info, Heart
} from 'lucide-react';
import { getExerciseLibrary } from '../services/fitnessService';

export default function ExerciseLibraryModal({ isOpen, onClose, onSelectExercise }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (!isOpen) return null;

  const library = getExerciseLibrary();
  const categories = ['All', 'Strength', 'Legs', 'Arms', 'Core', 'Cardio', 'Flexibility'];

  const filtered = library.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-[#d4af37]" size={20} />
            <div>
              <h3 className="text-sm font-black text-white">AI Exercise Search & Knowledge Library</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Comprehensive Movement Instructions & Anatomy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {selectedExercise ? (
          /* SINGLE EXERCISE DETAILS PAGE */
          <div className="p-6 overflow-y-auto space-y-5 text-xs">
            <button onClick={() => setSelectedExercise(null)} className="text-[#d4af37] font-bold flex items-center gap-1 mb-2">
              ← Back to Exercise Search
            </button>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider block">{selectedExercise.category} • {selectedExercise.difficulty}</span>
                <h2 className="text-2xl font-black text-white">{selectedExercise.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedExercise.muscleGroup}</p>
              </div>

              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold font-mono">
                ~{selectedExercise.caloriesBurnedPerSet * selectedExercise.sets} kcal / session
              </span>
            </div>

            {/* Muscle Anatomy Badges */}
            <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
              <span className="font-extrabold text-white block uppercase tracking-wider text-[10px]">Target Muscle Anatomy</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedExercise.primaryMuscles?.map(m => (
                  <span key={m} className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                    Primary: {m}
                  </span>
                ))}
                {selectedExercise.secondaryMuscles?.map(m => (
                  <span key={m} className="bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-lg text-[10px]">
                    Secondary: {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2">
              <h4 className="font-black text-white uppercase tracking-wider">How to Perform Step-by-Step</h4>
              <div className="space-y-1.5">
                {selectedExercise.howToPerform?.map((step, i) => (
                  <div key={i} className="flex gap-2 bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
                    <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes & Precautions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/30 space-y-1.5">
                <h5 className="font-bold text-amber-400 uppercase text-[10px]">Common Mistakes to Avoid</h5>
                <ul className="space-y-1 text-gray-300">
                  {selectedExercise.commonMistakes?.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/30 space-y-1.5">
                <h5 className="font-bold text-purple-400 uppercase text-[10px]">Breathing Technique & Precautions</h5>
                <p className="text-gray-300">{selectedExercise.breathingTechnique}</p>
                <p className="text-gray-400 text-[11px] pt-1">{selectedExercise.precautions}</p>
              </div>
            </div>

            {/* Alternatives */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <span className="text-gray-400 font-bold block mb-1">Recommended Alternative Exercises:</span>
              <div className="flex gap-2">
                {selectedExercise.alternativeExercises?.map(alt => (
                  <span key={alt} className="bg-[var(--bg-elevated)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] font-semibold text-white">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* EXERCISE LIST SEARCH & FILTER VIEW */
          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by exercise name or muscle group (e.g. Chest, Squats, Core)..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 border ${
                    selectedCategory === cat ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Exercises */}
            <div className="space-y-3">
              {filtered.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-[#d4af37] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white">{ex.name}</h4>
                      <span className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                        {ex.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{ex.muscleGroup} • {ex.equipmentRequired}</p>
                  </div>

                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
