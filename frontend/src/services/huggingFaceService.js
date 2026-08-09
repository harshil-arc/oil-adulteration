/**
 * HuggingFace Free Inference API Service
 * Powers the AI Meal Planner recommendations
 * Uses free HuggingFace Inference API — no payment needed
 */

const HF_API_BASE = 'https://api-inference.huggingface.co/models';

// Best free models for meal planning & nutrition chat
// Try in order until one works (free tier availability varies)
const FREE_MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'HuggingFaceH4/zephyr-7b-beta',
  'microsoft/Phi-3-mini-4k-instruct',
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
 * Call HuggingFace Inference API with chat-style prompt
 */
async function callHFModel(model, messages, token) {
  const response = await fetch(`${HF_API_BASE}/${model}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || data[0]?.generated_text || '';
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
  throw new Error('All free HuggingFace models are currently busy. Please try again in a minute.');
}

/**
 * Generate a personalized AI meal plan
 */
export async function generateAIMealPlan(healthProfile, recipes = [], token = '') {
  if (!token) throw new Error('Please add your free HuggingFace API token first.');

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

  // Sample top recipes to suggest from
  const topRecipeNames = recipes.slice(0, 30).map(r => r.name).join(', ');

  const systemPrompt = `You are SpectraTrust AI, an expert clinical nutritionist and meal planner specializing in Indian cuisine. 
You create precise, health-aware meal plans. Always suggest specific Indian dishes that are realistic to cook at home.
Respond in a structured, easy-to-read format with emojis. Be concise but thorough.`;

  const userPrompt = `Create a personalized 1-day meal plan for:
- Name: ${name} | Age: ${age} | Gender: ${gender}
- Weight: ${weight}kg | Height: ${height}cm | BMI: ${bmi}
- Goal: ${goal}
- Activity: ${activityLevel}
- Diet: ${dietPreference}
- Medical Conditions: ${conditions}
- Allergies: ${allergyList}

Available dishes from our database: ${topRecipeNames}

Please provide:
1. 🌅 **Breakfast** (with calories & why it suits the profile)
2. 🍱 **Lunch** (with calories & health benefit)
3. 🌙 **Dinner** (with calories & health benefit)
4. 🥤 **Snack** (2 options)
5. 💧 **Hydration plan**
6. ⚠️ **Key foods to AVOID** given medical conditions
7. 💡 **Top 3 nutrition tips** for ${goal}

Keep total calories appropriate for ${goal} goal.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const { result, model } = await callWithFallback(messages, token);
  return { plan: result, model };
}

/**
 * Chat with AI nutritionist
 */
export async function chatWithNutritionist(userMessage, healthProfile = {}, conversationHistory = [], token = '') {
  if (!token) throw new Error('Please add your free HuggingFace API token first.');

  const { goal = 'Healthy Lifestyle', medicalConditions = [], dietPreference = 'Vegetarian' } = healthProfile;
  const conditions = medicalConditions.length ? medicalConditions.join(', ') : 'None';

  const systemPrompt = `You are SpectraTrust AI Nutritionist — an expert in Indian nutrition, Ayurveda, and clinical dietetics.
User profile: Goal: ${goal} | Diet: ${dietPreference} | Conditions: ${conditions}
Give practical, evidence-based, friendly advice specific to Indian food culture and ingredients.
Keep responses concise (max 200 words). Use emojis for readability.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6), // Keep last 3 exchanges
    { role: 'user', content: userMessage },
  ];

  const { result, model } = await callWithFallback(messages, token);
  return { reply: result, model };
}

/**
 * Analyze a specific recipe for the user's health profile
 */
export async function analyzeRecipeForProfile(recipe, healthProfile, token = '') {
  if (!token) throw new Error('Please add your free HuggingFace API token first.');

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

  const { result, model } = await callWithFallback(messages, token);
  return { analysis: result, model };
}

/**
 * Generate quick meal suggestions based on pantry items
 */
export async function generatePantryMealIdeas(pantryItems, healthProfile, token = '') {
  if (!token) throw new Error('Please add your free HuggingFace API token first.');

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

  const { result, model } = await callWithFallback(messages, token);
  return { ideas: result, model };
}
