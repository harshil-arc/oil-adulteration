import { useState } from 'react';
import { X, Clock, User, ExternalLink, CheckSquare, Square, Play, ShieldCheck, ListChecks, BookOpen } from 'lucide-react';

export default function RecipeDrawerModal({ 
  isOpen, 
  onClose, 
  recipe, 
  onStartInteractiveCooking 
}) {
  if (!isOpen || !recipe) return null;

  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' | 'instructions'
  
  // Interactive Checklist State
  const ingredientsList = recipe.ingredients || [];
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  const toggleCheckIngredient = (name) => {
    if (checkedIngredients.includes(name)) {
      setCheckedIngredients(checkedIngredients.filter(i => i !== name));
    } else {
      setCheckedIngredients([...checkedIngredients, name]);
    }
  };

  const instructionsList = recipe.instructions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-gray-700 backdrop-blur-md transition-all"
        >
          <X size={18} />
        </button>

        {/* Large Header Banner */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-gray-900 flex-shrink-0">
          <img 
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-[#161b22]/40 to-black/60" />

          <div className="absolute bottom-4 left-6 right-6 space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold">
                {recipe.option_type || 'Recommended Recipe'}
              </span>
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={13} /> SpectraTrust Safe Oil Verified
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">{recipe.title}</h2>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" /> {recipe.prepTimeMinutes || recipe.prep_time_minutes || 20} mins prep
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-sky-400" /> {recipe.servings || 2} servings
              </span>
              {recipe.sourceUrl && (
                <a 
                  href={recipe.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Recipe Source <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-gray-800 bg-gray-900/60 px-6 pt-2 gap-4 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ingredients'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ListChecks size={16} />
            <span>Ingredients Checklist ({checkedIngredients.length}/{ingredientsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'instructions'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={16} />
            <span>Step-by-Step Instructions ({instructionsList.length} Steps)</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Summary Section */}
          <div className="bg-gray-900/80 p-3.5 rounded-2xl border border-gray-800 text-xs text-gray-300 leading-relaxed">
            {(recipe.summary || recipe.description || '').replace(/<[^>]*>?/gm, '')}
          </div>

          {/* TAB 1: INGREDIENTS CHECKLIST */}
          {activeTab === 'ingredients' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Check off ingredients you already have in your kitchen:</span>
                {ingredientsList.length > 0 && (
                  <button 
                    onClick={() => setCheckedIngredients(ingredientsList.map(i => typeof i === 'string' ? i : i.name))}
                    className="text-amber-400 hover:underline text-[11px]"
                  >
                    Check All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {ingredientsList.map((ing, idx) => {
                  const name = typeof ing === 'string' ? ing : (ing.name || ing.original);
                  const amountStr = typeof ing === 'object' ? `${ing.amount || ''} ${ing.unit || ''}`.trim() : '';
                  const isChecked = checkedIngredients.includes(name);

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleCheckIngredient(name)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        isChecked 
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-gray-400 line-through' 
                          : 'bg-gray-900 border-gray-800 text-gray-100 hover:border-gray-700'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare size={16} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square size={16} className="text-gray-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold">{name}</div>
                        {amountStr && <div className="text-[11px] text-gray-400">{amountStr}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP INSTRUCTIONS TIMELINE */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 animate-fade-in">
              {instructionsList.map((stepText, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-900 border border-gray-800">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 text-xs text-gray-200 leading-relaxed pt-1">
                    <div className="font-bold text-amber-400">Step {idx + 1}</div>
                    <p>{stepText}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center justify-between gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
          >
            Close
          </button>

          {onStartInteractiveCooking && (
            <button 
              onClick={() => {
                onClose();
                onStartInteractiveCooking(recipe);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-black text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Play size={16} /> Launch Interactive Cooking Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
