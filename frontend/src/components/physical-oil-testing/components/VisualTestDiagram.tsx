import React from 'react';
import { motion } from 'framer-motion';

interface VisualTestDiagramProps {
  testId: string;
  state: 'pure' | 'adulterated' | 'neutral' | 'in_progress';
  animated?: boolean;
}

export const VisualTestDiagram: React.FC<VisualTestDiagramProps> = ({
  testId,
  state,
  animated = true,
}) => {
  switch (testId) {
    case 'freezing_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          <div className="relative w-28 h-36 border-2 border-slate-400 rounded-b-2xl rounded-t-sm flex flex-col justify-end overflow-hidden shadow-inner bg-white">
            {/* Glass Container Rim */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-300 rounded-t-sm"></div>

            {state === 'pure' ? (
              // Pure: Uniform solid crystalline block
              <motion.div
                initial={animated ? { opacity: 0, y: 10 } : {}}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-28 bg-gradient-to-t from-amber-100 to-amber-200 flex flex-col items-center justify-center p-2 relative shadow-sm"
              >
                <div className="absolute inset-0 bg-white/30 backdrop-blur-xs"></div>
                <span className="relative z-10 text-[10px] font-extrabold text-amber-950 tracking-wider text-center">
                  UNIFORM SOLID MATRIX
                </span>
                <div className="relative z-10 mt-1 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                </div>
              </motion.div>
            ) : state === 'adulterated' ? (
              // Adulterated: Two stratified layers (liquid on top, milky sediment below)
              <div className="w-full h-28 flex flex-col">
                {/* Top Liquid Paraffin Layer */}
                <motion.div
                  initial={animated ? { height: 0 } : {}}
                  animate={{ height: '45%' }}
                  className="w-full bg-gradient-to-b from-amber-300 to-amber-200 relative flex items-center justify-center border-b border-amber-400"
                >
                  <span className="text-[8px] font-bold text-amber-950 px-1 py-0.5 bg-amber-100 rounded shadow-xs">
                    Liquid Paraffin Layer
                  </span>
                </motion.div>
                {/* Bottom solid / milky layer */}
                <motion.div
                  initial={animated ? { height: 0 } : {}}
                  animate={{ height: '55%' }}
                  className="w-full bg-stone-200 flex flex-col items-center justify-center relative p-1"
                >
                  <span className="text-[8px] font-bold text-stone-800 text-center">
                    Milky Clumped Sediment
                  </span>
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-2 h-1.5 bg-white rounded-full border border-stone-300"></div>
                    <div className="w-2.5 h-2 bg-white rounded-full border border-stone-300"></div>
                    <div className="w-2 h-1 bg-white rounded-full border border-stone-300"></div>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Neutral initial liquid state
              <div className="w-full h-24 bg-gradient-to-t from-amber-400 to-amber-300 flex items-center justify-center">
                <span className="text-[9px] font-bold text-amber-950">Sample Oil (Room Temp)</span>
              </div>
            )}
          </div>

          {/* Frost / Cold indicator */}
          <div className="absolute top-2 right-2 text-[11px] font-mono text-cyan-800 flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded-md border border-cyan-200 font-bold">
            <span>❄️ 4°C Chill</span>
          </div>
        </div>
      );

    case 'heating_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 border border-slate-300">
          {/* Frying Pan */}
          <div className="relative w-44 h-24 bg-gradient-to-b from-stone-600 to-stone-800 rounded-b-3xl rounded-t-lg border-2 border-stone-500 flex items-center justify-center p-2 shadow-md">
            {/* Pan handle */}
            <div className="absolute -right-8 top-8 w-9 h-3 bg-stone-700 rounded-r-md border border-stone-600"></div>

            {state === 'pure' ? (
              // Pure: Smooth shimmering golden oil
              <div className="w-36 h-16 bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden border border-amber-400">
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-white/40 to-transparent"
                ></motion.div>
                <span className="relative z-10 text-[10px] font-black text-amber-950 tracking-wide">
                  SMOOTH CONVECTION
                </span>
                <span className="relative z-10 text-[8px] text-amber-900 font-bold">Clean Aromatic Vapors</span>
              </div>
            ) : state === 'adulterated' ? (
              // Adulterated: Foaming violently with black burnt crust
              <div className="w-36 h-16 bg-amber-800 rounded-full flex flex-col items-center justify-center relative shadow-inner overflow-hidden border border-stone-900">
                {/* Burnt sludge bottom */}
                <div className="absolute bottom-0 inset-x-0 h-4 bg-stone-950 rounded-b-full"></div>
                {/* White Foam bubbles */}
                <div className="absolute inset-x-1 top-1 flex flex-wrap justify-center gap-1">
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [0.8, 1.2, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1 + (i % 3) * 0.4 }}
                      className="w-3.5 h-3.5 rounded-full bg-white shadow-xs border border-stone-300"
                    ></motion.div>
                  ))}
                </div>
                <span className="relative z-10 text-[9px] font-bold text-red-100 bg-red-900 px-1.5 py-0.5 rounded mt-3">
                  Heavy Foam & Black Sludge
                </span>
              </div>
            ) : (
              <div className="w-36 h-16 bg-amber-400 rounded-full flex items-center justify-center border border-amber-500">
                <span className="text-[10px] font-bold text-amber-950">Heating Oil Sample</span>
              </div>
            )}
          </div>

          {/* Flame indicator below */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs">🔥</span>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Medium Heat (180°C)</span>
          </div>
        </div>
      );

    case 'paper_blot_test':
      return (
        <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-300">
          {/* White Paper Sheet */}
          <div className="relative w-44 h-32 bg-white rounded-lg shadow-md p-3 flex items-center justify-center border border-stone-300">
            <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-stone-400">WHITE BLOTTER</span>

            {state === 'pure' ? (
              // Pure: Single clean translucent spot
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
              // Adulterated: Big outer watery halo with central dot and colored ring
              <motion.div
                initial={animated ? { scale: 0.7 } : {}}
                animate={{ scale: 1 }}
                className="relative w-24 h-24 rounded-full bg-sky-100 border-2 border-dashed border-sky-400 flex items-center justify-center"
              >
                {/* Secondary ring */}
                <div className="w-16 h-16 rounded-full bg-amber-100 border border-red-400 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  </div>
                </div>
                <span className="absolute -bottom-1 text-[7px] font-black text-red-700 bg-white px-1.5 py-0.2 rounded border border-red-200 shadow-xs">
                  RAPID HALO RING
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
          {/* Glass Bowl with Water */}
          <div className="relative w-44 h-32 bg-sky-50 border-2 border-sky-300 rounded-b-3xl rounded-t-lg flex flex-col justify-end p-2 overflow-hidden shadow-inner">
            {/* Water Surface Line */}
            <div className="absolute top-6 inset-x-0 h-1 bg-sky-400"></div>
            <div className="absolute top-7 inset-x-0 bottom-0 bg-sky-100/60 backdrop-blur-xs"></div>

            {state === 'pure' ? (
              // Pure: Single cohesive floating convex lens
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
              // Adulterated: Shattered micro droplets and cloudy water
              <div className="relative z-10 w-full h-20 flex flex-col items-center justify-center">
                {/* Floating shattered droplets */}
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
                {/* Milky cloud beneath */}
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
          {/* Test Tube */}
          <div className="relative w-16 h-36 border-2 border-slate-400 rounded-b-full rounded-t-sm flex flex-col justify-end overflow-hidden shadow-md bg-white">
            {/* Upper Oil Layer (Mustard) */}
            <div className="w-full h-16 bg-amber-400 flex items-center justify-center border-b border-amber-500">
              <span className="text-[7px] font-extrabold text-amber-950 text-center leading-tight">
                Upper Oil Phase (5mL)
              </span>
            </div>

            {/* Lower Acid Layer */}
            {state === 'pure' ? (
              // Pure: Lower layer remains clear/colorless
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
              // Adulterated: Lower layer turns vivid magenta / crimson red
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
