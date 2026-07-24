import { useState } from 'react';
import { 
  X, Clock, Flame, ShieldCheck, Heart, Share2, Award, CheckCircle2, 
  AlertTriangle, DollarSign, BookOpen, Utensils, Zap, Plus, Check, Info, AlertCircle, RefreshCw
} from 'lucide-react';

export default function RecipeDetailModal({ isOpen, onClose, recipe, onAddToShoppingList }) {
  const [addedToList, setAddedToList] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !recipe) return null;

  const {
    name = "Paneer Bhurji & Multigrain Toast",
    cuisine = "North Indian",
    mealType = "Breakfast",
    prepTime = 20,
    difficulty = "Easy",
    servings = 2,
    image = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType = "Vegetarian",
    macros = { calories: 380, protein: 24, carbs: 28, fat: 18, fiber: 6, sugar: 4 },
    micros = { iron: 4.2, calcium: 320, vitC: 15, sodium: 340 },
    cost = 75,
    ingredients = [
      "200g Low-fat Paneer (Cottage Cheese)",
      "2 Fine Chopped Tomatoes",
      "1 Medium Onion",
      "1 tsp Cold-Pressed Mustard Oil",
      "1/2 tsp Turmeric & Cumin",
      "2 Slices Whole Wheat Multigrain Bread"
    ],
    instructions = [
      "Heat mustard oil in a pan until warm and temper cumin seeds.",
      "Sauté chopped onions and tomatoes with turmeric, coriander powder, and green chillies until soft.",
      "Crumble fresh paneer into the pan and toss gently for 3-4 minutes on medium flame.",
      "Garnish with chopped cilantro and serve hot alongside toasted multigrain bread."
    ],
    prepTips = "Use cold-pressed mustard oil for authentic flavor and heart-healthy monounsaturated fats. Do not overcook paneer to keep it soft.",
    storageTips = "Store leftover bhurji in an airtight glass container in the refrigerator for up to 24 hours. Reheat gently with a splash of water.",
    healthBenefits = [
      "High quality casein protein for muscle repair and satiety",
      "Turmeric contains curcumin, a potent anti-inflammatory compound",
      "Multigrain fiber stabilizes post-prandial blood glucose"
    ],
    suitableFor = ["Diabetes", "Muscle Building", "Weight Loss", "PCOS", "High Protein"],
    whoShouldAvoid = ["Severe Lactose Intolerance (use Tofu substitute)"],
    substitutions = [],
    medicalAdvice = "",
    aiReasoning = "",
    overallMatchPct = 0,
    ingredientMatchPct = 0,
    wasteReductionPct = 0,
    matchedIngredients = [],
    missingIngredients = [],
    missingWithSubstitutions = [],
    suitableForTags = [],
    avoidIfTags = [],
    explanationBadges = [],
    fiber = 0,
    sugar = 0,
    sodium = 0
  } = recipe;

  // Fallback calculations for instructions if missing in row
  const recipeInstructions = recipe.instructions || [
    `Prep all ingredients: ${ingredients.slice(0, 3).join(', ')}.`,
    `Heat pan on medium flame with oil/ghee and temper spices.`,
    `Add main ingredients and cook thoroughly for ${recipe.cookTimeMin || recipe.prepTime || 15} minutes until tender.`,
    `Garnish with fresh herbs and serve hot.`
  ];

  const handleAddShopping = () => {
    if (onAddToShoppingList) {
      onAddToShoppingList(ingredients);
      setAddedToList(true);
      setTimeout(() => setAddedToList(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="card p-0 rounded-3xl border border-[#d4af37]/40 max-w-2xl w-full my-auto overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Banner Image Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <span className="bg-black/60 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {cuisine} • {mealType}
            </span>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  isSaved ? 'bg-rose-500 text-white border-rose-500' : 'bg-black/60 text-gray-300 border-gray-600 hover:text-white'
                }`}
              >
                <Heart size={16} fill={isSaved ? "white" : "none"} />
              </button>
              <button 
                onClick={onClose}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-gray-300 hover:text-white border border-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Title & Badge */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                dietaryType === 'Non-Vegetarian' ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'
              }`}>
                {dietaryType}
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                ⭐ 4.9 (Accredited Recipe)
              </span>
              <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                Est. ₹{cost} per serving
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">{name}</h2>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-200">

          {/* ⭐ "WHY THIS MEAL?" AI REASONING CARD */}
          <div className="card p-4 rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 space-y-2">
            <h4 className="text-xs font-black uppercase text-[#d4af37] tracking-wider flex items-center gap-2">
              <Zap size={16} /> Why AI Recommended This Meal
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{aiReasoning || medicalAdvice}"
            </p>
          </div>

          {/* Key Macros Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center">
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold block">Calories</span>
              <span className="font-mono font-black text-amber-400 text-sm mt-0.5 block">{macros.calories} kcal</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold block">Protein</span>
              <span className="font-mono font-black text-emerald-400 text-sm mt-0.5 block">{macros.protein}g</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold block">Carbs</span>
              <span className="font-mono font-black text-blue-400 text-sm mt-0.5 block">{macros.carbs}g</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <span className="text-[9px] text-gray-400 font-bold block">Fats</span>
              <span className="font-mono font-black text-purple-400 text-sm mt-0.5 block">{macros.fat}g</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] hidden sm:block">
              <span className="text-[9px] text-gray-400 font-bold block">Prep Time</span>
              <span className="font-mono font-black text-white text-sm mt-0.5 block">{prepTime} min</span>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] hidden sm:block">
              <span className="text-[9px] text-gray-400 font-bold block">Servings</span>
              <span className="font-mono font-black text-white text-sm mt-0.5 block">{servings} People</span>
            </div>
          </div>

          {/* Exact Ingredients List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Utensils size={14} className="text-[#d4af37]" /> Exact Ingredients & Quantities
              </h3>
              <button
                onClick={handleAddShopping}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                  addedToList ? 'bg-emerald-500 text-white' : 'btn-secondary text-[#d4af37] border-[#d4af37]/40'
                }`}
              >
                {addedToList ? <Check size={12} /> : <Plus size={12} />}
                {addedToList ? 'Added to Shopping List!' : 'Add to Shopping List'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                  <span className="font-bold text-white text-xs">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Cooking Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-400" /> Step-by-Step Cooking Instructions
            </h3>
            <ol className="space-y-2.5">
              {recipeInstructions.map((step, idx) => (
                <li key={idx} className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] flex gap-3 text-xs text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-black flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Health Suitability & Warnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
              <h4 className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Who Should Eat This
              </h4>
              <div className="flex flex-wrap gap-1">
                {suitableFor.map((item, idx) => (
                  <span key={idx} className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/30 space-y-2">
              <h4 className="text-[11px] font-black uppercase text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Who Should Avoid / Caution
              </h4>
              <ul className="text-[11px] text-rose-300 space-y-1">
                {whoShouldAvoid.map((item, idx) => (
                  <li key={idx}>⚠️ {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternative Substitutions */}
          {substitutions && substitutions.length > 0 && (
            <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
              <h4 className="text-[11px] font-black uppercase text-[#d4af37] flex items-center gap-1.5">
                <RefreshCw size={14} /> Ingredient Substitutions & Alternatives
              </h4>
              <ul className="space-y-1 text-xs text-gray-300">
                {substitutions.map((sub, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[#d4af37]">🔄</span> {sub}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Storage & Prep Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Preparation Tip</span>
              <p className="text-gray-300">{prepTips}</p>
            </div>
            <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-1">
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Storage & Shelf Life</span>
              <p className="text-gray-300">{storageTips}</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="btn-primary w-full py-3.5 text-xs font-black uppercase tracking-wider"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
