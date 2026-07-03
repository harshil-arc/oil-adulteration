import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Trash2, Calendar, Award, Star, Share2, 
  Sparkles, Heart, Apple, ShoppingCart, User, AlertCircle, 
  ChevronRight, RefreshCw, BarChart2, Check, Clock, Droplet, 
  Flame, ShieldCheck, Stethoscope, Utensils, Zap, Filter, Search,
  X, CheckCircle2, AlertTriangle, BookOpen, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  REGIONS_LIST, 
  DIET_PREFERENCES, 
  SPECIAL_RESTRICTIONS, 
  HEALTH_GOALS_LIST, 
  MEDICAL_CONDITIONS, 
  ALLERGIES_LIST, 
  INDIAN_RECIPES_DATABASE, 
  DISEASE_NUTRITION_RULES, 
  LEFTOVER_RECIPES 
} from '../data/nutritionData';

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Active Tab View: 'dashboard', 'planner', 'pantry', 'leftovers', 'analytics', 'favorites'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Health Profile State
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [healthProfile, setHealthProfile] = useState({
    age: 28,
    gender: 'Male',
    height: 172,
    weight: 68,
    activityLevel: 'Moderately Active',
    goals: ['Healthy Lifestyle', 'Increase Protein Intake'],
    regions: ['North Indian', 'Gujarati'],
    dietPreference: 'Vegetarian',
    specialRestrictions: [],
    medicalConditions: ['Diabetes'],
    allergies: [],
    customAllergies: '',
    dailyBudget: 350,
    cookingSkill: 'Intermediate',
    cookingTimeAvailable: 30,
    familyMembers: 2,
    waterGoalLiters: 3.0
  });

  // Automatically calculate BMI
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

  // Calculate Daily Calorie & Protein Targets (Harris-Benedict / Mifflin-St Jeor)
  const targets = useMemo(() => {
    const { weight, height, age, gender, activityLevel, goals } = healthProfile;
    let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'Male' ? 5 : -161);
    
    let activityMult = 1.375;
    if (activityLevel === 'Sedentary') activityMult = 1.2;
    if (activityLevel === 'Lightly Active') activityMult = 1.375;
    if (activityLevel === 'Moderately Active') activityMult = 1.55;
    if (activityLevel === 'Very Active') activityMult = 1.725;
    if (activityLevel === 'Athlete') activityMult = 1.9;

    let targetCalories = Math.round(bmr * activityMult);

    if (goals.includes('Weight Loss') || goals.includes('Fat Loss')) targetCalories -= 400;
    if (goals.includes('Weight Gain') || goals.includes('Muscle Building')) targetCalories += 350;

    let proteinPerKg = 1.4;
    if (goals.includes('Increase Protein Intake') || goals.includes('Muscle Building')) proteinPerKg = 1.8;
    if (goals.includes('Weight Loss')) proteinPerKg = 1.6;

    const targetProtein = Math.round(weight * proteinPerKg);
    const targetCarbs = Math.round((targetCalories * 0.5) / 4);
    const targetFat = Math.round((targetCalories * 0.25) / 9);
    const targetFiber = 35; // grams

    return { targetCalories, targetProtein, targetCarbs, targetFat, targetFiber };
  }, [healthProfile]);

  // Water Intake State
  const [waterCups, setWaterCups] = useState(6); // 250ml per cup

  // Pantry Items State
  const [pantryItems, setPantryItems] = useState([
    { id: 'p-1', name: 'Spinach (Palak)', qty: '250g', category: 'Vegetables', expiry: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { id: 'p-2', name: 'Yellow Moong Dal', qty: '1 kg', category: 'Grains & Pulses', expiry: '2026-10-15' },
    { id: 'p-3', name: 'Tomatoes', qty: '500g', category: 'Vegetables', expiry: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
    { id: 'p-4', name: 'Low-fat Curd', qty: '400g', category: 'Dairy', expiry: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { id: 'p-5', name: 'Whole Wheat Flour', qty: '5 kg', category: 'Grains & Pulses', expiry: '2026-12-01' }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1 kg');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetables');

  // Recipe Modal & Favorites State
  const [selectedRecipeModal, setSelectedRecipeModal] = useState(null);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(['guj-1', 'pun-2']);
  const [consumedMealIds, setConsumedMealIds] = useState(['guj-1']);

  // Selected Leftover Items for Leftover Engine
  const [selectedLeftovers, setSelectedLeftovers] = useState(['Leftover Dal', 'Leftover Rice']);

  // Selected Day for 7-Day Planner
  const [selectedPlannerDay, setSelectedPlannerDay] = useState('Monday');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('spectra_health_profile');
    if (saved) {
      try {
        setHealthProfile(JSON.parse(saved));
        setHasProfile(true);
      } catch (e) { console.error(e); }
    } else {
      setIsEditingProfile(true); // Open wizard automatically on first visit
    }

    const savedPantry = localStorage.getItem('spectra_pantry_items');
    if (savedPantry) {
      try { setPantryItems(JSON.parse(savedPantry)); } catch(e){}
    }

    const savedFavs = localStorage.getItem('spectra_fav_recipes');
    if (savedFavs) {
      try { setFavoriteRecipeIds(JSON.parse(savedFavs)); } catch(e){}
    }
  }, []);

  // Save profile helper
  const saveHealthProfile = (updated) => {
    setHealthProfile(updated);
    setHasProfile(true);
    localStorage.setItem('spectra_health_profile', JSON.stringify(updated));
    setIsEditingProfile(false);
  };

  // Expiring Pantry Items Check (<= 2 days)
  const expiringPantryItems = useMemo(() => {
    const today = new Date();
    return pantryItems.filter(item => {
      if (!item.expiry) return false;
      const expDate = new Date(item.expiry);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2;
    });
  }, [pantryItems]);

  // Dynamic Recipe Filtering Engine based on User Profile
  const filteredRecipes = useMemo(() => {
    return INDIAN_RECIPES_DATABASE.filter(recipe => {
      // 1. Allergy Exclude Check
      if (healthProfile.allergies && healthProfile.allergies.length > 0) {
        const hasAllergen = healthProfile.allergies.some(allergy => {
          const allergyLower = allergy.toLowerCase();
          return recipe.ingredients.some(ing => ing.toLowerCase().includes(allergyLower));
        });
        if (hasAllergen) return false;
      }

      // 2. Dietary Preference Check
      if (healthProfile.dietPreference === 'Vegetarian' && recipe.dietaryType === 'Non-Vegetarian') return false;
      if (healthProfile.dietPreference === 'Vegan' && recipe.dietaryType !== 'Vegan') return false;
      if (healthProfile.dietPreference === 'Jain' && recipe.ingredients.some(i => i.toLowerCase().includes('onion') || i.toLowerCase().includes('garlic'))) return false;

      return true;
    });
  }, [healthProfile]);

  // Generate Today's Personalized Meal Plan
  const todayMeals = useMemo(() => {
    const breakfast = filteredRecipes.find(r => r.mealType === 'Breakfast') || INDIAN_RECIPES_DATABASE[0];
    const morningSnack = filteredRecipes.find(r => r.mealType === 'Morning Snack' || r.mealType === 'Evening Snack') || INDIAN_RECIPES_DATABASE[1];
    const lunch = filteredRecipes.find(r => r.mealType === 'Lunch') || INDIAN_RECIPES_DATABASE[3];
    const eveningSnack = filteredRecipes.find(r => r.mealType === 'Evening Snack') || INDIAN_RECIPES_DATABASE[1];
    const dinner = filteredRecipes.find(r => r.mealType === 'Dinner') || INDIAN_RECIPES_DATABASE[2];

    return [
      { slot: 'Breakfast', time: '08:30 AM', recipe: breakfast },
      { slot: 'Morning Snack', time: '11:00 AM', recipe: morningSnack },
      { slot: 'Lunch', time: '01:30 PM', recipe: lunch },
      { slot: 'Evening Snack', time: '05:30 PM', recipe: eveningSnack },
      { slot: 'Dinner', time: '08:30 PM', recipe: dinner }
    ];
  }, [filteredRecipes]);

  // Calculate Consumed Nutrients Today
  const consumedNutrients = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0;
    todayMeals.forEach(item => {
      if (consumedMealIds.includes(item.recipe.id)) {
        cal += item.recipe.macros.calories;
        pro += item.recipe.macros.protein;
        carb += item.recipe.macros.carbs;
        fat += item.recipe.macros.fat;
        fib += item.recipe.macros.fiber;
      }
    });
    return { cal, pro, carb, fat, fib };
  }, [todayMeals, consumedMealIds]);

  // 7-Day Weekly Meal Schedule Generator
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weeklySchedule = useMemo(() => {
    const schedule = {};
    daysOfWeek.forEach((day, idx) => {
      schedule[day] = {
        Breakfast: filteredRecipes[(idx + 0) % filteredRecipes.length],
        Lunch: filteredRecipes[(idx + 1) % filteredRecipes.length],
        EveningSnack: filteredRecipes[(idx + 2) % filteredRecipes.length],
        Dinner: filteredRecipes[(idx + 3) % filteredRecipes.length],
      };
    });
    return schedule;
  }, [filteredRecipes]);

  // Generate Weekly Grocery Shopping List
  const weeklyGroceryList = useMemo(() => {
    const itemsMap = {};
    Object.values(weeklySchedule).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipe => {
        recipe.ingredients.forEach(ing => {
          itemsMap[ing] = (itemsMap[ing] || 0) + 1;
        });
      });
    });
    return Object.entries(itemsMap).map(([name, count]) => ({
      name,
      estQty: `${count * 150}g`,
      estCost: count * 15
    }));
  }, [weeklySchedule]);

  const totalWeeklyGroceryCost = useMemo(() => {
    return weeklyGroceryList.reduce((sum, item) => sum + item.estCost, 0);
  }, [weeklyGroceryList]);

  // Toggle Favorite Recipe
  const toggleFavorite = (id) => {
    const updated = favoriteRecipeIds.includes(id) 
      ? favoriteRecipeIds.filter(fId => fId !== id)
      : [...favoriteRecipeIds, id];
    setFavoriteRecipeIds(updated);
    localStorage.setItem('spectra_fav_recipes', JSON.stringify(updated));
  };

  // Toggle Consumed Meal
  const toggleConsumedMeal = (id) => {
    if (consumedMealIds.includes(id)) {
      setConsumedMealIds(consumedMealIds.filter(mId => mId !== id));
    } else {
      setConsumedMealIds([...consumedMealIds, id]);
    }
  };

  // Add Item to Pantry
  const handleAddPantryItem = (e) => {
    e.preventDefault();
    if (!newItemName) return;
    const item = {
      id: 'p-' + Date.now(),
      name: newItemName,
      qty: newItemQty,
      category: newItemCategory,
      expiry: newItemExpiry || new Date(Date.now() + 864000000).toISOString().split('T')[0]
    };
    const updated = [...pantryItems, item];
    setPantryItems(updated);
    localStorage.setItem('spectra_pantry_items', JSON.stringify(updated));
    setNewItemName('');
  };

  // Delete Pantry Item
  const handleDeletePantryItem = (id) => {
    const updated = pantryItems.filter(p => p.id !== id);
    setPantryItems(updated);
    localStorage.setItem('spectra_pantry_items', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-24 pt-safe relative overflow-x-hidden">
      
      {/* Background Gold Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#d4af37] opacity-10 rounded-full blur-[140px] pointer-events-none" />

      {/* --- TOP HEADER --- */}
      <div className="px-5 pt-4 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[#d4af37] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-[#d4af37] flex items-center gap-1.5">
                <Sparkles size={20} className="text-[#f5c842]" />
                Personal AI Dietitian
              </h1>
              <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-xs text-gray-400">Precision regional nutrition & disease-aware planning</p>
          </div>
        </div>

        <button 
          onClick={() => { setWizardStep(1); setIsEditingProfile(true); }}
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10"
        >
          <User size={14} />
          <span>Profile</span>
        </button>
      </div>

      {/* --- MODULE NAVIGATION TABS --- */}
      <div className="px-4 pt-3 pb-2 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
          { id: 'planner', label: '7-Day Plan', icon: Calendar },
          { id: 'pantry', label: 'Pantry & Expiry', icon: ShoppingCart },
          { id: 'leftovers', label: 'Leftover Magic', icon: Utensils },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'favorites', label: 'Saved Recipes', icon: Heart }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-[#0a0a0a] shadow-glow-gold scale-105'
                  : 'bg-[var(--bg-elevated)] text-gray-400 hover:text-white border border-[var(--border-color)]'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI DIETITIAN DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="p-4 space-y-5 animate-fade-in max-w-5xl mx-auto">

          {/* User Profile Health Card Banner */}
          <div className="card p-5 rounded-3xl border border-[#d4af37]/30 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#d4af37]/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Active Diet Profile</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-xs text-gray-400">{healthProfile.gender}, {healthProfile.age} yrs</span>
                </div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {profile?.name || 'Inspector Admin'}
                </h2>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1">
                    BMI: {calculatedBMI} ({bmiCategory.label})
                  </span>
                  {healthProfile.medicalConditions.map(cond => (
                    <span key={cond} className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1">
                      <Stethoscope size={12} />
                      {cond}
                    </span>
                  ))}
                  {healthProfile.regions.map(reg => (
                    <span key={reg} className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-1 rounded-xl">
                      🍲 {reg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Health Score Counter */}
              <div className="flex items-center gap-4 bg-[var(--bg-elevated)]/80 p-4 rounded-2xl border border-[var(--border-color)]">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#d4af37]" strokeDasharray="92, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-lg font-black text-[#d4af37]">92</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Nutrition Score</p>
                  <p className="text-sm font-bold text-emerald-400">Excellent Balance</p>
                  <p className="text-[10px] text-gray-500">🔥 5 Day Health Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Expiring Pantry Urgency Warning */}
          {expiringPantryItems.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 animate-slide-up">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-400">Pantry Expiry Advisory</h4>
                <p className="text-xs text-gray-300 mt-0.5">
                  You have <span className="font-bold text-white">{expiringPantryItems.length} items</span> ({expiringPantryItems.map(i=>i.name).join(', ')}) expiring within 48 hours.
                </p>
              </div>
              <button onClick={() => setActiveTab('pantry')} className="text-xs bg-amber-500 text-black font-bold px-3 py-1.5 rounded-xl hover:bg-amber-400">
                Cook Now
              </button>
            </div>
          )}

          {/* Macro Rings & Daily Trackers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Calorie Progress Card */}
            <div className="card p-5 rounded-3xl flex flex-col justify-between border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={16} className="text-amber-500" /> Today's Calories
                </span>
                <span className="text-xs font-bold text-[#d4af37]">
                  {targets.targetCalories - consumedNutrients.cal} kcal remaining
                </span>
              </div>
              <div className="flex items-center justify-around my-2">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{consumedNutrients.cal}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Consumed</p>
                </div>
                <div className="text-2xl font-light text-gray-600">/</div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">{targets.targetCalories}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Target</p>
                </div>
              </div>
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-[#d4af37] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (consumedNutrients.cal / targets.targetCalories) * 100)}%` }}
                />
              </div>
            </div>

            {/* Protein & Macronutrients Card */}
            <div className="card p-5 rounded-3xl flex flex-col justify-between border border-[var(--border-color)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={16} className="text-emerald-400" /> Protein Progress
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {consumedNutrients.pro}g / {targets.targetProtein}g
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Protein</span>
                    <span className="font-bold text-white">{consumedNutrients.pro}g</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (consumedNutrients.pro / targets.targetProtein) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Carbs</span>
                    <span className="font-bold text-white">{consumedNutrients.carb}g / {targets.targetCarbs}g</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (consumedNutrients.carb / targets.targetCarbs) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Fiber</span>
                    <span className="font-bold text-white">{consumedNutrients.fib}g / {targets.targetFiber}g</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (consumedNutrients.fib / targets.targetFiber) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Water Tracker Card */}
            <div className="card p-5 rounded-3xl flex flex-col justify-between border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplet size={16} className="text-cyan-400" /> Hydration Tracker
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  {(waterCups * 0.25).toFixed(1)} L / {healthProfile.waterGoalLiters} L
                </span>
              </div>

              <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <button 
                  onClick={() => setWaterCups(Math.max(0, waterCups - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  -
                </button>
                <div className="text-center">
                  <p className="text-2xl font-black text-cyan-400">{waterCups} <span className="text-xs text-gray-400 font-normal">cups</span></p>
                  <p className="text-[10px] text-gray-500">250ml per cup</p>
                </div>
                <button 
                  onClick={() => setWaterCups(waterCups + 1)}
                  className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-lg hover:bg-cyan-500/30 flex items-center justify-center border border-cyan-500/40"
                >
                  +
                </button>
              </div>

              <p className="text-[11px] text-gray-400 mt-2 text-center">
                💧 Drink 2 more cups before 6:00 PM to hit today's hydration goal.
              </p>
            </div>

          </div>

          {/* Today's Personalized Meal Plan Timeline */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Utensils size={18} className="text-[#d4af37]" />
                  Today's Personalized Meal Schedule
                </h3>
                <p className="text-xs text-gray-400">Tailored to {healthProfile.medicalConditions.join(', ')} & {healthProfile.regions.join(', ')} Cuisine</p>
              </div>
              <button 
                onClick={() => setActiveTab('planner')} 
                className="text-xs text-[#d4af37] font-bold hover:underline flex items-center gap-1"
              >
                Full 7-Day Plan <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {todayMeals.map(({ slot, time, recipe }) => {
                const isConsumed = consumedMealIds.includes(recipe.id);
                const isFav = favoriteRecipeIds.includes(recipe.id);

                return (
                  <div 
                    key={slot}
                    className={`card p-4 rounded-2xl border transition-all duration-300 ${
                      isConsumed 
                        ? 'border-emerald-500/40 bg-emerald-500/5' 
                        : 'border-[var(--border-color)] hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Image & Meal Details */}
                      <div className="flex items-start gap-4">
                        <img 
                          src={recipe.image} 
                          alt={recipe.name} 
                          className="w-20 h-20 rounded-2xl object-cover border border-[var(--border-color)] shrink-0" 
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[var(--bg-elevated)] text-[#d4af37] border border-[#d4af37]/30">
                              {slot} • {time}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400">
                              ⏱️ {recipe.prepTime} mins
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white hover:text-[#d4af37] cursor-pointer" onClick={() => setSelectedRecipeModal(recipe)}>
                            {recipe.name}
                          </h4>

                          {/* Disease Advice Callout Tag */}
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 w-fit">
                            <ShieldCheck size={14} className="shrink-0" />
                            <span className="text-[11px] font-medium">{recipe.medicalAdvice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Macros & Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--border-color)]">
                        <div className="text-right text-xs space-y-0.5">
                          <p className="font-black text-white text-sm">{recipe.macros.calories} <span className="text-[10px] text-gray-400 font-normal">kcal</span></p>
                          <p className="text-gray-400 text-[11px]">Protein: <span className="font-bold text-emerald-400">{recipe.macros.protein}g</span></p>
                          <p className="text-gray-500 text-[10px]">Est. ₹{recipe.cost}/serv</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleFavorite(recipe.id)}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              isFav ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)]'
                            }`}
                          >
                            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                          </button>

                          <button 
                            onClick={() => toggleConsumedMeal(recipe.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isConsumed 
                                ? 'bg-emerald-500 text-black shadow-glow-green' 
                                : 'btn-primary py-2.5'
                            }`}
                          >
                            {isConsumed ? <><Check size={14} /> Eaten</> : 'Mark Eaten'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 7-DAY WEEKLY MEAL PLANNER & GROCERY SHOPPING LIST */}
      {/* ========================================================================= */}
      {activeTab === 'planner' && (
        <div className="p-4 space-y-6 animate-fade-in max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="text-[#d4af37]" size={22} />
                7-Day Personalized Weekly Meal Plan
              </h2>
              <p className="text-xs text-gray-400">Customized for {healthProfile.goals.join(', ')} & {healthProfile.dietPreference} Diet</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert("Grocery list copied to clipboard!")}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <ShoppingCart size={14} /> Copy Shopping List
              </button>
            </div>
          </div>

          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setSelectedPlannerDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedPlannerDay === day 
                    ? 'bg-[#d4af37] text-black font-black shadow-glow-gold'
                    : 'bg-[var(--bg-card)] text-gray-400 border border-[var(--border-color)] hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meals for Selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(weeklySchedule[selectedPlannerDay] || {}).map(([slot, recipe]) => (
              <div key={slot} className="card p-4 rounded-2xl border border-[var(--border-color)] hover:border-[#d4af37]/40 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[#d4af37] border border-[#d4af37]/30">
                      {slot}
                    </span>
                    <h4 className="text-base font-bold text-white hover:text-[#d4af37] cursor-pointer" onClick={() => setSelectedRecipeModal(recipe)}>
                      {recipe.name}
                    </h4>
                    <p className="text-xs text-gray-400">{recipe.cuisine} • {recipe.dietaryType}</p>
                  </div>
                  <img src={recipe.image} alt={recipe.name} className="w-16 h-16 rounded-xl object-cover border border-[var(--border-color)] shrink-0" />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span>🔥 {recipe.macros.calories} kcal</span>
                    <span>💪 {recipe.macros.protein}g protein</span>
                  </div>
                  <button onClick={() => setSelectedRecipeModal(recipe)} className="text-[#d4af37] font-semibold hover:underline">
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Consolidated Weekly Grocery Shopping List */}
          <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShoppingCart className="text-[#d4af37]" size={20} />
                  Weekly Grocery Shopping List
                </h3>
                <p className="text-xs text-gray-400">Consolidated ingredients for all 7 days</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl">
                Est. Total: ₹{totalWeeklyGroceryCost}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {weeklyGroceryList.slice(0, 12).map((item, idx) => (
                <div key={idx} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-200">🛒 {item.name}</span>
                  <span className="text-gray-400 text-[11px]">~{item.estQty} (₹{item.estCost})</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI PANTRY INTEGRATION & EXPIRY TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'pantry' && (
        <div className="p-4 space-y-5 animate-fade-in max-w-5xl mx-auto">
          
          {/* Add Pantry Item Form */}
          <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="text-[#d4af37]" size={20} />
              Add Ingredient to Pantry
            </h3>

            <form onSubmit={handleAddPantryItem} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input 
                type="text" 
                placeholder="Item name (e.g. Tomatoes)" 
                value={newItemName}
                onChange={e=>setNewItemName(e.target.value)}
                required
                className="bg-[var(--bg-input)] border border-[var(--border-color)] text-white text-xs rounded-xl p-3 outline-none focus:border-[#d4af37]"
              />
              <input 
                type="text" 
                placeholder="Quantity (e.g. 500g)" 
                value={newItemQty}
                onChange={e=>setNewItemQty(e.target.value)}
                className="bg-[var(--bg-input)] border border-[var(--border-color)] text-white text-xs rounded-xl p-3 outline-none focus:border-[#d4af37]"
              />
              <input 
                type="date" 
                value={newItemExpiry}
                onChange={e=>setNewItemExpiry(e.target.value)}
                className="bg-[var(--bg-input)] border border-[var(--border-color)] text-white text-xs rounded-xl p-3 outline-none focus:border-[#d4af37]"
              />
              <button type="submit" className="btn-primary py-3 text-xs">
                Add to Pantry
              </button>
            </form>
          </div>

          {/* Current Pantry Items Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingCart size={18} className="text-[#d4af37]" />
              Your Active Pantry Inventory ({pantryItems.length} Items)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pantryItems.map(item => {
                const isExpiring = expiringPantryItems.some(e => e.id === item.id);
                return (
                  <div 
                    key={item.id}
                    className={`card p-4 rounded-2xl border flex items-center justify-between ${
                      isExpiring 
                        ? 'border-amber-500/50 bg-amber-500/10' 
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-gray-400">Qty: {item.qty} • {item.category}</p>
                      {item.expiry && (
                        <p className={`text-[10px] mt-1 font-semibold ${isExpiring ? 'text-amber-400' : 'text-gray-500'}`}>
                          {isExpiring ? '⚠️ Expires within 48h!' : `Expires: ${item.expiry}`}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeletePantryItem(item.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ZERO-WASTE LEFTOVER RECIPE INTELLIGENCE */}
      {/* ========================================================================= */}
      {activeTab === 'leftovers' && (
        <div className="p-4 space-y-5 animate-fade-in max-w-5xl mx-auto">
          
          <div className="card p-5 rounded-3xl border border-[#d4af37]/30 space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Utensils className="text-[#d4af37]" size={22} />
                Zero-Waste Leftover Recipe AI
              </h2>
              <p className="text-xs text-gray-400">Select what leftover food you have in your kitchen to generate delicious, healthy recipes.</p>
            </div>

            {/* Leftover Selector Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["Leftover Dal", "Leftover Rice", "Old Bread", "Cooked Vegetables", "Boiled Potatoes"].map(item => {
                const isSelected = selectedLeftovers.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => {
                      if (isSelected) setSelectedLeftovers(selectedLeftovers.filter(i => i !== item));
                      else setSelectedLeftovers([...selectedLeftovers, item]);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected 
                        ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-glow-gold' 
                        : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)] hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Leftover Recipes */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Recommended Zero-Waste Recipes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEFTOVER_RECIPES.filter(r => selectedLeftovers.includes(r.leftoverKey)).map(rec => (
                <div key={rec.id} className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Zero Waste • {rec.prepTime} mins
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{rec.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-[#d4af37]">🔥 {rec.calories} kcal</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    <span className="font-bold text-gray-300">Uses:</span> {rec.ingredientsUsed.join(', ')}
                  </div>

                  <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-gray-300">Quick Instructions:</p>
                    <ol className="list-decimal pl-4 text-gray-400 space-y-1">
                      {rec.instructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NUTRITION ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="p-4 space-y-5 animate-fade-in max-w-5xl mx-auto">
          
          <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BarChart2 className="text-[#d4af37]" size={22} />
              Weekly Nutrition & Micronutrient Trends
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-center">
                <p className="text-xs text-gray-400">Avg. Protein / Day</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">68g</p>
                <p className="text-[10px] text-emerald-500 font-semibold">⬆ +12% from last week</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-center">
                <p className="text-xs text-gray-400">Avg. Daily Iron</p>
                <p className="text-2xl font-black text-amber-400 mt-1">4.8 mg</p>
                <p className="text-[10px] text-gray-500 font-semibold">Target: 4.5 mg</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-center">
                <p className="text-xs text-gray-400">Avg. Daily Calcium</p>
                <p className="text-2xl font-black text-cyan-400 mt-1">380 mg</p>
                <p className="text-[10px] text-cyan-500 font-semibold">Target Met</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-center">
                <p className="text-xs text-gray-400">Sodium Control</p>
                <p className="text-2xl font-black text-purple-400 mt-1">390 mg</p>
                <p className="text-[10px] text-purple-400 font-semibold">Low Sodium Safe</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SAVED FAVORITE RECIPES */}
      {/* ========================================================================= */}
      {activeTab === 'favorites' && (
        <div className="p-4 space-y-4 animate-fade-in max-w-5xl mx-auto">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Heart className="text-red-400" size={22} />
            Saved Favorite Recipes ({favoriteRecipeIds.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INDIAN_RECIPES_DATABASE.filter(r => favoriteRecipeIds.includes(r.id)).map(recipe => (
              <div key={recipe.id} className="card p-4 rounded-2xl border border-[var(--border-color)] flex items-start gap-4">
                <img src={recipe.image} alt={recipe.name} className="w-20 h-20 rounded-2xl object-cover border border-[var(--border-color)] shrink-0" />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-white">{recipe.name}</h4>
                  <p className="text-xs text-gray-400">{recipe.cuisine} • {recipe.macros.calories} kcal</p>
                  <button onClick={() => setSelectedRecipeModal(recipe)} className="text-xs text-[#d4af37] font-semibold hover:underline pt-1 block">
                    View Recipe & Instructions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ONBOARDING WIZARD MODAL */}
      {/* ========================================================================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-xl w-full space-y-5 animate-scale-up my-auto">
            
            {/* Wizard Header */}
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Step {wizardStep} of 5</span>
                <h3 className="text-lg font-black text-white">Setup Your AI Dietitian Profile</h3>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Personal Info */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-300">1. Personal Information & Biometrics</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Age (Years)</label>
                    <input 
                      type="number" 
                      value={healthProfile.age} 
                      onChange={e=>setHealthProfile({...healthProfile, age: parseInt(e.target.value)||25})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Gender</label>
                    <select 
                      value={healthProfile.gender}
                      onChange={e=>setHealthProfile({...healthProfile, gender: e.target.value})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-white outline-none"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      value={healthProfile.height} 
                      onChange={e=>setHealthProfile({...healthProfile, height: parseInt(e.target.value)||170})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={healthProfile.weight} 
                      onChange={e=>setHealthProfile({...healthProfile, weight: parseInt(e.target.value)||65})}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Calculated Body Mass Index (BMI):</span>
                  <span className="font-bold text-[#d4af37] text-sm">{calculatedBMI} ({bmiCategory.label})</span>
                </div>

                <button onClick={() => setWizardStep(2)} className="btn-primary w-full py-3 text-xs mt-2">
                  Next: Health Goals →
                </button>
              </div>
            )}

            {/* Step 2: Health Goals */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-300">2. Select Your Health Goals (Multi-select)</h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {HEALTH_GOALS_LIST.map(goal => {
                    const selected = healthProfile.goals.includes(goal);
                    return (
                      <button
                        key={goal}
                        onClick={() => {
                          const updated = selected 
                            ? healthProfile.goals.filter(g => g !== goal)
                            : [...healthProfile.goals, goal];
                          setHealthProfile({...healthProfile, goals: updated});
                        }}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          selected 
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' 
                            : 'bg-[var(--bg-input)] border-[var(--border-color)] text-gray-400'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '} {goal}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setWizardStep(1)} className="btn-secondary flex-1 py-3 text-xs">Back</button>
                  <button onClick={() => setWizardStep(3)} className="btn-primary flex-1 py-3 text-xs">Next: Cuisines →</button>
                </div>
              </div>
            )}

            {/* Step 3: Regional Cuisines & Diet */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-300">3. Regional Cuisines & Dietary Preferences</h4>

                <div>
                  <label className="text-xs text-gray-400 block mb-2">Preferred Indian Regional Cuisines</label>
                  <div className="grid grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto">
                    {REGIONS_LIST.map(reg => {
                      const selected = healthProfile.regions.includes(reg);
                      return (
                        <button
                          key={reg}
                          onClick={() => {
                            const updated = selected 
                              ? healthProfile.regions.filter(r => r !== reg)
                              : [...healthProfile.regions, reg];
                            setHealthProfile({...healthProfile, regions: updated});
                          }}
                          className={`p-2 rounded-xl border text-center font-semibold text-[11px] ${
                            selected ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-gray-400'
                          }`}
                        >
                          {reg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button onClick={() => setWizardStep(2)} className="btn-secondary w-full py-2.5 text-xs">Back</button>
                <button onClick={() => setWizardStep(4)} className="btn-primary w-full py-3 text-xs">Next: Medical & Allergies →</button>
              </div>
            )}

            {/* Step 4: Medical Conditions */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-300">4. Medical Conditions & Allergies</h4>

                <div className="grid grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto">
                  {MEDICAL_CONDITIONS.map(cond => {
                    const selected = healthProfile.medicalConditions.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        onClick={() => {
                          const updated = selected 
                            ? healthProfile.medicalConditions.filter(c => c !== cond.id)
                            : [...healthProfile.medicalConditions, cond.id];
                          setHealthProfile({...healthProfile, medicalConditions: updated});
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                          selected ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-gray-400'
                        }`}
                      >
                        <span>{cond.icon}</span>
                        <span className="font-semibold text-[11px]">{cond.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 text-[10px] text-amber-300">
                  ⚠️ Disclaimer: Recommendations are educational and not a substitute for professional medical advice.
                </div>

                <button onClick={() => setWizardStep(3)} className="btn-secondary w-full py-2.5 text-xs">Back</button>
                <button onClick={() => setWizardStep(5)} className="btn-primary w-full py-3 text-xs">Next: Finish Profile →</button>
              </div>
            )}

            {/* Step 5: Finish */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-fade-in text-center">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                <h4 className="text-lg font-black text-white">Your Personal AI Dietitian is Ready!</h4>
                <p className="text-xs text-gray-400">We have configured your disease-aware nutrition engine based on your inputs.</p>
                <button onClick={() => saveHealthProfile(healthProfile)} className="btn-primary w-full py-3 text-xs">
                  Save & Launch AI Dietitian Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECIPE DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedRecipeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] max-w-xl w-full space-y-4 my-auto">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-md border border-[#d4af37]/40">
                  {selectedRecipeModal.cuisine} Cuisine • {selectedRecipeModal.mealType}
                </span>
                <h3 className="text-xl font-black text-white mt-1">{selectedRecipeModal.name}</h3>
              </div>
              <button onClick={() => setSelectedRecipeModal(null)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <img src={selectedRecipeModal.image} alt={selectedRecipeModal.name} className="w-full h-48 rounded-2xl object-cover border border-[var(--border-color)]" />

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-xs text-emerald-400">
              💡 <span className="font-bold">Medical Advice:</span> {selectedRecipeModal.medicalAdvice}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
              <div><p className="text-gray-400">Calories</p><p className="font-bold text-white">{selectedRecipeModal.macros.calories} kcal</p></div>
              <div><p className="text-gray-400">Protein</p><p className="font-bold text-emerald-400">{selectedRecipeModal.macros.protein}g</p></div>
              <div><p className="text-gray-400">Carbs</p><p className="font-bold text-blue-400">{selectedRecipeModal.macros.carbs}g</p></div>
              <div><p className="text-gray-400">Fiber</p><p className="font-bold text-purple-400">{selectedRecipeModal.macros.fiber}g</p></div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-1">Ingredients:</h4>
              <ul className="list-disc pl-5 text-xs text-gray-400 space-y-0.5">
                {selectedRecipeModal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-1">Step-by-Step Instructions:</h4>
              <ol className="list-decimal pl-5 text-xs text-gray-400 space-y-1">
                {selectedRecipeModal.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>

            <button onClick={() => setSelectedRecipeModal(null)} className="btn-primary w-full py-2.5 text-xs">
              Close Recipe
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
