import React, { useState } from 'react';
import { HEALTH_CONDITIONS, COOKING_HABITS } from '../../data/healthConditionsData';
import { 
  Activity, Heart, HeartPulse, Flame, ShieldAlert, Bone, Scale, Zap, 
  Sparkles, Baby, Trophy, UserCheck, CheckCircle2, ChevronRight, 
  AlertCircle, RefreshCw, CookingPot, Salad, UtensilsCrossed, PieChart
} from 'lucide-react';

export const HealthQuestionnaire = ({
  onCalculate,
  isLoadingAi,
  initialProfile
}) => {
  const [selectedConditions, setSelectedConditions] = useState(
    initialProfile?.selectedConditions || ['cholesterol']
  );
  const [cookingHabits, setCookingHabits] = useState(
    initialProfile?.cookingHabits || ['indian_tadka', 'saute_low']
  );
  const [ageGroup, setAgeGroup] = useState(initialProfile?.ageGroup || 'Adult (18-59 yrs)');
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg || 70);
  const [activityLevel, setActivityLevel] = useState(
    initialProfile?.activityLevel || 'moderate'
  );
  const [householdMembers, setHouseholdMembers] = useState(initialProfile?.householdMembers || 4);

  const toggleCondition = (id) => {
    if (selectedConditions.includes(id)) {
      setSelectedConditions(selectedConditions.filter(c => c !== id));
    } else {
      setSelectedConditions([...selectedConditions, id]);
    }
  };

  const toggleHabit = (id) => {
    if (cookingHabits.includes(id)) {
      setCookingHabits(cookingHabits.filter(h => h !== id));
    } else {
      setCookingHabits([...cookingHabits, id]);
    }
  };

  const handleSubmit = () => {
    const profile = {
      selectedConditions,
      cookingHabits,
      ageGroup,
      weightKg,
      activityLevel,
      householdMembers
    };
    onCalculate(profile);
  };

  const renderIcon = (name) => {
    switch (name) {
      case 'Activity': return <Activity className="w-5 h-5 text-rose-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-red-600" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-amber-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-emerald-600" />;
      case 'Bone': return <Bone className="w-5 h-5 text-blue-600" />;
      case 'Scale': return <Scale className="w-5 h-5 text-purple-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-600" />;
      case 'Baby': return <Baby className="w-5 h-5 text-pink-500" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-indigo-600" />;
      default: return <Activity className="w-5 h-5 text-slate-600" />;
    }
  };

  const renderCookingIcon = (name) => {
    switch (name) {
      case 'Salad': return <Salad className="w-5 h-5 text-emerald-600" />;
      case 'CookingPot': return <CookingPot className="w-5 h-5 text-amber-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5 text-red-600" />;
      case 'PieChart': return <PieChart className="w-5 h-5 text-indigo-600" />;
      default: return <CookingPot className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-900 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Personalized Health & Fat Profiler</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-amber-50">
            What is your health condition & cooking style?
          </h2>
          <p className="mt-2 text-sm text-amber-100/90 leading-relaxed">
            Select your health conditions, age group, and cooking habits to receive a customized recommendation of oils to <span className="font-semibold text-emerald-300">consume</span>, oils to <span className="font-semibold text-rose-300">avoid</span>, and your exact <span className="font-semibold text-amber-300">daily target quantity</span>.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* Step 1: Health Conditions Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-sans flex items-center justify-center font-bold">1</span>
                Select Health Conditions or Goals
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Select all that apply to you or your family member.</p>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {selectedConditions.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HEALTH_CONDITIONS.map(condition => {
              const isSelected = selectedConditions.includes(condition.id);
              return (
                <div
                  key={condition.id}
                  onClick={() => toggleCondition(condition.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-400'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-100/80' : 'bg-white border border-slate-200'}`}>
                        {renderIcon(condition.iconName)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {condition.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {condition.category}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300 text-transparent'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {condition.description}
                  </p>

                  {condition.severityNotice && isSelected && (
                    <div className="mt-2 text-[10px] font-medium text-amber-800 bg-amber-100/80 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>{condition.severityNotice}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Cooking Habits */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-sans flex items-center justify-center font-bold">2</span>
                Primary Cooking Habits & Heat Levels
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Helps ensure recommended oils match required smoke point temperatures.</p>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {cookingHabits.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COOKING_HABITS.map(habit => {
              const isSelected = cookingHabits.includes(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-400'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-100/80' : 'bg-white border border-slate-200'}`}>
                      {renderCookingIcon(habit.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{habit.label}</h4>
                      <span className="text-[10px] font-semibold text-slate-500">{habit.heat}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300 text-transparent'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Demographics */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 font-serif">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-sans flex items-center justify-center font-bold">3</span>
            Personal & Household Metrics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Age Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age Profile
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Child / Teen (<18 yrs)">Child / Teen (&lt;18 yrs)</option>
                <option value="Adult (18-59 yrs)">Adult (18-59 yrs)</option>
                <option value="Senior (60+ yrs)">Senior (60+ yrs)</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Weight (in kg)
              </label>
              <input
                type="number"
                value={weightKg || ''}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 70"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Physical Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="moderate">Moderately Active (exercise 3-4x/wk)</option>
                <option value="active">Very Active (daily workouts)</option>
                <option value="athlete">Competitive Athlete (high burn)</option>
              </select>
            </div>

            {/* Household Members */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Household Members count
              </label>
              <input
                type="number"
                min={1}
                value={householdMembers}
                onChange={(e) => setHouseholdMembers(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            <span>Calculate Oil Recommendations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
