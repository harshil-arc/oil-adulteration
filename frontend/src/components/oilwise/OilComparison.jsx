import React, { useState } from 'react';
import { OILS_DATABASE } from '../../data/oilsData';
import { Scale, CheckCircle2, XCircle, Droplet, Flame, Sparkles, Plus, Trash2 } from 'lucide-react';

export const OilComparison = ({ initialOilIds = ['evoo', 'mustard_oil', 'rice_bran_oil'] }) => {
  const [selectedOilIds, setSelectedOilIds] = useState(
    initialOilIds.length > 0 ? initialOilIds.slice(0, 3) : ['evoo', 'mustard_oil', 'rice_bran_oil']
  );

  const selectedOils = selectedOilIds
    .map(id => OILS_DATABASE.find(o => o.id === id))
    .filter(o => o !== undefined);

  const addOil = (oilId) => {
    if (selectedOilIds.length >= 3) {
      alert('You can compare a maximum of 3 oils simultaneously.');
      return;
    }
    if (!selectedOilIds.includes(oilId)) {
      setSelectedOilIds([...selectedOilIds, oilId]);
    }
  };

  const removeOil = (oilId) => {
    if (selectedOilIds.length <= 1) {
      alert('Keep at least 1 oil to compare.');
      return;
    }
    setSelectedOilIds(selectedOilIds.filter(id => id !== oilId));
  };

  const availableOilsToSelect = OILS_DATABASE.filter(o => !selectedOilIds.includes(o.id));

  return (
    <div className="space-y-6">
      
      {/* Title & Add Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600" />
              Side-by-Side Edible Oil Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare smoke points, fatty acid compositions, and cooking suitability across 2 to 3 oils.
            </p>
          </div>

          {selectedOilIds.length < 3 && availableOilsToSelect.length > 0 && (
            <div className="flex items-center space-x-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addOil(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">+ Add Oil to Compare...</option>
                {availableOilsToSelect.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Oils Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedOils.map(oil => (
            <span
              key={oil.id}
              className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>{oil.name}</span>
              <button
                onClick={() => removeOil(oil.id)}
                className="hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 font-serif">
              <th className="p-4 w-1/4">Comparison Metric</th>
              {selectedOils.map(oil => (
                <th key={oil.id} className="p-4 w-1/4 border-l border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-900 block font-serif">{oil.name}</span>
                      {oil.hindiName && <span className="text-[10px] text-slate-500 font-normal">{oil.hindiName}</span>}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            
            {/* Category & Processing */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Category & Processing</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100">
                  <span className="font-semibold text-slate-800 block">{oil.category}</span>
                  <span className="text-slate-500 text-[11px]">{oil.processingType}</span>
                </td>
              ))}
            </tr>

            {/* Smoke Point */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Smoke Point (°C)</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100">
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {oil.smokePointC}°C ({oil.smokePointF}°F)
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-1">{oil.heatTolerance}</span>
                </td>
              ))}
            </tr>

            {/* Monounsaturated Fat (MUFA) */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">MUFA (Heart Healthy)</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100 font-bold text-emerald-700">
                  {oil.fattyAcidProfile.mufaPercent}%
                </td>
              ))}
            </tr>

            {/* Polyunsaturated Fat (PUFA) */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">PUFA (Omega 3/6)</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100 font-bold text-blue-700">
                  {oil.fattyAcidProfile.pufaPercent}%
                  {oil.fattyAcidProfile.omega3Ratio && (
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      ({oil.fattyAcidProfile.omega3Ratio})
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Saturated Fat (SFA) */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Saturated Fat (SFA)</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100 font-bold text-rose-700">
                  {oil.fattyAcidProfile.sfaPercent}%
                </td>
              ))}
            </tr>

            {/* Key Active Nutrients */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Active Antioxidants / Nutrients</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {oil.keyNutrients.map((n, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {n}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Recommended Daily Limit */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Recommended Limit</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100 font-medium text-slate-800">
                  {oil.recommendedDailyLimit}
                </td>
              ))}
            </tr>

            {/* Deep Frying Suitability */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Deep Frying (180°C+)</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100">
                  {oil.suitableCooking.highHeatFrying ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Suitable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                      <XCircle className="w-4 h-4" /> Unsuitable
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Raw Drizzle / Salad Suitability */}
            <tr>
              <td className="p-4 font-bold text-slate-900 bg-slate-50/50">Raw Drizzle / Salad</td>
              {selectedOils.map(oil => (
                <td key={oil.id} className="p-4 border-l border-slate-100">
                  {oil.suitableCooking.rawDrizzle ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Recommended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-normal">
                      Not typical
                    </span>
                  )}
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};
