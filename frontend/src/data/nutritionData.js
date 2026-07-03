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
