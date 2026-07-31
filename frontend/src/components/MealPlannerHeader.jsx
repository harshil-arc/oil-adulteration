import { useState } from 'react';
import { Search, X, Plus, Clock, Filter, Sparkles, Trash2, Check } from 'lucide-react';

export default function MealPlannerHeader({ 
  ingredients = [], 
  onAddIngredient, 
  onRemoveIngredient, 
  onClearIngredients,
  maxPrepTime,
  onSelectPrepTime,
  selectedDiets = [],
  onToggleDiet,
  onFindRecipes,
  isSearching = false
}) {
  const [inputValue, setInputValue] = useState('');

  const quickPresets = ['Eggs', 'Cheese', 'Tomato', 'Spinach', 'Oats', 'Chicken', 'Rice', 'Paneer'];
  const prepTimeOptions = [
    { label: '< 15 min', value: 15 },
    { label: '< 30 min', value: 30 },
    { label: '< 45 min', value: 45 },
    { label: 'Any', value: null }
  ];
  const dietOptions = ['Vegetarian', 'Vegan', 'Gluten Free', 'Keto'];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddIngredient(inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            Intent-Driven Recipe Search
          </h2>
          <p className="text-xs text-gray-400">Add your available kitchen ingredients to instantly generate 3 distinct matching recipes.</p>
        </div>

        {ingredients.length > 0 && (
          <button 
            onClick={onClearIngredients}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
          >
            <Trash2 size={13} /> Clear All
          </button>
        )}
      </div>

      {/* Ingredient Tag Input Field */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-300">Your Ingredients (Type & Press Enter or Comma):</label>
        <div className="flex items-center gap-2 flex-wrap bg-gray-900 border border-gray-700 focus-within:border-amber-500 rounded-xl p-2.5 min-h-[46px]">
          {ingredients.map((ing) => (
            <span 
              key={ing} 
              className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium animate-fade-in"
            >
              <span>{ing}</span>
              <button 
                type="button" 
                onClick={() => onRemoveIngredient(ing)}
                className="text-amber-300/70 hover:text-white"
              >
                <X size={13} />
              </button>
            </span>
          ))}

          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ingredients.length === 0 ? "Type ingredients e.g. eggs, spinach, cheese..." : "Add more..."}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none min-w-[140px]"
          />
        </div>
      </div>

      {/* Quick Preset Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-gray-400 font-semibold flex items-center gap-1">
          <Plus size={13} /> Quick Add:
        </span>
        {quickPresets.map((preset) => {
          const isAdded = ingredients.some(i => i.toLowerCase() === preset.toLowerCase());
          return (
            <button
              key={preset}
              type="button"
              disabled={isAdded}
              onClick={() => onAddIngredient(preset)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                isAdded 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 opacity-60 cursor-not-allowed'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {isAdded ? `✓ ${preset}` : `+ ${preset}`}
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800/80">
        {/* Prep Time Segmented Control */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Clock size={13} /> Max Prep Time:
          </label>
          <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800">
            {prepTimeOptions.map((opt) => {
              const isSelected = maxPrepTime === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onSelectPrepTime(opt.value)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Multi-Select Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-400 flex items-center gap-1">
            <Filter size={13} /> Dietary Restrictions:
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {dietOptions.map((diet) => {
              const isSelected = selectedDiets.includes(diet);
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => onToggleDiet(diet)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  {isSelected ? `✓ ${diet}` : diet}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="pt-2">
        <button
          type="button"
          disabled={ingredients.length === 0 || isSearching}
          onClick={onFindRecipes}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-black text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider"
        >
          <Sparkles size={16} />
          <span>{isSearching ? 'Searching Recipe Database...' : 'Find 3 Matching Recipes'}</span>
        </button>
      </div>
    </div>
  );
}
