export const OILS_DATABASE = [
  {
    id: 'evoo',
    name: 'Extra Virgin Olive Oil (EVOO)',
    hindiName: 'जैतून का तेल',
    category: 'Cold-Pressed Oils',
    smokePointC: 191,
    smokePointF: 375,
    heatTolerance: 'Medium Heat (Sautéing)',
    processingType: 'Unrefined / Virgin',
    fattyAcidProfile: {
      mufaPercent: 73,
      pufaPercent: 11,
      sfaPercent: 14,
      omega3Ratio: '1:10 (High Oleic)',
      omega6Ratio: 'High'
    },
    keyNutrients: ['Oleic Acid (Omega-9)', 'Oleocanthal', 'Hydroxytyrosol', 'Vitamin E'],
    healthBenefits: [
      'Reduces LDL cholesterol oxidation and blood pressure',
      'Powerful anti-inflammatory agent (Oleocanthal works similar to ibuprofen)',
      'Improves insulin sensitivity and non-alcoholic fatty liver disease (NAFLD)',
      'Rich in cardioprotective polyphenols'
    ],
    healthRisks: [
      'Not suitable for deep frying above 190°C as delicate polyphenols degrade'
    ],
    suitableForConditions: ['cholesterol', 'heart_disease', 'hypertension', 'fatty_liver', 'diabetes', 'arthritis', 'weight_loss', 'senior_citizen'],
    avoidForConditions: [],
    recommendedDailyLimit: '15 - 20 ml / day (~3 to 4 teaspoons)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: true,
      highHeatFrying: false,
      indianTadka: false,
      baking: true
    },
    description: 'Gold standard for heart health and anti-inflammation. Cold-extracted from fresh olives without heat or chemicals.',
    badge: 'Cardio Champion'
  },
  {
    id: 'mustard_oil',
    name: 'Cold-Pressed Mustard Oil (Kachi Ghani)',
    hindiName: 'सरसों का तेल',
    category: 'Cold-Pressed Oils',
    smokePointC: 250,
    smokePointF: 480,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 60,
      pufaPercent: 21,
      sfaPercent: 12,
      omega3Ratio: '1:1.2 (Optimal Balance!)'
    },
    keyNutrients: ['Alpha-Linolenic Acid (Omega-3)', 'Erucic Acid', 'Allyl Isothiocyanate', 'Vitamin E'],
    healthBenefits: [
      'Near 1:1 balance of Omega-3 and Omega-6 fatty acids',
      'Stimulates digestion and improves circulation and sinus clarity',
      'Strong antimicrobial & anti-fungal properties',
      'High smoke point perfect for Indian tempering (tadka) and deep frying'
    ],
    healthRisks: [
      'Strong pungent aroma; should be smoked well before cooking'
    ],
    suitableForConditions: ['heart_disease', 'arthritis', 'hypertension', 'cholesterol', 'active_athlete', 'senior_citizen', 'ibs_gut'],
    avoidForConditions: [],
    recommendedDailyLimit: '15 ml / day (~3 teaspoons)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: false
    },
    description: 'Traditional Indian cold-pressed oil with an outstanding Omega-3 to Omega-6 ratio and high heat resilience.',
    badge: 'Best for Indian Cooking'
  },
  {
    id: 'groundnut_oil',
    name: 'Groundnut / Peanut Oil (Wood-Pressed)',
    hindiName: 'मूंगफली का तेल',
    category: 'Cold-Pressed Oils',
    smokePointC: 232,
    smokePointF: 450,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 48,
      pufaPercent: 32,
      sfaPercent: 17,
      omega3Ratio: 'Low Omega-3'
    },
    keyNutrients: ['Resveratrol (Antioxidant)', 'Vitamin E', 'Phytosterols'],
    healthBenefits: [
      'High in Resveratrol which protects blood vessels and prevents strokes',
      'Maintains clean flavor and does not absorb food odor during high heat frying',
      'Supports healthy blood lipid levels and insulin action'
    ],
    healthRisks: [
      'Contains peanut proteins; STRICTLY AVOID if you have a peanut allergy!'
    ],
    suitableForConditions: ['diabetes', 'active_athlete', 'senior_citizen', 'weight_loss'],
    avoidForConditions: [],
    recommendedDailyLimit: '15 ml / day (~3 teaspoons)',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'Nutty, high smoke-point oil rich in resveratrol. Excellent all-rounder for everyday cooking and frying.'
  },
  {
    id: 'sesame_oil',
    name: 'Sesame (Til) Oil / Gingelly',
    hindiName: 'तिल का तेल',
    category: 'Cold-Pressed Oils',
    smokePointC: 210,
    smokePointF: 410,
    heatTolerance: 'Medium Heat (Sautéing)',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 40,
      pufaPercent: 42,
      sfaPercent: 15
    },
    keyNutrients: ['Sesamol', 'Sesamolin', 'Zinc', 'Vitamin E', 'Lignans'],
    healthBenefits: [
      'Proven in clinical trials to lower blood pressure and arterial stiffness',
      'Helps regulate blood glucose levels in Type-2 Diabetes',
      'Powerful natural preservative and anti-inflammatory agent for joint pain',
      'Promotes bone health and oral mucosa immunity'
    ],
    healthRisks: [
      'Mild nutty scent; avoid overheating unrefined dark sesame oil'
    ],
    suitableForConditions: ['hypertension', 'diabetes', 'arthritis', 'ibs_gut', 'senior_citizen'],
    avoidForConditions: [],
    recommendedDailyLimit: '10 - 15 ml / day (~2 to 3 teaspoons)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: true,
      highHeatFrying: false,
      indianTadka: true,
      baking: false
    },
    description: 'Revered in Ayurveda for blood pressure regulation and joint health. Rich in unique sesamol antioxidants.',
    badge: 'BP & Diabetes Ally'
  },
  {
    id: 'rice_bran_oil',
    name: 'Physically Refined Rice Bran Oil',
    hindiName: 'राइस ब्रान ऑयल',
    category: 'Refined Oils',
    smokePointC: 232,
    smokePointF: 450,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Refined',
    fattyAcidProfile: {
      mufaPercent: 47,
      pufaPercent: 33,
      sfaPercent: 20
    },
    keyNutrients: ['Gamma-Oryzanol (10,000+ ppm)', 'Tocotrienols', 'Squalene'],
    healthBenefits: [
      'Gamma-Oryzanol significantly lowers bad LDL cholesterol and total cholesterol',
      'Ideal 1:1.1 balance between MUFA and PUFA as recommended by WHO',
      'Absorbs up to 15% less oil during deep frying than other oils',
      'Reduces menopausal symptoms and hormonal hot flashes'
    ],
    healthRisks: [
      'Slightly higher in saturated fat than Olive or Sunflower oil (~20%)'
    ],
    suitableForConditions: ['cholesterol', 'heart_disease', 'fatty_liver', 'active_athlete', 'senior_citizen'],
    avoidForConditions: [],
    recommendedDailyLimit: '15 - 20 ml / day (~3 to 4 teaspoons)',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'Extracted from the outer bran layer of rice grains. High in cholesterol-fighting Gamma Oryzanol.',
    badge: 'Cholesterol Buster'
  },
  {
    id: 'avocado_oil',
    name: 'Extra Virgin Avocado Oil',
    hindiName: 'एवोकैडो तेल',
    category: 'Specialty & Nut Oils',
    smokePointC: 270,
    smokePointF: 520,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Unrefined / Virgin',
    fattyAcidProfile: {
      mufaPercent: 70,
      pufaPercent: 13,
      sfaPercent: 12
    },
    keyNutrients: ['Oleic Acid', 'Lutein (Eye Health)', 'Vitamin E', 'Beta-Sitosterol'],
    healthBenefits: [
      'Highest natural smoke point (270°C) of any unrefined oil',
      'Enhances absorption of carotenoids and fat-soluble vitamins by 4x to 15x',
      'Protects against macular degeneration and eye fatigue',
      'Lowers systemic joint inflammation and improves gum health'
    ],
    healthRisks: [
      'Premium price point'
    ],
    suitableForConditions: ['cholesterol', 'heart_disease', 'fatty_liver', 'diabetes', 'arthritis', 'active_athlete'],
    avoidForConditions: [],
    recommendedDailyLimit: '15 ml / day (~3 teaspoons)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'The supreme high-heat unrefined oil. Exceptionally rich in Oleic acid and Lutein.',
    badge: 'High Smoke-Point King'
  },
  {
    id: 'flaxseed_oil',
    name: 'Cold-Pressed Flaxseed (Linseed) Oil',
    hindiName: 'अलसी का तेल',
    category: 'Specialty & Nut Oils',
    smokePointC: 107,
    smokePointF: 225,
    heatTolerance: 'Low Heat / Raw Only',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 18,
      pufaPercent: 72,
      sfaPercent: 9,
      omega3Ratio: '53% Omega-3 (Alpha-Linolenic Acid)'
    },
    keyNutrients: ['Alpha-Linolenic Acid (ALA Omega-3)', 'Lignans', 'Vitamin E'],
    healthBenefits: [
      'Highest plant source of Omega-3 ALA (~53% total composition)',
      'Substantially lowers C-Reactive Protein (CRP) and systemic inflammation',
      'Eases rheumatoid arthritis stiffness and inflammatory bowel conditions',
      'Supports brain neuron integrity and dry eye treatment'
    ],
    healthRisks: [
      'CRITICAL: NEVER HEAT OR COOK WITH FLAXSEED OIL! Heating oxidizes it rapidly into dangerous free radicals. Store in dark glass bottle in refrigerator.'
    ],
    suitableForConditions: ['arthritis', 'heart_disease', 'hypertension', 'fatty_liver', 'pregnancy'],
    avoidForConditions: [],
    recommendedDailyLimit: '5 - 10 ml / day (~1 to 2 teaspoons, RAW ONLY)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: false,
      highHeatFrying: false,
      indianTadka: false,
      baking: false
    },
    description: 'Pure liquid Omega-3 supplement. Must strictly be consumed raw drizzled over salads, curd, or warm soups.',
    badge: 'Omega-3 Powerhouse'
  },
  {
    id: 'a2_desi_ghee',
    name: 'A2 Desi Cow Ghee (Clarified Butter)',
    hindiName: 'A2 देसी गाय का घी',
    category: 'Animal Fats & Ghee',
    smokePointC: 250,
    smokePointF: 482,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 29,
      pufaPercent: 4,
      sfaPercent: 62,
      omega3Ratio: 'Short-Chain Butyric Acid'
    },
    keyNutrients: ['Butyric Acid (Gut Health)', 'Conjugated Linoleic Acid (CLA)', 'Vitamin A, D, E, K2'],
    healthBenefits: [
      'Butyric acid fuels colonocytes and repairs leaky gut lining',
      'Enhances assimilation of fat-soluble vitamins (A, D, E, K2)',
      'Lactose & Casein free (clarified milk solids removed)',
      'High smoke point (250°C) prevents toxic acrylamide formation'
    ],
    healthRisks: [
      'High Saturated Fat (62%); Must be consumed in strict moderation (max 1-2 tsp/day), especially if ApoB / LDL cholesterol is high.'
    ],
    suitableForConditions: ['ibs_gut', 'pregnancy', 'senior_citizen', 'active_athlete'],
    avoidForConditions: ['cholesterol', 'fatty_liver'],
    recommendedDailyLimit: '5 - 10 ml / day (~1 to 2 teaspoons MAX)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'Traditional clarified butter rich in Butyric acid for gut health. Consume strictly in small, measured quantities.'
  },
  {
    id: 'virgin_coconut_oil',
    name: 'Virgin Cold-Pressed Coconut Oil',
    hindiName: 'नारियल का तेल',
    category: 'Cold-Pressed Oils',
    smokePointC: 177,
    smokePointF: 350,
    heatTolerance: 'Medium Heat (Sautéing)',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 6,
      pufaPercent: 2,
      sfaPercent: 87,
      omega3Ratio: 'Medium Chain Triglycerides (MCTs)'
    },
    keyNutrients: ['Lauric Acid (50%)', 'Caprylic Acid', 'Capric Acid', 'MCTs'],
    healthBenefits: [
      'MCTs travel straight to the liver for quick energy burn, boosting metabolic rate',
      'Lauric acid converts to Monolaurin, fighting pathogens, yeast, and gut bacteria',
      'Provides steady ketone energy for brain clarity and thyroid support'
    ],
    healthRisks: [
      '87% Saturated Fat! Excess intake elevates LDL-C and Total Cholesterol in hyper-responders. Strictly limit intake if you have heart disease or fatty liver.'
    ],
    suitableForConditions: ['thyroid', 'weight_loss', 'ibs_gut', 'active_athlete'],
    avoidForConditions: ['cholesterol', 'heart_disease', 'fatty_liver'],
    recommendedDailyLimit: '5 - 10 ml / day (~1 to 2 teaspoons MAX)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: true,
      highHeatFrying: false,
      indianTadka: true,
      baking: true
    },
    description: 'Cold-pressed coconut fat rich in antimicrobial Lauric acid and MCTs. Use with care if LDL cholesterol is high.'
  },
  {
    id: 'walnut_oil',
    name: 'Unrefined Cold-Pressed Walnut Oil',
    hindiName: 'अखरोट का तेल',
    category: 'Specialty & Nut Oils',
    smokePointC: 160,
    smokePointF: 320,
    heatTolerance: 'Low Heat / Raw Only',
    processingType: 'Unrefined / Virgin',
    fattyAcidProfile: {
      mufaPercent: 16,
      pufaPercent: 63,
      sfaPercent: 16,
      omega3Ratio: '10-14% ALA Omega-3'
    },
    keyNutrients: ['Alpha-Linolenic Acid (ALA)', 'Ellagitannins', 'Melatonin', 'Polyphenols'],
    healthBenefits: [
      'Ellagitannins reduce cognitive decline and support brain neuron health',
      'Helps lower cortisol and blood pressure spikes under acute mental stress',
      'Supports healthy vascular endothelial function'
    ],
    healthRisks: [
      'Low smoke point; do not use for high heat cooking. Store cold.'
    ],
    suitableForConditions: ['senior_citizen', 'hypertension', 'arthritis', 'heart_disease'],
    avoidForConditions: [],
    recommendedDailyLimit: '5 - 10 ml / day (~1 to 2 teaspoons, RAW)',
    suitableCooking: {
      rawDrizzle: true,
      sauteing: false,
      highHeatFrying: false,
      indianTadka: false,
      baking: false
    },
    description: 'Delicious nutty finishing oil packed with brain-boosting ALA Omega-3 and stress-lowering polyphenols.'
  },
  {
    id: 'sunflower_oil_standard',
    name: 'Refined Sunflower Oil (Standard)',
    hindiName: 'सूरजमुखी का तेल',
    category: 'Refined Oils',
    smokePointC: 227,
    smokePointF: 440,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Refined',
    fattyAcidProfile: {
      mufaPercent: 20,
      pufaPercent: 65,
      sfaPercent: 11,
      omega6Ratio: 'Extremely High Omega-6 (Linoleic Acid)'
    },
    keyNutrients: ['Vitamin E', 'Linoleic Acid (Omega-6)'],
    healthBenefits: [
      'High smoke point and neutral odor for high heat frying',
      'Rich source of Vitamin E'
    ],
    healthRisks: [
      'Excessive Omega-6 (65%) without Omega-3 balance promotes chronic systemic inflammation, worsening Arthritis, Fatty Liver, and Cardiovascular plaque.'
    ],
    suitableForConditions: [],
    avoidForConditions: ['arthritis', 'fatty_liver', 'heart_disease', 'cholesterol', 'diabetes'],
    recommendedDailyLimit: 'Limit to 10 ml/day or rotate with Omega-3 rich oil',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'Popular high-heat cooking oil, but its heavy Omega-6 content can trigger inflammation if consumed unrotated.'
  },
  {
    id: 'palm_oil',
    name: 'Palmolein / Refined Palm Oil',
    hindiName: 'पाम तेल',
    category: 'Avoid Oils',
    smokePointC: 235,
    smokePointF: 455,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Refined',
    fattyAcidProfile: {
      mufaPercent: 37,
      pufaPercent: 10,
      sfaPercent: 50
    },
    keyNutrients: ['Palmitic Acid', 'Tocotrienols'],
    healthBenefits: [
      'Cheap and heat-stable for commercial deep frying'
    ],
    healthRisks: [
      'Contains 50% Palmitic Saturated Acid, which directly increases hepatic fat storage, spikes LDL cholesterol, and accelerates arterial plaque buildup.'
    ],
    suitableForConditions: [],
    avoidForConditions: ['cholesterol', 'heart_disease', 'fatty_liver', 'diabetes', 'hypertension', 'weight_loss'],
    recommendedDailyLimit: 'STRICTLY AVOID / LIMIT TO <5 ml/day',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: false,
      highHeatFrying: true,
      indianTadka: false,
      baking: false
    },
    description: 'Inexpensive industrial oil high in Palmitic saturated fat. Strongly linked to fatty liver and elevated LDL cholesterol.',
    badge: 'Avoid for Heart & Liver'
  },
  {
    id: 'vanaspati_transfat',
    name: 'Vanaspati / Hydrogenated Vegetable Oil (Trans Fat)',
    hindiName: 'वनस्पति / डालडा',
    category: 'Avoid Oils',
    smokePointC: 220,
    smokePointF: 428,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Hydrogenated / Trans Fat',
    fattyAcidProfile: {
      mufaPercent: 30,
      pufaPercent: 5,
      sfaPercent: 50,
      omega3Ratio: 'Contains Artificial Trans Fatty Acids'
    },
    keyNutrients: ['None (Industrial Trans Fats)'],
    healthBenefits: [
      'None! Used industrially only for long shelf life and cheap solid texture.'
    ],
    healthRisks: [
      'HAZARDOUS TO HEALTH! Trans fats double heart attack risk, severely damage vascular lining, raise LDL while lowering HDL, and worsen insulin resistance.'
    ],
    suitableForConditions: [],
    avoidForConditions: ['cholesterol', 'heart_disease', 'hypertension', 'diabetes', 'fatty_liver', 'arthritis', 'weight_loss', 'pregnancy', 'senior_citizen', 'thyroid', 'ibs_gut', 'active_athlete'],
    recommendedDailyLimit: '0 ml / day (ZERO CONSUMPTION)',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: false,
      highHeatFrying: false,
      indianTadka: false,
      baking: false
    },
    description: 'Chemically hydrogenated fat filled with toxic trans fatty acids. Zero health benefit; strictly eliminate from diet.',
    badge: 'Toxic Trans Fat - Strictly Avoid'
  },
  {
    id: 'cottonseed_oil',
    name: 'Refined Cottonseed Oil',
    hindiName: 'कपासिया तेल',
    category: 'Avoid Oils',
    smokePointC: 232,
    smokePointF: 450,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Refined',
    fattyAcidProfile: {
      mufaPercent: 18,
      pufaPercent: 54,
      sfaPercent: 26,
      omega6Ratio: 'Very High Omega-6'
    },
    keyNutrients: ['Linoleic Acid', 'Palmitic Acid'],
    healthBenefits: [
      'High smoke point for industrial frying'
    ],
    healthRisks: [
      'Extracted from non-food cotton crop. Requires heavy chemical refining and bleaching to remove toxic Gossypol. High Omega-6 fuels inflammation.'
    ],
    suitableForConditions: [],
    avoidForConditions: ['cholesterol', 'heart_disease', 'fatty_liver', 'arthritis', 'pregnancy'],
    recommendedDailyLimit: 'Avoid for home cooking; switch to cold-pressed oils',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: false,
      baking: false
    },
    description: 'Chemically processed solvent-extracted oil from cotton seed crop. Inferior choice for human nutrition.'
  },
  {
    id: 'safflower_oil_high_oleic',
    name: 'High-Oleic Cold-Pressed Safflower Oil (Kusum)',
    hindiName: 'कुसुम का तेल',
    category: 'Cold-Pressed Oils',
    smokePointC: 266,
    smokePointF: 510,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Cold-Pressed / Kachi Ghani',
    fattyAcidProfile: {
      mufaPercent: 75,
      pufaPercent: 14,
      sfaPercent: 8
    },
    keyNutrients: ['Oleic Acid (75%)', 'Vitamin E', 'Phytosterols'],
    healthBenefits: [
      'High-Oleic variant is exceptionally rich in heart-healthy MUFA',
      'Extremely high smoke point (266°C) suitable for intense stir-fry and frying',
      'Helps maintain optimal blood fasting glucose levels'
    ],
    healthRisks: [
      'Ensure you buy "High Oleic" version; standard safflower is high PUFA.'
    ],
    suitableForConditions: ['diabetes', 'cholesterol', 'weight_loss', 'active_athlete'],
    avoidForConditions: [],
    recommendedDailyLimit: '15 ml / day (~3 teaspoons)',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'Light, high-MUFA oil with fantastic heat resistance and positive impact on lipid & glycemic parameters.'
  },
  {
    id: 'soybean_oil',
    name: 'Refined Soybean Oil',
    hindiName: 'सोयाबीन का तेल',
    category: 'Refined Oils',
    smokePointC: 234,
    smokePointF: 450,
    heatTolerance: 'High Heat (Frying)',
    processingType: 'Refined',
    fattyAcidProfile: {
      mufaPercent: 23,
      pufaPercent: 58,
      sfaPercent: 15,
      omega6Ratio: 'High Omega-6 (51%) with 7% Omega-3'
    },
    keyNutrients: ['Vitamin K', 'Linoleic Acid'],
    healthBenefits: [
      'Provides Vitamin K and moderate Omega-3 ALA content'
    ],
    healthRisks: [
      'High Omega-6 to Omega-3 ratio promote metabolic oxidation if unrotated. Highly refined chemically.'
    ],
    suitableForConditions: [],
    avoidForConditions: ['thyroid', 'fatty_liver', 'arthritis'],
    recommendedDailyLimit: 'Limit intake; prefer cold-pressed groundnut or mustard oil',
    suitableCooking: {
      rawDrizzle: false,
      sauteing: true,
      highHeatFrying: true,
      indianTadka: true,
      baking: true
    },
    description: 'Widely available refined oil. Good heat tolerance but high in Omega-6.'
  }
];
