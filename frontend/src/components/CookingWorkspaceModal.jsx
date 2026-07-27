import { useState, useEffect } from 'react';
import { 
  X, Play, Volume2, VolumeX, Clock, Flame, ShieldCheck, Check, 
  ChevronRight, ChevronLeft, RotateCcw, Award, AlertTriangle, 
  Utensils, CheckCircle2, Sparkles, ShoppingBag, Eye, Info, Bot
} from 'lucide-react';
import { SMART_SUBSTITUTIONS } from '../services/aiRecommendationEngine';

export default function CookingWorkspaceModal({ isOpen, onClose, recipe, pantryItems = [], onMarkCooked, onAddToShoppingList, onOpenAiAssistant }) {
  const [workspaceTab, setWorkspaceTab] = useState('cooking'); // 'overview', 'ingredients', 'equipment', 'prep', 'cooking'
  const [stepIndex, setStepIndex] = useState(0);
  const [stepTimerSeconds, setStepTimerSeconds] = useState(40);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!isOpen || !recipe) return null;

  const {
    name = "Quinoa Veggie Upma",
    cuisine = "North Indian",
    mealType = "Breakfast",
    prepTime = 15,
    cookTimeMin = 20,
    difficulty = "Easy",
    servings = 2,
    image = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    macros = { calories: 240, protein: 9, carbs: 36, fat: 5, fiber: 7 },
    micros = { iron: 3.8, calcium: 70, vitC: 20, sodium: 260 },
    ingredients = ["Quinoa", "Carrots", "Peas", "Mustard seeds", "Curry leaves", "Lemon juice"],
    equipment = ["Non-Stick Skillet", "Chef's Knife", "Mixing Bowl", "Measuring Cup", "Wooden Spatula"],
    prepSteps = [
      "Rinse 1 cup quinoa thoroughly in cold water to remove saponin bitterness.",
      "Finely dice carrots, onions, and green chilies.",
      "Measure 1 tsp SpectraTrust Verified Cold-Pressed Mustard Oil.",
      "Keep mustard seeds and fresh curry leaves ready for tempering."
    ],
    cookingSteps = [
      {
        step: 1,
        title: "Heat Oil & Temper Spices",
        instruction: "Heat 1 tbsp SpectraTrust Verified Mustard Oil in a skillet until warm. Add 1 tsp mustard seeds and curry leaves. Wait until they crackle.",
        targetTemp: "170°C",
        estimatedSec: 40,
        chefTip: "Do not overheat mustard oil beyond its 250°C smoke point to preserve beneficial monounsaturated fatty acids.",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80"
      },
      {
        step: 2,
        title: "Sauté Chopped Vegetables",
        instruction: "Add diced onions, carrots, and green peas. Sauté on medium flame for 3-4 minutes until veggies soften slightly.",
        targetTemp: "160°C",
        estimatedSec: 180,
        chefTip: "Add a small pinch of salt early to help onions release moisture and brown evenly without sticking.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
      },
      {
        step: 3,
        title: "Simmer Quinoa & Garnish",
        instruction: "Add rinsed quinoa and 2 cups of water. Cover skillet with a lid and simmer on low flame for 12 minutes until fluffy. Drizzle lemon juice.",
        targetTemp: "100°C",
        estimatedSec: 720,
        chefTip: "Let cooked quinoa rest covered off heat for 5 minutes before fluffing with a fork.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
      }
    ],
    recommendedOil = "Cold-Pressed Mustard Oil",
    smokePoint = "250°C",
    foodSafetyScore = "98/100",
    suitableFor = ["Diabetes", "Weight Loss", "PCOS"],
    shelfLife = "24 Hours in Refrigerator"
  } = recipe;

  // Fallback if cookingSteps not specified in raw object
  const stepsList = cookingSteps && cookingSteps.length > 0 ? cookingSteps : [
    {
      step: 1,
      title: "Preparation & Tempering",
      instruction: `Heat 1 tbsp ${recommendedOil} in pan. Add spices and let them crackle.`,
      targetTemp: "170°C",
      estimatedSec: 60,
      chefTip: "Use low heat to avoid burning delicate aromatic spices.",
      image
    },
    {
      step: 2,
      title: "Cooking Main Ingredients",
      instruction: `Add ${ingredients.slice(0, 3).join(', ')} and cook thoroughly on medium heat.`,
      targetTemp: "150°C",
      estimatedSec: 300,
      chefTip: "Stir occasionally to ensure uniform heat distribution.",
      image
    },
    {
      step: 3,
      title: "Final Simmer & Garnish",
      instruction: "Garnish with fresh coriander leaves, drizzle lemon juice, and serve hot.",
      targetTemp: "90°C",
      estimatedSec: 120,
      chefTip: "Serve immediately for optimal aroma and flavor.",
      image
    }
  ];

  const currentStepObj = stepsList[stepIndex] || stepsList[0];

  // Step Timer Countdown Effect
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && stepTimerSeconds > 0) {
      timer = setInterval(() => {
        setStepTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (stepTimerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, stepTimerSeconds]);

  // Speech Reader for Step Guidance
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const text = `Step ${currentStepObj.step}: ${currentStepObj.title}. ${currentStepObj.instruction}. Chef Tip: ${currentStepObj.chefTip}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
    if (stepIndex < stepsList.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      setStepTimerSeconds(stepsList[nextIdx]?.estimatedSec || 60);
      setIsTimerRunning(false);
    } else {
      setShowConfetti(true);
      if (onMarkCooked) onMarkCooked(recipe.id);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      setStepIndex(prevIdx);
      setStepTimerSeconds(stepsList[prevIdx]?.estimatedSec || 60);
      setIsTimerRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#161b22] border border-amber-500/40 rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Workspace Top Bar Header */}
        <div className="p-4 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={image} alt={name} className="w-12 h-12 rounded-xl object-cover border border-amber-500/30" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-300">{name}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Food Safety Score {foodSafetyScore}
                </span>
              </div>
              <p className="text-xs text-gray-400">{cuisine} • {mealType} • {cookTimeMin}m total • {macros.calories} kcal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiAssistant && (
              <button 
                onClick={onOpenAiAssistant}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30"
              >
                <Bot size={16} /> AI Assistant
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'cooking', label: 'Interactive Cooking Mode', icon: Play },
            { id: 'prep', label: `Pre-Prep Tasks (${prepSteps.length})`, icon: Clock },
            { id: 'ingredients', label: `Ingredients (${ingredients.length})`, icon: Utensils },
            { id: 'equipment', label: `Utensils (${equipment.length})`, icon: Utensils },
            { id: 'overview', label: 'Safety & Nutrition', icon: Info }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = workspaceTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setWorkspaceTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                    : 'bg-gray-800/60 text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Workspace Tab Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">

          {/* TAB 1: INTERACTIVE STEP-BY-STEP COOKING MODE */}
          {workspaceTab === 'cooking' && (
            <div className="space-y-5">
              {/* Confetti Celebration Banner */}
              {showConfetti && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center space-y-2 animate-bounce">
                  <div className="text-2xl font-black">🎉 Congratulations! Meal Complete!</div>
                  <p className="text-xs">You cooked {name} with SpectraTrust verified safe oil. Your recommendation profile has updated!</p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-amber-400">Step {stepIndex + 1} of {stepsList.length}: {currentStepObj.title}</span>
                  <span>{Math.round(((stepIndex + 1) / stepsList.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / stepsList.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* Step Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden border border-gray-800">
                  <img src={currentStepObj.image || image} alt={currentStepObj.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Flame size={14} /> Temp: {currentStepObj.targetTemp || '170°C'}
                  </div>
                </div>

                {/* Step Instructions & Indicators */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
                    <h3 className="text-base font-bold text-amber-300">{currentStepObj.title}</h3>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      {currentStepObj.instruction}
                    </p>

                    {/* Chef Tip */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Sparkles size={14} /> Chef Tip & Oil Safety:
                      </div>
                      <p className="text-[11px] text-amber-200/90">{currentStepObj.chefTip}</p>
                    </div>
                  </div>

                  {/* Timer & Speech Controls */}
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded-2xl border border-gray-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold flex items-center gap-1.5"
                      >
                        <Clock size={14} />
                        {isTimerRunning ? 'Pause' : 'Start Timer'}
                      </button>
                      <span className="font-mono text-sm font-bold text-amber-400">
                        {Math.floor(stepTimerSeconds / 60)}m {stepTimerSeconds % 60}s
                      </span>
                    </div>

                    <button 
                      onClick={toggleSpeech}
                      className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all ${
                        isSpeaking ? 'bg-rose-500 text-white border-rose-400' : 'bg-gray-800 text-amber-300 border-gray-700'
                      }`}
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isSpeaking ? 'Stop Voice' : 'Read Aloud'}</span>
                    </button>
                  </div>

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      disabled={stepIndex === 0}
                      onClick={handlePrevStep}
                      className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>

                    <button 
                      onClick={handleNextStep}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                    >
                      <span>{stepIndex === stepsList.length - 1 ? 'Finish Meal 🎉' : 'Next Step'}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-PREP TASKS */}
          {workspaceTab === 'prep' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Clock size={16} /> Required Ingredient Preparation Steps
              </h3>
              <div className="space-y-2">
                {prepSteps.map((ps, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-200 font-medium">{idx + 1}. {ps}</span>
                    <span className="text-amber-400 font-bold">~ 3 mins</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INGREDIENTS & SMART SUBSTITUTIONS */}
          {workspaceTab === 'ingredients' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-300">Ingredient Checklist & Substitutes</h3>
                <button 
                  onClick={() => onAddToShoppingList && onAddToShoppingList(ingredients)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} /> Add Missing to Shopping List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ingredients.map((ing, idx) => {
                  const isAvailable = pantryItems.some(p => ing.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(ing.toLowerCase()));
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-200">{ing}</div>
                        <div className="text-[10px] text-gray-400">
                          {isAvailable ? '✓ In your pantry' : '⚠ Missing item'}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {isAvailable ? 'Available' : 'Missing'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: UTENSILS & EQUIPMENT */}
          {workspaceTab === 'equipment' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Utensils size={16} /> Utensils & Kitchen Equipment Required
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {equipment.map((eq, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Utensils size={16} />
                    </div>
                    <span className="font-semibold text-gray-200">{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY & NUTRITION OVERVIEW */}
          {workspaceTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={18} /> SpectraTrust Food Safety & Oil Purity Profile
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Recommended Oil: <strong>{recommendedOil}</strong> • Smoke Point: <strong>{smokePoint}</strong>.
                  This oil has passed SpectraTrust purity verification with 0% adulteration detected.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-gray-400">Calories</div>
                  <div className="font-bold text-amber-400 text-base">{macros.calories} kcal</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-gray-400">Protein</div>
                  <div className="font-bold text-emerald-400 text-base">{macros.protein}g</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-gray-400">Carbs</div>
                  <div className="font-bold text-sky-400 text-base">{macros.carbs}g</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="text-gray-400">Shelf Life</div>
                  <div className="font-bold text-rose-400 text-base">{shelfLife}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
