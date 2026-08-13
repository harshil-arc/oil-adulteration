import React from 'react';
import { OILS_DATABASE } from '../../data/oilsData';
import { Flame, AlertTriangle } from 'lucide-react';

export const SmokePointGuide = () => {
  const highHeatOils = OILS_DATABASE.filter(o => o.smokePointC >= 220);
  const mediumHeatOils = OILS_DATABASE.filter(o => o.smokePointC >= 170 && o.smokePointC < 220);
  const rawOnlyOils = OILS_DATABASE.filter(o => o.smokePointC < 170);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-xs">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Cooking Smoke Points & Temperature Thermal Guide
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Understanding oil degradation temperatures to prevent toxic acrolein and free radical formation.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold text-amber-950">Why Smoke Points Matter:</strong> Heating an oil beyond its smoke point breaks down glycerides into free fatty acids, producing acrolein (a pungent toxic gas) and free radicals that cause oxidative damage. Always match your cooking heat level to the oil’s thermal limit!
          </p>
        </div>
      </div>

      {/* Temperature Bands */}
      <div className="space-y-4">
        
        {/* Zone 1: High Heat Deep Frying */}
        <div className="bg-white rounded-2xl border border-red-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <h3 className="text-base font-bold font-serif text-slate-900">
                High Heat Zone (220°C - 270°C / 428°F - 520°F)
              </h3>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-xs font-bold">
              Deep Frying, Searing & Stir-Fry
            </span>
          </div>

          <p className="text-xs text-slate-600">
            These oils have tight chemical bonds and high heat stability, making them safe for deep frying, Indian tempering, and high-heat wok cooking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {highHeatOils.map(oil => (
              <div key={oil.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block font-serif">{oil.name}</span>
                  <span className="text-[10px] text-slate-500">{oil.processingType}</span>
                </div>
                <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0">
                  {oil.smokePointC}°C
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone 2: Medium Heat Sautéing */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="text-base font-bold font-serif text-slate-900">
                Medium Heat Zone (170°C - 219°C / 338°F - 425°F)
              </h3>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
              Sautéing, Baking & Gentle Frying
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Ideal for everyday stovetop sautéing, baking, and light stir-fry. Excellent balance of polyphenols and thermal safety.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {mediumHeatOils.map(oil => (
              <div key={oil.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block font-serif">{oil.name}</span>
                  <span className="text-[10px] text-slate-500">{oil.processingType}</span>
                </div>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                  {oil.smokePointC}°C
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone 3: Low Heat / Raw Only */}
        <div className="bg-white rounded-2xl border border-blue-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="text-base font-bold font-serif text-slate-900">
                Cold / Raw Zone (&lt;170°C / &lt;338°F)
              </h3>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold">
              RAW ONLY - Salad Drizzle & Finishing
            </span>
          </div>

          <p className="text-xs text-slate-600">
            High in fragile Omega-3 ALA and polyunsaturated bonds. <strong className="text-rose-600">STRICTLY DO NOT HEAT!</strong> Drizzle raw over soups, salads, and porridge.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {rawOnlyOils.map(oil => (
              <div key={oil.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block font-serif">{oil.name}</span>
                  <span className="text-[10px] text-slate-500">{oil.processingType}</span>
                </div>
                <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                  {oil.smokePointC}°C
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
