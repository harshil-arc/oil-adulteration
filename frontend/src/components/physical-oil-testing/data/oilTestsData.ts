import { OilTest } from '../types';

export const OIL_TESTS: OilTest[] = [
  {
    id: 'freezing_test',
    title: 'Freezing & Solidification Test',
    subtitle: 'Detects mineral oil, cheap palm oil blends, and solvent dilution by phase separation.',
    category: 'Freezing & Cooling',
    targetOils: ['Coconut Oil', 'Desi Ghee / Butter', 'Olive Oil', 'Mustard Oil'],
    adulterantsDetected: ['Liquid Paraffin', 'Mineral Oils', 'Low-grade Palm Stearin Blend', 'Excess Moisture / Water'],
    difficulty: 'Very Easy',
    estimatedDuration: '2 - 3 Hours (or 30 mins in freezer)',
    durationSeconds: 7200,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Small transparent glass container / bowl', isHousehold: true },
      { name: 'Home Refrigerator / Freezer', isHousehold: true },
      { name: 'Spoon / Dropper', isHousehold: true },
    ],
    safetyWarning: 'Ensure the glass container is dry. Moisture or ice crystals inside the bowl will create false cloudiness.',
    steps: [
      {
        stepNumber: 1,
        title: 'Prepare Dry Transparent Glass',
        instructions: 'Take a small, clean, completely dry transparent glass tumbler or small glass bowl. Wipe with a dry cloth.',
        tip: 'Glass allows clear visual inspection of distinct liquid and solid layers.',
      },
      {
        stepNumber: 2,
        title: 'Pour Sample Oil',
        instructions: 'Pour approximately 25 to 50 mL (2-3 tablespoons) of the oil sample into the glass.',
        tip: 'Room temperature sample gives best freezing gradient.',
      },
      {
        stepNumber: 3,
        title: 'Refrigerate (2-3 Hours)',
        instructions: 'Place the container in the refrigerator chiller compartment (approx. 4°C to 10°C) for 2 to 3 hours, or in the deep freezer for 30–45 minutes.',
        timeSeconds: 7200,
        timerLabel: 'Refrigeration Timer',
      },
      {
        stepNumber: 4,
        title: 'Inspect Solidification Symmetry',
        instructions: 'Take the container out without vigorously shaking. Observe under good lighting for uniformity, color consistency, and layer separation.',
      },
    ],
    pureObservation: {
      title: 'Homogeneous, Uniform Solidification',
      description: 'Pure oil solidifies into a single, uniform, smooth layer without separate liquid pools or patchy white sediment.',
      visualBadge: 'Uniform Solid Matrix',
      keyTraits: [
        'Pure Coconut oil freezes into a solid, clean, uniform white/off-white mass at ≤24°C.',
        'Pure Ghee solidifies uniformly into a single granular solid block.',
        'Pure Extra Virgin Olive oil turns uniformly thick and cloudy/semi-solid without sediment.',
        'Zero clear liquid floating on top of solidified sediment.'
      ],
      scientificReason: 'Natural pure oils consist of a characteristic triacylglycerol fatty acid profile with a consistent narrow freezing range. They solidify homogeneously.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Uneven White Patches & Liquid Separation',
      description: 'Adulterated oil displays distinct stratified layers: the cheap adulterant solidifies differently while mineral oil remains completely liquid.',
      visualBadge: 'Stratified Phase Separation',
      keyTraits: [
        'Distinct oily liquid layer remaining on top while bottom settles as milky sludge.',
        'Irregular white curd-like patches or floating oily globules.',
        'Liquid paraffin or mineral oil will NOT freeze at refrigerator temperatures and stays fully liquid.',
        'Coconut oil cut with mineral oil shows two sharply divided layers.'
      ],
      scientificReason: 'Mineral oils and adulterant blends have vastly divergent crystallization points and immiscible hydrocarbon chains, producing stratified layers upon cooling.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Every natural lipid has a distinct crystallization curve. Pure saturated fatty acids (e.g., in coconut or milk fat) solidify completely at standard refrigeration temperatures (4°C–10°C), while petroleum-derived liquid paraffin remains liquid down to -15°C.',
    fssaiRef: 'FSSAI DART (Detect Adulteration with Rapid Test) Protocol #O-01',
    simulatorOptions: [
      {
        id: 'opt_freeze_pure',
        label: 'Completely solid, smooth & uniform throughout',
        description: 'No liquid pockets, even crystalline texture from top to bottom.',
        outcome: 'PURE',
        visualEffect: 'uniform_solid',
        explanation: 'Your oil exhibited uniform crystallization behavior characteristic of pure unadulterated edible fat.'
      },
      {
        id: 'opt_freeze_twolayers',
        label: 'Liquid oil layer floating over solidified bottom',
        description: 'Bottom half is solid/cloudy, top half remains runny liquid.',
        outcome: 'ADULTERATED',
        visualEffect: 'two_layers',
        explanation: 'Strong indicator of liquid paraffin, light mineral oil, or multi-source adulteration with differing melting points.'
      },
      {
        id: 'opt_freeze_whitepatches',
        label: 'Uneven white floating clumps or curdled patches',
        description: 'Lumpy white deposits with irregular cloudy suspension.',
        outcome: 'SUSPECT',
        visualEffect: 'white_patches',
        explanation: 'Indicates blending with low-grade hydrogenated fats (Vanaspati), crude palm stearin, or moisture contamination.'
      }
    ]
  },
  {
    id: 'heating_test',
    title: 'Heating, Aroma & Smoke Point Test',
    subtitle: 'Reveals thermal breakdown, chemical foaming, acrid volatile gases, and burnt sludge residue.',
    category: 'Thermal & Smoke',
    targetOils: ['Mustard Oil', 'Sunflower Oil', 'Groundnut Oil', 'Ghee', 'Soybean Oil', 'Olive Oil'],
    adulterantsDetected: ['Recycled / Spent Cooking Oil', 'Solvent Residues', 'Animal Tallow / Cheap Grease', 'Bleached Industrial Oil'],
    difficulty: 'Easy',
    estimatedDuration: '2 - 3 Minutes',
    durationSeconds: 180,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Clean stainless steel / iron frying pan or ladle', isHousehold: true },
      { name: 'Kitchen stove / gas burner or induction', isHousehold: true },
      { name: 'Spoon', isHousehold: true },
    ],
    safetyWarning: 'Do not overheat unattended. Perform in a well-ventilated kitchen. Never add water to hot oil!',
    steps: [
      {
        stepNumber: 1,
        title: 'Clean Dry Pan Setup',
        instructions: 'Ensure your pan or small ladle is completely free from water droplets and past food residue.',
        tip: 'Any residual water will cause natural splattering, confusing the test.',
      },
      {
        stepNumber: 2,
        title: 'Add 1-2 Tablespoons Oil',
        instructions: 'Pour 15-20 mL of oil onto the center of the pan on medium heat.',
      },
      {
        stepNumber: 3,
        title: 'Observe Heat-Up Phase (60-90s)',
        instructions: 'Watch carefully as temperature rises. Note whether bubbles/froth form, smoke begins prematurely, or strange smells emit.',
        timeSeconds: 90,
        timerLabel: 'Heat-Up Observation Timer',
      },
      {
        stepNumber: 4,
        title: 'Cool and Check Bottom Residue',
        instructions: 'Turn off the heat, let it cool down for 2 minutes, and tilt the pan to inspect the surface film and pan bottom.',
      },
    ],
    pureObservation: {
      title: 'Smooth Heating, Clean Aroma, Minimal Residue',
      description: 'Pure oil heats smoothly with gentle convection, releasing its characteristic pleasant natural aroma without pungent chemical choking fumes.',
      visualBadge: 'Clear Thermal Convection',
      keyTraits: [
        'Heats smoothly without excessive violent bubbling or continuous white foam.',
        'Releases signature natural aroma (e.g. sharp pungent allyl isothiocyanate for mustard oil, rich nutty aroma for ghee).',
        'Smoke point is high and steady; no dense acrid blue/black smoke at low heat.',
        'Leaves clean liquid oil with zero sticky black gummy residue after cooling.'
      ],
      scientificReason: 'Unrefined/pure refined triglyceride chains resist premature thermal pyrolysis and maintain high flash points without polymerizing into sticky sludge.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Premature Acrid Smoke, Heavy Foaming & Black Sludge',
      description: 'Adulterated or recycled oil foams vigorously, produces stinging chemical smoke at low heat, and leaves a sticky tar-like dark residue.',
      visualBadge: 'Polymerized Sticky Residue',
      keyTraits: [
        'Violent foaming / frothing that covers the pan surface at low temperature.',
        'Early dense, choking, irritating smoke (often smelling like burnt rubber, kerosene, or rancid lard).',
        'Turns dark brown/black rapidly during mild heating.',
        'Leaves a sticky, gummy, varnish-like crust stuck to the pan bottom upon cooling.'
      ],
      scientificReason: 'Repeatedly fried (spent) oil or industrial grease contains free fatty acids, secondary oxidation products (polar compounds, polymers, and aldehydes) that rapidly smoke and foam.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Degraded and adulterated oils contain high Total Polar Compounds (TPC) and low molecular weight volatile impurities that drastically lower the smoke point and trigger surfactant foam stabilization.',
    fssaiRef: 'FSSAI Guidance on Repeatedly Used Cooking Oils (RUCO) & Thermal Stability',
    simulatorOptions: [
      {
        id: 'opt_heat_pure',
        label: 'Gentle shimmer, pleasant aroma, no froth, high smoke point',
        description: 'Warms up smoothly with normal light sheen and authentic aroma.',
        outcome: 'PURE',
        visualEffect: 'smooth_heating',
        explanation: 'Typical thermal performance of fresh, unadulterated edible oil.'
      },
      {
        id: 'opt_heat_foaming',
        label: 'Extensive white foam / froth spreading across pan',
        description: 'Surface covered in foam bubbles resembling soap suds.',
        outcome: 'ADULTERATED',
        visualEffect: 'heavy_foam',
        explanation: 'Indicates high free fatty acids, polar compound degradation, or dilution with spent restaurant waste oil.'
      },
      {
        id: 'opt_heat_acrid_smoke',
        label: 'Early choking smoke with burnt chemical/rubber odor',
        description: 'Smoke begins at low temperature with eye-stinging acrid fumes.',
        outcome: 'ADULTERATED',
        visualEffect: 'acrid_smoke',
        explanation: 'Severely lowered smoke point caused by petroleum solvents, rancidity, or industrial adulterant blending.'
      }
    ]
  },
  {
    id: 'paper_blot_test',
    title: 'Paper Blot & Translucency Ring Test',
    subtitle: 'Identifies added water, volatile solvents, low-viscosity adulterants, and artificial pigments.',
    category: 'Surface & Absorption',
    targetOils: ['Mustard Oil', 'Olive Oil', 'Coconut Oil', 'Groundnut Oil', 'Sesame Oil'],
    adulterantsDetected: ['Emulsified Water / Moisture', 'Light Solvent Extract Fractions', 'Synthetic Dyes', 'Low-Grade Mineral Thinners'],
    difficulty: 'Very Easy',
    estimatedDuration: '10 - 15 Minutes',
    durationSeconds: 600,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Plain white printer paper or filter paper / blotting sheet', isHousehold: true },
      { name: 'Dropper or toothpick / spoon tip', isHousehold: true },
      { name: 'Desk lamp or flashlight', isHousehold: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Lay Plain White Paper Flat',
        instructions: 'Place a clean sheet of standard unprinted white A4 paper on a dry, non-porous flat table.',
        tip: 'Ensure the paper has no ink, watermarks, or grease stains.',
      },
      {
        stepNumber: 2,
        title: 'Deposit 2-3 Drops of Oil',
        instructions: 'Using a dropper, toothpick, or spoon edge, deposit 2 to 3 drops of oil in the center of the paper.',
      },
      {
        stepNumber: 3,
        title: 'Wait 10-15 Minutes for Capillary Action',
        instructions: 'Allow the oil to spread naturally across paper fibers without pressing or smudging with fingers.',
        timeSeconds: 600,
        timerLabel: 'Capillary Spread Timer',
      },
      {
        stepNumber: 4,
        title: 'Hold Against Light & Inspect Ring Pattern',
        instructions: 'Hold the sheet up against bright light or window. Inspect the boundary perimeter and transparency gradient.',
      },
    ],
    pureObservation: {
      title: 'Uniform Translucent Spot with Consistent Edge',
      description: 'Pure oil creates a slow-spreading, uniform translucent spot with a smooth, consistent boundary and uniform oily glow.',
      visualBadge: 'Smooth Monocentric Spot',
      keyTraits: [
        'Translucent spot spreads slowly with high capillary cohesion.',
        'Edge of the oily circle is smooth, sharp, and consistent.',
        'Zero rapid secondary watery ring halo radiating outwards.',
        'Paper remains structurally intact without wrinkling or buckling.'
      ],
      scientificReason: 'Pure triglycerides have high viscosity and uniform surface tension with cellulosic fibers, resulting in a single clean grease spot.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Dual Ring Halo, Rapid Spreading & Paper Crinkling',
      description: 'Adulterated oil displays a central oily core surrounded by a fast-spreading outer ring of watery/solvent moisture, causing paper to crinkle.',
      visualBadge: 'Concentric Halos & Buckling',
      keyTraits: [
        'Large, rapidly diffusing secondary ring (halo) surrounding the central drop.',
        'Paper wrinkles or wrinkles along the outer halo perimeter due to water swelling paper cellulose.',
        'Irregular dark, patchy discoloration or separated synthetic dye fringes on the margins.',
        'Disappears or dries up quickly if diluted with volatile light solvents.'
      ],
      scientificReason: 'Water and low-density petroleum solvents possess significantly higher capillary migration rates than heavy vegetable triglycerides, creating concentric chromatographic rings.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Chromatographic separation on cellulose fibers separates constituents based on polarity and viscosity. Hydrophilic water/solvents migrate rapidly outward, while heavy hydrophobic lipids stay centered.',
    fssaiRef: 'FSSAI Home Test Manual: Rapid Moisture and Liquid Paraffin Screening',
    simulatorOptions: [
      {
        id: 'opt_paper_pure',
        label: 'Uniform translucent oily circle with sharp, clean boundary',
        description: 'Slow even spread, no secondary rings, paper remains smooth.',
        outcome: 'PURE',
        visualEffect: 'pure_blot',
        explanation: 'Demonstrates authentic single-phase triglyceride viscosity and zero water adulteration.'
      },
      {
        id: 'opt_paper_haloring',
        label: 'Central oil dot with a wide, rapid outer halo and crinkled paper',
        description: 'Outer ring spreads much faster and buckles the paper fibers.',
        outcome: 'ADULTERATED',
        visualEffect: 'halo_blot',
        explanation: 'Proves high moisture, emulsified water, or low boiling point petroleum solvent contamination.'
      },
      {
        id: 'opt_paper_dyefringe',
        label: 'Colored dye ring (yellow/orange/red) separating at the edge',
        description: 'Color concentrates into a distinct band at the perimeter.',
        outcome: 'ADULTERATED',
        visualEffect: 'dye_blot',
        explanation: 'Classic chromatographic separation of added artificial non-oil-soluble synthetic food colorings.'
      }
    ]
  },
  {
    id: 'water_bubble_test',
    title: 'Water Bubble & Surface Tension Test',
    subtitle: 'Checks interfacial surface tension, immiscibility, and artificial surfactant additives.',
    category: 'Surface & Absorption',
    targetOils: ['Mustard Oil', 'Groundnut Oil', 'Coconut Oil', 'Sunflower Oil', 'Ghee'],
    adulterantsDetected: ['Detergent / Chemical Surfactants', 'Waste Oil Blends', 'Soluble Impurities', 'Castor Oil Over-blending'],
    difficulty: 'Very Easy',
    estimatedDuration: '1 - 2 Minutes',
    durationSeconds: 120,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Clear glass bowl or glass tumbler filled with clean tap water', isHousehold: true },
      { name: 'Clean dropper, straw, or spoon edge', isHousehold: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Fill Clear Glass with Calm Water',
        instructions: 'Fill a clean transparent glass tumbler 3/4 full with still, room-temperature clean water. Let it settle completely.',
        tip: 'Ensure water surface is still with no vibrations.',
      },
      {
        stepNumber: 2,
        title: 'Drop Single Oil Bead from Low Height',
        instructions: 'Hold a dropper or spoon tip 1 cm above the water surface and gently release ONE single drop of oil onto the surface.',
      },
      {
        stepNumber: 3,
        title: 'Observe Drop Formation & Cohesion',
        instructions: 'Watch whether the drop remains as an intact buoyant convex lens (bubble) or shatters instantly into scattered tiny beads.',
        timeSeconds: 30,
        timerLabel: 'Interfacial Lens Formation Timer',
      },
    ],
    pureObservation: {
      title: 'Intact, Cohesive Floating Lens',
      description: 'Pure oil drop floats steadily on top of the water as a single, coherent, smooth circular convex lens without dissolving or fragmenting.',
      visualBadge: 'Single Cohesive Lens',
      keyTraits: [
        'Oil droplet remains intact and floats as a single neat convex disc.',
        'Does not disperse into hundreds of tiny floating pinprick droplets.',
        'Water beneath remains crystal clear without milkiness or cloudy emulsion.',
        'Boundary between oil and water remains sharp and hydrophobic.'
      ],
      scientificReason: 'Natural oils have high interfacial tension with water (around 30-32 mN/m), preventing spontaneous emulsification and preserving droplet integrity.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Instant Fragmentation, Spreading Film or Cloudy Emulsion',
      description: 'Adulterated oil breaks up into fragmented pinhead droplets, spreads aggressively like a rainbow petroleum sheen, or turns the water milky.',
      visualBadge: 'Fragmented Sheen & Milkiness',
      keyTraits: [
        'Drop shatters immediately upon contact into dispersed micro-droplets.',
        'Forms an iridescent, rainbow-colored thin petroleum slick over the entire water surface.',
        'Water becomes cloudy or hazy directly beneath the oil drop (indicator of surfactants/detergent residues).',
        'Fragments sink partially or suspend as cloudy filaments.'
      ],
      scientificReason: 'Surfactants, soaps, residual refining chemicals, or synthetic blending agents drastically collapse oil-water interfacial tension, inducing rapid dispersion.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Interfacial tension between immiscible pure lipids and polar water molecules enforces minimum surface area (spherical/lens shape). Surfactant adulterants destroy this interfacial barrier.',
    fssaiRef: 'Standard Interfacial Rapid Screening Method for Non-lipid Surfactants',
    simulatorOptions: [
      {
        id: 'opt_water_pure',
        label: 'Single smooth, circular floating lens; water stays clear',
        description: 'Neat round oil droplet stays floating in one piece.',
        outcome: 'PURE',
        visualEffect: 'pure_lens',
        explanation: 'Normal high interfacial surface tension of clean, pure dietary lipid.'
      },
      {
        id: 'opt_water_fragmented',
        label: 'Drop breaks into many small scattering micro-droplets',
        description: 'Shatters into fragmented beads with rainbow sheen.',
        outcome: 'ADULTERATED',
        visualEffect: 'fragmented_sheen',
        explanation: 'Indicates contamination with mineral spirits, surfactant additives, or synthetic thinners.'
      },
      {
        id: 'opt_water_milky',
        label: 'Water beneath the oil turns cloudy or milky',
        description: 'Milky haze develops as the oil drop dissolves partially.',
        outcome: 'ADULTERATED',
        visualEffect: 'milky_emulsion',
        explanation: 'Clear sign of soap/detergent residues or industrial emulsifiers present in the oil.'
      }
    ]
  },
  {
    id: 'yellow_mustard_dye_test',
    title: 'Mustard Oil Dye Detection Test (Acid / Vinegar Test)',
    subtitle: 'Detects toxic artificial coloring dyes (Metanil Yellow, Butter Yellow, Coal Tar Dyes) added to fake mustard oil vibrancy.',
    category: 'Chemical & Dye',
    targetOils: ['Mustard Oil (Sarson)', 'Turmeric-Infused Oils', 'Yellow Blended Oils', 'Ghee'],
    adulterantsDetected: ['Metanil Yellow (Carcinogenic Industrial Azo Dye)', 'Butter Yellow', 'Rhodamine B', 'Sudan Dyes'],
    difficulty: 'Moderate',
    estimatedDuration: '1 - 2 Minutes',
    durationSeconds: 90,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Small clear glass vial, shot glass, or test tube', isHousehold: true },
      { name: 'Concentrated Hydrochloric Acid (5 mL) OR 5-10 mL Strong White Vinegar + Lemon Juice', kitchenAlternative: 'Strong White Vinegar + Fresh Lemon Juice (Concentrated Acidity)', isHousehold: true },
      { name: 'Measuring spoon / teaspoon (approx 5 mL)', isHousehold: true },
    ],
    safetyWarning: 'If using laboratory conc. HCl, wear protective gloves and do not inhale vapors. When using kitchen vinegar/lemon alternative, use warm concentrated vinegar for clear reaction.',
    steps: [
      {
        stepNumber: 1,
        title: 'Take 5 mL (1 tsp) Oil Sample',
        instructions: 'Pour exactly 1 teaspoon (approx 5 mL) of the mustard oil sample into a clean, dry small glass container or glass vial.',
      },
      {
        stepNumber: 2,
        title: 'Add 5 mL Acid Reagent',
        instructions: 'Add 5 mL of concentrated Hydrochloric Acid (conc. HCl) OR 5-10 mL of warm concentrated white vinegar with a few drops of concentrated lemon juice.',
        tip: 'In a household setting, pure white distilled vinegar provides acetic acid for dye extraction.',
      },
      {
        stepNumber: 3,
        title: 'Shake Gently for 10-20 Seconds',
        instructions: 'Cover the top with a clean cap or glass lid and shake or swirl gently for 15-20 seconds to allow the aqueous and oil phases to interact.',
        timeSeconds: 20,
        timerLabel: 'Phase Extraction Shake Timer',
      },
      {
        stepNumber: 4,
        title: 'Allow Layers to Settle & Inspect Lower Layer',
        instructions: 'Set the vial down and allow it to separate into two distinct layers for 60 seconds. Observe the color of the lower liquid (aqueous) layer.',
        timeSeconds: 60,
        timerLabel: 'Layer Separation Settling Timer',
      },
    ],
    pureObservation: {
      title: 'No Color Change in Lower Layer (Pure & Unchanged)',
      description: 'The natural yellow carotenoid and xanthophyll pigments of pure mustard seed remain bound in the upper oil layer. The lower acid layer remains clear or faintly pale.',
      visualBadge: 'Clear / Unchanged Lower Phase',
      keyTraits: [
        'Lower aqueous layer remains completely transparent, clear, or faint neutral.',
        'Upper oil layer retains its natural golden/amber mustard hue.',
        'Zero pink, magenta, crimson, or dark red coloration in the bottom layer.',
        'No precipitation or dark rings at the phase interface.'
      ],
      scientificReason: 'Natural lipid-soluble mustard pigments (lutein, carotenoids) are non-ionic and do not extract into the acidic polar water layer under acidic pH.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Lower Layer Turns Bright Pink or Deep Red (Metanil Yellow Contamination)',
      description: 'The lower aqueous layer turns immediate pink, magenta, or dark red/crimson. This is a definitive chemical confirmation of prohibited artificial azo dyes.',
      visualBadge: 'Intense Pink / Red Acid Phase',
      keyTraits: [
        'Lower liquid layer instantly turns vivid pink, magenta, or deep red.',
        'Metanil Yellow protonates in acid to form a quinoid cation with strong red absorbance.',
        'Upper oil phase may lose its artificial yellow tint.',
        'EXTREMELY TOXIC: Metanil yellow is a prohibited neurotoxic and carcinogenic dye.'
      ],
      scientificReason: 'Metanil yellow is an acidic azo dye containing azo linkages (-N=N-). In strong acid, it undergoes protonation into a vibrant pink/red quinoid salt that dissolves in the aqueous phase.',
      dangerLevel: 'Toxic'
    },
    scientificMechanism: 'Azo dye Metanil Yellow undergoes proton transfer: Yellow Neutral Form + H+ -> Deep Pink/Red Protonated Quinoid Cation (extractable into aqueous phase). Natural beta-carotene is unaffected.',
    fssaiRef: 'FSSAI DART Method #O-03: Detection of Metanil Yellow Dye in Mustard Oil / Ghee',
    simulatorOptions: [
      {
        id: 'opt_dye_pure',
        label: 'Lower aqueous layer remains clear / colorless; oil stays golden',
        description: 'No pink or red hue in the bottom acid layer.',
        outcome: 'PURE',
        visualEffect: 'pure_acid_test',
        explanation: 'Proves absence of synthetic Metanil Yellow or artificial coal-tar dye adulterants.'
      },
      {
        id: 'opt_dye_pink',
        label: 'Lower layer turns noticeable pink or magenta',
        description: 'Acid layer extracts a distinct bright pink color.',
        outcome: 'ADULTERATED',
        visualEffect: 'pink_dye_reaction',
        explanation: 'POSITIVE for Metanil Yellow / synthetic azo dye. Do not consume this oil.'
      },
      {
        id: 'opt_dye_darkred',
        label: 'Lower layer turns intense dark red / crimson',
        description: 'Heavy concentration of synthetic coal tar dye.',
        outcome: 'ADULTERATED',
        visualEffect: 'deep_red_dye_reaction',
        explanation: 'DANGEROUS: Severe adulteration with heavy doses of industrial dye. Report to food safety authorities.'
      }
    ]
  },
  {
    id: 'argemone_nitric_test',
    title: 'Argemone Oil Detection Test (Mustard Oil Hazard)',
    subtitle: 'Screens for toxic Argemone mexicana (Mexican Poppy) seed oil, the cause of deadly Epidemic Dropsy and cardiac failure.',
    category: 'Chemical & Dye',
    targetOils: ['Mustard Oil (Sarson ka tel)', 'Groundnut Oil', 'Sesame Oil'],
    adulterantsDetected: ['Argemone Mexicana Seed Oil (Contains Sangunarine & Dihydrosanguinarine)', 'Toxic Weed Alkaloids'],
    difficulty: 'Moderate',
    estimatedDuration: '2 - 3 Minutes',
    durationSeconds: 150,
    is100PercentHousehold: false,
    requiredTools: [
      { name: 'Small glass test tube or transparent glass vial', isHousehold: true },
      { name: 'Concentrated Nitric Acid (HNO3) or strong white vinegar + hydrogen peroxide mix', kitchenAlternative: 'White Vinegar + 3% Hydrogen Peroxide (Oxidative screening)', isHousehold: false },
      { name: 'Dropper', isHousehold: true },
    ],
    safetyWarning: 'Argemone contamination is extremely hazardous to health (causes swelling, breathlessness, glaucoma). Handle testing carefully in a well-ventilated area.',
    steps: [
      {
        stepNumber: 1,
        title: 'Add 5 mL Oil Sample',
        instructions: 'Place 5 mL of mustard oil sample into a clean glass tube or shot glass.',
      },
      {
        stepNumber: 2,
        title: 'Add 5 mL Concentrated Nitric Acid (or Oxidative Reagent)',
        instructions: 'Carefully add 5 mL of Nitric Acid along the side of the container.',
      },
      {
        stepNumber: 3,
        title: 'Shake and Observe Interface',
        instructions: 'Shake gently and observe color development at the phase junction over 1–2 minutes.',
        timeSeconds: 60,
        timerLabel: 'Interface Reaction Timer',
      },
    ],
    pureObservation: {
      title: 'No Reddish-Brown Ring / Clear Yellow Interface',
      description: 'Pure mustard oil shows no crimson or reddish-brown color development at the acid-oil junction.',
      visualBadge: 'Negative for Sanguinarine',
      keyTraits: [
        'Interface remains yellow/pale amber.',
        'No reddish-orange or crimson precipitates.',
        'No tarry alkaloid rings.'
      ],
      scientificReason: 'Pure mustard oil lacks the benzophenanthridine alkaloids (sanguinarine) that form chromogenic complexes with nitric acid.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Reddish-Brown / Crimson Coloration at Interface (Argemone Positive)',
      description: 'A crimson to reddish-brown color or precipitate develops at the boundary layer, confirming toxic Argemone oil presence.',
      visualBadge: 'Positive for Toxic Argemone',
      keyTraits: [
        'Immediate crimson to dark reddish-brown ring at the interface.',
        'Precipitate forms upon standing.',
        'DEADLY TOXIN: Causes Epidemic Dropsy, peripheral edema, glaucoma, and cardiac arrest.'
      ],
      scientificReason: 'Sanguinarine and dihydrosanguinarine alkaloids undergo intense nitration and oxidation, producing bright red chromophores.',
      dangerLevel: 'Toxic'
    },
    scientificMechanism: 'Sanguinarine alkaloid in Argemone reacts with concentrated nitric acid to yield a characteristic red-orange quinonoid complex.',
    fssaiRef: 'FSSAI DART Method #O-02: Rapid Detection of Argemone Oil in Edible Oils',
    simulatorOptions: [
      {
        id: 'opt_arg_pure',
        label: 'Interface remains clean and pale amber; no red tint',
        description: 'Zero red coloration after 2 minutes.',
        outcome: 'PURE',
        visualEffect: 'pure_argemone',
        explanation: 'Free from toxic Argemone weed seed contamination.'
      },
      {
        id: 'opt_arg_red',
        label: 'Crimson / Reddish-Brown ring forms at the interface',
        description: 'Distinct reddish band develops between layers.',
        outcome: 'ADULTERATED',
        visualEffect: 'red_argemone_ring',
        explanation: 'CRITICAL HAZARD: Argemone oil detected! Immediate health hazard. Discard immediately and alert local food safety authorities.'
      }
    ]
  },
  {
    id: 'iodine_starch_test',
    title: 'Ghee & Butter Starch Detection Test (Iodine / Tincture Test)',
    subtitle: 'Detects mashed potatoes, sweet potatoes, flours, and starches added to bulk up expensive Desi Ghee.',
    category: 'Chemical & Dye',
    targetOils: ['Desi Ghee', 'Butter', 'Melted Coconut Fat'],
    adulterantsDetected: ['Mashed Potatoes', 'Starch / Cornflour', 'Refined Wheat Flour (Maida)', 'Animal Tallow Emulsion'],
    difficulty: 'Very Easy',
    estimatedDuration: '1 Minute',
    durationSeconds: 60,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Small spoon or glass bowl', isHousehold: true },
      { name: 'First-aid Tincture of Iodine OR Povidone-Iodine (Betadine drops)', kitchenAlternative: 'Household First-aid Iodine / Betadine', isHousehold: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Melt 1 Teaspoon Ghee',
        instructions: 'Melt 1 teaspoon (5 mL) of ghee or butter in a small clean dish so it becomes liquid.',
      },
      {
        stepNumber: 2,
        title: 'Add 2-3 Drops of Iodine Solution',
        instructions: 'Add 2 to 3 drops of standard tincture of iodine (or Betadine) directly onto the melted sample.',
      },
      {
        stepNumber: 3,
        title: 'Mix and Watch Color Change',
        instructions: 'Swirl gently and observe the color immediately.',
        timeSeconds: 15,
        timerLabel: 'Iodine Complexing Timer',
      },
    ],
    pureObservation: {
      title: 'Remains Brownish-Yellow (No Blue Color)',
      description: 'The natural yellowish-brown color of iodine does not turn blue or purple. It remains golden/amber.',
      visualBadge: 'No Amylose Reaction',
      keyTraits: [
        'Iodine remains its natural reddish-brown/amber color.',
        'Zero blue, indigo, or blackish-purple coloration.',
        'Ghee remains smooth and translucent.'
      ],
      scientificReason: 'Pure milk fat consists purely of triglycerides and contains zero amylose or starch polysaccharides.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Turns Deep Intense Blue / Violet (Starch Adulteration)',
      description: 'The sample turns blue, deep indigo, or violet-black, indicating the presence of added starch, potato paste, or flour.',
      visualBadge: 'Deep Blue-Purple Complex',
      keyTraits: [
        'Instant color shift to deep blue, purple, or blackish-blue.',
        'Formed by iodine molecules slipping inside starch amylose helical coils.',
        'Indicates gross adulteration with boiled potato mash, sweet potato, or flour.'
      ],
      scientificReason: 'Triiodide ions (I3-) intercalate into the helical coil of amylose starch polymers, forming an intense charge-transfer complex with deep blue light absorption at ~600 nm.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Amylose starch helical structure traps linear polyiodide chains, creating the classic intense blue-black starch-iodine chromophore.',
    fssaiRef: 'FSSAI DART Method #D-01: Detection of Starch in Ghee, Butter, and Cottage Cheese',
    simulatorOptions: [
      {
        id: 'opt_starch_pure',
        label: 'Solution remains yellowish-brown (color of iodine)',
        description: 'No blue color formed.',
        outcome: 'PURE',
        visualEffect: 'pure_iodine',
        explanation: 'Zero starch or vegetable pulp found in ghee sample.'
      },
      {
        id: 'opt_starch_blue',
        label: 'Turns deep navy blue or purple-black',
        description: 'Instant intense blue color reaction.',
        outcome: 'ADULTERATED',
        visualEffect: 'blue_starch_reaction',
        explanation: 'Definitive presence of added potato starch, cornstarch, or flour.'
      }
    ]
  },
  {
    id: 'palm_touch_friction_test',
    title: 'Palm Touch, Friction & Odor Test',
    subtitle: 'Immediate sensory screening using body heat to detect petroleum paraffin, synthetic fragrances, and grease.',
    category: 'Sensory & Touch',
    targetOils: ['Coconut Oil', 'Mustard Oil', 'Olive Oil', 'Desi Ghee', 'Castor Oil'],
    adulterantsDetected: ['Liquid Paraffin (Petroleum Wax)', 'Synthetic Chemical Fragrance / Essence', 'Castor Oil Blend', 'Recycled Grease'],
    difficulty: 'Very Easy',
    estimatedDuration: '30 Seconds',
    durationSeconds: 30,
    is100PercentHousehold: true,
    requiredTools: [
      { name: 'Clean, dry hands and palms', isHousehold: true },
      { name: 'Dropper or fingertip', isHousehold: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Clean and Dry Palms',
        instructions: 'Wash and thoroughly dry your hands to remove any soap scent or moisture.',
      },
      {
        stepNumber: 2,
        title: 'Apply 2-3 Drops of Oil to Palm',
        instructions: 'Place 2 to 3 drops of oil onto the center of one palm.',
      },
      {
        stepNumber: 3,
        title: 'Vigorously Rub Palms for 20 Seconds',
        instructions: 'Rub both palms together vigorously to generate body heat and friction.',
        timeSeconds: 20,
        timerLabel: 'Friction Heat Timer',
      },
      {
        stepNumber: 4,
        title: 'Smell and Check Absorption',
        instructions: 'Immediately cup your palms over your nose and inhale. Then inspect skin absorption.',
      },
    ],
    pureObservation: {
      title: 'Warm Skin Absorption, Authentic Natural Scent',
      description: 'Pure oil absorbs comfortably into skin, releases authentic nutty/pungent/fruity natural notes, and leaves no synthetic sticky residue.',
      visualBadge: 'Natural Transdermal Absorption',
      keyTraits: [
        'Pure Coconut oil melts instantly and absorbs cleanly without petroleum greasiness.',
        'Pure Mustard oil emits a fresh pungent mustard seed aroma that clears sinuses naturally.',
        'Pure Ghee absorbs rapidly leaving mild nutty butter fragrance.',
        'Zero foul chemical, petroleum, or synthetic perfume after-smell.'
      ],
      scientificReason: 'Natural plant and animal lipids are bio-compatible triglycerides that interact smoothly with epidermis sebum without creating an impermeable petroleum barrier.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Cold Persistent Greasiness, Kerosene Smell, or Artificial Perfume',
      description: 'Mineral oil and paraffin remain cold, unabsorbed, and leave a persistent plastic-like slick coating, often smelling of kerosene or fading into artificial essence.',
      visualBadge: 'Plastic Film & Chemical Odor',
      keyTraits: [
        'Persistent sticky, slick plastic feeling that refuses to absorb into skin.',
        'Smell of engine oil, kerosene, petroleum wax, or chemical solvents.',
        'Fragrance disappears within 10 seconds leaving behind flat stale grease (sign of synthetic essence mask).',
        'Leaves skin feeling unnaturally cold or waxy.'
      ],
      scientificReason: 'Liquid paraffin consists of non-polar unbranched mineral hydrocarbons (C15–C40) that cannot be metabolized or absorbed by skin membranes.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Thermal volatility and human olfactory receptors detect trace volatile adulterants (petroleum hydrocarbons, artificial flavorants) released by palm friction heat.',
    fssaiRef: 'Sensory Screening Protocols for Raw Edible Fats & Oils',
    simulatorOptions: [
      {
        id: 'opt_touch_pure',
        label: 'Absorbs naturally with rich authentic aroma; leaves soft sheen',
        description: 'Smooth warmth, zero plastic coating or chemical odor.',
        outcome: 'PURE',
        visualEffect: 'pure_touch',
        explanation: 'Classic skin compatibility and natural volatile profile of unadulterated edible oil.'
      },
      {
        id: 'opt_touch_greasy_mineral',
        label: 'Persistent cold plastic film that will not absorb; faint petroleum smell',
        description: 'Feels like baby oil / machine grease on palms.',
        outcome: 'ADULTERATED',
        visualEffect: 'greasy_mineral',
        explanation: 'Conclusive sensory evidence of liquid paraffin or mineral oil blending.'
      },
      {
        id: 'opt_touch_perfume_fade',
        label: 'Intense aroma vanishes instantly into a stale foul grease smell',
        description: 'Aroma was clearly an artificial synthetic masking agent.',
        outcome: 'ADULTERATED',
        visualEffect: 'foul_grease',
        explanation: 'Indicates old, rancid, or recycled cooking oil treated with masking perfumes.'
      }
    ]
  }
];
