import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, Trash2, Calendar, Award, Star, Share2, 
  Sparkles, Heart, Apple, ShoppingCart, User, AlertCircle, 
  ChevronRight, RefreshCw, BarChart2, Check, Clock, Droplet, 
  Flame, ShieldCheck, Stethoscope, Utensils, Zap, Filter, Search,
  X, CheckCircle2, AlertTriangle, BookOpen, ThumbsUp, ThumbsDown,
  Dumbbell, Play, Activity, Moon, Shield, Bot, HelpCircle, ChevronDown, ChevronUp, Edit3
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
import { 
  generateWeeklyWorkoutPlan, 
  getExerciseLibrary, 
  calculateSyncNutrition, 
  calculateRecoveryScore, 
  getFitnessBadges, 
  getAiWorkoutRationale,
  getPostWorkoutMealSync,
  generateWearableSyncPayload 
} from '../services/fitnessService';
import WorkoutPlayerModal from '../components/WorkoutPlayerModal';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal';
import AiFitnessCoachDrawer from '../components/AiFitnessCoachDrawer';

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Active Tab View: 'workout', 'dashboard', 'planner', 'recovery', 'pantry', 'analytics'
  const [activeTab, setActiveTab] = useState('workout');
  
  // Health & Fitness Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [healthProfile, setHealthProfile] = useState({
    age: 28,
    gender: 'Male',
    height: 172,
    weight: 68,
    activityLevel: 'Moderately Active',
    fitnessLevel: 'Intermediate',
    workoutTimeMin: 42,
    equipment: 'Dumbbells',
    goal: 'Muscle Building',
    lifestyle: 'Office Worker',
    goals: ['Healthy Lifestyle', 'Increase Protein Intake', 'Muscle Building'],
    regions: ['North Indian', 'Gujarati'],
    dietPreference: 'Vegetarian',
    medicalConditions: ['Diabetes'],
    allergies: ['None'],
    waterGoalLiters: 3.0,
    sleepHours: 7.5,
  });

  // Profile Form Edit Temp State
  const [tempProfile, setTempProfile] = useState(healthProfile);

  // Workout & Modals State
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [expandedExId, setExpandedExId] = useState(null);
  const [workoutPlayerOpen, setWorkoutPlayerOpen] = useState(false);
  const [exerciseLibraryOpen, setExerciseLibraryOpen] = useState(false);
  const [aiCoachDrawerOpen, setAiCoachDrawerOpen] = useState(false);
  const [completedExercises, setCompletedExercises] = useState(['ex-1']);

  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [completedWorkouts, setCompletedWorkouts] = useState([
    { title: 'Chest & Triceps Strength', durationMin: 42, estCalories: 325, timestamp: new Date(Date.now() - 86400000).toISOString() },
  ]);

  // Water Intake State
  const [waterCups, setWaterCups] = useState(10); // 2500ml

  // Pantry Items State
  const [pantryItems, setPantryItems] = useState([
    'Paneer', 'Whole Wheat Atta', 'Oats', 'Milk', 'Eggs', 'Moong Dal', 'Turmeric', 'Mustard Oil'
  ]);
  const [newPantryInput, setNewPantryInput] = useState('');

  // Sync temp profile when modal opens
  useEffect(() => {
    if (isEditingProfile) {
      setTempProfile({ ...healthProfile });
    }
  }, [isEditingProfile, healthProfile]);

  // Calculated BMI
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

  // Calculate Base Nutrition Targets
  const targets = useMemo(() => {
    const { weight, height, age, gender } = healthProfile;
    let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'Male' ? 5 : -161);
    let targetCalories = Math.round(bmr * 1.55) + 350;
    const targetProtein = Math.round(weight * 1.8);
    return { targetCalories, targetProtein, waterGoalLiters: healthProfile.waterGoalLiters };
  }, [healthProfile]);

  // AI 7-Day Weekly Workout Plan
  const weeklyWorkoutPlan = useMemo(() => {
    return generateWeeklyWorkoutPlan(healthProfile);
  }, [healthProfile]);

  const currentWorkout = weeklyWorkoutPlan[selectedDayIdx] || weeklyWorkoutPlan[0];

  // AI Recommendation Rationale
  const aiRationale = useMemo(() => {
    return getAiWorkoutRationale(healthProfile, currentWorkout);
  }, [healthProfile, currentWorkout]);

  // Post-Workout Meal ↔ Pantry Synchronization
  const postWorkoutSync = useMemo(() => {
    return getPostWorkoutMealSync(currentWorkout);
  }, [currentWorkout]);

  // Exercise Database
  const exerciseLib = useMemo(() => getExerciseLibrary(), []);

  // Recovery Score
  const recovery = useMemo(() => {
    return calculateRecoveryScore(healthProfile.sleepHours, waterCups * 250, completedWorkouts.length);
  }, [healthProfile.sleepHours, waterCups, completedWorkouts]);

  // Gamification Badges
  const badges = useMemo(() => {
    return getFitnessBadges(completedWorkouts.length, 18, 3400);
  }, [completedWorkouts]);

  const handleStartWorkout = (plan) => {
    setActiveWorkoutPlan(plan || currentWorkout);
    setWorkoutPlayerOpen(true);
  };

  const handleWorkoutFinished = (logData) => {
    setCompletedWorkouts(prev => [logData, ...prev]);
    setWorkoutPlayerOpen(false);
    alert(`🎉 Workout Completed! ${logData.estCalories} kcal burned in ${logData.durationMin} mins.`);
  };

  const toggleCheckExercise = (id) => {
    setCompletedExercises(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addPantryItem = () => {
    if (newPantryInput.trim() && !pantryItems.includes(newPantryInput.trim())) {
      setPantryItems([...pantryItems, newPantryInput.trim()]);
      setNewPantryInput('');
    }
  };

  const removePantryItem = (item) => {
    setPantryItems(pantryItems.filter(i => i !== item));
  };

  const handleSaveHealthProfile = (e) => {
    e.preventDefault();
    setHealthProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const toggleCondition = (cond) => {
    const list = tempProfile.medicalConditions || [];
    if (list.includes(cond)) {
      setTempProfile({ ...tempProfile, medicalConditions: list.filter(c => c !== cond) });
    } else {
      setTempProfile({ ...tempProfile, medicalConditions: [...list.filter(c => c !== 'None'), cond] });
    }
  };

  const toggleAllergy = (allergy) => {
    const list = tempProfile.allergies || [];
    if (list.includes(allergy)) {
      setTempProfile({ ...tempProfile, allergies: list.filter(a => a !== allergy) });
    } else {
      setTempProfile({ ...tempProfile, allergies: [...list.filter(a => a !== 'None'), allergy] });
    }
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-28">
      
      {/* ── TOP HEADER ── */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[#d4af37]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">FOOD 360 AI NUTRITION & FITNESS COACH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">AI Nutrition & Workout Hub</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExerciseLibraryOpen(true)}
              className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/20"
            >
              📚 Library
            </button>
            
            {/* PROMINENT HEALTH PROFILE & CONDITIONS BUTTON */}
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-2 rounded-xl bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 text-xs font-black flex items-center gap-1.5 hover:bg-[#d4af37]/20 shadow-sm transition-all"
            >
              <User size={15} /> Health Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── MEDICAL DISCLAIMER BANNER ── */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-5 py-2 text-[11px] text-amber-300 font-bold flex items-center justify-center gap-2 text-center">
        <Shield size={14} className="shrink-0 text-amber-400" />
        <span>Medical Disclaimer: Recommendations are for guidance and do not replace medical advice.</span>
      </div>

      {/* ── SUB-NAVIGATION TAB BAR ── */}
      <div className="px-5 pt-4 max-w-5xl mx-auto w-full">
        <div className="bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] grid grid-cols-3 sm:grid-cols-6 gap-1 text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('workout')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'workout' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🏋️ Workout
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'planner' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🥗 Meal Plan
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'recovery' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            💧 Water
          </button>
          <button
            onClick={() => setActiveTab('pantry')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'pantry' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            🥫 Pantry AI
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-[#d4af37] text-black font-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}
          >
            📈 Badges
          </button>
        </div>
      </div>

      {/* ── 1. WORKOUT PLANNER TAB ────────────────────────────────────────────── */}
      {activeTab === 'workout' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-elevated)] to-[#d4af37]/10 space-y-4 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest block mb-1">Today's Prescribed Session</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{currentWorkout.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{currentWorkout.focus} • {currentWorkout.difficulty} Level</p>
              </div>

              <button
                onClick={() => handleStartWorkout(currentWorkout)}
                className="btn-primary py-3.5 px-6 text-xs font-black shadow-glow-gold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Play size={18} /> Start Interactive Session →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs pt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">Duration</span>
                <span className="font-mono font-black text-white text-base">{currentWorkout.durationMin} Min</span>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">Calories</span>
                <span className="font-mono font-black text-amber-400 text-base">{currentWorkout.estCalories} kcal</span>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">Target Muscles</span>
                <span className="font-bold text-emerald-400 text-xs">{currentWorkout.targetMuscles?.join(', ')}</span>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">Recovery</span>
                <span className="font-bold text-purple-400 text-xs">{recovery.status}</span>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">Workout Streak</span>
                <span className="font-mono font-black text-[#d4af37] text-base">🔥 18 Days</span>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-[9px] text-gray-400 font-bold block">Completion</span>
                <span className="font-mono font-black text-blue-400 text-base">25%</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-1.5">
            <h4 className="text-xs font-black uppercase text-[#d4af37] tracking-wider flex items-center gap-1.5">
              <Bot size={16} /> Why did AI recommend this workout?
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed italic">"{aiRationale}"</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Weekly Schedule & Day Selector</span>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weeklyWorkoutPlan.map((plan, idx) => (
                <button
                  key={plan.day}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`p-3 rounded-2xl border transition-all ${
                    selectedDayIdx === idx
                      ? 'bg-[#d4af37] text-black font-black border-[#d4af37] shadow-glow-gold'
                      : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)] hover:border-gray-600'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block mb-1">{plan.day.substring(0, 3)}</span>
                  <span className="text-xs font-black">{plan.durationMin}m</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Prescribed Exercise Routine</h3>
              <button onClick={() => setExerciseLibraryOpen(true)} className="text-xs text-[#d4af37] font-bold">
                View Full Library →
              </button>
            </div>

            <div className="space-y-3">
              {exerciseLib.slice(0, 4).map((ex) => {
                const isExpanded = expandedExId === ex.id;
                const isChecked = completedExercises.includes(ex.id);

                return (
                  <div key={ex.id} className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckExercise(ex.id)}
                          className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                        />
                        <div>
                          <h4 className="text-base font-black text-white">{ex.name}</h4>
                          <p className="text-xs text-gray-400">{ex.muscleGroup} • {ex.equipmentRequired}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                          {ex.sets} Sets • {ex.reps}
                        </span>
                        <button
                          onClick={() => setExpandedExId(isExpanded ? null : ex.id)}
                          className="p-1.5 rounded-xl bg-[var(--bg-elevated)] text-gray-300 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-[var(--border-color)] space-y-3 text-xs bg-[var(--bg-elevated)] p-4 rounded-2xl">
                        <p className="text-gray-300 leading-relaxed"><strong>Description:</strong> {ex.description}</p>
                        <div>
                          <strong className="text-white block mb-1">How to Perform:</strong>
                          <ol className="list-decimal list-inside space-y-1 text-gray-300">
                            {ex.howToPerform.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <p className="text-amber-400 font-semibold">⚠️ Common Mistakes: {ex.commonMistakes.join(', ')}</p>
                          <p className="text-purple-400 font-semibold">🫁 Breathing: {ex.breathingTechnique}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. DASHBOARD OVERVIEW TAB ─────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase">Daily Calorie Target</span>
              <p className="text-3xl font-black text-white font-mono">{targets.targetCalories} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
              <p className="text-[10px] text-gray-400">Based on BMR & Goal: {healthProfile.goal}</p>
            </div>

            <div className="card p-5 rounded-3xl border border-blue-500/30 bg-blue-500/10 space-y-1">
              <span className="text-xs font-bold text-blue-400 uppercase">Daily Protein Target</span>
              <p className="text-3xl font-black text-white font-mono">{targets.targetProtein} <span className="text-xs text-gray-400 font-normal">grams</span></p>
              <p className="text-[10px] text-gray-400">1.8g per kg bodyweight ({healthProfile.weight} kg)</p>
            </div>

            <div className="card p-5 rounded-3xl border border-purple-500/30 bg-purple-500/10 space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase">BMI Status</span>
              <p className="text-3xl font-black text-white font-mono">{calculatedBMI} <span className={`text-xs font-bold ${bmiCategory.color}`}>({bmiCategory.label})</span></p>
              <p className="text-[10px] text-gray-400">Height: {healthProfile.height} cm • Weight: {healthProfile.weight} kg</p>
            </div>
          </div>

          <div className="card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-[#d4af37]" /> Health & Medical Profile Summary
              </h3>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1 text-[#d4af37] border-[#d4af37]/40 hover:border-[#d4af37]"
              >
                <Edit3 size={12} /> Edit Conditions
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-gray-400 block text-[10px] font-bold">Diet Preference:</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{healthProfile.dietPreference}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-gray-400 block text-[10px] font-bold">Medical Conditions:</span>
                <span className="font-bold text-amber-400 mt-0.5 block">{(healthProfile.medicalConditions || []).join(', ') || 'None'}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-gray-400 block text-[10px] font-bold">Food Allergies:</span>
                <span className="font-bold text-rose-400 mt-0.5 block">{(healthProfile.allergies || []).join(', ') || 'None'}</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <span className="text-gray-400 block text-[10px] font-bold">Primary Goal:</span>
                <span className="font-bold text-[#d4af37] mt-0.5 block">{healthProfile.goal}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MEAL PLANNER TAB ───────────────────────────────────────────────── */}
      {activeTab === 'planner' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white">AI Prescribed Indian Meal Plan</h3>
              <p className="text-xs text-gray-400">Customized for {healthProfile.dietPreference} • High Protein</p>
            </div>
            <button onClick={() => alert('Meal plan regenerated with latest AI parameters!')} className="btn-primary text-xs py-2 px-4">
              🔄 Regenerate Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">🌅 Breakfast (08:30 AM)</span>
              <h4 className="text-base font-black text-white">Paneer Bhurji + Whole Wheat Roti</h4>
              <p className="text-xs text-gray-400">Fresh cottage cheese scrambled with turmeric, green chillies & tomatoes.</p>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-emerald-400 pt-2 border-t border-[var(--border-color)]">
                <span>380 kcal</span>
                <span>24g Protein</span>
              </div>
            </div>

            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">☀️ Lunch (01:30 PM)</span>
              <h4 className="text-base font-black text-white">Moong Dal Tadka + Brown Rice + Salad</h4>
              <p className="text-xs text-gray-400">Lentils tempered with pure mustard oil, garlic & cumin seeds.</p>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-emerald-400 pt-2 border-t border-[var(--border-color)]">
                <span>520 kcal</span>
                <span>28g Protein</span>
              </div>
            </div>

            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
              <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider block">🌙 Dinner (08:00 PM)</span>
              <h4 className="text-base font-black text-white">Palak Paneer + 2 Bajra Rotis</h4>
              <p className="text-xs text-gray-400">Iron-rich spinach gravy with low-fat paneer cubes.</p>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-emerald-400 pt-2 border-t border-[var(--border-color)]">
                <span>450 kcal</span>
                <span>26g Protein</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. WATER & RECOVERY TAB ───────────────────────────────────────────── */}
      {activeTab === 'recovery' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-blue-500/30 bg-blue-500/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-black uppercase text-blue-400 tracking-wider">Hydration Tracker</span>
                <h3 className="text-2xl font-black text-white">{waterCups * 250} ml / {Math.round(healthProfile.waterGoalLiters * 1000)} ml</h3>
              </div>
              <button onClick={() => setWaterCups(prev => prev + 1)} className="btn-primary py-2.5 px-4 text-xs">
                + Add Cup (250ml)
              </button>
            </div>

            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((waterCups * 250) / (healthProfile.waterGoalLiters * 1000)) * 100)}%` }} />
            </div>
          </div>

          <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Muscle Recovery Score</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-bold block">Sleep Score</span>
                <span className="text-2xl font-black text-purple-400 font-mono">{healthProfile.sleepHours} Hours</span>
              </div>
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-bold block">Recovery State</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">Ready (88%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. PANTRY AI TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'pantry' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
            <h3 className="text-base font-black text-white">Available Pantry Ingredients</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new pantry item (e.g. Tofu, Spinach)..."
                value={newPantryInput}
                onChange={e => setNewPantryInput(e.target.value)}
                className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-xs outline-none"
              />
              <button onClick={addPantryItem} className="btn-primary px-4 text-xs font-bold">
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {pantryItems.map(item => (
                <span key={item} className="bg-gray-800 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  ✓ {item}
                  <button onClick={() => removePantryItem(item)} className="text-gray-400 hover:text-red-400">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. BADGES & ANALYTICS TAB ─────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="card p-6 rounded-3xl border border-[var(--border-color)] space-y-4">
            <h3 className="text-base font-black text-white">Fitness & Meal Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map(b => (
                <div key={b.id} className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-center space-y-1">
                  <span className="text-2xl block">{b.icon}</span>
                  <h4 className="text-xs font-black text-white">{b.title}</h4>
                  <p className="text-[10px] text-gray-400">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HEALTH PROFILE & MEDICAL CONDITIONS MODAL ── */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md animate-fade-in">
          <div className="card p-6 rounded-3xl border border-[#d4af37]/40 max-w-lg w-full space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">AI Customization</span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <User size={18} className="text-[#d4af37]" /> Health & Medical Profile
                </h3>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-xl text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHealthProfile} className="space-y-4 text-xs">
              {/* Basic Physical Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Age</label>
                  <input
                    type="number"
                    value={tempProfile.age}
                    onChange={e => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || 28 })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Gender</label>
                  <select
                    value={tempProfile.gender}
                    onChange={e => setTempProfile({ ...tempProfile, gender: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  >
                    <option value="Male" className="bg-[#18181b]">Male</option>
                    <option value="Female" className="bg-[#18181b]">Female</option>
                    <option value="Other" className="bg-[#18181b]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={tempProfile.height}
                    onChange={e => setTempProfile({ ...tempProfile, height: parseInt(e.target.value) || 170 })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={tempProfile.weight}
                    onChange={e => setTempProfile({ ...tempProfile, weight: parseInt(e.target.value) || 68 })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  />
                </div>
              </div>

              {/* Activity & Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Primary Goal</label>
                  <select
                    value={tempProfile.goal}
                    onChange={e => setTempProfile({ ...tempProfile, goal: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  >
                    <option value="Muscle Building" className="bg-[#18181b]">Muscle Building</option>
                    <option value="Weight Loss" className="bg-[#18181b]">Weight Loss</option>
                    <option value="Maintain Weight" className="bg-[#18181b]">Maintain Weight</option>
                    <option value="Diabetes Management" className="bg-[#18181b]">Diabetes Management</option>
                    <option value="Heart Health & BP" className="bg-[#18181b]">Heart Health & BP</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 font-bold block mb-1">Diet Preference</label>
                  <select
                    value={tempProfile.dietPreference}
                    onChange={e => setTempProfile({ ...tempProfile, dietPreference: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  >
                    <option value="Vegetarian" className="bg-[#18181b]">Vegetarian</option>
                    <option value="Non-Vegetarian" className="bg-[#18181b]">Non-Vegetarian</option>
                    <option value="Eggetarian" className="bg-[#18181b]">Eggetarian</option>
                    <option value="Vegan" className="bg-[#18181b]">Vegan</option>
                    <option value="Jain" className="bg-[#18181b]">Jain</option>
                  </select>
                </div>
              </div>

              {/* Medical Conditions Selector */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block">Medical Conditions & Health Concerns</label>
                <div className="flex flex-wrap gap-2">
                  {['Diabetes', 'Hypertension (High BP)', 'High Cholesterol', 'PCOS / PCOD', 'Thyroid', 'Acid Reflux', 'None'].map(cond => {
                    const isSelected = (tempProfile.medicalConditions || []).includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                          isSelected 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black' 
                            : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)] hover:border-gray-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Food Allergies Selector */}
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[10px] tracking-wider block">Food Allergies & Intolerances</label>
                <div className="flex flex-wrap gap-2">
                  {['Lactose / Dairy', 'Peanuts & Nuts', 'Gluten / Wheat', 'Soy', 'Seafood', 'None'].map(allergy => {
                    const isSelected = (tempProfile.allergies || []).includes(allergy);
                    return (
                      <button
                        type="button"
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                          isSelected 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-black' 
                            : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)] hover:border-gray-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{allergy}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hydration & Sleep Targets */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Water Goal (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempProfile.waterGoalLiters}
                    onChange={e => setTempProfile({ ...tempProfile, waterGoalLiters: parseFloat(e.target.value) || 3.0 })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Target Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempProfile.sleepHours}
                    onChange={e => setTempProfile({ ...tempProfile, sleepHours: parseFloat(e.target.value) || 7.5 })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-2.5 rounded-xl font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn-secondary flex-1 py-3 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 text-xs font-black uppercase tracking-wider"
                >
                  Save & Update AI Plan →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <WorkoutPlayerModal
        isOpen={workoutPlayerOpen}
        onClose={() => setWorkoutPlayerOpen(false)}
        workoutPlan={activeWorkoutPlan}
        onWorkoutFinished={handleWorkoutFinished}
      />

      <ExerciseLibraryModal
        isOpen={exerciseLibraryOpen}
        onClose={() => setExerciseLibraryOpen(false)}
      />

      <AiFitnessCoachDrawer
        isOpen={aiCoachDrawerOpen}
        onClose={() => setAiCoachDrawerOpen(false)}
        currentWorkout={currentWorkout}
      />

      {/* Floating AI Coach Button */}
      <button
        onClick={() => setAiCoachDrawerOpen(true)}
        className="fixed bottom-20 right-5 z-40 p-3.5 rounded-full bg-[#d4af37] text-black shadow-glow-gold hover:scale-110 transition-transform flex items-center gap-2 font-black text-xs"
      >
        <Bot size={20} /> Ask AI Coach
      </button>

    </div>
  );
}
