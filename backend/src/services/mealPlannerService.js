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
      
      if (targetMeal === 'breakfast' && !dishMealType.includes('breakfast')) continue;
      if (targetMeal === 'lunch' && !dishMealType.includes('lunch') && !dishMealType.includes('main')) continue;
      if (targetMeal === 'dinner' && !dishMealType.includes('dinner') && !dishMealType.includes('main')) continue;
      if ((targetMeal === 'snacks' || targetMeal === 'snack') && !dishMealType.includes('snack') && !dishMealType.includes('beverage')) continue;
      if (targetMeal === 'postworkout' && dish.protein < 15) continue;
      if (targetMeal === 'preworkout' && dish.carbs < 25) continue;
      if (targetMeal === 'cheatmeal' && dish.calories < 350) continue;
    }

    // 5. Medical Conditions Strict Exclusion (STRICT MEDICAL COMPLIANCE)
    if (medicalConditions && medicalConditions.length > 0) {
      let isMedicalIncompatible = false;
      if (medicalConditions.includes('Diabetes') && !dish.diabetesFriendly) isMedicalIncompatible = true;
      if (medicalConditions.includes('Hypertension') && !dish.hypertensionFriendly) isMedicalIncompatible = true;
      if ((medicalConditions.includes('Heart Disease') || medicalConditions.includes('High Cholesterol')) && !dish.heartHealthy) isMedicalIncompatible = true;
      if (medicalConditions.includes('Kidney Disease') && !dish.kidneyDiseaseFriendly) isMedicalIncompatible = true;
      if ((medicalConditions.includes('Obesity') || medicalConditions.includes('Weight Loss')) && !dish.weightManagementFriendly) isMedicalIncompatible = true;
      if (medicalConditions.includes('PCOS') && !dish.pcosFriendly) isMedicalIncompatible = true;
      if (medicalConditions.includes('Thyroid Disorders') && !dish.thyroidFriendly) isMedicalIncompatible = true;
      if (medicalConditions.includes('Anemia') && !dish.anemiaFriendly) isMedicalIncompatible = true;
      if (medicalConditions.includes('Gout') && !dish.goutFriendly) isMedicalIncompatible = true;

      // Skip non-friendly dishes for medical safety!
      if (isMedicalIncompatible) continue;
    }

    // 6. Cuisine Filter
    if (cuisine && cuisine !== 'All') {
      if (dish.cuisine.toLowerCase() !== cuisine.toLowerCase()) continue;
    }

    // ── HEALTHIFYME-GRADE MULTI-WEIGHTED SCORING ENGINE ────────────────────────
    const { scoreRecipeServer } = require('./aiRecommendationEngine');
    const scoredResult = scoreRecipeServer(dish, userPayload);
    if (!scoredResult) continue; // Allergen disqualified

    scoredDishes.push({
      ...dish,
      explanationBadges
    });
  }

  // Sort by highest Overall Match %, then highest Ingredient Match %
  scoredDishes.sort((a, b) => {
    if (b.overallMatchPct !== a.overallMatchPct) {
      return b.overallMatchPct - a.overallMatchPct;
    }
    if (b.ingredientMatchPct !== a.ingredientMatchPct) {
      return b.ingredientMatchPct - a.ingredientMatchPct;
    }
    return b.protein - a.protein;
  });

  // Ensure diversity: Interleave dishes with different main ingredients/categories
  const finalDiverseList = [];
  const seenPrefixes = new Map();

  for (const d of scoredDishes) {
    const mainWord = d.name.split(' ')[0].toLowerCase();
    const count = seenPrefixes.get(mainWord) || 0;
    if (count < 3) { // Max 3 dishes starting with the same word (e.g. Chicken, Paneer, Oats)
      finalDiverseList.push(d);
      seenPrefixes.set(mainWord, count + 1);
    }
  }

  // Guarantee at least 10 recommendations for narrow cuisine/meal slot filters
  if (finalDiverseList.length < 10 && (cuisine !== 'All' || (mealType && mealType !== 'All'))) {
    const fallbackDishes = recommendDishes({
      ...userPayload,
      cuisine: 'All', // Relax single cuisine constraint
      mealType: 'All' // Relax strict meal slot constraint if needed
    });

    for (const fb of fallbackDishes) {
      if (finalDiverseList.length >= 15) break;
      if (!finalDiverseList.some(x => x.id === fb.id || x.name === fb.name)) {
        finalDiverseList.push({
          ...fb,
          explanationBadges: [
            ...fb.explanationBadges,
            '💡 Healthy Regional Recommendation'
          ]
        });
      }
    }
  }

  return finalDiverseList;
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

/**
 * Parses user natural language intent into structured parameters
 */
function parseUserIntent(promptText = '', payload = {}) {
  let text = (promptText || payload.text || payload.query || '').toLowerCase().trim();
  const rawIngredients = payload.ingredients || [];
  
  const detectedIngredients = [...new Set(rawIngredients.map(i => i.toLowerCase().trim()))];

  const commonDict = ['egg', 'eggs', 'spinach', 'cheese', 'paneer', 'tomato', 'tomatoes', 'onion', 'onions', 'rice', 'chicken', 'dal', 'oats', 'garlic', 'quinoa', 'tofu', 'potato', 'potatoes', 'mustard oil', 'curd', 'milk', 'flour', 'atta', 'chana'];

  commonDict.forEach(item => {
    if (text.includes(item)) {
      const normalized = item.replace(/s$/, '');
      if (!detectedIngredients.includes(normalized)) {
        detectedIngredients.push(normalized);
      }
    }
  });

  let maxPrepTime = payload.max_prep_time || payload.maxPrepTime || null;
  if (!maxPrepTime) {
    const timeMatch = text.match(/under\s+(\d+)\s*min/i) || text.match(/(\d+)\s*mins?/i) || text.match(/(\d+)\s*minutes?/i);
    if (timeMatch) {
      maxPrepTime = parseInt(timeMatch[1], 10);
    } else {
      maxPrepTime = 30; // Default to 30 mins if vague/unspecified
    }
  }

  const dietaryRestrictions = payload.dietary_restrictions || payload.dietaryRestrictions || [];
  if (text.includes('veg') && !text.includes('non-veg')) dietaryRestrictions.push('Vegetarian');
  if (text.includes('vegan')) dietaryRestrictions.push('Vegan');
  if (text.includes('jain')) dietaryRestrictions.push('Jain');
  if (text.includes('high protein') || text.includes('protein')) dietaryRestrictions.push('High Protein');

  let mealType = payload.meal_type || payload.mealType || null;
  if (!mealType) {
    if (text.includes('breakfast')) mealType = 'breakfast';
    else if (text.includes('lunch')) mealType = 'lunch';
    else if (text.includes('dinner')) mealType = 'dinner';
    else if (text.includes('snack')) mealType = 'snack';
  }

  return {
    ingredients: detectedIngredients,
    max_prep_time: maxPrepTime,
    dietary_restrictions: [...new Set(dietaryRestrictions)],
    meal_type: mealType
  };
}

function formatRecipePayload(dish, optionType) {
  const formattedIngredients = (dish.ingredients || []).map(ing => {
    if (typeof ing === 'string') {
      return { name: ing, amount: '1', unit: 'serving' };
    }
    return {
      name: ing.name || 'Ingredient',
      amount: String(ing.amount || '1'),
      unit: ing.unit || 'pcs'
    };
  });

  const formattedInstructions = Array.isArray(dish.instructions) 
    ? dish.instructions 
    : [dish.instructions || 'Prepare ingredients and cook on medium flame until tender.'];

  return {
    id: String(dish.id || `rec-${Math.random().toString(36).substr(2, 6)}`),
    title: dish.name || dish.title || 'Delicious Meal Option',
    description: dish.description || `${dish.cuisine || 'Regional'} ${dish.mealType || 'Meal'} high in nutrients and balanced macros.`,
    prep_time_minutes: Number(dish.prepTimeMin || dish.prepTime || dish.cookTimeMin || 15),
    calories: Number(dish.calories || dish.macros?.calories || 250),
    protein_grams: Number(dish.protein || dish.macros?.protein || 12),
    dietary_tags: Array.isArray(dish.suitableFor) ? dish.suitableFor : [dish.dietType || 'Healthy'],
    ingredients: formattedIngredients,
    instructions: formattedInstructions,
    option_type: optionType
  };
}

function suggestRecipes(userInputPayload = {}) {
  const allDishes = loadDatabase();
  const parsedIntent = parseUserIntent(userInputPayload.prompt || userInputPayload.text, userInputPayload);

  const scored = allDishes.map(dish => {
    const prepTime = Number(dish.prepTimeMin || dish.prepTime || 15);
    const dishIngs = (dish.ingredients || []).map(i => typeof i === 'string' ? i.toLowerCase() : (i.name || '').toLowerCase());
    
    let matchedCount = 0;
    if (parsedIntent.ingredients.length > 0) {
      dishIngs.forEach(ding => {
        if (parsedIntent.ingredients.some(ping => ding.includes(ping) || ping.includes(ding))) {
          matchedCount++;
        }
      });
    }

    const matchRatio = dishIngs.length > 0 ? (matchedCount / dishIngs.length) : 0.5;
    
    let score = matchRatio * 50;
    if (parsedIntent.max_prep_time && prepTime <= parsedIntent.max_prep_time) {
      score += 30;
    }
    
    return { dish, score, matchRatio, prepTime, protein: Number(dish.protein || 10) };
  });

  let candidates = scored.filter(s => s.matchRatio >= 0.6 || parsedIntent.ingredients.length === 0);
  if (candidates.length === 0) {
    candidates = scored;
  }

  candidates.sort((a, b) => b.score - a.score);

  const quickCandidate = [...candidates].sort((a, b) => a.prepTime - b.prepTime)[0]?.dish || candidates[0]?.dish || allDishes[0];

  const proteinCandidates = candidates.filter(c => c.dish.id !== quickCandidate.id);
  const proteinCandidate = [...(proteinCandidates.length ? proteinCandidates : candidates)].sort((a, b) => b.protein - a.protein)[0]?.dish || candidates[1]?.dish || allDishes[1];

  const balancedCandidates = candidates.filter(c => c.dish.id !== quickCandidate.id && c.dish.id !== proteinCandidate.id);
  const balancedCandidate = balancedCandidates[0]?.dish || candidates[2]?.dish || allDishes[2];

  const suggestions = [
    formatRecipePayload(quickCandidate, 'Quick & Easy'),
    formatRecipePayload(proteinCandidate, 'High Protein / Healthy'),
    formatRecipePayload(balancedCandidate, 'Balanced / Chef Choice')
  ].slice(0, 3);

  return {
    parsed_intent: {
      ingredients_detected: parsedIntent.ingredients,
      max_prep_time: parsedIntent.max_prep_time
    },
    suggestions
  };
}

module.exports = {
  loadDatabase,
  recommendDishes,
  generateMealPlan,
  getDatasetStats,
  getSmartSubstitutions,
  suggestRecipes
};
