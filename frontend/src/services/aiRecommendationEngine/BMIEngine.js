/**
 * BMIEngine.js
 * Professional Body Mass Index (BMI) & Biometric Intelligence Engine
 */

export function calculateBMI(weightKg, heightCm) {
  const weight = parseFloat(weightKg) || 65;
  const height = parseFloat(heightCm) || 168;

  if (height <= 0 || weight <= 0) {
    return {
      bmi: 22.0,
      category: 'Healthy',
      healthyWeightRange: { min: 52, max: 70 },
      color: '#10b981',
      advice: 'Maintain your balanced diet and regular physical activity.'
    };
  }

  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

  const minWeight = Math.round(18.5 * heightM * heightM);
  const maxWeight = Math.round(24.9 * heightM * heightM);

  let category = 'Healthy';
  let color = '#10b981';
  let advice = 'Your BMI is in the healthy range. Focus on nutrient-dense meals and physical wellness.';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#3b82f6';
    advice = 'Focus on calorie-dense, protein-rich whole foods with healthy fats to build lean mass.';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    color = '#f59e0b';
    advice = 'Aim for a slight calorie deficit with high soluble fiber and high protein for satiety.';
  } else if (bmi >= 30) {
    category = 'Obese';
    color = '#ef4444';
    advice = 'Focus on structured calorie deficit, low glycemic meals, and consistent hydration.';
  }

  return {
    bmi,
    category,
    healthyWeightRange: { min: minWeight, max: maxWeight },
    color,
    advice
  };
}
