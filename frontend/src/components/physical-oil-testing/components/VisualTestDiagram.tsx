import React from 'react';
import { motion } from 'framer-motion';

interface VisualTestDiagramProps {
  testId: string;
  state: 'pure' | 'adulterated' | 'neutral' | 'in_progress';
  animated?: boolean;
  oilId?: string;
}

export const VisualTestDiagram: React.FC<VisualTestDiagramProps> = ({
  testId,
  state,
  animated = true,
  oilId = 'mustard_oil',
}) => {
  const normOil = (oilId || '').toLowerCase();
  const isMustard = normOil.includes('mustard') || normOil.includes('sarson');
  const isGhee = normOil.includes('ghee') || normOil.includes('butter');
  const isCoconut = normOil.includes('coconut') || normOil.includes('nariyal');
  const isOlive = normOil.includes('olive') || normOil.includes('jaitun');
  const isSesame = normOil.includes('sesame') || normOil.includes('til');
  const isSunflower = normOil.includes('sunflower') || normOil.includes('blend');

  switch (testId) {
    case 'freezing_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-32 h-36 border-2 border-slate-400 rounded-b-2xl rounded-t-sm flex flex-col justify-end overflow-hidden shadow-inner bg-white">
            {/* Glass Container Rim */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-300 rounded-t-sm"></div>

            {state === 'pure' ? (
              // Pure state depending on oil type
              isMustard || isSesame || isSunflower ? (
                // Mustard/Sesame/Sunflower remain 100% CLEAR LIQUID at 4°C!
                <motion.div
                  initial={animated ? { opacity: 0 } : {}}
                  animate={{ opacity: 1 }}
                  className="w-full h-28 bg-gradient-to-t from-amber-500/80 via-amber-400/90 to-yellow-300/70 flex flex-col items-center justify-center p-2 relative shadow-inner"
                >
                  <span className="relative z-10 text-[9px] font-black text-amber-950 text-center uppercase tracking-wide leading-tight">
                    REMAINS 100% CLEAR LIQUID
                  </span>
                  <span className="relative z-10 text-[8px] font-bold text-amber-900 mt-1 bg-amber-100/90 px-1.5 py-0.5 rounded shadow-2xs">
                    Freezes at -10°C (Stays Fluid)
                  </span>
                </motion.div>
              ) : isCoconut ? (
                // Coconut freezes solid snow-white at <=24°C
                <motion.div
                  initial={animated ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full h-28 bg-gradient-to-t from-slate-100 via-white to-slate-50 flex flex-col items-center justify-center p-2 relative shadow-sm border border-slate-200"
                >
                  <span className="relative z-10 text-[9px] font-black text-slate-900 tracking-wider text-center uppercase">
                    SOLID SNOW-WHITE BLOCK
                  </span>
                  <span className="relative z-10 text-[7px] text-slate-600 font-bold mt-1 bg-slate-200 px-1 py-0.5 rounded">
                    100% Solid at ≤24°C
                  </span>
                </motion.div>
              ) : isOlive ? (
                // Olive turns cloudy thick gel at 4°C
                <motion.div
                  initial={animated ? { opacity: 0 } : {}}
                  animate={{ opacity: 1 }}
                  className="w-full h-28 bg-gradient-to-t from-lime-600/70 via-emerald-500/60 to-yellow-400/60 flex flex-col items-center justify-center p-2 relative"
                >
                  <span className="relative z-10 text-[9px] font-black text-lime-950 tracking-wide text-center uppercase">
                    THICK CLOUDY OLIVE GEL
                  </span>
                  <span className="relative z-10 text-[7px] text-lime-900 font-bold mt-1 bg-lime-100 px-1 py-0.5 rounded">
                    Oleic Acid Gelation (4°C)
                  </span>
                </motion.div>
              ) : isGhee ? (
                // Ghee solidifies into granular matrix
                <motion.div
                  initial={animated ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full h-28 bg-gradient-to-t from-amber-200 to-amber-100 flex flex-col items-center justify-center p-2 relative"
                >
                  <span className="relative z-10 text-[9px] font-black text-amber-950 text-center uppercase">
                    DANEDAR GRANULAR BLOCK
                  </span>
                  <div className="flex gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-28 bg-amber-200 flex items-center justify-center p-2">
                  <span className="text-[9px] font-black text-amber-950">UNIFORM PHASE</span>
                </div>
              )
            ) : state === 'adulterated' ? (
              // Adulterated phase separation
              isMustard || isSesame || isSunflower ? (
                // Mustard/Sesame adulterated: White cloudy palm sediment settled at bottom
                <div className="w-full h-28 flex flex-col">
                  <div className="w-full h-12 bg-amber-300/80 flex items-center justify-center border-b border-amber-400">
                    <span className="text-[7px] font-bold text-amber-950 px-1 py-0.5 bg-amber-100 rounded">
                      Upper Liquid Phase
                    </span>
                  </div>
                  <motion.div
                    initial={animated ? { height: 0 } : {}}
                    animate={{ height: '4rem' }}
                    className="w-full bg-stone-100 flex flex-col items-center justify-center p-1 border-t border-stone-300"
                  >
                    <span className="text-[8px] font-black text-red-900 bg-red-100 px-1 py-0.5 rounded text-center">
                      PALM OIL SEDIMENT
                    </span>
                    <span className="text-[6px] text-stone-600 font-bold mt-0.5">Freezes at 10°C - 20°C</span>
                  </motion.div>
                </div>
              ) : isCoconut ? (
                // Coconut adulterated: Liquid paraffin floating over solid white
                <div className="w-full h-28 flex flex-col">
                  <motion.div
                    initial={animated ? { height: 0 } : {}}
                    animate={{ height: '40%' }}
                    className="w-full bg-amber-200/90 relative flex items-center justify-center border-b border-amber-400"
                  >
                    <span className="text-[7px] font-black text-red-900 px-1 py-0.5 bg-red-100 rounded">
                      Liquid Paraffin (Unfrozen)
                    </span>
                  </motion.div>
                  <div className="w-full h-[60%] bg-stone-100 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-stone-700">Frozen Coconut Base</span>
                  </div>
                </div>
              ) : isOlive ? (
                // Olive adulterated: Thin runny fluid without gelation
                <div className="w-full h-28 bg-yellow-200/80 flex flex-col items-center justify-center p-2 border border-dashed border-red-400">
                  <span className="text-[8px] font-black text-red-900 bg-red-100 px-1.5 py-0.5 rounded text-center">
                    REMAINS THIN & RUNNY
                  </span>
                  <span className="text-[7px] text-stone-600 font-bold mt-1">Seed Oil Blend (Freezes &lt; -15°C)</span>
                </div>
              ) : (
                // Ghee adulterated: Stratified layers
                <div className="w-full h-28 flex flex-col">
                  <div className="w-full h-12 bg-amber-300 flex items-center justify-center border-b border-amber-400">
                    <span className="text-[7px] font-bold text-amber-950">Liquid Vegetable Oil</span>
                  </div>
                  <div className="w-full h-16 bg-stone-200 flex items-center justify-center">
                    <span className="text-[8px] font-black text-red-900">Waxy Vanaspati Crust</span>
                  </div>
                </div>
              )
            ) : (
              // Neutral room temp liquid
              <div className="w-full h-24 bg-gradient-to-t from-amber-400 to-amber-300 flex items-center justify-center">
                <span className="text-[9px] font-bold text-amber-950">Sample (Chilling 4°C)</span>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 text-[10px] font-mono text-cyan-800 flex items-center gap-1 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 font-bold">
            <span>❄️ 4°C Chill Test</span>
          </div>
        </div>
      );

    case 'heating_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 border border-slate-300">
          <div className="relative w-44 h-24 bg-gradient-to-b from-stone-600 to-stone-800 rounded-b-3xl rounded-t-lg border-2 border-stone-500 flex items-center justify-center p-2 shadow-md">
            <div className="absolute -right-8 top-8 w-9 h-3 bg-stone-700 rounded-r-md border border-stone-600"></div>

            {state === 'pure' ? (
              isGhee ? (
                // Ghee pure: Turns dark reddish-brown within 5 seconds!
                <div className="w-36 h-16 bg-gradient-to-r from-amber-800 to-amber-950 rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden border border-amber-600">
                  <span className="relative z-10 text-[9px] font-black text-amber-100 tracking-wide">
                    DARK REDDISH-BROWN (&lt;5s)
                  </span>
                  <span className="relative z-10 text-[7px] text-amber-200 font-bold">Caramelized Milk Solids</span>
                </div>
              ) : (
                // Mustard/Oil pure: Smooth convection, high smoke point
                <div className="w-36 h-16 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden border border-amber-400">
                  <motion.div
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/40 to-transparent"
                  ></motion.div>
                  <span className="relative z-10 text-[9px] font-black text-amber-950 tracking-wide uppercase">
                    SMOOTH CONVECTION
                  </span>
                  <span className="relative z-10 text-[7px] text-amber-900 font-bold">
                    {isMustard ? 'Eye-Watering Pungent Vapors' : 'Clean Aroma & High Smoke Point'}
                  </span>
                </div>
              )
            ) : state === 'adulterated' ? (
              isGhee ? (
                // Ghee adulterated: Takes long to melt, stays pale yellow with spattering bubbles
                <div className="w-36 h-16 bg-yellow-100 rounded-full flex flex-col items-center justify-center relative shadow-inner border border-yellow-300">
                  <span className="text-[8px] font-black text-amber-900">STAYS PALE YELLOW</span>
                  <span className="text-[6px] text-red-700 font-bold">Non-Browning Vanaspati / Tallow</span>
                </div>
              ) : (
                // Adulterated: Heavy foam bubbles & black sludge
                <div className="w-36 h-16 bg-amber-900 rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden border border-stone-900">
                  <div className="absolute bottom-0 inset-x-0 h-4 bg-stone-950 rounded-b-full"></div>
                  <div className="absolute inset-x-1 top-1 flex flex-wrap justify-center gap-1">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [0.8, 1.2, 0.9] }}
                        transition={{ repeat: Infinity, duration: 1 + (i % 3) * 0.4 }}
                        className="w-3 h-3 rounded-full bg-white shadow-xs border border-stone-300"
                      ></motion.div>
                    ))}
                  </div>
                  <span className="relative z-10 text-[8px] font-black text-red-100 bg-red-900 px-1.5 py-0.5 rounded mt-3">
                    Dense White Foam & Black Tar
                  </span>
                </div>
              )
            ) : (
              <div className="w-36 h-16 bg-amber-400 rounded-full flex items-center justify-center border border-amber-500">
                <span className="text-[9px] font-bold text-amber-950">Thermal Heat Test</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs">🔥</span>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {isGhee ? 'Direct Flame (5-10s)' : 'Thermal Heat Test (180°C)'}
            </span>
          </div>
        </div>
      );

    case 'palm_touch_friction_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-48 h-32 bg-white rounded-2xl shadow-md p-3 flex flex-col items-center justify-center border border-slate-200">
            <span className="absolute top-1.5 left-2.5 text-[8px] font-mono font-bold text-slate-400 uppercase">
              PALM FRICTION & AROMA
            </span>

            {state === 'pure' ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center mb-1 shadow-xs">
                  <span className="text-xl">✨</span>
                </div>
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  {isGhee ? 'MELTS IN 5s (<37°C BODY HEAT)' : 'RAPID TRANSDERMAL ABSORPTION'}
                </span>
                <span className="text-[8px] text-slate-600 font-bold mt-1">
                  {isMustard ? 'Sharp Nose-Clearing Pungency' : 'Natural Authentic Nutty / Herbal Aroma'}
                </span>
              </div>
            ) : state === 'adulterated' ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-rose-400 flex items-center justify-center mb-1 shadow-xs">
                  <span className="text-xl">⚠️</span>
                </div>
                <span className="text-[8px] font-black text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  {isMustard ? 'METANIL YELLOW DYE STAIN ON SKIN' : 'IMPERMEABLE MINERAL OIL SLICK'}
                </span>
                <span className="text-[8px] text-slate-600 font-bold mt-1">
                  {isGhee ? 'Does Not Melt (Dalda / Tallow >40°C)' : 'Refuses to Absorb into Skin'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center mb-1">
                  <span className="text-base">✋</span>
                </div>
                <span className="text-[9px] font-bold text-slate-700">Rub palms for 15s</span>
              </div>
            )}
          </div>
        </div>
      );

    case 'paper_blot_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-44 h-32 bg-white rounded-lg shadow-md p-3 flex items-center justify-center border border-stone-300">
            <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-stone-400">WHITE BLOTTER</span>

            {state === 'pure' ? (
              <motion.div
                initial={animated ? { scale: 0.6 } : {}}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex flex-col items-center justify-center shadow-inner"
              >
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-amber-300"></div>
                </div>
                <span className="text-[7px] font-black text-amber-950 mt-0.5">CLEAN SPOT</span>
              </motion.div>
            ) : state === 'adulterated' ? (
              <motion.div
                initial={animated ? { scale: 0.7 } : {}}
                animate={{ scale: 1 }}
                className="relative w-24 h-24 rounded-full bg-rose-50 border-2 border-dashed border-rose-400 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 border border-red-400 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  </div>
                </div>
                <span className="absolute -bottom-1 text-[7px] font-black text-red-700 bg-white px-1.5 py-0.2 rounded border border-red-200 shadow-xs">
                  {isMustard ? 'METANIL DYE FRINGE' : 'RAPID HALO RING'}
                </span>
              </motion.div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300"></div>
            )}
          </div>
        </div>
      );

    case 'water_bubble_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-44 h-32 bg-sky-50 border-2 border-sky-300 rounded-b-3xl rounded-t-lg flex flex-col justify-end p-2 overflow-hidden shadow-inner">
            <div className="absolute top-6 inset-x-0 h-1 bg-sky-400"></div>
            <div className="absolute top-7 inset-x-0 bottom-0 bg-sky-100/60 backdrop-blur-xs"></div>

            {state === 'pure' ? (
              <div className="relative z-10 w-full h-20 flex flex-col items-center justify-start">
                <motion.div
                  initial={animated ? { y: -10 } : {}}
                  animate={{ y: 0 }}
                  className="w-12 h-6 rounded-full bg-amber-400 border-2 border-amber-500 shadow-md flex items-center justify-center -mt-2"
                >
                  <div className="w-4 h-2 rounded-full bg-white/70"></div>
                </motion.div>
                <span className="text-[8px] font-bold text-amber-950 mt-3 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded">
                  SINGLE COHESIVE LENS
                </span>
                <span className="text-[8px] text-sky-800 font-medium">Water remains crystal clear</span>
              </div>
            ) : state === 'adulterated' ? (
              <div className="relative z-10 w-full h-20 flex flex-col items-center justify-center">
                <div className="flex gap-2 -mt-3">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                      className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600 shadow-xs"
                    ></motion.div>
                  ))}
                </div>
                <div className="w-28 h-6 bg-slate-300/80 rounded-full blur-xs mt-1"></div>
                <span className="text-[8px] font-bold text-red-900 mt-1 px-1.5 py-0.5 bg-red-100 border border-red-300 rounded">
                  Shattered Beads & Milky Cloud
                </span>
              </div>
            ) : (
              <div className="relative z-10 w-full h-20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-sky-800">Water Surface</span>
              </div>
            )}
          </div>
        </div>
      );

    case 'yellow_mustard_dye_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-16 h-36 border-2 border-slate-400 rounded-b-full rounded-t-sm flex flex-col justify-end overflow-hidden shadow-md bg-white">
            <div className="w-full h-16 bg-amber-400 flex items-center justify-center border-b border-amber-500">
              <span className="text-[7px] font-extrabold text-amber-950 text-center leading-tight">
                Upper Oil Phase (5mL)
              </span>
            </div>

            {state === 'pure' ? (
              <motion.div
                initial={animated ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                className="w-full h-16 bg-slate-50 flex flex-col items-center justify-center p-1"
              >
                <span className="text-[7px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1 py-0.5 rounded text-center">
                  NO COLOR CHANGE
                </span>
                <span className="text-[6px] text-slate-600 font-bold text-center mt-0.5">Clear Acid Layer</span>
              </motion.div>
            ) : state === 'adulterated' ? (
              <motion.div
                initial={animated ? { height: 0 } : {}}
                animate={{ height: '4rem' }}
                className="w-full bg-gradient-to-b from-pink-500 to-rose-600 flex flex-col items-center justify-center p-1 shadow-md"
              >
                <span className="text-[7px] font-black text-white bg-rose-950/80 px-1 py-0.5 rounded text-center">
                  VIVID PINK / RED
                </span>
                <span className="text-[6px] text-white font-bold text-center mt-0.5">
                  METANIL YELLOW DETECTED
                </span>
              </motion.div>
            ) : (
              <div className="w-full h-16 bg-slate-100 flex items-center justify-center">
                <span className="text-[7px] text-slate-500 font-bold">Acid Layer (5mL)</span>
              </div>
            )}
          </div>

          <div className="ml-4 flex flex-col gap-1 text-[11px] font-bold">
            <div className="flex items-center gap-1.5 text-amber-800">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600"></div>
              <span>Top: Mustard Oil</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600"></div>
              <span>Bottom: Acid Layer</span>
            </div>
          </div>
        </div>
      );

    case 'iodine_starch_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-36 h-28 bg-white rounded-xl border border-slate-300 flex items-center justify-center p-3 shadow-xs">
            {state === 'pure' ? (
              <div className="w-24 h-16 rounded-lg bg-amber-100 border border-amber-300 flex flex-col items-center justify-center p-1 shadow-inner">
                <div className="w-4 h-4 rounded-full bg-amber-600 mb-1"></div>
                <span className="text-[8px] font-bold text-amber-950">Natural Amber Brown</span>
                <span className="text-[7px] text-amber-900 font-medium">Zero Blue Color</span>
              </div>
            ) : state === 'adulterated' ? (
              <div className="w-24 h-16 rounded-lg bg-indigo-900 border-2 border-indigo-500 flex flex-col items-center justify-center p-1 shadow-inner">
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-6 h-6 rounded-full bg-blue-500 mb-1 flex items-center justify-center shadow-md"
                >
                  <span className="text-[8px] font-bold text-white">I3-</span>
                </motion.div>
                <span className="text-[8px] font-extrabold text-blue-100">DEEP NAVY BLUE</span>
                <span className="text-[7px] text-blue-200">Starch Amylose Present</span>
              </div>
            ) : (
              <div className="w-24 h-16 rounded-lg bg-amber-200 border border-amber-300 flex items-center justify-center">
                <span className="text-[8px] text-amber-950 font-bold">Melted Ghee Sample</span>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 text-xs border border-slate-300 font-medium">
          Laboratory Visual Simulation
        </div>
      );
  }
};
