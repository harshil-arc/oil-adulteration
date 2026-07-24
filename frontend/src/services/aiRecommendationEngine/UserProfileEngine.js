/**
 * UserProfileEngine.js
 * Unified User Profile Orchestrator
 */

import { calculateBMI } from './BMIEngine';
import { calculateDailyNutritionTargets } from './NutritionCalculator';
import { generateDiseaseRules } from './DiseaseRuleEngine';

export function createUserProfile(userInput = {}) {
  const age = parseInt(userInput.age) || 28;
  const gender = userInput.gender || 'Male';
  const height = parseFloat(userInput.height) || 168;
  const weight = parseFloat(userInput.weight) || 65;
  const goal = userInput.goal || 'Weight Loss';
  const dietPreference = userInput.dietPreference || 'Vegetarian';
  const medicalConditions = userInput.medicalConditions || [];
  const allergies = userInput.allergies || [];
  const pantryItems = userInput.pantryItems || [];

  const biometrics = calculateBMI(weight, height);
  const targets = calculateDailyNutritionTargets({ age, gender, height, weight, goal, medicalConditions });
  const diseaseRules = generateDiseaseRules(medicalConditions);

  return {
    rawInput: { age, gender, height, weight, goal, dietPreference, medicalConditions, allergies, pantryItems },
    biometrics,
    targets,
    diseaseRules
  };
}
