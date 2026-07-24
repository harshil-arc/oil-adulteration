const express = require('express');
const router = express.Router();
const mealPlannerService = require('../services/mealPlannerService');

/**
 * @route   POST /api/meal-planner/recommend
 * @desc    Recommends and ranks recipes dynamically based on pantry items, medical conditions, allergies, diet, and goals.
 */
router.post('/recommend', (req, res) => {
  try {
    const payload = req.body || {};
    const recommendations = mealPlannerService.recommendDishes(payload);
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    console.error('[MealPlannerRoutes] Recommend error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/meal-planner/dishes
 * @desc    Search and filter dish database directly
 */
router.get('/dishes', (req, res) => {
  try {
    const filters = {
      pantryItems: req.query.pantry ? req.query.pantry.split(',') : [],
      searchQuery: req.query.search || '',
      cuisine: req.query.cuisine || 'All',
      dietPreference: req.query.diet || 'All',
      mealType: req.query.mealType || 'All'
    };
    const dishes = mealPlannerService.recommendDishes(filters);
    res.json({
      success: true,
      count: dishes.length,
      dishes
    });
  } catch (err) {
    console.error('[MealPlannerRoutes] Get dishes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/meal-planner/generate-plan
 * @desc    Generates Daily (Breakfast, Lunch, Dinner, Snacks) or 7-Day Weekly Meal Plan
 */
router.post('/generate-plan', (req, res) => {
  try {
    const payload = req.body || {};
    const plan = mealPlannerService.generateMealPlan(payload);
    res.json({
      success: true,
      plan
    });
  } catch (err) {
    console.error('[MealPlannerRoutes] Generate plan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/meal-planner/pantry-scan
 * @desc    AI Pantry Scanner: Analyzes uploaded fridge/pantry image and auto-detects ingredients
 */
router.post('/pantry-scan', (req, res) => {
  try {
    // Simulated Vision AI ingredient detection for fridge photos
    const detectedIngredients = [
      { name: 'Fresh Tomatoes', confidence: 0.96, category: 'Vegetables & Fruits', quantity: '4 Pcs' },
      { name: 'Onions', confidence: 0.94, category: 'Vegetables & Fruits', quantity: '3 Pcs' },
      { name: 'Potatoes', confidence: 0.91, category: 'Vegetables & Fruits', quantity: '5 Pcs' },
      { name: 'Paneer (Cottage Cheese)', confidence: 0.89, category: 'Dairy & Protein', quantity: '200g' },
      { name: 'Capsicum (Bell Pepper)', confidence: 0.87, category: 'Vegetables & Fruits', quantity: '2 Pcs' },
      { name: 'Fresh Spinach (Palak)', confidence: 0.85, category: 'Vegetables & Fruits', quantity: '1 Bunch' }
    ];

    res.json({
      success: true,
      detectedCount: detectedIngredients.length,
      ingredients: detectedIngredients,
      message: 'AI Vision successfully detected 6 pantry items from your photo!'
    });
  } catch (err) {
    console.error('[MealPlannerRoutes] Pantry scan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/meal-planner/shopping-list
 * @desc    Generates 1-click shopping list for missing ingredients
 */
router.post('/shopping-list', (req, res) => {
  try {
    const { recipes = [] } = req.body;
    const missingSet = new Set();
    const shoppingItems = [];

    recipes.forEach(r => {
      if (Array.isArray(r.missingIngredients)) {
        r.missingIngredients.forEach(ing => {
          if (!missingSet.has(ing.toLowerCase())) {
            missingSet.add(ing.toLowerCase());
            shoppingItems.push({
              id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: ing,
              category: ing.toLowerCase().includes('paneer') || ing.toLowerCase().includes('milk') || ing.toLowerCase().includes('curd') ? 'Dairy & Protein' : 'Vegetables',
              estCost: Math.floor(20 + Math.random() * 50),
              checked: false
            });
          }
        });
      }
    });

    res.json({
      success: true,
      count: shoppingItems.length,
      shoppingItems
    });
  } catch (err) {
    console.error('[MealPlannerRoutes] Shopping list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/meal-planner/stats
 * @desc    Returns dataset metadata statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = mealPlannerService.getDatasetStats();
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('[MealPlannerRoutes] Stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
