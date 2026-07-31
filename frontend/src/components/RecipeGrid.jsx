import { Clock, User, Eye, Plus, Sparkles, ShieldCheck, Check } from 'lucide-react';

export default function RecipeGrid({ 
  recipes = [], 
  onSelectRecipe, 
  onAddToMealPlan,
  addedMealPlanIds = [] 
}) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {recipes.slice(0, 3).map((recipe, idx) => {
        const optionTypes = ['Quick & Easy', 'High Protein / Healthy', 'Balanced / Chef Choice'];
        const badgeColor = idx === 0 
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
          : (idx === 1 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40');
        
        const isAdded = addedMealPlanIds.includes(recipe.id);

        return (
          <div 
            key={recipe.id || idx}
            className="bg-[#161b22] border border-gray-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group"
          >
            {/* Hero Image (16:9 Aspect Ratio) */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
              <img 
                src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
                alt={recipe.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-black/60" />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${badgeColor}`}>
                  {recipe.option_type || optionTypes[idx] || 'Chef Choice'}
                </span>

                <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                  <ShieldCheck size={12} /> Safe Oil
                </span>
              </div>

              {/* Bottom Overlay Pills */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[11px] font-bold text-white z-10">
                <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700/80 flex items-center gap-1">
                  <Clock size={13} className="text-amber-400" />
                  {recipe.prepTimeMinutes || recipe.prep_time_minutes || 20} mins
                </span>
                <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700/80 flex items-center gap-1">
                  <User size={13} className="text-sky-400" />
                  {recipe.servings || 2} servings
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-100 line-clamp-2 group-hover:text-amber-300 transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {(recipe.summary || recipe.description || '').replace(/<[^>]*>?/gm, '')}
                </p>
              </div>

              {/* Ingredient Match Counter */}
              <div className="flex items-center justify-between text-xs bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
                <span className="text-gray-400">Total Ingredients Required:</span>
                <span className="font-bold text-amber-400">
                  {recipe.ingredients?.length || 0} Items
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                <button 
                  onClick={() => onSelectRecipe(recipe)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye size={14} /> View Recipe & Steps
                </button>

                <button 
                  onClick={() => onAddToMealPlan(recipe)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add to Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
