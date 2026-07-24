/**
 * Server-Side AI Recommendation Engine Mirror
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

function generateDiseaseRules(medicalConditions = []) {
  const rules = {
    maxSugar: 20, maxSodium: 500, maxSatFat: 10, maxCholesterol: 100, maxGI: 75, minFiber: 2, minProtein: 0,
    avoidKeywords: [], preferKeywords: [], activeRuleLabels: []
  };

  medicalConditions.forEach(cond => {
    if (cond === 'Diabetes') {
      rules.maxSugar = 6; rules.maxGI = 55; rules.minFiber = 5;
      rules.activeRuleLabels.push('🩸 Low GI & Sugar Control (Diabetes)');
    } else if (cond === 'Hypertension') {
      rules.maxSodium = 280;
      rules.activeRuleLabels.push('🫀 Low Sodium & DASH Compliant (Hypertension)');
    } else if (cond === 'High Cholesterol') {
      rules.maxSatFat = 2.5; rules.maxCholesterol = 20;
      rules.activeRuleLabels.push('❤️ Heart Safe & Low Sat Fat (High Cholesterol)');
    }
  });

  return rules;
}

function scoreRecipeServer(recipe, userPayload = {}) {
  const {
    pantryItems = [],
    medicalConditions = [],
    allergies = [],
    dietPreference,
    healthGoal,
    age = 28,
    gender = 'Male',
    height = 168,
    weight = 65
  } = userPayload;

  const biometrics = calculateBMI(weight, height);
  const targets = calculateDailyNutritionTargets({ age, gender, height, weight, goal: healthGoal, medicalConditions });
  const diseaseRules = generateDiseaseRules(medicalConditions);

  // 1. Allergy Check (Strict Disqualification)
  if (allergies.length > 0) {
    const text = `${recipe.name} ${recipe.ingredients?.join(' ')} ${recipe.containsGluten} ${recipe.containsDairy}`.toLowerCase();
    const hasAllergen = allergies.some(a => {
      const alg = a.toLowerCase();
      if (alg === 'milk' && (text.includes('milk') || text.includes('paneer') || text.includes('curd') || recipe.containsDairy === 'Yes')) return true;
      if (alg === 'gluten' && (text.includes('wheat') || text.includes('atta') || recipe.containsGluten === 'Yes')) return true;
      if (alg === 'egg' && text.includes('egg')) return true;
      if (alg === 'soy' && (text.includes('soy') || text.includes('tofu'))) return true;
      return false;
    });
    if (hasAllergen) return null;
  }

  // 2. Ingredient Match Score (Max 30 pts)
  const recipeIngs = (recipe.ingredients || []).map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim());
  const pantryNames = pantryItems.map(p => typeof p === 'string' ? p.toLowerCase().trim() : (p.name || '').toLowerCase().trim());
  let matchedCount = 0;
  if (pantryNames.length > 0 && recipeIngs.length > 0) {
    recipeIngs.forEach(ring => {
      if (pantryNames.some(p => ring.includes(p) || p.includes(ring))) matchedCount++;
    });
  }
  const ingredientMatchPct = recipeIngs.length > 0 ? Math.min(100, Math.round((matchedCount / recipeIngs.length) * 100)) : 70;
  const ingredientScore = Math.round((ingredientMatchPct / 100) * 30);

  // 3. Disease Compatibility Score (Max 25 pts)
  let diseasePoints = 25;
  const sugar = recipe.sugar || recipe.macros?.sugar || 5;
  const sodium = recipe.sodium || recipe.micros?.sodium || 300;
  const fat = recipe.fat || recipe.macros?.fat || 10;
  const fiber = recipe.fiber || recipe.macros?.fiber || 4;
  const gi = recipe.gi || 50;

  if (medicalConditions.length > 0) {
    if (medicalConditions.includes('Diabetes')) {
      if (sugar <= diseaseRules.maxSugar) diseasePoints += 2;
      else diseasePoints -= 12;
      if (gi <= diseaseRules.maxGI) diseasePoints += 2;
      else diseasePoints -= 8;
      if (fiber < diseaseRules.minFiber) diseasePoints -= 5;
    }
    if (medicalConditions.includes('Hypertension')) {
      if (sodium <= diseaseRules.maxSodium) diseasePoints += 2;
      else diseasePoints -= 14;
    }
    if (medicalConditions.includes('High Cholesterol')) {
      if (fat <= 12) diseasePoints += 2;
      else diseasePoints -= 12;
    }
  }
  diseasePoints = Math.max(0, Math.min(25, Math.round(diseasePoints)));

  // 4. Goal Compatibility Score (Max 15 pts)
  let goalPoints = 12;
  const cals = recipe.calories || recipe.macros?.calories || 300;
  const prot = recipe.protein || recipe.macros?.protein || 10;

  if (healthGoal === 'Weight Loss' || healthGoal === 'Fat Loss') {
    if (cals <= 320) goalPoints += 3;
    else if (cals > 420) goalPoints -= 6;
    if (fiber >= 5) goalPoints += 2;
  } else if (healthGoal === 'Muscle Building' || healthGoal === 'Weight Gain') {
    if (prot >= 18) goalPoints += 3;
    else if (prot < 10) goalPoints -= 6;
  } else {
    if (cals >= 200 && cals <= 400) goalPoints += 3;
  }
  goalPoints = Math.max(0, Math.min(15, Math.round(goalPoints)));

  // 5. Diet Preference Score (Max 10 pts)
  let dietPoints = 10;
  if (dietPreference && dietPreference !== 'All') {
    if (recipe.dietaryType === dietPreference) dietPoints = 10;
    else if (dietPreference === 'Vegan' && recipe.dietaryType !== 'Vegan') dietPoints = 0;
    else if (dietPreference === 'Vegetarian' && recipe.dietaryType === 'Non-Vegetarian') dietPoints = 0;
    else dietPoints = 5;
  }

  // 6. Allergy Score (5 pts)
  const allergyPoints = 5;

  // 7. Biometrics & Life Stage Score (10 pts)
  let bioPoints = 8;
  if (biometrics.category === 'Overweight' || biometrics.category === 'Obese') {
    if (cals <= 320 && fiber >= 4) bioPoints += 2;
  } else if (biometrics.category === 'Underweight') {
    if (cals >= 300 && prot >= 12) bioPoints += 2;
  }
  if (targets.lifeStage.stage === 'Child' && (recipe.suitableForTags || []).includes('Child Friendly')) bioPoints += 2;
  if (targets.lifeStage.stage === 'Senior' && fiber >= 4) bioPoints += 2;
  bioPoints = Math.max(0, Math.min(10, Math.round(bioPoints)));

  // Total Overall Score (0-100)
  const overallScore = Math.min(99, Math.max(40, Math.round(
    ingredientScore + diseasePoints + goalPoints + dietPoints + allergyPoints + bioPoints
  )));

  // Explanations & Warnings
  const rationaleBadges = [];
  const healthWarnings = [];

  if (matchedCount > 0) rationaleBadges.push(`✓ Uses ${matchedCount} pantry ingredients`);
  if (medicalConditions.includes('Diabetes')) {
    if (sugar <= 6) rationaleBadges.push('✓ Low Sugar (<6g)');
    else healthWarnings.push(`⚠ High Sugar (${sugar}g) - Caution for Diabetes`);
  }
  if (medicalConditions.includes('Hypertension')) {
    if (sodium <= 280) rationaleBadges.push('✓ Low Sodium (<280mg)');
    else healthWarnings.push(`⚠ High Sodium (${sodium}mg) - Caution for High BP`);
  }
  if (rationaleBadges.length === 0) rationaleBadges.push('✓ Nutrient Dense & Balanced Macros');

  return {
    ...recipe,
    overallMatchPct: overallScore,
    scoreComponents: {
      ingredientScore,
      diseasePoints,
      goalPoints,
      dietPoints,
      allergyPoints,
      bioPoints
    },
    matchedIngredientsCount: matchedCount,
    explanationBadges: rationaleBadges,
    healthWarnings: healthWarnings
  };
}

module.exports = {
  calculateBMI,
  determineLifeStage,
  calculateDailyNutritionTargets,
  generateDiseaseRules,
  scoreRecipeServer
};
