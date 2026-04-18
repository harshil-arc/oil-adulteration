/**
 * Demand Prediction Service
 * Implements a weighted logic prediction model to estimate daily food demand.
 */

function predictDemand(inputData) {
  const {
    historicalAttendanceAverage = 100, // e.g. rolling average of past 7 days
    dayOfWeek, // e.g. 'Monday'
    isHoliday = false,
    event = null,
    activeStudentsCount = 120
  } = inputData;

  // 1. Base Logic
  let predictedCount = historicalAttendanceAverage;

  // 2. Day of week weights (usually weekends have fewer students eating in hostels)
  const dayWeights = {
    'Monday': 1.0,
    'Tuesday': 1.0,
    'Wednesday': 1.0,
    'Thursday': 1.0,
    'Friday': 0.95,
    'Saturday': 0.85,
    'Sunday': 0.85 
  };
  
  const weight = dayWeights[dayOfWeek] || 1.0;
  predictedCount = predictedCount * weight;

  // 3. Holidays & Events Multipliers
  if (isHoliday) {
    predictedCount = predictedCount * 0.7; // 30% drop on holidays
  }
  if (event) {
    if (event.toLowerCase().includes('fest') || event.toLowerCase().includes('special menu')) {
      predictedCount = predictedCount * 1.2; // 20% spike for special meals
    } else if (event.toLowerCase().includes('exam')) {
      predictedCount = predictedCount * 0.9; // Slight drop during exams
    } else if (event.toLowerCase().includes('vacation')) {
      predictedCount = predictedCount * 0.2; // Massive drop during vacations
    }
  }

  // 4. Cap at active students
  if (predictedCount > activeStudentsCount) {
    predictedCount = activeStudentsCount;
  }
  
  // 5. Add some realistic noise (+- 2%)
  const noise = (Math.random() * 0.04 - 0.02) * predictedCount;
  predictedCount = Math.round(predictedCount + noise);

  // Calculate strict bounds
  if (predictedCount < 0) predictedCount = 0;

  // Recommended Food quantity (Assuming ~0.6kg per student)
  const recommendedQuantityKg = Number((predictedCount * 0.6).toFixed(1));

  // Determine Confidence % based on missing inputs
  let confidence = 95;
  if (!dayOfWeek) confidence -= 20;
  if (!historicalAttendanceAverage) confidence -= 30;

  return {
    predictedStudents: predictedCount,
    recommendedFoodKg: recommendedQuantityKg,
    confidencePercentage: confidence,
    factorsApplied: {
      dayWeight: weight,
      isHoliday,
      event
    }
  };
}

module.exports = {
  predictDemand
};
