import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Trash2, Calendar, Award, Star, Share2, 
  Sparkles, Heart, Apple, ShoppingCart, User, AlertCircle, 
  ChevronRight, RefreshCw, BarChart2, Check, Clock, Droplet, 
  Flame, ShieldCheck, Stethoscope, Utensils, Zap, Filter, Search,
  X, CheckCircle2, AlertTriangle, BookOpen, ThumbsUp, ThumbsDown,
  Dumbbell, Play, Activity, Moon, Shield, Bot, HelpCircle, ChevronDown, ChevronUp, Edit3, Camera,
  ShoppingBag, RotateCcw
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
import { FALLBACK_MASTER_INGREDIENTS, FALLBACK_CATEGORIZED_INGREDIENTS } from '../data/fallbackMasterIngredients';
import { createUserProfile, rankAndScoreRecipes } from '../services/aiRecommendationEngine';
import { 
  getMealRecommendations, 
  generateMealPlan as generateApiMealPlan, 
  scanPantryVision, 
  generateShoppingList as generateApiShoppingList,
  getMasterIngredients,
  getIngredientPairings,
  validateIngredient as validateApiIngredient
} from '../lib/api';
import AutocompleteIngredientSearch from '../components/pantry/AutocompleteIngredientSearch';
import CategoryIngredientBrowser from '../components/pantry/CategoryIngredientBrowser';
import PantryStatsHeader from '../components/pantry/PantryStatsHeader';
import { 
  generateWeeklyWorkoutPlan, 
  getExerciseLibrary, 
  calculateRecoveryScore, 
  getFitnessBadges, 
  getAiWorkoutRationale,
  getPostWorkoutMealSync
} from '../services/fitnessService';
import WorkoutPlayerModal from '../components/WorkoutPlayerModal';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal';
import AiFitnessCoachDrawer from '../components/AiFitnessCoachDrawer';
import RecipeDetailModal from '../components/RecipeDetailModal';

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Active Tab View: 'planner', 'pantry', 'leftovers', 'shopping', 'workout', 'recovery', 'history', 'dashboard'
  const [activeTab, setActiveTab] = useState('planner');
  
  // ── 1. USER PROFILE STATE (AGE BUG FIX 1-120 YEARS) ─────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [healthProfile, setHealthProfile] = useState({
    name: profile?.name || 'Harshil Patel',
    age: 26, // Fully editable integer (1-120)
    gender: 'Male',
    height: 174, // cm
    weight: 68, // kg
    targetWeight: 65, // kg
    activityLevel: 'Moderately Active',
    goal: 'Weight Loss', // 'Weight Loss', 'Muscle Gain', 'Maintenance', 'Fat Loss'
    region: 'Gujarati',
    state: 'Gujarat',
    city: 'Ahmedabad',
    religion: 'Hindu',
    dietPreference: 'Vegetarian', // 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Eggetarian'
    medicalConditions: ['Diabetes', 'Hypertension'],
    allergies: ['Milk'],
    dailyBudget: '₹300 - ₹600',
    cookingSkill: 'Intermediate',
    cookingTimeMin: 30,
    mealsPerDay: 4,
    favouriteCuisine: 'Gujarati',
    dislikedFoods: ['Karela', 'Capsicum'],
    waterGoalLiters: 3.0,
    sleepHours: 7.5
  });

  const [tempProfile, setTempProfile] = useState(healthProfile);

  // ── 2. MASTER INGREDIENT & SMART PANTRY STORE ──────────────────────────────
  const [masterIngredients, setMasterIngredients] = useState([]);
  const [categorizedIngredients, setCategorizedIngredients] = useState([]);
  const [smartPairings, setSmartPairings] = useState([]);
  const [recentPantryItems, setRecentPantryItems] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_pantry_items');
      return saved ? JSON.parse(saved) : ['Tomato', 'Potato', 'Paneer', 'Onion', 'Spinach', 'Rice'];
    } catch(e) {
      return ['Tomato', 'Potato', 'Paneer', 'Onion', 'Spinach', 'Rice'];
    }
  });

  const [pantryItems, setPantryItems] = useState([
    { id: 'p-1', name: 'Paneer (Cottage Cheese)', icon: '🧀', categoryName: 'Dairy & Protein' },
    { id: 'p-2', name: 'Fresh Tomatoes', icon: '🍅', categoryName: 'Vegetables & Produce' },
    { id: 'p-3', name: 'Onions', icon: '🧅', categoryName: 'Vegetables & Produce' },
    { id: 'p-4', name: 'Whole Wheat Atta', icon: '🌾', categoryName: 'Grains & Staples' },
    { id: 'p-5', name: 'Cold-Pressed Mustard Oil', icon: '🫒', categoryName: 'Oils & Fats' },
    { id: 'p-6', name: 'Sprouted Green Moong', icon: '🫘', categoryName: 'Pulses & Lentils' }
  ]);

  const popularEssentials = useMemo(() => [
    { name: 'Tomato', icon: '🍅', categoryName: 'Vegetables & Produce' },
    { name: 'Potato', icon: '🥔', categoryName: 'Vegetables & Produce' },
    { name: 'Onion', icon: '🧅', categoryName: 'Vegetables & Produce' },
    { name: 'Garlic', icon: '🧄', categoryName: 'Vegetables & Produce' },
    { name: 'Paneer (Cottage Cheese)', icon: '🧀', categoryName: 'Dairy & Protein' },
    { name: 'Fresh Spinach (Palak)', icon: '🥬', categoryName: 'Leafy Greens' },
    { name: 'Whole Wheat Atta', icon: '🌾', categoryName: 'Grains & Staples' },
    { name: 'Basmati Rice', icon: '🍚', categoryName: 'Grains & Staples' },
    { name: 'Chicken', icon: '🍗', categoryName: 'Meat & Poultry' },
    { name: 'Eggs', icon: '🥚', categoryName: 'Dairy & Protein' }
  ], []);

  // Fetch master ingredient database on load with instant fallback
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const res = await getMasterIngredients();
        if (res.data && res.data.success && res.data.master && res.data.master.length > 0) {
          setMasterIngredients(res.data.master);
          setCategorizedIngredients(res.data.categorized || []);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch master ingredients:', err);
      }
      // Instant local fallback if API is slow or offline
      setMasterIngredients(FALLBACK_MASTER_INGREDIENTS);
      setCategorizedIngredients(FALLBACK_CATEGORIZED_INGREDIENTS);
    };
    fetchMasterData();
  }, []);

  // Fetch smart ingredient pairings when active pantry changes
  useEffect(() => {
    const fetchPairings = async () => {
      try {
        const activeNames = pantryItems.map(i => typeof i === 'string' ? i : i.name);
        const res = await getIngredientPairings({ ingredients: activeNames.join(',') });
        if (res.data && res.data.success) {
          setSmartPairings(res.data.pairings || []);
        }
      } catch (err) {
        console.error('Failed to fetch pairings:', err);
      }
    };
    if (pantryItems.length > 0) {
      fetchPairings();
    } else {
      setSmartPairings([]);
    }
  }, [pantryItems]);

  // ── 3. MEAL CATEGORY SLOTS & SEARCH FILTERS ──────────────────────────────────
  const [selectedMealCategory, setSelectedMealCategory] = useState('Breakfast');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [dietFilter, setDietFilter] = useState('All');

  // ── 4. BACKEND AI RECOMMENDATION ENGINE STATE ─────────────────────────────────
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [pantryScanLoading, setPantryScanLoading] = useState(false);
  const [weeklyPlanData, setWeeklyPlanData] = useState(null);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);

  // ── 5. MODALS & DRAWERS STATE ────────────────────────────────────────────────
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [workoutPlayerOpen, setWorkoutPlayerOpen] = useState(false);
  const [exerciseLibraryOpen, setExerciseLibraryOpen] = useState(false);
  const [aiCoachDrawerOpen, setAiCoachDrawerOpen] = useState(false);

  // ── 6. SHOPPING LIST & LEFTOVER RESCUE STATE ──────────────────────────────────
  const [shoppingList, setShoppingList] = useState([
    { id: 's-1', name: 'Fresh Spinach (Palak)', category: 'Vegetables', estCost: 25, checked: false },
    { id: 's-2', name: 'Basmati Rice (1kg)', category: 'Grains & Staples', estCost: 90, checked: false },
    { id: 's-3', name: 'Desi Ghee (200g)', category: 'Spices & Oils', estCost: 140, checked: false }
  ]);

  const [selectedLeftovers, setSelectedLeftovers] = useState(['Yesterday Rice', 'Leftover Dal']);

  // ── 7. HYDRATION & WATER TRACKER ──────────────────────────────────────────────
  const [waterCups, setWaterCups] = useState(10);

  // ── 8. SAVED FAVORITES & MEAL HISTORY ──────────────────────────────────────────
  const [savedFavorites, setSavedFavorites] = useState(['guj-1', 'pun-2']);
  const [mealHistory, setMealHistory] = useState([
    { id: 'h-1', name: 'Methi Thepla & Fresh Curd', mealType: 'Breakfast', calories: 310, protein: 9, status: 'Eaten', timestamp: 'Today, 08:30 AM' },
    { id: 'h-2', name: 'Amritsari Chole & Whole Wheat Roti', mealType: 'Lunch', calories: 440, protein: 18, status: 'Eaten', timestamp: 'Today, 01:30 PM' }
  ]);

  // Handler: Add ingredient with strict validation
  const handleAddIngredient = (item) => {
    const name = typeof item === 'string' ? item : item.name;
    if (!name) return;

    // Strict validation against master list if name is a plain string
    const existsInMaster = masterIngredients.length === 0 || masterIngredients.some(m => m.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (!existsInMaster) return;

    const isAlreadyInPantry = pantryItems.some(i => {
      const iName = typeof i === 'string' ? i : i.name;
      return iName.toLowerCase().trim() === name.toLowerCase().trim();
    });

    if (isAlreadyInPantry) return;

    const newItem = typeof item === 'object' && item.name ? item : {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      icon: '🥗',
      categoryName: 'Vegetables & Produce'
    };

    setPantryItems(prev => [...prev, newItem]);

    setRecentPantryItems(prev => {
      const filtered = prev.filter(r => (typeof r === 'string' ? r : r.name).toLowerCase() !== name.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 8);
      try { localStorage.setItem('recent_pantry_items', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
  };

  const handleRemoveIngredient = (item) => {
    const name = typeof item === 'string' ? item : item.name;
    setPantryItems(prev => prev.filter(i => {
      const iName = typeof i === 'string' ? i : i.name;
      return iName.toLowerCase().trim() !== name.toLowerCase().trim();
    }));
  };

  const handleToggleIngredient = (item) => {
    const name = typeof item === 'string' ? item : item.name;
    const isAlreadyInPantry = pantryItems.some(i => {
      const iName = typeof i === 'string' ? i : i.name;
      return iName.toLowerCase().trim() === name.toLowerCase().trim();
    });

    if (isAlreadyInPantry) {
      handleRemoveIngredient(item);
    } else {
      handleAddIngredient(item);
    }
  };

  const handleClearAllPantry = () => {
    setPantryItems([]);
  };

  // Instant Reactive Recommendation Fetcher (triggers whenever pantry, profile, or filters change)
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      setAiRecommendations([]);
      try {
        const payload = {
          pantryItems: pantryItems.map(i => typeof i === 'string' ? i : i.name),
          medicalConditions: healthProfile.medicalConditions || [],
          allergies: healthProfile.allergies || [],
          dietPreference: dietFilter !== 'All' ? dietFilter : healthProfile.dietPreference,
          mealType: selectedMealCategory,
          cuisine: cuisineFilter,
          searchQuery: recipeSearch,
          healthGoal: healthProfile.goal,
          age: healthProfile.age || 28,
          gender: healthProfile.gender || 'Male',
          height: healthProfile.height || 168,
          weight: healthProfile.weight || 65
        };
        const res = await getMealRecommendations(payload);
        if (isMounted && res.data && res.data.success) {
          setAiRecommendations(res.data.recommendations);
        }
      } catch (err) {
        console.error('Backend meal recommendation fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, [pantryItems, healthProfile, selectedMealCategory, cuisineFilter, dietFilter, recipeSearch]);

  // Sync temp profile when modal opens
  useEffect(() => {
    if (isEditingProfile) {
      setTempProfile({ ...healthProfile });
    }
  }, [isEditingProfile, healthProfile]);

  // ── CALCULATIONS (BMI, BMR, MACROS) ───────────────────────────────────────────
  const calculatedBMI = useMemo(() => {
    if (!healthProfile.height || !healthProfile.weight) return 22.5;
    const heightInMeters = healthProfile.height / 100;
    return parseFloat((healthProfile.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [healthProfile.height, healthProfile.weight]);

  const bmiCategory = useMemo(() => {
    if (calculatedBMI < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (calculatedBMI < 24.9) return { label: 'Normal Weight', color: 'text-emerald-400' };
    if (calculatedBMI < 29.9) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-red-400' };
  }, [calculatedBMI]);

  const targets = useMemo(() => {
    const { weight, height, age, gender } = healthProfile;
    let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'Male' ? 5 : -161);
    let targetCalories = Math.round(bmr * 1.55) + (healthProfile.goal === 'Weight Loss' ? -350 : 350);
    const targetProtein = Math.round(weight * 1.8);
    return { targetCalories, targetProtein, waterGoalLiters: healthProfile.waterGoalLiters };
  }, [healthProfile]);

  // Workout & Fitness Calculations
  const weeklyWorkoutPlan = useMemo(() => generateWeeklyWorkoutPlan(healthProfile), [healthProfile]);
  const currentWorkout = weeklyWorkoutPlan[0];
  const aiRationale = useMemo(() => getAiWorkoutRationale(healthProfile, currentWorkout), [healthProfile, currentWorkout]);
  const postWorkoutSync = useMemo(() => getPostWorkoutMealSync(currentWorkout), [currentWorkout]);
  const exerciseLib = useMemo(() => getExerciseLibrary(), []);
  const recovery = useMemo(() => calculateRecoveryScore(healthProfile.sleepHours, waterCups * 250, 1), [healthProfile.sleepHours, waterCups]);
  const badges = useMemo(() => getFitnessBadges(1, 18, 3400), []);

  // ── PANTRY HANDLERS ──────────────────────────────────────────────────────────
  const handleAddPantry = (e) => {
    e.preventDefault();
    if (newIngredient.name.trim()) {
      setPantryItems([...pantryItems, {
        id: `p-${Date.now()}`,
        name: newIngredient.name.trim(),
        quantity: newIngredient.quantity || '100g',
        category: newIngredient.category,
        expiry: '7 Days'
      }]);
      setNewIngredient({ name: '', quantity: '100g', category: 'Vegetables & Fruits' });
    }
  };

  const removePantryItem = (id) => {
    setPantryItems(pantryItems.filter(i => i.id !== id));
  };

  const handleTriggerPantryScan = async () => {
    setPantryScanLoading(true);
    try {
      const res = await scanPantryVision();
      if (res.data && res.data.success && Array.isArray(res.data.ingredients)) {
        const newItems = res.data.ingredients.map((ing, idx) => ({
          id: `p-scan-${Date.now()}-${idx}`,
          name: ing.name,
          quantity: ing.quantity || '200g',
          category: ing.category || 'Vegetables & Fruits',
          expiry: '5 Days'
        }));

        setPantryItems(prev => {
          const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
          const filtered = newItems.filter(i => !existingNames.has(i.name.toLowerCase()));
          return [...prev, ...filtered];
        });

        alert(`📷 AI Vision Pantry Scan Complete!\n\nSuccessfully detected ${res.data.ingredients.length} fresh pantry ingredients!`);
      }
    } catch (err) {
      console.error('Pantry scan error:', err);
    } finally {
      setPantryScanLoading(false);
    }
  };

  const handleGenerateWeeklyPlan = async () => {
    setIsGeneratingWeekly(true);
    try {
      const payload = {
        pantryItems: pantryItems.map(i => i.name),
        medicalConditions: healthProfile.medicalConditions || [],
        allergies: healthProfile.allergies || [],
        dietPreference: healthProfile.dietPreference,
        planType: 'Weekly',
        healthGoal: healthProfile.goal
      };
      const res = await generateApiMealPlan(payload);
      if (res.data && res.data.success) {
        setWeeklyPlanData(res.data.plan);
      }
    } catch (err) {
      console.error('Failed to generate weekly plan:', err);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const finalAge = Math.max(1, Math.min(120, parseInt(tempProfile.age) || 25));
    const finalHeight = Math.max(50, Math.min(250, parseInt(tempProfile.height) || 170));
    const finalWeight = Math.max(10, Math.min(300, parseInt(tempProfile.weight) || 68));
    
    const updated = {
      ...tempProfile,
      age: finalAge,
      height: finalHeight,
      weight: finalWeight
    };
    setHealthProfile(updated);
    setTempProfile(updated);
    setIsEditingProfile(false);
  };

  const handleAddToShoppingList = (ingredients) => {
    const newItems = ingredients.map((ing, idx) => ({
      id: `shop-${Date.now()}-${idx}`,
      name: ing,
      category: ing.toLowerCase().includes('paneer') || ing.toLowerCase().includes('milk') ? 'Protein & Dairy' : 'Vegetables',
      estCost: Math.floor(20 + Math.random() * 60),
      checked: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const [visibleCount, setVisibleCount] = useState(24);

  // Reset visible count when category or search changes
  useEffect(() => {
    setVisibleCount(24);
  }, [selectedMealCategory, cuisineFilter, dietFilter, recipeSearch]);

  // ── HEALTHIFYME-GRADE AI RECOMMENDATION PROFILE & SCORING PIPELINE ──────────
  const activeUserProfile = useMemo(() => {
    return createUserProfile({
      ...healthProfile,
      pantryItems,
      dietPreference: dietFilter !== 'All' ? dietFilter : healthProfile.dietPreference
    });
  }, [healthProfile, pantryItems, dietFilter]);

  const slotRecipes = useMemo(() => {
    let sourceList = aiRecommendations && aiRecommendations.length > 0 ? aiRecommendations : INDIAN_RECIPES_DATABASE;

    let list = [...sourceList];
    if (selectedMealCategory === 'Breakfast') {
      list = list.filter(r => (r.mealType || '').includes('Breakfast'));
    } else if (selectedMealCategory === 'Lunch') {
      list = list.filter(r => (r.mealType || '').includes('Lunch'));
    } else if (selectedMealCategory === 'Dinner') {
      list = list.filter(r => (r.mealType || '').includes('Dinner'));
    } else if (selectedMealCategory === 'Snacks') {
      list = list.filter(r => (r.mealType || '').includes('Snack') || (r.mealType || '').includes('Breakfast'));
    } else if (selectedMealCategory === 'PostWorkout') {
      list = list.filter(r => (r.mealType || '').includes('PostWorkout') || ((r.protein || r.macros?.protein || 0) >= 12));
    } else if (selectedMealCategory === 'PreWorkout') {
      list = list.filter(r => (r.mealType || '').includes('PreWorkout') || ((r.carbs || r.macros?.carbs || 0) >= 30));
    } else if (selectedMealCategory === 'CheatMeal') {
      list = list.filter(r => (r.mealType || '').includes('CheatMeal') || ((r.calories || r.macros?.calories || 0) >= 350));
    }

    if (cuisineFilter !== 'All') list = list.filter(r => r.cuisine === cuisineFilter);
    if (dietFilter !== 'All') list = list.filter(r => r.dietaryType === dietFilter);
    if (recipeSearch.trim()) {
      const q = recipeSearch.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || (r.cuisine || '').toLowerCase().includes(q));
    }

    // Guarantee minimum 10+ recipes on client side
    if (list.length < 10) {
      for (const item of sourceList) {
        if (list.length >= 15) break;
        if (!list.some(x => x.id === item.id || x.name === item.name)) {
          list.push(item);
        }
      }
    }

    // Rank and Score using 100-Point AI Scoring Engine
    return rankAndScoreRecipes(list, activeUserProfile).slice(0, visibleCount);
  }, [aiRecommendations, selectedMealCategory, cuisineFilter, dietFilter, recipeSearch, activeUserProfile, visibleCount]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-28">
      
      {/* ── TOP HEADER ────────────────────────────────────────────────────────── */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 max-w-5xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles size={16} className="text-[#d4af37]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">FOOD 360 AI PERSONAL NUTRITION COACH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Utensils className="text-[#d4af37]" size={22} /> AI Meal Planner & Nutrition Coach
            </h1>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setActiveTab('pantry')}
              className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5"
            >
              🥫 Pantry ({pantryItems.length})
            </button>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-2 rounded-xl bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 text-xs font-black flex items-center gap-1.5 hover:bg-[#d4af37]/20 shadow-sm"
            >
              <User size={15} /> Edit Health Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── MEDICAL & GOAL DISCLAIMER BANNER ─────────────────────────────────── */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-2 text-[11px] text-amber-300 font-bold flex items-center justify-center gap-2 text-center">
        <Shield size={14} className="shrink-0 text-amber-400" />
        <span>Target: {healthProfile.goal} • {healthProfile.dietPreference} • Medical Concerns: {(healthProfile.medicalConditions || []).join(', ') || 'None'}</span>
      </div>

      {/* ── MAIN SUB-NAVIGATION TAB BAR ─────────────────────────────────────── */}
      <div className="px-5 pt-4 max-w-5xl mx-auto w-full">
        <div className="bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] grid grid-cols-4 sm:grid-cols-8 gap-1 text-[11px] font-bold text-center">
          <button onClick={() => setActiveTab('planner')} className={`py-2 rounded-xl transition-all ${activeTab === 'planner' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🥗 Meal Coach
          </button>
          <button onClick={() => setActiveTab('pantry')} className={`py-2 rounded-xl transition-all ${activeTab === 'pantry' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🥫 Smart Pantry
          </button>
          <button onClick={() => setActiveTab('leftovers')} className={`py-2 rounded-xl transition-all ${activeTab === 'leftovers' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🍲 Leftover Rescue
          </button>
          <button onClick={() => setActiveTab('shopping')} className={`py-2 rounded-xl transition-all ${activeTab === 'shopping' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🛒 Grocery List
          </button>
          <button onClick={() => setActiveTab('workout')} className={`py-2 rounded-xl transition-all ${activeTab === 'workout' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🏋️ Workout
          </button>
          <button onClick={() => setActiveTab('recovery')} className={`py-2 rounded-xl transition-all ${activeTab === 'recovery' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            💧 Water
          </button>
          <button onClick={() => setActiveTab('history')} className={`py-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            📜 History Log
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            📊 Overview
          </button>
        </div>
      </div>

      {/* ── 1. MEAL PLANNER & RECIPE OPTIONS TAB ─────────────────────────────── */}
      {activeTab === 'planner' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          
          {/* Top Banner: Goal & Pantry Status */}
          <div className="card p-5 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div>
              <span className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest block mb-1">Personalized Nutrition Blueprint</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{healthProfile.goal} AI Meal Plan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Target: <span className="text-emerald-400 font-bold">{targets.targetCalories} kcal</span> • Protein: <span className="text-blue-400 font-bold">{targets.targetProtein}g</span> • Pantry Ingredients Matched: <span className="text-amber-400 font-bold">{pantryItems.length} Available</span></p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleGenerateWeeklyPlan} 
                disabled={isGeneratingWeekly}
                className="btn-primary py-2.5 px-4 text-xs font-black flex items-center gap-1.5 shadow-glow-gold"
              >
                {isGeneratingWeekly ? <RefreshCw size={14} className="animate-spin" /> : <Calendar size={14} />}
                {isGeneratingWeekly ? 'Generating...' : '📅 Generate 7-Day Weekly Plan'}
              </button>
              <button onClick={() => setActiveTab('pantry')} className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 text-[#d4af37] border-[#d4af37]/40">
                🥫 Pantry ({pantryItems.length})
              </button>
            </div>
          </div>

          {/* 7-DAY WEEKLY MEAL PLAN CARD */}
          {weeklyPlanData && weeklyPlanData.days && (
            <div className="card p-6 rounded-3xl border border-emerald-500/40 bg-emerald-500/5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-emerald-500/30 pb-3">
                <div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Dataset Powered</span>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-400" /> 7-Day AI Custom Weekly Meal Plan
                  </h3>
                </div>
                <button onClick={() => setWeeklyPlanData(null)} className="text-xs text-gray-400 hover:text-white underline font-bold">
                  Close Weekly View ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {weeklyPlanData.days.map((dayPlan, idx) => (
                  <div key={idx} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                    <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                      <span className="font-black text-[#d4af37] uppercase text-sm">{dayPlan.day}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{dayPlan.totalCalories} kcal • {dayPlan.totalProtein}g Protein</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-gray-400 font-bold block text-[9px] uppercase">🌅 Breakfast</span>
                        <p className="font-bold text-white leading-tight">{dayPlan.breakfast?.name || 'Healthy Oats & Fruits'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block text-[9px] uppercase">☀️ Lunch</span>
                        <p className="font-bold text-white leading-tight">{dayPlan.lunch?.name || 'Dal, Roti & Sabzi'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block text-[9px] uppercase">🌙 Dinner</span>
                        <p className="font-bold text-white leading-tight">{dayPlan.dinner?.name || 'Paneer Curry & Rice'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block text-[9px] uppercase">🍏 Snack</span>
                        <p className="font-bold text-white leading-tight">{dayPlan.snack?.name || 'Sprouted Moong Salad'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEAL SLOT SELECTOR (Dynamic All Matching Recommendations) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-[#d4af37] uppercase tracking-wider">
                Select Meal Category (Showing All Matching Recipes from Dataset)
              </span>
              <span className="text-gray-400 font-mono text-[11px]">
                {aiRecommendations.length > 0 ? `${aiRecommendations.length} Total Matching Recipes` : ''}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {[
                { slot: 'Breakfast', label: '🌅 Breakfast' },
                { slot: 'Lunch', label: '☀️ Lunch' },
                { slot: 'Dinner', label: '🌙 Dinner' },
                { slot: 'Snacks', label: '🍏 Healthy Snacks' },
                { slot: 'PostWorkout', label: '🏋️ High Protein Post-Workout' },
                { slot: 'PreWorkout', label: '⚡ Energy Pre-Workout' },
                { slot: 'CheatMeal', label: '🍕 Healthy Treat / Cheat Meal' }
              ].map(item => {
                const isSelected = selectedMealCategory === item.slot;
                return (
                  <button
                    key={item.slot}
                    onClick={() => setSelectedMealCategory(item.slot)}
                    className={`py-2.5 px-4 rounded-2xl border transition-all flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-[#d4af37] text-black font-black border-[#d4af37] shadow-glow-gold' 
                        : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)] hover:border-gray-500'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && aiRecommendations.length > 0 && (
                      <span className="bg-black text-[#d4af37] text-[10px] font-mono px-2 py-0.5 rounded-full font-black ml-1">
                        {aiRecommendations.length} Recipes
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Cuisine Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search recipe by name or cuisine..."
                value={recipeSearch}
                onChange={e => setRecipeSearch(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-white rounded-xl py-2.5 pl-9 pr-3 outline-none focus:border-[#d4af37]"
              />
            </div>

            <select
              value={cuisineFilter}
              onChange={e => setCuisineFilter(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-white rounded-xl py-2.5 px-3 outline-none font-bold"
            >
              <option value="All" className="bg-[#18181b]">All Regional Cuisines</option>
              <option value="Gujarati" className="bg-[#18181b]">Gujarati</option>
              <option value="Punjabi" className="bg-[#18181b]">Punjabi</option>
              <option value="South Indian" className="bg-[#18181b]">South Indian</option>
              <option value="Bengali" className="bg-[#18181b]">Bengali</option>
              <option value="Maharashtrian" className="bg-[#18181b]">Maharashtrian</option>
            </select>

            <select
              value={dietFilter}
              onChange={e => setDietFilter(e.target.value)}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] text-white rounded-xl py-2.5 px-3 outline-none font-bold"
            >
              <option value="All" className="bg-[#18181b]">All Diet Types</option>
              <option value="Vegetarian" className="bg-[#18181b]">Vegetarian</option>
              <option value="Non-Vegetarian" className="bg-[#18181b]">Non-Vegetarian</option>
              <option value="Vegan" className="bg-[#18181b]">Vegan</option>
              <option value="Jain" className="bg-[#18181b]">Jain</option>
            </select>
          </div>

          {/* RECIPE RECOMMENDATIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingRecommendations ? (
              <div className="col-span-2 py-12 text-center text-gray-400 space-y-3">
                <RefreshCw size={28} className="animate-spin text-[#d4af37] mx-auto" />
                <p className="text-xs font-bold uppercase tracking-wider">AI Engine is calculating ingredient matching & disease compatibility...</p>
              </div>
            ) : slotRecipes.length === 0 ? (
              <div className="col-span-2 card p-8 text-center text-gray-400 space-y-2">
                <Utensils size={32} className="mx-auto text-amber-400" />
                <h4 className="text-sm font-black text-white">No Matching Recipes Found</h4>
                <p className="text-xs">Try adjusting your filters or adding more pantry items to see recommendations.</p>
              </div>
            ) : (
              slotRecipes.map(recipe => {
                const totalTime = recipe.totalTimeMin || ((recipe.prepTimeMin || recipe.prepTime || 15) + (recipe.cookTimeMin || 20));
                const cals = recipe.calories || recipe.macros?.calories || 280;
                const prot = recipe.protein || recipe.macros?.protein || 14;
                const carbs = recipe.carbs || recipe.macros?.carbs || 35;
                const fat = recipe.fat || recipe.macros?.fat || 10;
                const fiber = recipe.fiber || recipe.macros?.fiber || 4;

                return (
                  <div key={recipe.id} className="card p-5 rounded-3xl border border-[var(--border-color)] hover:border-[#d4af37]/60 transition-all space-y-4 shadow-lg flex flex-col justify-between">
                    
                    <div className="space-y-3">
                      {/* Photo & Top Badges */}
                      <div className="relative h-44 w-full rounded-2xl overflow-hidden">
                        <img src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} alt={recipe.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          <span className="bg-black/70 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {recipe.cuisine} • {totalTime} mins
                          </span>
                          {recipe.wasteReductionPct > 0 && (
                            <span className="bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-0.5 rounded-full">
                              ♻️ Waste Reduction: {recipe.wasteReductionPct}%
                            </span>
                          )}
                        </div>

                        <button 
                          onClick={() => setSavedFavorites(prev => prev.includes(recipe.id) ? prev.filter(x => x !== recipe.id) : [...prev, recipe.id])}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border ${
                            savedFavorites.includes(recipe.id) ? 'bg-rose-500 text-white border-rose-500' : 'bg-black/60 text-gray-300 border-gray-600'
                          }`}
                        >
                          <Heart size={14} fill={savedFavorites.includes(recipe.id) ? "white" : "none"} />
                        </button>
                      </div>

                      {/* Header & Cost */}
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-base font-black text-white leading-snug">{recipe.name}</h3>
                          <span className="text-xs font-mono font-bold text-amber-400 shrink-0">₹{recipe.costEstimate || recipe.cost || 50}</span>
                        </div>
                        
                        {/* Disease & Health Badges */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {recipe.suitableForTags && recipe.suitableForTags.length > 0 ? (
                            recipe.suitableForTags.map((tag, idx) => (
                              <span key={idx} className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                🩺 {tag}
                              </span>
                            ))
                          ) : (
                            <span className="bg-blue-500/15 text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              🥗 Health Approved
                            </span>
                          )}
                          {recipe.isVegan && (
                            <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              🌱 Vegan
                            </span>
                          )}
                        </div>
                      </div>

                      {/* MATCH PROGRESS BARS (Ingredient & Overall) */}
                      <div className="space-y-2 bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                            <span className="text-gray-400">Overall Match Score</span>
                            <span className="text-[#d4af37] font-mono">{recipe.overallMatchPct || 85}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-[#d4af37] rounded-full transition-all" style={{ width: `${recipe.overallMatchPct || 85}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                            <span className="text-gray-400">Pantry Ingredient Match</span>
                            <span className="text-emerald-400 font-mono">{recipe.ingredientMatchPct || 70}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${recipe.ingredientMatchPct || 70}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Macros Grid */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-[var(--bg-elevated)] p-2.5 rounded-2xl border border-[var(--border-color)]">
                        <div>
                          <span className="text-gray-400 block font-bold">Calories</span>
                          <span className="font-mono font-black text-amber-400">{cals} kcal</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Protein</span>
                          <span className="font-mono font-black text-emerald-400">{prot}g</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Carbs</span>
                          <span className="font-mono font-black text-blue-400">{carbs}g</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-bold">Fat</span>
                          <span className="font-mono font-black text-purple-400">{fat}g</span>
                        </div>
                      </div>

                      {/* MISSING INGREDIENTS & SMART SUBSTITUTIONS */}
                      {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                        <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 text-[11px] space-y-1">
                          <span className="font-black text-amber-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                            <AlertCircle size={12} /> Missing Ingredients ({recipe.missingIngredients.length})
                          </span>
                          <p className="text-gray-300 text-[10px]">
                            {recipe.missingIngredients.join(', ')}
                          </p>
                          {recipe.missingWithSubstitutions && recipe.missingWithSubstitutions.length > 0 && (
                            <div className="pt-1 text-[10px] text-amber-300 font-bold border-t border-amber-500/20">
                              <span>🔄 Smart Substitutions available (e.g. {recipe.missingWithSubstitutions[0].ingredient} → {recipe.missingWithSubstitutions[0].substitutions.join(' / ')})</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ⭐ "WHY THIS MEAL?" AI EXPLANATION CARD */}
                      <div className="bg-[#d4af37]/10 p-3 rounded-2xl border border-[#d4af37]/30 text-[11px] space-y-1">
                        <span className="font-black text-[#d4af37] uppercase tracking-wider text-[9px] flex items-center gap-1">
                          <Zap size={12} /> Why AI Recommended This Meal
                        </span>
                        <div className="space-y-0.5 text-gray-300 text-[10px]">
                          {recipe.explanationBadges && recipe.explanationBadges.length > 0 ? (
                            recipe.explanationBadges.map((badge, idx) => (
                              <p key={idx} className="font-medium">{badge}</p>
                            ))
                          ) : (
                            <p className="italic">"Matched for your health goal with balanced nutrition using pantry staples."</p>
                          )}
                        </div>
                      </div>

                      {/* ⚠ HEALTH WARNINGS CARD */}
                      {recipe.healthWarnings && recipe.healthWarnings.length > 0 && (
                        <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/30 text-[11px] space-y-1">
                          <span className="font-black text-rose-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                            <AlertCircle size={12} /> Health & Medical Warning
                          </span>
                          <div className="space-y-0.5 text-rose-300 text-[10px]">
                            {recipe.healthWarnings.map((warn, idx) => (
                              <p key={idx} className="font-bold">{warn}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                      <button
                        onClick={() => setSelectedRecipeDetail(recipe)}
                        className="btn-primary flex-1 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        View Full Recipe & Instructions →
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* LOAD MORE / SHOW ALL RECIPES BUTTONS */}
          {aiRecommendations.length > visibleCount && (
            <div className="flex flex-wrap justify-center items-center gap-3 pt-6 pb-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="btn-secondary py-3 px-6 text-xs font-black uppercase tracking-wider text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37]/10 shadow-lg inline-flex items-center gap-2"
              >
                <Plus size={16} /> Load 24 More Recipes (Showing {visibleCount} of {aiRecommendations.length})
              </button>

              <button
                onClick={() => setVisibleCount(aiRecommendations.length)}
                className="btn-primary py-3 px-6 text-xs font-black uppercase tracking-wider text-black bg-[#d4af37] hover:bg-amber-400 shadow-glow-gold inline-flex items-center gap-2"
              >
                <Sparkles size={16} /> Show All {aiRecommendations.length} Recommendations Immediately
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 2. SMART PANTRY SYSTEM TAB ─────────────────────────────────────────── */}
      {activeTab === 'pantry' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          
          {/* Top Pantry Header & AI Camera Scan */}
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-color)] pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Utensils size={22} className="text-[#d4af37]" /> Smart Pantry System
                </h3>
                <p className="text-xs text-gray-400">
                  Select official dataset ingredients to reactively generate 100% matched AI recipes.
                </p>
              </div>

              <button 
                onClick={handleTriggerPantryScan} 
                disabled={pantryScanLoading}
                className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 text-blue-400 border-blue-500/40 hover:bg-blue-500/10 disabled:opacity-50 shadow-md"
              >
                {pantryScanLoading ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                {pantryScanLoading ? 'Scanning Fridge Photo...' : '📷 AI Camera Pantry Scan'}
              </button>
            </div>

            {/* Pantry Statistics & Smart Suggestions */}
            <PantryStatsHeader
              selectedIngredients={pantryItems}
              popularIngredients={popularEssentials}
              recentIngredients={recentPantryItems}
              pairings={smartPairings}
              onAddIngredient={handleAddIngredient}
            />

            {/* Google / Gmail Style Autocomplete Search */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <label className="block text-xs font-black text-[#d4af37] uppercase tracking-wider mb-2">
                🔍 Autocomplete Ingredient Search (Dataset Enforced)
              </label>
              <AutocompleteIngredientSearch
                masterIngredients={masterIngredients}
                selectedIngredients={pantryItems}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
                onClearAll={handleClearAllPantry}
              />
            </div>
          </div>

          {/* Grocery Category Browser with Checkboxes */}
          <CategoryIngredientBrowser
            categorizedIngredients={categorizedIngredients}
            selectedIngredients={pantryItems}
            onToggleIngredient={handleToggleIngredient}
          />

        </div>
      )}

      {/* ── 3. LEFTOVER RESCUE TAB ─────────────────────────────────────────────── */}
      {activeTab === 'leftovers' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <RotateCcw size={20} className="text-emerald-400" /> Leftover Food Rescue Generator
            </h3>
            <p className="text-xs text-gray-300">Select leftover ingredients from yesterday to generate quick, zero-waste recipes.</p>

            <div className="flex flex-wrap gap-2 text-xs">
              {['Yesterday Rice', 'Leftover Dal', 'Old Bread', 'Paneer Cubes', 'Cooked Potatoes', 'Overripe Bananas'].map(item => {
                const isSelected = selectedLeftovers.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => setSelectedLeftovers(prev => isSelected ? prev.filter(x => x !== item) : [...prev, item])}
                    className={`px-3.5 py-2 rounded-xl font-bold border transition-all ${
                      isSelected ? 'bg-emerald-500 text-black font-black border-emerald-500' : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>

            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">AI Generated Leftover Recipe</span>
              <h4 className="text-base font-black text-white">Tadka Masala Rice & Dal Tikki</h4>
              <p className="text-xs text-gray-400">Toss yesterday's rice with mustard seeds, curry leaves, turmeric & green chillies. Shape leftover dal into crispy pan-fried patties.</p>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-emerald-400 pt-2 border-t border-[var(--border-color)]">
                <span>320 kcal • 11g Protein</span>
                <span className="text-[#d4af37]">Ready in 12 mins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. GROCERY SHOPPING LIST TAB ──────────────────────────────────────── */}
      {activeTab === 'shopping' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#d4af37]" /> Categorized Grocery Shopping List
                </h3>
                <p className="text-xs text-gray-400">Auto-generated for missing ingredients.</p>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                Est. Total: ₹{shoppingList.reduce((acc, i) => acc + i.estCost, 0)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {['Vegetables', 'Protein & Dairy', 'Spices & Oils', 'Grains & Staples'].map(cat => {
                const catItems = shoppingList.filter(i => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="font-bold text-[#d4af37] uppercase text-[10px] tracking-wider">{cat}</h4>
                    <div className="space-y-1.5">
                      {catItems.map(item => (
                        <div key={item.id} className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)] flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => setShoppingList(prev => prev.map(x => x.id === item.id ? { ...x, checked: !x.checked } : x))}
                              className="w-4 h-4 accent-[#d4af37]"
                            />
                            <span className={`font-bold ${item.checked ? 'line-through text-gray-500' : 'text-white'}`}>{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-amber-400">₹{item.estCost}</span>
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

      {/* ── 5. WORKOUT TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'workout' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest block mb-1">Prescribed Session</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{currentWorkout.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{currentWorkout.focus} • {currentWorkout.difficulty} Level</p>
              </div>
              <button onClick={() => setWorkoutPlayerOpen(true)} className="btn-primary py-3 px-5 text-xs font-black shadow-glow-gold flex items-center gap-2">
                <Play size={16} /> Start Interactive Session →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. WATER TRACKER TAB ───────────────────────────────────────────────── */}
      {activeTab === 'recovery' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-blue-500/30 bg-blue-500/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-black uppercase text-blue-400 tracking-wider">Hydration Tracker</span>
                <h3 className="text-2xl font-black text-white">{waterCups * 250} ml / {Math.round(healthProfile.waterGoalLiters * 1000)} ml</h3>
              </div>
              <button onClick={() => setWaterCups(prev => prev + 1)} className="btn-primary py-2.5 px-4 text-xs font-bold">
                + Add Cup (250ml)
              </button>
            </div>

            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((waterCups * 250) / (healthProfile.waterGoalLiters * 1000)) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MEAL HISTORY LOG TAB ───────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
            <h3 className="text-base font-black text-white">Daily Meal History & Log</h3>
            <div className="space-y-2.5 text-xs">
              {mealHistory.map(item => (
                <div key={item.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">{item.mealType}</span>
                    <h4 className="font-black text-white text-sm mt-0.5">{item.name}</h4>
                    <p className="text-[10px] text-gray-400">{item.timestamp}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-emerald-400 text-sm block">{item.calories} kcal</span>
                    <span className="text-gray-400 text-[10px]">{item.protein}g Protein</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. OVERVIEW TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase">Daily Calorie Target</span>
              <p className="text-3xl font-black text-white font-mono">{targets.targetCalories} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
              <p className="text-[10px] text-gray-400">Based on Goal: {healthProfile.goal}</p>
            </div>

            <div className="card p-5 rounded-3xl border border-blue-500/30 bg-blue-500/10 space-y-1">
              <span className="text-xs font-bold text-blue-400 uppercase">Daily Protein Target</span>
              <p className="text-3xl font-black text-white font-mono">{targets.targetProtein} <span className="text-xs text-gray-400 font-normal">grams</span></p>
              <p className="text-[10px] text-gray-400">1.8g per kg ({healthProfile.weight} kg)</p>
            </div>

            <div className="card p-5 rounded-3xl border border-purple-500/30 bg-purple-500/10 space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase">BMI Status</span>
              <p className="text-3xl font-black text-white font-mono">{calculatedBMI} <span className={`text-xs font-bold ${bmiCategory.color}`}>({bmiCategory.label})</span></p>
              <p className="text-[10px] text-gray-400">Height: {healthProfile.height} cm • Weight: {healthProfile.weight} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* ── RECIPE DETAIL MODAL ──────────────────────────────────────────────── */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          isOpen={!!selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          recipe={selectedRecipeDetail}
          onAddToShoppingList={handleAddToShoppingList}
        />
      )}

      {/* ── USER PROFILE EDIT MODAL (AGE BUG FIX: 1-120 YEARS) ─────────────────── */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-lg w-full space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">AI Customization</span>
                <h3 className="text-lg font-black text-[var(--text-color)] flex items-center gap-2">
                  <User size={18} className="text-[#d4af37]" /> Health & Medical Profile
                </h3>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* 🌟 LIVE BIOMETRIC & NUTRITION SUMMARY CARD */}
              {(() => {
                const liveCalc = createUserProfile(tempProfile);
                return (
                  <div className="bg-gradient-to-br from-[#d4af37]/15 to-amber-500/5 p-4 rounded-2xl border border-[#d4af37]/40 space-y-2">
                    <div className="flex justify-between items-center text-xs font-black text-[#d4af37] uppercase tracking-wider">
                      <span>Live Biometric Calculation</span>
                      <span className="bg-[#d4af37]/20 text-white px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                        <span>{liveCalc.targets.lifeStage.icon}</span>
                        <span>{liveCalc.targets.lifeStage.label}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold pt-1">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-gray-400 text-[9px] block uppercase font-bold">BMI Index</span>
                        <span style={{ color: liveCalc.biometrics.color }} className="text-base font-black font-mono">
                          {liveCalc.biometrics.bmi}
                        </span>
                        <span className="text-[9px] text-gray-300 block font-bold">{liveCalc.biometrics.category}</span>
                      </div>

                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-gray-400 text-[9px] block uppercase font-bold">Healthy Range</span>
                        <span className="text-xs font-black text-emerald-400 font-mono block pt-1">
                          {liveCalc.biometrics.healthyWeightRange.min}–{liveCalc.biometrics.healthyWeightRange.max} kg
                        </span>
                        <span className="text-[8px] text-gray-400 block">Target Range</span>
                      </div>

                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-gray-400 text-[9px] block uppercase font-bold">Target Calories</span>
                        <span className="text-xs font-black text-amber-400 font-mono block pt-1">
                          {liveCalc.targets.targetCalories} kcal
                        </span>
                        <span className="text-[8px] text-gray-400 block">TDEE {liveCalc.targets.tdee}</span>
                      </div>

                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-gray-400 text-[9px] block uppercase font-bold">Protein / Water</span>
                        <span className="text-xs font-black text-blue-400 font-mono block pt-1">
                          {liveCalc.targets.targetProtein}g / {liveCalc.targets.targetWaterLiters}L
                        </span>
                        <span className="text-[8px] text-gray-400 block">Daily Intake</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Input Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Age (1–120 Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={tempProfile.age}
                    onChange={e => {
                      const v = e.target.value;
                      setTempProfile({ ...tempProfile, age: v === '' ? '' : parseInt(v) });
                    }}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-[var(--text-color)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Gender</label>
                  <select
                    value={tempProfile.gender}
                    onChange={e => setTempProfile({ ...tempProfile, gender: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-[var(--text-color)] outline-none"
                  >
                    <option value="Male" className="bg-[var(--bg-card)] text-[var(--text-color)]">Male</option>
                    <option value="Female" className="bg-[var(--bg-card)] text-[var(--text-color)]">Female</option>
                    <option value="Other" className="bg-[var(--bg-card)] text-[var(--text-color)]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={tempProfile.height}
                    onChange={e => {
                      const v = e.target.value;
                      setTempProfile({ ...tempProfile, height: v === '' ? '' : parseInt(v) });
                    }}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-[var(--text-color)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={tempProfile.weight}
                    onChange={e => {
                      const v = e.target.value;
                      setTempProfile({ ...tempProfile, weight: v === '' ? '' : parseInt(v) });
                    }}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-[var(--text-color)] outline-none"
                  />
                </div>
              </div>

              {/* Goal & Diet Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Primary Goal</label>
                  <select
                    value={tempProfile.goal}
                    onChange={e => setTempProfile({ ...tempProfile, goal: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-[var(--text-color)] outline-none"
                  >
                    <option value="Weight Loss" className="bg-[var(--bg-card)] text-[var(--text-color)]">Weight Loss</option>
                    <option value="Muscle Gain" className="bg-[var(--bg-card)] text-[var(--text-color)]">Muscle Gain</option>
                    <option value="Maintenance" className="bg-[var(--bg-card)] text-[var(--text-color)]">Maintenance</option>
                    <option value="Fat Loss" className="bg-[var(--bg-card)] text-[var(--text-color)]">Fat Loss</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 font-bold block mb-1">Diet Preference</label>
                  <select
                    value={tempProfile.dietPreference}
                    onChange={e => setTempProfile({ ...tempProfile, dietPreference: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-[var(--text-color)] outline-none"
                  >
                    <option value="Vegetarian" className="bg-[var(--bg-card)] text-[var(--text-color)]">Vegetarian</option>
                    <option value="Non-Vegetarian" className="bg-[var(--bg-card)] text-[var(--text-color)]">Non-Vegetarian</option>
                    <option value="Vegan" className="bg-[var(--bg-card)] text-[var(--text-color)]">Vegan</option>
                    <option value="Jain" className="bg-[var(--bg-card)] text-[var(--text-color)]">Jain</option>
                    <option value="Eggitarian" className="bg-[var(--bg-card)] text-[var(--text-color)]">Eggitarian</option>
                  </select>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block">Medical Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {['Diabetes', 'PCOS', 'Hypertension', 'High Cholesterol', 'Kidney Disease', 'Anemia', 'Pregnancy', 'Senior Citizen', 'Children'].map(cond => {
                    const isSelected = (tempProfile.medicalConditions || []).includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => {
                          const list = tempProfile.medicalConditions || [];
                          const updated = isSelected ? list.filter(c => c !== cond) : [...list, cond];
                          setTempProfile({ ...tempProfile, medicalConditions: updated });
                        }}
                        className={`px-3 py-1 rounded-xl font-bold text-xs border ${
                          isSelected ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black' : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-secondary flex-1 py-3 text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-3 text-xs font-black uppercase">
                  Save & Update AI Plan →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Coach Assistant Button */}
      <button
        onClick={() => setAiCoachDrawerOpen(true)}
        className="fixed bottom-20 right-5 z-40 p-3.5 rounded-full bg-[#d4af37] text-black shadow-glow-gold hover:scale-110 transition-transform flex items-center gap-2 font-black text-xs"
      >
        <Bot size={20} /> Ask AI Coach
      </button>

    </div>
  );
}
