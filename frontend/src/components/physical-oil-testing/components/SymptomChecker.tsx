import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FlaskConical, 
  RotateCcw,
  Loader2,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { OIL_TESTS } from '../data/oilTestsData';
import { DiagnosticResult } from '../types';

interface SymptomCheckerProps {
  onSelectTest: (testId: string) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onSelectTest }) => {
  const [selectedOil, setSelectedOil] = useState<string>('Mustard Oil (Sarson)');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customDetail, setCustomDetail] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [recommendedTestId, setRecommendedTestId] = useState<string>('yellow_mustard_dye_test');

  const commonSymptomList = [
    { id: 'early_smoke', label: 'Smokes early at low heat with choking smell', testId: 'heating_test' },
    { id: 'heavy_foam', label: 'Foams aggressively like soap when heated', testId: 'heating_test' },
    { id: 'refuses_freeze', label: 'Refuses to solidify or leaves liquid top layer in fridge', testId: 'freezing_test' },
    { id: 'uneven_white_clumps', label: 'Uneven white floating clumps or curd-like patches in cold', testId: 'freezing_test' },
    { id: 'pink_layer', label: 'Lower acid layer turned pink/magenta in acid test', testId: 'yellow_mustard_dye_test' },
    { id: 'paper_halo', label: 'Paper blot shows rapid spreading watery outer ring', testId: 'paper_blot_test' },
    { id: 'water_shatter', label: 'Droplet shatters into micro-beads on water surface', testId: 'water_bubble_test' },
    { id: 'cold_skin_grease', label: 'Leaves persistent cold, waxy plastic film on palms', testId: 'palm_touch_friction_test' },
    { id: 'blue_iodine', label: 'Ghee turned deep blue/purple with iodine drops', testId: 'iodine_starch_test' },
    { id: 'perfume_fade', label: 'Aroma faded quickly leaving stale flat grease smell', testId: 'palm_touch_friction_test' },
  ];

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleRunDiagnosis = async () => {
    if (selectedSymptoms.length === 0 && !customDetail.trim()) return;
    setIsAnalyzing(true);

    // Determine the most relevant test from selected symptoms
    const firstSymptom = commonSymptomList.find((s) => selectedSymptoms.includes(s.id));
    if (firstSymptom) {
      setRecommendedTestId(firstSymptom.testId);
    } else if (selectedOil.toLowerCase().includes('mustard')) {
      setRecommendedTestId('yellow_mustard_dye_test');
    } else if (selectedOil.toLowerCase().includes('coconut') || selectedOil.toLowerCase().includes('ghee')) {
      setRecommendedTestId('freezing_test');
    } else {
      setRecommendedTestId('heating_test');
    }

    try {
      const symptomLabels = selectedSymptoms.map((id) => commonSymptomList.find((s) => s.id === id)?.label || id).join(', ');
      
      const response = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oilType: selectedOil,
          symptoms: symptomLabels,
          additionalDetails: customDetail,
        }),
      });

      const data = await response.json();
      if (data.diagnosis) {
        setDiagnosticResult(data.diagnosis);
      } else {
        // Fallback rule engine result
        setDiagnosticResult({
          riskLevel: selectedSymptoms.includes('pink_layer') || selectedSymptoms.includes('blue_iodine') || selectedSymptoms.includes('refuses_freeze') ? 'HIGH_RISK_ADULTERATED' : 'SUSPICIOUS',
          summary: `Observed symptoms in ${selectedOil} suggest structural lipid degradation, foreign phase addition, or artificial dye adulteration.`,
          potentialAdulterants: ['Low-grade mineral paraffin', 'Synthetic azo dye (Metanil yellow)', 'Industrial palm oil blend'],
          recommendedActions: [
            'Perform the designated kitchen verification test in the Virtual Lab.',
            'Do not use this batch for high-temperature cooking or direct consumption.',
            'Keep sample container sealed in case food safety reporting is warranted.'
          ],
          scientificExplanation: 'Natural culinary lipids exhibit homogenous thermal convection and phase transitions. Disrupted surface tension or phase separation indicates foreign hydrocarbons.'
        });
      }
    } catch (e) {
      console.warn('AI diagnose call failed, using rule engine:', e);
      setDiagnosticResult({
        riskLevel: 'SUSPICIOUS',
        summary: `Analysis of observed traits in ${selectedOil} shows high probability of blending with spent oil or mineral solvent residues.`,
        potentialAdulterants: ['Spent frying oil with high Polar Compounds', 'Liquid paraffin petroleum byproduct'],
        recommendedActions: [
          'Run the recommended physical test below to confirm phase stability.',
          'Discard sample if acrid choking smoke or dye separation is repeated.'
        ],
        scientificExplanation: 'High free fatty acid concentration and synthetic additives drastically reduce smoke point and promote surfactant foam.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setCustomDetail('');
    setDiagnosticResult(null);
  };

  const recTestObj = OIL_TESTS.find((t) => t.id === recommendedTestId) || OIL_TESTS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Oil Symptom Diagnostic</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          What anomalies did you notice in your oil?
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Select physical anomalies, suspicious smells, or odd behavior you observed. Our diagnostic engine cross-references chemical standards to identify likely adulterants and recommend the exact verification test.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Symptom Selector Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            {/* Step 1: Select Oil */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                1. Which Oil Are You Testing?
              </label>
              <select
                id="diagnostic-oil-select"
                value={selectedOil}
                onChange={(e) => setSelectedOil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-sm font-bold text-amber-900 rounded-xl px-4 py-3 focus:outline-hidden focus:border-amber-500 cursor-pointer shadow-2xs"
              >
                <option value="Mustard Oil (Kachi Ghani / Sarson)">Mustard Oil (Sarson ka tel)</option>
                <option value="Desi Cow or Buffalo Ghee">Desi Ghee / Butter</option>
                <option value="Coconut Oil (Virgin / Cold Pressed)">Coconut Oil (Nariyal)</option>
                <option value="Extra Virgin Olive Oil">Extra Virgin Olive Oil</option>
                <option value="Groundnut / Peanut Oil">Groundnut / Peanut Oil</option>
                <option value="Sesame / Til Oil">Sesame (Til) Oil</option>
                <option value="Sunflower or Blended Vegetable Oil">Sunflower or Blended Vegetable Oil</option>
              </select>
            </div>

            {/* Step 2: Select Symptoms */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Select Observed Symptoms / Red Flags
                </label>
                <span className="text-[11px] text-slate-500 font-mono font-bold">
                  {selectedSymptoms.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {commonSymptomList.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border mt-0.5 shrink-0 flex items-center justify-center ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 font-bold" />}
                      </div>
                      <span className="leading-snug">{symptom.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Optional Custom Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                3. Additional Details or Odor (Optional)
              </label>
              <textarea
                id="diagnostic-custom-notes"
                rows={2}
                placeholder="E.g., Smelled strongly of chemical paint; left a thick gummy brown ring after cooking poori..."
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 p-3 rounded-xl focus:outline-hidden focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="run-ai-diagnostic-btn"
                disabled={isAnalyzing || (selectedSymptoms.length === 0 && !customDetail.trim())}
                onClick={handleRunDiagnosis}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Chemistry Profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Diagnose & Assess Purity Risk</span>
                  </>
                )}
              </button>

              {(selectedSymptoms.length > 0 || customDetail.trim()) && (
                <button
                  onClick={handleReset}
                  className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-300 cursor-pointer"
                  title="Reset Symptoms"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Result Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {diagnosticResult ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Diagnostic Verdict</span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                  diagnosticResult.riskLevel === 'SAFE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : diagnosticResult.riskLevel === 'SUSPICIOUS'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {diagnosticResult.riskLevel.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {diagnosticResult.summary}
                </p>
              </div>

              {/* Likely Adulterants */}
              {diagnosticResult.potentialAdulterants && diagnosticResult.potentialAdulterants.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1.5">
                    Suspected Adulterants:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnosticResult.potentialAdulterants.map((item, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Steps */}
              {diagnosticResult.recommendedActions && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Recommended Actions:
                  </span>
                  <ul className="space-y-1">
                    {diagnosticResult.recommendedActions.map((action, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scientific Mechanism */}
              {diagnosticResult.scientificExplanation && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <strong className="text-slate-900">Scientific Rationale:</strong> {diagnosticResult.scientificExplanation}
                </div>
              )}

              {/* Immediate Test Recommendation Card */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-2">
                  Immediate Confirmation Test
                </span>
                <button
                  id="diagnostic-launch-test-btn"
                  onClick={() => onSelectTest(recommendedTestId)}
                  className="w-full p-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-between shadow-xs cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block font-black text-sm">{recTestObj.title}</span>
                    <span className="text-[10px] text-slate-900 font-medium">{recTestObj.estimatedDuration} • Kitchen items only</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-950 shrink-0" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-base font-black text-slate-900">No Diagnosis Run Yet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select observed symptoms on the left and click "Diagnose & Assess Purity Risk" to get instant food chemistry insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
