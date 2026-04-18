/**
 * Smart Donation System Service
 */

// Leftover food above this kg will trigger an NGO donation alert
const DONATION_THRESHOLD_KG = 5.0; 

function checkDonationTrigger(leftoverKg) {
  if (leftoverKg >= DONATION_THRESHOLD_KG) {
    return {
      triggerDonation: true,
      donationAmountKg: leftoverKg,
      message: `Surplus food detected (${leftoverKg} kg). Recommending NGO donation.`
    };
  }

  return {
    triggerDonation: false,
    donationAmountKg: 0,
    message: "Leftover within manageable limits."
  };
}

module.exports = {
  checkDonationTrigger,
  DONATION_THRESHOLD_KG
};
