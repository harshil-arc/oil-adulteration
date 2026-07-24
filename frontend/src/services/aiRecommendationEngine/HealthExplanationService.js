/**
 * HealthExplanationService.js
 * Generates transparent rationale checkmarks (✓) and health warnings (⚠)
 */

export function generateHealthExplanations(recipe, userProfile, matchedPantryCount = 0) {
  const rationaleBadges = [];
  const warnings = [];

  const { biometrics, targets, diseaseRules, rawInput } = userProfile;
  const { medicalConditions, allergies, goal, dietPreference } = rawInput;
  const { stage } = targets.lifeStage;

  // 1. Pantry Overlap Explanation
  if (matchedPantryCount > 0) {
    rationaleBadges.push(`✓ Uses ${matchedPantryCount} pantry ingredient${matchedPantryCount > 1 ? 's' : ''}`);
  }

  // 2. Diet & Life Stage Explanation
  if (dietPreference && dietPreference !== 'All' && recipe.dietaryType === dietPreference) {
    rationaleBadges.push(`✓ 100% ${dietPreference}`);
  }
  if (stage === 'Child') {
    rationaleBadges.push('✓ Child Friendly Growth Support');
  } else if (stage === 'Senior') {
    rationaleBadges.push('✓ Easy Digestibility for Senior Citizens');
  }

  // 3. Goal Compatibility Explanation
  if (goal === 'Weight Loss' || goal === 'Fat Loss') {
    if (recipe.macros?.calories <= 320) rationaleBadges.push(`✓ Calorie Deficit Safe (${recipe.macros.calories} kcal)`);
    if (recipe.macros?.fiber >= 5) rationaleBadges.push(`✓ High Satiety Fiber (${recipe.macros.fiber}g)`);
  } else if (goal === 'Muscle Building' || goal === 'Weight Gain') {
    if (recipe.macros?.protein >= 15) rationaleBadges.push(`✓ High Protein (${recipe.macros.protein}g)`);
  }

  // 4. Disease Rule Rationale & Warnings
  if (medicalConditions.includes('Diabetes')) {
    if (recipe.macros?.sugar <= 5) rationaleBadges.push('✓ Low Sugar (<5g)');
    else if (recipe.macros?.sugar > 10) warnings.push(`⚠ High Sugar (${recipe.macros.sugar}g) - Caution for Diabetes`);

    if (recipe.gi <= 55) rationaleBadges.push(`✓ Low Glycemic Index (GI ${recipe.gi || 45})`);
    else if (recipe.gi > 65) warnings.push(`⚠ High Glycemic Index (GI ${recipe.gi}) - May spike blood sugar`);
  }

  if (medicalConditions.includes('Hypertension')) {
    if (recipe.micros?.sodium <= 280) rationaleBadges.push(`✓ Low Sodium (${recipe.micros.sodium}mg)`);
    else if (recipe.micros?.sodium > 400) warnings.push(`⚠ High Sodium (${recipe.micros.sodium}mg) - Caution for High BP`);
  }

  if (medicalConditions.includes('High Cholesterol')) {
    if (recipe.macros?.fat <= 10) rationaleBadges.push('✓ Low Saturated Fat');
    else if (recipe.macros?.fat > 18) warnings.push(`⚠ High Fat Content (${recipe.macros.fat}g) - Caution for Cholesterol`);
  }

  if (medicalConditions.includes('Anemia')) {
    if (recipe.micros?.iron >= 3.5) rationaleBadges.push(`✓ Iron Rich (${recipe.micros.iron}mg)`);
  }

  // Fallback rationale if none triggered
  if (rationaleBadges.length === 0) {
    rationaleBadges.push('✓ Balanced Macros & Nutrient Dense');
  }

  return {
    rationaleBadges,
    warnings
  };
}
