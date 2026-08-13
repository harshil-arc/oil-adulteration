import React, { useState } from 'react';
import { Calculator, Users, Droplet, Calendar, Heart, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

export const HouseholdCalculator = () => {
  const [adultsCount, setAdultsCount] = useState(2);
  const [kidsCount, setKidsCount] = useState(1);
  const [seniorsCount, setSeniorsCount] = useState(1);
  const [healthGoal, setHealthGoal] = useState('heart_strict');
  const [fryingFrequency, setFryingFrequency] = useState('rare');

  // Calculation parameters (ml/day)
  let adultDailyMl = 15; // 3 tsp
  let kidDailyMl = 18;   // growth requirement
  let seniorDailyMl = 15;

  if (healthGoal === 'heart_strict' || healthGoal === 'weight_loss') {
    adultDailyMl = 12; // 2.4 tsp
    seniorDailyMl = 12;
    kidDailyMl = 15;
  } else if (healthGoal === 'high_activity') {
    adultDailyMl = 22;
    seniorDailyMl = 18;
  }

  if (fryingFrequency === 'weekly') {
    adultDailyMl += 2;
  } else if (fryingFrequency === 'frequent') {
    adultDailyMl += 5;
  }

  const totalDailyHouseholdMl = (adultsCount * adultDailyMl) + (kidsCount * kidDailyMl) + (seniorsCount * seniorDailyMl);
  const monthlyHouseholdLiters = Math.round(((totalDailyHouseholdMl * 30) / 1000) * 10) / 10;
  const yearlyHouseholdLiters = Math.round(((totalDailyHouseholdMl * 365) / 1000) * 10) / 10;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Household Monthly Oil Purchasing & Quota Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculate your exact monthly kitchen oil budget in Liters to keep fat consumption within medical guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
          
          {/* Family Composition */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-600" />
              1. Household Composition
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adults (18-59 yrs)
                </label>
                <input
                  type="number"
                  min={0}
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Children / Teens (&lt;18)
                </label>
                <input
                  type="number"
                  min={0}
                  value={kidsCount}
                  onChange={(e) => setKidsCount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seniors (60+ yrs)
                </label>
                <input
                  type="number"
                  min={0}
                  value={seniorsCount}
                  onChange={(e) => setSeniorsCount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Health Goal */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-rose-600" />
              2. Primary Health Goal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                healthGoal === 'heart_strict'
                  ? 'border-rose-500 bg-rose-50/60 font-bold text-rose-950 ring-1 ring-rose-400'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="goal"
                  checked={healthGoal === 'heart_strict'}
                  onChange={() => setHealthGoal('heart_strict')}
                  className="sr-only"
                />
                <span className="block font-serif text-sm">Heart & Cholesterol Control</span>
                <span className="text-[10px] text-slate-500 font-normal">Cap at ~12ml (2.4 tsp) per person/day</span>
              </label>

              <label className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                healthGoal === 'weight_loss'
                  ? 'border-purple-500 bg-purple-50/60 font-bold text-purple-950 ring-1 ring-purple-400'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="goal"
                  checked={healthGoal === 'weight_loss'}
                  onChange={() => setHealthGoal('weight_loss')}
                  className="sr-only"
                />
                <span className="block font-serif text-sm">Weight Loss / Calorie Deficit</span>
                <span className="text-[10px] text-slate-500 font-normal">Strict fat reduction allowance</span>
              </label>

              <label className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                healthGoal === 'standard'
                  ? 'border-amber-500 bg-amber-50/60 font-bold text-amber-950 ring-1 ring-amber-400'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="goal"
                  checked={healthGoal === 'standard'}
                  onChange={() => setHealthGoal('standard')}
                  className="sr-only"
                />
                <span className="block font-serif text-sm">Standard Wellness Maintenance</span>
                <span className="text-[10px] text-slate-500 font-normal">Standard 15ml (3 tsp) per person/day</span>
              </label>

              <label className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                healthGoal === 'high_activity'
                  ? 'border-emerald-500 bg-emerald-50/60 font-bold text-emerald-950 ring-1 ring-emerald-400'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="goal"
                  checked={healthGoal === 'high_activity'}
                  onChange={() => setHealthGoal('high_activity')}
                  className="sr-only"
                />
                <span className="block font-serif text-sm">High Activity / Athletic Family</span>
                <span className="text-[10px] text-slate-500 font-normal">Higher caloric fat allowance</span>
              </label>
            </div>
          </div>

          {/* Frying frequency */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              3. Deep Frying Frequency
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => setFryingFrequency('rare')}
                className={`p-2.5 rounded-xl border font-semibold text-center cursor-pointer ${
                  fryingFrequency === 'rare' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Rare / Minimal
              </button>
              <button
                onClick={() => setFryingFrequency('weekly')}
                className={`p-2.5 rounded-xl border font-semibold text-center cursor-pointer ${
                  fryingFrequency === 'weekly' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Once a Week
              </button>
              <button
                onClick={() => setFryingFrequency('frequent')}
                className={`p-2.5 rounded-xl border font-semibold text-center cursor-pointer ${
                  fryingFrequency === 'frequent' ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Multiple times/week
              </button>
            </div>
          </div>

        </div>

        {/* Results Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-2xl p-6 space-y-6 shadow-md border border-purple-500/20 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
              Calculated Monthly Quota
            </span>
            <h3 className="text-3xl font-bold font-serif text-purple-100">
              {monthlyHouseholdLiters} Liters <span className="text-sm font-sans font-normal text-purple-300">/ month</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Target monthly oil purchase for {adultsCount + kidsCount + seniorsCount} family member(s)
            </p>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-200">
                <span>Daily Household Total:</span>
                <span className="font-bold text-amber-300 font-mono">{totalDailyHouseholdMl} ml/day</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Annual Consumption:</span>
                <span className="font-bold text-emerald-300 font-mono">{yearlyHouseholdLiters} Liters/yr</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>Avg. Adult Allowance:</span>
                <span className="font-bold text-purple-300 font-mono">{adultDailyMl} ml (~{(adultDailyMl/5).toFixed(1)} tsp/day)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200 space-y-1">
            <span className="font-bold text-purple-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              Smart Grocery Tip:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Buy 2 Liters of Cold-Pressed Mustard or Groundnut oil for primary cooking and 1 Liter of Extra Virgin Olive Oil for raw drizzling every month.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
