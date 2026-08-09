import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadExercises, filterExercises, getDatasetMetadata, capitalize } from '../../services/fitness/exerciseService';
import ExerciseCard from './ExerciseCard';
import ExerciseDetailModal from './ExerciseDetailModal';

export default function ExerciseLibraryView({ onSelectExerciseForCustom }) {
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedTarget, setSelectedTarget] = useState('All');

  // Pagination state (24 exercises per page for speed)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // Selected exercise for detail modal
  const [inspectExercise, setInspectExercise] = useState(null);

  useEffect(() => {
    let mounted = true;
    loadExercises().then(data => {
      if (mounted) {
        setAllExercises(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const metadata = useMemo(() => getDatasetMetadata(allExercises), [allExercises]);

  const filteredList = useMemo(() => {
    return filterExercises(allExercises, {
      query: searchQuery,
      bodyPart: selectedBodyPart,
      equipment: selectedEquipment,
      targetMuscle: selectedTarget
    });
  }, [allExercises, searchQuery, selectedBodyPart, selectedEquipment, selectedTarget]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBodyPart, selectedEquipment, selectedTarget]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBodyPart('All');
    setSelectedEquipment('All');
    setSelectedTarget('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* ── SEARCH & FILTER BAR ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border-color)]">
        <div>
          <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-wider block mb-0.5">
            Official Dataset ({allExercises.length} Exercises)
          </span>
          <h3 className="text-xl font-black text-[var(--text-primary)]">1,324 Exercise Knowledge Base</h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search exercise, muscle, equipment..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-[var(--text-primary)] outline-none focus:border-[#0052ff]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0052ff]">
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`py-2.5 px-4 rounded-2xl font-bold border flex items-center gap-2 transition-all ${
              selectedBodyPart !== 'All' || selectedEquipment !== 'All' || selectedTarget !== 'All'
                ? 'bg-[#0052ff] text-white border-[#0052ff]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-gray-600'
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* FILTER DRAWER / OPTIONS */}
      {filterDrawerOpen && (
        <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[#0052ff]/40 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <span className="font-extrabold text-[var(--text-primary)] text-xs">Dataset Filters</span>
            <button onClick={handleClearFilters} className="text-[#0052ff] font-bold hover:underline text-xs">
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Body Part */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">Body Part</label>
              <select
                value={selectedBodyPart}
                onChange={e => setSelectedBodyPart(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl p-2.5 outline-none focus:border-[#0052ff]"
              >
                {metadata.bodyParts.map(bp => (
                  <option key={bp} value={bp} className="bg-[#161b22] text-white">{bp}</option>
                ))}
              </select>
            </div>

            {/* Equipment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">Equipment</label>
              <select
                value={selectedEquipment}
                onChange={e => setSelectedEquipment(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl p-2.5 outline-none focus:border-[#0052ff]"
              >
                {metadata.equipment.map(eq => (
                  <option key={eq} value={eq} className="bg-[#161b22] text-white">{eq}</option>
                ))}
              </select>
            </div>

            {/* Target Muscle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)]">Target Muscle</label>
              <select
                value={selectedTarget}
                onChange={e => setSelectedTarget(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl p-2.5 outline-none focus:border-[#0052ff]"
              >
                {metadata.targetMuscles.map(tm => (
                  <option key={tm} value={tm} className="bg-[#161b22] text-white">{tm}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS & GRID ───────────────────────────────────────────────── */}
      <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] px-1">
        <span>Showing {filteredList.length} matching exercises</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0052ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-xs font-bold">Loading 1,324 exercise dataset...</p>
        </div>
      ) : paginatedList.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] space-y-3">
          <span className="text-4xl">🔍</span>
          <h4 className="text-base font-bold text-white">No exercises found</h4>
          <p className="text-gray-400 text-xs">Try clearing your filters or typing a different search term.</p>
          <button onClick={handleClearFilters} className="btn-primary py-2 px-4 text-xs">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedList.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onView={(item) => setInspectExercise(item)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-300 disabled:opacity-30 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="font-mono text-xs font-bold text-white">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-300 disabled:opacity-30 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      <ExerciseDetailModal
        isOpen={!!inspectExercise}
        onClose={() => setInspectExercise(null)}
        exercise={inspectExercise}
        onAddToWorkout={onSelectExerciseForCustom}
      />

    </div>
  );
}
