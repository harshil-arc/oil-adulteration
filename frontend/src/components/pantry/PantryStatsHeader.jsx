import { Sparkles, Activity, Clock, Plus, Zap } from 'lucide-react';

export default function PantryStatsHeader({
  selectedIngredients = [],
  popularIngredients = [],
  recentIngredients = [],
  pairings = [],
  onAddIngredient
}) {
  const selectedNamesSet = new Set(
    selectedIngredients.map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim())
  );

  // Category counts
  let vegCount = 0;
  let spiceCount = 0;
  let proteinCount = 0;
  let grainCount = 0;

  selectedIngredients.forEach(item => {
    const cat = typeof item === 'object' && item.categoryName ? item.categoryName : '';
    const name = typeof item === 'string' ? item.toLowerCase() : (item.name || '').toLowerCase();

    if (cat.includes('Vegetable') || cat.includes('Leafy') || name.includes('tomato') || name.includes('potato') || name.includes('onion')) vegCount++;
    else if (cat.includes('Spice') || name.includes('masala') || name.includes('turmeric') || name.includes('pepper')) spiceCount++;
    else if (cat.includes('Dairy') || cat.includes('Pulse') || cat.includes('Meat') || name.includes('paneer') || name.includes('tofu') || name.includes('chicken') || name.includes('dal')) proteinCount++;
    else if (cat.includes('Grain') || name.includes('rice') || name.includes('atta') || name.includes('oats')) grainCount++;
    else vegCount++;
  });

  return (
    <div className="space-y-4">
      
      {/* ── PANTRY STATS BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="card p-3.5 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] to-[#d4af37]/10 space-y-0.5">
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">Total Active</span>
          <p className="text-xl font-black text-white font-mono">{selectedIngredients.length} <span className="text-xs text-gray-400 font-normal">Items</span></p>
        </div>

        <div className="card p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">🥕 Veggies & Greens</span>
          <p className="text-xl font-black text-white font-mono">{vegCount}</p>
        </div>

        <div className="card p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-0.5">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">🥛 Dairy & Protein</span>
          <p className="text-xl font-black text-white font-mono">{proteinCount}</p>
        </div>

        <div className="card p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-0.5">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">🌾 Grains & Staples</span>
          <p className="text-xl font-black text-white font-mono">{grainCount}</p>
        </div>

        <div className="card p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🌶️ Spices & Oils</span>
          <p className="text-xl font-black text-white font-mono">{spiceCount}</p>
        </div>
      </div>

      {/* ── POPULAR & RECENT INGREDIENTS QUICK ADD CHIPS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        
        {/* Popular Ingredients */}
        <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
          <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} /> Popular Pantry Essentials
          </span>
          <div className="flex flex-wrap gap-1.5">
            {popularIngredients.map(item => {
              const name = typeof item === 'string' ? item : item.name;
              const icon = typeof item === 'object' && item.icon ? item.icon : '🥗';
              const isAdded = selectedNamesSet.has(name.toLowerCase().trim());

              if (isAdded) return null;

              return (
                <button
                  key={name}
                  onClick={() => onAddIngredient(item)}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#d4af37] text-gray-300 hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus size={10} className="text-[#d4af37]" />
                  <span>{icon} {name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recently Used */}
        {recentIngredients.length > 0 && (
          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Recently Used Ingredients
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentIngredients.map(item => {
                const name = typeof item === 'string' ? item : item.name;
                const icon = typeof item === 'object' && item.icon ? item.icon : '🥗';
                const isAdded = selectedNamesSet.has(name.toLowerCase().trim());

                if (isAdded) return null;

                return (
                  <button
                    key={name}
                    onClick={() => onAddIngredient(item)}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-blue-400 text-gray-300 hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus size={10} className="text-blue-400" />
                    <span>{icon} {name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── SMART PAIRINGS RECOMMENDATIONS ── */}
      {pairings.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-[var(--bg-elevated)] to-blue-500/10 p-4 rounded-2xl border border-emerald-500/30 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Zap size={13} /> Smart Ingredient Pairings & Suggestions
            </span>
            <span className="text-[10px] text-gray-400">Based on your active pantry</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {pairings.map(item => {
              const name = typeof item === 'string' ? item : item.name;
              const icon = typeof item === 'object' && item.icon ? item.icon : '🥗';

              return (
                <button
                  key={name}
                  onClick={() => onAddIngredient(item)}
                  className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all shadow-sm"
                >
                  <Plus size={12} />
                  <span>{icon} {name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
