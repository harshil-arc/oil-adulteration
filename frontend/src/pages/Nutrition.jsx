import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Trash2, Calendar, Award, Star, Share2, 
  Sparkles, Heart, Apple, ShoppingCart, User, AlertCircle, 
  ChevronRight, RefreshCw, BarChart2, Check, Clock, Droplet, 
  Flame, ShieldCheck, Stethoscope, Utensils, Zap, Filter, Search,
  X, CheckCircle2, AlertTriangle, BookOpen, ThumbsUp, ThumbsDown,
  Dumbbell, Play, Activity, Moon, Shield, Bot, HelpCircle, ChevronDown, ChevronUp, Edit3, Camera,
  ShoppingBag, RotateCcw, Mic, MicOff, CheckSquare, Square, Printer, Volume2, VolumeX, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  REGIONS_LIST, 
  DIET_PREFERENCES, 
  HEALTH_GOALS_LIST, 
  MEDICAL_CONDITIONS, 
  ALLERGIES_LIST, 
  INDIAN_RECIPES_DATABASE
} from '../data/nutritionData';
import { 
  scoreRecipe, 
  parseNaturalLanguageQuery, 
  SMART_SUBSTITUTIONS,
  calculateBMI,
  calculateDailyNutritionTargets
} from '../services/aiRecommendationEngine';
import RecipeDetailModal from '../components/RecipeDetailModal';
import CookingWorkspaceModal from '../components/CookingWorkspaceModal';
import AiCookingAssistantDrawer from '../components/AiCookingAssistantDrawer';

export default function Nutrition() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useApp();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'planner';

  // Active Tab View: 'planner', 'pantry', 'weekly', 'intelligence', 'shopping'
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // ── 1. USER PROFILE & DYNAMIC PARAMETER STATE ────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [healthProfile, setHealthProfile] = useState({
    name: profile?.name || 'Harshil Patel',
    age: 26,
    gender: 'Male',
    height: 174,
    weight: 68,
    targetWeight: 65,
    activityLevel: 'Moderately Active',
    goal: 'Weight Loss',
    cuisine: 'All',
    dietPreference: 'Vegetarian',
    medicalConditions: ['Diabetes', 'Hypertension'],
    allergies: ['Milk'],
    religion: 'None',
    cookingTimeMin: 30,
    budget: 'Moderate',
    season: 'Summer',
    oilVerified: true
  });

  const [tempProfile, setTempProfile] = useState(healthProfile);

  // ── 2. PANTRY & BEHAVIORAL HISTORY STORE ──────────────────────────────────────
  const [pantryItems, setPantryItems] = useState([
    'Paneer (Cottage Cheese)', 'Fresh Tomatoes', 'Onions', 'Whole Wheat Atta', 
    'Cold-Pressed Mustard Oil', 'Sprouted Green Moong', 'Rice', 'Potato', 'Spinach', 'Garlic'
  ]);
  const [newIngredientInput, setNewIngredientInput] = useState('');

  // User History for Variety Engine
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [recentlyCooked, setRecentlyCooked] = useState([]);
  const [recentlyRejected, setRecentlyRejected] = useState([]);
  const [frequentlyViewed, setFrequentlyViewed] = useState([]);

  // ── 3. SEARCH & NATURAL LANGUAGE ENGINE ───────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mealTypeFilter, setMealTypeFilter] = useState('All');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [dietFilter, setDietFilter] = useState('All');

  // Modal & Drawer States
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [cookingWorkspaceRecipe, setCookingWorkspaceRecipe] = useState(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Shopping List State
  const [shoppingListItems, setShoppingListItems] = useState([
    { id: 's-1', name: 'Fresh Tomatoes', category: 'Vegetables & Produce', estCost: 40, inPantry: true },
    { id: 's-2', name: 'Firm Tofu', category: 'Dairy & Protein', estCost: 65, inPantry: false },
    { id: 's-3', name: 'Organic Jaggery', category: 'Spices & Seasonings', estCost: 50, inPantry: false },
    { id: 's-4', name: 'Cold-Pressed Mustard Oil', category: 'Oils & Fats', estCost: 180, inPantry: true },
    { id: 's-5', name: 'Quinoa', category: 'Grains & Staples', estCost: 120, inPantry: false }
  ]);

  // Biometrics calculation
  const biometrics = useMemo(() => {
    return calculateBMI(healthProfile.weight, healthProfile.height);
  }, [healthProfile.weight, healthProfile.height]);

  const nutritionTargets = useMemo(() => {
    return calculateDailyNutritionTargets({
      age: healthProfile.age,
      gender: healthProfile.gender,
      height: healthProfile.height,
      weight: healthProfile.weight,
      goal: healthProfile.goal,
      medicalConditions: healthProfile.medicalConditions
    });
  }, [healthProfile]);

  // ── 4. DYNAMIC WEIGHTED RECOMMENDATION ENGINE INVOCATION ────────────────────
  const scoredRecipes = useMemo(() => {
    const parsedNL = parseNaturalLanguageQuery(searchQuery);

    const activeMealType = mealTypeFilter !== 'All' ? mealTypeFilter : parsedNL.mealType;
    const activeDiet = dietFilter !== 'All' ? dietFilter : parsedNL.dietPreference;
    const activeCuisine = cuisineFilter !== 'All' ? cuisineFilter : healthProfile.cuisine;

    return INDIAN_RECIPES_DATABASE.map(recipe => {
      // Execute multi-weighted scoring algorithm
      const scoreResult = scoreRecipe(recipe, {
        rawInput: {
          pantryItems,
          allergies: healthProfile.allergies,
          dietPreference: activeDiet,
          goal: healthProfile.goal,
          medicalConditions: healthProfile.medicalConditions,
          age: healthProfile.age,
          height: healthProfile.height,
          weight: healthProfile.weight,
          gender: healthProfile.gender,
          cuisine: activeCuisine,
          cookingTimeMin: healthProfile.cookingTimeMin,
          season: healthProfile.season,
          religion: healthProfile.religion,
          budget: healthProfile.budget,
          recentlyCooked,
          recentlyRejected,
          frequentlyViewed,
          favoriteRecipes,
          oilVerified: healthProfile.oilVerified
        }
      });

      return {
        ...recipe,
        scoreResult
      };
    })
    .filter(r => !r.scoreResult.isAllergenDisqualified)
    .filter(r => {
      if (activeMealType !== 'All' && r.mealType?.toLowerCase() !== activeMealType.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchIng = (r.ingredients || []).some(i => i.toLowerCase().includes(q));
        const matchCuisine = (r.cuisine || '').toLowerCase().includes(q);
        return matchName || matchIng || matchCuisine;
      }
      return true;
    })
    .sort((a, b) => b.scoreResult.overallScore - a.scoreResult.overallScore);
  }, [
    pantryItems, healthProfile, recentlyCooked, recentlyRejected, 
    frequentlyViewed, favoriteRecipes, searchQuery, mealTypeFilter, cuisineFilter, dietFilter
  ]);

  // ── 5. 7-DAY WEEKLY PLAN GENERATOR ──────────────────────────────────────────
  const weeklyMealPlan = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let idx = 0;

    return days.map(day => {
      const b = scoredRecipes.find(r => r.mealType === 'Breakfast' && !recentlyCooked.includes(r.id)) || scoredRecipes[idx % scoredRecipes.length];
      const l = scoredRecipes.find(r => r.mealType === 'Lunch' && r.id !== b?.id) || scoredRecipes[(idx + 1) % scoredRecipes.length];
      const d = scoredRecipes.find(r => r.mealType === 'Dinner' && r.id !== l?.id) || scoredRecipes[(idx + 2) % scoredRecipes.length];
      const s = scoredRecipes.find(r => (r.mealType === 'Snack' || r.mealType === 'Breakfast') && r.id !== d?.id) || scoredRecipes[(idx + 3) % scoredRecipes.length];

      idx += 2;

      const totalCals = (b?.macros?.calories || 200) + (l?.macros?.calories || 350) + (d?.macros?.calories || 400) + (s?.macros?.calories || 150);
      const totalProt = (b?.macros?.protein || 8) + (l?.macros?.protein || 18) + (d?.macros?.protein || 22) + (s?.macros?.protein || 6);

      return {
        day,
        breakfast: b,
        lunch: l,
        dinner: d,
        snack: s,
        totalCals,
        totalProt
      };
    });
  }, [scoredRecipes, recentlyCooked]);

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Try typing your search!');
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.start();
  };

  // Pantry Management Handlers
  const handleAddPantryItem = () => {
    if (!newIngredientInput.trim()) return;
    if (!pantryItems.includes(newIngredientInput.trim())) {
      setPantryItems([...pantryItems, newIngredientInput.trim()]);
    }
    setNewIngredientInput('');
  };

  const handleRemovePantryItem = (item) => {
    setPantryItems(pantryItems.filter(i => i !== item));
  };

  // Action Buttons on Recipe Cards
  const handleFavorite = (recipeId) => {
    if (favoriteRecipes.includes(recipeId)) {
      setFavoriteRecipes(favoriteRecipes.filter(id => id !== recipeId));
    } else {
      setFavoriteRecipes([...favoriteRecipes, recipeId]);
    }
  };

  const handleCooked = (recipeId) => {
    if (!recentlyCooked.includes(recipeId)) {
      setRecentlyCooked([recipeId, ...recentlyCooked.slice(0, 9)]);
    }
  };

  const handleAddIngredientsToShoppingList = (ingredientNames = []) => {
    const newItems = ingredientNames.map(ing => ({
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: ing,
      category: ing.toLowerCase().includes('oil') ? 'Oils & Fats' : (ing.toLowerCase().includes('tofu') || ing.toLowerCase().includes('paneer') ? 'Dairy & Protein' : 'Vegetables & Produce'),
      estCost: Math.floor(30 + Math.random() * 50),
      inPantry: false
    }));

    setShoppingListItems(prev => [...prev, ...newItems]);
    alert(`🛒 Added ${ingredientNames.length} ingredients to your Smart Shopping List!`);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans pb-24 relative">
      {/* Floating AI Cooking Assistant Launcher Button */}
      <button 
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-yellow-600 text-black p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center gap-2 border border-amber-300/40"
      >
        <Bot size={22} />
        <span className="text-xs font-black pr-1 hidden sm:inline">AI Cooking Assistant</span>
      </button>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#161b22]/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300">
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
                  SpectraTrust Meal Intelligence
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Samsung Food AI Engine
                </span>
              </div>
              <p className="text-xs text-gray-400">Context-Aware Nutrition & Oil Safety Recommendation System</p>
            </div>
          </div>

          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
          >
            <User size={14} />
            <span>{healthProfile.name} • {healthProfile.goal}</span>
          </button>
        </div>
      </header>

      {/* Profile Edit Drawer / Modal */}
      {isEditingProfile && (
        <div className="bg-[#161b22] border-b border-gray-800 p-4 animate-fade-in">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Edit3 size={16} /> Dynamic Personalization Parameters
              </h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-xs text-gray-400 hover:text-white">Close ✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Age (Years)</label>
                <input 
                  type="number" 
                  value={tempProfile.age} 
                  onChange={e => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || 26 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Gender</label>
                <select 
                  value={tempProfile.gender}
                  onChange={e => setTempProfile({ ...tempProfile, gender: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={tempProfile.height} 
                  onChange={e => setTempProfile({ ...tempProfile, height: parseFloat(e.target.value) || 170 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  value={tempProfile.weight} 
                  onChange={e => setTempProfile({ ...tempProfile, weight: parseFloat(e.target.value) || 68 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Fitness Goal</label>
                <select 
                  value={tempProfile.goal}
                  onChange={e => setTempProfile({ ...tempProfile, goal: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                >
                  {HEALTH_GOALS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Diet Preference</label>
                <select 
                  value={tempProfile.dietPreference}
                  onChange={e => setTempProfile({ ...tempProfile, dietPreference: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                >
                  {DIET_PREFERENCES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Current Season</label>
                <select 
                  value={tempProfile.season}
                  onChange={e => setTempProfile({ ...tempProfile, season: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                >
                  <option value="Summer">Summer (Hydrating Foods)</option>
                  <option value="Winter">Winter (Warming Millets & Soups)</option>
                  <option value="Monsoon">Monsoon (Fresh Steamed Foods)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Max Cook Time (Min)</label>
                <input 
                  type="number" 
                  value={tempProfile.cookingTimeMin} 
                  onChange={e => setTempProfile({ ...tempProfile, cookingTimeMin: parseInt(e.target.value) || 30 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => {
                  setHealthProfile(tempProfile);
                  setIsEditingProfile(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
              >
                Apply Parameters & Recalculate Scoring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div className="bg-[#161b22] border-b border-gray-800 sticky top-[57px] z-30 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2 text-xs">
          {[
            { id: 'planner', label: 'Intelligent Planner', icon: Sparkles },
            { id: 'pantry', label: `Smart Pantry (${pantryItems.length})`, icon: Utensils },
            { id: 'weekly', label: '7-Day Meal Plan', icon: Calendar },
            { id: 'intelligence', label: 'Nutrition Intelligence', icon: BarChart2 },
            { id: 'shopping', label: `Shopping List (${shoppingListItems.filter(i=>!i.inPantry).length})`, icon: ShoppingBag }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20' 
                    : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        
        {/* ── TAB 1: INTELLIGENT PLANNER ────────────────────────────────────────── */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            
            {/* Search & Voice Bar */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search dishes, ingredients (e.g. 'High protein breakfast under 400 cals')..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={toggleVoiceSearch}
                  className={`p-3 rounded-xl border font-semibold flex items-center gap-2 text-xs transition-all ${
                    isListening 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse' 
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice Search'}</span>
                </button>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-gray-400 flex items-center gap-1 font-semibold">
                  <Filter size={12} /> Filters:
                </span>
                
                {/* Meal Type Filter */}
                <select 
                  value={mealTypeFilter}
                  onChange={e => setMealTypeFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-1"
                >
                  <option value="All">All Meal Types</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="PostWorkout">Post-Workout</option>
                </select>

                {/* Cuisine Filter */}
                <select 
                  value={cuisineFilter}
                  onChange={e => setCuisineFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-1"
                >
                  <option value="All">All Cuisines</option>
                  {REGIONS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Diet Filter */}
                <select 
                  value={dietFilter}
                  onChange={e => setDietFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-1"
                >
                  <option value="All">All Diets</option>
                  {DIET_PREFERENCES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Dynamic Results Summary Banner */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Showing <strong>{scoredRecipes.length}</strong> dynamically ranked recipes based on your biometrics & active pantry ({pantryItems.length} items)</span>
              <span className="text-amber-400 font-semibold">⚡ Re-ranked in real-time</span>
            </div>

            {/* Recipe Cards Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scoredRecipes.map(recipe => {
                const { scoreResult } = recipe;
                const isFav = favoriteRecipes.includes(recipe.id);
                const isCooked = recentlyCooked.includes(recipe.id);

                return (
                  <div 
                    key={recipe.id}
                    className="bg-[#161b22] border border-gray-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Hero Image Header */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <img 
                        src={recipe.image} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-black/60" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                        <span className="bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles size={12} className="text-amber-400" />
                          {scoreResult.overallMatchPct}% Match
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleFavorite(recipe.id)}
                            className={`p-2 rounded-full backdrop-blur-md transition-all ${
                              isFav ? 'bg-rose-500 text-white' : 'bg-black/60 text-gray-300 hover:text-white'
                            }`}
                          >
                            <Heart size={14} fill={isFav ? "white" : "none"} />
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{recipe.cuisine} • {recipe.mealType}</div>
                        <h3 className="text-base font-bold truncate">{recipe.name}</h3>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      {/* Macro Pills */}
                      <div className="grid grid-cols-4 gap-1 text-center bg-gray-900/80 p-2 rounded-xl border border-gray-800 text-[11px]">
                        <div>
                          <div className="text-gray-400 font-medium">Cals</div>
                          <div className="font-bold text-amber-400">{recipe.macros?.calories || recipe.calories}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-medium">Prot</div>
                          <div className="font-bold text-emerald-400">{recipe.macros?.protein || recipe.protein}g</div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-medium">Carbs</div>
                          <div className="font-bold text-sky-400">{recipe.macros?.carbs || recipe.carbs}g</div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-medium">Fat</div>
                          <div className="font-bold text-rose-400">{recipe.macros?.fat || recipe.fat}g</div>
                        </div>
                      </div>

                      {/* Explanation Rationale Badges */}
                      <div className="flex flex-wrap gap-1">
                        {scoreResult.rationaleBadges.slice(0, 3).map((badge, bIdx) => (
                          <span key={bIdx} className="bg-gray-800 text-gray-300 border border-gray-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Pantry Match & Substitutions */}
                      <div className="text-xs space-y-1 bg-gray-900/50 p-2.5 rounded-xl border border-gray-800/80">
                        <div className="flex items-center justify-between text-gray-300">
                          <span>Pantry Match:</span>
                          <span className="font-bold text-emerald-400">{scoreResult.matchedCount} of {scoreResult.totalIngredientsCount} available</span>
                        </div>

                        {scoreResult.suggestedSubstitutes.length > 0 && (
                          <div className="text-[11px] text-amber-300/90 pt-1 border-t border-gray-800">
                            💡 <strong>Smart Sub:</strong> {scoreResult.suggestedSubstitutes[0].ingredient} ➔ {scoreResult.suggestedSubstitutes[0].substitute}
                          </div>
                        )}
                      </div>

                      {/* SpectraTrust Food Safety Badge */}
                      <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-xl text-[11px]">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck size={14} /> SpectraTrust Safe Oil Verified
                        </span>
                        <span className="text-gray-400 text-[10px]">Cold-Pressed</span>
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                        <button 
                          onClick={() => setSelectedRecipeDetail(recipe)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye size={14} /> View Details
                        </button>

                        <button 
                          onClick={() => setCookingWorkspaceRecipe(recipe)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                        >
                          <Play size={14} /> Start Cooking
                        </button>

                        <button 
                          onClick={() => handleCooked(recipe.id)}
                          title="Mark as Cooked"
                          className={`p-2 rounded-xl border transition-all ${
                            isCooked ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: SMART PANTRY MANAGEMENT ───────────────────────────────────── */}
        {activeTab === 'pantry' && (
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Utensils size={20} /> Smart Pantry & Ingredient Inventory
                  </h2>
                  <p className="text-xs text-gray-400">Add what ingredients you have at home. Dynamic recommendations adapt immediately!</p>
                </div>

                <div className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                  {pantryItems.length} Ingredients Active
                </div>
              </div>

              {/* Add Ingredient Input */}
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={newIngredientInput}
                  onChange={e => setNewIngredientInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPantryItem()}
                  placeholder="Type ingredient name (e.g. 'Garlic', 'Tofu', 'Spinach')..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <button 
                  onClick={handleAddPantryItem}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              {/* Pantry Item Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {pantryItems.map(item => (
                  <span 
                    key={item} 
                    className="bg-gray-800 text-gray-200 border border-gray-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 hover:border-amber-500/40 transition-all"
                  >
                    <span>{item}</span>
                    <button onClick={() => handleRemovePantryItem(item)} className="text-gray-400 hover:text-rose-400">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Smart Pairing Suggestions */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Sparkles size={16} /> AI Smart Pairing Recommendations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="font-semibold text-emerald-400">Paneer + Tomatoes + Spinach</div>
                  <div className="text-gray-400 mt-1">High protein & iron combo. Excellent for muscle recovery and hemoglobin synthesis.</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="font-semibold text-sky-400">Quinoa + Mustard Seeds + Curry Leaves</div>
                  <div className="text-gray-400 mt-1">Low-GI Upma pairing prevents blood sugar spikes and aids digestion.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: 7-DAY WEEKLY MEAL PLAN ────────────────────────────────────── */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Calendar size={20} /> 7-Day Intelligent Meal Planner
                </h2>
                <p className="text-xs text-gray-400">Balanced 7-day schedule avoiding meal repetition & rotating regional cuisines</p>
              </div>

              <button 
                onClick={() => setRecentlyCooked([])}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Regenerate 7-Day Plan
              </button>
            </div>

            <div className="space-y-4">
              {weeklyMealPlan.map(dayPlan => (
                <div key={dayPlan.day} className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="text-sm font-bold text-amber-400">{dayPlan.day}</span>
                    <span className="text-xs text-gray-400 font-semibold">
                      Daily Total: <span className="text-amber-300">{dayPlan.totalCals} kcal</span> • <span className="text-emerald-400">{dayPlan.totalProt}g protein</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { slot: 'Breakfast', recipe: dayPlan.breakfast },
                      { slot: 'Lunch', recipe: dayPlan.lunch },
                      { slot: 'Dinner', recipe: dayPlan.dinner },
                      { slot: 'Snack', recipe: dayPlan.snack }
                    ].map(item => (
                      <div key={item.slot} className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase">{item.slot}</div>
                        <div className="font-bold text-gray-200 truncate">{item.recipe?.name || 'Healthy Dish'}</div>
                        <div className="text-[11px] text-amber-400/90">{item.recipe?.macros?.calories || 200} kcal • {item.recipe?.macros?.protein || 10}g protein</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: NUTRITION INTELLIGENCE ────────────────────────────────────── */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <BarChart2 size={20} /> Daily Nutrition Targets & Biometrics Analysis
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-xs text-gray-400">BMI</div>
                  <div className="text-xl font-bold text-amber-400">{biometrics.bmi}</div>
                  <div className="text-[10px] text-emerald-400">{biometrics.category}</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-xs text-gray-400">Target Calories</div>
                  <div className="text-xl font-bold text-amber-400">{nutritionTargets.targetCalories} kcal</div>
                  <div className="text-[10px] text-gray-400">BMR: {nutritionTargets.bmr}</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-xs text-gray-400">Target Protein</div>
                  <div className="text-xl font-bold text-emerald-400">{nutritionTargets.targetProtein} g</div>
                  <div className="text-[10px] text-gray-400">Daily Minimum</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-xs text-gray-400">Water Recommendation</div>
                  <div className="text-xl font-bold text-sky-400">{nutritionTargets.targetWaterLiters} L</div>
                  <div className="text-[10px] text-gray-400">Hydration Target</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: SHOPPING LIST ──────────────────────────────────────────────── */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <ShoppingBag size={20} /> 1-Click Smart Shopping List
                  </h2>
                  <p className="text-xs text-gray-400">Categorized list highlighting items you already have vs items to purchase</p>
                </div>

                <button 
                  onClick={() => alert('Shopping list copied to clipboard!')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 flex items-center gap-1.5"
                >
                  <Share2 size={14} /> Copy List
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {['Vegetables & Produce', 'Dairy & Protein', 'Grains & Staples', 'Oils & Fats', 'Spices & Seasonings'].map(cat => {
                  const itemsInCat = shoppingListItems.filter(i => i.category === cat);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={cat} className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                      <div className="font-bold text-amber-400 border-b border-gray-800 pb-1">{cat}</div>
                      <div className="space-y-1">
                        {itemsInCat.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-gray-300">
                            <span className={item.inPantry ? 'line-through text-gray-500' : 'text-gray-200'}>
                              {item.name}
                            </span>
                            <span className="text-gray-400">
                              {item.inPantry ? '✓ In Pantry' : `₹${item.estCost}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          isOpen={true}
          onClose={() => setSelectedRecipeDetail(null)}
          recipe={selectedRecipeDetail}
          onAddToShoppingList={handleAddIngredientsToShoppingList}
        />
      )}

      {/* Fullscreen Interactive Cooking Assistant Workspace Modal */}
      {cookingWorkspaceRecipe && (
        <CookingWorkspaceModal
          isOpen={true}
          onClose={() => setCookingWorkspaceRecipe(null)}
          recipe={cookingWorkspaceRecipe}
          pantryItems={pantryItems}
          onMarkCooked={handleCooked}
          onAddToShoppingList={handleAddIngredientsToShoppingList}
          onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
        />
      )}

      {/* Floating AI Cooking Assistant Drawer */}
      <AiCookingAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        activeRecipe={cookingWorkspaceRecipe || selectedRecipeDetail}
        onApplyParameterChange={(params) => setHealthProfile(prev => ({ ...prev, ...params }))}
      />
    </div>
  );
}
