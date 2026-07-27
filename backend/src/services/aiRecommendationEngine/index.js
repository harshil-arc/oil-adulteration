/**
 * Server-Side AI Recommendation Engine Mirror for SpectraTrust Meal Planner
 */

function calculateBMI(weightKg, heightCm) {
  const weight = parseFloat(weightKg) || 65;
  const height = parseFloat(heightCm) || 168;

  if (height <= 0 || weight <= 0) {
    return { bmi: 22.0, category: 'Healthy', healthyWeightRange: { min: 52, max: 70 }, color: '#10b981' };
  }

  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
  const minWeight = Math.round(18.5 * heightM * heightM);
  const maxWeight = Math.round(24.9 * heightM * heightM);

  let category = 'Healthy';
  let color = '#10b981';

  if (bmi < 18.5) { category = 'Underweight'; color = '#3b82f6'; }
  else if (bmi >= 25 && bmi < 29.9) { category = 'Overweight'; color = '#f59e0b'; }
  else if (bmi >= 30) { category = 'Obese'; color = '#ef4444'; }

  return { bmi, category, healthyWeightRange: { min: minWeight, max: maxWeight }, color };
}

function determineLifeStage(age) {
  const a = parseInt(age) || 28;
  if (a <= 12) return { stage: 'Child', label: 'Child (1-12 yrs)', icon: '👶' };
  if (a <= 17) return { stage: 'Teenager', label: 'Teenager (13-17 yrs)', icon: '🧑' };
  if (a <= 59) return { stage: 'Adult', label: 'Adult (18-59 yrs)', icon: '🧔' };
  return { stage: 'Senior', label: 'Senior Citizen (60+ yrs)', icon: '👴' };
}

function calculateDailyNutritionTargets(userInput = {}) {
  const age = parseInt(userInput.age) || 28;
  const gender = userInput.gender || 'Male';
  const height = parseFloat(userInput.height) || 168;
  const weight = parseFloat(userInput.weight) || 65;
  const goal = userInput.goal || 'Weight Loss';
  const medicalConditions = userInput.medicalConditions || [];

  const lifeStage = determineLifeStage(age);

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === 'Female' ? bmr - 161 : bmr + 5;
  const tdee = Math.round(bmr * 1.375);

  let targetCalories = tdee;
  if (goal === 'Weight Loss' || goal === 'Fat Loss') targetCalories = Math.max(1200, tdee - 450);
  else if (goal === 'Muscle Building' || goal === 'Weight Gain') targetCalories = tdee + 350;

  let proteinFactor = goal === 'Muscle Building' || goal === 'Fat Loss' ? 1.8 : (goal === 'Weight Loss' ? 1.5 : 1.2);
  const targetProtein = Math.round(weight * proteinFactor);
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.round(Math.max(400, targetCalories - (targetProtein * 4 + targetFat * 9)) / 4);
  const targetFiber = Math.max(25, Math.round((targetCalories / 1000) * 14));
  const targetWaterLiters = parseFloat((weight * 0.035).toFixed(1));

  const hasDiabetes = medicalConditions.includes('Diabetes');
  const hasHypertension = medicalConditions.includes('Hypertension');
  const hasCholesterol = medicalConditions.includes('High Cholesterol');

  return {
    lifeStage, bmr: Math.round(bmr), tdee, targetCalories, targetProtein, targetCarbs, targetFat, targetFiber, targetWaterLiters,
    maxSugarGrams: hasDiabetes ? 15 : 25,
    maxSodiumMg: hasHypertension ? 1500 : 2200,
    maxCholesterolMg: hasCholesterol ? 150 : 220
  };
}

function scoreRecipeServer(recipe, userPayload = {}) {
  const {
    pantryItems = [],
    medicalConditions = [],
    allergies = [],
    dietPreference = 'All',
    healthGoal = 'Maintenance',
    age = 28,
    gender = 'Male',
    height = 168,
    weight = 65,
    cuisine = 'All',
    maxCookTime = 60,
    season = 'Summer',
    recentlyCooked = [],
    recentlyRejected = [],
    frequentlyViewed = []
  } = userPayload;

  const recipeText = `${recipe.name} ${recipe.ingredients?.join(' ')} ${recipe.containsGluten} ${recipe.containsDairy}`.toLowerCase();

  // 1. Allergy Disqualification
  if (allergies && allergies.length > 0) {
    const hasAllergen = allergies.some(a => {
      const alg = a.toLowerCase();
      if (alg === 'milk' && (recipeText.includes('milk') || recipeText.includes('paneer') || recipeText.includes('curd'))) return true;
      if (alg === 'gluten' && (recipeText.includes('wheat') || recipeText.includes('atta'))) return true;
      if (alg === 'egg' && recipeText.includes('egg')) return true;
      if (alg === 'soy' && (recipeText.includes('soy') || recipeText.includes('tofu'))) return true;
      return false;
    });
    if (hasAllergen) return null; // Disqualified
  }

  let totalScore = 0;
  const rationaleBadges = [];

  // Pantry Match (Up to +50)
  const recipeIngs = (recipe.ingredients || []).map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim());
  const pantryNames = (pantryItems || []).map(p => typeof p === 'string' ? p.toLowerCase().trim() : (p.name || '').toLowerCase().trim());

  let matchedCount = 0;
  const missingIngredients = [];

  recipeIngs.forEach(ring => {
    if (pantryNames.some(p => ring.includes(p) || p.includes(ring))) matchedCount++;
    else missingIngredients.push(ring);
  });

  const ingredientMatchPct = recipeIngs.length > 0 ? Math.round((matchedCount / recipeIngs.length) * 100) : 70;
  const ingredientScore = Math.round((ingredientMatchPct / 100) * 50);
  totalScore += ingredientScore;

  if (ingredientMatchPct >= 80) rationaleBadges.push(`🎯 ${ingredientMatchPct}% Pantry Match`);

  // Health Score (+40)
  let healthPoints = 30;
  if (medicalConditions.includes('Diabetes')) {
    if ((recipe.sugar || 5) <= 6) healthPoints += 10;
    else healthPoints -= 10;
  }
  if (medicalConditions.includes('Hypertension')) {
    if ((recipe.sodium || 300) <= 280) healthPoints += 10;
    else healthPoints -= 10;
  }
  healthPoints = Math.max(0, Math.min(40, healthPoints));
  totalScore += healthPoints;

  // Goal Score (+35)
  let goalPoints = 25;
  const cals = recipe.calories || 300;
  const prot = recipe.protein || 10;
  if (healthGoal === 'Weight Loss' && cals <= 320) goalPoints += 10;
  if (healthGoal === 'Muscle Building' && prot >= 18) goalPoints += 10;
  totalScore += goalPoints;

  // Cuisine & Cooking Time (+15, +10)
  if (cuisine !== 'All' && recipe.cuisine?.toLowerCase() === cuisine.toLowerCase()) totalScore += 15;
  if ((recipe.cookTimeMin || 25) <= maxCookTime) totalScore += 10;

  // Food Safety Bonus (+15)
  totalScore += 15;
  rationaleBadges.push('🛡️ SpectraTrust Safe Oil');

  // Penalties
  if (recentlyCooked.includes(recipe.id) || recentlyCooked.includes(recipe.name)) totalScore -= 30;
  if (recentlyRejected.includes(recipe.id) || recentlyRejected.includes(recipe.name)) totalScore -= 40;
  if (frequentlyViewed.includes(recipe.id) || frequentlyViewed.includes(recipe.name)) totalScore -= 10;

  const overallMatchPct = Math.min(99, Math.max(35, Math.round((totalScore / 210) * 100)));

  return {
    ...recipe,
    overallMatchPct,
    ingredientMatchPct,
    matchedIngredientsCount: matchedCount,
    missingIngredients,
    explanationBadges: rationaleBadges
  };
}

module.exports = {
  calculateBMI,
  determineLifeStage,
  calculateDailyNutritionTargets,
  scoreRecipeServer
};
