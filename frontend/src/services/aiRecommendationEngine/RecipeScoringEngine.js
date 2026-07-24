/**
 * RecipeScoringEngine.js
 * 100-Point Multi-Weighted Recipe Recommendation & Scoring Engine
 */

import { generateHealthExplanations } from './HealthExplanationService';
import { calculateBMI } from './BMIEngine';
import { calculateDailyNutritionTargets } from './NutritionCalculator';
import { generateDiseaseRules } from './DiseaseRuleEngine';

export function scoreRecipe(recipe, userProfile) {
  const { rawInput } = userProfile;
  const { pantryItems = [], allergies = [], dietPreference, goal, medicalConditions = [], age = 28, height = 168, weight = 65, gender = 'Male' } = rawInput;

  const biometrics = calculateBMI(weight, height);
  const targets = calculateDailyNutritionTargets({ age, gender, height, weight, goal, medicalConditions });
  const diseaseRules = generateDiseaseRules(medicalConditions);

  const recipeName = recipe.name || 'Unnamed Recipe';

  // ── 1. ALLERGY SAFETY CHECK (5% / Strict Disqualification) ─────────────────
  if (allergies && allergies.length > 0) {
    const recipeText = `${recipeName} ${recipe.ingredients?.join(' ')} ${recipe.containsGluten} ${recipe.containsDairy}`.toLowerCase();
    const hasActiveAllergen = allergies.some(a => {
      const alg = a.toLowerCase();
      if (alg === 'milk' && (recipeText.includes('milk') || recipeText.includes('paneer') || recipeText.includes('curd') || recipeText.includes('cheese') || recipe.containsDairy === 'Yes')) return true;
      if (alg === 'gluten' && (recipeText.includes('wheat') || recipeText.includes('atta') || recipeText.includes('maida') || recipe.containsGluten === 'Yes')) return true;
      if (alg === 'egg' && (recipeText.includes('egg') || recipe.containsEgg === 'Yes')) return true;
      if (alg === 'soy' && (recipeText.includes('soy') || recipeText.includes('tofu') || recipe.containsSoy === 'Yes')) return true;
      if (alg === 'peanut' && recipeText.includes('peanut')) return true;
      return false;
    });

    if (hasActiveAllergen) {
      return { overallScore: 0, ingredientMatchPct: 0, matchedCount: 0, isAllergenDisqualified: true };
    }
  }

  // ── 2. INGREDIENT MATCH SCORE (30%) ──────────────────────────────────────────
  const recipeIngs = (recipe.ingredients || []).map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim());
  const pantryNames = (pantryItems || []).map(p => typeof p === 'string' ? p.toLowerCase().trim() : (p.name || '').toLowerCase().trim());

  let matchedCount = 0;
  if (pantryNames.length > 0 && recipeIngs.length > 0) {
    recipeIngs.forEach(ring => {
      if (pantryNames.some(p => ring.includes(p) || p.includes(ring))) {
        matchedCount++;
      }
    });
  }
  const ingredientMatchPct = recipeIngs.length > 0 ? Math.min(100, Math.round((matchedCount / recipeIngs.length) * 100)) : 70;
  const ingredientScore = Math.round((ingredientMatchPct / 100) * 30);

  // ── 3. DISEASE COMPATIBILITY SCORE (25%) ────────────────────────────────────
  let diseasePoints = 25;
  const sugar = recipe.macros?.sugar || recipe.sugar || 5;
  const sodium = recipe.micros?.sodium || recipe.sodium || 300;
  const fat = recipe.macros?.fat || recipe.fat || 10;
  const fiber = recipe.macros?.fiber || recipe.fiber || 4;
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
    if (medicalConditions.includes('Anemia')) {
      const iron = recipe.micros?.iron || recipe.iron || 2.0;
      if (iron >= 3.5) diseasePoints += 3;
      else diseasePoints -= 5;
    }
  }
  diseasePoints = Math.max(0, Math.min(25, Math.round(diseasePoints)));

  // ── 4. GOAL COMPATIBILITY SCORE (15%) ───────────────────────────────────────
  let goalPoints = 12;
  const cals = recipe.macros?.calories || recipe.calories || 300;
  const prot = recipe.macros?.protein || recipe.protein || 10;

  if (goal === 'Weight Loss' || goal === 'Fat Loss') {
    if (cals <= 320) goalPoints += 3;
    else if (cals > 420) goalPoints -= 6;
    if (fiber >= 5) goalPoints += 2;
  } else if (goal === 'Muscle Building' || goal === 'Weight Gain') {
    if (prot >= 18) goalPoints += 3;
    else if (prot < 10) goalPoints -= 6;
  } else {
    if (cals >= 200 && cals <= 400) goalPoints += 3;
  }
  goalPoints = Math.max(0, Math.min(15, Math.round(goalPoints)));

  // ── 5. DIET PREFERENCE SCORE (10%) ──────────────────────────────────────────
  let dietPoints = 10;
  if (dietPreference && dietPreference !== 'All') {
    if (recipe.dietaryType === dietPreference) dietPoints = 10;
    else if (dietPreference === 'Vegan' && recipe.dietaryType !== 'Vegan') dietPoints = 0;
    else if (dietPreference === 'Vegetarian' && recipe.dietaryType === 'Non-Vegetarian') dietPoints = 0;
    else dietPoints = 5;
  }

  // ── 6. ALLERGY SAFETY SCORE (5%) ───────────────────────────────────────────
  const allergyPoints = 5; // Passed allergy disqualification check above

  // ── 7. BIOMETRIC & LIFE STAGE SCORE (10%) ───────────────────────────────────
  let bioPoints = 8;
  if (biometrics.category === 'Overweight' || biometrics.category === 'Obese') {
    if (cals <= 320 && fiber >= 4) bioPoints += 2;
  } else if (biometrics.category === 'Underweight') {
    if (cals >= 300 && prot >= 12) bioPoints += 2;
  }

  if (targets.lifeStage.stage === 'Child' && (recipe.suitableForTags || []).includes('Child Friendly')) bioPoints += 2;
  if (targets.lifeStage.stage === 'Senior' && fiber >= 4) bioPoints += 2;
  bioPoints = Math.max(0, Math.min(10, Math.round(bioPoints)));

  // ── TOTAL SCORE CALCULATION ────────────────────────────────────────────────
  const overallScore = Math.min(99, Math.max(40, Math.round(
    ingredientScore + diseasePoints + goalPoints + dietPoints + allergyPoints + bioPoints
  )));

  // Generate Explanations & Health Warnings
  const { rationaleBadges, warnings } = generateHealthExplanations(recipe, userProfile, matchedCount);

  return {
    recipeName,
    overallScore,
    scoreComponents: {
      ingredientScore,
      diseasePoints,
      goalPoints,
      dietPoints,
      allergyPoints,
      bioPoints
    },
    ingredientMatchPct,
    matchedCount,
    rationaleBadges,
    warnings,
    isAllergenDisqualified: false
  };
}

export function rankAndScoreRecipes(recipes = [], userProfile) {
  const scoredList = [];

  recipes.forEach(recipe => {
    const scoreResult = scoreRecipe(recipe, userProfile);
    if (!scoreResult.isAllergenDisqualified) {
      scoredList.push({
        ...recipe,
        overallMatchPct: scoreResult.overallScore,
        ingredientMatchPct: scoreResult.ingredientMatchPct,
        matchedIngredientsCount: scoreResult.matchedCount,
        explanationBadges: scoreResult.rationaleBadges,
        healthWarnings: scoreResult.warnings,
        scoreComponents: scoreResult.scoreComponents
      });
    }
  });

  // Sort highest score to lowest score
  scoredList.sort((a, b) => b.overallMatchPct - a.overallMatchPct);

  // DEBUG LOGGING (Verification Point 5)
  if (scoredList.length > 0) {
    const top3 = scoredList.slice(0, 3);
    console.log(`[RecipeScoringEngine] Ranked ${scoredList.length} recipes. Top 3 Score Breakdowns:`);
    top3.forEach(d => {
      const c = d.scoreComponents || {};
      console.log(`Recipe: "${d.name}" | TotalScore: ${d.overallMatchPct} | IngredientMatch: ${c.ingredientScore}/30 | DiseaseScore: ${c.diseasePoints}/25 | GoalScore: ${c.goalPoints}/15 | DietScore: ${c.dietPoints}/10 | AllergyScore: ${c.allergyPoints}/5 | BiometricsScore: ${c.bioPoints}/10`);
    });
  }

  return scoredList;
}
