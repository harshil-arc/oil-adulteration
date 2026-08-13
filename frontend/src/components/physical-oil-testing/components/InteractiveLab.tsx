import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Clock, 
  Eye, 
  Sparkles,
  Info,
  ShieldCheck,
  Check,
  ChevronRight,
  Flame,
  Snowflake,
  FileSpreadsheet,
  Droplets,
  FlaskRound
} from 'lucide-react';
import { OIL_TESTS } from '../data/oilTestsData';
import { OIL_PROFILES } from '../data/oilProfilesData';
import { OilTest, SimulatorOption, TestOutcome, TestRecord } from '../types';
import { VisualTestDiagram } from './VisualTestDiagram';

interface InteractiveLabProps {
  initialTestId?: string;
  onSaveRecord: (record: Omit<TestRecord, 'id' | 'timestamp'>) => void;
  onOpenAiModal: () => void;
  onSelectTest: (testId: string) => void;
}

export const InteractiveLab: React.FC<InteractiveLabProps> = ({
  initialTestId = 'freezing_test',
  onSaveRecord,
  onOpenAiModal,
  onSelectTest,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId);
  const [selectedOil, setSelectedOil] = useState<string>('Mustard Oil');
  const [brandName, setBrandName] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerTotal, setTimerTotal] = useState<number>(60);
  
  // Observation & result state
  const [selectedOption, setSelectedOption] = useState<SimulatorOption | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeVisualMode, setActiveVisualMode] = useState<'pure' | 'adulterated' | 'neutral'>('neutral');

  const activeTest: OilTest = OIL_TESTS.find((t) => t.id === selectedTestId) || OIL_TESTS[0];

  // Update test when prop or tab changes
  useEffect(() => {
    if (initialTestId) {
      setSelectedTestId(initialTestId);
    }
  }, [initialTestId]);

  // Reset step and timer when switching tests
  useEffect(() => {
    setCurrentStepIndex(0);
    setSelectedOption(null);
    setSavedSuccess(false);
    setActiveVisualMode('neutral');
    setIsTimerRunning(false);
    setTimerSeconds(0);
  }, [selectedTestId]);

  // Step-specific timer initialization
  useEffect(() => {
    const currentStep = activeTest.steps[currentStepIndex];
    if (currentStep?.timeSeconds) {
      setTimerTotal(currentStep.timeSeconds);
      setTimerSeconds(currentStep.timeSeconds);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, activeTest]);

  // Timer countdown loop
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleSaveToJournal = () => {
    if (!selectedOption) return;
    onSaveRecord({
      oilType: selectedOil,
      brandName: brandName.trim() || undefined,
      testId: activeTest.id,
      testTitle: activeTest.title,
      outcome: selectedOption.outcome,
      selectedOptionLabel: selectedOption.label,
      notes: userNotes.trim() || undefined,
      visualFinding: selectedOption.explanation,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      {/* Top Test Selector Carousel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Virtual Kitchen Lab</span>
            <h2 className="text-xl font-black text-slate-900">Select a Physical Test to Conduct</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Sample Oil:</span>
            <select
              id="lab-sample-oil-select"
              value={selectedOil}
              onChange={(e) => setSelectedOil(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-amber-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-amber-500 cursor-pointer shadow-xs"
            >
              <option value="Mustard Oil (Kachi Ghani)">Mustard Oil (Sarson)</option>
              <option value="Desi Cow / Buffalo Ghee">Desi Ghee / Butter</option>
              <option value="Coconut Oil (Virgin / Cold Pressed)">Coconut Oil (Nariyal)</option>
              <option value="Extra Virgin Olive Oil">Extra Virgin Olive Oil</option>
              <option value="Groundnut / Peanut Oil">Groundnut / Peanut Oil</option>
              <option value="Sesame / Til Oil">Sesame (Til) Oil</option>
              <option value="Sunflower / Cooking Blend">Sunflower / Mixed Blend</option>
            </select>
          </div>
        </div>

        {/* Test Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {OIL_TESTS.map((test) => {
            const Icon = getTestIcon(test.id);
            const isSelected = test.id === selectedTestId;
            return (
              <button
                key={test.id}
                id={`select-test-${test.id}`}
                onClick={() => {
                  setSelectedTestId(test.id);
                  onSelectTest(test.id);
                }}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-600'}`} />
                  <span className={`text-[9px] font-mono px-1 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {test.estimatedDuration.split(' ')[0]}
                  </span>
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-1">
                  {test.title.split(' ')[0]} {test.title.split(' ')[1]}
                </span>
                <span className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500'
                }`}>
                  {test.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Interactive Lab Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Step by Step Guided Execution (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {activeTest.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {activeTest.estimatedDuration}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{activeTest.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{activeTest.subtitle}</p>
              </div>

              {activeTest.fssaiRef && (
                <div className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-[10px] text-emerald-800 font-bold">
                  {activeTest.fssaiRef}
                </div>
              )}
            </div>

            {/* Tools Required Checklist */}
            <div className="my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Kitchen Tools Needed (Zero Devices Required)
              </span>
              <div className="flex flex-wrap gap-2">
                {activeTest.requiredTools.map((tool, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 font-bold" />
                    <span className="font-medium">{tool.name}</span>
                    {tool.kitchenAlternative && (
                      <span className="text-[10px] text-amber-800 font-semibold">(or {tool.kitchenAlternative})</span>
                    )}
                  </div>
                ))}
              </div>
              {activeTest.safetyWarning && (
                <div className="mt-2 text-[11px] text-amber-900 flex items-start gap-1.5 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Safety Tip:</strong> {activeTest.safetyWarning}</span>
                </div>
              )}
            </div>

            {/* Step Stepper Navigation */}
            <div className="flex items-center justify-between gap-1.5 mb-4">
              {activeTest.steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = idx < currentStepIndex;
                return (
                  <button
                    key={step.stepNumber}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Step {step.stepNumber}</span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                  </button>
                );
              })}
            </div>

            {/* Active Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
                    Step {activeTest.steps[currentStepIndex].stepNumber} of {activeTest.steps.length}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {activeTest.steps[currentStepIndex].title}
                  </span>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {activeTest.steps[currentStepIndex].instructions}
                </p>

                {activeTest.steps[currentStepIndex].tip && (
                  <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Pro-Tip:</strong> {activeTest.steps[currentStepIndex].tip}</span>
                  </div>
                )}

                {/* Step Timer if applicable */}
                {activeTest.steps[currentStepIndex].timeSeconds && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {activeTest.steps[currentStepIndex].timerLabel || 'Process Timer'}
                        </span>
                        <div className="text-lg font-mono font-black text-slate-900">
                          {formatTimer(timerSeconds)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="timer-play-pause-btn"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isTimerRunning
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Start Timer
                          </>
                        )}
                      </button>

                      <button
                        id="timer-reset-btn"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(activeTest.steps[currentStepIndex].timeSeconds || 60);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id="timer-fastforward-btn"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(0);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-300 cursor-pointer"
                        title="Simulate timer completion for fast visual demonstration"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Simulate End</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    id="prev-step-btn"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {currentStepIndex < activeTest.steps.length - 1 ? (
                    <button
                      id="next-step-btn"
                      onClick={() => setCurrentStepIndex((prev) => Math.min(activeTest.steps.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      id="finish-steps-btn"
                      onClick={() => {
                        const obsSection = document.getElementById('observation-section');
                        obsSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Observation</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Observation Selector & Diagnostic Result Section */}
          <div id="observation-section" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Step Final Inspection</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">What did you observe in your kitchen test?</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Select the observation that matches your test result to receive instant chemical analysis and safety rating.
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {activeTest.simulatorOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                const isPure = opt.outcome === 'PURE';
                const isSuspect = opt.outcome === 'SUSPECT';
                return (
                  <button
                    key={opt.id}
                    id={`obs-opt-${opt.id}`}
                    onClick={() => {
                      setSelectedOption(opt);
                      setActiveVisualMode(isPure ? 'pure' : 'adulterated');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? isPure
                          ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                          : 'bg-rose-50 border-rose-400 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPure ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                      ) : isSuspect ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-amber-100 text-amber-700'}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'}`}>
                          <XCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          isPure
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isSuspect
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {opt.outcome}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Diagnostic Card when selected */}
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border space-y-3 ${
                  selectedOption.outcome === 'PURE'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedOption.outcome === 'PURE' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">
                      {selectedOption.outcome === 'PURE' ? 'Purity Verification Result: Pass' : 'Contamination Risk Detected'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {selectedOption.outcome === 'PURE' ? 'Safe to Consume' : 'Caution / High Risk'}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {selectedOption.explanation}
                </p>

                <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <strong className="text-slate-900">Chemical Breakdown:</strong> {activeTest.scientificMechanism}
                </div>

                {/* Save to Log Form */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    id="brand-input"
                    type="text"
                    placeholder="Brand or batch name (optional)"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-lg focus:outline-hidden focus:border-amber-500 shadow-2xs"
                  />
                  <button
                    id="save-log-btn"
                    onClick={handleSaveToJournal}
                    disabled={savedSuccess}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved to Journal!
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save in My Journal
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Apparatus Simulator & Benchmark Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Simulator Apparatus */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Live Visual Simulator</span>
                <h4 className="text-sm font-black text-slate-900">Apparatus & Phase Reaction</h4>
              </div>
              <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  id="sim-view-pure-btn"
                  onClick={() => setActiveVisualMode('pure')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    activeVisualMode === 'pure' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pure
                </button>
                <button
                  id="sim-view-adulterated-btn"
                  onClick={() => setActiveVisualMode('adulterated')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    activeVisualMode === 'adulterated' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Adulterated
                </button>
              </div>
            </div>

            {/* Diagram Rendering */}
            <VisualTestDiagram testId={activeTest.id} state={activeVisualMode} />

            <div className="text-center text-xs font-medium text-slate-600">
              {activeVisualMode === 'pure' ? (
                <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Simulating Pure Oil Characteristic
                </span>
              ) : activeVisualMode === 'adulterated' ? (
                <span className="text-rose-700 font-bold flex items-center justify-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Simulating Adulterated Phase Reaction
                </span>
              ) : (
                <span>Click above to compare pure vs. adulterated states visually.</span>
              )}
            </div>
          </div>

          {/* Pure vs Adulterated Reference Specs */}
          <div className="grid grid-cols-1 gap-3">
            {/* Pure Reference */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Pure Benchmark</span>
              </div>
              <h5 className="text-sm font-black text-slate-900">{activeTest.pureObservation.title}</h5>
              <p className="text-xs text-slate-700 leading-relaxed">{activeTest.pureObservation.description}</p>
              <ul className="space-y-1 pt-1">
                {activeTest.pureObservation.keyTraits.map((trait, i) => (
                  <li key={i} className="text-[11px] text-emerald-900 flex items-start gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Adulterated Reference */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">Adulterated Red Flags</span>
              </div>
              <h5 className="text-sm font-black text-slate-900">{activeTest.adulteratedObservation.title}</h5>
              <p className="text-xs text-slate-700 leading-relaxed">{activeTest.adulteratedObservation.description}</p>
              <ul className="space-y-1 pt-1">
                {activeTest.adulteratedObservation.keyTraits.map((trait, i) => (
                  <li key={i} className="text-[11px] text-rose-900 flex items-start gap-1.5 font-medium">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ask AI Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" /> Have custom doubts?
              </span>
              <p className="text-xs font-black text-slate-900">Ask our AI Food Chemist</p>
              <p className="text-[11px] text-slate-600">Get specific guidance on any oil brand or odd test result.</p>
            </div>
            <button
              id="ai-prompt-lab-banner-btn"
              onClick={onOpenAiModal}
              className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer"
            >
              Consult AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
