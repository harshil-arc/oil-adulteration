import React, { useState } from 'react';
import { OILS_DATABASE } from '../../data/oilsData';
import { Search, Filter, Droplet, Flame, CheckCircle2, AlertTriangle, Scale, X, Info } from 'lucide-react';

export const OilDirectory = ({ onCompareOils }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHeat, setSelectedHeat] = useState('All');
  const [activeOilModal, setActiveOilModal] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const categories = ['All', 'Cold-Pressed Oils', 'Refined Oils', 'Specialty & Nut Oils', 'Animal Fats & Ghee', 'Avoid Oils'];
  const heatLevels = ['All', 'High Heat (Frying)', 'Medium Heat (Sautéing)', 'Low Heat / Raw Only'];

  const filteredOils = OILS_DATABASE.filter(oil => {
    const matchesSearch = oil.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (oil.hindiName && oil.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      oil.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || oil.category === selectedCategory;
    const matchesHeat = selectedHeat === 'All' || oil.heatTolerance === selectedHeat;

    return matchesSearch && matchesCategory && matchesHeat;
  });

  const toggleCompare = (oilId) => {
    if (compareList.includes(oilId)) {
      setCompareList(compareList.filter(id => id !== oilId));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 oils at a time.');
        return;
      }
      setCompareList([...compareList, oilId]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Directory Title & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Edible Oils Master Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore 16+ common and specialty cooking oils, smoke points, fatty acid breakdowns, and nutritional profiles.
            </p>
          </div>

          {compareList.length > 0 && onCompareOils && (
            <button
              onClick={() => onCompareOils(compareList)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Selected ({compareList.length})</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search oil name, hindi name, or nutrient..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>

          {/* Heat Dropdown */}
          <select
            value={selectedHeat}
            onChange={(e) => setSelectedHeat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            {heatLevels.map(heat => (
              <option key={heat} value={heat}>Heat Tolerance: {heat}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Directory Oil Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOils.map(oil => {
          const isSelectedForCompare = compareList.includes(oil.id);
          const isAvoidCategory = oil.category === 'Avoid Oils' || oil.processingType === 'Hydrogenated / Trans Fat';

          return (
            <div
              key={oil.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-3 relative shadow-xs hover:shadow-md ${
                isAvoidCategory ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200/90 hover:border-amber-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">
                      {oil.name}
                    </h3>
                    {oil.hindiName && (
                      <span className="text-xs text-slate-500">({oil.hindiName})</span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                    isAvoidCategory
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {oil.smokePointC}°C ({oil.smokePointF}°F)
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {oil.description}
                </p>

                {/* Fatty Acid Profile Mini Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span className="text-emerald-700">MUFA: {oil.fattyAcidProfile.mufaPercent}%</span>
                    <span className="text-blue-700">PUFA: {oil.fattyAcidProfile.pufaPercent}%</span>
                    <span className="text-rose-700">SFA: {oil.fattyAcidProfile.sfaPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${oil.fattyAcidProfile.mufaPercent}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${oil.fattyAcidProfile.pufaPercent}%` }} className="bg-blue-500 h-full" />
                    <div style={{ width: `${oil.fattyAcidProfile.sfaPercent}%` }} className="bg-rose-500 h-full" />
                  </div>
                </div>

                {/* Nutrients tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {oil.keyNutrients.slice(0, 3).map((nut, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {nut}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleCompare(oil.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                    isSelectedForCompare
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isSelectedForCompare ? 'Added' : 'Compare'}</span>
                </button>

                <button
                  onClick={() => setActiveOilModal(oil)}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Full Details</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Oil Detail Modal */}
      {activeOilModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl relative border border-slate-200">
            
            <button
              onClick={() => setActiveOilModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  {activeOilModal.name}
                </h3>
                {activeOilModal.badge && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    {activeOilModal.badge}
                  </span>
                )}
              </div>
              {activeOilModal.hindiName && (
                <p className="text-sm text-slate-500 font-medium">{activeOilModal.hindiName}</p>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {activeOilModal.description}
            </p>

            {/* Grid Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Smoke Point</span>
                <span className="font-bold text-slate-900">{activeOilModal.smokePointC}°C ({activeOilModal.smokePointF}°F)</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Processing</span>
                <span className="font-bold text-slate-900">{activeOilModal.processingType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Heat Tolerance</span>
                <span className="font-bold text-slate-900">{activeOilModal.heatTolerance}</span>
              </div>
            </div>

            {/* Health Benefits */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Health Benefits & Clinical Action</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeOilModal.healthBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks / Contraindications */}
            {activeOilModal.healthRisks && activeOilModal.healthRisks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Precautions & Contraindications</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeOilModal.healthRisks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Dosage */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong className="font-bold block text-amber-950">Recommended Daily Dosage:</strong>
              {activeOilModal.recommendedDailyLimit}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveOilModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
