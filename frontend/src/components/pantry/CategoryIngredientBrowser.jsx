import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Search, Filter } from 'lucide-react';

export default function CategoryIngredientBrowser({
  categorizedIngredients = [],
  selectedIngredients = [],
  onToggleIngredient
}) {
  const [activeCategory, setActiveCategory] = useState('Vegetables & Produce');
  const [filterSearch, setFilterSearch] = useState('');

  const selectedNamesSet = new Set(
    selectedIngredients.map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim())
  );

  return (
    <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4 shadow-xl">
      
      {/* Header & Local Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-color)] pb-3">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Filter size={18} className="text-[#d4af37]" /> Browse Ingredients by Grocery Category
          </h3>
          <p className="text-xs text-gray-400">Click checkboxes to quickly add or remove ingredients from your pantry.</p>
        </div>

        {/* Search within Categories */}
        <div className="relative w-full sm:w-64 text-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Filter category items..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-white rounded-xl py-2 pl-9 pr-3 outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap gap-2 text-xs font-bold pb-1 overflow-x-auto">
        {categorizedIngredients.map(cat => {
          const isSelected = activeCategory === cat.categoryName;
          const selectedInCatCount = cat.ingredients.filter(i => selectedNamesSet.has(i.name.toLowerCase().trim())).length;

          return (
            <button
              key={cat.categoryName}
              onClick={() => setActiveCategory(cat.categoryName)}
              className={`px-3.5 py-2 rounded-2xl border transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-[#d4af37] text-black font-black border-[#d4af37] shadow-glow-gold'
                  : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)] hover:border-gray-500'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.categoryName}</span>
              {selectedInCatCount > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-black text-[#d4af37]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {selectedInCatCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ingredients Checkboxes Grid for Active Category */}
      <div className="pt-2">
        {categorizedIngredients
          .filter(cat => cat.categoryName === activeCategory)
          .map(cat => {
            const items = cat.ingredients.filter(i => {
              if (!filterSearch.trim()) return true;
              return i.name.toLowerCase().includes(filterSearch.toLowerCase().trim());
            });

            if (items.length === 0) {
              return (
                <div key={cat.categoryName} className="p-8 text-center text-xs text-gray-400">
                  No items match "{filterSearch}" in this category.
                </div>
              );
            }

            return (
              <div key={cat.categoryName} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {items.map(item => {
                  const isChecked = selectedNamesSet.has(item.name.toLowerCase().trim());

                  return (
                    <button
                      key={item.id}
                      onClick={() => onToggleIngredient(item)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-gradient-to-r from-[#d4af37]/20 to-amber-500/10 border-[#d4af37] text-white shadow-md'
                          : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="text-xs font-bold truncate">{item.name}</span>
                      </div>

                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isChecked ? 'bg-[#d4af37] border-[#d4af37] text-black font-black' : 'border-gray-600 bg-black/40'
                      }`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
      </div>

    </div>
  );
}
