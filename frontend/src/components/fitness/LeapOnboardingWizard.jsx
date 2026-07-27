import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ChevronDown, Sparkles, X } from 'lucide-react';

export default function LeapOnboardingWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1); // 1 to 10
  const [gender, setGender] = useState('Male');
  const [focusArea, setFocusArea] = useState('Full Body');
  const [goal, setGoal] = useState('Lose Weight');
  const [motivation, setMotivation] = useState('Improve health');
  const [pushups, setPushups] = useState('Intermediate');
  const [activityLevel, setActivityLevel] = useState('Moderately active');
  const [weeklyDays, setWeeklyDays] = useState(4);
  const [firstDay, setFirstDay] = useState('SUNDAY');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [weightValue, setWeightValue] = useState(165.0);
  const [heightUnit, setHeightUnit] = useState('ft');
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  
  // Loader state for step 9
  const [genProgress, setGenProgress] = useState(0);

  useEffect(() => {
    if (step === 9) {
      setGenProgress(0);
      const interval = setInterval(() => {
        setGenProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(10), 400);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleFinishOnboarding = () => {
    onComplete({
      gender,
      focusArea,
      goal,
      motivation,
      pushups,
      activityLevel,
      weeklyDays,
      firstDay,
      weight: weightUnit === 'lbs' ? Math.round(weightValue * 0.453592) : weightValue,
      height: heightUnit === 'ft' ? Math.round((heightFt * 30.48) + (heightIn * 2.54)) : 175,
      isLeapConfigured: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-900 font-sans flex flex-col justify-between overflow-y-auto animate-fade-in">
      
      {/* Top Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-20">
        {step > 1 && step < 9 ? (
          <button onClick={() => setStep(prev => prev - 1)} className="p-2 -ml-2 text-slate-800 hover:text-black font-bold">
            <ArrowLeft size={22} />
          </button>
        ) : <div className="w-8" />}

        {/* Top Blue Progress Bar */}
        <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0052ff] rounded-full transition-all duration-300" style={{ width: `${(step / 10) * 100}%` }} />
        </div>

        {step < 9 ? (
          <button onClick={() => setStep(9)} className="text-slate-500 font-bold text-sm hover:text-black">
            Skip
          </button>
        ) : <div className="w-8" />}
      </div>

      {/* Main Body per Step */}
      <div className="px-6 py-4 flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
        
        {/* ── STEP 1: GENDER SELECTION (Screenshot 1) ─────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-fade-in my-auto">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">What's your gender?</h1>
              <p className="text-slate-500 text-sm font-semibold">Let us know you better</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div 
                onClick={() => setGender('Male')}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  gender === 'Male' ? 'border-[#0052ff] bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="w-28 h-48 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-5xl">
                  👨‍💼
                </div>
                <span className="text-lg font-black text-slate-900">Male</span>
              </div>

              <div 
                onClick={() => setGender('Female')}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  gender === 'Female' ? 'border-[#0052ff] bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="w-28 h-48 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-5xl">
                  👩‍💼
                </div>
                <span className="text-lg font-black text-slate-900">Female</span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: FOCUS AREA SELECTION (Screenshot 2) ────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <h1 className="text-2xl font-black text-slate-900">Please choose your focus area</h1>

            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-6 space-y-3">
                {['Full Body', 'Arm', 'Chest', 'Abs', 'Leg'].map(area => (
                  <button
                    key={area}
                    onClick={() => setFocusArea(area)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-left transition-all ${
                      focusArea === area 
                        ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {/* Human Figure Diagram with Pointers */}
              <div className="col-span-6 flex flex-col items-center justify-center relative">
                <div className="w-32 h-64 bg-slate-100 rounded-3xl flex items-center justify-center text-6xl shadow-inner relative">
                  🧍‍♂️
                  {/* Line pointers overlay */}
                  <div className="absolute top-12 -left-6 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#0052ff]" />
                    <div className="w-8 h-0.5 bg-[#0052ff]" />
                  </div>
                  <div className="absolute top-24 -left-6 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#0052ff]" />
                    <div className="w-8 h-0.5 bg-[#0052ff]" />
                  </div>
                  <div className="absolute top-36 -left-6 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#0052ff]" />
                    <div className="w-8 h-0.5 bg-[#0052ff]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: MAIN GOALS SELECTION (Screenshot 3) ───────────────── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <h1 className="text-2xl font-black text-slate-900 text-center">What are your main goals?</h1>

            <div className="space-y-3.5">
              {[
                { id: 'Lose Weight', label: 'Lose Weight', icon: '⚖️' },
                { id: 'Build Muscle', label: 'Build Muscle', icon: '💪' },
                { id: 'Keep Fit', label: 'Keep Fit', icon: '👍' }
              ].map(g => {
                const isSelected = goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-5 rounded-3xl cursor-pointer transition-all flex items-center justify-between relative overflow-hidden ${
                      isSelected 
                        ? 'bg-[#0052ff] text-white shadow-xl shadow-blue-500/30' 
                        : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <span className="text-xl font-black">{g.label}</span>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                      {g.icon}
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white text-[#0052ff] flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 4: MOTIVATION SELECTION (Screenshot 4) ────────────────── */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <h1 className="text-2xl font-black text-slate-900 text-center">What motivates you the most?</h1>

            <div className="space-y-3">
              {[
                { id: 'Feel confident', label: 'Feel confident', emoji: '😄' },
                { id: 'Release stress', label: 'Release stress', emoji: '🎈' },
                { id: 'Improve health', label: 'Improve health', emoji: '💪' },
                { id: 'Boost energy', label: 'Boost energy', emoji: '🌞' }
              ].map(m => (
                <div
                  key={m.id}
                  onClick={() => setMotivation(m.id)}
                  className={`p-4 rounded-2xl cursor-pointer font-black text-sm flex items-center gap-4 transition-all ${
                    motivation === m.id 
                      ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: PUSH-UP FITNESS ASSESSMENT (Screenshot 5) ─────────── */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <h1 className="text-2xl font-black text-slate-900 text-center">How many push-ups can you do at one time?</h1>

            <div className="space-y-3">
              {[
                { id: 'Beginner', label: 'Beginner', desc: '3-5 push-ups', emoji: '☝️' },
                { id: 'Intermediate', label: 'Intermediate', desc: '5-10 push-ups', emoji: '✌️' },
                { id: 'Advanced', label: 'Advanced', desc: 'At least 10', emoji: '👍' }
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => setPushups(p.id)}
                  className={`p-4.5 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${
                    pushups === p.id 
                      ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <h4 className="font-black text-base">{p.label}</h4>
                    <p className={`text-xs ${pushups === p.id ? 'text-blue-100' : 'text-slate-500'}`}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 6: ACTIVITY LEVEL (Screenshot 6) ─────────────────────── */}
        {step === 6 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <h1 className="text-2xl font-black text-slate-900 text-center">What's your activity level?</h1>

            <div className="space-y-3">
              {[
                { id: 'Sedentary', label: 'Sedentary', emoji: '👨‍💻' },
                { id: 'Lightly active', label: 'Lightly active', emoji: '🚶' },
                { id: 'Moderately active', label: 'Moderately active', emoji: '🏃' },
                { id: 'Very active', label: 'Very active', emoji: '🥰' }
              ].map(a => (
                <div
                  key={a.id}
                  onClick={() => setActivityLevel(a.id)}
                  className={`p-4 rounded-2xl cursor-pointer font-black text-sm flex items-center gap-4 transition-all ${
                    activityLevel === a.id 
                      ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 7: WEEKLY GOAL SETUP (Screenshot 7) ───────────────────── */}
        {step === 7 && (
          <div className="space-y-6 animate-fade-in my-auto text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Set your weekly goal</h1>
              <p className="text-slate-500 text-xs font-semibold">We recommend training at least 3 days weekly for a better result.</p>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 block">🎯 Weekly training days</span>
              <div className="flex justify-between gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    onClick={() => setWeeklyDays(num)}
                    className={`flex-1 py-3 rounded-2xl font-black text-base transition-all ${
                      weeklyDays === num 
                        ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <span className="text-xs font-bold text-slate-700 block">🗓️ First day of week</span>
              <div className="relative max-w-xs mx-auto">
                <select
                  value={firstDay}
                  onChange={e => setFirstDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 font-black text-slate-900 text-center uppercase tracking-wider outline-none"
                >
                  <option value="SUNDAY">SUNDAY</option>
                  <option value="MONDAY">MONDAY</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 8: RULER PICKER WEIGHT & HEIGHT (Screenshot 8) ──────────── */}
        {step === 8 && (
          <div className="space-y-6 animate-fade-in my-auto">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-slate-900">Let us know you better</h1>
              <p className="text-slate-500 text-xs font-semibold">Let us know you better to help boost your workout results</p>
            </div>

            {/* Weight Picker */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-slate-900">Weight</span>
                <div className="flex bg-slate-200 p-0.5 rounded-xl text-xs font-bold">
                  <button onClick={() => setWeightUnit('kg')} className={`px-3 py-1 rounded-lg ${weightUnit === 'kg' ? 'bg-[#0052ff] text-white' : 'text-slate-600'}`}>kg</button>
                  <button onClick={() => setWeightUnit('lbs')} className={`px-3 py-1 rounded-lg ${weightUnit === 'lbs' ? 'bg-[#0052ff] text-white' : 'text-slate-600'}`}>lbs</button>
                </div>
              </div>

              <div className="text-center py-2">
                <span className="text-4xl font-black text-[#0052ff] font-mono">{weightValue.toFixed(1)}</span>
                <span className="text-slate-500 font-bold text-sm ml-1">{weightUnit}</span>
              </div>

              {/* Ruler simulation */}
              <div className="flex justify-between items-end px-4 text-xs font-mono text-slate-400">
                <span>163</span>
                <span>164</span>
                <span className="text-base font-black text-[#0052ff] border-x-2 border-[#0052ff] px-3 py-1">165</span>
                <span>166</span>
                <span>167</span>
              </div>
            </div>

            {/* Height Picker */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-slate-900">Height</span>
                <div className="flex bg-slate-200 p-0.5 rounded-xl text-xs font-bold">
                  <button onClick={() => setHeightUnit('cm')} className={`px-3 py-1 rounded-lg ${heightUnit === 'cm' ? 'bg-[#0052ff] text-white' : 'text-slate-600'}`}>cm</button>
                  <button onClick={() => setHeightUnit('ft')} className={`px-3 py-1 rounded-lg ${heightUnit === 'ft' ? 'bg-[#0052ff] text-white' : 'text-slate-600'}`}>ft</button>
                </div>
              </div>

              <div className="text-center py-2">
                <span className="text-4xl font-black text-[#0052ff] font-mono">{heightFt} <span className="text-lg">ft</span> {heightIn} <span className="text-lg">in</span></span>
              </div>

              <div className="flex justify-between items-end px-4 text-xs font-mono text-slate-400">
                <span>4</span>
                <span className="text-base font-black text-[#0052ff] border-x-2 border-[#0052ff] px-3 py-1">5</span>
                <span>6</span>
                <span>7</span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 9: GENERATING PLAN LOADER (Screenshot 9) ───────────────── */}
        {step === 9 && (
          <div className="py-12 text-center space-y-8 animate-fade-in my-auto">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">GENERATING THE PLAN FOR YOU</h1>
              <p className="text-slate-500 text-xs font-semibold">Preparing your plan based on your goal...</p>
            </div>

            {/* Giant Circular 100% Loader */}
            <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="104" cy="104" r="88" stroke="#e2e8f0" strokeWidth="16" fill="transparent" />
                <circle
                  cx="104"
                  cy="104"
                  r="88"
                  stroke="#0052ff"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray="552"
                  strokeDashoffset={552 - (552 * (genProgress / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              <span className="absolute text-4xl font-black text-slate-900 font-mono">{genProgress}%</span>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-700 max-w-xs mx-auto text-left">
              <div className="flex items-center gap-2 text-[#0052ff]">
                <Check size={16} /> <span>Select targeted workout: <b>{focusArea}</b></span>
              </div>
              {genProgress >= 80 && (
                <div className="flex items-center gap-2 text-[#0052ff] animate-fade-in">
                  <Check size={16} /> <span>Your personalized plan is ready!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 10: "YOUR PLAN IS READY!" CARD (Screenshot 10) ─────────── */}
        {step === 10 && (
          <div className="space-y-6 text-center animate-fade-in my-auto">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-[#0052ff] flex items-center justify-center text-4xl mx-auto shadow-md">
              👨‍🏽‍💼
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Your plan is ready!</h1>
              <p className="text-slate-500 text-xs font-semibold">We have selected this plan that suits you best</p>
            </div>

            {/* Giant Customized Plan Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0052ff] to-[#0033cc] text-white text-left space-y-5 shadow-2xl relative overflow-hidden">
              <span className="bg-amber-300 text-slate-900 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                CUSTOMIZED FOR YOU
              </span>

              <h2 className="text-2xl font-black tracking-tight leading-tight">FULL BODY FAT BURN</h2>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <span>📅</span>
                  <div>
                    <b className="block">8-23 Min</b>
                    <span className="text-[9px] opacity-80">Daily Time</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <span>📊</span>
                  <div>
                    <b className="block">{pushups}</b>
                    <span className="text-[9px] opacity-80">Level</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <span>🎯</span>
                  <div>
                    <b className="block">{focusArea}</b>
                    <span className="text-[9px] opacity-80">Target area</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <span>☑️</span>
                  <div>
                    <b className="block">No Equipment</b>
                    <span className="text-[9px] opacity-80">Equipment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Button */}
        {step !== 9 && (
          <div className="pt-4 bg-white sticky bottom-0 z-20">
            {step < 10 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="w-full py-4 rounded-full bg-[#0052ff] text-white font-black text-base shadow-xl shadow-blue-500/30 hover:bg-blue-600 transition-all uppercase tracking-wider"
              >
                NEXT
              </button>
            ) : (
              <button
                onClick={handleFinishOnboarding}
                className="w-full py-4 rounded-full bg-[#0052ff] text-white font-black text-base shadow-xl shadow-blue-500/30 hover:bg-blue-600 transition-all uppercase tracking-wider"
              >
                START DAY 1 →
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
