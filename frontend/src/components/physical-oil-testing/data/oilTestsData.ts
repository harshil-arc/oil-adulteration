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
      title: 'Characteristic Homogeneous Phase Behavior',
      description: 'Pure oil solidifies or remains liquid consistently according to its natural fatty acid profile without patchy sediment.',
      visualBadge: 'Homogeneous Phase',
      keyTraits: [
        'Pure Coconut oil freezes into a solid, clean, uniform white mass at ≤24°C.',
        'Pure Ghee solidifies uniformly into a single granular solid block.',
        'Pure Mustard oil remains completely clear liquid down to -10°C.',
        'Pure Extra Virgin Olive oil turns uniformly thick and cloudy/semi-solid without sediment.'
      ],
      scientificReason: 'Natural pure oils consist of a characteristic triacylglycerol fatty acid profile with a consistent narrow freezing range.',
      dangerLevel: 'Safe'
    },
    adulteratedObservation: {
      title: 'Uneven Patches, Murky Sediment & Phase Separation',
      description: 'Adulterated oil displays distinct stratified layers: cheap palm fractions freeze into white sludge while mineral oil remains floating.',
      visualBadge: 'Stratified Phase Separation',
      keyTraits: [
        'Distinct oily liquid layer remaining on top while bottom settles as milky sludge.',
        'Irregular white curd-like patches or floating oily globules.',
        'Liquid paraffin or mineral oil will NOT freeze at refrigerator temperatures and stays fully liquid.',
        'Coconut oil cut with mineral oil shows two sharply divided layers.'
      ],
      scientificReason: 'Mineral oils and adulterant blends have vastly divergent crystallization points and immiscible hydrocarbon chains.',
      dangerLevel: 'High Risk'
    },
    scientificMechanism: 'Every natural lipid has a distinct crystallization curve. Pure saturated fatty acids (e.g., in coconut or milk fat) solidify at standard refrigeration temperatures (4°C–10°C), while petroleum-derived liquid paraffin remains liquid down to -15°C.',
    fssaiRef: 'FSSAI DART (Detect Adulteration with Rapid Test) Protocol #O-01',
    simulatorOptions: [
      {
        id: 'opt_freeze_pure',
        label: 'Uniform, expected phase behavior throughout (no separate layers)',
        description: 'Consistent texture from top to bottom matching authentic oil profile.',
        outcome: 'PURE',
        visualEffect: 'uniform_solid',
        explanation: 'Your oil exhibited uniform crystallization behavior characteristic of pure unadulterated edible fat.'
      },
      {
        id: 'opt_freeze_twolayers',
        label: 'Liquid oil layer floating over solidified bottom layer',
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
    title: 'Heating, Aroma & Thermal Stability Test',
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
    id: 'palm_touch_friction_test',
    title: 'Aroma & Palm Rub Friction Test',
    subtitle: 'Immediate sensory screening using body heat & friction to detect petroleum paraffin, synthetic fragrances, and grease.',
    category: 'Sensory & Touch',
    targetOils: ['Coconut Oil', 'Mustard Oil', 'Olive Oil', 'Desi Ghee', 'Sesame Oil', 'Groundnut Oil'],
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
        title: 'Vigorously Rub Palms for 15-20 Seconds',
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
  },
  {
    id: 'paper_blot_test',
    title: 'Paper Blot & Translucency Ring Test',
    subtitle: 'Identifies added water, volatile solvents, low-viscosity adulterants, and artificial pigments.',
    category: 'Surface & Absorption',
    targetOils: ['Mustard Oil', 'Olive Oil', 'Coconut Oil', 'Groundnut Oil', 'Sesame Oil', 'Sunflower Oil'],
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
        'Paper wrinkles along the outer halo perimeter due to water swelling paper cellulose.',
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
    title: 'Water Shake & Foam Test',
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
  }
];

// Helper to normalize any oil name string to its canonical profile key
export function normalizeOilKey(oilNameOrKey: string): string {
  const lower = (oilNameOrKey || '').toLowerCase();
  if (lower.includes('mustard') || lower.includes('sarson')) return 'mustard_oil';
  if (lower.includes('ghee') || lower.includes('butter')) return 'desi_ghee';
  if (lower.includes('coconut') || lower.includes('nariyal')) return 'coconut_oil';
  if (lower.includes('olive') || lower.includes('jaitun')) return 'olive_oil';
  if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('moongfali')) return 'groundnut_oil';
  if (lower.includes('sesame') || lower.includes('til') || lower.includes('gingelly')) return 'sesame_oil';
  if (lower.includes('sunflower') || lower.includes('blend')) return 'sunflower_oil';
  return 'mustard_oil';
}

// Complete, scientifically precise oil-specific physical tests mapping
export const OIL_SPECIFIC_TESTS: Record<string, Record<string, OilTest>> = {
  // 1. MUSTARD OIL (SARSON)
  mustard_oil: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Mustard Oil - Freezing & Cold Crystallization Test',
      subtitle: 'Verifies whether Mustard Oil remains clear liquid or solidifies due to cheap Palm Oil / Vanaspati adulteration.',
      category: 'Freezing & Cooling',
      targetOils: ['Mustard Oil (Kachi Ghani / Cold Pressed)'],
      adulterantsDetected: ['Palm Olein', 'Palm Stearin', 'Vanaspati (Hydrogenated Fat)', 'Liquid Paraffin'],
      difficulty: 'Very Easy',
      estimatedDuration: '2 - 3 Hours in Refrigerator (or 30 mins in deep freezer)',
      durationSeconds: 7200,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Small transparent glass tumbler or clear bowl', isHousehold: true },
        { name: 'Household Refrigerator (4°C - 10°C) or Freezer', isHousehold: true },
      ],
      safetyWarning: 'Make sure the glass is completely dry. Water drops will cause false cloudiness.',
      steps: [
        {
          stepNumber: 1,
          title: 'Prepare Dry Transparent Glass',
          instructions: 'Take a small, clean, completely dry transparent glass tumbler. Wipe inside with a dry cloth.',
          tip: 'A transparent glass is critical to clearly inspect the bottom layer against bright light.',
        },
        {
          stepNumber: 2,
          title: 'Pour 30 mL Mustard Oil',
          instructions: 'Pour approximately 25-30 mL (2 tablespoons) of your mustard oil sample into the glass.',
        },
        {
          stepNumber: 3,
          title: 'Place in Refrigerator (2-3 Hours)',
          instructions: 'Keep the glass in the refrigerator chiller compartment (4°C to 10°C) for 2 to 3 hours, or deep freezer for 30 minutes.',
          timeSeconds: 7200,
          timerLabel: 'Cold Crystallization Timer',
        },
        {
          stepNumber: 4,
          title: 'Inspect for Separation & Sediment',
          instructions: 'Remove without shaking. Hold against light. Observe if the oil stayed clear liquid, or if cloudy white solid sediment settled at the bottom.',
        },
      ],
      pureObservation: {
        title: 'Remains 100% Liquid, Transparent & Golden Amber',
        description: 'Pure cold-pressed mustard oil has a very low freezing point of approx -10°C (14°F). At normal refrigerator temperatures (4°C–10°C), authentic mustard oil WILL NOT freeze! It remains completely fluid and crystal clear.',
        visualBadge: 'Fluid Amber Liquid at 4°C',
        keyTraits: [
          'Remains completely liquid and fluid without freezing at 4°C.',
          'Zero white crystalline sediment or cloudiness settling at bottom.',
          'Maintains bright transparent golden-amber clarity.',
          'No separate layers or floating clumps.'
        ],
        scientificReason: 'Pure mustard oil is rich in monounsaturated erucic (40–50%) and oleic acids with low crystallization points (-10°C). Unlike palm oil, it resists chilling solid transitions.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Solidified Bottom Layer, White Crystals & Phase Separation',
        description: 'Adulterated mustard oil solidifies into white cloudy masses, separates into distinct layers, or forms thick settled wax at the bottom.',
        visualBadge: 'Palm Oil / Vanaspati Sediment',
        keyTraits: [
          'White milky sediment or cloudy crystalline mass settling at the bottom of the glass.',
          'Entire sample turns semi-solid or curdled at 4°C (classic palm olein/stearin indicator).',
          'Liquid paraffin (mineral oil) forms a distinct immiscible floating liquid layer above solidifying fat.',
          'Loss of amber clarity into a murky yellowish-white sludge.'
        ],
        scientificReason: 'Cheap palm olein freezes between 10°C and 20°C, and hydrogenated fat solidifies at 35°C. When blended into mustard oil, cooling forces the adulterant to precipitate out.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Fractional crystallization: Triglycerides with high saturated fatty acid content (palmitic acid in palm oil) crystallize at 15°C, while unsaturated erucic triglycerides stay liquid down to -10°C.',
      fssaiRef: 'FSSAI DART Method #O-01: Detection of Palm Oil Adulteration in Mustard Oil by Chilling',
      simulatorOptions: [
        {
          id: 'opt_mustard_freeze_pure',
          label: 'Remains completely liquid, clear & golden amber throughout',
          description: 'No cloudiness, no solid sediment, flows freely like normal oil.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Pure mustard oil does not freeze at refrigerator temperatures (melting point is -10°C).'
        },
        {
          id: 'opt_mustard_freeze_palm',
          label: 'White cloudy sediment / thick solidified bottom layer',
          description: 'Bottom half turns into a cloudy white or semi-solid frozen layer.',
          outcome: 'ADULTERATED',
          visualEffect: 'white_patches',
          explanation: 'Adulterated with cheap Palm Olein, Palm Stearin, or Vanaspati which freeze at 10°C–20°C.'
        },
        {
          id: 'opt_mustard_freeze_mineral',
          label: 'Separate liquid oily layer floating over cloudy base',
          description: 'Two sharply divided layers with oily petroleum slick.',
          outcome: 'ADULTERATED',
          visualEffect: 'two_layers',
          explanation: 'Severely adulterated with liquid paraffin / mineral oil and industrial filler fats.'
        }
      ]
    },
    heating_test: {
      id: 'heating_test',
      title: 'Mustard Oil - Thermal Pungency & Smoke Stability Test',
      subtitle: 'Verifies high 250°C smoke stability and authentic allyl isothiocyanate pungency against recycled waste oil and Argemone.',
      category: 'Thermal & Smoke',
      targetOils: ['Mustard Oil (Kachi Ghani)'],
      adulterantsDetected: ['Recycled Spent Cooking Oil', 'Cheap Palm Olein Blend', 'Argemone Mexicana Contamination', 'Petroleum Thinners'],
      difficulty: 'Easy',
      estimatedDuration: '2 - 3 Minutes',
      durationSeconds: 150,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean stainless steel or iron pan', isHousehold: true },
        { name: 'Kitchen stove / gas flame', isHousehold: true },
      ],
      safetyWarning: 'Perform in a well-ventilated kitchen. Pure mustard oil vapors naturally cause eyes to water.',
      steps: [
        {
          stepNumber: 1,
          title: 'Clean Dry Pan Setup',
          instructions: 'Ensure your pan is completely dry and free from moisture or previous food residues.',
        },
        {
          stepNumber: 2,
          title: 'Pour 20 mL Mustard Oil',
          instructions: 'Pour 20 mL of mustard oil into the pan and place over medium flame.',
        },
        {
          stepNumber: 3,
          title: 'Observe Heat-Up Phase & Vapors (60-90s)',
          instructions: 'Observe as the temperature rises. Note the aroma, vapor intensity, and whether white froth or foam appears on the surface.',
          timeSeconds: 90,
          timerLabel: 'Thermal Heating Observation',
        },
        {
          stepNumber: 4,
          title: 'Cool and Inspect Pan Bottom',
          instructions: 'Turn off the flame. Once cooled for 2 minutes, tilt the pan to check if black gummy tar or sticky residue remains stuck.',
        },
      ],
      pureObservation: {
        title: 'Intense Eye-Watering Pungency, High Smoke Point, Zero Foam',
        description: 'Pure cold-pressed mustard oil has an exceptionally high smoke point (250°C). Heating releases intense volatile allyl isothiocyanates causing healthy eye-watering pungency without persistent froth.',
        visualBadge: 'High Thermal Stability (250°C)',
        keyTraits: [
          'Heats smoothly without dense frothing or continuous white foam.',
          'Releases sharp, clean, nose-clearing and eye-watering mustard aroma.',
          'No premature smoke at low temperatures (<170°C).',
          'Cools into clear liquid leaving zero sticky black tar on the pan bottom.'
        ],
        scientificReason: 'Cold pressed mustard seed triglycerides have high thermal resistance. Volatile allyl isothiocyanates vaporize cleanly without polymerizing into gummy residue.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Violent White Froth, Choking Acrid Smoke & Sticky Black Tar',
        description: 'Adulterated mustard oil froths aggressively to the pan rim at low heat, emits acrid chemical smoke, or leaves a black sticky varnish on the bottom.',
        visualBadge: 'Heavy Foam & Sticky Tar Crust',
        keyTraits: [
          'Excessive white froth and soap-like foam bubbles covering the pan surface.',
          'Early choking smoke smelling like burnt rubber, motor oil, or greasy fat.',
          'Lack of natural eye-watering pungency (replaced by chemical odor).',
          'Leaves a dark sticky, gummy varnish crust on the pan bottom (Argemone seed oil toxicity).'
        ],
        scientificReason: 'Degraded fryer oils and palm olein contain high free fatty acids that froth at low temperatures; Argemone seed oil leaves polymer tar deposits upon heating.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Thermal degradation causes secondary oxidation products (TPC, aldehydes) to form surfactants that generate foam, while pure mustard oil maintains low polarity and high smoke point.',
      fssaiRef: 'FSSAI RUCO Standards & Physical Heating Verification',
      simulatorOptions: [
        {
          id: 'opt_mustard_heat_pure',
          label: 'Smooth heating, intense natural pungency (eye-watering), clear liquid',
          description: 'No foam, clean golden liquid, high smoke point.',
          outcome: 'PURE',
          visualEffect: 'smooth_heating',
          explanation: 'Pass! Demonstrates authentic thermal resistance and natural volatile mustard isothiocyanate content.'
        },
        {
          id: 'opt_mustard_heat_foam',
          label: 'Extensive white foam / froth spreading across pan',
          description: 'Surface covered in foam bubbles resembling soap suds.',
          outcome: 'ADULTERATED',
          visualEffect: 'heavy_foam',
          explanation: 'Adulterated with cheap palm oil, moisture, or spent repeatedly-used restaurant waste oil.'
        },
        {
          id: 'opt_mustard_heat_tar',
          label: 'Choking chemical smoke with black sticky tar residue at bottom',
          description: 'Heavy chemical odor leaving a dark sticky varnish on the pan.',
          outcome: 'ADULTERATED',
          visualEffect: 'acrid_smoke',
          explanation: 'HIGH RISK: Indicator of toxic Argemone seed oil contamination or petroleum solvent residue.'
        }
      ]
    },
    palm_touch_friction_test: {
      id: 'palm_touch_friction_test',
      title: 'Mustard Oil - Friction Heat Pungency & Dye Stain Test',
      subtitle: 'Friction heat vaporizes volatile allyl isothiocyanates to test pungency and exposes synthetic Metanil Yellow skin dye.',
      category: 'Sensory & Touch',
      targetOils: ['Mustard Oil (Kachi Ghani / Sarson)'],
      adulterantsDetected: ['Metanil Yellow Synthetic Dye', 'Liquid Paraffin (Mineral Oil)', 'Odorless Refined Palm / Rice Bran Dilution'],
      difficulty: 'Very Easy',
      estimatedDuration: '30 Seconds',
      durationSeconds: 30,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean, dry hands and palms', isHousehold: true },
        { name: 'White paper tissue or napkin', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Clean and Dry Palms',
          instructions: 'Wash and dry hands thoroughly to remove any existing scent.',
        },
        {
          stepNumber: 2,
          title: 'Apply 3-4 Drops to Palm',
          instructions: 'Pour 3 to 4 drops of mustard oil onto the center of your palm.',
        },
        {
          stepNumber: 3,
          title: 'Rub Palms Vigorously (15 Seconds)',
          instructions: 'Rub both palms together vigorously for 15 seconds to generate friction heat.',
          timeSeconds: 15,
          timerLabel: 'Friction Heat Generation',
        },
        {
          stepNumber: 4,
          title: 'Cup Over Nose & Inhale, Then Wipe on Tissue',
          instructions: 'Immediately cup palms over your nose and inhale deeply. Then wipe palms with a clean white tissue to check for yellow synthetic dye stain.',
        },
      ],
      pureObservation: {
        title: 'Sharp Nasal Pungency, Clean Skin Wipe',
        description: 'Natural allyl isothiocyanate vaporizes with body friction, giving an immediate sharp nasal sting and eye warmth. Skin tissue wipes clean without staining yellow.',
        visualBadge: 'Authentic Allyl Isothiocyanate',
        keyTraits: [
          'Immediate, sharp, nasal-clearing and eye-watering pungency.',
          'Tissue wipes clean with only a pale faint oily sheen (no bright yellow tint).',
          'Absorbs smoothly into skin without an unnatural suffocating plastic film.',
          'Zero kerosene, paint, or chemical solvent odor.'
        ],
        scientificReason: 'Pure cold-pressed mustard oil owes its pungency to natural glucosinolates (sinigrin) enzymatically converted to volatile allyl isothiocyanate.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Bland/Oily Odor & Stubborn Bright Yellow Dye Stain',
        description: 'Adulterated mustard oil lacks authentic pungency, feels like heavy machine grease, or leaves a bright stubborn yellow dye stain on your skin and tissue.',
        visualBadge: 'Metanil Yellow Dye Stain & Mineral Slick',
        keyTraits: [
          'Weak, flat, or bland smell (diluted with neutral palm or rice bran oil).',
          'Leaves a noticeable bright yellow chemical dye stain on skin and tissue (Metanil Yellow dye).',
          'Leaves a cold, persistent, slippery petroleum slick (mineral oil / paraffin).',
          'Chemical solvent or diesel-like odor upon friction warming.'
        ],
        scientificReason: 'Metanil Yellow is a water-soluble industrial dye that binds readily to epidermal keratin proteins, leaving a stubborn yellow stain.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Friction heating rapidly increases volatile vapor pressure of isothiocyanates, while industrial azo dyes transfer and stain epidermal skin layers.',
      fssaiRef: 'FSSAI Sensory Evaluation & DART Protocol for Metanil Yellow',
      simulatorOptions: [
        {
          id: 'opt_mustard_aroma_pure',
          label: 'Intense sharp pungency that clears sinuses; wipes off clean',
          description: 'Strong authentic mustard aroma, no chemical smell, no yellow dye stain.',
          outcome: 'PURE',
          visualEffect: 'pure_touch',
          explanation: 'Pass! Genuine cold-pressed Kachi Ghani mustard oil with natural allyl isothiocyanate.'
        },
        {
          id: 'opt_mustard_aroma_bland',
          label: 'Bland, flat, or odorless with greasy silicone feel',
          description: 'Lacks real mustard pungency; feels like heavy mineral grease.',
          outcome: 'ADULTERATED',
          visualEffect: 'greasy_mineral',
          explanation: 'Heavily diluted with cheap neutral refined oil (palm olein or rice bran) or liquid paraffin.'
        },
        {
          id: 'opt_mustard_aroma_stain',
          label: 'Leaves a stubborn bright yellow stain on palm & tissue',
          description: 'Skin or white tissue is stained bright artificial yellow.',
          outcome: 'ADULTERATED',
          visualEffect: 'foul_grease',
          explanation: 'DANGEROUS: Contaminated with toxic carcinogenic Metanil Yellow dye used to fake golden mustard color.'
        }
      ]
    },
    paper_blot_test: {
      id: 'paper_blot_test',
      title: 'Mustard Oil - Capillary Paper Blot & Dye Ring Test',
      subtitle: 'Uses paper capillary action to separate water-soluble Metanil Yellow dye and moisture from mustard oil.',
      category: 'Surface & Absorption',
      targetOils: ['Mustard Oil (Kachi Ghani)'],
      adulterantsDetected: ['Metanil Yellow Dye', 'Water Emulsion', 'Argemone Oil Discoloration', 'Light Solvents'],
      difficulty: 'Very Easy',
      estimatedDuration: '10 - 15 Minutes',
      durationSeconds: 600,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Plain white printer paper or coffee filter', isHousehold: true },
        { name: 'Dropper or spoon edge', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Place Clean White Paper Flat',
          instructions: 'Lay a clean, dry sheet of unprinted white paper on a flat surface.',
        },
        {
          stepNumber: 2,
          title: 'Deposit 2 Drops of Mustard Oil',
          instructions: 'Place 2 drops of mustard oil in the center of the paper.',
        },
        {
          stepNumber: 3,
          title: 'Wait 10-15 Minutes for Capillary Spread',
          instructions: 'Allow the oil to spread naturally across paper fibers without smudging.',
          timeSeconds: 600,
          timerLabel: 'Capillary Action Timer',
        },
        {
          stepNumber: 4,
          title: 'Inspect Spot Perimeter Against Light',
          instructions: 'Hold against light. Check if the spot is uniform golden translucent, or if a bright yellow/pink ring forms at the outer perimeter.',
        },
      ],
      pureObservation: {
        title: 'Uniform Golden Translucent Spot, Clean Boundary',
        description: 'Pure mustard oil spreads evenly as a single translucent amber spot without colored fringe rings or paper crinkling.',
        visualBadge: 'Uniform Translucent Amber Spot',
        keyTraits: [
          'Translucent spot spreads slowly with consistent golden hue.',
          'Outer perimeter is smooth and clean with zero secondary rings.',
          'Paper remains smooth without wrinkling.',
          'Zero bright yellow, orange, or reddish-pink dye halo.'
        ],
        scientificReason: 'Natural lipophilic carotenoids remain evenly dispersed in the triglyceride matrix as it migrates through cellulose fibers.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Intense Yellow or Pink Dye Ring Separating at Outer Edge',
        description: 'Capillary chromatography separates synthetic dyes from the oil, forming a bright yellow or reddish-pink halo ring at the outer boundary.',
        visualBadge: 'Chromatographic Dye Halo',
        keyTraits: [
          'Intense bright yellow or reddish-pink ring formed around the outer edge of the spot.',
          'Paper crinkles around the perimeter due to added water/moisture.',
          'Dark brownish or dirty blackish spots indicating Argemone seed oil.',
          'Rapid watery diffusion outward.'
        ],
        scientificReason: 'Synthetic Metanil Yellow has higher capillary migration speed than heavy vegetable lipids, separating chromatographically onto the paper perimeter.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Cellulose capillary chromatography: polar synthetic azo dyes travel faster along paper fibers than non-polar triglycerides, forming distinct outer halo rings.',
      fssaiRef: 'FSSAI Home Test Manual: Rapid Dye and Moisture Screening',
      simulatorOptions: [
        {
          id: 'opt_mustard_paper_pure',
          label: 'Uniform golden translucent spot spreading evenly without fringe rings',
          description: 'Single smooth amber spot with clean perimeter.',
          outcome: 'PURE',
          visualEffect: 'pure_blot',
          explanation: 'Pass! Normal uniform capillary spread of pure uncolored mustard oil.'
        },
        {
          id: 'opt_mustard_paper_dye',
          label: 'Bright yellow or pinkish fluorescent ring around outer edge',
          description: 'Distinct colored halo band separates at the perimeter.',
          outcome: 'ADULTERATED',
          visualEffect: 'dye_blot',
          explanation: 'Adulterated with synthetic artificial dyes (Metanil Yellow or coal-tar colorings).'
        },
        {
          id: 'opt_mustard_paper_halo',
          label: 'Wide watery halo that crinkles the paper fibers',
          description: 'Fast-spreading watery ring that causes paper to buckle.',
          outcome: 'ADULTERATED',
          visualEffect: 'halo_blot',
          explanation: 'Indicates high moisture content or solvent dilution.'
        }
      ]
    },
    water_bubble_test: {
      id: 'water_bubble_test',
      title: 'Mustard Oil - Water Shake & Emulsion Test',
      subtitle: 'Checks interfacial surface tension, hydrophobic phase separation, and detergent / soap residues.',
      category: 'Surface & Absorption',
      targetOils: ['Mustard Oil (Kachi Ghani)'],
      adulterantsDetected: ['Chemical Surfactants', 'Detergent Residues', 'Castor Oil Over-blend', 'Crude Degumming Sludge'],
      difficulty: 'Very Easy',
      estimatedDuration: '2 Minutes',
      durationSeconds: 120,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean transparent glass tumbler with water', isHousehold: true },
        { name: 'Spoon', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Fill Glass 3/4 with Water',
          instructions: 'Fill a clean transparent glass tumbler 3/4 full with still room-temperature water.',
        },
        {
          stepNumber: 2,
          title: 'Add 1 Teaspoon Mustard Oil',
          instructions: 'Gently add 1 teaspoon (5 mL) of mustard oil to the water.',
        },
        {
          stepNumber: 3,
          title: 'Vigorously Stir / Shake (30 Seconds)',
          instructions: 'Stir vigorously with a spoon or shake in a bottle for 30 seconds.',
          timeSeconds: 30,
          timerLabel: 'Stir / Shake Timer',
        },
        {
          stepNumber: 4,
          title: 'Rest for 2 Minutes & Inspect Layers',
          instructions: 'Let it rest on the counter. Observe how quickly the oil separates from water and whether the water stays clear or turns milky.',
          timeSeconds: 90,
          timerLabel: 'Phase Separation Rest Timer',
        },
      ],
      pureObservation: {
        title: 'Sharp Clean Separation, Water Remains Crystal Clear',
        description: 'Pure mustard oil separates completely into a distinct floating amber layer on top within 1 to 2 minutes. The water underneath remains crystal clear.',
        visualBadge: 'Clean Hydrophobic Layer',
        keyTraits: [
          'Oil floats on top as a clean, cohesive golden layer.',
          'Water beneath remains crystal clear without milky haze.',
          'Zero persistent soapy foam bubbles at the boundary.',
          'Sharp, neat boundary line between oil and water.'
        ],
        scientificReason: 'Pure triglycerides have high hydrophobic surface tension (~31 mN/m) and cannot stay emulsified in water without surfactants.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Persistent Milky Water & Long-Lasting Soapy Froth',
        description: 'Adulterated oil turns the water cloudy/milky and produces thick soapy foam bubbles that remain at the surface for over 10 minutes.',
        visualBadge: 'Milky Emulsion & Soapy Froth',
        keyTraits: [
          'Water turns turbid, hazy, or milky white.',
          'Thick layer of soap-like bubbles at the surface that refuses to pop.',
          'Oil remains suspended as cloudy filaments in the water.',
          'Indicates detergent or chemical surfactant adulteration.'
        ],
        scientificReason: 'Synthetic detergents and surfactants reduce interfacial surface tension to near zero, locking the oil into a stable milky emulsion.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Thermodynamics of interfacial free energy: pure lipids spontaneously demix from polar water, while amphiphilic surfactants stabilize colloidal micelles.',
      fssaiRef: 'FSSAI Rapid Screening Protocol for Added Surfactants & Detergents in Edible Oils',
      simulatorOptions: [
        {
          id: 'opt_mustard_water_pure',
          label: 'Oil separates into clean floating layer; water stays 100% clear',
          description: 'Complete demixing within 2 minutes with clear water.',
          outcome: 'PURE',
          visualEffect: 'pure_lens',
          explanation: 'Pass! High hydrophobic surface tension confirms absence of detergents or emulsifiers.'
        },
        {
          id: 'opt_mustard_water_milky',
          label: 'Water beneath turns milky white or cloudy',
          description: 'Hazy milky emulsion that does not clear up.',
          outcome: 'ADULTERATED',
          visualEffect: 'milky_emulsion',
          explanation: 'Detergent, soap residue, or chemical emulsifier contamination detected.'
        },
        {
          id: 'opt_mustard_water_foam',
          label: 'Thick soapy foam bubbles persist on the surface (>10 mins)',
          description: 'Long-lasting froth resembling dish soap bubbles.',
          outcome: 'ADULTERATED',
          visualEffect: 'fragmented_sheen',
          explanation: 'Strong presence of artificial foaming surfactants or industrial washing residues.'
        }
      ]
    },
    yellow_mustard_dye_test: OIL_TESTS.find(t => t.id === 'yellow_mustard_dye_test')!,
    argemone_nitric_test: OIL_TESTS.find(t => t.id === 'argemone_nitric_test')!,
  },

  // 2. DESI GHEE & BUTTER
  desi_ghee: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Desi Ghee - Refrigeration Solidification & Granular Matrix Test',
      subtitle: 'Detects vegetable oil blending, liquid paraffin, and animal tallow by phase separation and granular matrix structure.',
      category: 'Freezing & Cooling',
      targetOils: ['Desi Cow / Buffalo Ghee', 'Pure Cooking Butter'],
      adulterantsDetected: ['Vanaspati (Hydrogenated Dalda)', 'Animal Tallow / Industrial Grease', 'Liquid Paraffin (Mineral Oil)', 'Vegetable Oils'],
      difficulty: 'Very Easy',
      estimatedDuration: '1 - 2 Hours in Refrigerator',
      durationSeconds: 3600,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Small dry transparent glass tumbler', isHousehold: true },
        { name: 'Home Refrigerator (approx. 4°C)', isHousehold: true },
      ],
      safetyWarning: 'Ensure the glass is dry. Moisture causes false graininess.',
      steps: [
        {
          stepNumber: 1,
          title: 'Gently Melt Ghee Sample',
          instructions: 'Warm 30 mL of ghee until it is completely liquid, clear, and golden (do not scorch).',
        },
        {
          stepNumber: 2,
          title: 'Pour into Dry Transparent Glass',
          instructions: 'Pour the warm liquid ghee into a clean dry glass tumbler.',
        },
        {
          stepNumber: 3,
          title: 'Refrigerate for 1-2 Hours (4°C)',
          instructions: 'Place in the refrigerator chiller section for 1 to 2 hours until solidified.',
          timeSeconds: 3600,
          timerLabel: 'Ghee Solidification Timer',
        },
        {
          stepNumber: 4,
          title: 'Inspect Crystal Matrix & Layers',
          instructions: 'Remove and inspect against light. Observe if it solidified into a single uniform granular (danedar) block or separated into multiple distinct layers.',
        },
      ],
      pureObservation: {
        title: 'Uniform Granular (Danedar) Solid Block Throughout',
        description: 'Pure cow/buffalo ghee solidifies uniformly into a single homogeneous block with its signature natural granular (danedar) crystal matrix from top to bottom.',
        visualBadge: 'Uniform Danedar Matrix',
        keyTraits: [
          'Solidifies into a single, uniform mass without separate liquid pools.',
          'Retains natural granular (danedar) crystal distribution.',
          'Even golden-yellow (cow) or creamy white (buffalo) color throughout.',
          'Zero runny liquid oil pooled on top of solid fat.'
        ],
        scientificReason: 'Natural dairy fat consists of mixed triglycerides with consistent melting points (32°C–35°C) that co-crystallize into uniform spherulitic granules.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Multi-Tiered Strata, Waxy White Crust & Liquid Pools',
        description: 'Adulterated ghee separates into visible distinct layers: vegetable oils stay liquid on top, while Vanaspati or tallow forms a waxy, greasy non-granular sediment below.',
        visualBadge: 'Stratified Waxy Layers',
        keyTraits: [
          'Two or three distinct horizontal layers of differing color and texture.',
          'Unnatural waxy, greasy, smooth paste without true granular texture (Vanaspati/tallow).',
          'Liquid vegetable oil or mineral paraffin pooled at the surface.',
          'Chalky white sediment at the bottom (starch/boiled potatoes).'
        ],
        scientificReason: 'Hydrogenated vegetable fats (Dalda) and mineral oils have completely different triglyceride profiles and densities from milk fat, causing immiscible phase stratification.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Fractional crystallization dynamics: Milk fat forms stable beta-prime crystals uniformly, whereas hydrogenated trans-fats precipitate as dense waxy beta-crystals separated from liquid oils.',
      fssaiRef: 'FSSAI Home Rapid Test for Vanaspati & Mineral Oil in Ghee',
      simulatorOptions: [
        {
          id: 'opt_ghee_freeze_pure',
          label: 'Solidifies uniformly into a single granular (danedar) block',
          description: 'Single solid block with authentic granular texture and no liquid layer.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Authentic dairy ghee crystallization showing natural granular structure.'
        },
        {
          id: 'opt_ghee_freeze_strata',
          label: 'Distinct separate layers: liquid on top, waxy sediment below',
          description: 'Two or three distinct layers with runny liquid on top.',
          outcome: 'ADULTERATED',
          visualEffect: 'two_layers',
          explanation: 'Adulterated with vegetable oil, liquid paraffin, or hydrogenated fat blends.'
        },
        {
          id: 'opt_ghee_freeze_waxy',
          label: 'Dense waxy solid with zero granular texture and tallow smell',
          description: 'Feels like candle wax or smooth vegetable shortening.',
          outcome: 'ADULTERATED',
          visualEffect: 'white_patches',
          explanation: 'High risk: blended with Vanaspati (Dalda) or animal slaughterhouse tallow.'
        }
      ]
    },
    heating_test: {
      id: 'heating_test',
      title: 'Desi Ghee - 5-Second Rapid Caramelization Test',
      subtitle: 'Instant thermal differentiation: pure milk fat caramelizes dark brown in 5 seconds; Vanaspati (Dalda) stays pale.',
      category: 'Thermal & Smoke',
      targetOils: ['Desi Cow / Buffalo Ghee', 'Cooking Butter'],
      adulterantsDetected: ['Vanaspati (Dalda)', 'Animal Tallow / Slaughterhouse Fat', 'Mashed Potato / Starch', 'Palm Stearin'],
      difficulty: 'Very Easy',
      estimatedDuration: '30 Seconds',
      durationSeconds: 30,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean stainless steel spoon or small ladle', isHousehold: true },
        { name: 'Kitchen gas flame or burner', isHousehold: true },
      ],
      safetyWarning: 'Use a long handle spoon or tongs to avoid burns from direct flame.',
      steps: [
        {
          stepNumber: 1,
          title: 'Take 1 Teaspoon Ghee in Spoon',
          instructions: 'Place 1 teaspoon (5 mL) of solid or semi-solid ghee in a clean stainless steel spoon or small ladle.',
        },
        {
          stepNumber: 2,
          title: 'Hold Directly Over Medium Flame',
          instructions: 'Hold the spoon directly over medium gas heat for 5 to 10 seconds.',
          timeSeconds: 10,
          timerLabel: 'Flame Heating Timer (5-10s)',
        },
        {
          stepNumber: 3,
          title: 'Observe Melting Speed & Color Change',
          instructions: 'Watch closely: notice if it melts instantly and turns dark reddish-brown, or if it takes long and stays pale yellow.',
        },
      ],
      pureObservation: {
        title: 'Melts Instantly (<5s) & Turns Dark Reddish-Brown',
        description: 'Pure dairy ghee melts immediately and turns dark reddish-brown within 3 to 5 seconds, releasing an authentic, rich caramelized nutty dairy aroma.',
        visualBadge: 'Rapid Maillard Caramelization (<5s)',
        keyTraits: [
          'Melts completely in less than 5 seconds.',
          'Turns rich dark reddish-brown immediately upon heating.',
          'Releases delicious, caramelized nutty dairy aroma.',
          'Zero excessive splattering, no white chalky residue.'
        ],
        scientificReason: 'Authentic cow/buffalo ghee contains trace milk proteins and lactose that undergo rapid Maillard reaction and sugar caramelization under heat.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Takes Long to Melt, Stays Pale Yellow / Whitish & Splatters',
        description: 'Vanaspati (Dalda) and animal tallow lack milk solids and have high melting points. They take 15–30 seconds to melt, stay pale yellow/white, and smell greasy.',
        visualBadge: 'Pale Yellow Non-Browning Melt',
        keyTraits: [
          'Takes 15 to 30 seconds to melt completely.',
          'Remains pale yellow or yellowish-white without browning.',
          'Violent crackling and splattering due to high added water/starch.',
          'Emits foul burnt shortening, paint, or tallow chemical smell.'
        ],
        scientificReason: 'Hydrogenated vegetable oils and tallow contain zero lactose or dairy proteins, preventing rapid Maillard browning.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Maillard reaction kinetics: Amino acids and lactose trace sugars in clarified milk fat rapidly brown at >120°C, while industrial trans fats contain only refined triglycerides.',
      fssaiRef: 'FSSAI Rapid Spoon Heating Test for Desi Ghee Purity',
      simulatorOptions: [
        {
          id: 'opt_ghee_heat_pure',
          label: 'Melts instantly (<5s) and turns deep reddish-brown with sweet aroma',
          description: 'Immediate melting and dark brown caramelization within seconds.',
          outcome: 'PURE',
          visualEffect: 'smooth_heating',
          explanation: 'Pass! Classic rapid caramelization of authentic milk solids in pure ghee.'
        },
        {
          id: 'opt_ghee_heat_pale',
          label: 'Takes long to melt, stays pale yellow/whitish with chemical fat smell',
          description: 'Takes 15-30s to melt, does not turn brown, smells like vegetable shortening.',
          outcome: 'ADULTERATED',
          visualEffect: 'acrid_smoke',
          explanation: 'Adulterated with Vanaspati (Dalda) or animal tallow which lack dairy solids.'
        },
        {
          id: 'opt_ghee_heat_splatter',
          label: 'Violent crackling and white frothy bubbling leaving chalky sediment',
          description: 'Fierce splattering and leaves a burnt crust at the spoon bottom.',
          outcome: 'ADULTERATED',
          visualEffect: 'heavy_foam',
          explanation: 'Contaminated with boiled starch bulker (potatoes/flour) or high water content.'
        }
      ]
    },
    palm_touch_friction_test: {
      id: 'palm_touch_friction_test',
      title: 'Desi Ghee - Body Heat Palm Melting & Aroma Test',
      subtitle: 'Uses natural 37°C body heat to test melting point: Pure Ghee melts in 5s; Vanaspati (Dalda) stays waxy solid.',
      category: 'Sensory & Touch',
      targetOils: ['Desi Cow / Buffalo Ghee'],
      adulterantsDetected: ['Vanaspati (Hydrogenated Dalda)', 'Animal Tallow', 'Mineral Wax / Paraffin', 'Starch Bulkers'],
      difficulty: 'Very Easy',
      estimatedDuration: '30 Seconds',
      durationSeconds: 30,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean, dry hands and palms', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Take 1/2 Teaspoon Semi-Solid Ghee',
          instructions: 'Take approximately half a teaspoon of ghee at normal room temperature.',
        },
        {
          stepNumber: 2,
          title: 'Place Directly in Center of Palm',
          instructions: 'Place it on your open palm. DO NOT rub immediately. Let your body heat act.',
        },
        {
          stepNumber: 3,
          title: 'Observe for 10 Seconds (Body Heat)',
          instructions: 'Watch how quickly it melts just from your natural 37°C body heat.',
          timeSeconds: 10,
          timerLabel: 'Body Heat Melting Timer',
        },
        {
          stepNumber: 4,
          title: 'Rub Gently and Smell',
          instructions: 'Rub palms together gently. Inspect if it absorbed like a smooth lotion with rich dairy aroma or left a sticky waxy paste.',
        },
      ],
      pureObservation: {
        title: 'Melts Instantly in 3-5 Seconds with Caramel Dairy Aroma',
        description: 'Pure cow/buffalo ghee has a natural melting point of 32°C–35°C (lower than body temperature 37°C). It liquefies within 3 to 5 seconds on contact with your palm, leaving a silky finish and sweet dairy scent.',
        visualBadge: 'Body Temperature Liquefaction (32°C)',
        keyTraits: [
          'Melts into warm golden liquid within 3 to 5 seconds without rubbing.',
          'Absorbs smoothly into skin leaving a silky, velvety sheen.',
          'Releases genuine, comforting dairy ghee fragrance.',
          'Zero waxy, sticky, or gritty plastic coating.'
        ],
        scientificReason: 'Short and medium chain dairy fatty acids (butyric, caproic) have low melting points below 35°C, ensuring rapid phase change upon human skin contact.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Remains Firm Waxy Lump, Refuses to Melt, Greasy Coating',
        description: 'Vanaspati (Dalda), tallow, and paraffin wax have melting points of 40°C–45°C (higher than body temperature). It stays firm and waxy on your palm, refusing to melt.',
        visualBadge: 'High Melting Point Dalda / Wax (>40°C)',
        keyTraits: [
          'Does not melt on your open palm even after 20 seconds.',
          'Remains a firm, waxy paste or gritty lump.',
          'Leaves an uncomfortable, sticky, petroleum-like plastic barrier.',
          'Artificial buttery perfume or foul animal grease odor.'
        ],
        scientificReason: 'Hydrogenated trans-fatty acids and animal saturated stearates have melting points between 40°C and 45°C, requiring temperatures higher than human body heat to liquefy.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Thermodynamics of lipid phase transition: Body temperature (37°C) exceeds dairy fat melting range (32°C-35°C) but is insufficient to melt hydrogenated fat (42°C-46°C).',
      fssaiRef: 'FSSAI DART Method: Palm Touch Screening for Hydrogenated Fat in Ghee',
      simulatorOptions: [
        {
          id: 'opt_ghee_aroma_pure',
          label: 'Melts completely within 5 seconds into warm liquid oil with rich dairy aroma',
          description: 'Melts effortlessly from body heat alone; silky and non-sticky.',
          outcome: 'PURE',
          visualEffect: 'pure_touch',
          explanation: 'Pass! Melting point is below 35°C, characteristic of authentic milk fat.'
        },
        {
          id: 'opt_ghee_aroma_waxy',
          label: 'Does not melt on palm; stays firm waxy paste or gritty clump',
          description: 'Remains solid on hand; requires hot water to wash off.',
          outcome: 'ADULTERATED',
          visualEffect: 'greasy_mineral',
          explanation: 'Adulterated with Vanaspati (Dalda) or animal tallow with melting point >40°C.'
        },
        {
          id: 'opt_ghee_aroma_greasy',
          label: 'Leaves a sticky plastic-like petroleum coating with synthetic smell',
          description: 'Uncomfortable heavy grease layer that refuses to absorb.',
          outcome: 'ADULTERATED',
          visualEffect: 'foul_grease',
          explanation: 'Contaminated with paraffin wax or petroleum grease blends.'
        }
      ]
    },
    paper_blot_test: {
      id: 'paper_blot_test',
      title: 'Desi Ghee - Paper Blot & Starch Crust Detection Test',
      subtitle: 'Exposes added mashed potatoes, flour, or starch bulking agents added to increase ghee weight.',
      category: 'Surface & Absorption',
      targetOils: ['Desi Ghee', 'Butter'],
      adulterantsDetected: ['Boiled Potato Mash', 'Cornflour / Starch', 'Refined Wheat Flour (Maida)', 'Mineral Wax'],
      difficulty: 'Very Easy',
      estimatedDuration: '10 Minutes',
      durationSeconds: 600,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Plain white paper or filter paper', isHousehold: true },
        { name: 'Tincture of Iodine or Betadine (optional confirmation)', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Melt a Small Amount of Ghee',
          instructions: 'Melt 1 teaspoon of ghee until clear liquid.',
        },
        {
          stepNumber: 2,
          title: 'Deposit 2 Drops on White Paper',
          instructions: 'Place 2 drops onto clean white paper.',
        },
        {
          stepNumber: 3,
          title: 'Allow to Cool & Absorb (10 Mins)',
          instructions: 'Allow the grease spot to form naturally for 10 minutes.',
          timeSeconds: 600,
          timerLabel: 'Paper Blot Absorption Timer',
        },
        {
          stepNumber: 4,
          title: 'Inspect Surface Texture & Add Iodine Drop',
          instructions: 'Feel the spot with your fingertip. Pure ghee leaves a smooth translucent grease spot. Starch leaves a stiff, chalky white crust that turns navy blue with iodine.',
        },
      ],
      pureObservation: {
        title: 'Smooth Translucent Grease Spot, Zero Starch Crust',
        description: 'Pure ghee produces a clean translucent circular spot that remains smooth to touch. When a drop of iodine is added, it stays natural reddish-brown.',
        visualBadge: 'Clean Translucent Lipid Spot',
        keyTraits: [
          'Smooth translucent grease spot that fades evenly when warmed.',
          'Zero white chalky crust or powdery residue on the paper.',
          'Iodine drop stays natural amber/brownish without turning blue.',
          'Paper remains pliable without stiff starch warping.'
        ],
        scientificReason: 'Clarified milk fat contains zero carbohydrate starches or polysaccharides.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Stiff Chalky Crust that Turns Deep Blue with Iodine',
        description: 'Adulterated ghee leaves a stiff, chalky white crust on the paper. Adding a drop of iodine turns the spot instant deep blue-black, proving starch presence.',
        visualBadge: 'Stiff Starch Crust (Blue with Iodine)',
        keyTraits: [
          'Leaves a noticeable white, chalky, or powdery crust as it dries.',
          'Paper becomes stiff and brittle where starch soaked in.',
          'Turns instant deep navy blue / purple when touched with iodine solution.',
          'Indicates gross bulking with mashed potatoes or flour.'
        ],
        scientificReason: 'Starch amylose helical structures trap iodine molecules, forming an intense charge-transfer complex with deep blue light absorbance.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Amylose starch-iodine inclusion complex: Triiodide (I3-) ions intercalate into the helical cavity of amylose polymers, yielding intense 600 nm blue absorption.',
      fssaiRef: 'FSSAI DART Method #D-01: Detection of Starch in Ghee & Butter',
      simulatorOptions: [
        {
          id: 'opt_ghee_paper_pure',
          label: 'Leaves clean translucent spot; iodine drop stays reddish-brown',
          description: 'No chalky crust, no blue color reaction with iodine.',
          outcome: 'PURE',
          visualEffect: 'pure_blot',
          explanation: 'Pass! Pure milk fat with zero added starch, potatoes, or flour.'
        },
        {
          id: 'opt_ghee_paper_starch',
          label: 'Leaves chalky stiff crust; iodine drop turns intense deep blue-black',
          description: 'Definitive blue/purple color reaction on paper.',
          outcome: 'ADULTERATED',
          visualEffect: 'dye_blot',
          explanation: 'Adulterated with mashed potatoes, cornflour, or wheat flour bulking agents.'
        },
        {
          id: 'opt_ghee_paper_wax',
          label: 'Leaves a thick non-drying waxy ring that does not absorb',
          description: 'Greasy waxy buildup that does not behave like normal fat.',
          outcome: 'ADULTERATED',
          visualEffect: 'halo_blot',
          explanation: 'Contaminated with paraffin wax or animal tallow.'
        }
      ]
    },
    water_bubble_test: {
      id: 'water_bubble_test',
      title: 'Desi Ghee - Water Dispersion & Starch Settling Test',
      subtitle: 'Checks phase separation, emulsifier contamination, and settling of dense starch bulkers in warm water.',
      category: 'Surface & Absorption',
      targetOils: ['Desi Cow / Buffalo Ghee'],
      adulterantsDetected: ['Mashed Potatoes / Starch', 'Detergent / Emulsifier', 'Animal Tallow Emulsion'],
      difficulty: 'Very Easy',
      estimatedDuration: '2 Minutes',
      durationSeconds: 120,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Transparent glass tumbler with warm water', isHousehold: true },
        { name: 'Spoon', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Fill Glass with Warm Water (40°C)',
          instructions: 'Fill a transparent glass 3/4 full with warm water (around 40°C, comfortable to touch).',
        },
        {
          stepNumber: 2,
          title: 'Add 1 Teaspoon Melted Ghee',
          instructions: 'Pour 1 teaspoon of warm melted ghee into the water.',
        },
        {
          stepNumber: 3,
          title: 'Stir for 20 Seconds and Rest',
          instructions: 'Stir with a spoon and allow it to rest for 1 minute.',
          timeSeconds: 60,
          timerLabel: 'Water Dispersion Timer',
        },
        {
          stepNumber: 4,
          title: 'Inspect Water Clarity & Bottom Sediment',
          instructions: 'Observe if the ghee rises as a clean golden oil layer on top while water stays clear, or if white starch clouds settle to the bottom.',
        },
      ],
      pureObservation: {
        title: 'Melted Ghee Floats on Top, Water Remains Crystal Clear',
        description: 'Pure melted ghee rises completely to the surface as a clean, liquid golden layer. The warm water underneath stays completely transparent with zero sediment.',
        visualBadge: 'Clear Floating Dairy Layer',
        keyTraits: [
          '100% of the ghee floats cleanly on top of warm water.',
          'Water underneath remains crystal clear.',
          'Zero white sediment or cloudy particles settled at the bottom.',
          'No soapy foam at the water-oil interface.'
        ],
        scientificReason: 'Clarified milk fat has a density of ~0.91 g/cm3 and is strictly hydrophobic, separating rapidly above water.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Cloudy Milky Water with White Sediment Settled at Bottom',
        description: 'Mashed potatoes, flour, and starch are heavier than water (density > 1.4 g/cm3). They separate from the fat and settle as a cloudy sludge at the bottom.',
        visualBadge: 'Starch Sediment & Milky Emulsion',
        keyTraits: [
          'Dense white cloudy sludge settling at the bottom of the glass.',
          'Water turns hazy, turbid, or milky white.',
          'Floating oil contains suspended lumpy particles.',
          'Persistent froth or scum at the interface.'
        ],
        scientificReason: 'Insoluble starch granules and polar emulsifiers dissolve into the aqueous phase and precipitate by gravity.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Gravitational phase separation: Starch granules (density ~1.5 g/mL) sink in water, while pure milk lipids (density ~0.91 g/mL) float cleanly.',
      fssaiRef: 'FSSAI Home Screening for Insoluble Bulkers in Ghee',
      simulatorOptions: [
        {
          id: 'opt_ghee_water_pure',
          label: 'Ghee floats as clear golden oil; water stays 100% clear',
          description: 'Clean phase separation with zero bottom sediment.',
          outcome: 'PURE',
          visualEffect: 'pure_lens',
          explanation: 'Pass! Pure clarified butter fat with complete hydrophobic separation.'
        },
        {
          id: 'opt_ghee_water_sediment',
          label: 'White cloudy sludge or particles settle at the bottom',
          description: 'Dense sediment forms at the base of the glass.',
          outcome: 'ADULTERATED',
          visualEffect: 'milky_emulsion',
          explanation: 'Adulterated with boiled mashed potatoes, flour, or starch bulking agents.'
        },
        {
          id: 'opt_ghee_water_milky',
          label: 'Water turns completely milky white with persistent soapy froth',
          description: 'Hazy milky emulsion that does not clear.',
          outcome: 'ADULTERATED',
          visualEffect: 'fragmented_sheen',
          explanation: 'Contains chemical emulsifiers, detergents, or reconstituted industrial dairy waste.'
        }
      ]
    },
    iodine_starch_test: OIL_TESTS.find(t => t.id === 'iodine_starch_test')!,
  },

  // 3. COCONUT OIL (NARIYAL)
  coconut_oil: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Coconut Oil - Solidification & Paraffin Phase Separation Test',
      subtitle: 'Verifies the sharp 24°C lauric acid freezing point to detect mineral oil (liquid paraffin) and cheap seed oils.',
      category: 'Freezing & Cooling',
      targetOils: ['Virgin & Cold-Pressed Coconut Oil (Nariyal Ka Tel)'],
      adulterantsDetected: ['Liquid Paraffin (Mineral Oil)', 'Bleached Palm Kernel Oil', 'Refined Seed Oils', 'Low-Grade Solvents'],
      difficulty: 'Very Easy',
      estimatedDuration: '30 - 45 Minutes in Refrigerator',
      durationSeconds: 2700,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Small transparent glass or clear bowl', isHousehold: true },
        { name: 'Refrigerator (approx. 4°C - 10°C)', isHousehold: true },
      ],
      safetyWarning: 'Ensure the glass is dry. Ice crystals from freezer will cause false white spots.',
      steps: [
        {
          stepNumber: 1,
          title: 'Pour 30 mL Liquid Coconut Oil',
          instructions: 'Pour approximately 30 mL (2 tablespoons) of liquid coconut oil into a small transparent glass or clear bowl.',
        },
        {
          stepNumber: 2,
          title: 'Place in Refrigerator (30-45 Minutes)',
          instructions: 'Place the glass in your home refrigerator at 4°C to 10°C for 30 to 45 minutes.',
          timeSeconds: 2700,
          timerLabel: 'Coconut Freezing Timer',
        },
        {
          stepNumber: 3,
          title: 'Inspect Solidification Through the Glass',
          instructions: 'Take the glass out. Observe if the ENTIRE oil froze into a uniform rock-solid snow-white block, or if a clear liquid layer remains on top.',
        },
      ],
      pureObservation: {
        title: 'Freezes Completely into Uniform Snow-White Solid Block',
        description: 'Pure virgin coconut oil contains >50% medium-chain saturated lauric acid which solidifies completely at or below 24°C (75°F). In the refrigerator, it turns into a rock-solid, uniform snow-white block with zero liquid remaining.',
        visualBadge: '100% Solid Snow-White Block (≤24°C)',
        keyTraits: [
          '100% solid, rock-hard snow-white block from top to bottom.',
          'Zero liquid oil floating on top or trapped in pockets.',
          'Uniform crystalline texture with fresh sweet coconut fragrance.',
          'Smooth consistent white color without yellowish streaks.'
        ],
        scientificReason: 'Pure coconut oil consists of ~90% saturated fatty acids with an exceptionally sharp melting range (24°C–25°C). It freezes uniformly throughout.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Liquid Paraffin Layer Floating on Solidified Base',
        description: 'Adulterated coconut oil displays distinct stratified layers: the coconut fraction solidifies at the bottom while mineral oil (liquid paraffin) remains completely liquid on top.',
        visualBadge: 'Stratified Liquid Paraffin Layer',
        keyTraits: [
          'A clear, runny liquid oil layer floating on top while the bottom solidifies.',
          'Liquid paraffin has a freezing point of -15°C and NEVER freezes in a refrigerator.',
          'Yellowish, curdled, or uneven patchy texture indicating palm kernel oil blending.',
          'Greasy chemical liquid sheen when the glass is tilted.'
        ],
        scientificReason: 'Petroleum-derived liquid paraffin consists of branched alkanes that stay liquid down to -15°C, failing to crystallize alongside saturated coconut triglycerides.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Fractional melting point differentiation: Saturated lauric triglycerides (C12:0) crystallize rapidly at 24°C, whereas mineral hydrocarbons remain in mobile liquid phase down to -15°C.',
      fssaiRef: 'FSSAI DART Method #O-01: Detection of Mineral Oil in Coconut Oil by Refrigerator Test',
      simulatorOptions: [
        {
          id: 'opt_coco_freeze_pure',
          label: 'Freezes completely into a solid, uniform snow-white block',
          description: '100% rock-solid white mass throughout with zero liquid remaining.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Authentic virgin coconut oil with characteristic sharp 24°C lauric acid solidification.'
        },
        {
          id: 'opt_coco_freeze_paraffin',
          label: 'Clear liquid oil layer floating on top of solidified white base',
          description: 'Two distinct layers: liquid oil on top, solid fat below.',
          outcome: 'ADULTERATED',
          visualEffect: 'two_layers',
          explanation: 'Conclusive adulteration with Liquid Paraffin (mineral oil) which does not freeze at 4°C.'
        },
        {
          id: 'opt_coco_freeze_patches',
          label: 'Patchy yellowish semi-solid curds with oily pockets',
          description: 'Uneven mushy freezing with yellow discoloration.',
          outcome: 'SUSPECT',
          visualEffect: 'white_patches',
          explanation: 'Indicates dilution with cheap palm kernel oil or refined seed oils.'
        }
      ]
    },
    heating_test: {
      id: 'heating_test',
      title: 'Coconut Oil - Thermal Clarity & Sweet Fragrance Test',
      subtitle: 'Evaluates thermal resistance, water contamination, and synthetic essence against gentle skillet heat.',
      category: 'Thermal & Smoke',
      targetOils: ['Coconut Oil'],
      adulterantsDetected: ['Water / Moisture Contamination', 'Chemical Solvent Residues', 'Mineral Oil', 'Synthetic Essence'],
      difficulty: 'Easy',
      estimatedDuration: '2 Minutes',
      durationSeconds: 120,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean stainless steel pan', isHousehold: true },
        { name: 'Stove / low-medium flame', isHousehold: true },
      ],
      safetyWarning: 'Do not overheat virgin coconut oil beyond medium heat.',
      steps: [
        {
          stepNumber: 1,
          title: 'Clean Dry Pan Setup',
          instructions: 'Ensure the pan is completely dry.',
        },
        {
          stepNumber: 2,
          title: 'Add 1 Tablespoon Coconut Oil',
          instructions: 'Pour 15 mL of coconut oil into the pan on low-to-medium flame.',
        },
        {
          stepNumber: 3,
          title: 'Observe Melting, Crackling & Fragrance (60s)',
          instructions: 'Observe melting behavior. Note if crackling/splattering occurs or if pleasant toasted coconut fragrance releases.',
          timeSeconds: 60,
          timerLabel: 'Thermal Observation Timer',
        },
      ],
      pureObservation: {
        title: 'Melts Water-Clear, Sweet Toasted Coconut Fragrance, Zero Foam',
        description: 'Pure coconut oil melts quickly to a crystal water-clear liquid, releasing a gentle sweet toasted coconut fragrance with zero crackling or white foam.',
        visualBadge: 'Crystal Water-Clear Thermal Melt',
        keyTraits: [
          'Melts to completely transparent, water-clear liquid.',
          'Zero crackling or splattering sounds.',
          'Comforting, sweet natural roasted coconut aroma.',
          'Pan bottom stays clean with zero dark sludge.'
        ],
        scientificReason: 'Pure virgin coconut oil contains medium-chain triglycerides with negligible moisture and high oxidative stability.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Violent Crackling, Sputtering & Burnt Chemical Fumes',
        description: 'Adulterated coconut oil crackles loudly due to moisture, produces chemical fumes, or darkens prematurely with synthetic odor.',
        visualBadge: 'Sputtering Moisture & Solvent Fumes',
        keyTraits: [
          'Violent crackling and sputtering (high added water / emulsion).',
          'Chemical solvent, kerosene, or burnt rubber odor.',
          'Surface develops continuous white foam bubbles.',
          'Darkens to yellowish-brown rapidly at low heat.'
        ],
        scientificReason: 'Unrefined moisture causes steam explosions (crackling); residual hexane or light paraffin volatile fractions vaporize with acrid smoke.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Thermal phase stability of medium-chain saturated fats: minimal polyunsaturation prevents acrolein formation, while immiscible moisture triggers rapid explosive cavitation.',
      fssaiRef: 'FSSAI Rapid Moisture & Crackle Test for Coconut Oil',
      simulatorOptions: [
        {
          id: 'opt_coco_heat_pure',
          label: 'Melts water-clear with sweet coconut aroma; zero crackling or froth',
          description: 'Smooth, silent, crystal clear liquid with pleasant fragrance.',
          outcome: 'PURE',
          visualEffect: 'smooth_heating',
          explanation: 'Pass! Pure unadulterated coconut oil with clean thermal performance.'
        },
        {
          id: 'opt_coco_heat_crackle',
          label: 'Violent crackling, sputtering, and popping sounds',
          description: 'Oil splatters aggressively due to trapped water.',
          outcome: 'ADULTERATED',
          visualEffect: 'heavy_foam',
          explanation: 'High moisture or water emulsion adulteration detected.'
        },
        {
          id: 'opt_coco_heat_chemical',
          label: 'Chemical solvent smell or darkens rapidly with acrid fumes',
          description: 'Smells of kerosene or burning plastic at low heat.',
          outcome: 'ADULTERATED',
          visualEffect: 'acrid_smoke',
          explanation: 'Contaminated with petroleum paraffin or industrial solvent residues.'
        }
      ]
    },
    palm_touch_friction_test: {
      id: 'palm_touch_friction_test',
      title: 'Coconut Oil - Dermal Absorption & Paraffin Slick Test',
      subtitle: 'Pure coconut MCTs absorb rapidly into skin pores; petroleum mineral oil cannot absorb and leaves a slick suffocating barrier.',
      category: 'Sensory & Touch',
      targetOils: ['Virgin & Cold-Pressed Coconut Oil'],
      adulterantsDetected: ['Liquid Paraffin (Mineral Oil)', 'Synthetic Fragrance Masking', 'Refined Industrial Grease'],
      difficulty: 'Very Easy',
      estimatedDuration: '1 Minute',
      durationSeconds: 60,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean, dry hands', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Apply 3-4 Drops to Back of Hand',
          instructions: 'Place 3 to 4 drops of coconut oil onto the back of your hand or palm.',
        },
        {
          stepNumber: 2,
          title: 'Massage in Circular Motions for 30 Seconds',
          instructions: 'Massage gently into the skin for 30 seconds using fingertips.',
          timeSeconds: 30,
          timerLabel: 'Dermal Massage Timer',
        },
        {
          stepNumber: 3,
          title: 'Wait 1 Minute and Touch Skin',
          instructions: 'Wait 60 seconds. Touch the skin: check if it absorbed softly like a moisturizer, or if an impermeable greasy petroleum slick remains.',
        },
      ],
      pureObservation: {
        title: 'Absorbs Completely into Skin, Non-Greasy Velvety Sheen',
        description: 'Pure coconut oil contains small-molecule medium-chain triglycerides (MCTs) that absorb rapidly into human epidermis pores within 1–2 minutes, leaving skin soft and velvety with a mild sweet coconut fragrance.',
        visualBadge: 'Rapid Transdermal Absorption',
        keyTraits: [
          'Absorbs fully into skin pores within 1 to 2 minutes.',
          'Leaves skin soft, supple, and moisturized without sticky residue.',
          'Natural mild sweet coconut fragrance.',
          'Does not require soap to remove comfortable sheen.'
        ],
        scientificReason: 'Medium-chain fatty acids (lauric, myristic) have small molecular size and high biocompatibility with human skin sebum.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Persistent Oily Petroleum Film that Refuses to Absorb',
        description: 'Liquid paraffin (mineral oil) molecules are too large to penetrate human skin. It remains as an unnatural greasy, sticky, suffocating petroleum film that can only be removed with dish soap.',
        visualBadge: 'Impermeable Mineral Oil Slick',
        keyTraits: [
          'Remains wet, slippery, and greasy on skin surface indefinitely.',
          'Skin feels suffocated, cold, or coated in plastic wrap.',
          'Artificial candy-like perfume that vanishes into odorless machine oil.',
          'Requires harsh soap and warm water to strip off the greasy barrier.'
        ],
        scientificReason: 'Mineral hydrocarbons (C15–C40) are foreign non-biological alkanes that cannot penetrate or be metabolized by human epidermis.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Epidermal lipid penetration coefficient: Medium-chain lauric triglycerides partition into stratum corneum intercellular bilayers, whereas high molecular weight mineral alkanes form occlusive impermeable surface films.',
      fssaiRef: 'FSSAI Sensory Screening Protocol for Dermal Absorption in Edible Oils',
      simulatorOptions: [
        {
          id: 'opt_coco_aroma_pure',
          label: 'Soaks into skin within 2 minutes, leaving skin soft with clean coconut scent',
          description: 'Natural velvety feel, non-sticky, authentic fragrance.',
          outcome: 'PURE',
          visualEffect: 'pure_touch',
          explanation: 'Pass! Natural transdermal absorption of pure medium-chain coconut triglycerides.'
        },
        {
          id: 'opt_coco_aroma_slick',
          label: 'Remains greasy and wet on skin surface like baby oil or petroleum jelly',
          description: 'Suffocating slippery film that refuses to soak into skin.',
          outcome: 'ADULTERATED',
          visualEffect: 'greasy_mineral',
          explanation: 'Adulterated with Liquid Paraffin (mineral oil / white oil).'
        },
        {
          id: 'opt_coco_aroma_fake',
          label: 'Overpowering candy-like perfume that fades into chemical odor',
          description: 'Strong artificial fragrance masking stale oil base.',
          outcome: 'SUSPECT',
          visualEffect: 'foul_grease',
          explanation: 'Deodorized industrial oil masked with synthetic coconut essence.'
        }
      ]
    },
    paper_blot_test: OIL_TESTS.find(t => t.id === 'paper_blot_test')!,
    water_bubble_test: OIL_TESTS.find(t => t.id === 'water_bubble_test')!,
  },

  // 4. EXTRA VIRGIN OLIVE OIL (EVOO)
  olive_oil: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Extra Virgin Olive Oil - Refrigeration Cloudiness & Gel Test',
      subtitle: 'Tests high monounsaturated oleic acid concentration: Pure EVOO thickens into a soft cloudy gel at 4°C, while seed oils stay thin.',
      category: 'Freezing & Cooling',
      targetOils: ['Extra Virgin Olive Oil (EVOO)'],
      adulterantsDetected: ['Refined Seed Oils (Sunflower, Canola, Soybean)', 'Refined Olive Pomace Oil', 'Palm Olein'],
      difficulty: 'Very Easy',
      estimatedDuration: '24 - 48 Hours in Refrigerator (4°C)',
      durationSeconds: 86400,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Clean glass jar with tight lid', isHousehold: true },
        { name: 'Refrigerator (approx. 4°C)', isHousehold: true },
      ],
      safetyWarning: 'Ensure jar is tightly sealed to keep out refrigerator humidity.',
      steps: [
        {
          stepNumber: 1,
          title: 'Pour 30-50 mL EVOO into Glass Jar',
          instructions: 'Pour sample oil into a clean glass jar and seal tightly.',
        },
        {
          stepNumber: 2,
          title: 'Place in Refrigerator (24-48 Hours at 4°C)',
          instructions: 'Keep in the main refrigerator compartment (around 4°C) for 24 to 48 hours.',
          timeSeconds: 86400,
          timerLabel: 'Cold Gelation Timer',
        },
        {
          stepNumber: 3,
          title: 'Tilt and Inspect Viscosity & Gelation',
          instructions: 'Remove jar and tilt. Check if the oil became thick, cloudy, and gelatinous like soft butter, or if it stayed completely thin and liquid.',
        },
      ],
      pureObservation: {
        title: 'Thickens Uniformly into Cloudy Semi-Solid Butter/Gel',
        description: 'Pure EVOO is high in monounsaturated oleic acid (70–80%). At 4°C, natural waxes and long-chain fats slowly crystallize, turning the oil uniformly thick, viscous, and cloudy like soft butter or chilled honey throughout.',
        visualBadge: 'Uniform Cloudy Olive Gel at 4°C',
        keyTraits: [
          'Uniformly cloudy, opaque greenish-gold gel throughout.',
          'Thick viscous consistency that flows very sluggishly when tilted.',
          'Zero clear watery fluid floating on top or bottom.',
          'Returns to completely clear, golden-green liquid at room temperature.'
        ],
        scientificReason: 'Oleic acid triglycerides and natural olive fruit waxes have a crystallization range between 2°C and 6°C.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Remains Thin & Fluid or Precipitates Flaky Wax Crystals',
        description: 'If diluted with polyunsaturated seed oils (sunflower, canola, soybean), the oil stays completely thin and runny liquid at 4°C. If cut with palm oil, hard white wax clots precipitate at the bottom.',
        visualBadge: 'Thin Fluid Runny Liquid (Seed Oil Dilution)',
        keyTraits: [
          'Oil remains completely clear, thin, and free-flowing after 48 hours in fridge.',
          'Indicates adulteration with cheap seed oils (sunflower/soybean freeze below -15°C).',
          'Irregular hard white wax lumps at the bottom with liquid on top.',
          'Fails to thicken into a cohesive soft gel.'
        ],
        scientificReason: 'Polyunsaturated seed oils (linoleic acid) have very low freezing points (-16°C) and will not crystallize at refrigerator temperatures.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Fatty acid crystallization kinetics: cis-Monounsaturated oleate chains aggregate into soft semi-solid crystal lattices at 4°C, whereas polyunsaturated linoleate chains remain in disordered liquid state.',
      fssaiRef: 'International Olive Council (IOC) & FSSAI Guidelines for EVOO Cold Gelation',
      simulatorOptions: [
        {
          id: 'opt_olive_freeze_pure',
          label: 'Becomes thick, cloudy & viscous like soft butter / chilled honey',
          description: 'Uniform cloudy gelatinous consistency throughout.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Characteristic high oleic acid crystallization of authentic cold-pressed EVOO.'
        },
        {
          id: 'opt_olive_freeze_liquid',
          label: 'Remains completely thin, clear, and runny liquid after 48h',
          description: 'No thickening, flows as fast as room-temperature oil.',
          outcome: 'ADULTERATED',
          visualEffect: 'two_layers',
          explanation: 'Diluted with polyunsaturated seed oils (sunflower, soybean, or canola oil).'
        },
        {
          id: 'opt_olive_freeze_clumps',
          label: 'White flaky wax chunks settled at bottom with liquid top',
          description: 'Uneven white solids at bottom while top stays liquid.',
          outcome: 'ADULTERATED',
          visualEffect: 'white_patches',
          explanation: 'Adulterated with cheap palm olein or industrial pomace wax blends.'
        }
      ]
    },
    heating_test: {
      id: 'heating_test',
      title: 'Extra Virgin Olive Oil - Gentle Thermal Aroma & Smoke Test',
      subtitle: 'Evaluates fresh green grassy aroma and smoke stability against low-temperature heating.',
      category: 'Thermal & Smoke',
      targetOils: ['Extra Virgin Olive Oil'],
      adulterantsDetected: ['Refined Pomace / Canola Blend', 'Deodorized Rancid Lampante Oil', 'Industrial Chlorophyll'],
      difficulty: 'Easy',
      estimatedDuration: '2 Minutes',
      durationSeconds: 120,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Small clean pan', isHousehold: true },
        { name: 'Stove / low flame', isHousehold: true },
      ],
      safetyWarning: 'Do not scorch EVOO. Gentle low heat is sufficient to evaluate aroma.',
      steps: [
        {
          stepNumber: 1,
          title: 'Warm 1 Tablespoon EVOO on Low Heat',
          instructions: 'Pour 1 tablespoon into a clean pan on low flame (below 160°C).',
          timeSeconds: 60,
          timerLabel: 'Gentle Warming Timer',
        },
        {
          stepNumber: 2,
          title: 'Inhale Vapors & Check Surface Convection',
          instructions: 'Lean over slightly and inhale vapors. Inspect convection and smoke.',
        },
      ],
      pureObservation: {
        title: 'Fresh Green Cut-Grass, Tomato Leaf Aroma, Clean Convection',
        description: 'Authentic EVOO warms smoothly, releasing fresh botanical notes of cut grass, green tomato, and artichoke without acrid smoke.',
        visualBadge: 'Fresh Botanical Vapors',
        keyTraits: [
          'Releases fresh grassy, fruity, or herbal aroma.',
          'Zero early acrid smoke at low heat.',
          'Maintains rich golden-green sheen.',
          'No foam or chemical odor.'
        ],
        scientificReason: 'Cold-pressed virgin olive oil contains volatile C6 aldehyde and alcohol compounds (hexanal, trans-2-hexenal) that produce fresh herbal notes.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Acrid Smoke, Burnt Motor Oil, Cardboard Odor',
        description: 'Adulterated or chemically refined olive oil produces early acrid smoke, smells like stale crayons, cardboard, or rancid fryer fat.',
        visualBadge: 'Rancid Lampante / Solvent Fumes',
        keyTraits: [
          'Smells like crayons, stale nuts, cardboard, or burnt motor oil.',
          'Early smoke release at low temperature.',
          'Foaming or splattering at surface.',
          'Lacks all fresh green botanical aroma.'
        ],
        scientificReason: 'Oxidized lampante or solvent-extracted pomace contains high free fatty acids and secondary oxidation products.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Thermal volatility of lipoxygenase pathway volatile esters vs volatile peroxides from lipid auto-oxidation.',
      fssaiRef: 'IOC Organoleptic Assessment Standards for Extra Virgin Olive Oil',
      simulatorOptions: [
        {
          id: 'opt_olive_heat_pure',
          label: 'Gentle fresh green grassy aroma, smooth clean heating',
          description: 'Fruity botanical scent, zero premature smoke.',
          outcome: 'PURE',
          visualEffect: 'smooth_heating',
          explanation: 'Pass! Fresh botanical aroma of authentic unrefined Extra Virgin Olive Oil.'
        },
        {
          id: 'opt_olive_heat_rancid',
          label: 'Smells like stale cardboard, crayons, or rancid fryer grease',
          description: 'No fresh olive scent; flat and oxidized.',
          outcome: 'ADULTERATED',
          visualEffect: 'acrid_smoke',
          explanation: 'Deodorized low-grade lampante or oxidized old oil blend.'
        },
        {
          id: 'opt_olive_heat_smoke',
          label: 'Dense early smoke at low heat with solvent smell',
          description: 'Smokes prematurely with stinging chemical fumes.',
          outcome: 'ADULTERATED',
          visualEffect: 'heavy_foam',
          explanation: 'Adulterated with refined pomace or seed oil blends with lowered smoke points.'
        }
      ]
    },
    palm_touch_friction_test: {
      id: 'palm_touch_friction_test',
      title: 'Extra Virgin Olive Oil - Oleocanthal Cough & Aroma Test',
      subtitle: 'Tests fresh-cut grass aroma and the authentic antioxidant peppery cough catch at the back of the throat.',
      category: 'Sensory & Touch',
      targetOils: ['Extra Virgin Olive Oil'],
      adulterantsDetected: ['Refined Seed Oils', 'Pomace Blends', 'Industrial Chlorophyll Dye'],
      difficulty: 'Very Easy',
      estimatedDuration: '1 Minute',
      durationSeconds: 60,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Small shot glass or spoon', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Rub 2 Drops Between Palms to Warm',
          instructions: 'Warm 2 drops between palms, cup hands, and inhale botanical aroma.',
        },
        {
          stepNumber: 2,
          title: 'Take a Small Sip (1 mL) & Slurp with Air',
          instructions: 'Take a tiny sip (1 mL), coat mouth, draw in a little air (slurp), and swallow slowly.',
          timeSeconds: 30,
          timerLabel: 'Palate & Throat Evaluation',
        },
        {
          stepNumber: 3,
          title: 'Feel Throat for Peppery Sting (The Cough)',
          instructions: 'Notice the sensation at the back of the throat. Authentic EVOO produces a distinct peppery, spicy scratch or cough.',
        },
      ],
      pureObservation: {
        title: 'Fresh Grassy Aroma & Distinct Peppery Throat Cough Catch',
        description: 'Authentic EVOO smells of fresh-cut green grass and leaves. Swallowing produces a distinctive peppery, slightly bitter throat sting (the classic "two-cough" olive oil) caused by Oleocanthal antioxidants.',
        visualBadge: 'Oleocanthal Peppery Catch (The Cough)',
        keyTraits: [
          'Fresh aroma of cut grass, green herbs, and green tomato.',
          'Distinct peppery, spicy prickle / cough at back of throat.',
          'Pleasant mild bitter fruit finish.',
          'Absorbs cleanly on skin without sticky petroleum sheen.'
        ],
        scientificReason: 'Oleocanthal is a natural phenolic compound in EVOO that binds to TRPA1 ion channels in the oropharynx, triggering the same anti-inflammatory reflex as ibuprofen.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Bland, Greasy, Cardboard Odor with Zero Throat Catch',
        description: 'Fake or refined olive oil smells flat, feels greasy in the mouth, and has zero peppery kick in the throat. Seed oil blends feel completely smooth and bland.',
        visualBadge: 'Bland & Greasy (Zero Oleocanthal)',
        keyTraits: [
          'Completely bland and smooth in the throat with zero peppery kick.',
          'Smells flat, greasy, or like cardboard / rancid nuts.',
          'Feels heavy and oily on the palate.',
          'Leaves green dye on hands or tongue (artificial chlorophyll).'
        ],
        scientificReason: 'Refining processes strip away 100% of natural phenolic antioxidants (oleocanthal, hydroxytyrosol), leaving an inert neutral lipid.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Pharmacological TRPA1 receptor activation: Oleocanthal selectively activates oropharyngeal sensory neurons, confirming high polyphenol antioxidant presence.',
      fssaiRef: 'IOC Standard Sensory Protocol for Extra Virgin Olive Oil Verification',
      simulatorOptions: [
        {
          id: 'opt_olive_aroma_pure',
          label: 'Fresh grassy aroma with distinctive peppery throat sting / cough',
          description: 'Spicy pepper prickle at back of throat confirming rich antioxidants.',
          outcome: 'PURE',
          visualEffect: 'pure_touch',
          explanation: 'Pass! Definitive hallmark of authentic, unadulterated high-polyphenol Extra Virgin Olive Oil.'
        },
        {
          id: 'opt_olive_aroma_bland',
          label: 'Smooth, greasy, and completely bland with zero throat catch',
          description: 'No peppery feeling at all; flat and oily mouthfeel.',
          outcome: 'ADULTERATED',
          visualEffect: 'greasy_mineral',
          explanation: 'Diluted with refined seed oils (canola/sunflower) or solvent-extracted pomace oil.'
        },
        {
          id: 'opt_olive_aroma_rancid',
          label: 'Smells like stale crayons, putty, or motor oil',
          description: 'Rancid oxidized smell with unpleasant greasy film.',
          outcome: 'ADULTERATED',
          visualEffect: 'foul_grease',
          explanation: 'Oxidized low-grade lampante oil unfit for human consumption.'
        }
      ]
    },
    paper_blot_test: OIL_TESTS.find(t => t.id === 'paper_blot_test')!,
    water_bubble_test: OIL_TESTS.find(t => t.id === 'water_bubble_test')!,
  },

  // 5. GROUNDNUT / PEANUT OIL (MOONGFALI)
  groundnut_oil: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Groundnut Oil - Cold Sluggishness & Separation Test',
      subtitle: 'Verifies natural groundnut fatty acid thickening against mineral oil and cottonseed oil dilution.',
      category: 'Freezing & Cooling',
      targetOils: ['Groundnut / Peanut Oil'],
      adulterantsDetected: ['Mineral Oil / Liquid Paraffin', 'Cottonseed Oil (Gossypol Hazard)', 'Palm Olein'],
      difficulty: 'Very Easy',
      estimatedDuration: '2 - 3 Hours in Refrigerator',
      durationSeconds: 7200,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Transparent glass tumbler', isHousehold: true },
        { name: 'Refrigerator (4°C)', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Pour 30 mL Groundnut Oil',
          instructions: 'Pour sample into clean dry glass.',
        },
        {
          stepNumber: 2,
          title: 'Refrigerate at 4°C for 2-3 Hours',
          instructions: 'Keep in refrigerator chiller section for 2 to 3 hours.',
          timeSeconds: 7200,
          timerLabel: 'Cold Settling Timer',
        },
        {
          stepNumber: 3,
          title: 'Inspect Consistency and Layer Separation',
          instructions: 'Tilt glass. Pure groundnut oil becomes sluggish and uniformly cloudy. Adulterated shows sharp two-layer split.',
        },
      ],
      pureObservation: {
        title: 'Uniformly Thick & Sluggish, Zero Hard Stratified Split',
        description: 'Pure groundnut oil solidifies around 0°C to 3°C. In the refrigerator, it turns uniformly thick, cloudy, and viscous throughout without dividing into hard waxy layers.',
        visualBadge: 'Uniform Cold Viscosity',
        keyTraits: [
          'Thickens uniformly with sluggish flow.',
          'Even cloudy golden color throughout.',
          'Zero clear liquid paraffin layer floating on top.',
          'No hard white waxy curd lumps.'
        ],
        scientificReason: 'Balanced oleic and linoleic triglycerides with small amounts of long-chain saturated arachidic/behenic acids produce uniform high viscosity upon cooling.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Sharp Layer Separation & Dense White Sludge',
        description: 'Liquid paraffin remains completely clear on top, while cottonseed or palm fractions form dense white sludge at the bottom.',
        visualBadge: 'Stratified Layer Separation',
        keyTraits: [
          'Distinct two-layer separation.',
          'Liquid oil floating over dense white sediment.',
          'Loss of uniform golden clarity.',
          'Curdled floating patches.'
        ],
        scientificReason: 'Immiscible alkane fractions and divergent crystallization points create phase separation.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Triacylglycerol crystallization temperature divergence across mixed lipid systems.',
      fssaiRef: 'FSSAI Rapid Screening for Groundnut Oil Purity',
      simulatorOptions: [
        {
          id: 'opt_peanut_freeze_pure',
          label: 'Uniformly thick, sluggish & slightly cloudy throughout',
          description: 'Consistent viscous texture without separate layers.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Normal cold viscosity response of pure groundnut oil.'
        },
        {
          id: 'opt_peanut_freeze_split',
          label: 'Clear liquid floating on top of thick white sediment',
          description: 'Two sharply divided layers in the glass.',
          outcome: 'ADULTERATED',
          visualEffect: 'two_layers',
          explanation: 'Adulterated with liquid paraffin or heavy palm fractions.'
        }
      ]
    },
    heating_test: OIL_TESTS.find(t => t.id === 'heating_test')!,
    palm_touch_friction_test: OIL_TESTS.find(t => t.id === 'palm_touch_friction_test')!,
    paper_blot_test: OIL_TESTS.find(t => t.id === 'paper_blot_test')!,
    water_bubble_test: OIL_TESTS.find(t => t.id === 'water_bubble_test')!,
  },

  // 6. SESAME OIL (TIL / GINGELLY)
  sesame_oil: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Sesame (Til) Oil - Cold Fluidity & Palm Olein Test',
      subtitle: 'Verifies whether Sesame Oil stays clear liquid or solidifies due to cheap palm oil / tallow blending.',
      category: 'Freezing & Cooling',
      targetOils: ['Sesame / Gingelly (Til) Oil'],
      adulterantsDetected: ['Cheap Palm Olein Blend', 'Vanaspati / Hydrogenated Fat', 'Mineral Oil'],
      difficulty: 'Very Easy',
      estimatedDuration: '2 Hours in Refrigerator',
      durationSeconds: 7200,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Transparent glass tumbler', isHousehold: true },
        { name: 'Refrigerator (4°C)', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Pour 30 mL Sesame Oil',
          instructions: 'Pour sample into clean glass.',
        },
        {
          stepNumber: 2,
          title: 'Refrigerate for 2 Hours (4°C)',
          instructions: 'Place in refrigerator for 2 hours.',
          timeSeconds: 7200,
          timerLabel: 'Cold Refrigeration Timer',
        },
        {
          stepNumber: 3,
          title: 'Inspect for Cloudiness or White Solidification',
          instructions: 'Pure sesame oil freezes at -3°C to -6°C, remaining clear liquid at 4°C. Any solid sediment indicates palm oil.',
        },
      ],
      pureObservation: {
        title: 'Remains Completely Liquid, Clear Amber & Aromatic',
        description: 'Pure sesame oil has a freezing point of -3°C to -6°C. In a normal refrigerator (4°C–10°C), it remains completely liquid, clear, and fluid.',
        visualBadge: 'Clear Amber Fluidity at 4°C',
        keyTraits: [
          'Remains 100% liquid and clear golden-amber.',
          'Zero white sediment or solid crystals at bottom.',
          'Retains authentic nutty aroma.',
          'No layer separation.'
        ],
        scientificReason: 'High content of polyunsaturated linoleic and monounsaturated oleic acids keeps crystallization point below sub-zero temperatures.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Clouds Heavily, Forms Solid Bottom Layer',
        description: 'Adulterated sesame oil solidifies into white cloudy masses due to cheap palm oil or hydrogenated vegetable fat.',
        visualBadge: 'White Palm Olein Solidification',
        keyTraits: [
          'White sediment or solid clump at bottom.',
          'Loss of clear amber transparency into cloudy haze.',
          'Liquid separation on top.',
          'Indicates palm olein blending.'
        ],
        scientificReason: 'Palm oil fractions freeze at 10°C–18°C, solidifying out of cold liquid sesame oil.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Fractional lipid crystallization of high-melting saturated palmitate vs low-melting linoleate.',
      fssaiRef: 'FSSAI Rapid Cold Screening for Sesame Oil Purity',
      simulatorOptions: [
        {
          id: 'opt_sesame_freeze_pure',
          label: 'Remains completely liquid, clear & golden amber throughout',
          description: 'No cloudiness, no solid sediment at 4°C.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Pure sesame oil stays completely fluid at refrigerator temperatures.'
        },
        {
          id: 'opt_sesame_freeze_palm',
          label: 'White cloudy sediment / solidified bottom layer',
          description: 'White solid mass forms in the chilled sample.',
          outcome: 'ADULTERATED',
          visualEffect: 'white_patches',
          explanation: 'Adulterated with cheap palm olein or hydrogenated fat.'
        }
      ]
    },
    heating_test: {
      id: 'heating_test',
      title: 'Sesame Oil - Aroma Persistence & Thermal Stability Test',
      subtitle: 'Tests authentic sesamol aroma against volatile synthetic sesame essence added to cheap base oil.',
      category: 'Thermal & Smoke',
      targetOils: ['Sesame Oil (Til)'],
      adulterantsDetected: ['Synthetic Sesame Essence + Palm Oil', 'Reused Cooking Oil', 'Cottonseed Oil'],
      difficulty: 'Easy',
      estimatedDuration: '2 Minutes',
      durationSeconds: 120,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Small clean pan', isHousehold: true },
        { name: 'Stove / flame', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Heat 15 mL Sesame Oil Gently',
          instructions: 'Heat 15 mL of sesame oil in a small pan over medium flame.',
          timeSeconds: 60,
          timerLabel: 'Heat Observation Timer',
        },
        {
          stepNumber: 2,
          title: 'Observe Aroma Evolution',
          instructions: 'Inhale aroma as heat builds: pure toasted aroma intensifies; artificial essence disappears in 15 seconds leaving neutral grease smell.',
        },
      ],
      pureObservation: {
        title: 'Deep Toasted Nutty Aroma Intensifies and Lingers',
        description: 'Pure sesame oil contains natural sesamol and sesamolin antioxidants. Heating intensifies its deep toasted nutty fragrance without foaming.',
        visualBadge: 'Deep Sesamol Nutty Aroma',
        keyTraits: [
          'Rich toasted nutty fragrance that deepens with heat.',
          'Zero white foam or violent sputtering.',
          'Clean golden sheen.',
          'High thermal stability.'
        ],
        scientificReason: 'Natural lignans (sesamol, sesamolin) provide exceptional oxidative resistance and heat-stable aroma.',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Aroma Vanishes in 15s Leaving Stale Greasy Odor',
        description: 'Adulterated sesame oil (palm oil + artificial perfume) loses its scent in 15 seconds, leaving a flat, greasy, or burnt palm oil smell.',
        visualBadge: 'Synthetic Fragrance Evaporation',
        keyTraits: [
          'Nutty smell disappears quickly once heated.',
          'Replaced by bland, greasy, or burnt chemical smell.',
          'Heavy foaming on the surface.',
          'Indicates artificial fragrance masking cheap neutral oil.'
        ],
        scientificReason: 'Synthetic flavor esters have low boiling points and flash off immediately upon heating.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Thermal volatilization of low molecular weight synthetic essence vs endogenous lignin-bound aroma molecules.',
      fssaiRef: 'FSSAI Sensory Evaluation of Gingelly Oil',
      simulatorOptions: [
        {
          id: 'opt_sesame_heat_pure',
          label: 'Rich toasted nutty aroma deepens and persists steadily',
          description: 'Aroma intensifies comfortably without foaming.',
          outcome: 'PURE',
          visualEffect: 'smooth_heating',
          explanation: 'Pass! Genuine sesame oil with natural sesamol thermal stability.'
        },
        {
          id: 'opt_sesame_heat_fade',
          label: 'Aroma disappears within 15 seconds, leaving greasy neutral smell',
          description: 'Fragrance boils off leaving cheap cooking oil odor.',
          outcome: 'ADULTERATED',
          visualEffect: 'heavy_foam',
          explanation: 'Adulterated with cheap palm oil treated with artificial synthetic sesame essence.'
        }
      ]
    },
    palm_touch_friction_test: OIL_TESTS.find(t => t.id === 'palm_touch_friction_test')!,
    paper_blot_test: OIL_TESTS.find(t => t.id === 'paper_blot_test')!,
    water_bubble_test: OIL_TESTS.find(t => t.id === 'water_bubble_test')!,
  },

  // 7. SUNFLOWER / REFINED BLEND
  sunflower_oil: {
    freezing_test: {
      id: 'freezing_test',
      title: 'Sunflower Oil - Cold Clarity & Winterization Test',
      subtitle: 'Detects cheap palm olein blending: pure sunflower oil never solidifies at refrigerator temperatures.',
      category: 'Freezing & Cooling',
      targetOils: ['Sunflower & Refined Cooking Oil'],
      adulterantsDetected: ['Palm Olein', 'Palm Stearin', 'Animal Tallow / Industrial Wax'],
      difficulty: 'Very Easy',
      estimatedDuration: '2 Hours in Refrigerator',
      durationSeconds: 7200,
      is100PercentHousehold: true,
      requiredTools: [
        { name: 'Transparent glass tumbler', isHousehold: true },
        { name: 'Refrigerator (4°C)', isHousehold: true },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Pour 30 mL Sunflower Oil',
          instructions: 'Pour sample into clean dry glass.',
        },
        {
          stepNumber: 2,
          title: 'Place in Refrigerator for 2 Hours (4°C)',
          instructions: 'Keep in refrigerator for 2 hours.',
          timeSeconds: 7200,
          timerLabel: 'Cold Clarity Timer',
        },
        {
          stepNumber: 3,
          title: 'Inspect Clarity and Viscosity',
          instructions: 'Observe against light. Pure sunflower oil freezes at -17°C and remains 100% crystal clear and liquid at 4°C.',
        },
      ],
      pureObservation: {
        title: 'Remains 100% Crystal Clear, Liquid & Fluid',
        description: 'Pure winterized sunflower oil has an extremely low freezing point (-17°C). In the refrigerator (4°C), it remains 100% crystal clear and thin liquid.',
        visualBadge: 'Crystal Clear Fluidity (-17°C)',
        keyTraits: [
          '100% transparent, light golden, and liquid.',
          'Zero cloudiness, zero white wax haze, zero crystals.',
          'Flows freely like water.',
          'Zero layer separation.'
        ],
        scientificReason: 'Sunflower oil is high in polyunsaturated linoleic acid with extremely low melting point (-17°C).',
        dangerLevel: 'Safe'
      },
      adulteratedObservation: {
        title: 'Cloudy White Haze, Sediment & Crystal Precipitation',
        description: 'Cheap palm olein freezes at 10°C–18°C. When blended into sunflower oil, chilling creates a dense cloudy white haze or solid bottom layer.',
        visualBadge: 'Cloudy Palm Olein Haze',
        keyTraits: [
          'Cloudy white haze or snowflake crystals throughout.',
          'Solid white sediment settling at the bottom.',
          'Loss of transparency.',
          'Sluggish or semi-solid flow.'
        ],
        scientificReason: 'Saturated palmitic triglycerides in palm olein precipitate out into opaque crystal matrices upon cooling.',
        dangerLevel: 'High Risk'
      },
      scientificMechanism: 'Fractional winterization crystallization: Pure polyunsaturated lipids resist nucleation at 4°C, whereas saturated palm adulterants rapidly nucleate.',
      fssaiRef: 'FSSAI Rapid Winterization Protocol for Refined Sunflower Oil',
      simulatorOptions: [
        {
          id: 'opt_sun_freeze_pure',
          label: 'Remains 100% crystal clear, liquid & fluid without any cloudiness',
          description: 'Completely clear golden liquid at 4°C.',
          outcome: 'PURE',
          visualEffect: 'uniform_solid',
          explanation: 'Pass! Pure winterized sunflower oil does not crystallize at refrigerator temperatures.'
        },
        {
          id: 'opt_sun_freeze_haze',
          label: 'Cloudy white haze, crystals, or solid sediment at bottom',
          description: 'White cloudy suspension or solid sediment in chilled sample.',
          outcome: 'ADULTERATED',
          visualEffect: 'white_patches',
          explanation: 'Adulterated with cheap Palm Olein or Palm Stearin blends.'
        }
      ]
    },
    heating_test: OIL_TESTS.find(t => t.id === 'heating_test')!,
    palm_touch_friction_test: OIL_TESTS.find(t => t.id === 'palm_touch_friction_test')!,
    paper_blot_test: OIL_TESTS.find(t => t.id === 'paper_blot_test')!,
    water_bubble_test: OIL_TESTS.find(t => t.id === 'water_bubble_test')!,
  }
};

// Retrieve the oil-tailored test data
export function getOilSpecificTest(oilKeyOrName: string, testId: string): OilTest {
  const normKey = normalizeOilKey(oilKeyOrName);
  const oilTests = OIL_SPECIFIC_TESTS[normKey];
  if (oilTests && oilTests[testId]) {
    return oilTests[testId];
  }
  // Fallback to generic OIL_TESTS list
  return OIL_TESTS.find((t) => t.id === testId) || OIL_TESTS[0];
}

// Retrieve the available test suite specifically for a chosen oil
export function getAvailableTestsForOil(oilKeyOrName: string): OilTest[] {
  const normKey = normalizeOilKey(oilKeyOrName);
  const oilTestsMap = OIL_SPECIFIC_TESTS[normKey];
  if (oilTestsMap) {
    return Object.values(oilTestsMap);
  }
  return OIL_TESTS;
}
