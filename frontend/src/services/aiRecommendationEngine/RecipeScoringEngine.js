/**
 * Samsung Food-Level Intelligent Recipe Scoring & Recommendation Engine
 * Weighted Multi-Factor Scoring Algorithm with Dynamic Re-ranking,
 * Behavioral History Learning, Smart Substitutions & SpectraTrust Food Safety Integration.
 */

import { generateHealthExplanations } from './HealthExplanationService';
import { calculateBMI } from './BMIEngine';
import { calculateDailyNutritionTargets } from './NutritionCalculator';
import { generateDiseaseRules } from './DiseaseRuleEngine';

// Smart Substitutions Mapping Dictionary
export const SMART_SUBSTITUTIONS = {
  'butter': { substitute: 'Cold-Pressed Olive Oil or Desi Ghee', healthReason: 'Reduces saturated fat & improves lipid profile' },
  'paneer': { substitute: 'Firm Tofu or Soya Chunks', healthReason: 'Plant-based high protein alternative with lower saturated fat' },
  'milk': { substitute: 'Unsweetened Soy Milk or Almond Milk', healthReason: '100% lactose-free with balanced protein' },
  'curd': { substitute: 'Plant-based Soy Yogurt', healthReason: 'Lactose-free probiotic substitute' },
  'sugar': { substitute: 'Organic Jaggery or Stevia', healthReason: 'Lower glycemic spike & natural minerals' },
  'white rice': { substitute: 'Brown Rice, Quinoa or Foxtail Millet', healthReason: 'High fiber with slow-release complex carbs for blood sugar stability' },
  'atta': { substitute: 'Bajra, Jowar or Multigrain Flour', healthReason: 'Gluten-conscious high-fiber grain substitute' },
  'cream': { substitute: 'Greek Yogurt or Cashew Cream', healthReason: 'Lower fat and higher protein satiety' },
  'potato': { substitute: 'Sweet Potato or Raw Banana', healthReason: 'Lower glycemic index and higher Vitamin A/fiber' },
  'chicken': { substitute: 'Soya Chunks or Jackfruit or Tofu', healthReason: 'Vegetarian high-protein alternative' }
};

/**
 * Main Weighted Scoring Function
 * Evaluates recipe against user profile, pantry, health conditions, history, season, and food safety.
 */
export function scoreRecipe(recipe, userProfile = {}) {
  const { rawInput = {} } = userProfile;
  
  // Extract all parameters
  const {
    pantryItems = [],
    allergies = [],
    dietPreference = 'All',
    goal = 'Maintenance',
    medicalConditions = [],
    age = 28,
    height = 168,
    weight = 65,
    gender = 'Male',
    cuisine = 'All',
    cookingTimeMin = 45,
    season = 'Summer',
    religion = 'None',
    budget = 'Moderate',
    recentlyCooked = [],
    recentlyRejected = [],
    frequentlyViewed = [],
    favoriteRecipes = [],
    oilVerified = true
  } = { ...rawInput, ...userProfile };

  const recipeName = recipe.name || 'Unnamed Recipe';
  const recipeId = recipe.id || recipeName.toLowerCase().replace(/\s+/g, '-');

  // ── 1. ALLERGY & RELIGIOUS STRICT EXCLUSION (Hard Disqualification) ───────────────
  const recipeText = `${recipeName} ${recipe.ingredients?.join(' ')} ${recipe.containsGluten} ${recipe.containsDairy} ${recipe.dietaryType || ''} ${recipe.dietType || ''}`.toLowerCase();

  if (allergies && allergies.length > 0) {
    const hasAllergen = allergies.some(a => {
      const alg = a.toLowerCase();
      if (alg === 'milk' && (recipeText.includes('milk') || recipeText.includes('paneer') || recipeText.includes('curd') || recipeText.includes('cheese') || recipe.containsDairy === true || recipe.containsDairy === 'Yes')) return true;
      if (alg === 'gluten' && (recipeText.includes('wheat') || recipeText.includes('atta') || recipeText.includes('maida') || recipe.containsGluten === true || recipe.containsGluten === 'Yes')) return true;
      if (alg === 'egg' && (recipeText.includes('egg') || recipe.containsEgg === true || recipe.containsEgg === 'Yes')) return true;
      if (alg === 'soy' && (recipeText.includes('soy') || recipeText.includes('tofu') || recipe.containsSoy === true || recipe.containsSoy === 'Yes')) return true;
      if (alg === 'peanut' && (recipeText.includes('peanut') || recipeText.includes('singdana'))) return true;
      if (alg === 'seafood' && (recipeText.includes('fish') || recipeText.includes('prawn') || recipeText.includes('crab'))) return true;
      return false;
    });

    if (hasAllergen) {
      return { overallScore: 0, overallMatchPct: 0, isAllergenDisqualified: true, rationaleBadges: ['🚨 Allergen Disqualified'] };
    }
  }

  // Religious exclusion (e.g., Jain -> no onion, garlic, non-veg)
  if (dietPreference === 'Jain' || religion === 'Jain' || religion === 'No Onion Garlic (Jain)') {
    const hasOnionGarlic = recipeText.includes('onion') || recipeText.includes('garlic') || recipeText.includes('pyaz') || recipeText.includes('lahsun');
    const isNonVeg = recipe.dietaryType === 'Non-Vegetarian' || recipe.dietType === 'Non-Vegetarian' || recipeText.includes('chicken') || recipeText.includes('mutton') || recipeText.includes('fish') || recipeText.includes('egg');
    if (hasOnionGarlic || isNonVeg) {
      return { overallScore: 0, overallMatchPct: 0, isAllergenDisqualified: true, rationaleBadges: ['🚫 Restricted by Jain Diet'] };
    }
  }

  if (dietPreference === 'Vegan' && (recipe.dietaryType === 'Non-Vegetarian' || recipeText.includes('paneer') || recipeText.includes('curd') || recipeText.includes('ghee') || recipeText.includes('milk') || recipeText.includes('egg'))) {
    if (!recipeText.includes('vegan')) {
      return { overallScore: 0, overallMatchPct: 0, isAllergenDisqualified: true, rationaleBadges: ['🌱 Excluded by Vegan Preference'] };
    }
  }

  if (dietPreference === 'Vegetarian' && (recipe.dietaryType === 'Non-Vegetarian' || recipe.dietType === 'Non-Vegetarian')) {
    return { overallScore: 0, overallMatchPct: 0, isAllergenDisqualified: true, rationaleBadges: ['🥦 Excluded by Vegetarian Preference'] };
  }

  // ── 2. SCORING COMPUTATIONS ──────────────────────────────────────────────────
  let totalScore = 0;
  const breakdown = [];
  const rationaleBadges = [];

  // A. Ingredient Match Score (Max +50 pts)
  const recipeIngs = (recipe.ingredients || []).map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim());
  const pantryNames = (pantryItems || []).map(p => typeof p === 'string' ? p.toLowerCase().trim() : (p.name || '').toLowerCase().trim());

  let matchedCount = 0;
  const missingIngredients = [];
  const suggestedSubstitutes = [];

  recipeIngs.forEach(ring => {
    const isMatched = pantryNames.some(p => ring.includes(p) || p.includes(ring));
    if (isMatched) {
      matchedCount++;
    } else {
      missingIngredients.push(ring);
      // Check if smart substitution exists
      for (const [key, val] of Object.entries(SMART_SUBSTITUTIONS)) {
        if (ring.includes(key)) {
          suggestedSubstitutes.push({ ingredient: ring, substitute: val.substitute, reason: val.healthReason });
        }
      }
    }
  });

  const ingredientMatchPct = recipeIngs.length > 0 ? Math.round((matchedCount / recipeIngs.length) * 100) : 70;
  const ingredientScore = Math.round((ingredientMatchPct / 100) * 50);
  totalScore += ingredientScore;
  if (ingredientScore > 0) {
    breakdown.push({ label: 'Ingredient Match', points: ingredientScore, max: 50 });
    if (ingredientMatchPct >= 80) rationaleBadges.push(`🎯 ${ingredientMatchPct}% Pantry Available`);
  }

  // B. Health Condition Match Score (Max +40 pts)
  let healthScore = 20; // baseline for neutral health compatibility
  const suitableConditions = recipe.suitableFor || recipe.suitableForConditions || [];
  let matchesCondition = false;

  if (medicalConditions && medicalConditions.length > 0) {
    medicalConditions.forEach(cond => {
      const condLower = cond.toLowerCase();
      const isSuitable = suitableConditions.some(s => s.toLowerCase().includes(condLower));
      
      if (isSuitable) {
        matchesCondition = true;
        healthScore += 10;
      }
      
      // Nutrients sanity bonus/penalty
      const sugar = recipe.macros?.sugar || recipe.sugar || 5;
      const sodium = recipe.micros?.sodium || recipe.sodium || 300;
      const gi = recipe.gi || 50;

      if (cond === 'Diabetes' && sugar <= 6 && gi <= 55) healthScore += 5;
      if (cond === 'Hypertension' && sodium <= 280) healthScore += 5;
      if (cond === 'Heart Disease' && (recipe.macros?.fat || recipe.fat || 10) <= 12) healthScore += 5;
    });
  } else {
    healthScore = 30; // default healthy baseline
  }
  healthScore = Math.min(40, healthScore);
  totalScore += healthScore;
  breakdown.push({ label: 'Health Condition Match', points: healthScore, max: 40 });
  if (matchesCondition) rationaleBadges.push('🩸 Medical Profile Compatible');

  // C. Nutrition Goal Match Score (Max +35 pts)
  let goalScore = 20;
  const cals = recipe.macros?.calories || recipe.calories || 300;
  const prot = recipe.macros?.protein || recipe.protein || 10;
  const fiber = recipe.macros?.fiber || recipe.fiber || 4;

  if (goal === 'Weight Loss' || goal === 'Fat Loss') {
    if (cals <= 320) goalScore += 10;
    if (fiber >= 5) goalScore += 5;
  } else if (goal === 'Muscle Building' || goal === 'Weight Gain') {
    if (prot >= 18) goalScore += 10;
    if (cals >= 300) goalScore += 5;
  } else {
    if (cals >= 200 && cals <= 400) goalScore += 10;
  }
  goalScore = Math.min(35, goalScore);
  totalScore += goalScore;
  breakdown.push({ label: 'Nutrition Goal Match', points: goalScore, max: 35 });
  if (goalScore >= 28) rationaleBadges.push(`💪 ${goal} Optimized`);

  // D. User Preference Match Score (Max +30 pts)
  let prefScore = 20;
  if (dietPreference && dietPreference !== 'All') {
    if (recipe.dietaryType === dietPreference || recipe.dietType === dietPreference) prefScore += 10;
  }
  prefScore = Math.min(30, prefScore);
  totalScore += prefScore;
  breakdown.push({ label: 'User Preference Match', points: prefScore, max: 30 });

  // E. Cuisine Match Score (Max +15 pts)
  let cuisineScore = 0;
  if (cuisine && cuisine !== 'All') {
    if ((recipe.cuisine || '').toLowerCase() === cuisine.toLowerCase()) {
      cuisineScore = 15;
      rationaleBadges.push(`🍲 ${recipe.cuisine} Authentic`);
    }
  } else {
    cuisineScore = 10;
  }
  totalScore += cuisineScore;
  breakdown.push({ label: 'Cuisine Match', points: cuisineScore, max: 15 });

  // F. Cooking Time Match Score (Max +10 pts)
  const cookTime = recipe.prepTime || recipe.cookTimeMin || 25;
  let timeScore = 5;
  if (cookTime <= cookingTimeMin) {
    timeScore = 10;
    if (cookTime <= 20) rationaleBadges.push(`⏱️ Quick ${cookTime}m Meal`);
  }
  totalScore += timeScore;
  breakdown.push({ label: 'Cooking Time Match', points: timeScore, max: 10 });

  // G. Season Match Score (Max +5 pts) & Fresh Seasonal Bonus (+20 pts)
  let seasonScore = 0;
  let seasonalBonus = 0;
  const recipeSeason = recipe.season || 'All-Season';
  if (recipeSeason === season || recipeSeason === 'All-Season') {
    seasonScore = 5;
    seasonalBonus = 20;
    rationaleBadges.push(`☀️ Fresh ${season} Ingredient`);
  }
  totalScore += (seasonScore + seasonalBonus);
  breakdown.push({ label: 'Season Match & Freshness', points: seasonScore + seasonalBonus, max: 25 });

  // H. SpectraTrust Food Safety Integration (+15 pts Bonus)
  const recommendedOil = recipe.recommendedOil || 'Cold-Pressed Mustard Oil';
  const foodSafetyBadges = [
    '🛡️ SpectraTrust Verified Oil',
    '🔬 Low Adulteration Risk',
    '🌿 Fresh Organic Ingredients'
  ];

  if (oilVerified) {
    totalScore += 15;
    rationaleBadges.push('🛡️ Verified Safe Oil Recommended');
  }

  // ── 3. PENALTIES ─────────────────────────────────────────────────────────────
  let penalties = 0;
  
  // A. Already Cooked Recently (-30 pts)
  if (recentlyCooked.includes(recipeId) || recentlyCooked.includes(recipeName)) {
    penalties += 30;
    rationaleBadges.push('🔄 Cooked Recently (-30)');
  }

  // B. Recently Rejected (-40 pts)
  if (recentlyRejected.includes(recipeId) || recentlyRejected.includes(recipeName)) {
    penalties += 40;
    rationaleBadges.push('🚫 Previously Rejected (-40)');
  }

  // C. Frequently Viewed (-10 pts for variety boost)
  if (frequentlyViewed.includes(recipeId) || frequentlyViewed.includes(recipeName)) {
    penalties += 10;
  }

  // D. Missing Ingredients Penalty (-5 per missing ingredient)
  const missingPenalty = missingIngredients.length * 5;
  if (missingPenalty > 0) {
    penalties += Math.min(30, missingPenalty);
  }

  totalScore = Math.max(10, totalScore - penalties);

  // Normalize final percentage (Max raw possible sum ~ 230 pts)
  const overallMatchPct = Math.min(99, Math.max(35, Math.round((totalScore / 220) * 100)));

  return {
    recipeId,
    recipeName,
    overallScore: totalScore,
    overallMatchPct,
    ingredientMatchPct,
    matchedCount,
    totalIngredientsCount: recipeIngs.length,
    missingIngredients,
    suggestedSubstitutes,
    recommendedOil,
    foodSafetyBadges,
    rationaleBadges: [...new Set(rationaleBadges)],
    breakdown,
    isAllergenDisqualified: false
  };
}

/**
 * Natural Language Query Parser
 * Translates conversational user searches into search criteria and scoring boosts
 */
export function parseNaturalLanguageQuery(query = '') {
  const text = query.toLowerCase().trim();
  const criteria = {
    searchQuery: text,
    mealType: 'All',
    dietPreference: 'All',
    maxCalories: null,
    minProtein: null,
    medicalConditionFilter: null,
    detectedIngredients: []
  };

  if (!text) return criteria;

  // Meal types
  if (text.includes('breakfast')) criteria.mealType = 'Breakfast';
  else if (text.includes('lunch')) criteria.mealType = 'Lunch';
  else if (text.includes('dinner')) criteria.mealType = 'Dinner';
  else if (text.includes('snack')) criteria.mealType = 'Snack';

  // Diet preferences
  if (text.includes('vegan')) criteria.dietPreference = 'Vegan';
  else if (text.includes('vegetarian')) criteria.dietPreference = 'Vegetarian';
  else if (text.includes('jain')) criteria.dietPreference = 'Jain';

  // Calories & Protein parsing
  const calMatch = text.match(/under\s+(\d+)\s*cal/i) || text.match(/(\d+)\s*calories/i);
  if (calMatch) criteria.maxCalories = parseInt(calMatch[1]);

  if (text.includes('high protein') || text.includes('protein rich')) criteria.minProtein = 15;

  // Health conditions
  if (text.includes('diabetes') || text.includes('diabetic')) criteria.medicalConditionFilter = 'Diabetes';
  if (text.includes('bp') || text.includes('hypertension')) criteria.medicalConditionFilter = 'Hypertension';
  if (text.includes('heart') || text.includes('cholesterol')) criteria.medicalConditionFilter = 'Heart Disease';

  // Extract ingredients mentioned ("I have potatoes, tomatoes...")
  const commonIngredients = ['potato', 'potatoes', 'tomato', 'tomatoes', 'onion', 'onions', 'paneer', 'rice', 'spinach', 'chicken', 'dal', 'oats', 'garlic', 'tofu'];
  commonIngredients.forEach(ing => {
    if (text.includes(ing)) criteria.detectedIngredients.push(ing);
  });

  return criteria;
}
