import { OILS_DATABASE } from '../data/oilsData.js';

// Condition profile definitions with specific hero oils, secondary oils, avoid oils, and scientific rationales
export const CONDITION_RULES = {
  cholesterol: {
    heroOils: {
      rice_bran_oil: { bonus: 55, reason: 'High Gamma-Oryzanol (10,000+ ppm) clinically lowers bad LDL cholesterol & total cholesterol' },
      evoo: { bonus: 45, reason: 'High Oleic acid (73% MUFA) prevents LDL oxidation, stopping arterial plaque formation' },
      safflower_oil_high_oleic: { bonus: 40, reason: 'High-Oleic fatty acids improve HDL/LDL cholesterol ratio and prevent lipid peroxidation' },
      mustard_oil: { bonus: 30, reason: 'Optimal 1:1 Omega-3 to Omega-6 balance supports healthy arterial lipid clearance' }
    },
    avoidOils: {
      virgin_coconut_oil: { penalty: 60, reason: '87% Saturated Fat (lauric/myristic/palmitic acids) significantly raises circulating LDL-C' },
      palm_oil: { penalty: 70, reason: '50% Palmitic acid directly downregulates LDL clearance receptors, spiking bad LDL cholesterol' },
      vanaspati_transfat: { penalty: 100, reason: 'Industrial trans fats double LDL while actively depleting protective HDL cholesterol' },
      a2_desi_ghee: { penalty: 45, reason: 'High saturated fat (62%) requires strict limit to prevent elevated ApoB / LDL levels' },
      sunflower_oil_standard: { penalty: 35, reason: 'Excessive Omega-6 (65%) without Omega-3 balance promotes oxidized LDL plaque buildup' }
    },
    rotation: 'Use Physically Refined Rice Bran Oil (rich in Oryzanol) for 2 months, then rotate with Cold-Pressed Mustard Oil. Use Extra Virgin Olive Oil for low-heat cooking and raw salads to keep LDL low.'
  },
  heart_disease: {
    heroOils: {
      flaxseed_oil: { bonus: 55, reason: '53% ALA Omega-3 reduces arrhythmia risk, plaque instability, and arterial inflammation' },
      evoo: { bonus: 50, reason: 'Oleocanthal & polyphenols restore vascular endothelial nitric oxide and arterial elasticity' },
      rice_bran_oil: { bonus: 40, reason: 'Oryzanol and Tocotrienols protect coronary vessels and lower arterial stiffness' },
      mustard_oil: { bonus: 35, reason: 'Cardioprotective ALA Omega-3 and near 1:1 balance of essential fatty acids' }
    },
    avoidOils: {
      vanaspati_transfat: { penalty: 100, reason: 'Industrial trans fats induce severe endothelial injury, vascular calcification, and double cardiac event risk' },
      palm_oil: { penalty: 70, reason: 'High palmitic saturated fat accelerates coronary artery plaque deposition and arterial narrowing' },
      virgin_coconut_oil: { penalty: 50, reason: 'High saturated fat burden elevates atherogenic ApoB particle count in heart disease patients' },
      sunflower_oil_standard: { penalty: 40, reason: 'Excessive Omega-6 linoleic acid fuels chronic arterial endothelial inflammation' }
    },
    rotation: 'Use Extra Virgin Olive Oil for sautéing/salads, and rotate cooking with Cold-Pressed Mustard or Rice Bran Oil. Include 1 tsp raw Flaxseed Oil daily for cardiac Omega-3 protection.'
  },
  hypertension: {
    heroOils: {
      sesame_oil: { bonus: 55, reason: 'Sesamol and Sesamolin clinically proven in human trials to lower systolic and diastolic blood pressure' },
      walnut_oil: { bonus: 50, reason: 'ALA Omega-3 & Ellagitannins reduce arterial vascular stiffness and lower blood pressure spikes' },
      flaxseed_oil: { bonus: 40, reason: 'High ALA Omega-3 promotes vasodilatory prostacyclin release, easing arterial resistance' },
      evoo: { bonus: 35, reason: 'Polyphenols enhance endothelial nitric oxide bioavailability, relaxing arterial walls' }
    },
    avoidOils: {
      vanaspati_transfat: { penalty: 100, reason: 'Trans fatty acids cause severe arterial wall stiffening and impair flow-mediated vasodilation' },
      palm_oil: { penalty: 60, reason: 'Heavy saturated fats impair endothelial nitric oxide production, increasing vascular resistance' }
    },
    rotation: 'Use Cold-Pressed Sesame (Til) Oil as primary cooking oil for 2 months to activate BP-lowering sesamol, rotating with Mustard Oil or Olive Oil.'
  },
  diabetes: {
    heroOils: {
      groundnut_oil: { bonus: 55, reason: 'Rich in Resveratrol, activating SIRT1 pathways to boost cellular GLUT4 glucose uptake' },
      sesame_oil: { bonus: 50, reason: 'Clinically shown to synergize with diabetes therapy, lowering fasting blood glucose and HbA1c' },
      safflower_oil_high_oleic: { bonus: 45, reason: 'High Oleic acid improves cell membrane fluidity, allowing insulin receptors to bind effectively' },
      avocado_oil: { bonus: 35, reason: 'High MUFA content prevents post-meal glycemic surges and stabilizes insulin response' }
    },
    avoidOils: {
      palm_oil: { penalty: 70, reason: 'Palmitic acid accumulates as diacylglycerol in muscle cells, blocking insulin receptor signaling' },
      vanaspati_transfat: { penalty: 100, reason: 'Trans fats induce severe pancreatic beta-cell stress and worsen systemic insulin resistance' },
      sunflower_oil_standard: { penalty: 40, reason: 'Excessive Omega-6 linoleic acid promotes low-grade inflammatory stress on insulin pathways' }
    },
    rotation: 'Cook with Wood-Pressed Groundnut Oil and Cold-Pressed Sesame Oil in alternating 2-month cycles. Avoid all trans fats and palm oil to maintain insulin receptor sensitivity.'
  },
  fatty_liver: {
    heroOils: {
      evoo: { bonus: 55, reason: 'Clinical gold standard: proven to decrease intrahepatic lipid accumulation and normalize liver enzymes (ALT/AST)' },
      avocado_oil: { bonus: 50, reason: 'Oleic acid and glutathione precursors protect hepatocytes against ballooning necrosis and steatohepatitis' },
      flaxseed_oil: { bonus: 45, reason: 'ALA Omega-3 inhibits hepatic de novo lipogenesis (SREBP-1c) and reduces liver fat content' },
      rice_bran_oil: { bonus: 35, reason: 'Gamma-Oryzanol reduces liver fat accumulation and oxidative stress in hepatocytes' }
    },
    avoidOils: {
      palm_oil: { penalty: 70, reason: 'Palmitic acid causes direct hepatocyte lipotoxicity, ER stress, and accelerates non-alcoholic steatohepatitis (NASH)' },
      virgin_coconut_oil: { penalty: 55, reason: 'High saturated fatty acids overload hepatic mitochondrial beta-oxidation in fatty liver disease' },
      a2_desi_ghee: { penalty: 45, reason: 'Excess saturated fats burden an already congested, fatty liver; strict reduction advised' },
      sunflower_oil_standard: { penalty: 40, reason: 'High Omega-6 linoleic acid promotes liver macrophage inflammation and lipid peroxidation' },
      vanaspati_transfat: { penalty: 100, reason: 'Trans fats accelerate the progression from simple liver steatosis to hepatic fibrosis' }
    },
    rotation: 'Adopt Extra Virgin Olive Oil as your primary oil for low/medium heat, paired with High-Oleic Safflower or Avocado Oil for higher heat. Strictly avoid saturated oils like Palm, Coconut, and Ghee.'
  },
  arthritis: {
    heroOils: {
      flaxseed_oil: { bonus: 60, reason: '53% ALA Omega-3 competes with arachidonic acid, dramatically reducing inflammatory PGE2 and joint stiffness' },
      evoo: { bonus: 50, reason: 'Contains Oleocanthal, a natural COX-1 and COX-2 inhibitor with pain-relieving potency comparable to low-dose ibuprofen' },
      mustard_oil: { bonus: 45, reason: 'Allyl isothiocyanate and balanced 1:1 Omega-3:6 soothe chronic synovial inflammation' },
      sesame_oil: { bonus: 35, reason: 'Sesamin reduces pro-inflammatory cytokine secretion (TNF-alpha, IL-1beta) in articular cartilage' }
    },
    avoidOils: {
      sunflower_oil_standard: { penalty: 75, reason: '65% Omega-6 Linoleic acid converts directly into Arachidonic Acid, triggering intense joint flare-ups and cartilage breakdown' },
      soybean_oil: { penalty: 65, reason: 'High Omega-6 content without balancing Omega-3s drives pro-inflammatory leukotriene production' },
      cottonseed_oil: { penalty: 65, reason: 'Excess Omega-6 and chemical processing residues exacerbate rheumatoid and osteoarthritic inflammation' },
      vanaspati_transfat: { penalty: 100, reason: 'Trans fats trigger massive spikes in systemic inflammatory cytokines (IL-6 and TNF-alpha)' }
    },
    rotation: 'Prioritize Cold-Pressed Mustard Oil for daily cooking and consume 1-2 tsp Cold-Pressed Flaxseed Oil raw daily. Strictly eliminate high Omega-6 sunflower, soybean, and cottonseed oils.'
  },
  weight_loss: {
    heroOils: {
      virgin_coconut_oil: { bonus: 45, reason: 'Medium Chain Triglycerides (MCTs) undergo direct hepatic oxidation, boosting 24-hr metabolic thermogenesis and satiety' },
      evoo: { bonus: 45, reason: 'Stimulates gut release of Oleoylethanolamide (OEA), a lipid messenger that activates satiety centers in the brain' },
      safflower_oil_high_oleic: { bonus: 40, reason: 'High-oleic monounsaturated fats provide clean metabolic fuel without promoting adipose accumulation' },
      groundnut_oil: { bonus: 35, reason: 'High satiety index helps prevent between-meal cravings and sugar spikes' }
    },
    avoidOils: {
      vanaspati_transfat: { penalty: 100, reason: 'Trans fats disrupt brain leptin signaling, promoting uncontrollable hunger and visceral abdominal fat deposition' },
      palm_oil: { penalty: 60, reason: 'Palmitic acid promotes central leptin resistance, impairing metabolic satiety feedback' }
    },
    rotation: 'Limit total oil to 12 ml/day (~2.5 tsp). Rotate between Extra Virgin Olive Oil and Cold-Pressed Groundnut Oil, keeping a strict cap on all dietary fats.'
  },
  thyroid: {
    heroOils: {
      virgin_coconut_oil: { bonus: 60, reason: 'Medium Chain Fatty Acids (Lauric acid) stimulate sluggish thyroid metabolism and increase cellular basal metabolic rate' },
      mustard_oil: { bonus: 45, reason: 'Traditional cold-pressed fat free of goitrogenic compounds or endocrine-disrupting solvent residues' },
      groundnut_oil: { bonus: 40, reason: 'Wood-pressed monounsaturated fat provides clean metabolic nourishment without interfering with T3/T4 conversion' },
      evoo: { bonus: 35, reason: 'Potent polyphenols protect thyroid follicular cells from autoimmune oxidative stress' }
    },
    avoidOils: {
      soybean_oil: { penalty: 80, reason: 'Soy isoflavones and solvent-processed soybean oil inhibit Thyroid Peroxidase (TPO), impairing T4-to-T3 hormone synthesis' },
      vanaspati_transfat: { penalty: 100, reason: 'Trans fats impair cellular membrane receptor sensitivity to active thyroid hormones' },
      cottonseed_oil: { penalty: 60, reason: 'Non-food crop solvent residues and chemical pesticides stress endocrine thyroid pathways' }
    },
    rotation: 'Use Virgin Cold-Pressed Coconut Oil (1-2 tsp) and Cold-Pressed Mustard Oil for cooking. Strictly eliminate refined soybean and cottonseed oils to protect thyroid hormone conversion.'
  },
  ibs_gut: {
    heroOils: {
      a2_desi_ghee: { bonus: 60, reason: 'Richest source of Butyric Acid, which fuels colonocytes, repairs tight junctions, and heals leaky gut mucosa' },
      virgin_coconut_oil: { bonus: 45, reason: 'Lauric acid converts to Monolaurin, eliminating pathogenic bacteria (H. pylori, Candida) while preserving healthy gut flora' },
      sesame_oil: { bonus: 40, reason: 'Ayurvedic gut soother: lubricates the GI tract and calms spastic intestinal cramping' },
      mustard_oil: { bonus: 35, reason: 'Stimulates digestive gastric secretions and bile flow, improving digestion of heavy foods' }
    },
    avoidOils: {
      cottonseed_oil: { penalty: 70, reason: 'Chemical solvent extraction residues (hexane) irritate sensitive intestinal epithelial lining and trigger IBS flare-ups' },
      soybean_oil: { penalty: 60, reason: 'Solvent residues and high free-radical load exacerbate intestinal mucosal inflammation' },
      palm_oil: { penalty: 60, reason: 'Heavy saturated palmitic fats trigger sluggish gastric emptying and digestive distress in sensitive stomachs' },
      vanaspati_transfat: { penalty: 100, reason: 'Damaging to beneficial microbiome diversity; promotes gut dysbiosis and severe gas/bloating' }
    },
    rotation: 'Cook with 1-2 tsp A2 Desi Cow Ghee for gut barrier healing, alternating with Cold-Pressed Sesame Oil and Virgin Coconut Oil. Completely avoid solvent-extracted refined commercial oils.'
  },
  pregnancy: {
    heroOils: {
      flaxseed_oil: { bonus: 55, reason: 'Supplies essential plant Omega-3 ALA, vital for fetal brain architecture, cognitive development, and retinal growth' },
      a2_desi_ghee: { bonus: 50, reason: 'Delivers natural Vitamins A, D, E, K2 and nourishing fats essential for placental health and maternal vitality' },
      walnut_oil: { bonus: 45, reason: 'Neuroprotective Omega-3 and polyphenols support maternal nervous system and fetal neurodevelopment' },
      evoo: { bonus: 35, reason: 'Safe, unrefined source of Vitamin E and Oleic acid, gentle on maternal digestion' }
    },
    avoidOils: {
      cottonseed_oil: { penalty: 80, reason: 'Extracted from pesticide-heavy cotton crop; potential traces of toxic gossypol pose grave developmental hazards' },
      vanaspati_transfat: { penalty: 100, reason: 'Trans fats cross the placenta into fetal membranes, impairing neurocognitive development and fetal growth' },
      sunflower_oil_standard: { penalty: 50, reason: 'Excessive Omega-6 triggers maternal inflammatory pathways that can elevate pre-eclampsia risk' }
    },
    rotation: 'Incorporate 1 tsp A2 Desi Ghee into warm meals and drizzle 1 tsp raw Flaxseed or Walnut oil on salads/curds. Cook daily with Cold-Pressed Mustard or Olive Oil.'
  },
  active_athlete: {
    heroOils: {
      virgin_coconut_oil: { bonus: 50, reason: 'MCT fats provide rapid non-glycemic muscular fuel, sparing muscle glycogen during intense endurance workouts' },
      avocado_oil: { bonus: 45, reason: 'Highest smoke point (270°C) allows high-heat nutrient preparation without generating toxic acrylamides' },
      mustard_oil: { bonus: 40, reason: 'High heat tolerance and natural allyl isothiocyanate stimulate muscular blood circulation and recovery' },
      a2_desi_ghee: { bonus: 35, reason: 'High smoke point (250°C) and CLA support joint lubrication and sustained energy' }
    },
    avoidOils: {
      vanaspati_transfat: { penalty: 100, reason: 'Inhibits muscle mitochondrial respiratory efficiency and dramatically exacerbates post-workout delayed onset muscle soreness (DOMS)' },
      sunflower_oil_standard: { penalty: 50, reason: 'High Omega-6 triggers unmitigated free-radical damage during heavy athletic exertion' }
    },
    rotation: 'Utilize Virgin Coconut Oil before high-intensity training for rapid energy, and Avocado or Mustard Oil for cooking high-protein recovery meals.'
  },
  senior_citizen: {
    heroOils: {
      walnut_oil: { bonus: 55, reason: 'Ellagitannins and ALA Omega-3 cross the blood-brain barrier, providing vital protection against memory decline and dementia' },
      evoo: { bonus: 50, reason: 'Polyphenols prevent vascular endothelial aging, lower stroke risk, and protect against macular degeneration' },
      sesame_oil: { bonus: 45, reason: 'Rich in Sesamol and natural minerals to preserve bone density and lubricate aging joints' },
      rice_bran_oil: { bonus: 35, reason: 'Gamma-Oryzanol protects aging cardiac tissue and improves lipid metabolism' }
    },
    avoidOils: {
      vanaspati_transfat: { penalty: 100, reason: 'Severe risk factor for ischemic strokes, arterial stiffening, and accelerated cognitive impairment in older adults' },
      palm_oil: { penalty: 70, reason: 'Palmitic acid accelerates vascular arterial stiffness and arterial plaque vulnerability' }
    },
    rotation: 'Cook with Cold-Pressed Sesame Oil and Extra Virgin Olive Oil, adding 1 tsp raw Walnut Oil daily to preserve brain memory and joint mobility.'
  }
};

export function calculateOilRecommendations(profile) {
  const { selectedConditions = [], cookingHabits = [], ageGroup = '', weightKg, activityLevel = '', householdMembers = 1 } = profile;

  // Calculate daily intake target in ml per person
  let baseTargetMl = 15; // standard medical recommendation: 3 tsp = 15 ml per adult per day

  if (selectedConditions.includes('weight_loss') || selectedConditions.includes('fatty_liver')) {
    baseTargetMl = 12; // lower fat allowance for weight loss & NAFLD
  } else if (selectedConditions.includes('heart_disease') || selectedConditions.includes('cholesterol')) {
    baseTargetMl = 15; // strict cap at 15ml (3 tsp)
  } else if (selectedConditions.includes('active_athlete') || activityLevel === 'athlete') {
    baseTargetMl = 25; // higher for high caloric demand
  } else if (activityLevel === 'active') {
    baseTargetMl = 20;
  }

  if (ageGroup === 'Senior (60+ yrs)') {
    baseTargetMl = Math.min(baseTargetMl, 15);
  } else if (ageGroup === 'Child / Teen (<18 yrs)') {
    baseTargetMl = 18;
  }

  if (weightKg && weightKg > 85 && !selectedConditions.includes('weight_loss')) {
    baseTargetMl += 2;
  }

  const dailyTargetMl = baseTargetMl;
  const dailyTargetTsp = Math.round((dailyTargetMl / 5) * 10) / 10;

  // Monthly household recommendation in Liters
  const members = Math.max(1, householdMembers || 1);
  const monthlyHouseholdLiters = Math.round(((dailyTargetMl * members * 30) / 1000) * 10) / 10;

  // Score each oil
  const scoredOils = OILS_DATABASE.map(oil => {
    let score = 50; // base score
    const reasons = [];
    const avoidReasons = [];
    let conditionContraindicated = false;

    // Condition matches
    selectedConditions.forEach(condId => {
      const rule = CONDITION_RULES[condId];

      if (rule) {
        if (rule.heroOils[oil.id]) {
          score += rule.heroOils[oil.id].bonus;
          reasons.push(rule.heroOils[oil.id].reason);
        } else if (oil.suitableForConditions.includes(condId)) {
          score += 20;
          reasons.push(`Clinically supportive fatty acid profile for ${condId.replace('_', ' ')}`);
        }

        if (rule.avoidOils[oil.id]) {
          score -= rule.avoidOils[oil.id].penalty;
          avoidReasons.push(rule.avoidOils[oil.id].reason);
          conditionContraindicated = true;
        } else if (oil.avoidForConditions.includes(condId)) {
          score -= 40;
          avoidReasons.push(`Not recommended for ${condId.replace('_', ' ')} due to potential metabolic stress`);
          conditionContraindicated = true;
        }
      } else {
        // Fallback for any unknown condition
        if (oil.suitableForConditions.includes(condId)) {
          score += 25;
          reasons.push(`Nutritionally compatible with ${condId.replace('_', ' ')}`);
        }
        if (oil.avoidForConditions.includes(condId)) {
          score -= 40;
          avoidReasons.push(`Avoided for ${condId.replace('_', ' ')}`);
          conditionContraindicated = true;
        }
      }
    });

    // Cooking habit matches
    if (cookingHabits.includes('high_fry')) {
      if (oil.suitableCooking.highHeatFrying) {
        score += 15;
      } else {
        score -= 30;
        avoidReasons.push('Smoke point too low for deep frying (creates toxic breakdown products)');
      }
    }

    if (cookingHabits.includes('indian_tadka')) {
      if (oil.suitableCooking.indianTadka) {
        score += 10;
      }
    }

    if (cookingHabits.includes('raw_drizzle')) {
      if (oil.suitableCooking.rawDrizzle) {
        score += 20;
        reasons.push('Ideal for unheated raw drizzle, preserving polyphenols & Vitamin E');
      }
    }

    // Processing quality
    if (oil.processingType === 'Cold-Pressed / Kachi Ghani' || oil.processingType === 'Unrefined / Virgin') {
      score += 10;
    }

    // Default penalties for universal avoid oils
    if (oil.processingType === 'Hydrogenated / Trans Fat') {
      score = -100;
      if (avoidReasons.length === 0) {
        avoidReasons.push('Contains harmful trans fats that double cardiovascular risk and elevate LDL');
      }
    } else if (oil.category === 'Avoid Oils') {
      score = Math.min(score, 15);
      if (avoidReasons.length === 0) {
        avoidReasons.push('Heavy industrial chemical refinement and unfavorable fatty acid profile');
      }
    }

    // Deduplicate reasons
    const uniqueReasons = Array.from(new Set(reasons));
    const uniqueAvoidReasons = Array.from(new Set(avoidReasons));

    return {
      oil,
      score,
      conditionContraindicated,
      reasons: uniqueReasons,
      avoidReasons: uniqueAvoidReasons
    };
  });

  // Filter recommended oils (score >= 50, not in Avoid Oils, not contraindicated)
  const recommendedList = scoredOils
    .filter(item => item.score >= 50 && item.oil.category !== 'Avoid Oils' && !item.conditionContraindicated)
    .sort((a, b) => b.score - a.score)
    .map(item => {
      // Calculate custom quantity breakdown
      let qtyStr = `${Math.round(dailyTargetMl * 0.6)} ml/day (~${Math.round((dailyTargetTsp * 0.6) * 10) / 10} tsp) for cooking`;
      if (item.oil.id === 'flaxseed_oil' || item.oil.id === 'walnut_oil') {
        qtyStr = '1 - 2 tsp/day (RAW ONLY, do not heat)';
      } else if (item.oil.id === 'a2_desi_ghee' || item.oil.id === 'virgin_coconut_oil') {
        qtyStr = '1 tsp/day (Strict limit)';
      }

      const bestMethods = [];
      if (item.oil.suitableCooking.rawDrizzle) bestMethods.push('Raw Drizzle / Salad');
      if (item.oil.suitableCooking.sauteing) bestMethods.push('Sautéing / Stir-fry');
      if (item.oil.suitableCooking.indianTadka) bestMethods.push('Indian Tadka');
      if (item.oil.suitableCooking.highHeatFrying) bestMethods.push('Deep Frying');

      return {
        oil: item.oil,
        score: item.score,
        reasons: item.reasons.length > 0 ? item.reasons : ['Provides clean, balanced essential fatty acids and antioxidants'],
        recommendedQuantity: qtyStr,
        bestMethods
      };
    });

  // Filter oils to avoid, prioritizing condition-contraindicated oils first
  const avoidList = scoredOils
    .filter(item => item.score < 45 || item.oil.category === 'Avoid Oils' || item.conditionContraindicated || item.avoidReasons.length > 0)
    .sort((a, b) => {
      // Condition-contraindicated oils first
      if (a.conditionContraindicated && !b.conditionContraindicated) return -1;
      if (!a.conditionContraindicated && b.conditionContraindicated) return 1;
      return a.score - b.score;
    })
    .map(item => {
      let altSwap = 'Switch to Cold-Pressed Mustard or Groundnut Oil';
      if (item.oil.id === 'vanaspati_transfat') altSwap = 'Replace with Cold-Pressed Mustard or Wood-Pressed Groundnut Oil';
      if (item.oil.id === 'palm_oil') altSwap = 'Replace with Physically Refined Rice Bran Oil or Extra Virgin Olive Oil';
      if (item.oil.id === 'sunflower_oil_standard') altSwap = 'Replace with High-Oleic Safflower Oil or Cold-Pressed Sesame Oil';
      if (item.oil.id === 'virgin_coconut_oil') altSwap = 'Replace with Extra Virgin Olive Oil or Rice Bran Oil (zero saturated fat spike)';
      if (item.oil.id === 'a2_desi_ghee') altSwap = 'Replace with Cold-Pressed Mustard Oil or Cold-Pressed Sesame Oil';
      if (item.oil.id === 'soybean_oil') altSwap = 'Replace with Cold-Pressed Mustard or Virgin Coconut Oil';
      if (item.oil.id === 'cottonseed_oil') altSwap = 'Replace with Cold-Pressed Groundnut or Mustard Oil';

      return {
        oil: item.oil,
        reasons: item.avoidReasons.length > 0 ? item.avoidReasons : ['Unfavorable fatty acid profile or high refinement for your health conditions'],
        alternativeSwap: altSwap
      };
    });

  // Select Rotation Strategy
  const primaryOil = recommendedList[0]?.oil || OILS_DATABASE[0];
  const secondaryOil = recommendedList.find(i => i.oil.id !== primaryOil.id)?.oil || OILS_DATABASE[1];

  let rotationStrategy = `Rotate every 1-2 months between ${primaryOil.name} and ${secondaryOil.name} to maintain an ideal 1:1 balance between Monounsaturated (MUFA) and Polyunsaturated (PUFA) fats while preventing Omega-6 buildup.`;
  for (const condId of selectedConditions) {
    if (CONDITION_RULES[condId]?.rotation) {
      rotationStrategy = CONDITION_RULES[condId].rotation;
      break;
    }
  }

  return {
    recommendedOils: recommendedList.slice(0, 5),
    avoidOils: avoidList.slice(0, 5),
    dailyOilTargetMl: dailyTargetMl,
    dailyOilTargetTsp: dailyTargetTsp,
    monthlyHouseholdLiters: monthlyHouseholdLiters,
    rotationSuggestion: {
      primary: primaryOil,
      secondary: secondaryOil,
      strategy: rotationStrategy
    }
  };
}
