const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Global in-memory cache for parsed Excel dishes
let dishesCache = [];
let pantryMasterList = [];
let isLoaded = false;

// Fallback images curated for cuisines and categories
const CUISINE_IMAGES = {
  'North Indian': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  'South Indian': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
  'Gujarati': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  'Punjabi': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
  'Rajasthani': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
  'Maharashtrian': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'Bengali': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  'Indo-Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  'Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
  'Default': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
};

// Smart Ingredient Substitution mapping dictionary
const SUBSTITUTIONS_MAP = {
  'butter': ['Olive Oil', 'Desi Ghee', 'Avocado Oil'],
  'paneer': ['Tofu', 'Soya Chunks', 'Low-fat Cottage Cheese'],
  'milk': ['Soy Milk', 'Almond Milk', 'Oat Milk', 'Low-fat Curd'],
  'curd': ['Plant-based Soy Yogurt', 'Almond Yogurt'],
  'sugar': ['Jaggery', 'Stevia', 'Date Syrup', 'Honey'],
  'atta': ['Bajra Flour', 'Jowar Flour', 'Multigrain Flour', 'Oats Flour'],
  'wheat': ['Millet', 'Quinoa', 'Brown Rice'],
  'white rice': ['Brown Rice', 'Quinoa', 'Foxtail Millet'],
  'chicken': ['Tofu', 'Mushroom', 'Soya Chunks'],
  'egg': ['Mashed Banana', 'Flaxseed Meal', 'Tofu Scramble'],
  'potato': ['Sweet Potato', 'Raw Banana', 'Turnip'],
  'peanut': ['Sunflower Seeds', 'Pumpkin Seeds', 'Sesame Paste']
};

/**
 * Loads Excel database file from standard locations on startup
 */
function loadDatabase() {
  if (isLoaded && dishesCache.length > 0) {
    return dishesCache;
  }

  const possiblePaths = [
    path.join(__dirname, '../../smart_food_dish_management_data.xlsx'),
    path.join(__dirname, '../smart_food_dish_management_data.xlsx'),
    path.join(process.cwd(), 'smart_food_dish_management_data.xlsx'),
    path.join(process.cwd(), 'Smart_Food_Management_Dish_Database-1.xlsx'),
    path.join(__dirname, '../../Smart_Food_Management_Dish_Database-1.xlsx')
  ];

  let targetPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    console.error('[MealPlannerService] Error: Excel dataset file not found in paths:', possiblePaths);
    return [];
  }

  try {
    console.log(`[MealPlannerService] Loading dataset from: ${targetPath}`);
    const wb = xlsx.readFile(targetPath);
    
    // Load Dishes_Database sheet
    const dishSheet = wb.Sheets['Dishes_Database'];
    if (dishSheet) {
      const rawRows = xlsx.utils.sheet_to_json(dishSheet);
      dishesCache = rawRows.map(row => processDishRow(row));
      console.log(`[MealPlannerService] Successfully cached ${dishesCache.length} dishes.`);
    }

    // Load Pantry_Master_List sheet if present
    const pantrySheet = wb.Sheets['Pantry_Master_List'];
    if (pantrySheet) {
      pantryMasterList = xlsx.utils.sheet_to_json(pantrySheet);
      console.log(`[MealPlannerService] Cached ${pantryMasterList.length} pantry items.`);
    }

    isLoaded = true;
    return dishesCache;
  } catch (err) {
    console.error('[MealPlannerService] Error parsing Excel file:', err);
    return [];
  }
}

/**
 * Pre-processes and normalizes a raw dish row from Excel
 */
function processDishRow(row) {
  const rawIngredientsStr = row['Key Ingredients Pantry'] || '';
  const ingredientList = rawIngredientsStr
    ? rawIngredientsStr.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  const prepTime = Number(row['Prep Time Min']) || 15;
  const cookTime = Number(row['Cook Time Min']) || 20;
  const totalTime = prepTime + cookTime;

  const cuisine = row['Cuisine'] || 'Indian';
  const category = row['Category'] || 'Main Course';
  
  // Assign high resolution image based on cuisine or category
  const image = CUISINE_IMAGES[cuisine] || CUISINE_IMAGES[category] || CUISINE_IMAGES['Default'];

  return {
    id: row['Dish ID'] || `D-${Math.random().toString(36).substr(2, 9)}`,
    name: row['Dish Name'] || 'Unknown Dish',
    cuisine,
    mealType: row['Meal Type'] || 'Lunch/Dinner',
    category,
    dietType: row['Diet Type'] || 'Vegetarian',
    isVegan: (row['Is Vegan'] || '').trim().toLowerCase() === 'yes',
    spiceLevel: row['Spice Level'] || 'Medium',
    difficulty: row['Difficulty'] || 'Medium',
    prepTimeMin: prepTime,
    cookTimeMin: cookTime,
    totalTimeMin: totalTime,
    servings: Number(row['Servings']) || 2,
    ingredientsStr: rawIngredientsStr,
    ingredients: ingredientList,
    
    // Macros & Micros
    calories: Number(row['Calories kcal']) || 250,
    protein: Number(row['Protein g']) || 10,
    carbs: Number(row['Carbs g']) || 30,
    fat: Number(row['Fat g']) || 8,
    fiber: Number(row['Fiber g']) || 4,
    sugar: Number(row['Sugar g']) || 2,
    sodium: Number(row['Sodium mg']) || 300,

    // Allergen Flags
    containsGluten: (row['Contains Gluten'] || '').trim().toLowerCase() === 'yes',
    containsDairy: (row['Contains Dairy'] || '').trim().toLowerCase() === 'yes',
    containsNuts: (row['Contains Nuts'] || '').trim().toLowerCase() === 'yes',
    containsSoy: (row['Contains Soy'] || '').trim().toLowerCase() === 'yes',
    containsEgg: (row['Contains Egg'] || '').trim().toLowerCase() === 'yes',
    containsFish: (row['Contains Fish'] || '').trim().toLowerCase() === 'yes',
    containsShellfish: (row['Contains Shellfish'] || '').trim().toLowerCase() === 'yes',

    // Medical & Disease Compatibility Flags
    diabetesFriendly: (row['Diabetes Friendly'] || '').trim().toLowerCase() === 'yes',
    hypertensionFriendly: (row['Hypertension Friendly'] || '').trim().toLowerCase() === 'yes',
    heartHealthy: (row['Heart Healthy'] || '').trim().toLowerCase() === 'yes',
    kidneyDiseaseFriendly: (row['Kidney Disease Friendly'] || '').trim().toLowerCase() === 'yes',
    weightManagementFriendly: (row['Weight Management Friendly'] || '').trim().toLowerCase() === 'yes',
    pcosFriendly: (row['PCOS PCOD Friendly'] || '').trim().toLowerCase() === 'yes',
    thyroidFriendly: (row['Thyroid Friendly'] || '').trim().toLowerCase() === 'yes',
    anemiaFriendly: (row['Anemia Friendly'] || '').trim().toLowerCase() === 'yes',
    goutFriendly: (row['Gout Friendly'] || '').trim().toLowerCase() === 'yes',

    // Age Suitability Flags
    suitableToddlers: (row['Suitable For Toddlers 1 3yrs'] || '').trim().toLowerCase() === 'yes',
    suitableChildren: (row['Suitable For Children 4 12yrs'] || '').trim().toLowerCase() === 'yes',
    suitableTeensAdults: (row['Suitable For Teens Adults'] || '').trim().toLowerCase() === 'yes',
    suitableSeniors: (row['Suitable For Seniors 60plus'] || '').trim().toLowerCase() === 'yes',

    image,
    costEstimate: Math.floor(40 + (Number(row['Protein g']) || 10) * 3)
  };
}

/**
 * Normalizes an ingredient string for comparison
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(fresh|cooked|raw|chopped|grated|sliced|powder|seed|seeds|leaves|whole|low-fat|fat-free|pieces|pcs|kg|g)\b/g, '')
    .trim();
}

/**
 * Checks if two ingredient names match (exact or partial/synonym)
 */
function checkIngredientMatch(pantryItem, dishIngredient) {
  const pNorm = normalizeString(pantryItem);
  const dNorm = normalizeString(dishIngredient);

  if (!pNorm || !dNorm) return false;

  // Direct substring or match
  if (pNorm === dNorm || dNorm.includes(pNorm) || pNorm.includes(dNorm)) {
    return true;
  }

  // Synonym / Stemmed word matches
  const synonyms = [
    ['paneer', 'cottage cheese', 'tofu'],
    ['atta', 'wheat', 'flour'],
    ['curd', 'dahi', 'yogurt'],
    ['moong', 'green gram', 'sprouts'],
    ['capsicum', 'bell pepper', 'shimla mirch'],
    ['methi', 'fenugreek'],
    ['palak', 'spinach'],
    ['lauki', 'bottle gourd', 'doodhi'],
    ['aloo', 'potato'],
    ['pyaz', 'onion'],
    ['tamatar', 'tomato'],
    ['chawal', 'rice'],
    ['dal', 'lentil', 'pulse']
  ];

  for (const synGroup of synonyms) {
    const matchesP = synGroup.some(s => pNorm.includes(s));
    const matchesD = synGroup.some(s => dNorm.includes(s));
    if (matchesP && matchesD) return true;
  }

  return false;
}

/**
 * Finds substitution recommendations for a missing ingredient
 */
function getSmartSubstitutions(ingredient) {
  const norm = normalizeString(ingredient);
  for (const key of Object.keys(SUBSTITUTIONS_MAP)) {
    if (norm.includes(key)) {
      return SUBSTITUTIONS_MAP[key];
    }
  }
  return ['Healthy Alternative / Plant-based option'];
}

/**
 * Recommends and ranks dishes based on user's pantry, medical profile, and filters
 */
function recommendDishes(userPayload = {}) {
  const allDishes = loadDatabase();
  if (!allDishes || allDishes.length === 0) return [];

  const {
    pantryItems = [],
    medicalConditions = [],
    allergies = [],
    dietPreference = 'All',
    mealType = 'All',
    cuisine = 'All',
    maxCookTime = 60,
    searchQuery = '',
    healthGoal = 'Maintenance'
  } = userPayload;

  const userPantryList = Array.isArray(pantryItems)
    ? pantryItems.map(p => typeof p === 'string' ? p : (p.name || ''))
    : [];

  const lowerSearch = (searchQuery || '').trim().toLowerCase();

  const scoredDishes = [];

  for (const dish of allDishes) {
    // ── HARD EXCLUSION FILTERS ────────────────────────────────────────────────
    
    // 1. Search Query Filter (Intelligent Partial Match)
    if (lowerSearch) {
      const matchName = dish.name.toLowerCase().includes(lowerSearch);
      const matchCuisine = dish.cuisine.toLowerCase().includes(lowerSearch);
      const matchIngredient = dish.ingredients.some(i => i.toLowerCase().includes(lowerSearch));
      const matchCategory = dish.category.toLowerCase().includes(lowerSearch);
      
      if (!matchName && !matchCuisine && !matchIngredient && !matchCategory) {
        continue;
      }
    }

    // 2. Allergy Filter (STRICT EXCLUSION)
    if (allergies.length > 0) {
      let isAllergic = false;
      if (allergies.includes('Gluten') && dish.containsGluten) isAllergic = true;
      if (allergies.includes('Dairy') && dish.containsDairy) isAllergic = true;
      if (allergies.includes('Peanut') && dish.containsNuts) isAllergic = true;
      if (allergies.includes('Soy') && dish.containsSoy) isAllergic = true;
      if (allergies.includes('Egg') && dish.containsEgg) isAllergic = true;
      if (allergies.includes('Fish') && dish.containsFish) isAllergic = true;
      if (allergies.includes('Shellfish') && dish.containsShellfish) isAllergic = true;

      if (isAllergic) continue; // Skip dish completely
    }

    // 3. Diet Preference Filter (STRICT EXCLUSION)
    if (dietPreference && dietPreference !== 'All') {
      if (dietPreference === 'Vegan' && !dish.isVegan) continue;
      if (dietPreference === 'Vegetarian' && dish.dietType === 'Non-Vegetarian') continue;
      if (dietPreference === 'Jain') {
        const hasOnionGarlic = dish.ingredients.some(i => {
          const l = i.toLowerCase();
          return l.includes('onion') || l.includes('garlic') || l.includes('pyaz') || l.includes('lahsun');
        });
        if (hasOnionGarlic || dish.dietType === 'Non-Vegetarian') continue;
      }
    }

    // 4. Meal Type Filter
    if (mealType && mealType !== 'All') {
      const dishMealType = dish.mealType.toLowerCase();
      const targetMeal = mealType.toLowerCase();
      if (!dishMealType.includes(targetMeal) && !targetMeal.includes(dishMealType)) {
        // Allow fallback if mealType specifies snack / breakfast
        if (targetMeal === 'snacks' && !dishMealType.includes('snack')) continue;
        if (targetMeal === 'breakfast' && !dishMealType.includes('breakfast')) continue;
        if ((targetMeal === 'lunch' || targetMeal === 'dinner') && !dishMealType.includes('lunch') && !dishMealType.includes('dinner')) continue;
      }
    }

    // 5. Cuisine Filter
    if (cuisine && cuisine !== 'All') {
      if (dish.cuisine.toLowerCase() !== cuisine.toLowerCase()) continue;
    }

    // 6. Max Cook Time Filter
    if (maxCookTime && dish.totalTimeMin > maxCookTime) continue;

    // ── MATCHING & SCORING ALGORITHM ──────────────────────────────────────────

    // A. Ingredient Match Calculation
    const matchedIngredients = [];
    const missingIngredients = [];
    const missingWithSubstitutions = [];

    for (const reqIng of dish.ingredients) {
      let isFound = false;
      for (const pItem of userPantryList) {
        if (checkIngredientMatch(pItem, reqIng)) {
          isFound = true;
          break;
        }
      }

      if (isFound) {
        matchedIngredients.push(reqIng);
      } else {
        missingIngredients.push(reqIng);
        missingWithSubstitutions.push({
          ingredient: reqIng,
          substitutions: getSmartSubstitutions(reqIng)
        });
      }
    }

    const totalDishIngredientsCount = Math.max(1, dish.ingredients.length);
    const ingredientMatchPct = Math.round((matchedIngredients.length / totalDishIngredientsCount) * 100);

    // B. Disease Compatibility Calculation
    let satisfiedConditionsCount = 0;
    const activeConditionsCount = Math.max(1, medicalConditions.length);
    const suitableForTags = [];
    const avoidIfTags = [];

    if (medicalConditions.length > 0) {
      if (medicalConditions.includes('Diabetes')) {
        if (dish.diabetesFriendly) { satisfiedConditionsCount++; suitableForTags.push('Diabetes Friendly'); }
        else { avoidIfTags.push('High Glycemic Index'); }
      }
      if (medicalConditions.includes('Hypertension')) {
        if (dish.hypertensionFriendly) { satisfiedConditionsCount++; suitableForTags.push('Hypertension Friendly'); }
        else { avoidIfTags.push('High Sodium'); }
      }
      if (medicalConditions.includes('Heart Disease') || medicalConditions.includes('High Cholesterol')) {
        if (dish.heartHealthy) { satisfiedConditionsCount++; suitableForTags.push('Heart Healthy'); }
        else { avoidIfTags.push('High Saturated Fat'); }
      }
      if (medicalConditions.includes('Kidney Disease')) {
        if (dish.kidneyDiseaseFriendly) { satisfiedConditionsCount++; suitableForTags.push('Kidney Friendly'); }
        else { avoidIfTags.push('High Potassium / Sodium'); }
      }
      if (medicalConditions.includes('Obesity') || medicalConditions.includes('Weight Loss')) {
        if (dish.weightManagementFriendly) { satisfiedConditionsCount++; suitableForTags.push('Weight Loss Friendly'); }
      }
      if (medicalConditions.includes('PCOS')) {
        if (dish.pcosFriendly) { satisfiedConditionsCount++; suitableForTags.push('PCOS Friendly'); }
      }
      if (medicalConditions.includes('Thyroid Disorders')) {
        if (dish.thyroidFriendly) { satisfiedConditionsCount++; suitableForTags.push('Thyroid Friendly'); }
      }
      if (medicalConditions.includes('Anemia')) {
        if (dish.anemiaFriendly) { satisfiedConditionsCount++; suitableForTags.push('Iron Rich (Anemia)'); }
      }
      if (medicalConditions.includes('Gout')) {
        if (dish.goutFriendly) { satisfiedConditionsCount++; suitableForTags.push('Gout Friendly'); }
      }
      if (medicalConditions.includes('Senior Citizens')) {
        if (dish.suitableSeniors) suitableForTags.push('Senior Citizen Friendly');
      }
      if (medicalConditions.includes('Children')) {
        if (dish.suitableChildren) suitableForTags.push('Kids Friendly');
      }

      var diseaseCompPct = Math.round((satisfiedConditionsCount / activeConditionsCount) * 100);
    } else {
      var diseaseCompPct = 100;
      if (dish.diabetesFriendly) suitableForTags.push('Diabetes Friendly');
      if (dish.heartHealthy) suitableForTags.push('Heart Healthy');
    }

    // C. Allergy & Diet Compatibility
    const allergyCompPct = 100;

    // D. Nutritional Suitability (Based on Health Goal)
    let nutritionalPct = 70;
    if (healthGoal === 'Weight Loss' && dish.calories < 380 && dish.protein >= 12) nutritionalPct += 25;
    if (healthGoal === 'Muscle Building' && dish.protein >= 20) nutritionalPct += 30;
    if (healthGoal === 'High Fiber' && dish.fiber >= 5) nutritionalPct += 25;
    nutritionalPct = Math.min(100, nutritionalPct);

    // E. User Preference Score
    let prefPct = 70;
    if (dish.cuisine.toLowerCase() === (cuisine || '').toLowerCase()) prefPct += 20;
    prefPct = Math.min(100, prefPct);

    // F. Cooking Time Score
    const timePct = dish.totalTimeMin <= 25 ? 100 : (dish.totalTimeMin <= 40 ? 80 : 60);

    // G. OVERALL SCORE WEIGHTING FORMULA
    // 40% Ingredient Match + 20% Disease Comp + 15% Allergy Comp + 10% Nutritional + 10% User Pref + 5% Cooking Time
    const overallMatchPct = Math.round(
      (0.40 * ingredientMatchPct) +
      (0.20 * diseaseCompPct) +
      (0.15 * allergyCompPct) +
      (0.10 * nutritionalPct) +
      (0.10 * prefPct) +
      (0.05 * timePct)
    );

    // H. Waste Reduction Score
    const userPantryCount = Math.max(1, userPantryList.length);
    const wasteReductionPct = Math.min(100, Math.round((matchedIngredients.length / userPantryCount) * 100));

    // I. Smart Explanations Generator
    const explanationBadges = [];
    if (matchedIngredients.length > 0) {
      explanationBadges.push(`✔ Uses ${matchedIngredients.length} of your pantry items`);
    }
    if (dish.protein >= 15) {
      explanationBadges.push(`✔ High Protein (${dish.protein}g)`);
    }
    if (dish.diabetesFriendly) {
      explanationBadges.push(`✔ Diabetes Friendly`);
    }
    if (dish.hypertensionFriendly || dish.sodium < 400) {
      explanationBadges.push(`✔ Low Sodium / BP Friendly`);
    }
    if (dish.totalTimeMin <= 25) {
      explanationBadges.push(`✔ Quick Meal (Only ${dish.totalTimeMin} mins)`);
    }
    if (wasteReductionPct >= 50) {
      explanationBadges.push(`✔ Waste Reduction Score: ${wasteReductionPct}%`);
    }

    scoredDishes.push({
      ...dish,
      ingredientMatchPct,
      overallMatchPct,
      diseaseCompPct,
      wasteReductionPct,
      matchedIngredients,
      missingIngredients,
      missingWithSubstitutions,
      suitableForTags,
      avoidIfTags,
      explanationBadges
    });
  }

  // Sort by highest Overall Match %, then highest Ingredient Match %
  scoredDishes.sort((a, b) => {
    if (b.overallMatchPct !== a.overallMatchPct) {
      return b.overallMatchPct - a.overallMatchPct;
    }
    return b.ingredientMatchPct - a.ingredientMatchPct;
  });

  return scoredDishes;
}

/**
 * Generates a structured meal plan (Breakfast, Lunch, Dinner, Snacks) or 7-Day Plan
 */
function generateMealPlan(userPayload = {}) {
  const recommendations = recommendDishes({ ...userPayload, searchQuery: '', mealType: 'All' });
  
  if (userPayload.planType === 'Weekly') {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyPlan = [];
    let idx = 0;

    for (const day of days) {
      const b = recommendations.find(r => r.mealType.includes('Breakfast')) || recommendations[idx % recommendations.length];
      const l = recommendations.find(r => r.mealType.includes('Lunch') && r.id !== b?.id) || recommendations[(idx + 1) % recommendations.length];
      const d = recommendations.find(r => r.mealType.includes('Dinner') && r.id !== l?.id) || recommendations[(idx + 2) % recommendations.length];
      const s = recommendations.find(r => r.mealType.includes('Snack') && r.id !== d?.id) || recommendations[(idx + 3) % recommendations.length];

      weeklyPlan.push({
        day,
        breakfast: b,
        lunch: l,
        dinner: d,
        snack: s,
        totalCalories: (b?.calories || 0) + (l?.calories || 0) + (d?.calories || 0) + (s?.calories || 0),
        totalProtein: (b?.protein || 0) + (l?.protein || 0) + (d?.protein || 0) + (s?.protein || 0)
      });
      idx += 2;
    }
    return { type: 'Weekly', days: weeklyPlan };
  }

  // Daily Meal Plan
  const breakfastOptions = recommendations.filter(r => r.mealType.includes('Breakfast')).slice(0, 4);
  const lunchOptions = recommendations.filter(r => r.mealType.includes('Lunch') || r.mealType.includes('Main Course')).slice(0, 4);
  const dinnerOptions = recommendations.filter(r => r.mealType.includes('Dinner') || r.mealType.includes('Main Course')).slice(0, 4);
  const snackOptions = recommendations.filter(r => r.mealType.includes('Snack') || r.mealType.includes('Breakfast')).slice(0, 4);

  return {
    type: 'Daily',
    breakfast: breakfastOptions.length ? breakfastOptions : recommendations.slice(0, 3),
    lunch: lunchOptions.length ? lunchOptions : recommendations.slice(3, 6),
    dinner: dinnerOptions.length ? dinnerOptions : recommendations.slice(6, 9),
    snacks: snackOptions.length ? snackOptions : recommendations.slice(9, 12)
  };
}

/**
 * Returns dataset summary statistics
 */
function getDatasetStats() {
  const dishes = loadDatabase();
  const cuisines = [...new Set(dishes.map(d => d.cuisine))];
  const categories = [...new Set(dishes.map(d => d.category))];

  return {
    totalDishes: dishes.length,
    cuisines,
    categories,
    pantryMasterCount: pantryMasterList.length
  };
}

module.exports = {
  loadDatabase,
  recommendDishes,
  generateMealPlan,
  getDatasetStats,
  getSmartSubstitutions
};
