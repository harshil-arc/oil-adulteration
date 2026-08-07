import { useState } from 'react';
import { ArrowLeft, Check, Sparkles, X, Shield, Globe } from 'lucide-react';
import { saveFitnessPreferences, DEFAULT_PREFERENCES } from '../../services/fitness/fitnessStorage';

export default function FitnessSetupFlow({ isOpen, onClose, currentPreferences, onSavePreferences }) {
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState(currentPreferences?.experience || 'Beginner');
  const [mainGoal, setMainGoal] = useState(currentPreferences?.mainGoal || 'General fitness');
  const [equipment, setEquipment] = useState(currentPreferences?.equipment || ['body weight']);
  const [workoutDays, setWorkoutDays] = useState(currentPreferences?.workoutDays || 3);
  const [durationMinutes, setDurationMinutes] = useState(currentPreferences?.durationMinutes || 30);
  const [preferredAreas, setPreferredAreas] = useState(currentPreferences?.preferredAreas || ['full body', 'chest', 'back', 'legs', 'waist']);
  const [language, setLanguage] = useState(currentPreferences?.language || 'en');

  if (!isOpen) return null;

  const toggleEquipmentItem = (item) => {
    if (equipment.includes(item)) {
      if (equipment.length === 1) return; // Must have at least 1
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const toggleAreaItem = (area) => {
    if (preferredAreas.includes(area)) {
      if (preferredAreas.length === 1) return;
      setPreferredAreas(preferredAreas.filter(a => a !== area));
    } else {
      setPreferredAreas([...preferredAreas, area]);
    }
  };

  const handleFinishSetup = () => {
    const newPrefs = {
      experience,
      mainGoal,
      equipment,
      workoutDays,
      durationMinutes,
      preferredAreas,
      language,
      isConfigured: true
    };
    saveFitnessPreferences(newPrefs);
    onSavePreferences(newPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-slate-100 font-sans">
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl max-w-lg w-full my-auto overflow-hidden shadow-2xl p-6 space-y-6">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep(prev => prev - 1)} className="p-1 text-gray-400 hover:text-white">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <span className="text-[10px] font-black uppercase text-[#0052ff] tracking-widest block">Personal Setup • Step {step} of 5</span>
              <h3 className="text-lg font-black text-white">Fitness Recommendation Setup</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* ── STEP 1: EXPERIENCE LEVEL ────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="font-extrabold text-white text-base">What is your current fitness experience?</h4>
            <div className="space-y-3">
              {[
                { id: 'Beginner', title: 'Beginner', desc: 'New to exercise or returning after a break' },
                { id: 'Intermediate', title: 'Intermediate', desc: 'Exercise regularly 2-3 times per week' },
                { id: 'Advanced', title: 'Advanced', desc: 'Consistent training with good movement form' }
              ].map(exp => (
                <div
                  key={exp.id}
                  onClick={() => setExperience(exp.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                    experience === exp.id ? 'border-[#0052ff] bg-[#0052ff]/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-white text-sm">{exp.title}</h5>
                    <p className="text-xs text-gray-400 mt-0.5">{exp.desc}</p>
                  </div>
                  {experience === exp.id && <div className="w-5 h-5 rounded-full bg-[#0052ff] text-white flex items-center justify-center text-xs">✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: HEALTHY OBJECTIVE ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-base">What is your primary fitness objective?</h4>
              <p className="text-xs text-gray-400">Our engine focuses strictly on healthy activity, movement, and wellness.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'General fitness', title: 'General Fitness', icon: '🌱' },
                { id: 'Strength', title: 'Functional Strength', icon: '💪' },
                { id: 'Mobility', title: 'Mobility & Flexibility', icon: '🧘' },
                { id: 'Endurance', title: 'Stamina & Endurance', icon: '🏃' }
              ].map(g => (
                <div
                  key={g.id}
                  onClick={() => setMainGoal(g.id)}
                  className={`p-4 rounded-2xl border cursor-pointer text-center space-y-2 transition-all ${
                    mainGoal === g.id ? 'border-[#0052ff] bg-[#0052ff]/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <span className="text-3xl block">{g.icon}</span>
                  <h5 className="font-bold text-white text-xs">{g.title}</h5>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: EQUIPMENT SELECTION ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-base">Select your available equipment</h4>
              <p className="text-xs text-gray-400">Exercises requiring unselected gear will be automatically filtered out.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'body weight', label: 'Body Weight (No Equipment)' },
                { id: 'dumbbell', label: 'Dumbbells' },
                { id: 'barbell', label: 'Barbell' },
                { id: 'band', label: 'Resistance Bands' },
                { id: 'cable', label: 'Cable Machine' },
                { id: 'kettlebell', label: 'Kettlebell' },
                { id: 'leverage machine', label: 'Gym Machines' }
              ].map(eq => {
                const isSelected = equipment.includes(eq.id);
                return (
                  <div
                    key={eq.id}
                    onClick={() => toggleEquipmentItem(eq.id)}
                    className={`p-3 rounded-2xl border cursor-pointer font-bold text-xs flex items-center justify-between transition-all ${
                      isSelected ? 'border-[#0052ff] bg-[#0052ff]/10 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <span>{eq.label}</span>
                    {isSelected && <Check size={14} className="text-[#0052ff]" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 4: FREQUENCY & DURATION ───────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <label className="font-bold text-white text-sm block">Days per week</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    onClick={() => setWorkoutDays(num)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      workoutDays === num ? 'bg-[#0052ff] text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="font-bold text-white text-sm block">Workout duration target</label>
              <div className="grid grid-cols-2 gap-2">
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-3 rounded-xl font-bold text-xs transition-all ${
                      durationMinutes === mins ? 'bg-[#0052ff] text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'
                    }`}
                  >
                    ~{mins} Minutes
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: TARGET AREAS & LANGUAGE ────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <label className="font-bold text-white text-sm block">Preferred Target Body Areas</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'full body', label: 'Full Body' },
                  { id: 'chest', label: 'Chest' },
                  { id: 'back', label: 'Back' },
                  { id: 'shoulders', label: 'Shoulders' },
                  { id: 'upper arms', label: 'Arms' },
                  { id: 'upper legs', label: 'Legs' },
                  { id: 'waist', label: 'Core / Waist' },
                  { id: 'cardio', label: 'Cardio' }
                ].map(area => {
                  const isSelected = preferredAreas.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleAreaItem(area.id)}
                      className={`p-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-between ${
                        isSelected ? 'bg-[#0052ff] text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'
                      }`}
                    >
                      <span>{area.label}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-800 pt-3">
              <label className="font-bold text-white text-xs block">Instructions Language</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${language === 'en' ? 'bg-[#0052ff] text-white' : 'bg-gray-900 text-gray-400'}`}
                >
                  English Instructions
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${language === 'hi' ? 'bg-[#0052ff] text-white' : 'bg-gray-900 text-gray-400'}`}
                >
                  हिंदी (Hindi Guide)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 flex justify-between">
          <div />
          {step < 5 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="py-2.5 px-6 rounded-xl bg-[#0052ff] text-white font-bold text-xs hover:bg-blue-600 transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinishSetup}
              className="py-2.5 px-6 rounded-xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition-all shadow-lg"
            >
              Generate My Plan ✨
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
