import { useState } from 'react';
import { Plus, Trash2, Save, X, Search, Check } from 'lucide-react';
import { filterExercises, capitalize } from '../../services/fitness/exerciseService';
import { saveCustomWorkout } from '../../services/fitness/fitnessStorage';

export default function CustomWorkoutBuilder({ isOpen, onClose, allExercises, onWorkoutCreated }) {
  const [title, setTitle] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  if (!isOpen) return null;

  const handleAddExercise = (ex) => {
    if (!selectedExercises.some(item => item.id === ex.id)) {
      setSelectedExercises([...selectedExercises, ex]);
    }
  };

  const handleRemoveExercise = (id) => {
    setSelectedExercises(selectedExercises.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a name for your custom workout.');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Please add at least 1 exercise.');
      return;
    }

    const created = {
      title: title.trim(),
      exerciseIds: selectedExercises.map(e => e.id)
    };

    saveCustomWorkout(created);
    if (onWorkoutCreated) onWorkoutCreated(created);
    onClose();
  };

  const filteredCandidates = filterExercises(allExercises, { query: searchQuery }).slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-slate-100 font-sans">
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-widest block">Workout Builder</span>
            <h3 className="text-xl font-black text-white">Create Custom Workout</h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Workout Name Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase text-gray-400">Workout Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Morning Mobility & Core Routine"
            className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-[#0052ff]"
          />
        </div>

        {/* Selected Exercises List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-white text-xs">Selected Exercises ({selectedExercises.length})</span>
            <button
              onClick={() => setShowSearchModal(true)}
              className="py-1.5 px-3 rounded-xl bg-[#0052ff] text-white font-bold text-xs hover:bg-blue-600 transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Add Exercises
            </button>
          </div>

          {selectedExercises.length === 0 ? (
            <div className="p-8 text-center bg-[#0d1117] rounded-2xl border border-dashed border-gray-800 text-gray-400 text-xs">
              No exercises added yet. Click "Add Exercises" to pick from the 1,324 dataset.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selectedExercises.map((ex, idx) => (
                <div key={ex.id} className="p-3 bg-[#0d1117] rounded-xl border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#0052ff] text-white font-black flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-xs">{capitalize(ex.name)}</h5>
                      <span className="text-[10px] text-gray-400">{capitalize(ex.body_part)} • {capitalize(ex.equipment)}</span>
                    </div>
                  </div>

                  <button onClick={() => handleRemoveExercise(ex.id)} className="p-1.5 text-gray-500 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end gap-2">
          <button onClick={onClose} className="py-2.5 px-4 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="py-2.5 px-6 rounded-xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition-all flex items-center gap-1.5"
          >
            <Save size={14} /> Save Workout
          </button>
        </div>

      </div>

      {/* SEARCH MODAL FOR ADDING EXERCISES */}
      {showSearchModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl max-w-lg w-full p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h4 className="font-bold text-white text-sm">Select Exercise to Add</h4>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, muscle, equipment..."
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-[#0052ff]"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {filteredCandidates.map(ex => {
                const isSelected = selectedExercises.some(item => item.id === ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExercise(ex)}
                    className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                      isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-800 bg-[#0d1117] hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-white text-xs">{capitalize(ex.name)}</h5>
                      <p className="text-[10px] text-gray-400">{capitalize(ex.body_part)} • {capitalize(ex.equipment)}</p>
                    </div>

                    {isSelected ? <Check size={16} className="text-emerald-400" /> : <Plus size={16} className="text-gray-400" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowSearchModal(false)} className="py-2 px-4 rounded-xl bg-[#0052ff] text-white text-xs font-bold">
                Done Selecting
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
