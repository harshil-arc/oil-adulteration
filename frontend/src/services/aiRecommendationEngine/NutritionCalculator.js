/**
 * NutritionCalculator.js
 * Calculates TDEE, Daily Calories, Macro Targets, Micronutrient Limits & Life Stage
 */

export function determineLifeStage(age) {
  const a = parseInt(age) || 28;
  if (a <= 12) return { stage: 'Child', label: 'Child (1-12 yrs)', icon: '👶' };
  if (a <= 17) return { stage: 'Teenager', label: 'Teenager (13-17 yrs)', icon: '🧑' };
  if (a <= 59) return { stage: 'Adult', label: 'Adult (18-59 yrs)', icon: '🧔' };
  return { stage: 'Senior', label: 'Senior Citizen (60+ yrs)', icon: '👴' };
}

export function calculateDailyNutritionTargets(userInput = {}) {
  const age = parseInt(userInput.age) || 28;
  const gender = userInput.gender || 'Male';
  const height = parseFloat(userInput.height) || 168;
  const weight = parseFloat(userInput.weight) || 65;
  const goal = userInput.goal || 'Weight Loss';
  const medicalConditions = userInput.medicalConditions || [];

  const lifeStage = determineLifeStage(age);

  // Mifflin-St Jeor BMR Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === 'Female' ? bmr - 161 : bmr + 5;

  // Activity level multiplier (Lightly Active default 1.375)
  const tdee = Math.round(bmr * 1.375);

  // Goal-based Calorie Adjustment
  let targetCalories = tdee;
  if (goal === 'Weight Loss' || goal === 'Fat Loss') {
    targetCalories = Math.max(1200, tdee - 450);
  } else if (goal === 'Muscle Building' || goal === 'Weight Gain') {
    targetCalories = tdee + 350;
  }

  // Protein Target (g)
  let proteinFactor = 1.2;
  if (goal === 'Muscle Building' || goal === 'Fat Loss') proteinFactor = 1.8;
  else if (goal === 'Weight Loss') proteinFactor = 1.5;
  const targetProtein = Math.round(weight * proteinFactor);

  // Fat Target (25% of calories / 9)
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  // Carbs Target (Remaining calories / 4)
  const remainingCaloriesForCarbs = Math.max(400, targetCalories - (targetProtein * 4 + targetFat * 9));
  const targetCarbs = Math.round(remainingCaloriesForCarbs / 4);

  // Fiber Target (min 25g, 14g per 1000 kcal)
  const targetFiber = Math.max(25, Math.round((targetCalories / 1000) * 14));

  // Water Intake (L)
  const targetWaterLiters = parseFloat((weight * 0.035).toFixed(1));

  // Medical Limits
  const hasDiabetes = medicalConditions.includes('Diabetes');
  const hasHypertension = medicalConditions.includes('Hypertension');
  const hasCholesterol = medicalConditions.includes('High Cholesterol');

  const maxSugarGrams = hasDiabetes ? 15 : 25;
  const maxSodiumMg = hasHypertension ? 1500 : 2200;
  const maxCholesterolMg = hasCholesterol ? 150 : 220;

  return {
    lifeStage,
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber,
    targetWaterLiters,
    maxSugarGrams,
    maxSodiumMg,
    maxCholesterolMg
  };
}
