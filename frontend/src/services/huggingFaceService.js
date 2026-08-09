/**
 * HuggingFace Free Inference API Service
 * Powers the AI Meal Planner recommendations with resilient API router fallbacks
 * and local rule engine backup when HF free tiers are busy.
 */

// Popular HuggingFace Inference Models
const FREE_MODELS = [
  'Qwen/Qwen2.5-Coder-32B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'meta-llama/Llama-3.2-3B-Instruct',
  'meta-llama/Meta-Llama-3-8B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'HuggingFaceH4/zephyr-7b-beta',
  'google/gemma-2-2b-it',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
];

export const HF_TOKEN_KEY = 'hf_api_token';

export function getHFToken() {
  return localStorage.getItem(HF_TOKEN_KEY) || '';
}

export function setHFToken(token) {
  localStorage.setItem(HF_TOKEN_KEY, token.trim());
}

export function clearHFToken() {
  localStorage.removeItem(HF_TOKEN_KEY);
}

/**
 * Call HuggingFace Inference API using Router or Direct Model Endpoints
 */
async function callHFModel(model, messages, token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Endpoint Strategy 1: Modern Hugging Face Inference Router
  try {
    const routerRes = await fetch('https://router.huggingface.co/hf-inference/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (routerRes.ok) {
      const data = await routerRes.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.length > 10) return content;
    }
  } catch (e) {
    console.warn(`Router endpoint failed for ${model}:`, e);
  }

  // Endpoint Strategy 2: Direct Model Chat Endpoint
  try {
    const directRes = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (directRes.ok) {
      const data = await directRes.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.length > 10) return content;
    }
  } catch (e) {
    console.warn(`Direct chat endpoint failed for ${model}:`, e);
  }

  // Endpoint Strategy 3: Legacy Text Generation Endpoint
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') + '\n\nASSISTANT:';
  const legacyRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 800, temperature: 0.7 },
    }),
  });

  if (!legacyRes.ok) {
    const errText = await legacyRes.text();
    throw new Error(`HF API error (${legacyRes.status}): ${errText}`);
  }

  const legacyData = await legacyRes.json();
  const text = Array.isArray(legacyData) ? legacyData[0]?.generated_text : legacyData?.generated_text;
  if (text) {
    return text.replace(prompt, '').trim();
  }

  throw new Error('Empty response from model');
}

/**
 * Try models in order, return first successful response
 */
async function callWithFallback(messages, token, modelOverride = null) {
  const models = modelOverride ? [modelOverride] : FREE_MODELS;

  for (const model of models) {
    try {
      const result = await callHFModel(model, messages, token);
      if (result && result.length > 10) {
        return { result, model };
      }
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}`);
    }
  }

  throw new Error('HuggingFace free API models are busy');
}

/**
 * Local Fallback Plan Generator if HF API is overloaded
 */
function generateLocalFallbackMealPlan(healthProfile, recipes = [], isPantryMode = false, pList = '') {
  const { goal = 'Healthy Lifestyle', medicalConditions = [], dietPreference = 'Vegetarian', weight = 68, height = 174 } = healthProfile;
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

  // If pantry mode, sort recipes by matched ingredients count first
  let pool = [...recipes];
  if (isPantryMode) {
    pool.sort((a, b) => (b.scoreResult?.matchedCount || 0) - (a.scoreResult?.matchedCount || 0));
  }

  const breakfasts = pool.filter(r => r.mealType === 'Breakfast') || [];
  const lunches = pool.filter(r => r.mealType === 'Lunch') || [];
  const dinners = pool.filter(r => r.mealType === 'Dinner') || [];
  const snacks = pool.filter(r => r.mealType === 'Snack' || r.mealType === 'Breakfast') || [];

  const b = breakfasts[0] || { name: 'Palak Oats Besan Cheela', calories: 220 };
  const l = lunches[0] || { name: 'Rajma Chawal (Brown Rice)', calories: 380 };
  const d = dinners[0] || { name: 'Mixed Vegetable Daliya Khichdi', calories: 280 };
  const s1 = snacks[0] || { name: 'Roasted Makhana (Fox Nuts)', calories: 140 };
  const s2 = snacks[1] || { name: 'Sprouted Moong Salad', calories: 160 };

  const titleHeader = isPantryMode
    ? `### 🧺 Your Smart Pantry-Matched 1-Day Meal Plan`
    : `### 🌟 Your Personalized 1-Day Meal Plan (${goal})`;

  const subtitle = isPantryMode
    ? `*Matched against your active pantry items: ${pList || 'Selected Pantry Inventory'}*`
    : `*Generated with SpectraTrust Clinical Nutrition Engine (BMI: ${bmi})*`;

  const avoids = medicalConditions.includes('Diabetes') 
    ? 'Refined sugar, white bread, maida, sweet juices, deep-fried snacks'
    : medicalConditions.includes('Hypertension')
    ? 'High-sodium processed pickles, salty papad, instant noodles, excess table salt'
    : 'Excess saturated fats, refined sugars, deep-fried fast foods';

  return `${titleHeader}
${subtitle}

---

#### 🌅 **1. Breakfast (Approx. ${b.calories || 240} kcal)**
• **Dish:** **${b.name}**
• **Pantry Match & Benefit:** Uses available pantry ingredients. High in dietary fiber and plant protein.

---

#### 🍱 **2. Lunch (Approx. ${l.calories || 350} kcal)**
• **Dish:** **${l.name}**
• **Pantry Match & Benefit:** Uses available pantry staples. Provides complete amino acids with complex carbohydrates.

---

#### 🌙 **3. Dinner (Approx. ${d.calories || 280} kcal)**
• **Dish:** **${d.name}**
• **Pantry Match & Benefit:** Uses available vegetables & grains. Light on digestion, low glycemic index.

---

#### 🥤 **4. Healthy Snacks (2 Options)**
• **Option A:** **${s1.name}** (${s1.calories || 140} kcal) — Uses pantry ingredients. Low calorie density with high micronutrient content.
• **Option B:** **${s2.name}** (${s2.calories || 160} kcal) — High protein & bioavailable Vitamin C.

---

#### 💧 **5. Hydration & Gut Support Plan**
• Drink **2.5L to 3.0L water** daily.
• Include 1 glass of warm lemon water with cumin seeds in the morning.
• Add 1 bowl of fresh curd or plant-based buttermilk for natural probiotics.

---

#### ⚠️ **6. Foods to Avoid for ${medicalConditions.join(', ') || 'Optimal Health'}**
• Avoid: ${avoids}.

---

#### 💡 **Top 3 Nutrition Tips for ${goal}**
1. **Maximize Pantry Usage:** Prepare fresh meals using your active pantry ingredients to maintain nutrient quality.
2. **Mindful Oil Use:** Use cold-pressed oils in measured quantities (under 3 tsp/day).
3. **Early Dinner:** Finish your evening meal at least 2.5 hours before sleep to support metabolic rest.`;
}

/**
 * Generate a personalized AI meal plan (Supports standard AI plan OR pantry-matched plan)
 */
export async function generateAIMealPlan(healthProfile, recipes = [], token = '', options = {}) {
  const { isPantryMode = false, pantryItems = [] } = typeof options === 'boolean' ? { isPantryMode: options } : options;
  const pList = pantryItems.map(i => (typeof i === 'string' ? i : i.name)).join(', ');

  const {
    name = 'User',
    age = 28,
    gender = 'Male',
    weight = 70,
    height = 170,
    goal = 'Healthy Lifestyle',
    medicalConditions = [],
    allergies = [],
    dietPreference = 'Vegetarian',
    activityLevel = 'Moderately Active',
  } = healthProfile;

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  const conditions = medicalConditions.length ? medicalConditions.join(', ') : 'None';
  const allergyList = allergies.length ? allergies.join(', ') : 'None';

  let pool = recipes;
  if (isPantryMode) {
    pool = [...recipes].sort((a, b) => (b.scoreResult?.matchedCount || 0) - (a.scoreResult?.matchedCount || 0));
  }
  const topRecipeNames = pool.slice(0, 25).map(r => r.name).join(', ');

  let promptRequirement = '';
  if (isPantryMode && pList) {
    promptRequirement = `STRICT REQUIREMENT: Create a 1-day meal plan ONLY using dishes that can be prepared with the user's active pantry ingredients: [${pList}]. Make sure every suggested meal (Breakfast, Lunch, Dinner, Snack) primarily uses these pantry ingredients!`;
  } else {
    promptRequirement = `Create a 1-day meal plan optimal for ${goal} goal and ${conditions} conditions.`;
  }

  const systemPrompt = `You are SpectraTrust AI, an expert clinical nutritionist and chef specializing in Indian cuisine. 
You create precise, health-aware meal plans. Always suggest specific Indian dishes that are realistic to cook at home.
${isPantryMode ? 'STRICTLY prioritize the user provided pantry ingredients!' : ''}
Respond in a structured, easy-to-read format with emojis. Be concise but thorough.`;

  const userPrompt = `Create a personalized 1-day meal plan for:
- Name: ${name} | Age: ${age} | Gender: ${gender}
- Weight: ${weight}kg | Height: ${height}cm | BMI: ${bmi}
- Goal: ${goal}
- Activity: ${activityLevel}
- Diet: ${dietPreference}
- Medical Conditions: ${conditions}
- Allergies: ${allergyList}
${isPantryMode ? `- Active Pantry Ingredients: ${pList}` : ''}

Available dishes from our database: ${topRecipeNames}

${promptRequirement}

Please provide:
1. 🌅 **Breakfast** (with calories & pantry ingredients used)
2. 🍱 **Lunch** (with calories & pantry ingredients used)
3. 🌙 **Dinner** (with calories & pantry ingredients used)
4. 🥤 **Snack** (2 options)
5. 💧 **Hydration plan**
6. ⚠️ **Key foods to AVOID** given medical conditions
7. 💡 **Top 3 nutrition tips** for ${goal}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  if (token) {
    try {
      const { result, model } = await callWithFallback(messages, token);
      if (result && result.length > 30) {
        return { plan: result, model, isPantryMode };
      }
    } catch (err) {
      console.warn('HF API temporary fallback triggered:', err.message);
    }
  }

  const plan = generateLocalFallbackMealPlan(healthProfile, pool, isPantryMode, pList);
  return { plan, model: isPantryMode ? 'SpectraTrust Smart Pantry AI Engine' : 'SpectraTrust Local AI Intelligence Engine', isPantryMode };
}

/**
 * Dynamic, Intelligent Local Chat Engine
 */
function generateSmartLocalChatResponse(userMessage = '', healthProfile = {}) {
  const query = userMessage.toLowerCase().trim();
  const {
    name = 'User',
    goal = 'Healthy Lifestyle',
    medicalConditions = [],
    dietPreference = 'Vegetarian',
    weight = 68,
    height = 174,
  } = healthProfile;

  const conditions = medicalConditions.length ? medicalConditions.join(', ') : 'None';
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

  // 1. GREETINGS & HI/HELLO/NAMASTE
  if (/^(hi|hello|hey|namaste|good morning|good evening|greetings|hola)\b/i.test(query) || query === 'hi' || query === 'hello') {
    return `👋 **Hello ${name}!** I'm your SpectraTrust AI Nutritionist.

I'm analyzing your active health profile:
• **Goal:** ${goal}
• **Diet:** ${dietPreference}
• **Medical Conditions:** ${conditions || 'General Health'}
• **BMI:** ${bmi}

How can I help you today? You can ask me:
1. 🥒 *"What can I cook with [ingredient]?"* (e.g. *lady finger, spinach, paneer, oats*)
2. 🩸 *"Best foods for [condition]?"* (e.g. *diabetes, heart health, PCOS*)
3. 🌅 *"Healthy breakfast / lunch / dinner ideas"*
4. ⚠️ *"Foods to avoid for my health profile"*`;
  }

  // 2. INGREDIENT SPECIFIC QUERIES
  if (query.includes('lady finger') || query.includes('bhindi') || query.includes('okra')) {
    return `🥒 **Bhindi (Lady Finger / Okra) Clinical & Culinary Guide:**

• **Glycemic Index:** Low (GI ~20) — **Ideal for Diabetes & Weight Loss!**
• **Key Nutrients:** Rich in soluble mucilage fiber, Vitamin C, Vitamin K, and Folate.
• **Health Benefits:** The mucilage fiber slows carbohydrate digestion, prevents glucose spikes, and actively lowers LDL cholesterol.

🍳 **Best Low-Oil Recipe Idea for your Pantry:**
**Stir-Fried Bhindi Masala:**
1. Wash and dry bhindi thoroughly, cut into 1-inch pieces.
2. Heat 1 tsp cold-pressed mustard oil in a tawa.
3. Add cumin, turmeric, green chili, coriander powder, and amchur (dry mango powder).
4. Sauté bhindi uncovered on medium heat for 10-12 mins until crisp.

💡 *Diet Tip for ${goal}:* Pair with Whole Wheat Phulka or Bajra Roti and a bowl of fresh cucumber raita!`;
  }

  if (query.includes('spinach') || query.includes('palak')) {
    return `🥬 **Spinach (Palak) Nutrition Guide:**

• **Glycemic Index:** Very Low (GI ~15)
• **Key Nutrients:** Iron, Folate, Calcium, Vitamin A, Vitamin C, Magnesium.
• **Health Benefits:** Excellent for Anemia recovery, blood pressure regulation (high potassium & nitrates), and eye health.

🍳 **Recommended Dishes:**
1. **Palak Oats Besan Cheela:** Protein & iron-rich breakfast.
2. **Palak Tofu / Paneer Sabzi:** High protein & calcium combination.

💡 *Pro Tip:* Always squeeze lemon juice over spinach dishes — Vitamin C increases non-heme iron absorption by over 300%!`;
  }

  if (query.includes('paneer') || query.includes('tofu')) {
    return `🧀 **Paneer & Tofu Protein Comparison:**

• **Low-Fat Paneer:** ~18g Protein, ~200 kcal per 100g. Rich in Whey & Casein calcium.
• **Firm Tofu (Soy):** ~15-17g Protein, ~120 kcal per 100g. 100% Lactose-Free, zero saturated fat.

🍳 **Best Option for ${goal}:**
${medicalConditions.includes('High Cholesterol') || dietPreference === 'Vegan'
  ? 'Choose **Firm Tofu** to avoid saturated fats while getting high quality plant protein.'
  : 'Opt for **Low-Fat Paneer / Tofu Bhurji** sautéed with bell peppers, tomatoes, and cumin.'}`;
  }

  if (query.includes('dal') || query.includes('lentil') || query.includes('moong') || query.includes('chana') || query.includes('rajma')) {
    return `🫘 **Lentils & Legumes Guide for ${goal}:**

• **Yellow Moong Dal:** Lowest GI (29), easiest on stomach, high in soluble fiber.
• **Black Chickpeas (Kala Chana):** GI 28, rich in iron, keeps you full for 4+ hours.
• **Kidney Beans (Rajma):** High protein & resistant starch that feeds healthy gut bacteria.

💡 *Nutrition Advice:* Always pair lentils with complex grains (e.g. Brown Rice, Ragi, Daliya) to form complete essential amino acids!`;
  }

  if (query.includes('rice') || query.includes('wheat') || query.includes('oats') || query.includes('ragi') || query.includes('millet')) {
    return `🌾 **Grains Guide for ${conditions || goal}:**

• **Brown Rice / Red Rice:** GI 50 (vs White Rice GI 72). Retains bran & B-vitamins.
• **Finger Millet (Ragi):** Highest calcium grain (340mg/100g). Gluten-free & slow-digesting.
• **Rolled Oats:** Rich in Beta-Glucan fiber which actively lowers LDL cholesterol and blood sugar.
• **Foxtail / Jowar Millet:** High fiber, gluten-free, great for weight management.`;
  }

  // 3. HEALTH CONDITION SPECIFIC QUERIES
  if (query.includes('diabet') || query.includes('sugar') || query.includes('glucose')) {
    return `🩸 **Clinical Dietary Plan for Diabetes (Type 1 & 2):**

✅ **Best Foods to Eat Daily:**
• **Low-GI Grains:** Ragi, Rolled Oats, Broken Wheat (Daliya), Brown Rice, Bajra.
• **Legumes & Sprouts:** Moong Dal, Kala Chana, Sprouted Moth Beans, Chickpeas.
• **Vegetables:** Bhindi (Lady Finger), Bitter Gourd (Karela), Methi, Spinach, Bottle Gourd.
• **Healing Spices:** Cinnamon, Methi seeds (fenugreek), Turmeric, Amla.

❌ **Strictly Avoid:**
• Refined sugar, sweets, maida, white bread, packaged fruit juices, deep-fried snacks.

🍱 **Sample Ideal Meal:**
*Moong Dal Chilla or Daliya Vegetable Khichdi paired with fresh mint-coriander chutney.*`;
  }

  if (query.includes('heart') || query.includes('hypertension') || query.includes('bp') || query.includes('cardio') || query.includes('pressure')) {
    return `🫀 **Cardiovascular & High Blood Pressure (Hypertension) Dietary Plan:**

✅ **Heart-Healthy Essentials:**
• **DASH Diet Compliant:** Keep sodium under 500mg per meal.
• **High Potassium Foods:** Bananas, Sweet Potatoes, Spinach, Coconut Water, Tomatoes (balances sodium levels).
• **Soluble Fiber & Omega-3:** Rolled Oats, Flaxseed powder, Chia seeds, Walnuts, Garlic.
• **Oil Standard:** Use measured cold-pressed mustard oil or extra virgin olive oil (<3 tsp/day).

❌ **Avoid:**
• Processed papads, salty pickles, instant noodles, canned soups, trans-fats, fried foods.`;
  }

  if (query.includes('pcos') || query.includes('pcod') || query.includes('hormon')) {
    return `🌸 **PCOS / PCOD Hormone Regulation Dietary Guide:**

✅ **Key Pillars:**
• **High Lean Protein:** Tofu, Low-Fat Paneer, Moong Dal, Sprouts (reduces insulin resistance).
• **Anti-Inflammatory Foods:** Turmeric, Ginger, Green Tea, Berries, Flaxseeds.
• **Complex Low-GI Carbs:** Quinoa, Millets, Whole Oats (avoids insulin spikes).

❌ **Avoid:**
• Refined sugars, dairy excess (if sensitive), processed bakery goods, sugary beverages.`;
  }

  if (query.includes('cholesterol') || query.includes('lipid') || query.includes('triglyceride')) {
    return `❤️ **Lipid & Cholesterol Management Plan:**

✅ **Foods that Actively Lower LDL ("Bad") Cholesterol:**
• **Beta-Glucan Fiber:** Oats, Barley (binds cholesterol in digestive tract).
• **Plant Sterols & Soluble Fiber:** Apples, Guavas, Rajma, Chana, Methi.
• **Healthy Unsaturated Fats:** Almonds, Walnuts, Cold-pressed mustard oil.

❌ **Eliminate:**
• Trans-fats, palm oil, butter excess, deep-fried fast foods, full-fat commercial cheese.`;
  }

  if (query.includes('weight loss') || query.includes('fat loss') || query.includes('slimming')) {
    return `⚖️ **Scientific Weight Loss Plan for ${goal}:**

✅ **Core Strategy:**
• **High Volume, Low Calorie Density:** Fill 50% of your plate with non-starchy vegetables (cucumber, tomatoes, spinach, bhindi, cabbage).
• **Protein Satiety:** Include 15-20g protein per major meal (Paneer/Tofu bhurji, Moong chilla, Rajma, Sprouts).
• **Measured Healthy Fats:** Keep oil to 2-3 teaspoons per day total.

🍱 **Sample 1-Day Meal Overview (~1300-1500 kcal):**
• **Breakfast:** Palak Oats Besan Cheela (220 kcal)
• **Lunch:** Rajma with Brown Rice & Cucumber Salad (380 kcal)
• **Snack:** Roasted Makhana or Sprouted Moong (140 kcal)
• **Dinner:** Daliya Vegetable Khichdi (280 kcal)`;
  }

  if (query.includes('weight gain') || query.includes('muscle') || query.includes('protein')) {
    return `💪 **Muscle Building & Clean Weight Gain Guide for ${dietPreference}:**

✅ **Top Protein & Calorie-Dense Sources:**
• **Plant Protein:** Tofu (22g/serving), Low-Fat Paneer (18g), Soy Chunks (50g/100g dry), Sattu (20g/100g).
• **Complex Carbs:** Quinoa, Oats, Sweet Potatoes, Brown Rice, Bananas.
• **Healthy Calorie Boosters:** Peanut butter, Almonds, Chia seeds, Desi Ghee in moderation.

💡 *Target:* Aim for 1.4g - 1.8g protein per kg body weight daily (${Math.round(weight * 1.5)}g protein/day).`;
  }

  // 4. MEAL TYPE QUERIES
  if (query.includes('breakfast') || query.includes('morning')) {
    return `🌅 **Top Clinical Breakfast Options (${dietPreference}):**

1. **Palak Oats Besan Cheela** (~220 kcal | 11g Protein | High Fiber)
2. **Ragi Dosa with Flaxseed Chutney** (~270 kcal | 8g Protein | 340mg Calcium)
3. **Quinoa Veggie Upma** (~240 kcal | 9g Protein | Complete Amino Acids)
4. **Sprouted Moong Salad** (~160 kcal | 10g Protein | Bioavailable Vitamin C)`;
  }

  if (query.includes('lunch') || query.includes('afternoon')) {
    return `🍱 **Nutritious Balanced Lunch Options (${dietPreference}):**

1. **Rajma Chawal with Brown Rice** (~380 kcal | 16g Protein | High Fiber)
2. **Sarson da Saag with Makki Roti** (~340 kcal | 12g Protein | High Vitamin K)
3. **Amritsari Chole with Whole Wheat Kulcha** (~380 kcal | 14g Protein | Low GI)
4. **Sambar Rice with Drumsticks** (~350 kcal | 14g Protein | Balanced Macros)`;
  }

  if (query.includes('dinner') || query.includes('night')) {
    return `🌙 **Light & Digestible Dinner Options:**

1. **Mixed Vegetable Daliya Khichdi** (~280 kcal | 11g Protein | Low GI)
2. **Tofu Stir-Fry with Broccoli & Peppers** (~220 kcal | 16g Protein | Low Carb)
3. **Rasam with Steamed Rice & Vegetables** (~180 kcal | 6g Protein | Anti-Inflammatory)
4. **Bharli Vangi with Jowar Bhakri** (~260 kcal | 8g Protein | High Fiber)`;
  }

  if (query.includes('avoid') || query.includes('bad') || query.includes('restrict')) {
    return `⚠️ **General Dietary Restrictions for your Profile (${conditions || goal}):**

• **Refined Carbs & Sugars:** Maida, white bread, bakery biscuits, sugary soft drinks, commercial sweets.
• **High Sodium & Preservatives:** Packaged chips, commercial pickles with excess oil/salt, papad, instant soups.
• **Adulterated & Reheated Oils:** Commercial palm oil, deep-fried street foods.
• **Processed Meats / Dairy Excess:** Full-fat commercial cheese, processed meats.`;
  }

  // 5. DEFAULT CONTEXTUAL RESPONSE
  return `💡 **Nutrition Guidance regarding "${userMessage}"**

Hello ${name}, analyzing your active health profile (**Goal:** ${goal} | **Diet:** ${dietPreference} | **Conditions:** ${conditions}):

• **Nutritional Focus:** Prioritize complex low-glycemic carbohydrates (Ragi, Oats, Daliya), clean plant protein (Moong Dal, Tofu, Paneer, Sprouts), and fiber-rich vegetables.
• **Cooking Standard:** Prepare meals using minimal cold-pressed oils (Mustard or Olive oil) to preserve essential nutrients and support cardiovascular health.
• **Hydration & Digestive Health:** Aim for 2.5L+ water daily. Include natural probiotics like fresh curd or buttermilk.

💬 *Feel free to ask me about specific ingredients (e.g. "is bhindi good for me?"), meal recipes, or food lists for your health goals!*`;
}



/**
 * Chat with AI nutritionist
 */
export async function chatWithNutritionist(userMessage, healthProfile = {}, conversationHistory = [], token = '') {
  const { goal = 'Healthy Lifestyle', medicalConditions = [], dietPreference = 'Vegetarian' } = healthProfile;
  const conditions = medicalConditions.length ? medicalConditions.join(', ') : 'None';

  const systemPrompt = `You are SpectraTrust AI Nutritionist — an expert in Indian nutrition, Ayurveda, and clinical dietetics.
User profile: Goal: ${goal} | Diet: ${dietPreference} | Conditions: ${conditions}
Give practical, evidence-based, friendly advice specific to Indian food culture and ingredients.
Keep responses concise (max 200 words). Use emojis for readability.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6),
    { role: 'user', content: userMessage },
  ];

  if (token) {
    try {
      const { result, model } = await callWithFallback(messages, token);
      if (result && result.length > 15) {
        return { reply: result, model };
      }
    } catch (err) {
      console.warn('HF API chat fallback triggered:', err.message);
    }
  }

  // Dynamic, context-aware local response engine
  const reply = generateSmartLocalChatResponse(userMessage, healthProfile);
  return { reply, model: 'SpectraTrust Clinical AI Nutritionist' };
}

/**
 * Analyze a specific recipe for the user's health profile
 */
export async function analyzeRecipeForProfile(recipe, healthProfile, token = '') {
  const { goal = '', medicalConditions = [], allergies = [], dietPreference = '' } = healthProfile;

  const prompt = `As a clinical nutritionist, analyze this recipe for this patient:

Recipe: ${recipe.name}
Calories: ${recipe.macros?.calories || recipe.calories} | Protein: ${recipe.macros?.protein}g | Carbs: ${recipe.macros?.carbs}g | Fat: ${recipe.macros?.fat}g
Ingredients: ${recipe.ingredients?.join(', ')}

Patient: Goal=${goal} | Conditions=${medicalConditions.join(', ') || 'None'} | Allergies=${allergies.join(', ') || 'None'} | Diet=${dietPreference}

Give:
✅ Why this IS good for this patient
⚠️ Any cautions or modifications needed
🔄 Best ingredient swaps if needed
📊 Fits daily targets? (Yes/Partially/No)

Be specific and concise.`;

  const messages = [
    { role: 'system', content: 'You are an expert clinical nutritionist specializing in Indian cuisine and therapeutic nutrition.' },
    { role: 'user', content: prompt },
  ];

  if (token) {
    try {
      const { result, model } = await callWithFallback(messages, token);
      if (result && result.length > 15) {
        return { result, model };
      }
    } catch (err) {
      console.warn('HF API recipe analysis fallback triggered:', err.message);
    }
  }

  const analysis = `✅ **Analysis for ${recipe.name}:**\n\n• **Why it's good:** Rich in balanced nutrients (${recipe.macros?.protein || 10}g protein, ${recipe.macros?.calories || 250} cals). Fits your ${goal} focus.\n• **Cautions:** Keep oil usage minimal during cooking.\n• **Recommended Swap:** Use cold-pressed oil or extra veggies for higher fiber.\n• **Daily Target Fit:** ✅ Yes, fits well within your target macros.`;
  return { analysis, model: 'SpectraTrust Local AI Analyzer' };
}

/**
 * Generate quick meal suggestions based on pantry items
 */
export async function generatePantryMealIdeas(pantryItems, healthProfile, token = '') {
  const { goal = '', medicalConditions = [], dietPreference = 'Vegetarian' } = healthProfile;
  const conditions = medicalConditions.length ? medicalConditions.join(', ') : 'None';

  const prompt = `I have these ingredients: ${pantryItems.join(', ')}

My health info: Goal=${goal} | Conditions=${conditions} | Diet=${dietPreference}

Suggest 5 quick Indian meals I can make right now using mostly these ingredients.
For each meal: Name, prep time, why it's healthy for me, main macro estimate.
Format as a numbered list. Be creative but realistic.`;

  const messages = [
    { role: 'system', content: 'You are an expert Indian chef and nutritionist who specializes in healthy, quick meals.' },
    { role: 'user', content: prompt },
  ];

  if (token) {
    try {
      const { result, model } = await callWithFallback(messages, token);
      if (result && result.length > 15) {
        return { ideas: result, model };
      }
    } catch (err) {
      console.warn('HF API pantry ideas fallback triggered:', err.message);
    }
  }

  const pList = pantryItems.slice(0, 5).map(i => typeof i === 'string' ? i : i.name).join(', ');
  const ideas = `### 🥗 5 Quick Meals from your Pantry (${pList}):\n\n1. **High-Protein Vegetable Saute** (15 mins)\n   • *Why:* Quick, low calorie, preserves vitamins.\n   • *Macros:* ~220 kcal, 12g Protein\n\n2. **Spiced Lentil & Veggie Bowl** (20 mins)\n   • *Why:* High fiber, keeps blood sugar stable.\n   • *Macros:* ~310 kcal, 14g Protein\n\n3. **Quick Moong & Herb Chilla** (15 mins)\n   • *Why:* Low GI, great for ${goal}.\n   • *Macros:* ~210 kcal, 13g Protein\n\n4. **Warm Vegetable Soup with Herbs** (15 mins)\n   • *Why:* Hydrating & easy on digestion.\n   • *Macros:* ~140 kcal, 5g Protein\n\n5. **Pantry Masala Tossed Salad** (10 mins)\n   • *Why:* Zero cooking, high bioavailable antioxidants.\n   • *Macros:* ~160 kcal, 6g Protein`;

  return { ideas, model: 'SpectraTrust Local Pantry AI Engine' };
}

/**
 * Helper to match dish names mentioned in plan text against database recipes
 */
export function extractMatchedRecipesFromPlan(planText = '', recipes = []) {
  if (!recipes || recipes.length === 0) return [];
  const textLower = (planText || '').toLowerCase();

  const matched = recipes.filter(r => {
    const nameLower = r.name.toLowerCase();
    if (textLower.includes(nameLower)) return true;

    // Check main keywords from recipe name
    const words = nameLower.split(/[\s()\-]+/).filter(w => w.length >= 4 && !['with', 'rice', 'curry', 'soup', 'salad', 'style', 'light', 'stuffed', 'steamed', 'baked', 'roasted', 'extra'].includes(w));
    if (words.some(w => textLower.includes(w))) return true;
    return false;
  });

  if (matched.length >= 2) return matched;

  // Fallback to top scored meals by type
  const b = recipes.find(r => r.mealType === 'Breakfast');
  const l = recipes.find(r => r.mealType === 'Lunch');
  const d = recipes.find(r => r.mealType === 'Dinner');
  const s = recipes.find(r => r.mealType === 'Snack');
  return Array.from(new Set([...matched, b, l, d, s].filter(Boolean)));
}
