const mealPlannerService = require('./mealPlannerService');

let masterIngredientList = [];
let masterIngredientMap = new Map();
let categorizedMap = {};

// Category definitions with icons
const CATEGORY_META = {
  'Vegetables': { name: 'Vegetables & Produce', icon: '🥕', priority: 1 },
  'LeafyGreens': { name: 'Leafy Greens', icon: '🥬', priority: 2 },
  'Fruits': { name: 'Fruits', icon: '🍎', priority: 3 },
  'Grains': { name: 'Grains & Staples', icon: '🌾', priority: 4 },
  'Pulses': { name: 'Pulses & Lentils', icon: '🫘', priority: 5 },
  'Dairy': { name: 'Dairy & Protein', icon: '🥛', priority: 6 },
  'Spices': { name: 'Spices & Seasonings', icon: '🌶️', priority: 7 },
  'Oils': { name: 'Oils & Fats', icon: '🫒', priority: 8 },
  'Meat': { name: 'Meat & Poultry', icon: '🍗', priority: 9 },
  'Seafood': { name: 'Seafood', icon: '🐟', priority: 10 },
  'Beverages': { name: 'Beverages', icon: '🥤', priority: 11 },
  'Nuts': { name: 'Nuts & Seeds', icon: '🥜', priority: 12 }
};

// Keyword mapping rules for automatic categorization & icons
function categorizeItem(name) {
  const n = name.toLowerCase();

  // 1. Leafy Greens
  if (/\b(spinach|palak|methi|fenugreek|coriander|cilantro|curry leaves|mint|basil|lettuce|greens)\b/.test(n)) {
    return { categoryKey: 'LeafyGreens', icon: '🥬' };
  }
  // 2. Fruits
  if (/\b(apple|banana|guava|kiwi|strawberry|strawberries|blueberry|blueberries|berry|berries|pomegranate|lemon|tamarind|avocado)\b/.test(n)) {
    return { categoryKey: 'Fruits', icon: '🍎' };
  }
  // 3. Leafy Greens / Veggies
  if (/\b(tomato|tomatoes|potato|potatoes|onion|onions|garlic|ginger|capsicum|bell pepper|bell peppers|carrot|carrots|beans|broccoli|cabbage|cauliflower|mushroom|mushrooms|eggplant|baingan|bhindi|okra|gourd|lauki|doodhi|pumpkin|beetroot|sweet potato|turnip|cucumber|drumstick|corn|peas|chili|chillies|chili paste)\b/.test(n)) {
    return { categoryKey: 'Vegetables', icon: '🥕' };
  }
  // 4. Grains & Staples
  if (/\b(atta|flour|wheat|rice|oats|quinoa|bajra|millet|jowar|ragi|dalia|rava|semolina|puffed rice|bread|appam|noodles|cornflour|crumbs)\b/.test(n)) {
    return { categoryKey: 'Grains', icon: '🌾' };
  }
  // 5. Pulses & Beans
  if (/\b(dal|moong|chana|chickpea|chickpeas|rajma|kidney beans|toor|matki|moth|masoor|black beans|soybean|soybeans|soya|soya chunks|sprouts|sprouted)\b/.test(n)) {
    return { categoryKey: 'Pulses', icon: '🫘' };
  }
  // 6. Dairy & Protein
  if (/\b(paneer|cottage cheese|tofu|curd|yogurt|milk|almond milk|soy milk|cream|ghee|butter|egg|eggs)\b/.test(n)) {
    return { categoryKey: 'Dairy', icon: '🥛' };
  }
  // 7. Spices & Seasonings
  if (/\b(turmeric|cumin|mustard seeds|ajwain|carom|pepper|garam masala|masala|hing|asafoetida|cinnamon|cardamom|cloves|anise|spices|salt|vanilla|rosemary|paprika|oregano|curry powder|powder)\b/.test(n)) {
    return { categoryKey: 'Spices', icon: '🌶️' };
  }
  // 8. Oils & Fats
  if (/\b(oil|mustard oil|olive oil|sunflower oil|sesame oil|avocado oil|coconut milk)\b/.test(n)) {
    return { categoryKey: 'Oils', icon: '🫒' };
  }
  // 9. Meat & Poultry
  if (/\b(chicken|mutton|beef|pork|turkey)\b/.test(n)) {
    return { categoryKey: 'Meat', icon: '🍗' };
  }
  // 10. Seafood
  if (/\b(fish|prawns|shrimp|salmon|rahu|katla)\b/.test(n)) {
    return { categoryKey: 'Seafood', icon: '🐟' };
  }
  // 11. Beverages
  if (/\b(coconut water|water|broth|stock|juice|tea|coffee)\b/.test(n)) {
    return { categoryKey: 'Beverages', icon: '🥤' };
  }
  // 12. Nuts & Seeds
  if (/\b(almonds|chia|flaxseeds|sunflower seeds|pumpkin seeds|sesame seeds|makhana|fox nuts|nuts|cashews|walnuts)\b/.test(n)) {
    return { categoryKey: 'Nuts', icon: '🥜' };
  }

  return { categoryKey: 'Vegetables', icon: '🥗' };
}

/**
 * Initializes and caches the Master Ingredient Database from Excel dishes
 */
function buildMasterIngredientDatabase() {
  masterIngredientList = [];
  masterIngredientMap = new Map();
  categorizedMap = {};

  try {
    const fs = require('fs');
    const path = require('path');
    const xlsx = require('xlsx');

    const file = path.join(__dirname, '..', '..', 'smart_food_dish_management_data.xlsx');
    if (fs.existsSync(file)) {
      const wb = xlsx.readFile(file);
      if (wb.Sheets['Ingredients_Master']) {
        const rows = xlsx.utils.sheet_to_json(wb.Sheets['Ingredients_Master']);
        rows.forEach((r, idx) => {
          const name = r['Ingredient Name'] || r.name;
          if (!name) return;
          const { categoryKey, icon } = categorizeItem(name);
          const categoryName = r['Category'] || (CATEGORY_META[categoryKey] ? CATEGORY_META[categoryKey].name : 'Vegetables & Produce');

          const item = {
            id: r['Ingredient ID'] || `ing-${idx + 1}`,
            name: name.trim(),
            categoryKey,
            categoryName,
            icon,
            calories: r['Calories kcal'] || 0,
            protein: r['Protein g'] || 0,
            carbs: r['Carbs g'] || 0,
            fat: r['Fat g'] || 0,
            fiber: r['Fiber g'] || 0,
            allergens: r['Allergens'] || 'None',
            season: r['Season'] || 'All Season',
            shelfLife: r['Shelf Life'] || '30 Days',
            normalized: name.toLowerCase().trim()
          };

          masterIngredientList.push(item);
          masterIngredientMap.set(item.normalized, item);

          if (!categorizedMap[categoryName]) {
            categorizedMap[categoryName] = {
              categoryKey,
              categoryName,
              icon: CATEGORY_META[categoryKey] ? CATEGORY_META[categoryKey].icon : '🥗',
              priority: CATEGORY_META[categoryKey] ? CATEGORY_META[categoryKey].priority : 99,
              ingredients: []
            };
          }
          categorizedMap[categoryName].ingredients.push(item);
        });

        console.log(`[IngredientService] Loaded ${masterIngredientList.length} master ingredients from Ingredients_Master sheet across ${Object.keys(categorizedMap).length} categories.`);
        return masterIngredientList;
      }
    }
  } catch (err) {
    console.error('[IngredientService] Failed to load Ingredients_Master sheet:', err);
  }

  // Fallback if sheet not present
  const dishes = mealPlannerService.loadDatabase();
  const rawSet = new Set();
  dishes.forEach(d => {
    if (Array.isArray(d.ingredients)) {
      d.ingredients.forEach(i => {
        const cleaned = i.trim();
        if (cleaned) rawSet.add(cleaned);
      });
    }
  });

  const sortedRaw = Array.from(rawSet).sort();
  sortedRaw.forEach((name, idx) => {
    const { categoryKey, icon } = categorizeItem(name);
    const categoryInfo = CATEGORY_META[categoryKey] || { name: 'Vegetables & Produce', icon: '🥗' };

    const item = {
      id: `ing-${idx + 1}`,
      name,
      categoryKey,
      categoryName: categoryInfo.name,
      icon,
      normalized: name.toLowerCase().trim()
    };

    masterIngredientList.push(item);
    masterIngredientMap.set(item.normalized, item);

    if (!categorizedMap[categoryInfo.name]) {
      categorizedMap[categoryInfo.name] = {
        categoryKey,
        categoryName: categoryInfo.name,
        icon: categoryInfo.icon,
        priority: categoryInfo.priority,
        ingredients: []
      };
    }
    categorizedMap[categoryInfo.name].ingredients.push(item);
  });

  console.log(`[IngredientService] Fallback Master Ingredient Database initialized with ${masterIngredientList.length} unique items.`);
  return masterIngredientList;
}

/**
 * Returns all master ingredients
 */
function getMasterIngredients() {
  if (masterIngredientList.length === 0) {
    buildMasterIngredientDatabase();
  }
  return masterIngredientList;
}

/**
 * Returns ingredients grouped by category
 */
function getCategorizedIngredients() {
  if (masterIngredientList.length === 0) {
    buildMasterIngredientDatabase();
  }
  return Object.values(categorizedMap).sort((a, b) => a.priority - b.priority);
}

/**
 * Search autocomplete ingredients against master database
 */
function searchIngredients(query = '', category = 'All') {
  const all = getMasterIngredients();
  const q = (query || '').trim().toLowerCase();

  return all.filter(item => {
    const matchCategory = (category === 'All' || item.categoryName === category || item.categoryKey === category);
    if (!matchCategory) return false;

    if (!q) return true;

    // Strict prefix & partial match
    return item.normalized.includes(q) || item.name.toLowerCase().includes(q);
  }).slice(0, 30);
}

/**
 * Validates if an ingredient exists in the master dataset
 */
function validateIngredient(name) {
  if (!name || typeof name !== 'string') return false;
  const normalized = name.toLowerCase().trim();
  if (masterIngredientMap.size === 0) buildMasterIngredientDatabase();

  if (masterIngredientMap.has(normalized)) return true;

  // Check substring or exact case-insensitive match
  for (const item of masterIngredientList) {
    if (item.normalized === normalized || item.name.toLowerCase() === normalized) {
      return true;
    }
  }

  return false;
}

/**
 * Returns smart pairing suggestions based on active pantry items
 */
function getSmartPairings(activePantry = []) {
  if (masterIngredientList.length === 0) buildMasterIngredientDatabase();

  const activeSet = new Set(activePantry.map(i => typeof i === 'string' ? i.toLowerCase().trim() : (i.name || '').toLowerCase().trim()));

  const PAIRING_RULES = [
    { trigger: 'tomato', suggest: ['Onion', 'Garlic', 'Capsicum', 'Paneer', 'Ginger-Garlic', 'Cumin'] },
    { trigger: 'potato', suggest: ['Onion', 'Green Chili', 'Turmeric', 'Cumin', 'Peas', 'Besan'] },
    { trigger: 'paneer', suggest: ['Tomato', 'Capsicum', 'Spinach', 'Garlic', 'Butter', 'Cream'] },
    { trigger: 'rice', suggest: ['Moong Dal', 'Toor Dal', 'Mustard Seeds', 'Curry Leaves', 'Cumin'] },
    { trigger: 'spinach', suggest: ['Paneer', 'Tofu', 'Garlic', 'Corn', 'Onion', 'Tomato'] },
    { trigger: 'oats', suggest: ['Spinach', 'Carrots', 'Peas', 'Mustard Seeds', 'Curd'] },
    { trigger: 'chickpeas', suggest: ['Onion', 'Tomato', 'Garlic', 'Chole Masala', 'Lemon Juice'] }
  ];

  const suggestionsSet = new Set();
  PAIRING_RULES.forEach(rule => {
    if (activeSet.has(rule.trigger)) {
      rule.suggest.forEach(s => {
        if (!activeSet.has(s.toLowerCase().trim()) && validateIngredient(s)) {
          const item = masterIngredientMap.get(s.toLowerCase().trim()) || masterIngredientList.find(i => i.name === s);
          if (item) suggestionsSet.add(item);
        }
      });
    }
  });

  return Array.from(suggestionsSet).slice(0, 6);
}

module.exports = {
  buildMasterIngredientDatabase,
  getMasterIngredients,
  getCategorizedIngredients,
  searchIngredients,
  validateIngredient,
  getSmartPairings
};
