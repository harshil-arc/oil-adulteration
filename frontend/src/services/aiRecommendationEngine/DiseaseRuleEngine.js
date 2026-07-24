/**
 * DiseaseRuleEngine.js
 * Dynamic Medical & Nutritional Constraint Matrix
 */

export function generateDiseaseRules(medicalConditions = []) {
  const rules = {
    maxSugar: 20,
    maxSodium: 500,
    maxSatFat: 10,
    maxCholesterol: 100,
    maxGI: 75,
    minFiber: 2,
    minProtein: 0,
    minIron: 0,
    minVitC: 0,
    minPotassium: 0,
    maxPotassium: 2000,
    avoidKeywords: [],
    preferKeywords: [],
    activeRuleLabels: []
  };

  medicalConditions.forEach(cond => {
    switch (cond) {
      case 'Diabetes':
        rules.maxSugar = Math.min(rules.maxSugar, 6);
        rules.maxGI = Math.min(rules.maxGI, 55);
        rules.minFiber = Math.max(rules.minFiber, 5);
        rules.avoidKeywords.push('sugar', 'sweet', 'syrup', 'maida', 'jaggery', 'refined flour');
        rules.preferKeywords.push('fenugreek', 'methi', 'oats', 'sprouts', 'moong', 'quinoa', 'karela', 'ragi', 'jowar');
        rules.activeRuleLabels.push('🩸 Low GI & Sugar Control (Diabetes)');
        break;

      case 'Hypertension':
        rules.maxSodium = Math.min(rules.maxSodium, 280);
        rules.minPotassium = Math.max(rules.minPotassium, 300);
        rules.avoidKeywords.push('pickle', 'papad', 'salted', 'processed', 'soya sauce');
        rules.preferKeywords.push('spinach', 'banana', 'garlic', 'lemon', 'coriander');
        rules.activeRuleLabels.push('🫀 Low Sodium & DASH Compliant (Hypertension)');
        break;

      case 'High Cholesterol':
        rules.maxSatFat = Math.min(rules.maxSatFat, 2.5);
        rules.maxCholesterol = Math.min(rules.maxCholesterol, 20);
        rules.avoidKeywords.push('butter', 'cream', 'deep fried', 'lard', 'ghee');
        rules.preferKeywords.push('oats', 'flaxseed', 'almonds', 'olive oil', 'chia');
        rules.activeRuleLabels.push('❤️ Heart Safe & Low Sat Fat (High Cholesterol)');
        break;

      case 'Kidney Disease':
        rules.maxSodium = Math.min(rules.maxSodium, 220);
        rules.maxPotassium = Math.min(rules.maxPotassium, 400);
        rules.activeRuleLabels.push('🧪 Controlled Renal Load (Kidney Disease)');
        break;

      case 'Anemia':
        rules.minIron = Math.max(rules.minIron, 3.5);
        rules.minVitC = Math.max(rules.minVitC, 15);
        rules.preferKeywords.push('spinach', 'palak', 'beetroot', 'poha', 'chana', 'dates', 'lemon');
        rules.activeRuleLabels.push('🩸 High Iron & Vitamin C (Anemia)');
        break;

      case 'PCOS':
        rules.minProtein = Math.max(rules.minProtein, 12);
        rules.maxGI = Math.min(rules.maxGI, 50);
        rules.preferKeywords.push('tofu', 'paneer', 'flaxseed', 'sprouts', 'spearmint');
        rules.activeRuleLabels.push('🌸 Hormone Balanced & Anti-Inflammatory (PCOS)');
        break;

      case 'Fatty Liver':
        rules.maxSugar = Math.min(rules.maxSugar, 5);
        rules.maxSatFat = Math.min(rules.maxSatFat, 3.0);
        rules.preferKeywords.push('green tea', 'turmeric', 'broccoli', 'walnuts');
        rules.activeRuleLabels.push('🩺 Low Refined Sugar & Hepatic Safe (Fatty Liver)');
        break;
    }
  });

  return rules;
}
