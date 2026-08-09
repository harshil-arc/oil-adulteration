// Extensive Indian Regional Recipes & Disease-Aware Nutrition Database

export const REGIONS_LIST = [
  "North Indian", "South Indian", "Gujarati", "Punjabi", "Rajasthani",
  "Maharashtrian", "Bengali", "Odia", "Assamese", "Bihari",
  "Goan", "Hyderabadi", "Kashmiri", "Tamil", "Kerala",
  "Karnataka", "Telangana", "Northeast India"
];

export const DIET_PREFERENCES = [
  "Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Eggetarian"
];

export const SPECIAL_RESTRICTIONS = [
  "Halal Preference", "No Beef", "No Pork", "No Onion Garlic (Jain)"
];

export const HEALTH_GOALS_LIST = [
  "Weight Loss", "Weight Gain", "Muscle Building", "Fat Loss",
  "Healthy Lifestyle", "Maintenance", "Improve Immunity",
  "Improve Heart Health", "Improve Gut Health", "Increase Protein Intake"
];

export const MEDICAL_CONDITIONS = [
  { id: "Diabetes", label: "Diabetes (Type 1 & 2)", icon: "🩸", advice: "Low glycemic index, high soluble fiber, controlled carbs" },
  { id: "Hypertension", label: "Hypertension (High BP)", icon: "🫀", advice: "Low sodium (<500mg/meal), high potassium, DASH diet compliant" },
  { id: "PCOS", label: "PCOS / PCOD", icon: "🌸", advice: "Balanced complex carbs, high lean protein, anti-inflammatory" },
  { id: "High Cholesterol", label: "High Cholesterol / Dyslipidemia", icon: "❤️", advice: "Zero trans fat, high omega-3 & soluble fiber, low saturated fat" },
  { id: "Obesity", label: "Obesity / Weight Management", icon: "⚖️", advice: "Calorie deficit, high volume low-calorie foods, high satiety" },
  { id: "Fatty Liver", label: "Fatty Liver Disease (NAFLD)", icon: "🩺", advice: "Low refined sugar, high antioxidants, healthy unsaturated fats" },
  { id: "Kidney Disease", label: "Kidney Disease (CKD)", icon: "🧪", advice: "Controlled potassium & phosphorus, moderate high-quality protein" },
  { id: "Anemia", label: "Anemia (Iron Deficiency)", icon: "🩸", advice: "High non-heme & heme iron paired with Vitamin C for absorption" },
  { id: "Pregnancy", label: "Pregnancy & Lactation", icon: "🤰", advice: "Folate-rich, high calcium, iron, and adequate protein surplus" },
  { id: "Thyroid Disorders", label: "Thyroid (Hypo/Hyperthyroid)", icon: "🦋", advice: "Selenium & zinc rich, limited raw goitrogens (cooked cruciferous)" },
  { id: "Lactose Intolerance", label: "Lactose Intolerance", icon: "🥛", advice: "100% dairy-free or plant-based calcium alternatives" },
  { id: "Gluten Intolerance", label: "Gluten Intolerance / Celiac", icon: "🌾", advice: "Grain substitutes like Millet, Sorghum, Quinoa, and Rice" },
  { id: "Children", label: "Kids & Growing Children", icon: "👶", advice: "Calorie & micronutrient dense, fun presentations, high calcium" },
  { id: "Senior Citizens", label: "Senior Citizens (Elderly)", icon: "👴", advice: "Easily digestible, nutrient-dense, soft textures, high protein" }
];

export const ALLERGIES_LIST = [
  "Milk", "Egg", "Peanut", "Soy", "Wheat", "Seafood", "Tree Nuts", "Sesame", "Mustard"
];

// Master Indian Regional Recipes Database
export const INDIAN_RECIPES_DATABASE = [
  // --- ADDITIONAL BREAKFAST DISHES ---
  {
    id: "brk-1",
    name: "Quinoa Veggie Upma",
    cuisine: "North Indian",
    mealType: "Breakfast",
    prepTime: 15,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 240, protein: 9, carbs: 36, fat: 5, fiber: 7 },
    micros: { iron: 3.8, calcium: 70, vitC: 20, sodium: 260 },
    cost: 50,
    ingredients: ["Quinoa", "Carrots", "Peas", "Mustard seeds", "Curry leaves", "Lemon juice"],
    instructions: ["Rinse quinoa and boil.", "Temper mustard seeds and saute carrots and peas.", "Mix quinoa and lemon juice."],
    healthBenefits: ["Complete protein with all 9 essential amino acids", "Low GI for blood sugar management"],
    suitableFor: ["Diabetes", "Weight Loss", "PCOS", "Gluten Intolerance"],
    medicalAdvice: "Quinoa is a low-glycemic index pseudo-cereal that prevents postprandial glucose spikes in diabetic patients."
  },
  {
    id: "brk-2",
    name: "Palak Oats Besan Cheela",
    cuisine: "North Indian",
    mealType: "Breakfast",
    prepTime: 15,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 220, protein: 11, carbs: 32, fat: 4.5, fiber: 6 },
    micros: { iron: 4.5, calcium: 110, vitC: 18, sodium: 280 },
    cost: 35,
    ingredients: ["Besan (gram flour)", "Rolled oats flour", "Fresh spinach puree", "Ajwain", "Green chilies"],
    instructions: ["Mix besan, oats flour, and spinach puree with water into batter.", "Pour onto hot skillet and cook both sides with 1/2 tsp oil."],
    healthBenefits: ["High folic acid and iron from spinach", "High fiber and plant protein"],
    suitableFor: ["Anemia", "Diabetes", "Hypertension", "PCOS"],
    medicalAdvice: "Folic acid and non-heme iron in spinach assist red blood cell production."
  },
  {
    id: "brk-3",
    name: "Moong Dal Steamed Idli",
    cuisine: "South Indian",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Medium",
    servings: 3,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 180, protein: 12, carbs: 28, fat: 2.5, fiber: 5 },
    micros: { iron: 3.5, calcium: 80, vitC: 10, sodium: 240 },
    cost: 40,
    ingredients: ["Yellow moong dal", "Low-fat curd", "Enos fruit salt", "Mustard seeds", "Curry leaves"],
    instructions: ["Soak moong dal and grind to batter with curd.", "Steam in idli molds for 12 mins.", "Temper with mustard seeds."],
    healthBenefits: ["High protein zero-oil steamed breakfast", "Low calorie high satiety"],
    suitableFor: ["Weight Loss", "Diabetes", "Senior Citizens", "Fatty Liver"],
    medicalAdvice: "Steamed yellow moong dal idlis provide high protein density with minimal digestive load."
  },
  {
    id: "brk-4",
    name: "Foxtail Millet Ven Pongal",
    cuisine: "South Indian",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Easy",
    servings: 3,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 250, protein: 10, carbs: 42, fat: 5, fiber: 6 },
    micros: { iron: 4.1, calcium: 90, vitC: 5, sodium: 260 },
    cost: 45,
    ingredients: ["Foxtail millet", "Yellow moong dal", "Black pepper", "Cumin", "Ginger", "Ghee"],
    instructions: [
      "Pressure cook foxtail millet and moong dal until soft.",
      "Temper cracked black pepper, cumin seeds, and crushed ginger in 1 tsp ghee.",
      "Mix into cooked millet and serve warm."
    ],
    healthBenefits: ["High dietary fiber millet", "Low glycemic index", "Easy on stomach"],
    suitableFor: ["Diabetes", "Gluten Intolerance", "Senior Citizens"],
    medicalAdvice: "Foxtail millet has a lower glycemic response than white rice, stabilizing blood sugar levels."
  },
  {
    id: "brk-5",
    name: "Sprouted Chana Chaat Bowl",
    cuisine: "North Indian",
    mealType: "Breakfast",
    prepTime: 15,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 195, protein: 13, carbs: 31, fat: 2.8, fiber: 8 },
    micros: { iron: 4.8, calcium: 85, vitC: 22, sodium: 290 },
    cost: 30,
    ingredients: ["Sprouted black chana", "Tomato", "Onion", "Lemon juice", "Chaat masala", "Cucumber"],
    instructions: ["Steam sprouted black chana lightly.", "Toss with diced tomatoes, onions, cucumber, and lemon juice."],
    healthBenefits: ["High plant iron and fiber", "Vitamin C boosts iron bio-availability"],
    suitableFor: ["Anemia", "Diabetes", "Weight Loss"],
    medicalAdvice: "Sprouted black chana offers bio-available plant iron paired with natural Vitamin C from lemon juice."
  },
  {
    id: "brk-6",
    name: "Chia Seed Berry Pudding",
    cuisine: "Continental",
    mealType: "Breakfast",
    prepTime: 10,
    difficulty: "Easy",
    servings: 1,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 175, protein: 6, carbs: 22, fat: 7.5, fiber: 10 },
    micros: { iron: 2.5, calcium: 260, vitC: 15, sodium: 90 },
    cost: 60,
    ingredients: ["Chia seeds", "Unsweetened almond milk", "Strawberries", "Blueberries", "Vanilla extract"],
    instructions: ["Soak chia seeds in almond milk overnight.", "Top with fresh berries before serving."],
    healthBenefits: ["High omega-3 fatty acids", "Rich in soluble fiber and antioxidants"],
    suitableFor: ["High Cholesterol", "Heart Health", "Diabetes", "Lactose Intolerance"],
    medicalAdvice: "Chia seeds contain ALA omega-3 fatty acids which support cardiovascular health."
  },
  {
    id: "brk-7",
    name: "Steamed Methi Muthia",
    cuisine: "Gujarati",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Medium",
    servings: 3,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 190, protein: 8, carbs: 30, fat: 3.5, fiber: 5 },
    micros: { iron: 3.2, calcium: 110, vitC: 14, sodium: 240 },
    cost: 35,
    ingredients: ["Besan", "Methi leaves", "Whole wheat flour", "Sesame seeds", "Turmeric"],
    instructions: ["Knead ingredients into dough rolls.", "Steam for 20 mins, slice and serve with mustard tempering."],
    healthBenefits: ["Fenugreek regulates blood sugar", "Steamed low fat breakfast"],
    suitableFor: ["Diabetes", "Weight Loss", "Senior Citizens"],
    medicalAdvice: "Fenugreek seeds and leaves assist glucose tolerance and insulin regulation."
  },
  {
    id: "brk-8",
    name: "Pesarattu (Sprouted Moong Dosa)",
    cuisine: "South Indian",
    mealType: "Breakfast",
    prepTime: 15,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 210, protein: 13, carbs: 33, fat: 3.0, fiber: 7 },
    micros: { iron: 4.1, calcium: 90, vitC: 12, sodium: 240 },
    cost: 40,
    ingredients: ["Sprouted green moong", "Ginger", "Green chili", "Cumin seeds", "Onions"],
    instructions: ["Grind soaked moong with ginger and green chili.", "Spread batter on hot skillet like a dosa."],
    healthBenefits: ["High protein low carb crepe", "Rich in folate and potassium"],
    suitableFor: ["PCOS", "Diabetes", "Muscle Building"],
    medicalAdvice: "Sprouted green moong provides 13g protein per serving with complex low-GI carbs."
  },
  {
    id: "brk-9",
    name: "Stuffed Gobi Whole Wheat Paratha",
    cuisine: "Punjabi",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 260, protein: 8, carbs: 46, fat: 4.5, fiber: 6 },
    micros: { iron: 3.1, calcium: 75, vitC: 28, sodium: 300 },
    cost: 35,
    ingredients: ["Whole wheat atta", "Grated cauliflower", "Ajwain", "Green chili", "Coriander"],
    instructions: ["Stuff grated spiced cauliflower into whole wheat dough.", "Roast on skillet with minimal oil."],
    healthBenefits: ["High fiber whole grain", "Sulforaphane antioxidant from cauliflower"],
    suitableFor: ["Diabetes", "Healthy Lifestyle"],
    medicalAdvice: "Cauliflower provides fiber and sulforaphane while whole wheat flour provides sustained energy release."
  },
  {
    id: "brk-10",
    name: "Sprouted Kanda Poha",
    cuisine: "Maharashtrian",
    mealType: "Breakfast",
    prepTime: 12,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 220, protein: 8, carbs: 36, fat: 4.5, fiber: 5 },
    micros: { iron: 4.2, calcium: 65, vitC: 24, sodium: 240 },
    cost: 30,
    ingredients: ["Flattened rice (poha)", "Sprouted moong", "Onion", "Mustard seeds", "Turmeric", "Lemon juice"],
    instructions: ["Saute onions, mustard seeds, and sprouted moong.", "Add rinsed poha, turmeric, and lemon juice."],
    healthBenefits: ["Boosted protein from sprouted moong", "Iron enriched poha"],
    suitableFor: ["Anemia", "Weight Loss", "Diabetes"],
    medicalAdvice: "Adding sprouted moong elevates the protein and fiber content of traditional poha."
  },

  // --- ADDITIONAL POST-WORKOUT DISHES ---
  {
    id: "post-1",
    name: "Tofu Spinach Protein Scramble",
    cuisine: "Continental",
    mealType: "PostWorkout",
    prepTime: 10,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 220, protein: 20, carbs: 10, fat: 11.0, fiber: 4 },
    micros: { iron: 5.5, calcium: 320, vitC: 22, sodium: 310 },
    cost: 65,
    ingredients: ["Firm tofu", "Fresh spinach", "Turmeric", "Black pepper", "Garlic", "Olive oil"],
    instructions: ["Crumble firm tofu.", "Saute minced garlic and spinach in 1 tsp olive oil.", "Add tofu, turmeric, black pepper, and cook 5 mins."],
    healthBenefits: ["High complete soy protein (20g)", "Calcium and magnesium for muscle recovery"],
    suitableFor: ["PostWorkout", "Muscle Building", "PCOS", "Lactose Intolerance"],
    medicalAdvice: "Provides 20g high-quality soy protein to support muscle protein synthesis post exercise."
  },
  {
    id: "post-2",
    name: "Whey Oats Protein Smoothie Bowl",
    cuisine: "Continental",
    mealType: "PostWorkout",
    prepTime: 5,
    difficulty: "Easy",
    servings: 1,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 290, protein: 26, carbs: 38, fat: 4.0, fiber: 6 },
    micros: { iron: 3.2, calcium: 280, vitC: 10, sodium: 120 },
    cost: 80,
    ingredients: ["Rolled oats", "Banana", "Plant protein powder", "Almond milk", "Chia seeds"],
    instructions: ["Blend oats, banana, protein powder, and almond milk until thick.", "Top with chia seeds."],
    healthBenefits: ["Rapid muscle glycogen recovery", "26g fast absorbing protein"],
    suitableFor: ["PostWorkout", "Muscle Building", "Increase Protein Intake"],
    medicalAdvice: "Optimal 3:1 carb-to-protein ratio for post-exercise glycogen replenishment and muscle repair."
  },
  {
    id: "post-3",
    name: "Grilled Chicken Breast Tikka",
    cuisine: "Punjabi",
    mealType: "PostWorkout",
    prepTime: 20,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Non-Vegetarian",
    macros: { calories: 280, protein: 32, carbs: 6, fat: 12.0, fiber: 2 },
    micros: { iron: 2.8, calcium: 110, vitC: 14, sodium: 360 },
    cost: 110,
    ingredients: ["Chicken breast fillets", "Low-fat curd marinade", "Garlic ginger paste", "Tikka spices", "Lemon juice"],
    instructions: ["Marinate chicken breast in curd and tikka spices for 15 mins.", "Grill on pan or skewer until cooked."],
    healthBenefits: ["32g pure lean protein", "Zero sugar low carbohydrate"],
    suitableFor: ["PostWorkout", "Muscle Building", "Diabetes", "Weight Loss"],
    medicalAdvice: "Provides 32g bio-available chicken protein with minimal subcutaneous fat impact."
  },

  // --- ADDITIONAL PRE-WORKOUT DISHES ---
  {
    id: "pre-1",
    name: "Banana Oats Cinnamon Bowl",
    cuisine: "Continental",
    mealType: "PreWorkout",
    prepTime: 10,
    difficulty: "Easy",
    servings: 1,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 240, protein: 7, carbs: 48, fat: 3.5, fiber: 6 },
    micros: { iron: 2.2, calcium: 60, vitC: 12, sodium: 80 },
    cost: 30,
    ingredients: ["Rolled oats", "Ripe banana", "Cinnamon powder", "Water / Almond milk"],
    instructions: ["Cook oats in water.", "Slice ripe banana on top and sprinkle cinnamon powder."],
    healthBenefits: ["Sustained energy carbs from oats", "Quick energy from banana potassium"],
    suitableFor: ["PreWorkout", "Healthy Lifestyle"],
    medicalAdvice: "Complex carbs combined with simple fruit sugars provide immediate and sustained energy during workouts."
  },
  {
    id: "pre-2",
    name: "Roasted Sweet Potato Chaat",
    cuisine: "North Indian",
    mealType: "PreWorkout",
    prepTime: 15,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 190, protein: 4, carbs: 42, fat: 1.5, fiber: 6 },
    micros: { iron: 1.8, calcium: 45, vitC: 25, sodium: 180 },
    cost: 30,
    ingredients: ["Sweet potato (Shakarkandi)", "Lemon juice", "Chaat masala", "Black salt", "Cumin powder"],
    instructions: ["Boil or roast sweet potatoes.", "Cube and toss with lemon juice, chaat masala, and cumin."],
    healthBenefits: ["Complex low-GI carbohydrates", "Rich in Beta-carotene and Potassium"],
    suitableFor: ["PreWorkout", "Diabetes", "Weight Loss"],
    medicalAdvice: "Sweet potatoes release glucose slowly into the bloodstream, preventing energy crashes."
  },

  // --- ADDITIONAL CHEAT MEAL / TREAT DISHES ---
  {
    id: "cheat-1",
    name: "Whole Wheat Veggie Paneer Pizza",
    cuisine: "Continental",
    mealType: "CheatMeal",
    prepTime: 20,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 380, protein: 17, carbs: 52, fat: 12.0, fiber: 6 },
    micros: { iron: 3.5, calcium: 340, vitC: 20, sodium: 420 },
    cost: 110,
    ingredients: ["Whole wheat dough crust", "Tomato sauce", "Low-fat paneer", "Capsicum & onions", "Mozzarella cheese"],
    instructions: ["Roll whole wheat base.", "Spread tomato sauce, paneer, veggies, and mozzarella.", "Bake at 200C for 15 mins."],
    healthBenefits: ["Whole wheat fiber base", "High protein paneer topping"],
    suitableFor: ["CheatMeal", "Healthy Lifestyle"],
    medicalAdvice: "A guilt-free cheat meal replacing refined maida with 100% whole wheat flour and protein-rich paneer."
  },
  {
    id: "cheat-2",
    name: "Baked Paneer Tikka Burger",
    cuisine: "Continental",
    mealType: "CheatMeal",
    prepTime: 20,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 390, protein: 20, carbs: 48, fat: 12.0, fiber: 5 },
    micros: { iron: 3.8, calcium: 360, vitC: 15, sodium: 430 },
    cost: 100,
    ingredients: ["Whole wheat burger bun", "Grilled paneer patty", "Lettuce", "Tomato slices", "Mint chutney"],
    instructions: ["Grill paneer patty.", "Assemble whole wheat bun with lettuce, tomato, paneer, and mint chutney."],
    healthBenefits: ["High protein paneer burger", "Whole wheat bun fiber"],
    suitableFor: ["CheatMeal", "Muscle Building"],
    medicalAdvice: "Offers 20g protein in a comfort food format without shallow frying oils."
  },

  // --- GUJARATI ---
  {
    id: "guj-1",
    name: "Methi Thepla & Fresh Curd",
    cuisine: "Gujarati",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 310, protein: 9, carbs: 46, fat: 10, fiber: 7 },
    micros: { iron: 3.5, calcium: 180, vitC: 12, sodium: 380 },
    cost: 45,
    ingredients: ["Whole wheat flour", "Fresh fenugreek (methi) leaves", "Low-fat curd", "Sesame seeds", "Turmeric & carom seeds"],
    instructions: [
      "Knead whole wheat flour with chopped methi, curd, carom seeds, and spices.",
      "Roll into thin circles and lightly roast on a skillet with minimal oil.",
      "Serve warm with fresh low-fat probiotic curd."
    ],
    healthBenefits: ["Fenugreek improves insulin sensitivity", "Probiotics boost gut digestion", "Rich in dietary fiber"],
    suitableFor: ["Diabetes", "Weight Loss", "High Cholesterol", "Senior Citizens"],
    medicalAdvice: "High soluble fiber from fenugreek leaves helps slow glucose absorption, making it optimal for Diabetes management."
  },
  {
    id: "guj-2",
    name: "Sprouted Moong Handvo",
    cuisine: "Gujarati",
    mealType: "Evening Snack",
    prepTime: 30,
    difficulty: "Medium",
    servings: 3,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 240, protein: 12, carbs: 34, fat: 6, fiber: 8 },
    micros: { iron: 4.2, calcium: 95, vitC: 18, sodium: 310 },
    cost: 50,
    ingredients: ["Sprouted green moong", "Grated bottle gourd (lauki)", "Besan/gram flour", "Mustard & curry leaves", "Ginger green chili paste"],
    instructions: [
      "Grind sprouted moong coarsely and mix with grated bottle gourd, besan, and mild spices.",
      "Temper mustard seeds and curry leaves in a pan.",
      "Pour batter, cover, and bake/pan-roast until golden and crispy."
    ],
    healthBenefits: ["High bioavailable protein from sprouts", "Low calorie high fiber bottle gourd", "Great for weight management"],
    suitableFor: ["PCOS", "Obesity", "Fatty Liver", "Diabetes"],
    medicalAdvice: "Sprouting increases protein bioavailability and reduces phytates, supporting hormone balance in PCOS."
  },
  {
    id: "guj-3",
    name: "Gujarati Kathiyawadi Khichdi & Kadhi",
    cuisine: "Gujarati",
    mealType: "Dinner",
    prepTime: 25,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 380, protein: 14, carbs: 62, fat: 8, fiber: 6 },
    micros: { iron: 2.8, calcium: 210, vitC: 8, sodium: 420 },
    cost: 40,
    ingredients: ["Brown/white rice", "Yellow moong dal", "Desi Ghee", "Curd & besan for kadhi", "Cumin, cloves & cinnamon"],
    instructions: [
      "Pressure cook rice and yellow moong dal together with turmeric and salt.",
      "Prepare a light buttermilk-besan kadhi tempered with cumin, cloves, and curry leaves.",
      "Serve hot drizzled with half a teaspoon of cow ghee."
    ],
    healthBenefits: ["Complete amino acid profile (rice + dal)", "Easy on stomach", "Soothing for acidity and gut health"],
    suitableFor: ["Improve Gut Health", "Senior Citizens", "Anemia", "Maintenance"],
    medicalAdvice: "Combining rice and moong dal forms a complete protein with easy digestibility ideal for senior citizens and gut recovery."
  },

  // --- PUNJABI ---
  {
    id: "pun-1",
    name: "Amritsari Chole & Whole Wheat Roti",
    cuisine: "Punjabi",
    mealType: "Lunch",
    prepTime: 35,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 440, protein: 18, carbs: 68, fat: 10, fiber: 14 },
    micros: { iron: 6.1, calcium: 140, vitC: 22, sodium: 490 },
    cost: 65,
    ingredients: ["Kabuli chickpeas (chana)", "Onion tomato gravy", "Tea bag (for dark color)", "Chole masala & pomegranate powder", "Whole wheat rotis"],
    instructions: [
      "Soak and pressure cook chickpeas with a tea bag and amla pieces.",
      "Simmer in an aromatic onion-tomato gravy spiced with pomegranate seed powder.",
      "Serve with whole wheat phulkas or baked multigrain kulcha."
    ],
    healthBenefits: ["High plant-based iron and dietary fiber", "High protein saturation", "Low glycemic impact when paired with whole wheat"],
    suitableFor: ["Anemia", "Muscle Building", "Increase Protein Intake"],
    medicalAdvice: "Chickpeas are packed with plant iron (6.1mg) and complex carbohydrates, ideal for combating anemia and boosting stamina."
  },
  {
    id: "pun-2",
    name: "Tandoori Paneer & Spinach Tikka",
    cuisine: "Punjabi",
    mealType: "Dinner",
    prepTime: 25,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 360, protein: 22, carbs: 14, fat: 24, fiber: 5 },
    micros: { iron: 4.8, calcium: 420, vitC: 30, sodium: 360 },
    cost: 90,
    ingredients: ["Low-fat paneer cubes", "Fresh spinach leaves", "Hung curd marinade", "Bell peppers & onions", "Kasuri methi & chaat masala"],
    instructions: [
      "Marinate paneer cubes and vegetables in hung curd, garlic, and tikka spices.",
      "Skewer and air-fry or pan-grill until charred.",
      "Serve on a bed of fresh steamed baby spinach with lemon juice."
    ],
    healthBenefits: ["High quality whey & casein protein", "Rich in calcium and magnesium", "Low carbohydrate content"],
    suitableFor: ["Diabetes", "PCOS", "Muscle Building", "Increase Protein Intake"],
    medicalAdvice: "High protein (22g) and low carbs make this ideal for PCOS hormone regulation and blood sugar control."
  },

  // --- SOUTH INDIAN ---
  {
    id: "sou-1",
    name: "Steamed Oats Rava Idli & Drumstick Sambar",
    cuisine: "South Indian",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 290, protein: 11, carbs: 52, fat: 4, fiber: 9 },
    micros: { iron: 3.2, calcium: 110, vitC: 24, sodium: 390 },
    cost: 45,
    ingredients: ["Rolled oats powder", "Roasted rava & curd", "Toor dal", "Drumsticks & tomatoes", "Sambar powder & curry leaves"],
    instructions: [
      "Mix powdered oats, rava, and curd into a smooth batter; steam in idli molds for 10 mins.",
      "Prepare vegetable sambar with toor dal, drumstick, and fresh curry leaves.",
      "Serve hot idlis with warm sambar."
    ],
    healthBenefits: ["Beta-glucan fiber from oats lowers LDL cholesterol", "Rich in antioxidants", "Oil-free cooking"],
    suitableFor: ["High Cholesterol", "Improve Heart Health", "Weight Loss", "Hypertension"],
    medicalAdvice: "Oats contain soluble beta-glucan fiber which actively binds cholesterol in the digestive system and removes it."
  },
  {
    id: "sou-2",
    name: "Ragi Dosa & Flaxseed Tomato Chutney",
    cuisine: "South Indian",
    mealType: "Breakfast",
    prepTime: 20,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 270, protein: 8, carbs: 48, fat: 5, fiber: 10 },
    micros: { iron: 5.2, calcium: 340, vitC: 15, sodium: 320 },
    cost: 35,
    ingredients: ["Finger millet (ragi) flour", "Rice flour", "Roasted flaxseed powder", "Ripe tomatoes & garlic", "Green chilies"],
    instructions: [
      "Whisk ragi flour, rice flour, cumin, and water into a thin crepe batter.",
      "Pour onto a hot skillet to make crispy thin dosas.",
      "Serve with tangy tomato chutney blended with roasted flaxseeds."
    ],
    healthBenefits: ["Highest calcium content among all cereals (340mg)", "Rich in Omega-3 fatty acids", "Gluten-free option"],
    suitableFor: ["Gluten Intolerance", "Senior Citizens", "Pregnancy", "Children"],
    medicalAdvice: "Ragi provides 340mg calcium per serving, crucial for bone density in senior citizens and fetal bone growth during pregnancy."
  },

  // --- MAHARASHTRIAN ---
  {
    id: "mah-1",
    name: "Kanda Poha & Roasted Peanuts",
    cuisine: "Maharashtrian",
    mealType: "Breakfast",
    prepTime: 15,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 320, protein: 7, carbs: 54, fat: 8, fiber: 5 },
    micros: { iron: 4.5, calcium: 45, vitC: 28, sodium: 340 },
    cost: 30,
    ingredients: ["Flattened rice (poha)", "Onions & green chilies", "Roasted peanuts", "Turmeric & lemon juice", "Fresh coriander"],
    instructions: [
      "Rinse poha gently and drain.",
      "Saute mustard seeds, peanuts, onions, and green chilies in 1 tsp oil.",
      "Add turmeric, poha, salt, and toss. Squeeze fresh lemon juice generously before serving."
    ],
    healthBenefits: ["Iron enriched flattened rice", "Vitamin C from lemon boosts iron absorption", "Easy breakfast choice"],
    suitableFor: ["Anemia", "Healthy Lifestyle", "Maintenance"],
    medicalAdvice: "Poha retains iron from processing, and squeezing fresh lemon juice provides Vitamin C which increases iron absorption by 300%."
  },
  {
    id: "mah-2",
    name: "Pithla Bhakri & Garlic Thecha",
    cuisine: "Maharashtrian",
    mealType: "Lunch",
    prepTime: 25,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 410, protein: 15, carbs: 64, fat: 9, fiber: 11 },
    micros: { iron: 5.0, calcium: 120, vitC: 10, sodium: 410 },
    cost: 40,
    ingredients: ["Jowar (sorghum) flour", "Besan (gram flour)", "Garlic & green chilies", "Coriander & turmeric", "Cumin seeds"],
    instructions: [
      "Knead jowar flour with warm water and pat into thick bhakris; cook on tawa.",
      "Whisk besan with water and cook with garlic cumin tempering until thick and glossy.",
      "Serve warm Pithla with Jowar Bhakri and green chili thecha."
    ],
    healthBenefits: ["Gluten-free Sorghum bhakri", "Complex low-GI carbs", "High plant protein"],
    suitableFor: ["Gluten Intolerance", "Diabetes", "Thyroid Disorders"],
    medicalAdvice: "Jowar (Sorghum) is 100% gluten-free and low-GI, making it safe for Celiac patients and ideal for blood sugar control."
  },

  // --- BENGALI ---
  {
    id: "ben-1",
    name: "Bengali Shukto & Gobindobhog Rice",
    cuisine: "Bengali",
    mealType: "Lunch",
    prepTime: 30,
    difficulty: "Medium",
    servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian",
    macros: { calories: 350, protein: 10, carbs: 58, fat: 8, fiber: 9 },
    micros: { iron: 3.8, calcium: 160, vitC: 32, sodium: 350 },
    cost: 55,
    ingredients: ["Bitter gourd (karela)", "Raw banana & sweet potato", "Drumsticks & ridge gourd", "Radhuni & mustard paste", "Milk"],
    instructions: [
      "Lightly saute mixed vegetables including bitter gourd, raw banana, and drumstick.",
      "Simmer in a subtle mustard, ginger, and milk broth tempered with radhuni.",
      "Serve warm as a digestive starter course with steaming rice."
    ],
    healthBenefits: ["Bitter gourd contains charantin which lowers blood glucose", "Gentle on liver & stomach", "Rich in dietary fiber"],
    suitableFor: ["Diabetes", "Fatty Liver", "Improve Gut Health"],
    medicalAdvice: "Bitter gourd in Shukto contains plant insulin compounds (Charantin & Polypeptide-p) that assist in natural blood sugar regulation."
  },
  {
    id: "ben-2",
    name: "Steamed Mustard Fish Curry (Macher Jhol)",
    cuisine: "Bengali",
    mealType: "Dinner",
    prepTime: 25,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Non-Vegetarian",
    macros: { calories: 340, protein: 28, carbs: 8, fat: 22, fiber: 2 },
    micros: { iron: 2.1, calcium: 80, vitC: 6, sodium: 380 },
    cost: 120,
    ingredients: ["Rohu/Katla fish steaks", "Yellow mustard seeds paste", "Green chilies", "Mustard oil", "Turmeric & nigella seeds (kalonji)"],
    instructions: [
      "Marinate fish steaks with turmeric and salt; lightly sear in 1 tsp mustard oil.",
      "Make a fresh paste of yellow mustard seeds and green chilies.",
      "Simmer fish in the light mustard broth until tender and infused."
    ],
    healthBenefits: ["Rich in EPA & DHA Omega-3 fatty acids", "High lean protein content", "Promotes cardiovascular health"],
    suitableFor: ["Improve Heart Health", "High Cholesterol", "Muscle Building"],
    medicalAdvice: "Fresh freshwater fish provides high quality lean protein and Omega-3 fatty acids that reduce arterial inflammation and triglyceride levels."
  },

  // --- KERALA ---
  {
    id: "ker-1",
    name: "Kerala Steamed Appam & Vegetable Stew",
    cuisine: "Kerala",
    mealType: "Breakfast",
    prepTime: 25,
    difficulty: "Easy",
    servings: 2,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan",
    macros: { calories: 310, protein: 7, carbs: 54, fat: 8, fiber: 6 },
    micros: { iron: 2.4, calcium: 70, vitC: 20, sodium: 330 },
    cost: 50,
    ingredients: ["Fermented rice batter", "Thin coconut milk", "Carrots, peas & potatoes", "Whole spices (cinnamon, cardamom)", "Curry leaves"],
    instructions: [
      "Pour fermented batter into an Appachatti and swirl to make soft lacelike appams.",
      "Simmer mixed vegetables with whole aromatic spices in light coconut milk.",
      "Serve soft appam with warm, fragrant vegetable stew."
    ],
    healthBenefits: ["Easy-to-digest fermented batter", "Medium Chain Triglycerides (MCTs) from coconut milk", "Oil-free appams"],
    suitableFor: ["Improve Gut Health", "Healthy Lifestyle", "Lactose Intolerance"],
    medicalAdvice: "Fermented rice batter introduces natural probiotic cultures that support healthy gut flora and nutrient assimilation."
  },

  // ─── NORTH INDIAN EXTRAS ────────────────────────────────────────────────────
  {
    id: "ni-1", name: "Moong Dal Chilla", cuisine: "North Indian", mealType: "Breakfast", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 210, protein: 14, carbs: 28, fat: 4, fiber: 8 },
    micros: { iron: 3.5, calcium: 60, vitC: 10, sodium: 290 }, cost: 30,
    ingredients: ["Split moong dal", "Onion", "Ginger", "Green chilies", "Cumin", "Coriander leaves", "Cold-pressed mustard oil"],
    instructions: ["Soak moong dal 4h, grind smooth.", "Mix with chopped onion, ginger, chilies, cumin.", "Pour on hot tawa, cook thin crepe-style.", "Serve with mint chutney."],
    healthBenefits: ["High plant protein", "Low GI for blood sugar", "Rich in folate"],
    suitableFor: ["Diabetes", "PCOS", "Weight Loss", "Muscle Building"],
    medicalAdvice: "Moong dal provides complete amino acids and is one of the lowest GI legumes, perfect for diabetes management."
  },
  {
    id: "ni-2", name: "Palak Tofu Sabzi", cuisine: "North Indian", mealType: "Lunch", prepTime: 25, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 185, protein: 14, carbs: 12, fat: 9, fiber: 6 },
    micros: { iron: 5.8, calcium: 160, vitC: 30, sodium: 310 }, cost: 55,
    ingredients: ["Fresh spinach", "Firm tofu", "Onion", "Tomato", "Garlic", "Ginger", "Cumin", "Garam masala"],
    instructions: ["Blanch spinach, blend smooth.", "Sauté onion-tomato masala.", "Add tofu cubes and spinach purée.", "Simmer 8 min."],
    healthBenefits: ["Iron + Vitamin C combination boosts absorption", "High plant protein from tofu", "Bone health from calcium"],
    suitableFor: ["Anemia", "Vegan", "Weight Loss", "Hypertension"],
    medicalAdvice: "Spinach iron + tofu calcium is a powerful combo for anemia recovery in vegetarians."
  },
  {
    id: "ni-3", name: "Rajma Chawal (Brown Rice)", cuisine: "North Indian", mealType: "Lunch", prepTime: 40, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 380, protein: 16, carbs: 62, fat: 6, fiber: 14 },
    micros: { iron: 4.8, calcium: 90, vitC: 15, sodium: 420 }, cost: 45,
    ingredients: ["Red kidney beans (soaked)", "Brown rice", "Onion", "Tomato purée", "Garlic", "Ginger", "Rajma masala", "Bay leaves"],
    instructions: ["Pressure cook soaked rajma until soft.", "Make onion-tomato gravy with spices.", "Simmer rajma in gravy.", "Serve over steamed brown rice."],
    healthBenefits: ["Excellent plant protein + complex carb combo", "High fiber for gut health", "Iron and folate rich"],
    suitableFor: ["Muscle Building", "Improve Gut Health", "Healthy Lifestyle", "Anemia"],
    medicalAdvice: "Kidney beans provide all essential amino acids when paired with rice — a complete vegan protein source."
  },
  {
    id: "ni-4", name: "Methi Thepla (Low Oil)", cuisine: "North Indian", mealType: "Breakfast", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 240, protein: 8, carbs: 40, fat: 5, fiber: 7 },
    micros: { iron: 4.2, calcium: 80, vitC: 12, sodium: 280 }, cost: 25,
    ingredients: ["Whole wheat flour", "Fresh methi (fenugreek) leaves", "Turmeric", "Ajwain", "Green chili", "Garlic paste"],
    instructions: ["Knead wheat flour with chopped methi, turmeric, ajwain, and spices.", "Roll into thin rotis.", "Roast on tawa with minimal oil."],
    healthBenefits: ["Fenugreek regulates blood sugar", "High dietary fiber", "Anti-inflammatory"],
    suitableFor: ["Diabetes", "PCOS", "Hypertension", "Weight Loss"],
    medicalAdvice: "Methi contains galactomannan which slows glucose absorption and reduces postprandial blood sugar spikes."
  },
  {
    id: "ni-5", name: "Mixed Vegetable Daliya Khichdi", cuisine: "North Indian", mealType: "Dinner", prepTime: 25, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 280, protein: 11, carbs: 48, fat: 5, fiber: 10 },
    micros: { iron: 3.0, calcium: 65, vitC: 20, sodium: 350 }, cost: 35,
    ingredients: ["Broken wheat (daliya)", "Moong dal", "Mixed vegetables (peas, carrot, beans)", "Cumin", "Turmeric", "Ginger"],
    instructions: ["Dry roast daliya and moong dal.", "Pressure cook with chopped vegetables and spices.", "Season with cumin tempering."],
    healthBenefits: ["High fiber complete meal", "Low GI broken wheat", "Easy to digest"],
    suitableFor: ["Diabetes", "Senior Citizens", "Improve Gut Health", "Weight Loss"],
    medicalAdvice: "Daliya's soluble fiber content makes it one of the best grains for managing blood sugar and improving satiety."
  },
  {
    id: "ni-6", name: "Aloo Matar Curry", cuisine: "North Indian", mealType: "Dinner", prepTime: 30, difficulty: "Easy", servings: 3,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 260, protein: 8, carbs: 42, fat: 7, fiber: 7 },
    micros: { iron: 2.8, calcium: 55, vitC: 25, sodium: 380 }, cost: 30,
    ingredients: ["Boiled potatoes", "Green peas", "Onion", "Tomato", "Garlic", "Coriander powder", "Cumin", "Amchur"],
    instructions: ["Sauté onion until golden.", "Add tomato-garlic paste and spices.", "Add potatoes and peas, simmer with water 15 min.", "Finish with amchur."],
    healthBenefits: ["Potassium rich for heart health", "Vitamin C from peas", "High fiber"],
    suitableFor: ["Healthy Lifestyle", "Improve Heart Health", "Children"],
    medicalAdvice: "Green peas are an underrated protein source providing 5g protein per cup along with folate."
  },
  {
    id: "ni-7", name: "Chole (Chickpea Curry)", cuisine: "North Indian", mealType: "Lunch", prepTime: 35, difficulty: "Medium", servings: 3,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 320, protein: 15, carbs: 48, fat: 7, fiber: 13 },
    micros: { iron: 4.5, calcium: 95, vitC: 18, sodium: 430 }, cost: 40,
    ingredients: ["White chickpeas (soaked)", "Onion", "Tomato", "Ginger-garlic paste", "Chole masala", "Tea bags (for color)", "Lemon"],
    instructions: ["Pressure cook soaked chickpeas.", "Make rich masala base.", "Simmer chole in masala.", "Garnish with ginger julienne and lemon."],
    healthBenefits: ["Complete plant protein", "Low glycemic index legume", "Excellent for gut microbiome"],
    suitableFor: ["Muscle Building", "Diabetes", "Improve Gut Health", "Weight Loss"],
    medicalAdvice: "Chickpeas have a GI of 28, making them one of the lowest GI foods, ideal for sustained energy in diabetics."
  },
  {
    id: "ni-8", name: "Bajra Khichdi", cuisine: "Rajasthani", mealType: "Dinner", prepTime: 35, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 310, protein: 12, carbs: 52, fat: 6, fiber: 8 },
    micros: { iron: 4.0, calcium: 55, vitC: 5, sodium: 300 }, cost: 30,
    ingredients: ["Pearl millet (bajra)", "Split yellow moong dal", "Ghee (optional)", "Cumin", "Garlic", "Turmeric"],
    instructions: ["Wash bajra and moong dal.", "Pressure cook with 3x water, cumin, and garlic.", "Temper with cumin seeds.", "Serve hot with pickle."],
    healthBenefits: ["Gluten-free whole grain", "Rich in magnesium", "High iron content"],
    suitableFor: ["Gluten Intolerance", "Anemia", "Diabetes", "Healthy Lifestyle"],
    medicalAdvice: "Bajra is one of the richest gluten-free grain sources of iron (8mg/100g), excellent for anemia management."
  },

  // ─── SOUTH INDIAN EXTRAS ────────────────────────────────────────────────────
  {
    id: "si-1", name: "Pesarattu (Moong Dosa)", cuisine: "South Indian", mealType: "Breakfast", prepTime: 15, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 220, protein: 13, carbs: 32, fat: 4, fiber: 6 },
    micros: { iron: 3.2, calcium: 65, vitC: 8, sodium: 260 }, cost: 25,
    ingredients: ["Whole green moong", "Ginger", "Green chilies", "Onion", "Cumin seeds"],
    instructions: ["Soak moong overnight, grind with ginger and chilies.", "Make thin crispy dosas on hot tawa.", "Serve with ginger chutney."],
    healthBenefits: ["Highest protein dosa variety", "No fermentation needed", "Low calorie complete meal"],
    suitableFor: ["Diabetes", "PCOS", "Weight Loss", "Muscle Building"],
    medicalAdvice: "Pesarattu provides 13g protein per serving — 3x more than regular rice dosa — ideal for protein intake goals."
  },
  {
    id: "si-2", name: "Sambar Rice", cuisine: "South Indian", mealType: "Lunch", prepTime: 30, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 350, protein: 14, carbs: 58, fat: 6, fiber: 9 },
    micros: { iron: 4.0, calcium: 80, vitC: 22, sodium: 410 }, cost: 40,
    ingredients: ["Toor dal", "Mixed vegetables (drumstick, brinjal, tomato)", "Tamarind", "Sambar powder", "Mustard seeds", "Curry leaves", "Cooked rice"],
    instructions: ["Cook toor dal until soft.", "Prepare sambar with vegetables, tamarind extract, and sambar powder.", "Mix with cooked rice and ghee."],
    healthBenefits: ["Complete amino acid profile", "Tamarind aids digestion", "Rich in Vitamin C"],
    suitableFor: ["Healthy Lifestyle", "Improve Gut Health", "Children", "Senior Citizens"],
    medicalAdvice: "Sambar rice is a nutritionally balanced complete meal with protein, complex carbs, and micronutrients."
  },
  {
    id: "si-3", name: "Avial (Mixed Vegetable Curry)", cuisine: "Kerala", mealType: "Lunch", prepTime: 35, difficulty: "Medium", servings: 3,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 210, protein: 6, carbs: 28, fat: 10, fiber: 8 },
    micros: { iron: 2.5, calcium: 75, vitC: 35, sodium: 280 }, cost: 45,
    ingredients: ["Mixed vegetables (yam, banana, carrot, beans, drumstick)", "Coconut (grated)", "Cumin", "Green chilies", "Curry leaves", "Coconut oil"],
    instructions: ["Cook vegetables with turmeric.", "Blend coconut, cumin, and green chilies into coarse paste.", "Mix with cooked vegetables and finish with fresh curry leaves and coconut oil."],
    healthBenefits: ["High fiber from diverse vegetables", "MCT fats from coconut", "Rich in antioxidants"],
    suitableFor: ["Healthy Lifestyle", "Improve Immunity", "Lactose Intolerance", "Vegan"],
    medicalAdvice: "Avial's diversity of vegetables provides a broad spectrum of phytonutrients that support immune function."
  },
  {
    id: "si-4", name: "Upma with Vegetables", cuisine: "South Indian", mealType: "Breakfast", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 260, protein: 7, carbs: 44, fat: 6, fiber: 5 },
    micros: { iron: 2.8, calcium: 50, vitC: 18, sodium: 340 }, cost: 25,
    ingredients: ["Semolina (rava)", "Onion", "Peas", "Carrots", "Mustard seeds", "Curry leaves", "Ginger", "Lemon juice"],
    instructions: ["Dry roast rava until fragrant.", "Temper mustard seeds, add vegetables and sauté.", "Add boiling water and rava, stir constantly.", "Finish with lemon juice."],
    healthBenefits: ["Quick energy from semolina", "Diverse vegetables add micronutrients", "Low fat"],
    suitableFor: ["Children", "Senior Citizens", "Healthy Lifestyle", "Improve Gut Health"],
    medicalAdvice: "Upma with vegetables provides a balanced breakfast with carbohydrates and multiple micronutrients."
  },
  {
    id: "si-5", name: "Rasam (Pepper Soup)", cuisine: "South Indian", mealType: "Dinner", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 80, protein: 4, carbs: 12, fat: 2, fiber: 3 },
    micros: { iron: 2.0, calcium: 40, vitC: 20, sodium: 290 }, cost: 20,
    ingredients: ["Toor dal water", "Tamarind", "Tomato", "Black pepper", "Cumin", "Mustard seeds", "Curry leaves", "Asafoetida"],
    instructions: ["Boil tamarind with tomatoes.", "Add dal water, pepper, cumin.", "Temper with mustard and curry leaves.", "Simmer 10 min."],
    healthBenefits: ["Black pepper aids nutrient absorption", "Anti-inflammatory", "Good for cold and congestion", "Very low calorie"],
    suitableFor: ["Improve Immunity", "Improve Gut Health", "Senior Citizens", "Weight Loss"],
    medicalAdvice: "Piperine in black pepper enhances absorption of curcumin by 2000%, dramatically boosting the anti-inflammatory benefits of rasam."
  },

  // ─── GUJARATI ────────────────────────────────────────────────────────────────
  {
    id: "guj-1", name: "Dhokla (Steamed)", cuisine: "Gujarati", mealType: "Breakfast", prepTime: 30, difficulty: "Easy", servings: 4,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 180, protein: 9, carbs: 30, fat: 4, fiber: 4 },
    micros: { iron: 2.5, calcium: 55, vitC: 10, sodium: 310 }, cost: 30,
    ingredients: ["Besan (gram flour)", "Curd or lemon juice", "Eno salt", "Turmeric", "Green chilies", "Mustard seeds", "Sesame seeds"],
    instructions: ["Mix besan, curd, turmeric into smooth batter.", "Add eno, pour into greased tray, steam 15 min.", "Temper mustard, sesame, curry leaves over dhokla."],
    healthBenefits: ["Steamed - zero deep frying", "Protein-rich chickpea base", "Fermented for gut health"],
    suitableFor: ["Weight Loss", "Improve Gut Health", "Healthy Lifestyle", "Hypertension"],
    medicalAdvice: "Dhokla's steaming cooking method retains 90% of nutrients while providing protein-rich, low-fat snack."
  },
  {
    id: "guj-2", name: "Handvo (Baked Lentil Cake)", cuisine: "Gujarati", mealType: "Snack", prepTime: 45, difficulty: "Medium", servings: 4,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 200, protein: 10, carbs: 32, fat: 5, fiber: 7 },
    micros: { iron: 3.0, calcium: 65, vitC: 12, sodium: 320 }, cost: 35,
    ingredients: ["Mixed lentil flour", "Zucchini or bottle gourd", "Sesame seeds", "Fermented batter", "Mustard seeds", "Curry leaves"],
    instructions: ["Mix fermented lentil batter with grated vegetables.", "Pour in greased pan.", "Temper top with mustard seeds and sesame.", "Bake 35 min at 180°C."],
    healthBenefits: ["Baked not fried", "High fiber from vegetables", "Probiotic from fermentation"],
    suitableFor: ["Diabetes", "Weight Loss", "Improve Gut Health", "High Cholesterol"],
    medicalAdvice: "Baked handvo contains 40% fewer calories than fried snacks while providing excellent protein and fiber."
  },
  {
    id: "guj-3", name: "Undhiyu (Winter Mixed Vegetable)", cuisine: "Gujarati", mealType: "Lunch", prepTime: 60, difficulty: "Hard", servings: 4,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 290, protein: 10, carbs: 42, fat: 9, fiber: 11 },
    micros: { iron: 4.5, calcium: 90, vitC: 40, sodium: 360 }, cost: 60,
    ingredients: ["Fresh tuvar (pigeon peas)", "Surti papdi", "Purple yam", "Sweet potato", "Brinjal", "Methi muthiya", "Coconut", "Sesame"],
    instructions: ["Prepare methi-besan muthiya, steam.", "Layer all vegetables in a thick-bottomed pot.", "Add masala paste with sesame and coconut.", "Slow cook covered until tender."],
    healthBenefits: ["Exceptional phytonutrient diversity", "Rich in winter seasonal vitamins", "Protein from fresh pigeon peas"],
    suitableFor: ["Improve Immunity", "Healthy Lifestyle", "High Cholesterol", "Improve Heart Health"],
    medicalAdvice: "Undhiyu's diverse vegetable combination provides over 15 different phytonutrients that boost immunity during winter."
  },
  {
    id: "guj-4", name: "Khandvi", cuisine: "Gujarati", mealType: "Snack", prepTime: 25, difficulty: "Medium", servings: 3,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian", containsDairy: true,
    macros: { calories: 160, protein: 8, carbs: 22, fat: 5, fiber: 3 },
    micros: { iron: 2.0, calcium: 90, vitC: 5, sodium: 280 }, cost: 25,
    ingredients: ["Besan (gram flour)", "Buttermilk", "Ginger-chili paste", "Turmeric", "Mustard seeds", "Sesame seeds", "Coconut (fresh)"],
    instructions: ["Cook besan-buttermilk mixture on low heat, stirring.", "Spread immediately on a greased surface.", "Roll tightly, cut into pieces.", "Temper with mustard seeds."],
    healthBenefits: ["High protein, low fat snack", "No oil cooking", "Probiotics from buttermilk"],
    suitableFor: ["Weight Loss", "High Cholesterol", "Healthy Lifestyle"],
    medicalAdvice: "Khandvi is a protein-rich snack with minimal fat, providing sustained energy without blood sugar spikes."
  },

  // ─── PUNJABI ────────────────────────────────────────────────────────────────
  {
    id: "pun-1", name: "Dal Makhani (Light Version)", cuisine: "Punjabi", mealType: "Dinner", prepTime: 40, difficulty: "Medium", servings: 3,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian", containsDairy: true,
    macros: { calories: 310, protein: 16, carbs: 38, fat: 10, fiber: 12 },
    micros: { iron: 5.2, calcium: 100, vitC: 10, sodium: 450 }, cost: 50,
    ingredients: ["Black lentils (whole urad)", "Kidney beans", "Onion", "Tomato purée", "Low-fat cream", "Ginger-garlic", "Kasuri methi"],
    instructions: ["Overnight soak urad and rajma, pressure cook.", "Make rich tomato-onion gravy.", "Simmer dal in gravy 30 min.", "Finish with light cream and kasuri methi."],
    healthBenefits: ["Highest protein among all lentils", "Excellent iron source", "High resistant starch"],
    suitableFor: ["Muscle Building", "Anemia", "Improve Gut Health", "Increase Protein Intake"],
    medicalAdvice: "Whole black lentils contain resistant starch that feeds beneficial gut bacteria and improves insulin sensitivity."
  },
  {
    id: "pun-2", name: "Sarson da Saag with Makki Roti", cuisine: "Punjabi", mealType: "Lunch", prepTime: 45, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegetarian", containsDairy: true,
    macros: { calories: 340, protein: 12, carbs: 48, fat: 11, fiber: 10 },
    micros: { iron: 6.2, calcium: 150, vitC: 55, sodium: 390 }, cost: 40,
    ingredients: ["Mustard greens", "Bathua (chenopodium)", "Maize flour (makki atta)", "Garlic", "Ginger", "Desi ghee"],
    instructions: ["Boil mustard greens with bathua until soft, blend.", "Cook saag with garlic, ginger, and ghee.", "Knead makki atta with hot water.", "Cook rotis on tawa."],
    healthBenefits: ["Highest Vitamin K leafy green combination", "Anti-inflammatory mustard greens", "Calcium for bone health"],
    suitableFor: ["Senior Citizens", "Improve Immunity", "Improve Heart Health", "Anemia"],
    medicalAdvice: "Mustard greens contain the highest levels of Vitamin K among leafy greens, critical for bone health and blood clotting."
  },
  {
    id: "pun-3", name: "Amritsari Chole Kulche (Baked)", cuisine: "Punjabi", mealType: "Lunch", prepTime: 40, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 380, protein: 14, carbs: 60, fat: 8, fiber: 10 },
    micros: { iron: 4.0, calcium: 80, vitC: 15, sodium: 520 }, cost: 55,
    ingredients: ["White chickpeas", "Onion", "Pomegranate seeds", "Chole masala", "Ginger", "Whole wheat kulche"],
    instructions: ["Pressure cook soaked chickpeas.", "Make spicy tangy chole gravy.", "Bake whole wheat kulche on tawa.", "Serve with onion and tamarind chutney."],
    healthBenefits: ["Plant protein powerhouse", "Resistant starch for gut", "High folate"],
    suitableFor: ["Muscle Building", "Improve Gut Health", "Healthy Lifestyle"],
    medicalAdvice: "Chickpeas provide 15g protein per serving along with 10g fiber, making this one of the most complete vegetarian meals."
  },

  // ─── MAHARASHTRIAN ────────────────────────────────────────────────────────────
  {
    id: "mah-1", name: "Misal Pav (Sprouted)", cuisine: "Maharashtrian", mealType: "Breakfast", prepTime: 30, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 290, protein: 14, carbs: 44, fat: 7, fiber: 9 },
    micros: { iron: 4.5, calcium: 70, vitC: 20, sodium: 400 }, cost: 35,
    ingredients: ["Sprouted moth beans", "Onion", "Tomato", "Kolhapuri masala", "Kokum", "Whole grain pav"],
    instructions: ["Pressure cook sprouted moth beans.", "Make spicy gravy with kolhapuri masala and kokum.", "Add beans to gravy.", "Serve with onion, lemon, and pav."],
    healthBenefits: ["Sprouting increases protein bioavailability", "Kokum aids digestion", "High vitamin C from sprouts"],
    suitableFor: ["Anemia", "Improve Gut Health", "Muscle Building", "Weight Loss"],
    medicalAdvice: "Sprouting moth beans increases vitamin C by 600% and protein digestibility by 30% compared to cooked beans."
  },
  {
    id: "mah-2", name: "Varan Bhaat (Simple Dal Rice)", cuisine: "Maharashtrian", mealType: "Dinner", prepTime: 25, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 320, protein: 12, carbs: 56, fat: 5, fiber: 7 },
    micros: { iron: 3.5, calcium: 60, vitC: 10, sodium: 280 }, cost: 30,
    ingredients: ["Toor dal", "Cooked rice", "Turmeric", "Jaggery (small amount)", "Ghee (minimal)", "Asafoetida"],
    instructions: ["Pressure cook toor dal until very soft.", "Season with turmeric, asafoetida, jaggery.", "Temper with ghee and cumin.", "Serve over hot rice."],
    healthBenefits: ["Comfort meal with high protein", "Easy on digestion", "Balanced macronutrients"],
    suitableFor: ["Senior Citizens", "Children", "Improve Gut Health", "Healthy Lifestyle"],
    medicalAdvice: "Toor dal rice is one of the most easily digestible complete protein meals, ideal for sensitive stomachs."
  },
  {
    id: "mah-3", name: "Bharli Vangi (Stuffed Brinjal)", cuisine: "Maharashtrian", mealType: "Dinner", prepTime: 35, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 195, protein: 6, carbs: 24, fat: 9, fiber: 8 },
    micros: { iron: 2.5, calcium: 55, vitC: 15, sodium: 310 }, cost: 35,
    ingredients: ["Small brinjals", "Roasted peanuts", "Sesame seeds", "Coconut", "Onion", "Goda masala", "Tamarind"],
    instructions: ["Make stuffing with peanuts, sesame, coconut, and spices.", "Stuff into slit brinjals.", "Cook in masala gravy covered.", "Simmer until brinjals are soft."],
    healthBenefits: ["Brinjal is ultra low calorie", "Peanut stuffing adds protein and healthy fats", "Anti-inflammatory"],
    suitableFor: ["Weight Loss", "Diabetes", "High Cholesterol", "Healthy Lifestyle"],
    medicalAdvice: "Brinjal contains nasunin, a powerful brain-protective antioxidant rare in vegetables."
  },

  // ─── BENGALI ────────────────────────────────────────────────────────────────
  {
    id: "ben-1", name: "Moong Dal Khichuri", cuisine: "Bengali", mealType: "Lunch", prepTime: 30, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 330, protein: 14, carbs: 52, fat: 7, fiber: 8 },
    micros: { iron: 3.2, calcium: 70, vitC: 12, sodium: 290 }, cost: 35,
    ingredients: ["Yellow split moong dal", "Gobindo bhog rice", "Ginger", "Bay leaves", "Turmeric", "Ghee (minimal)", "Vegetables"],
    instructions: ["Dry roast moong dal until fragrant.", "Cook with rice, ginger, bay leaves, and turmeric.", "Season with minimal ghee and cumin.", "Serve with beguni or achar."],
    healthBenefits: ["Complete amino acid profile", "Easily digestible", "Cooling and soothing"],
    suitableFor: ["Senior Citizens", "Improve Gut Health", "Children", "Healthy Lifestyle"],
    medicalAdvice: "Bengali khichuri's moong dal is among the most easily digestible legumes, recommended for digestive recovery."
  },
  {
    id: "ben-2", name: "Shukto (Mixed Bitter Vegetable Stew)", cuisine: "Bengali", mealType: "Lunch", prepTime: 40, difficulty: "Hard", servings: 2,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 160, protein: 5, carbs: 22, fat: 7, fiber: 9 },
    micros: { iron: 3.0, calcium: 80, vitC: 30, sodium: 220 }, cost: 40,
    ingredients: ["Bitter gourd", "Drumstick", "Raw banana", "Sweet potato", "Potol (pointed gourd)", "Mustard paste", "Poppy seeds"],
    instructions: ["Cut all vegetables. Fry bitter gourd separately.", "Temper mustard oil with panch phoron.", "Add vegetables in order of cooking time.", "Finish with mustard paste."],
    healthBenefits: ["Bitter gourd regulates blood sugar", "Exceptional fiber diversity", "Antioxidant-rich"],
    suitableFor: ["Diabetes", "Fatty Liver", "Weight Loss", "Improve Immunity"],
    medicalAdvice: "Bitter gourd contains charantin and polypeptide-p, compounds proven to lower blood glucose similar to insulin."
  },

  // ─── CHINESE INSPIRED ────────────────────────────────────────────────────────
  {
    id: "chi-1", name: "Tofu Stir-Fry with Vegetables", cuisine: "Chinese", mealType: "Dinner", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 220, protein: 16, carbs: 18, fat: 10, fiber: 6 },
    micros: { iron: 4.5, calcium: 200, vitC: 35, sodium: 580 }, cost: 55,
    ingredients: ["Firm tofu", "Broccoli", "Bell peppers", "Mushrooms", "Garlic", "Ginger", "Soy sauce (low sodium)", "Sesame oil"],
    instructions: ["Press tofu, cut into cubes, pan-fry until golden.", "Stir-fry vegetables on high heat.", "Add garlic, ginger, soy sauce.", "Toss in tofu."],
    healthBenefits: ["High plant protein from tofu", "Broccoli is anti-cancer (sulforaphane)", "Low calorie high volume"],
    suitableFor: ["Muscle Building", "High Cholesterol", "Weight Loss", "Diabetes"],
    medicalAdvice: "Broccoli's sulforaphane activates the body's own antioxidant defense system more powerfully than any supplement."
  },
  {
    id: "chi-2", name: "Vegetable Fried Brown Rice", cuisine: "Chinese", mealType: "Lunch", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 330, protein: 9, carbs: 56, fat: 7, fiber: 5 },
    micros: { iron: 2.5, calcium: 50, vitC: 20, sodium: 490 }, cost: 45,
    ingredients: ["Cooked brown rice", "Mixed vegetables (peas, carrot, beans, corn)", "Garlic", "Spring onions", "Soy sauce", "Sesame oil"],
    instructions: ["Use day-old brown rice for best texture.", "Stir-fry vegetables on high heat.", "Add rice and soy sauce, toss vigorously.", "Finish with sesame oil and spring onions."],
    healthBenefits: ["Brown rice retains bran and germ", "Low glycemic compared to white rice", "Diverse vegetable micronutrients"],
    suitableFor: ["Diabetes", "Healthy Lifestyle", "Weight Loss", "Children"],
    medicalAdvice: "Brown rice has a GI of 50 vs white rice's 72, significantly better for blood sugar management."
  },
  {
    id: "chi-3", name: "Hot & Sour Vegetable Soup", cuisine: "Chinese", mealType: "Dinner", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 95, protein: 5, carbs: 14, fat: 2, fiber: 4 },
    micros: { iron: 2.0, calcium: 45, vitC: 25, sodium: 520 }, cost: 35,
    ingredients: ["Vegetable broth", "Mushrooms", "Bamboo shoots", "Tofu", "Vinegar", "White pepper", "Soy sauce", "Cornstarch"],
    instructions: ["Bring broth to boil.", "Add mushrooms, bamboo shoots, tofu.", "Season with vinegar, pepper, soy sauce.", "Thicken with cornstarch slurry."],
    healthBenefits: ["Very low calorie filling meal", "Immune-boosting mushrooms", "Probiotic vinegar"],
    suitableFor: ["Weight Loss", "Improve Immunity", "Senior Citizens", "Diabetes"],
    medicalAdvice: "Hot and sour soup's low calorie density (95 cal) with high satiety makes it ideal for weight management."
  },

  // ─── ITALIAN INSPIRED ───────────────────────────────────────────────────────
  {
    id: "ita-1", name: "Whole Wheat Pasta Primavera", cuisine: "Italian", mealType: "Dinner", prepTime: 25, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 360, protein: 12, carbs: 58, fat: 8, fiber: 9 },
    micros: { iron: 3.0, calcium: 60, vitC: 45, sodium: 280 }, cost: 65,
    ingredients: ["Whole wheat pasta", "Cherry tomatoes", "Zucchini", "Bell peppers", "Garlic", "Olive oil", "Basil", "Spinach"],
    instructions: ["Cook whole wheat pasta al dente.", "Sauté garlic in olive oil, add vegetables.", "Toss drained pasta with vegetables.", "Finish with fresh basil."],
    healthBenefits: ["High fiber whole grain pasta", "Lycopene from tomatoes", "Antioxidant-rich vegetables"],
    suitableFor: ["Healthy Lifestyle", "Improve Heart Health", "Vegan", "Weight Loss"],
    medicalAdvice: "Whole wheat pasta has 6g fiber vs white pasta's 2g, significantly improving satiety and gut health."
  },
  {
    id: "ita-2", name: "Minestrone Soup", cuisine: "Italian", mealType: "Lunch", prepTime: 35, difficulty: "Easy", servings: 3,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 185, protein: 9, carbs: 28, fat: 4, fiber: 8 },
    micros: { iron: 3.5, calcium: 75, vitC: 35, sodium: 480 }, cost: 55,
    ingredients: ["Cannellini beans", "Tomatoes", "Carrots", "Celery", "Zucchini", "Whole wheat pasta", "Vegetable broth", "Garlic", "Basil"],
    instructions: ["Sauté garlic, onion in olive oil.", "Add tomatoes, broth, vegetables.", "Simmer 20 min.", "Add beans and cooked pasta.", "Finish with fresh basil."],
    healthBenefits: ["Complete plant protein from beans", "High fiber from diverse vegetables", "Low calorie density"],
    suitableFor: ["Weight Loss", "High Cholesterol", "Diabetes", "Improve Gut Health"],
    medicalAdvice: "Minestrone is a nutritional powerhouse providing protein, fiber, and antioxidants in one bowl under 200 calories."
  },

  // ─── MEXICAN INSPIRED ────────────────────────────────────────────────────────
  {
    id: "mex-1", name: "Black Bean Tacos", cuisine: "Mexican", mealType: "Lunch", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 320, protein: 14, carbs: 48, fat: 7, fiber: 12 },
    micros: { iron: 4.8, calcium: 80, vitC: 25, sodium: 420 }, cost: 55,
    ingredients: ["Black beans", "Corn tortillas", "Avocado", "Salsa", "Lime", "Cumin", "Coriander", "Red onion"],
    instructions: ["Season and warm black beans with cumin.", "Warm corn tortillas.", "Fill with beans, sliced avocado, salsa, onion.", "Squeeze lime."],
    healthBenefits: ["Complete protein with tortillas", "Heart-healthy avocado fats", "High fiber for gut"],
    suitableFor: ["Improve Gut Health", "High Cholesterol", "Muscle Building", "Healthy Lifestyle"],
    medicalAdvice: "Black beans contain anthocyanins that protect heart cells, combined with monounsaturated avocado fats for optimal cardiovascular health."
  },
  {
    id: "mex-2", name: "Vegetable Burrito Bowl", cuisine: "Mexican", mealType: "Dinner", prepTime: 25, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 380, protein: 13, carbs: 58, fat: 10, fiber: 14 },
    micros: { iron: 4.0, calcium: 85, vitC: 30, sodium: 460 }, cost: 60,
    ingredients: ["Brown rice", "Black beans", "Corn", "Bell peppers", "Guacamole", "Pico de gallo", "Lime", "Cumin"],
    instructions: ["Cook seasoned brown rice.", "Warm beans and roast corn.", "Arrange in bowl over rice.", "Top with guacamole and pico de gallo."],
    healthBenefits: ["Fiber-rich complete meal", "Plant proteins from beans", "Healthy fats from avocado"],
    suitableFor: ["Muscle Building", "Weight Loss", "Diabetes", "Improve Gut Health"],
    medicalAdvice: "This bowl provides 14g fiber, meeting over 50% of daily requirement, crucial for reducing LDL cholesterol and blood sugar control."
  },

  // ─── MEDITERRANEAN ────────────────────────────────────────────────────────────
  {
    id: "med-1", name: "Hummus & Veggie Wrap", cuisine: "Mediterranean", mealType: "Lunch", prepTime: 15, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 310, protein: 12, carbs: 42, fat: 10, fiber: 9 },
    micros: { iron: 3.5, calcium: 75, vitC: 30, sodium: 380 }, cost: 60,
    ingredients: ["Whole grain wrap", "Homemade hummus", "Cucumber", "Tomato", "Red onion", "Spinach", "Olives", "Lemon"],
    instructions: ["Spread hummus generously on wrap.", "Layer vegetables and olives.", "Roll tightly and serve with lemon."],
    healthBenefits: ["Tahini provides healthy sesame fats", "Chickpea protein from hummus", "Diverse antioxidants"],
    suitableFor: ["Healthy Lifestyle", "High Cholesterol", "Weight Loss", "Improve Heart Health"],
    medicalAdvice: "Mediterranean diet studies show 30% reduction in cardiovascular events — hummus wraps exemplify this eating pattern."
  },
  {
    id: "med-2", name: "Greek Lentil Soup (Fakes)", cuisine: "Mediterranean", mealType: "Dinner", prepTime: 35, difficulty: "Easy", servings: 3,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 270, protein: 15, carbs: 40, fat: 6, fiber: 13 },
    micros: { iron: 5.5, calcium: 70, vitC: 20, sodium: 340 }, cost: 40,
    ingredients: ["Green or brown lentils", "Onion", "Garlic", "Tomatoes", "Carrots", "Celery", "Olive oil", "Bay leaves", "Oregano", "Red wine vinegar"],
    instructions: ["Sauté onion and garlic.", "Add lentils, tomatoes, vegetables, and broth.", "Simmer 30 min until lentils are soft.", "Season with oregano and vinegar."],
    healthBenefits: ["Highest protein per calorie among soups", "Rich in iron and folate", "Anti-inflammatory olive oil"],
    suitableFor: ["Anemia", "Weight Loss", "Muscle Building", "High Cholesterol"],
    medicalAdvice: "Lentils provide 15g protein and 13g fiber per serving — unmatched in plant-based nutrition for satiety and iron."
  },

  // ─── THAI INSPIRED ────────────────────────────────────────────────────────────
  {
    id: "tha-1", name: "Thai Green Curry with Tofu", cuisine: "Thai", mealType: "Dinner", prepTime: 30, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 290, protein: 14, carbs: 22, fat: 16, fiber: 5 },
    micros: { iron: 4.0, calcium: 200, vitC: 30, sodium: 520 }, cost: 70,
    ingredients: ["Firm tofu", "Coconut milk (light)", "Green curry paste", "Broccoli", "Bamboo shoots", "Zucchini", "Basil", "Kaffir lime leaves"],
    instructions: ["Heat curry paste in pan.", "Add light coconut milk, bring to simmer.", "Add tofu and vegetables.", "Simmer 15 min, finish with basil."],
    healthBenefits: ["MCT fats from coconut milk", "Anti-inflammatory lemongrass", "High protein from tofu"],
    suitableFor: ["High Cholesterol", "Improve Immunity", "Weight Loss", "Muscle Building"],
    medicalAdvice: "Light coconut milk provides MCT fats that are metabolized directly for energy, not stored as fat."
  },
  {
    id: "tha-2", name: "Papaya Salad (Som Tum)", cuisine: "Thai", mealType: "Snack", prepTime: 15, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 95, protein: 2, carbs: 20, fat: 1, fiber: 5 },
    micros: { iron: 1.5, calcium: 50, vitC: 80, sodium: 380 }, cost: 30,
    ingredients: ["Green papaya (shredded)", "Cherry tomatoes", "Green beans", "Lime juice", "Chili", "Garlic", "Palm sugar (small amount)"],
    instructions: ["Shred green papaya.", "Pound garlic and chili.", "Add papaya, tomatoes, beans.", "Dress with lime, sugar, fish sauce (or soy for vegan)."],
    healthBenefits: ["Extremely low calorie", "Papain enzyme aids protein digestion", "High Vitamin C"],
    suitableFor: ["Weight Loss", "Improve Gut Health", "Improve Immunity", "Diabetes"],
    medicalAdvice: "Green papaya contains papain enzyme which significantly improves protein digestion and reduces bloating."
  },

  // ─── AMERICAN HEALTHY ────────────────────────────────────────────────────────
  {
    id: "ame-1", name: "Overnight Oats with Chia", cuisine: "American", mealType: "Breakfast", prepTime: 5, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 310, protein: 10, carbs: 48, fat: 8, fiber: 12 },
    micros: { iron: 3.5, calcium: 80, vitC: 8, sodium: 120 }, cost: 40,
    ingredients: ["Rolled oats", "Chia seeds", "Almond milk (unsweetened)", "Banana", "Berries", "Honey or dates"],
    instructions: ["Mix oats, chia, and almond milk in jar.", "Refrigerate overnight.", "Morning: top with fruits and honey."],
    healthBenefits: ["Omega-3 from chia seeds", "Beta-glucan from oats lowers cholesterol", "No cooking needed"],
    suitableFor: ["Diabetes", "High Cholesterol", "Weight Loss", "Improve Heart Health"],
    medicalAdvice: "Chia seeds provide the same omega-3 content as salmon (per weight), making this ideal for vegan cardiovascular health."
  },
  {
    id: "ame-2", name: "Power Quinoa Bowl", cuisine: "American", mealType: "Lunch", prepTime: 20, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 380, protein: 16, carbs: 52, fat: 12, fiber: 10 },
    micros: { iron: 4.5, calcium: 90, vitC: 35, sodium: 290 }, cost: 75,
    ingredients: ["Cooked quinoa", "Chickpeas (roasted)", "Avocado", "Cherry tomatoes", "Cucumber", "Lemon tahini dressing", "Spinach"],
    instructions: ["Cook quinoa, let cool.", "Roast chickpeas with spices.", "Arrange quinoa, chickpeas, and vegetables in bowl.", "Drizzle tahini dressing."],
    healthBenefits: ["Complete protein from quinoa (all 9 amino acids)", "Probiotic chickpeas", "Avocado heart health"],
    suitableFor: ["Muscle Building", "Vegan", "Gluten Intolerance", "Improve Heart Health"],
    medicalAdvice: "Quinoa is one of the only plant foods with complete protein containing all 9 essential amino acids, making it nutritionally equivalent to meat."
  },
  {
    id: "ame-3", name: "Avocado Toast with Seeds", cuisine: "American", mealType: "Breakfast", prepTime: 10, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 290, protein: 8, carbs: 28, fat: 16, fiber: 8 },
    micros: { iron: 2.5, calcium: 60, vitC: 15, sodium: 280 }, cost: 80,
    ingredients: ["Whole grain bread", "Ripe avocado", "Lemon juice", "Pumpkin seeds", "Hemp seeds", "Chili flakes", "Sea salt"],
    instructions: ["Toast whole grain bread.", "Mash avocado with lemon, salt.", "Spread on toast.", "Top with seeds and chili flakes."],
    healthBenefits: ["Monounsaturated fats from avocado", "Pumpkin seeds rich in zinc", "Hemp seeds provide omega-6"],
    suitableFor: ["High Cholesterol", "Improve Heart Health", "PCOS", "Healthy Lifestyle"],
    medicalAdvice: "Avocado's oleic acid reduces inflammation and LDL while increasing HDL cholesterol, making it nature's best heart food."
  },

  // ─── BREAKFAST EXTRAS ────────────────────────────────────────────────────────
  {
    id: "brk-extra-1", name: "Poha with Peas and Peanuts", cuisine: "Maharashtrian", mealType: "Breakfast", prepTime: 15, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 270, protein: 8, carbs: 46, fat: 6, fiber: 5 },
    micros: { iron: 3.5, calcium: 50, vitC: 15, sodium: 310 }, cost: 25,
    ingredients: ["Flattened rice (poha)", "Green peas", "Roasted peanuts", "Onion", "Mustard seeds", "Curry leaves", "Turmeric", "Lemon juice"],
    instructions: ["Rinse and drain poha.", "Temper mustard seeds in oil.", "Add onion, peas, poha and turmeric.", "Top with peanuts and lemon."],
    healthBenefits: ["Easy iron absorption from poha", "Peanuts add protein and healthy fats", "Very low calorie breakfast"],
    suitableFor: ["Anemia", "Weight Loss", "Children", "Healthy Lifestyle"],
    medicalAdvice: "Poha is enriched with iron through parboiling; its lemon juice accompaniment triples iron absorption through Vitamin C."
  },
  {
    id: "brk-extra-2", name: "Sprouted Moong Salad", cuisine: "North Indian", mealType: "Breakfast", prepTime: 10, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 160, protein: 10, carbs: 22, fat: 3, fiber: 7 },
    micros: { iron: 3.8, calcium: 70, vitC: 25, sodium: 180 }, cost: 20,
    ingredients: ["Sprouted green moong", "Tomato", "Cucumber", "Onion", "Green chili", "Lemon juice", "Chaat masala", "Coriander"],
    instructions: ["Mix all vegetables with sprouted moong.", "Season with chaat masala and lemon.", "Garnish with coriander."],
    healthBenefits: ["600% more Vitamin C than unsprouted", "Complete protein", "Extremely low calorie"],
    suitableFor: ["Diabetes", "Weight Loss", "Anemia", "Improve Immunity"],
    medicalAdvice: "Sprouting moong for 48h increases its Vitamin C content by 600% and enzyme activity that aids digestion."
  },
  {
    id: "brk-extra-3", name: "Jowar Bhakri with Thecha", cuisine: "Maharashtrian", mealType: "Breakfast", prepTime: 20, difficulty: "Medium", servings: 2,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 240, protein: 7, carbs: 46, fat: 3, fiber: 8 },
    micros: { iron: 3.5, calcium: 55, vitC: 10, sodium: 200 }, cost: 20,
    ingredients: ["Sorghum flour (jowar)", "Water", "Salt", "Green chili", "Garlic", "Peanuts (for thecha)"],
    instructions: ["Knead jowar flour with hot water into soft dough.", "Pat into thick round bhakri.", "Roast on tawa until cooked.", "Serve with peanut-garlic thecha."],
    healthBenefits: ["Gluten-free high fiber grain", "Sorghum's antioxidants reduce cancer risk", "No sugar spikes"],
    suitableFor: ["Gluten Intolerance", "Diabetes", "Improve Heart Health", "Weight Loss"],
    medicalAdvice: "Jowar sorghum has one of the highest antioxidant levels among all grains, providing exceptional protection against oxidative stress."
  },

  // ─── SNACK EXTRAS ────────────────────────────────────────────────────────────
  {
    id: "snk-1", name: "Roasted Makhana (Fox Nuts)", cuisine: "North Indian", mealType: "Snack", prepTime: 10, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 140, protein: 5, carbs: 28, fat: 2, fiber: 3 },
    micros: { iron: 2.0, calcium: 65, vitC: 0, sodium: 60 }, cost: 45,
    ingredients: ["Fox nuts (makhana)", "Ghee (minimal)", "Rock salt", "Black pepper", "Cumin"],
    instructions: ["Roast makhana in tsp ghee on low flame.", "Season with rock salt, cumin, pepper.", "Cool before serving."],
    healthBenefits: ["Ultra low calorie snack", "High calcium", "Low sodium", "Anti-aging flavonoids"],
    suitableFor: ["Diabetes", "Hypertension", "Weight Loss", "Senior Citizens"],
    medicalAdvice: "Makhana is a perfect diabetic snack with very low glycemic index, high calcium, and zero cholesterol."
  },
  {
    id: "snk-2", name: "Chana Jor Garam (Dry Chickpeas)", cuisine: "North Indian", mealType: "Snack", prepTime: 5, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 170, protein: 9, carbs: 24, fat: 4, fiber: 6 },
    micros: { iron: 3.5, calcium: 70, vitC: 0, sodium: 120 }, cost: 15,
    ingredients: ["Dried black chickpeas (roasted)", "Onion", "Tomato", "Lemon juice", "Chaat masala", "Green chili"],
    instructions: ["Mix roasted chickpeas with diced onion and tomato.", "Season with chaat masala and lemon.", "Add chili as desired."],
    healthBenefits: ["High protein portable snack", "Iron-rich legume", "Zero cooking required"],
    suitableFor: ["Muscle Building", "Anemia", "Weight Loss", "PCOS"],
    medicalAdvice: "Roasted chana has a GI of 28 — among the lowest of all snacks, making it the ideal blood sugar-friendly option."
  },
  {
    id: "snk-3", name: "Vegetable Oats Soup", cuisine: "North Indian", mealType: "Snack", prepTime: 15, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 165, protein: 6, carbs: 28, fat: 3, fiber: 6 },
    micros: { iron: 2.5, calcium: 55, vitC: 18, sodium: 290 }, cost: 25,
    ingredients: ["Rolled oats", "Mixed vegetables (carrot, peas, spinach)", "Garlic", "Ginger", "Vegetable stock", "Pepper"],
    instructions: ["Boil vegetable stock with garlic and ginger.", "Add vegetables and oats.", "Simmer 10 min until oats soften.", "Season with pepper."],
    healthBenefits: ["Beta-glucan for cholesterol reduction", "Satiety-inducing fiber", "Very low calorie"],
    suitableFor: ["High Cholesterol", "Weight Loss", "Diabetes", "Improve Heart Health"],
    medicalAdvice: "Oat beta-glucan forms a gel in the intestine that binds bile acids containing cholesterol and removes them from the body."
  },

  // ─── DESSERT ─────────────────────────────────────────────────────────────────
  {
    id: "des-1", name: "Ragi Halwa (Finger Millet Pudding)", cuisine: "South Indian", mealType: "Dessert", prepTime: 20, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 220, protein: 5, carbs: 38, fat: 7, fiber: 4 },
    micros: { iron: 3.5, calcium: 200, vitC: 0, sodium: 120 }, cost: 30,
    ingredients: ["Ragi flour", "Jaggery", "Coconut oil", "Cardamom", "Almonds", "Banana"],
    instructions: ["Dry roast ragi flour.", "Mix with jaggery syrup and coconut oil.", "Cook on low heat stirring constantly.", "Add cardamom and garnish with almonds."],
    healthBenefits: ["Highest calcium grain dessert", "Natural sweetener jaggery", "No refined sugar"],
    suitableFor: ["Children", "Senior Citizens", "Pregnancy", "Gluten Intolerance"],
    medicalAdvice: "Ragi halwa provides 200mg calcium per serving (equal to a glass of milk) using completely plant-based ingredients."
  },
  {
    id: "des-2", name: "Chia Seed Coconut Pudding", cuisine: "American", mealType: "Dessert", prepTime: 5, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 190, protein: 5, carbs: 22, fat: 9, fiber: 8 },
    micros: { iron: 2.5, calcium: 80, vitC: 5, sodium: 90 }, cost: 50,
    ingredients: ["Chia seeds", "Coconut milk (light)", "Mango or berries", "Honey", "Vanilla extract"],
    instructions: ["Mix chia seeds with coconut milk and honey.", "Refrigerate 4 hours or overnight.", "Top with fresh fruits before serving."],
    healthBenefits: ["Omega-3 fatty acids", "High fiber satiety", "No cooking required", "Natural sweetener"],
    suitableFor: ["Diabetes", "Weight Loss", "High Cholesterol", "Improve Heart Health"],
    medicalAdvice: "Chia pudding's alpha-linolenic acid (omega-3) reduces inflammation markers by 15-20% in clinical studies."
  },

  // ─── BEVERAGE ─────────────────────────────────────────────────────────────────
  {
    id: "bev-1", name: "Turmeric Golden Milk", cuisine: "North Indian", mealType: "Beverage", prepTime: 5, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 85, protein: 2, carbs: 10, fat: 4, fiber: 1 },
    micros: { iron: 1.0, calcium: 180, vitC: 5, sodium: 95 }, cost: 15,
    ingredients: ["Fortified oat milk", "Turmeric powder", "Black pepper", "Ginger", "Cinnamon", "Jaggery"],
    instructions: ["Heat oat milk. Add turmeric, pepper, ginger, cinnamon.", "Sweeten with jaggery.", "Whisk well and serve warm."],
    healthBenefits: ["Curcumin 20x more effective with black pepper", "Anti-inflammatory", "Promotes sleep", "Calcium from fortified milk"],
    suitableFor: ["Improve Immunity", "Improve Heart Health", "Senior Citizens", "Fatty Liver"],
    medicalAdvice: "Piperine in black pepper increases curcumin bioavailability by 2000%, making golden milk a potent anti-inflammatory drink."
  },
  {
    id: "bev-2", name: "Aam Panna (Raw Mango Drink)", cuisine: "North Indian", mealType: "Beverage", prepTime: 15, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 65, protein: 1, carbs: 16, fat: 0, fiber: 2 },
    micros: { iron: 0.5, calcium: 20, vitC: 40, sodium: 80 }, cost: 20,
    ingredients: ["Raw green mango", "Roasted cumin", "Black salt", "Mint leaves", "Jaggery", "Black pepper"],
    instructions: ["Boil raw mango, extract pulp.", "Blend with cumin, mint, jaggery, black salt.", "Chill and serve with ice."],
    healthBenefits: ["High Vitamin C", "Prevents heat stroke", "Pectin fiber", "Electrolyte replenishment"],
    suitableFor: ["Improve Immunity", "Healthy Lifestyle", "Children", "Summer hydration"],
    medicalAdvice: "Aam panna prevents heat stroke in Indian summers by providing Vitamin C, potassium and natural electrolytes."
  },
  {
    id: "bev-3", name: "Sattu Sharbat", cuisine: "North Indian", mealType: "Beverage", prepTime: 5, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 120, protein: 6, carbs: 20, fat: 2, fiber: 4 },
    micros: { iron: 3.0, calcium: 50, vitC: 5, sodium: 150 }, cost: 15,
    ingredients: ["Roasted chana flour (sattu)", "Lemon juice", "Roasted cumin", "Black salt", "Water or coconut water"],
    instructions: ["Mix sattu with water, lemon, cumin, and black salt.", "Stir until dissolved.", "Serve cold or at room temperature."],
    healthBenefits: ["High protein drink", "Cooling in summer", "Rich in iron and fiber", "Natural energy booster"],
    suitableFor: ["Muscle Building", "Anemia", "Diabetes", "Weight Loss"],
    medicalAdvice: "Sattu sharbat provides 6g protein per glass — more than most commercial protein drinks — at a fraction of the cost."
  },

  // ─── POST WORKOUT ─────────────────────────────────────────────────────────────
  {
    id: "pw-1", name: "Tofu Paneer Bhurji (High Protein)", cuisine: "North Indian", mealType: "PostWorkout", prepTime: 15, difficulty: "Easy", servings: 2,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 230, protein: 22, carbs: 12, fat: 11, fiber: 4 },
    micros: { iron: 4.5, calcium: 250, vitC: 15, sodium: 380 }, cost: 65,
    ingredients: ["Extra firm tofu", "Bell peppers", "Onion", "Tomato", "Turmeric", "Cumin", "Garam masala", "Coriander"],
    instructions: ["Crumble tofu. Sauté onion and peppers.", "Add tomato and spices.", "Add crumbled tofu, cook 8 min.", "Garnish with coriander."],
    healthBenefits: ["22g protein per serving for muscle repair", "Low carb post-workout option", "Calcium from tofu"],
    suitableFor: ["Muscle Building", "Weight Loss", "PCOS", "Diabetes"],
    medicalAdvice: "Post-workout protein target is 20-25g within 30 min — this dish delivers 22g from high-quality soy protein."
  },
  {
    id: "pw-2", name: "Banana Almond Smoothie Bowl", cuisine: "American", mealType: "PostWorkout", prepTime: 10, difficulty: "Easy", servings: 1,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
    dietaryType: "Vegan", containsDairy: false,
    macros: { calories: 310, protein: 10, carbs: 46, fat: 10, fiber: 7 },
    micros: { iron: 2.5, calcium: 90, vitC: 15, sodium: 100 }, cost: 55,
    ingredients: ["Ripe bananas", "Almond milk", "Almond butter", "Chia seeds", "Oats", "Berries", "Hemp seeds"],
    instructions: ["Blend banana with almond milk and almond butter.", "Pour into bowl.", "Top with oats, berries, chia, and hemp seeds."],
    healthBenefits: ["Fast carbs from banana for glycogen replenishment", "Protein from almond butter and hemp", "Omega-3 from chia"],
    suitableFor: ["Muscle Building", "Weight Loss", "Healthy Lifestyle", "Children"],
    medicalAdvice: "Banana's simple sugars replenish muscle glycogen 40% faster than complex carbs post-workout, ideal for recovery."
  }
];

// Disease-Specific Guidance Engine Rules
export const DISEASE_NUTRITION_RULES = {
  "Diabetes": {
    targetCarbMaxGrams: 50,
    recommendedIngredients: ["Methi", "Bitter Gourd", "Moong Dal", "Oats", "Ragi", "Chana", "Cinnamon", "Flaxseed"],
    restrictedIngredients: ["Refined Sugar", "Maida", "Deep Fried Foods", "Sugary Drinks", "White Bread"],
    adviceText: "Prioritizing low-GI carbs, high soluble fiber, and lean protein to prevent glycemic spikes."
  },
  "Hypertension": {
    targetSodiumMaxMg: 500,
    recommendedIngredients: ["Banana", "Spinach", "Drumstick", "Curd", "Oats", "Garlic", "Coconut Water"],
    restrictedIngredients: ["Pickles", "Papad", "Processed Cheese", "Salty Snacks", "Soy Sauce"],
    adviceText: "Restricting sodium (<500mg/meal) and boosting potassium to naturally relax blood vessels."
  },
  "PCOS": {
    targetProteinMinGrams: 20,
    recommendedIngredients: ["Paneer", "Flaxseed", "Sprouts", "Spinach", "Walnuts", "Whole Grains"],
    restrictedIngredients: ["Refined Sugar", "Maida", "Processed Foods", "Trans Fats"],
    adviceText: "Focusing on anti-inflammatory high-protein foods and low-refined carbs for hormonal stability."
  },
  "Anemia": {
    targetIronMinMg: 4.5,
    recommendedIngredients: ["Spinach", "Chickpeas", "Poha", "Dates", "Beetroot", "Jaggery", "Lemon"],
    restrictedIngredients: ["Excess Tea/Coffee with meals (inhibits iron)"],
    adviceText: "Pairing non-heme iron rich ingredients with Vitamin C (citrus/lemon) to maximize iron bio-absorption."
  },
  "High Cholesterol": {
    targetFatMaxGrams: 10,
    recommendedIngredients: ["Oats", "Garlic", "Flaxseed", "Methi", "Fish", "Almonds", "Soy"],
    restrictedIngredients: ["Butter", "Full-fat Cheese", "Deep Fried Snacks", "Palm Oil", "Red Meat"],
    adviceText: "Emphasizing soluble beta-glucans and omega-3s to actively remove LDL cholesterol from circulation."
  }
};

// Zero-Waste Leftover Recipes Database
export const LEFTOVER_RECIPES = [
  {
    id: "left-1",
    name: "Crispy Dal & Rice Muthiya Tikki",
    leftoverKey: "Leftover Dal",
    ingredientsUsed: ["Leftover Dal", "Leftover Rice", "Besan", "Green Chilies", "Coriander"],
    prepTime: 15,
    calories: 220,
    protein: 8,
    carbs: 38,
    fat: 4,
    instructions: [
      "Mix leftover cooked dal and rice with 2 tbsp besan, chopped coriander, and chili.",
      "Shape into small tikkis and pan-roast with 1 tsp oil until golden and crisp.",
      "Serve warm with mint chutney."
    ]
  },
  {
    id: "left-2",
    name: "Masala Leftover Rice Phodnicha Bhaat",
    leftoverKey: "Leftover Rice",
    ingredientsUsed: ["Leftover Rice", "Mustard Seeds", "Turmeric", "Peanuts", "Curry Leaves"],
    prepTime: 10,
    calories: 260,
    protein: 6,
    carbs: 45,
    fat: 6,
    instructions: [
      "Heat 1 tsp oil; add mustard seeds, peanuts, curry leaves, and green chilies.",
      "Add turmeric and cold leftover rice; sprinkle 1 tbsp water and toss on high heat.",
      "Garnish with lemon juice and fresh coriander."
    ]
  },
  {
    id: "left-3",
    name: "Herbed Garlic Bread Upma",
    leftoverKey: "Old Bread",
    ingredientsUsed: ["Old Bread Slice Pieces", "Onions", "Tomatoes", "Mustard Seeds", "Curry Leaves"],
    prepTime: 12,
    calories: 210,
    protein: 5,
    carbs: 36,
    fat: 5,
    instructions: [
      "Cut stale bread slices into small cubes.",
      "Saute onions, mustard seeds, and tomatoes in a skillet.",
      "Toss bread cubes with a splash of water and turmeric until soft and toasted."
    ]
  },
  {
    id: "left-4",
    name: "Stuffed Potato & Veggie Paratha",
    leftoverKey: "Cooked Vegetables",
    ingredientsUsed: ["Cooked Vegetables / Sabzi", "Boiled Potatoes", "Whole Wheat Dough"],
    prepTime: 18,
    calories: 290,
    protein: 7,
    carbs: 52,
    fat: 6,
    instructions: [
      "Mash leftover sabzi and potatoes with chaat masala and chopped coriander.",
      "Stuff into wheat dough balls, roll out, and roast on tawa with minimal ghee."
    ]
  }
];
