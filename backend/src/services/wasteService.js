/**
 * Food Waste Tracking Service
 */

function calculateWaste(preparedKg, leftoverKg) {
  if (!preparedKg || preparedKg <= 0) {
    return {
      consumedKg: 0,
      wastePercentage: 0,
      status: 'invalid'
    };
  }

  // Calculate consumed
  let consumedKg = preparedKg - leftoverKg;
  if (consumedKg < 0) consumedKg = 0;

  // Calculate Waste percentage
  const wastePercentage = Number(((leftoverKg / preparedKg) * 100).toFixed(1));

  // Determine status
  let status = 'optimal';
  if (wastePercentage > 15) {
    status = 'overproduced';
  } else if (leftoverKg === 0 && consumedKg === preparedKg) {
    // Edge case where everything was consumed, might mean shortage
    status = 'potential_shortage'; 
  }

  return {
    consumedKg: Number(consumedKg.toFixed(1)),
    wastePercentage,
    status
  };
}

module.exports = {
  calculateWaste
};
