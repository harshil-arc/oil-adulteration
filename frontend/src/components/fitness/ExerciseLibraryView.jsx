import { useState } from 'react';
import { Search, Dumbbell, ChevronRight, ArrowLeft } from 'lucide-react';
import { EXERCISE_DATABASE } from '../../services/aiFitnessEngine';
import ExerciseDetailModal from './ExerciseDetailModal';

export default function ExerciseLibraryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'HIIT', 'Yoga', 'Stretching'];

  const filtered = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenDetail = (ex) => {
    setSelectedExercise(ex);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
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
            onClick={() => setSelectedCategory(cat)}
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

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(ex => (
          <div
            key={ex.id}
            onClick={() => handleOpenDetail(ex)}
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

      {/* Detail Modal */}
      <ExerciseDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        exercise={selectedExercise}
      />

    </div>
  );
}
