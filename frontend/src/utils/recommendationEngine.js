import { OILS_DATABASE } from '../data/oilsData';

export function calculateOilRecommendations(profile) {
  const { selectedConditions = [], cookingHabits = [], ageGroup = '', weightKg, activityLevel = '', householdMembers = 1 } = profile;

  // Calculate daily intake target in ml per person
  let baseTargetMl = 15; // standard medical recommendation: 3 tsp = 15 ml per adult per day

  if (selectedConditions.includes('weight_loss') || selectedConditions.includes('fatty_liver')) {
    baseTargetMl = 12; // lower fat allowance for weight loss & NAFLD
  } else if (selectedConditions.includes('heart_disease') || selectedConditions.includes('cholesterol')) {
    baseTargetMl = 15; // strict cap at 15ml (3 tsp)
  } else if (selectedConditions.includes('active_athlete') || activityLevel === 'athlete') {
    baseTargetMl = 25; // higher for high caloric demand
  } else if (activityLevel === 'active') {
    baseTargetMl = 20;
  }

  if (ageGroup === 'Senior (60+ yrs)') {
    baseTargetMl = Math.min(baseTargetMl, 15);
  } else if (ageGroup === 'Child / Teen (<18 yrs)') {
    baseTargetMl = 18;
  }

  if (weightKg && weightKg > 85 && !selectedConditions.includes('weight_loss')) {
    baseTargetMl += 2;
  }

  const dailyTargetMl = baseTargetMl;
  const dailyTargetTsp = Math.round((dailyTargetMl / 5) * 10) / 10;

  // Monthly household recommendation in Liters
  const members = Math.max(1, householdMembers || 1);
  const monthlyHouseholdLiters = Math.round(((dailyTargetMl * members * 30) / 1000) * 10) / 10;

  // Score each oil
  const scoredOils = OILS_DATABASE.map(oil => {
    let score = 50; // base score
    const reasons = [];
    const avoidReasons = [];

    // Condition matches
    selectedConditions.forEach(condId => {
      if (oil.suitableForConditions.includes(condId)) {
        score += 25;
        if (condId === 'cholesterol') reasons.push('Lowers LDL cholesterol & improves HDL ratio');
        if (condId === 'heart_disease') reasons.push('Rich in cardioprotective MUFA & antioxidants');
        if (condId === 'hypertension') reasons.push('Contains blood-pressure lowering compounds (Sesamol/Oleic)');
        if (condId === 'diabetes') reasons.push('Improves insulin receptor sensitivity & cell membrane integrity');
        if (condId === 'fatty_liver') reasons.push('Reduces hepatic fat accumulation & liver inflammation');
        if (condId === 'arthritis') reasons.push('Reduces pro-inflammatory cytokine activity');
        if (condId === 'weight_loss') reasons.push('High satiety value & clean metabolic profile');
        if (condId === 'ibs_gut') reasons.push('Supports gut mucosal lining & easy digestion');
        if (condId === 'thyroid') reasons.push('Clean cold-pressed fats support thyroid conversion');
      }

      if (oil.avoidForConditions.includes(condId)) {
        score -= 40;
        if (condId === 'cholesterol') avoidReasons.push('High Saturated / Trans fat content spikes bad LDL cholesterol');
        if (condId === 'fatty_liver') avoidReasons.push('Excess saturated fat worsens hepatic fat accumulation');
        if (condId === 'arthritis') avoidReasons.push('High Omega-6 ratio triggers pro-inflammatory cascades');
      }
    });

    // Cooking habit matches
    if (cookingHabits.includes('high_fry')) {
      if (oil.suitableCooking.highHeatFrying) {
        score += 15;
      } else {
        score -= 25;
        avoidReasons.push('Smoke point too low for deep frying (creates toxic breakdown products)');
      }
    }

    if (cookingHabits.includes('indian_tadka')) {
      if (oil.suitableCooking.indianTadka) {
        score += 10;
      }
    }

    if (cookingHabits.includes('raw_drizzle')) {
      if (oil.suitableCooking.rawDrizzle) {
        score += 15;
        reasons.push('Ideal for unheated raw drizzle, preserving polyphenols & Vitamin E');
      }
    }

    // Processing penalty
    if (oil.processingType === 'Hydrogenated / Trans Fat') {
      score = -100;
      avoidReasons.push('Contains harmful trans fats that double cardiovascular risk and elevate LDL');
    } else if (oil.category === 'Avoid Oils') {
      score = Math.min(score, 10);
    }

    if (oil.processingType === 'Cold-Pressed / Kachi Ghani' || oil.processingType === 'Unrefined / Virgin') {
      score += 10;
    }

    // Deduplicate reasons
    const uniqueReasons = Array.from(new Set(reasons));
    const uniqueAvoidReasons = Array.from(new Set(avoidReasons));

    return {
      oil,
      score,
      reasons: uniqueReasons,
      avoidReasons: uniqueAvoidReasons
    };
  });

  // Filter recommended oils (score >= 50)
  const recommendedList = scoredOils
    .filter(item => item.score >= 55 && item.oil.category !== 'Avoid Oils')
    .sort((a, b) => b.score - a.score)
    .map(item => {
      // Calculate custom quantity breakdown
      let qtyStr = `${Math.round(dailyTargetMl * 0.6)} ml/day (~${Math.round((dailyTargetTsp * 0.6) * 10) / 10} tsp) for cooking`;
      if (item.oil.id === 'flaxseed_oil' || item.oil.id === 'walnut_oil') {
        qtyStr = '1 - 2 tsp/day (RAW ONLY, do not heat)';
      } else if (item.oil.id === 'a2_desi_ghee' || item.oil.id === 'virgin_coconut_oil') {
        qtyStr = '1 tsp/day (Strict limit)';
      }

      const bestMethods = [];
      if (item.oil.suitableCooking.rawDrizzle) bestMethods.push('Raw Drizzle / Salad');
      if (item.oil.suitableCooking.sauteing) bestMethods.push('Sautéing / Stir-fry');
      if (item.oil.suitableCooking.indianTadka) bestMethods.push('Indian Tadka');
      if (item.oil.suitableCooking.highHeatFrying) bestMethods.push('Deep Frying');

      return {
        oil: item.oil,
        score: item.score,
        reasons: item.reasons.length > 0 ? item.reasons : ['Provides clean, balanced essential fatty acids and antioxidants'],
        recommendedQuantity: qtyStr,
        bestMethods
      };
    });

  // Filter oils to avoid
  const avoidList = scoredOils
    .filter(item => item.score < 45 || item.oil.category === 'Avoid Oils' || item.avoidReasons.length > 0)
    .sort((a, b) => a.score - b.score)
    .map(item => {
      let altSwap = 'Switch to Cold-Pressed Mustard or Groundnut Oil';
      if (item.oil.id === 'vanaspati_transfat') altSwap = 'Replace with Cold-Pressed Mustard or A2 Desi Ghee in strict moderation';
      if (item.oil.id === 'palm_oil') altSwap = 'Replace with Rice Bran Oil or Extra Virgin Olive Oil';
      if (item.oil.id === 'sunflower_oil_standard') altSwap = 'Replace with High-Oleic Safflower Oil or Cold-Pressed Sesame Oil';

      return {
        oil: item.oil,
        reasons: item.avoidReasons.length > 0 ? item.avoidReasons : ['Unfavorable fatty acid profile or high refinement for your health conditions'],
        alternativeSwap: altSwap
      };
    });

  // Select Rotation Strategy
  const primaryOil = recommendedList[0]?.oil || OILS_DATABASE[0];
  const secondaryOil = recommendedList.find(i => i.oil.id !== primaryOil.id)?.oil || OILS_DATABASE[1];

  let rotationStrategy = `Rotate every 1-2 months between ${primaryOil.name} and ${secondaryOil.name} to maintain an ideal 1:1 balance between Monounsaturated (MUFA) and Polyunsaturated (PUFA) fats while preventing Omega-6 buildup.`;
  if (selectedConditions.includes('heart_disease') || selectedConditions.includes('cholesterol')) {
    rotationStrategy = `Use ${primaryOil.name} as main cooking oil for 2 months, then switch to Rice Bran Oil or Cold-Pressed Mustard Oil. Keep Extra Virgin Olive Oil or Flaxseed Oil for raw drizzle to ensure steady Omega-3 ALA supply.`;
  }

  return {
    recommendedOils: recommendedList.slice(0, 5),
    avoidOils: avoidList.slice(0, 5),
    dailyOilTargetMl: dailyTargetMl,
    dailyOilTargetTsp: dailyTargetTsp,
    monthlyHouseholdLiters: monthlyHouseholdLiters,
    rotationSuggestion: {
      primary: primaryOil,
      secondary: secondaryOil,
      strategy: rotationStrategy
    }
  };
}
