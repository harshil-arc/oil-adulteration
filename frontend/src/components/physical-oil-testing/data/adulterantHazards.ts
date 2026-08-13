import { AdulterantHazard } from '../types';

export const ADULTERANT_HAZARDS: AdulterantHazard[] = [
  {
    id: 'metanil_yellow',
    name: 'Metanil Yellow (Industrial Azo Dye)',
    chemicalFormulaOrNature: 'C16H12N3NaO3S (Sodium 3-(4-anilinophenylazo)benzenesulfonate)',
    commonlyFoundIn: ['Yellow Mustard Oil', 'Turmeric Infused Oils', 'Desi Ghee / Butter', 'Besan & Pulses'],
    healthImpacts: [
      'Potent neurotoxin that crosses the blood-brain barrier causing cognitive impairment.',
      'Known human mutagen and carcinogen; causes hepatocellular carcinoma and renal tubular necrosis.',
      'Induces severe testicular atrophy and reproductive dysfunction.',
      'Destroys gastric mucosa leading to chronic ulcers.'
    ],
    symptomsOfToxicity: [
      'Gastrointestinal burning and persistent vomiting',
      'Sudden dizziness, lethargy, and motor coordination failure',
      'Allergic skin rashes, eczema, and hyperpigmentation',
      'Long-term chronic organ degeneration'
    ],
    quickDetectionMethod: 'Add 5 mL conc. HCl or strong white vinegar + lemon to 5 mL oil sample and shake. Pure stays yellow/clear. Adulterated turns bright pink or dark magenta in the lower layer.',
    legalStatus: 'Strictly prohibited under FSSAI, FDA, and international food regulations. Classified as non-permitted industrial coal-tar color.'
  },
  {
    id: 'argemone_oil',
    name: 'Argemone Mexicana Oil (Prickly Poppy Seed Oil)',
    chemicalFormulaOrNature: 'Toxic Isoquinoline Alkaloids: Sanguinarine and Dihydrosanguinarine',
    commonlyFoundIn: ['Mustard Oil (Kachi Ghani & Refined)', 'Groundnut Oil', 'Sesame Oil'],
    healthImpacts: [
      'Triggers Epidemic Dropsy (a potentially fatal epidemic disease).',
      'Severe damage to capillary endothelium, leading to massive fluid leakage into tissues.',
      'Congestive heart failure, cardiac arrhythmia, and pulmonary edema.',
      'Bilateral secondary glaucoma, optic nerve atrophy, and permanent blindness.'
    ],
    symptomsOfToxicity: [
      'Bilateral non-inflammatory pitting edema of lower limbs (swollen feet/legs)',
      'Severe breathlessness, tachycardia, and hepatomegaly',
      'Erythema (red skin patches), tenderness, and gastrointestinal cramps',
      'Blurry vision, halo around lights, and elevated intraocular pressure'
    ],
    quickDetectionMethod: 'Nitric acid layer test: 5 mL sample + 5 mL conc. HNO3 shaken gently. Crimson to reddish-brown coloration or precipitate at interface confirms toxic sanguinarine.',
    legalStatus: 'Zero tolerance under FSSAI. Even 0.01% presence is considered a criminal adulteration offense.'
  },
  {
    id: 'liquid_paraffin',
    name: 'Liquid Paraffin & Light Mineral Oils',
    chemicalFormulaOrNature: 'Mixture of refined liquid saturated aliphatic hydrocarbons derived from petroleum distillation (C15–C40)',
    commonlyFoundIn: ['Coconut Oil', 'Mustard Oil', 'Olive Oil', 'Ghee'],
    healthImpacts: [
      'Completely non-biodegradable and indigestible by human digestive enzymes.',
      'Acts as a hydrophobic barrier that strips fat-soluble vitamins (A, D, E, and K) from the gut, causing chronic nutritional deficiency.',
      'Lipid pneumonia if micro-aspirated; chronic mesenteric lymphadenopathy.',
      'Accumulates in the liver, spleen, and intestinal walls causing granulomatous lesions.'
    ],
    symptomsOfToxicity: [
      'Chronic persistent diarrhea (oil seepage) and abdominal bloating',
      'Severe dry skin, night blindness (vitamin A depletion), osteomalacia (vitamin D depletion)',
      'Unexplained weight loss and persistent fatigue'
    ],
    quickDetectionMethod: 'Freezing Test: Pure coconut oil or ghee solidifies completely into a hard block in the fridge (4°C–10°C). Liquid paraffin remains completely liquid, forming a distinct separate oily floating layer.',
    legalStatus: 'Banned in all edible foods globally. Permitted only in industrial lubricants, cosmetics, and medical laxatives under prescription.'
  },
  {
    id: 'spent_frying_oil',
    name: 'Repeatedly Used Spent Cooking Oil (Trans-Fats & TPC)',
    chemicalFormulaOrNature: 'Polymerized triacylglycerols, Total Polar Compounds (TPC > 25%), Acrolein, Acrylamide, and Polycyclic Aromatic Hydrocarbons (PAHs)',
    commonlyFoundIn: ['Street vendor recycled oils', 'Unbranded loose cooking oil', 'Packaged deep frying oil blends'],
    healthImpacts: [
      'Elevates low-density lipoprotein (LDL) cholesterol and causes rapid arterial atherosclerosis.',
      'Severely damages intestinal epithelial tight junctions, inducing leaky gut and systemic inflammation.',
      'High concentrations of mutagenic cyclic fatty acid monomers and free radicals accelerate cellular aging and DNA damage.'
    ],
    symptomsOfToxicity: [
      'Severe acid reflux, heartburn, burning throat sensation (acrolein fumes)',
      'Chronic high blood pressure and vascular stiffness',
      'Fatty liver disease (NAFLD) and metabolic syndrome'
    ],
    quickDetectionMethod: 'Heating Test: Pure oil heats smoothly. Spent recycled oil foams with thick soap-like froth at low temperatures, produces choking acrid smoke, and leaves a sticky dark lacquer-like residue.',
    legalStatus: 'FSSAI mandates discarding any cooking oil where Total Polar Compounds (TPC) exceed 25% under the RUCO (Repurpose Used Cooking Oil) initiative.'
  },
  {
    id: 'vanaspati_transfat',
    name: 'Industrial Vanaspati & Hydrogenated Vegetable Fats',
    chemicalFormulaOrNature: 'Chemically hydrogenated vegetable triglycerides with elevated trans-isomer fatty acid content (>2-5%) and nickel catalyst residues',
    commonlyFoundIn: ['Adulterated Desi Ghee', 'Butter', 'Sweetmeat (Mithai) Cooking Fats'],
    healthImpacts: [
      'Trans-fats double the risk of cardiovascular heart attacks by simultaneously raising bad LDL and reducing good HDL.',
      'Directly promotes systemic vascular endothelial dysfunction and insulin resistance.',
      'Infiltrates cellular membranes, compromising mitochondrial membrane integrity.'
    ],
    symptomsOfToxicity: [
      'Rapid buildup of visceral belly fat and chronic fatigue',
      'Elevated blood triglycerides and premature coronary artery calcification'
    ],
    quickDetectionMethod: 'Baudouin Test / Rapid Melting Check: Ghee adulterated with Vanaspati fails to melt instantly on palm friction and leaves a gritty waxy residue. (Acid + furfural gives crimson red color in presence of sesame oil tracer).',
    legalStatus: 'FSSAI limits trans-fatty acid content in all fats to less than 2% by weight.'
  }
];
