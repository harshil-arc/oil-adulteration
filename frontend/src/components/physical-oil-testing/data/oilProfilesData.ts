import { OilProfile } from '../types';

export const OIL_PROFILES: OilProfile[] = [
  {
    id: 'mustard_oil',
    name: 'Mustard Oil (Kachi Ghani / Cold Pressed)',
    hindiName: 'Sarson Ka Tel (सरसों का तेल)',
    commonColor: 'Golden Amber to Dark Yellowish-Brown',
    iconColor: 'bg-amber-500 text-white',
    smokePointPure: '250°C (480°F)',
    naturalConsistency: 'Thick, viscous liquid at room temperature; remains liquid down to ~5°C.',
    primaryAdulterants: [
      {
        name: 'Metanil Yellow & Butter Yellow Dyes',
        whyUsed: 'Added to give cheap refined oil (like palm or rice bran) the intense golden color of cold-pressed mustard oil.',
        healthHazard: 'Highly neurotoxic, carcinogenic, causes testicular damage and stomach ulcers.',
        severity: 'Severe / Fatal'
      },
      {
        name: 'Argemone Mexicana Seed Oil',
        whyUsed: 'Argemone seeds look identical to black mustard seeds and are mixed during harvesting or milling to increase yield cheaply.',
        healthHazard: 'Causes Epidemic Dropsy, severe swelling of limbs, heart failure, glaucoma, and multi-organ damage.',
        severity: 'Severe / Fatal'
      },
      {
        name: 'Cheap Palm Olein & Solvent Washes',
        whyUsed: 'Dilutes expensive cold-pressed oil with low-cost neutral filler fats.',
        healthHazard: 'Clogs arteries, lowers smoke point, contains high trans fats.',
        severity: 'Dangerous'
      },
      {
        name: 'Liquid Paraffin (Mineral Oil)',
        whyUsed: 'Colorless, odorless petroleum byproduct used to cut cost by 50%.',
        healthHazard: 'Causes gastrointestinal tumors, malabsorption of fat-soluble vitamins (A, D, E, K).',
        severity: 'Severe / Fatal'
      }
    ],
    bestTests: ['yellow_mustard_dye_test', 'argemone_nitric_test', 'heating_test', 'paper_blot_test'],
    pureHallmarks: [
      'Natural sharp pungency (allyl isothiocyanate) that produces a mild sting in the eyes and nose.',
      'Rich amber hue that does not stain white paper with synthetic pink/red rings.',
      'High thermal stability—heats without early white froth or black tar deposit.',
      'Does not turn pink when tested with 5 mL concentrated acid / strong vinegar.'
    ],
    spoilageVsAdulteration: 'Pure mustard oil naturally has a very long shelf life due to natural antioxidants (allyl isothiocyanate). If it turns pale, smells like burnt kerosene, or loses all pungency, it is heavily adulterated.'
  },
  {
    id: 'desi_ghee',
    name: 'Desi Cow & Buffalo Ghee',
    hindiName: 'Shuddh Desi Ghee (शुद्ध देसी घी)',
    commonColor: 'Golden Yellow (Cow) to Creamy Pearl White (Buffalo)',
    iconColor: 'bg-yellow-500 text-white',
    smokePointPure: '250°C (482°F)',
    naturalConsistency: 'Granular (Danedar) semi-solid at 20°C; completely liquid and transparent golden above 32°C.',
    primaryAdulterants: [
      {
        name: 'Vanaspati (Hydrogenated Vegetable Oil / Dalda)',
        whyUsed: 'Provides identical granular mouthfeel and solid texture at a fraction of the cost.',
        healthHazard: 'Loaded with industrial trans-fatty acids, causes severe coronary heart disease and liver inflammation.',
        severity: 'Dangerous'
      },
      {
        name: 'Animal Tallow / Industrial Bone Fat',
        whyUsed: 'Cheap slaughterhouse byproducts with similar melting point to dairy fat.',
        healthHazard: 'Religious desecration, toxic microbial residues, high saturated industrial fats.',
        severity: 'Severe / Fatal'
      },
      {
        name: 'Boiled Starch / Mashed Potatoes / Flour',
        whyUsed: 'Cheap carbohydrate bulkers added to increase volume and weight.',
        healthHazard: 'Causes rapid fermentation, bacterial contamination, digestive distress.',
        severity: 'Mild'
      },
      {
        name: 'Coal Tar Yellow Dyes',
        whyUsed: 'Simulates the natural carotene golden hue of expensive A2 cow ghee.',
        healthHazard: 'Carcinogenic, kidney damage, hyperactive allergy responses.',
        severity: 'Severe / Fatal'
      }
    ],
    bestTests: ['iodine_starch_test', 'freezing_test', 'heating_test', 'palm_touch_friction_test'],
    pureHallmarks: [
      'Melts instantly on contact with body heat (palm of hand in 5 seconds).',
      'Granular (Danedar) crystal structure that solidifies homogeneously.',
      'Deep caramelized nutty dairy aroma that intensifies gently when heated.',
      'Turns dark brown immediately on heating without splashing or leaving starch residue.'
    ],
    spoilageVsAdulteration: 'Authentic pure ghee stored in an airtight container lasts over a year without turning sour. If ghee develops a rancid paint-like smell or stays firm on a warm palm, Vanaspati or wax is present.'
  },
  {
    id: 'coconut_oil',
    name: 'Virgin & Cold-Pressed Coconut Oil',
    hindiName: 'Nariyal Ka Tel (नारियल का तेल)',
    commonColor: 'Crystal Clear Liquid above 24°C; Pure Snow White Solid below 24°C',
    iconColor: 'bg-emerald-600 text-white',
    smokePointPure: '177°C (350°F) for unrefined; 204°C for refined',
    naturalConsistency: 'Sharp phase transition: completely solid snow-white block at <24°C, crystal water-clear liquid above.',
    primaryAdulterants: [
      {
        name: 'Liquid Paraffin & Light Mineral Oil',
        whyUsed: 'Colorless, odorless, chemically inert filler that mimics liquid coconut oil.',
        healthHazard: 'Blocks intestinal nutrient absorption, potential carcinogen, liver toxicity.',
        severity: 'Severe / Fatal'
      },
      {
        name: 'Refined Bleached Palm Kernel Oil',
        whyUsed: 'Cheaper lauric fat that imitates solidification curve.',
        healthHazard: 'Promotes arterial plaque, chemically stripped of natural polyphenols.',
        severity: 'Dangerous'
      },
      {
        name: 'Synthetic Coconut Essence',
        whyUsed: 'Masks stale deodorized industrial oil with artificial aroma.',
        healthHazard: 'Headaches, chemical sensitivities.',
        severity: 'Mild'
      }
    ],
    bestTests: ['freezing_test', 'water_bubble_test', 'palm_touch_friction_test', 'paper_blot_test'],
    pureHallmarks: [
      'Freezes uniformly into a clean, rock-solid, snow-white block in the refrigerator (no liquid layer on top).',
      'Melts completely clear and transparent with zero turbidity at 25°C.',
      'Absorbs quickly into skin without leaving a greasy petroleum film.',
      'Smells of sweet fresh coconut flesh, not artificial candy aroma.'
    ],
    spoilageVsAdulteration: 'Virgin coconut oil contains over 50% lauric acid (natural antimicrobial). In winter, complete solidification is normal and a hallmark of purity! Liquid separation indicates mineral oil.'
  },
  {
    id: 'olive_oil',
    name: 'Extra Virgin Olive Oil (EVOO)',
    hindiName: 'Jaitun Ka Tel (जैतून का तेल)',
    commonColor: 'Vibrant Greenish-Gold to Deep Amber Emerald',
    iconColor: 'bg-lime-600 text-white',
    smokePointPure: '190°C–210°C (375°F–410°F)',
    naturalConsistency: 'Silky, medium viscosity liquid; thickens and clouds in refrigerator.',
    primaryAdulterants: [
      {
        name: 'Refined Pomace / Hazelnut Oil / Canola Blend',
        whyUsed: 'Solvent-extracted low-grade oils dyed green to imitate costly cold-pressed EVOO.',
        healthHazard: 'High chemical solvent residues (hexane), loss of vital polyphenols and oleocanthal.',
        severity: 'Dangerous'
      },
      {
        name: 'Industrial Chlorophyll & Beta-Carotene Colorants',
        whyUsed: 'Artificially mimics the vibrant green grassy appearance of harvest-fresh olives.',
        healthHazard: 'Chemical additives, allergen triggers.',
        severity: 'Dangerous'
      },
      {
        name: 'Deodorized Rancid Lampante Oil',
        whyUsed: 'Lowest quality olive oil (historically used for oil lamps) chemically deodorized.',
        healthHazard: 'High oxidation biomarkers, free radical cytotoxicity.',
        severity: 'Dangerous'
      }
    ],
    bestTests: ['freezing_test', 'heating_test', 'palm_touch_friction_test'],
    pureHallmarks: [
      'Peppery, grassy, bitter "catch" at the back of the throat due to high Oleocanthal antioxidants.',
      'Thickens and turns cloudy/semi-solid with uniform gel-like consistency in refrigerator (4°C) within 24 hours.',
      'Fresh botanical, cut-grass, green tomato aroma.',
      'Leaves clean non-greasy fruit sheen on skin.'
    ],
    spoilageVsAdulteration: 'EVOO degrades from heat, light, and air. Pure EVOO should be purchased in dark glass tins. If EVOO smells like crayons, motor oil, or vinegar, it has oxidized or was blended with seed oils.'
  },
  {
    id: 'groundnut_oil',
    name: 'Groundnut / Peanut Oil',
    hindiName: 'Moongfali Ka Tel (मूंगफली का तेल)',
    commonColor: 'Clear Pale Yellow to Deep Golden',
    iconColor: 'bg-orange-600 text-white',
    smokePointPure: '225°C (437°F)',
    naturalConsistency: 'Free-flowing golden liquid with high viscosity.',
    primaryAdulterants: [
      {
        name: 'Cottonseed Oil (Contains Gossypol)',
        whyUsed: 'Cheap industrial byproduct seed oil.',
        healthHazard: 'Gossypol causes reproductive toxicity, male infertility, and liver congestion.',
        severity: 'Severe / Fatal'
      },
      {
        name: 'Mineral Oil / Spindle Oil',
        whyUsed: 'Colorless extender.',
        healthHazard: 'Carcinogenic polycyclic aromatic hydrocarbons (PAHs).',
        severity: 'Severe / Fatal'
      }
    ],
    bestTests: ['heating_test', 'freezing_test', 'water_bubble_test', 'paper_blot_test'],
    pureHallmarks: [
      'Distinct warm roasted peanut aroma.',
      'High thermal stability for deep frying with zero sticky residue.',
      'Becomes thick and cloudy under cold refrigeration without hard phase separation.'
    ],
    spoilageVsAdulteration: 'Cold pressed peanut oil has high monounsaturated oleic acid. High frothing or bitter chemical aftertaste signifies cottonseed oil dilution.'
  },
  {
    id: 'sesame_oil',
    name: 'Sesame Oil (Gingelly / Til Oil)',
    hindiName: 'Til Ka Tel (तिल का तेल)',
    commonColor: 'Dark Amber (Roasted) or Pale Golden (Raw / Cold Pressed)',
    iconColor: 'bg-stone-600 text-white',
    smokePointPure: '210°C (410°F)',
    naturalConsistency: 'Dense aromatic liquid rich in natural lignans (Sesamol & Sesamolin).',
    primaryAdulterants: [
      {
        name: 'Crude Palm Olein with Artificial Sesame Flavoring',
        whyUsed: 'Replaces expensive sesame seeds with cheap palm oil + synthetic essence.',
        healthHazard: 'High saturated trans fat content, synthetic chemical irritants.',
        severity: 'Dangerous'
      },
      {
        name: 'Refined Soy / Cottonseed Oil Blend',
        whyUsed: 'Cheap seed oil diluent.',
        healthHazard: 'Allergen risks, oxidative instability.',
        severity: 'Dangerous'
      }
    ],
    bestTests: ['heating_test', 'paper_blot_test', 'palm_touch_friction_test', 'water_bubble_test'],
    pureHallmarks: [
      'Intense, warm, toasted nutty aroma that lingers permanently.',
      'Sesamol content gives extreme oxidative stability.',
      'Smooth absorption when rubbed on hands.'
    ],
    spoilageVsAdulteration: 'Pure sesame oil rarely goes rancid quickly due to sesamol antioxidant power. If the nutty aroma vanishes when heated, synthetic essence was used.'
  }
];
