/**
 * Event Prediction Service
 * Calculates expected food usage for large-scale events based on weights and multipliers.
 */

function predictEventDemand(eventData) {
  const {
    type = 'corporate', 
    guest_count = 100, 
    food_menu = [], 
    weather_context = 'clear'
  } = eventData;

  // Base consumption per person based on event type (kg)
  const eventMultipliers = {
    wedding: 0.8,
    corporate: 0.5,
    festival: 0.7,
    party: 0.6
  };

  const baseMultiplier = eventMultipliers[type] || 0.5;
  
  // Weather impact: Rain/Extreme cold might reduce attendance slightly, but increase per-capita intake
  const weatherModifier = weather_context.toLowerCase().includes('rain') ? 1.1 : 1.0;

  // Calculate base expected load
  let totalPredictedKg = guest_count * baseMultiplier * weatherModifier;

  // Granular menu impact (more options = slightly higher total buffer)
  if (Array.isArray(food_menu) && food_menu.length > 0) {
    const complexityBuffer = 1 + (food_menu.length * 0.02); // 2% extra per dish
    totalPredictedKg *= complexityBuffer;
  }

  // Derive risk score based on scale (larger events have scaling error bars)
  let wasteRiskScore = Math.min(100, Math.round((guest_count / 1000) * 20 + (food_menu.length * 2)));

  // Confidence is generally higher for smaller, simpler events
  let confidence = Math.max(50, 95 - (guest_count / 500) - (food_menu.length));

  let ai_recommendation = `Optimal prep is ${Math.round(totalPredictedKg)}kg.`;
  if (wasteRiskScore > 40) {
    ai_recommendation += ` High surplus risk detected for ${type} scale. Consider staggered preparation.`;
  }

  return {
    predicted_food_kg: Number(totalPredictedKg.toFixed(1)),
    waste_risk_score: Math.round(wasteRiskScore),
    confidence: Number(confidence.toFixed(1)),
    ai_recommendation
  };
}

module.exports = {
  predictEventDemand
};
