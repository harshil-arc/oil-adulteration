import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Snowflake,
  FileSpreadsheet,
  Droplets,
  FlaskRound
} from 'lucide-react';
import { OIL_TESTS } from '../data/oilTestsData';
import { OilTest } from '../types';

interface TestDirectoryProps {
  onSelectTest: (testId: string) => void;
  onOpenAiModal: () => void;
}

export const TestDirectory: React.FC<TestDirectoryProps> = ({
  onSelectTest,
  onOpenAiModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOilFilter, setSelectedOilFilter] = useState<string>('All');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const categories = ['All', 'Freezing & Cooling', 'Thermal & Smoke', 'Surface & Absorption', 'Chemical & Dye', 'Sensory & Touch'];
  const oilOptions = ['All', 'Mustard Oil', 'Coconut Oil', 'Desi Ghee / Butter', 'Olive Oil', 'Groundnut Oil', 'Sesame Oil'];

  const filteredTests = OIL_TESTS.filter((test) => {
    const matchesSearch = 
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.adulterantsDetected.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      test.targetOils.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    const matchesOil = selectedOilFilter === 'All' || test.targetOils.some((o) => o.toLowerCase().includes(selectedOilFilter.toLowerCase()));

    return matchesSearch && matchesCategory && matchesOil;
  });

  const getTestIcon = (testId: string) => {
    switch (testId) {
      case 'freezing_test': return Snowflake;
      case 'heating_test': return Flame;
      case 'paper_blot_test': return FileSpreadsheet;
      case 'water_bubble_test': return Droplets;
      case 'yellow_mustard_dye_test': return FlaskRound;
      default: return FlaskConical;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Zero-Device Testing Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kitchen Physical Testing Protocols
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Physical screening techniques developed under food science standards (FSSAI DART) that require only everyday household items—no lab glassware or expensive meters needed.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="test-directory-search-input"
              type="text"
              placeholder="Search by test name, adulterant (e.g. Argemone, Metanil Yellow), or oil type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-xl focus:outline-hidden focus:border-amber-500 shadow-2xs"
            />
          </div>

          {/* Oil Type Filter */}
          <div className="sm:w-60">
            <select
              id="test-directory-oil-filter"
              value={selectedOilFilter}
              onChange={(e) => setSelectedOilFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 px-3 py-2.5 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer shadow-2xs"
            >
              {oilOptions.map((oil) => (
                <option key={oil} value={oil}>Filter by: {oil}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTests.map((test) => {
          const Icon = getTestIcon(test.id);
          const isExpanded = expandedTestId === test.id;
          return (
            <div
              key={test.id}
              className="bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-amber-700" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {test.category}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {test.estimatedDuration}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 tracking-tight">{test.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{test.subtitle}</p>

                {/* Target Oils & Detected Adulterants Tags */}
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Suitable For:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {test.targetOils.map((oil, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {oil}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Detects Adulterants:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {test.adulterantsDetected.map((adulterant, idx) => (
                        <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                          {adulterant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pure vs Adulterated Quick Contrast */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <div className="font-bold flex items-center gap-1 text-emerald-800 mb-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 font-bold" /> Pure Observation
                    </div>
                    <p className="text-[10px] text-slate-700 leading-tight line-clamp-2">
                      {test.pureObservation.title}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                    <div className="font-bold flex items-center gap-1 text-rose-800 mb-0.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600 font-bold" /> Adulterated Sign
                    </div>
                    <p className="text-[10px] text-slate-700 leading-tight line-clamp-2">
                      {test.adulteratedObservation.title}
                    </p>
                  </div>
                </div>

                {/* Expanded Details Accordion */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Required Tools:</span>
                      <ul className="list-disc list-inside text-slate-700 mt-1 space-y-0.5">
                        {test.requiredTools.map((t, idx) => (
                          <li key={idx}>
                            {t.name} {t.kitchenAlternative ? `(or ${t.kitchenAlternative})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Quick Procedure:</span>
                      <ol className="list-decimal list-inside text-slate-700 mt-1 space-y-1">
                        {test.steps.map((st) => (
                          <li key={st.stepNumber}>
                            <strong>{st.title}:</strong> {st.instructions}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 text-[11px] border border-slate-200">
                      <strong className="text-slate-900">Scientific Principle:</strong> {test.scientificMechanism}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'Less Info' : 'View Steps'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  id={`launch-lab-${test.id}`}
                  onClick={() => onSelectTest(test.id)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Launch Guided Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <FlaskConical className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No physical tests match your search criteria</h3>
          <p className="text-xs text-slate-600">Try adjusting your keyword or reset filters to view all standard home tests.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedOilFilter('All'); }}
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
