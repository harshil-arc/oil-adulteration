import { useState, useEffect, useRef } from 'react';
import { Search, X, Check, AlertCircle, Sparkles, Info, RefreshCw } from 'lucide-react';

export default function AutocompleteIngredientSearch({
  masterIngredients = [],
  selectedIngredients = [],
  onAddIngredient,
  onRemoveIngredient,
  onClearAll
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedNamesSet = new Set(
    selectedIngredients.map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim())
  );

  // All master items matching search query
  const matchingMaster = masterIngredients.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return item.name.toLowerCase().includes(q) || (item.categoryName || '').toLowerCase().includes(q);
  });

  // Available suggestions (excluding already selected)
  const filteredSuggestions = matchingMaster.filter(item => {
    return !selectedNamesSet.has(item.name.toLowerCase().trim());
  }).slice(0, 15);

  const isAlreadySelectedQuery = query.trim() && matchingMaster.length > 0 && filteredSuggestions.length === 0;
  const isTrulyInvalidQuery = query.trim() && matchingMaster.length === 0;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredSuggestions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredSuggestions.length) % Math.max(1, filteredSuggestions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && filteredSuggestions[selectedIndex]) {
        handleSelect(filteredSuggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (ingredient) => {
    onAddIngredient(ingredient);
    setQuery('');
    setSelectedIndex(0);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      
      {/* ── SEARCH INPUT WITH AUTOCOMPLETE ── */}
      <div className="relative">
        <div className="relative flex items-center bg-[var(--bg-input)] border border-[var(--border-color)] focus-within:border-[#d4af37] rounded-2xl p-1.5 transition-all shadow-inner">
          <Search size={18} className="text-gray-400 ml-3 shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Type ingredient name (e.g. Potato, Paneer, Tomato, Rice)..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-white placeholder-gray-500 py-2 px-3 text-xs font-bold outline-none"
          />

          {query && (
            <button
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="p-1.5 rounded-full text-gray-400 hover:text-white mr-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── AUTOCOMPLETE DROPDOWN ── */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-[#d4af37]/40 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto backdrop-blur-xl animate-fade-in">
            
            <div className="p-2 border-b border-[var(--border-color)] text-[10px] font-black uppercase text-[#d4af37] tracking-wider flex justify-between items-center bg-black/30">
              <span>Master Dataset Ingredients ({filteredSuggestions.length} available)</span>
              <span className="text-gray-400 font-normal">Use ↑↓ keys & Enter</span>
            </div>

            {/* Loading State */}
            {masterIngredients.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-[#d4af37]" />
                <span>Loading Master Ingredient Database...</span>
              </div>
            )}

            {/* Suggestions Available */}
            {filteredSuggestions.length > 0 && (
              <div className="p-1 space-y-1">
                {filteredSuggestions.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all text-xs ${
                      selectedIndex === idx
                        ? 'bg-[#d4af37] text-black font-black shadow-glow-gold'
                        : 'text-gray-200 hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon || '🥗'}</span>
                      <span className="font-bold">{item.name}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedIndex === idx ? 'bg-black/20 text-black' : 'bg-[var(--bg-elevated)] text-gray-400'
                    }`}>
                      {item.categoryName}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Already Selected Notice (Amber, NOT Red Error) */}
            {isAlreadySelectedQuery && (
              <div className="p-4 text-center text-xs text-amber-400 space-y-1">
                <Info size={18} className="mx-auto text-amber-400" />
                <p className="font-bold">"{query}" is already added to your pantry!</p>
                <p className="text-[10px] text-gray-400">See your active pantry chips above.</p>
              </div>
            )}

            {/* Truly Invalid Query Error (Red Error ONLY when genuinely invalid) */}
            {isTrulyInvalidQuery && (
              <div className="p-4 text-center text-xs text-rose-400 space-y-1">
                <AlertCircle size={20} className="mx-auto text-rose-400" />
                <p className="font-black uppercase tracking-wider">Invalid Ingredient</p>
                <p className="text-[11px] text-gray-400">"{query}" does not exist in the recipe dataset. Only official dataset ingredients are permitted.</p>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── GMAIL-STYLE MULTI-SELECT CHIPS ── */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-black text-gray-400 uppercase text-[10px] tracking-wider">
              Selected Pantry Ingredients ({selectedIngredients.length})
            </span>
            <button
              onClick={onClearAll}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((item, idx) => {
              const name = typeof item === 'string' ? item : item.name;
              const icon = typeof item === 'object' && item.icon ? item.icon : '🥗';
              const id = typeof item === 'object' && item.id ? item.id : `chip-${idx}`;

              return (
                <div
                  key={id}
                  className="bg-gradient-to-r from-[#d4af37]/20 to-amber-500/10 border border-[#d4af37]/40 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:border-[#d4af37] transition-all"
                >
                  <span className="text-sm">{icon}</span>
                  <span>{name}</span>
                  <button
                    onClick={() => onRemoveIngredient(item)}
                    className="p-0.5 rounded-full hover:bg-rose-500/30 hover:text-rose-400 transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
