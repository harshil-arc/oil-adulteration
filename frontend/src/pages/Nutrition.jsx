import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Trash2, Calendar, Award, Star, Share2, 
  BookOpen, Sparkles, Heart, Apple, ShoppingCart, User, AlertCircle, 
  ChevronRight, RefreshCw, BarChart2, Check, Clock, Play
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Active Tab View: dashboard, pantry, recipe, planner, leftover
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Health Profile Setup States
  const [hasProfile, setHasProfile] = useState(false);
  const [healthProfile, setHealthProfile] = useState({
    age: 28,
    gender: 'Male',
    height: 175,
    weight: 70,
    activityLevel: 'Moderate',
    goal: 'Maintenance',
    region: 'North India',
    religion: 'None',
    preference: 'Vegetarian',
    allergies: 'None',
    conditions: 'None',
    budget: 350,
    skill: 'Intermediate',
    timeAvailable: 30
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Pantry States
  const [pantryItems, setPantryItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1 kg');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetables');

  // Recipes state
  const [selectedPantryForRecipe, setSelectedPantryForRecipe] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);

  // Leftovers State
  const [selectedLeftover, setSelectedLeftover] = useState([]);
  const [leftoverRecipe, setLeftoverRecipe] = useState(null);
  const [isGeneratingLeftover, setIsGeneratingLeftover] = useState(false);

  // Meal Planner State
  const [selectedDay, setSelectedDay] = useState('Today'); // Today, Tomorrow, Week
  const [weeklyMealPlan, setWeeklyMealPlan] = useState(null);

  // Notifications List
  const [notifications, setNotifications] = useState([
    { id: 'not-1', text: "Your tomatoes expire tomorrow.", type: "warning" },
    { id: 'not-2', text: "You have leftover rice. Try leftover stir-fry rice recipes!", type: "info" }
  ]);

  // Load from local storage fallback
  useEffect(() => {
    // Health Profile
    const savedProfile = localStorage.getItem('spectra_health_profile');
    if (savedProfile) {
      setHealthProfile(JSON.parse(savedProfile));
      setHasProfile(true);
    }

    // Pantry Items
    const savedPantry = localStorage.getItem('spectra_pantry_items');
    if (savedPantry) {
      setPantryItems(JSON.parse(savedPantry));
    } else {
      const seedPantry = [
        { id: 'p-1', name: 'Rice', qty: '2 kg', category: 'Grains', expiry: '2026-09-12' },
        { id: 'p-2', name: 'Tomato', qty: '500g', category: 'Vegetables', expiry: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
        { id: 'p-3', name: 'Milk', qty: '1 L', category: 'Dairy', expiry: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
        { id: 'p-4', name: 'Paneer', qty: '200g', category: 'Dairy', expiry: new Date(Date.now() + 172800000).toISOString().split('T')[0] }
      ];
      setPantryItems(seedPantry);
      localStorage.setItem('spectra_pantry_items', JSON.stringify(seedPantry));
    }

    // Saved Recipes
    const savedRecs = localStorage.getItem('spectra_saved_recipes');
    if (savedRecs) {
      setSavedRecipes(JSON.parse(savedRecs));
    }

    generateMealPlan();
  }, []);

  // Save profile to local & supabase
  const saveHealthProfile = async (e) => {
    e.preventDefault();
    try {
      const record = {
        user_id: profile?.id,
        ...healthProfile,
        updated_at: new Date().toISOString()
      };
      await supabase.from('user_health_profile').insert([record]);
    } catch {
      // Local fallback
    }
    localStorage.setItem('spectra_health_profile', JSON.stringify(healthProfile));
    setHasProfile(true);
    setIsEditingProfile(false);
  };

  // Pantry actions
  const handleAddPantryItem = () => {
    if (!newItemName) return;
    const item = {
      id: 'p-' + Math.floor(Math.random() * 9999),
      name: newItemName,
      qty: newItemQty,
      expiry: newItemExpiry || new Date(Date.now() + 432000000).toISOString().split('T')[0],
      category: newItemCategory
    };
    const updated = [item, ...pantryItems];
    setPantryItems(updated);
    localStorage.setItem('spectra_pantry_items', JSON.stringify(updated));
    setNewItemName('');
  };

  const handleDeletePantryItem = (id) => {
    const updated = pantryItems.filter(i => i.id !== id);
    setPantryItems(updated);
    localStorage.setItem('spectra_pantry_items', JSON.stringify(updated));
  };

  // Pantry summary computations
  const pantrySummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nearExpiryDate = new Date(Date.now() + 172800000).toISOString().split('T')[0]; // 2 days

    const expired = pantryItems.filter(i => i.expiry < todayStr);
    const nearExpiry = pantryItems.filter(i => i.expiry >= todayStr && i.expiry <= nearExpiryDate);
    const safe = pantryItems.filter(i => i.expiry > nearExpiryDate);

    return { expired, nearExpiry, safe };
  }, [pantryItems]);

  // AI Recipe Generator
  const handleGenerateRecipes = () => {
    if (selectedPantryForRecipe.length === 0) return alert('Select ingredients from pantry to generate recipes.');
    setIsGeneratingRecipe(true);

    setTimeout(() => {
      const mockRecipes = [
        {
          id: 'rec-1',
          name: 'Healthy Paneer Stir-Fry',
          ingredients: [...selectedPantryForRecipe, 'Spices', 'Bell Pepper'],
          steps: [
            'Dice the paneer and tomatoes into cubes.',
            'Heat 1 tbsp olive oil in a non-stick pan.',
            'Add spices and vegetables; stir fry for 3 minutes.',
            'Add paneer cubes and toss gently until lightly browned.'
          ],
          calories: 320,
          protein: 18,
          carbs: 12,
          fat: 22,
          fiber: 4,
          difficulty: 'Easy',
          cookTime: 15,
          servings: 2,
          nutritionScore: 92
        },
        {
          id: 'rec-2',
          name: 'Tomato Herb Rice Bowl',
          ingredients: [...selectedPantryForRecipe, 'Garlic', 'Herbs'],
          steps: [
            'Wash and rinse the rice thrice.',
            'Boil tomatoes to make a smooth puree.',
            'Cook the rice in paneer whey or water with chopped garlic.',
            'Stir in tomato puree and top with herbs.'
          ],
          calories: 410,
          protein: 8,
          carbs: 72,
          fat: 6,
          fiber: 5,
          difficulty: 'Medium',
          cookTime: 25,
          servings: 3,
          nutritionScore: 84
        }
      ];
      setGeneratedRecipes(mockRecipes);
      setIsGeneratingRecipe(false);
    }, 1500);
  };

  // Favorite Recipe
  const handleSaveRecipe = (recipe) => {
    const updated = [recipe, ...savedRecipes];
    setSavedRecipes(updated);
    localStorage.setItem('spectra_saved_recipes', JSON.stringify(updated));
    alert('Recipe saved to your favorites successfully!');
  };

  // Leftovers Generator
  const handleGenerateLeftovers = () => {
    if (selectedLeftover.length === 0) return alert('Select leftover food items.');
    setIsGeneratingLeftover(true);

    setTimeout(() => {
      setLeftoverRecipe({
        name: 'Crispy Rice & Lentil Cutlets',
        desc: 'Turn yesterday\'s rice and lentils into high-protein crispy cutlets.',
        additional: ['1 tbsp Flour', 'Spices', 'Bread crumbs'],
        cookTime: 12,
        difficulty: 'Easy',
        calories: 220,
        protein: 9,
        steps: [
          'Mash leftover rice and lentils together in a bowl.',
          'Add spices, flour, and mix into small patties.',
          'Coat with bread crumbs and air-fry or shallow fry with minimal oil.'
        ]
      });
      setIsGeneratingLeftover(false);
    }, 1200);
  };

  // Weekly Meal Planner Generator
  const generateMealPlan = () => {
    const plan = {
      Today: {
        breakfast: { name: 'Poha with Sprouts', cal: 280, p: 12, c: 45, f: 6 },
        lunch: { name: 'Paneer Bhurji & Multigrain Roti', cal: 480, p: 26, c: 48, f: 18 },
        dinner: { name: 'Dal Tadka & Tomato Rice', cal: 390, p: 15, c: 68, f: 8 },
        snack: { name: 'Mixed Nuts & Green Tea', cal: 150, p: 5, c: 10, f: 12 }
      },
      Tomorrow: {
        breakfast: { name: 'Vegetable Oats Upma', cal: 260, p: 9, c: 42, f: 5 },
        lunch: { name: 'Chickpea Salad Bowl', cal: 420, p: 18, c: 54, f: 12 },
        dinner: { name: 'Spinach Paneer Curry', cal: 460, p: 24, c: 32, f: 20 },
        snack: { name: 'Roasted Makhana', cal: 110, p: 3, c: 22, f: 1 }
      }
    };
    setWeeklyMealPlan(plan);
  };

  // Meal plan nutrition totals
  const activeMealPlan = useMemo(() => {
    if (!weeklyMealPlan) return null;
    const dayData = selectedDay === 'Tomorrow' ? weeklyMealPlan.Tomorrow : weeklyMealPlan.Today;
    
    // Sum stats
    const calories = dayData.breakfast.cal + dayData.lunch.cal + dayData.dinner.cal + dayData.snack.cal;
    const protein = dayData.breakfast.p + dayData.lunch.p + dayData.dinner.p + dayData.snack.p;
    const carbs = dayData.breakfast.c + dayData.lunch.c + dayData.dinner.c + dayData.snack.c;
    const fat = dayData.breakfast.f + dayData.lunch.f + dayData.dinner.f + dayData.snack.f;

    return {
      meals: dayData,
      totals: { calories, protein, carbs, fat, fiber: 28, water: '2.5 L' },
      score: 88
    };
  }, [weeklyMealPlan, selectedDay]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-16">
      
      {/* --- HEADER --- */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight theme-text flex items-center gap-2">
              <span>AI Nutrition</span>
              <span className="text-[8px] font-black tracking-widest bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full">PLANNER</span>
            </h1>
            <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-0.5">Healthy Meals & Smart Pantry</p>
          </div>
        </div>

        <button 
          onClick={() => { setIsEditingProfile(true); setActiveTab('dashboard'); }}
          className="p-2 text-xs font-bold text-brand-500 flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl"
        >
          <User size={14} /> Profile
        </button>
      </div>

      {/* --- BOTTOM / TOP NAVIGATION BAR --- */}
      <div className="px-5 py-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex gap-2 overflow-x-auto custom-scrollbar sticky top-[69px] z-20">
        {[
          { id: 'dashboard', label: 'Dashboard', Icon: BarChart2 },
          { id: 'pantry', label: 'My Pantry', Icon: ShoppingCart },
          { id: 'recipe', label: 'AI Recipes', Icon: Sparkles },
          { id: 'planner', label: 'Meal Planner', Icon: Calendar },
          { id: 'leftover', label: 'Leftover Saver', Icon: Apple }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-green-500 text-black border-green-500 font-extrabold' 
                : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:theme-text'
            }`}
          >
            <tab.Icon size={12} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="px-5 pt-6 flex flex-col gap-6">

        {/* ============================================================
           WIZARD: EDIT/CREATE HEALTH PROFILE
           ============================================================ */}
        {(!hasProfile || isEditingProfile) && (
          <div className="card p-5 border border-[var(--border-color)] animate-fade-in z-50 relative">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3 mb-4">
              <h2 className="text-sm font-black theme-text uppercase tracking-widest">Health Setup Wizard</h2>
              {hasProfile && (
                <button onClick={() => setIsEditingProfile(false)} className="p-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  <XCircle size={16} />
                </button>
              )}
            </div>

            <form onSubmit={saveHealthProfile} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Age</label>
                  <input type="number" required value={healthProfile.age} onChange={e=>setHealthProfile({...healthProfile, age: parseInt(e.target.value)})} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Gender</label>
                  <select value={healthProfile.gender} onChange={e=>setHealthProfile({...healthProfile, gender: e.target.value})} className="field-input">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Height (cm)</label>
                  <input type="number" required value={healthProfile.height} onChange={e=>setHealthProfile({...healthProfile, height: parseInt(e.target.value)})} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Weight (kg)</label>
                  <input type="number" required value={healthProfile.weight} onChange={e=>setHealthProfile({...healthProfile, weight: parseInt(e.target.value)})} className="field-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Goal</label>
                  <select value={healthProfile.goal} onChange={e=>setHealthProfile({...healthProfile, goal: e.target.value})} className="field-input">
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Muscle Building">Muscle Building</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Dietary Preference</label>
                  <select value={healthProfile.preference} onChange={e=>setHealthProfile({...healthProfile, preference: e.target.value})} className="field-input">
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Medical Condition</label>
                  <select value={healthProfile.conditions} onChange={e=>setHealthProfile({...healthProfile, conditions: e.target.value})} className="field-input">
                    <option value="None">None</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="PCOS">PCOS</option>
                    <option value="High Cholesterol">High Cholesterol</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Daily Food Budget (INR)</label>
                  <input type="number" value={healthProfile.budget} onChange={e=>setHealthProfile({...healthProfile, budget: parseInt(e.target.value)})} className="field-input" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-green-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg mt-3">
                Save Health Profile Setup
              </button>
            </form>
          </div>
        )}

        {/* ============================================================
           TAB: NUTRITION DASHBOARD
           ============================================================ */}
        {hasProfile && !isEditingProfile && activeTab === 'dashboard' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            {/* Dashboard Score Header */}
            <div className="card p-5 border border-green-500/20 bg-green-500/[0.01] flex items-center justify-between">
              <div>
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider block mb-1">Nutrition Grade Score</span>
                <h3 className="text-3xl font-black text-green-500 font-mono">84<span className="text-sm font-normal text-[var(--text-secondary)]">/100</span></h3>
                <span className="text-[8px] text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase mt-2 inline-block">Very Good</span>
              </div>
              <Apple size={36} className="text-green-500/35" />
            </div>

            {/* Smart Alerts list */}
            {notifications.length > 0 && (
              <div className="flex flex-col gap-2">
                {notifications.map(n => (
                  <div key={n.id} className="card p-3 border border-amber-500/20 bg-amber-500/[0.01] flex items-center gap-3">
                    <AlertCircle size={14} className="text-amber-500" />
                    <p className="text-[11px] font-semibold text-[var(--text-secondary)] leading-tight">{n.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Nutrition metrics grid */}
            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="card p-4 border border-[var(--border-color)] flex flex-col justify-between h-24">
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Calories Consumed</span>
                <p className="text-xl font-black theme-text font-mono">1480 <span className="text-[10px] text-gray-500 font-normal">kcal</span></p>
                <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[70%]" />
                </div>
              </div>

              <div className="card p-4 border border-[var(--border-color)] flex flex-col justify-between h-24">
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Water Intake</span>
                <p className="text-xl font-black text-blue-500 font-mono">2.2 <span className="text-[10px] text-gray-500 font-normal">L</span></p>
                <div className="w-full bg-[var(--bg-elevated)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[65%]" />
                </div>
              </div>

              <div className="card p-4 border border-[var(--border-color)] flex flex-col justify-between h-24">
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Food Waste Prevented</span>
                <p className="text-xl font-black text-green-500 font-mono">1.8 <span className="text-[10px] text-gray-500 font-normal">kg</span></p>
                <span className="text-[6px] text-green-500 font-bold uppercase tracking-wider">Eco impact saved</span>
              </div>

              <div className="card p-4 border border-[var(--border-color)] flex flex-col justify-between h-24">
                <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">Money Saved</span>
                <p className="text-xl font-black text-brand-500 font-mono">₹450</p>
                <span className="text-[6px] text-brand-500 font-bold uppercase tracking-wider">From leftovers</span>
              </div>

            </div>

            {/* Disease awareness box */}
            {healthProfile.conditions !== 'None' && (
              <div className="card p-5 border border-red-500/20 bg-red-500/[0.005]">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest border-b border-red-500/10 pb-2 mb-3">Disease Specific Guidance</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Your meal planner matches protocols for <strong>{healthProfile.conditions}</strong>. Sodium intake is regulated below 1500mg, and fiber index is boosted.
                </p>
                <span className="text-[7px] text-[var(--text-muted)] italic font-bold uppercase block mt-3.5">
                  Disclaimer: This module provides educational dietary guidance and is not a substitute for professional medical advice.
                </span>
              </div>
            )}

          </div>
        )}

        {/* ============================================================
           TAB: SMART PANTRY
           ============================================================ */}
        {activeTab === 'pantry' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            {/* Add Pantry Item Card */}
            <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-4">
              <h3 className="text-[10px] font-black theme-text uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-2">Add Pantry Ingredient</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Ingredient Name</label>
                  <input type="text" placeholder="e.g. Onion" value={newItemName} onChange={e=>setNewItemName(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Quantity</label>
                  <input type="text" placeholder="e.g. 1 kg" value={newItemQty} onChange={e=>setNewItemQty(e.target.value)} className="field-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Expiry Date</label>
                  <input type="date" value={newItemExpiry} onChange={e=>setNewItemExpiry(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select value={newItemCategory} onChange={e=>setNewItemCategory(e.target.value)} className="field-input">
                    <option value="Vegetables">Vegetables</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meats">Meats</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleAddPantryItem}
                className="w-full py-3.5 bg-green-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Plus size={12} /> Add to Pantry
              </button>
            </div>

            {/* Smart Pantry dashboard alerts */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-semibold">
              <div className="card p-3 border border-red-500/10">
                <p className="text-[7px] text-red-500 font-black uppercase">Expired Items</p>
                <h4 className="text-base font-black text-red-500 mt-1">{pantrySummary.expired.length}</h4>
              </div>
              <div className="card p-3 border border-amber-500/10">
                <p className="text-[7px] text-amber-500 font-black uppercase">Near Expiry</p>
                <h4 className="text-base font-black text-amber-500 mt-1">{pantrySummary.nearExpiry.length}</h4>
              </div>
              <div className="card p-3 border border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase">Available</p>
                <h4 className="text-base font-black theme-text mt-1">{pantryItems.length}</h4>
              </div>
            </div>

            {/* Pantry List */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1 pl-1">Pantry items list</span>
              {pantryItems.map(item => (
                <div key={item.id} className="card p-3.5 flex items-center justify-between border border-[var(--border-color)] rounded-2xl">
                  <div>
                    <h4 className="font-bold text-xs theme-text">{item.name}</h4>
                    <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">
                      Qty: {item.qty} • Expiry: {item.expiry}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeletePantryItem(item.id)}
                    className="p-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================
           TAB: AI RECIPE GENERATOR
           ============================================================ */}
        {activeTab === 'recipe' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            <div className="card p-5 border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-4">Select Pantry Items</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {pantryItems.map(item => {
                  const isSel = selectedPantryForRecipe.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isSel) setSelectedPantryForRecipe(prev => prev.filter(n => n !== item.name));
                        else setSelectedPantryForRecipe(prev => [...prev, item.name]);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                        isSel ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleGenerateRecipes}
                disabled={isGeneratingRecipe}
                className="w-full py-4 bg-green-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                {isGeneratingRecipe ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>Generate AI Recipes</span>
              </button>
            </div>

            {/* Generated recipes list */}
            {generatedRecipes.length > 0 && (
              <div className="flex flex-col gap-4">
                <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1 pl-1">Generated recipe options</span>
                
                {generatedRecipes.map(recipe => (
                  <div key={recipe.id} className="card p-5 border border-[var(--border-color)] flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm theme-text">{recipe.name}</h4>
                        <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">Cook: {recipe.cookTime} mins • Diff: {recipe.difficulty}</p>
                      </div>
                      <span className="text-xs font-black text-green-500 font-mono">{recipe.nutritionScore} Score</span>
                    </div>

                    <div className="bg-[var(--bg-elevated)] rounded-xl p-3 text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
                      <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
                    </div>

                    <div className="text-[10px] flex flex-col gap-1 pr-1 border-t border-[var(--border-color)]/50 pt-3">
                      {recipe.steps.map((st, idx) => (
                        <p key={idx}><strong>Step {idx+1}:</strong> {st}</p>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3.5">
                      <button 
                        onClick={() => handleSaveRecipe(recipe)}
                        className="flex-1 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 font-bold uppercase tracking-wider text-[8px] rounded-lg"
                      >
                        Save Recipe
                      </button>
                      <button 
                        onClick={() => alert(`Shared Recipe: ${recipe.name}`)}
                        className="p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg"
                      >
                        <Share2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ============================================================
           TAB: WEEKLY MEAL PLANNER
           ============================================================ */}
        {activeTab === 'planner' && activeMealPlan && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            {/* Day Selector segmented tab */}
            <div className="flex bg-[var(--bg-elevated)] border border-[var(--border-color)] p-1 rounded-xl">
              {['Today', 'Tomorrow'].map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    selectedDay === day ? 'bg-green-500 text-black font-extrabold shadow-sm' : 'text-[var(--text-secondary)] hover:theme-text'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Meal blocks */}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Breakfast', key: 'breakfast' },
                { label: 'Lunch', key: 'lunch' },
                { label: 'Dinner', key: 'dinner' },
                { label: 'Snacks', key: 'snack' }
              ].map(meal => {
                const data = activeMealPlan.meals[meal.key];
                return (
                  <div key={meal.key} className="card p-4 border border-[var(--border-color)] flex justify-between items-center rounded-2xl">
                    <div>
                      <span className="text-[7px] text-green-500 font-black uppercase tracking-wider">{meal.label}</span>
                      <h4 className="font-bold text-xs theme-text mt-1">{data.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black theme-text font-mono">{data.cal} kcal</p>
                      <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">P: {data.p}g • C: {data.c}g</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Nutrition Totals and Progress bar */}
            <div className="card p-5 border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-4">Daily Balance totals</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-black font-mono">
                <div>
                  <p className="text-[6px] text-[var(--text-muted)] font-bold uppercase mb-0.5">Calories</p>
                  <p className="theme-text">{activeMealPlan.totals.calories}</p>
                </div>
                <div>
                  <p className="text-[6px] text-[var(--text-muted)] font-bold uppercase mb-0.5">Protein</p>
                  <p className="text-green-500">{activeMealPlan.totals.protein}g</p>
                </div>
                <div>
                  <p className="text-[6px] text-[var(--text-muted)] font-bold uppercase mb-0.5">Carbs</p>
                  <p className="text-blue-500">{activeMealPlan.totals.carbs}g</p>
                </div>
                <div>
                  <p className="text-[6px] text-[var(--text-muted)] font-bold uppercase mb-0.5">Fats</p>
                  <p className="text-orange-500">{activeMealPlan.totals.fat}g</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================
           TAB: LEFTOVER FOOD RECIPES
           ============================================================ */}
        {activeTab === 'leftover' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            <div className="card p-5 border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-4">Select Leftovers</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['Yesterday\'s Rice', 'Leftover Dal', 'Old Bread', 'Boiled Potatoes', 'Paneer'].map(food => {
                  const isSel = selectedLeftover.includes(food);
                  return (
                    <button
                      key={food}
                      onClick={() => {
                        if (isSel) setSelectedLeftover(prev => prev.filter(f => f !== food));
                        else setSelectedLeftover(prev => [...prev, food]);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                        isSel ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {food}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleGenerateLeftovers}
                disabled={isGeneratingLeftover}
                className="w-full py-4 bg-green-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                {isGeneratingLeftover ? <RefreshCw size={12} className="animate-spin" /> : <Apple size={12} />}
                <span>Save Leftovers & Generate Recipes</span>
              </button>
            </div>

            {/* Generated Leftover Recipe detail */}
            {leftoverRecipe && (
              <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-3 animate-slide-up">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm theme-text">{leftoverRecipe.name}</h4>
                    <p className="text-[8px] text-[var(--text-muted)] font-black uppercase mt-1">Cook: {leftoverRecipe.cookTime} mins • Diff: {leftoverRecipe.difficulty}</p>
                  </div>
                  <span className="text-xs font-mono text-green-500 font-black">{leftoverRecipe.calories} cal</span>
                </div>
                
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{leftoverRecipe.desc}</p>
                
                <div className="bg-[var(--bg-elevated)] rounded-xl p-3 text-[10px] text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                  <strong>Requires:</strong> {leftoverRecipe.additional.join(', ')}
                </div>

                <div className="text-[10px] flex flex-col gap-1 pr-1 border-t border-[var(--border-color)]/50 pt-3">
                  {leftoverRecipe.steps.map((st, idx) => (
                    <p key={idx}><strong>Step {idx+1}:</strong> {st}</p>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
