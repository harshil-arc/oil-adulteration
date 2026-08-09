import { Eye, Dumbbell, Flame } from 'lucide-react';
import { capitalize } from '../../services/fitness/exerciseService';

export default function ExerciseCard({ exercise, onView, onSelect }) {
  if (!exercise) return null;

  return (
    <div 
      onClick={() => onView && onView(exercise)}
      className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 hover:border-[#0052ff] transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
    >
      {/* Thumbnail Container */}
      <div className="w-full h-40 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center mb-3">
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            loading="lazy"
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0001-2gPfomN.jpg';
            }}
          />
        ) : (
          <div className="text-4xl text-slate-600">🏋️‍♂️</div>
        )}

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-gray-300 font-mono">
          {capitalize(exercise.equipment)}
        </div>
      </div>

      {/* Info Content */}
      <div className="space-y-1.5 flex-1">
        <h4 className="font-extrabold text-[var(--text-primary)] text-sm line-clamp-1 group-hover:text-[#0052ff] transition-colors">
          {capitalize(exercise.name)}
        </h4>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
          <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold">
            {capitalize(exercise.body_part)}
          </span>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
            Target: {capitalize(exercise.target)}
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between mt-3 text-xs">
        <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">
          {exercise.attribution || '© Gym visual'}
        </span>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onView) onView(exercise);
          }}
          className="px-3 py-1 rounded-lg bg-[#0052ff]/20 text-[#0052ff] border border-[#0052ff]/40 font-bold hover:bg-[#0052ff] hover:text-white transition-all flex items-center gap-1"
        >
          <Eye size={13} /> View
        </button>
      </div>
    </div>
  );
}
