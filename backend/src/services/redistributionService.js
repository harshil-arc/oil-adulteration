/**
 * Redistribution Service
 * Matches surplus to NGOs and manages volunteer logistics.
 */

// Helper to simulate Haversine distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Math.random() * 20; // fallback random 0-20km
  
  const R = 6371; // km
  const dLat = (lat2-lat1) * Math.PI / 180;
  const dLon = (lon2-lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function selectOptimalNGO(surplusLat, surplusLng, availableNGOs) {
  if (!availableNGOs || availableNGOs.length === 0) return null;

  // Rank based on: Distance + Urgency
  return availableNGOs.map(ngo => {
    const distanceKm = calculateDistance(surplusLat, surplusLng, ngo.location_lat, ngo.location_lng);
    // Score logic: Lower is better (closest + highest capacity needed)
    const capacityScore = ngo.urgency_multiplier || 1.0; 
    const finalScore = distanceKm / capacityScore;
    
    return { ...ngo, distanceKm, finalScore };
  }).sort((a, b) => a.finalScore - b.finalScore)[0];
}

function assignVolunteer(donationId, volunteers) {
  // Simplistic round-robin or nearest volunteer
  return volunteers.length > 0 ? volunteers[0].id : null;
}

module.exports = {
  calculateDistance,
  selectOptimalNGO,
  assignVolunteer
};
