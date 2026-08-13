export const HEALTH_CONDITIONS = [
  {
    id: 'cholesterol',
    title: 'High Cholesterol (Elevated LDL / Triglycerides)',
    category: 'Cardiovascular',
    iconName: 'Activity',
    description: 'Requires low saturated fat (<7% calories), high MUFA (Oleic acid), and plant sterols/oryzanol to reduce LDL oxidation.',
    keyTargetNutrients: 'Monounsaturated Fats (MUFA), Oryzanol, Phytosterols',
    severityNotice: 'Avoid oils with >20% saturated fat like Palm Oil and Vanaspati.'
  },
  {
    id: 'heart_disease',
    title: 'Heart Disease / CAD / Post-Stent / Atherosclerosis',
    category: 'Cardiovascular',
    iconName: 'Heart',
    description: 'Focus on endothelial health, high Polyphenols, low Trans & Saturated Fats, and balanced Omega 3:6 ratios.',
    keyTargetNutrients: 'Polyphenols, Omega-3 ALA, Monounsaturated Oleic Acid',
    severityNotice: 'Zero Trans-Fats (Vanaspati) and strict cap on coconut oil/palm oil.'
  },
  {
    id: 'hypertension',
    title: 'Hypertension / High Blood Pressure',
    category: 'Cardiovascular',
    iconName: 'HeartPulse',
    description: 'Benefits from vasodilatory compounds like Sesamol & Oleic acid that improve arterial elasticity.',
    keyTargetNutrients: 'Sesamol, Lutein, Alpha-Linolenic Acid (ALA)'
  },
  {
    id: 'diabetes',
    title: 'Type 2 Diabetes / Pre-Diabetes / Insulin Resistance',
    category: 'Metabolic',
    iconName: 'Flame',
    description: 'Requires fats that enhance cell membrane fluidity, improve insulin receptor sensitivity, and do not cause spike in inflammatory cytokines.',
    keyTargetNutrients: 'Oleic Acid, Resveratrol, Magnesium-supportive fats'
  },
  {
    id: 'fatty_liver',
    title: 'Fatty Liver (NAFLD / NASH)',
    category: 'Liver & Digestion',
    iconName: 'ShieldAlert',
    description: 'Extra Virgin Olive Oil and Omega-3 rich oils reduce hepatic lipid accumulation and liver enzyme inflammation.',
    keyTargetNutrients: 'Polyphenols, Oleic Acid, Choline-sparing fatty acids',
    severityNotice: 'Avoid heavy saturated oils like Palm Oil, Vanaspati, and excessive Coconut Oil.'
  },
  {
    id: 'arthritis',
    title: 'Joint Pain / Arthritis / High Inflammation',
    category: 'Inflammation',
    iconName: 'Bone',
    description: 'Crucial to maintain low Omega-6 to Omega-3 ratio (<4:1) to downregulate pro-inflammatory prostaglandins (COX-2).',
    keyTargetNutrients: 'Omega-3 ALA, Sesamol, Erucic/Oleic acid blend',
    severityNotice: 'Avoid refined high Omega-6 oils (Corn, Cottonseed, Soybean oil).'
  },
  {
    id: 'weight_loss',
    title: 'Weight Loss Goal / Obesity Management',
    category: 'Lifestyle & Stage',
    iconName: 'Scale',
    description: 'Requires strict caloric density control (~9 kcal/gram), preference for satiating fats, and MCTs in moderation.',
    keyTargetNutrients: 'MUFA, Medium Chain Triglycerides (MCTs) in strict limit'
  },
  {
    id: 'thyroid',
    title: 'Thyroid Imbalance (Hypothyroidism / Hashimoto)',
    category: 'Metabolic',
    iconName: 'Zap',
    description: 'Supports thyroid hormone conversion with clean cold-pressed oils. Avoid unrefined solvent-processed soybean oils.',
    keyTargetNutrients: 'Medium Chain Fatty Acids, Lauric acid, Cold-pressed MUFA'
  },
  {
    id: 'ibs_gut',
    title: 'IBS / Weak Digestion / Leaky Gut',
    category: 'Liver & Digestion',
    iconName: 'Sparkles',
    description: 'Requires easily digestible, non-irritating fats that support gut mucosal barrier integrity (like Butyric acid or cold-pressed sesame).',
    keyTargetNutrients: 'Butyric acid (Ghee), Cold-pressed Sesame sesamolin'
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy & Lactation',
    category: 'Lifestyle & Stage',
    iconName: 'Baby',
    description: 'Requires DHA/ALA Omega-3s for fetal brain development, Vitamin E, and unrefined chemical-free oils.',
    keyTargetNutrients: 'Omega-3 ALA, Natural Vitamin E, Cold-pressed Nutrients'
  },
  {
    id: 'active_athlete',
    title: 'Active Athlete / High Calorie Burn',
    category: 'Lifestyle & Stage',
    iconName: 'Trophy',
    description: 'Higher energy budget; benefits from high smoke-point oils for intense cooking and quick energy MCTs.',
    keyTargetNutrients: 'Balanced MUFA + PUFA, High Smoke Point Fats'
  },
  {
    id: 'senior_citizen',
    title: 'Senior Citizen Health (60+ Years)',
    category: 'Lifestyle & Stage',
    iconName: 'UserCheck',
    description: 'Requires easy-to-digest oils rich in antioxidants (Vitamin E, Oryzanol) for brain health and joint lubrication.',
    keyTargetNutrients: 'Vitamin E, Oryzanol, Omega-3s'
  }
];

export const COOKING_HABITS = [
  { id: 'raw_drizzle', label: 'Raw Salad Drizzle & Dips', icon: 'Salad', heat: 'No Heat (0°C)' },
  { id: 'saute_low', label: 'Sautéing & Low-Medium Heat', icon: 'CookingPot', heat: 'Low-Medium (100°C - 160°C)' },
  { id: 'indian_tadka', label: 'Indian Tadka / Tempering & Curry Base', icon: 'Flame', heat: 'Medium-High (160°C - 200°C)' },
  { id: 'high_fry', label: 'Deep Frying & High-Heat Stir Fry', icon: 'UtensilsCrossed', heat: 'High Heat (180°C - 240°C)' },
  { id: 'baking', label: 'Baking & Roasting', icon: 'PieChart', heat: 'Medium-High (170°C - 220°C)' }
];
