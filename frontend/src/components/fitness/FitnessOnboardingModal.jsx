import { useState, useMemo } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft, Check, Dumbbell, ShieldAlert, Activity, User, Target, Compass, Heart, Moon } from 'lucide-react';
import { OPTIONS, saveFitnessProfile } from '../../services/aiFitnessEngine';

export default function FitnessOnboardingModal({ isOpen, onClose, currentProfile, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(currentProfile || {
    age: 26,
    gender: 'Male',
    height: 175,
    weight: 70,
    targetWeight: 65,
    bodyFat: 18,
    goal: 'Gain Muscle',
    experience: 'Intermediate',
    location: 'Home',
    equipment: ['Dumbbells', 'None (Bodyweight)'],
    workoutDays: 4,
    duration: 30,
    limitations: ['None'],
    occupation: 'Desk Job / Office',
    activityLevel: 'Moderately Active',
    sleepHours: 7,
    stressLevel: 'Moderate',
    preferredStyle: 'Hypertrophy & Bodybuilding',
    restDays: ['Sunday', 'Wednesday']
  });

  const calculatedBMI = useMemo(() => {
    const hM = formData.height / 100;
    if (hM <= 0) return 22.0;
    return Number((formData.weight / (hM * hM)).toFixed(1));
  }, [formData.height, formData.weight]);

  if (!isOpen) return null;

  const handleEquipmentToggle = (item) => {
    setFormData(prev => {
      const exists = prev.equipment.includes(item);
      let updated = [];
      if (exists) {
        updated = prev.equipment.filter(e => e !== item);
        if (updated.length === 0) updated = ['None (Bodyweight)'];
      } else {
        updated = [...prev.equipment, item];
      }
      return { ...prev, equipment: updated };
    });
  };

  const handleLimitationToggle = (item) => {
    setFormData(prev => {
      if (item === 'None') return { ...prev, limitations: ['None'] };
      const filtered = prev.limitations.filter(l => l !== 'None');
      const exists = filtered.includes(item);
      const updated = exists ? filtered.filter(l => l !== item) : [...filtered, item];
      return { ...prev, limitations: updated.length === 0 ? ['None'] : updated };
    });
  };

  const handleSave = () => {
    const finalProfile = { ...formData, bmi: calculatedBMI };
    saveFitnessProfile(finalProfile);
    onComplete(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">AI Personalization Wizard</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Step {step} of 5 • Dynamic Archetype Calibration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-gray-800">
          <div className="h-full bg-gradient-to-r from-[#f5c842] to-[#d4af37] transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* STEP 1: BIOMETRICS & METRICS */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <User className="text-[#d4af37]" size={18} /> Biometrics & Target Weight
                </h4>
                <p className="text-gray-400 text-[11px]">Calculates your basal metabolic rate and body composition targets.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={e => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Body Fat % (Opt)</label>
                  <input
                    type="number"
                    value={formData.bodyFat}
                    onChange={e => setFormData({ ...formData, bodyFat: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* BMI Auto Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#d4af37]/10 via-[var(--bg-elevated)] to-[#d4af37]/5 border border-[#d4af37]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">Auto BMI Calculation</span>
                  <span className="text-xl font-black text-white font-mono">{calculatedBMI} kg/m²</span>
                </div>
                <span className="bg-[#d4af37] text-black font-black text-[10px] px-3 py-1 rounded-xl">
                  {calculatedBMI < 18.5 ? 'Underweight' : calculatedBMI < 25 ? 'Normal Healthy' : calculatedBMI < 30 ? 'Overweight' : 'Obese'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: GOALS & EXPERIENCE */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <Target className="text-[#d4af37]" size={18} /> Primary Fitness Goal & Experience
                </h4>
                <p className="text-gray-400 text-[11px]">Select your core goal to calibrate rep ranges and metabolic conditioning.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OPTIONS.GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      formData.goal === g.id
                        ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-glow-gold'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xl">{g.icon}</span>
                    <div>
                      <h5 className="font-black text-white">{g.label}</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5">{g.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                <label className="text-[10px] text-gray-400 font-bold uppercase block">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {OPTIONS.EXPERIENCE.map(exp => (
                    <button
                      key={exp}
                      onClick={() => setFormData({ ...formData, experience: exp })}
                      className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                        formData.experience === exp
                          ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-glow-gold'
                          : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LIFESTYLE & RECOVERY */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <Moon className="text-[#d4af37]" size={18} /> Lifestyle, Sleep & Occupation
                </h4>
                <p className="text-gray-400 text-[11px]">The AI adjusts recovery scores and postural exercises based on daily desk work.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Occupation</label>
                  <select
                    value={formData.occupation}
                    onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  >
                    {OPTIONS.LIFESTYLE.OCCUPATION.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Sleep (Hours / Night)</label>
                  <select
                    value={formData.sleepHours}
                    onChange={e => setFormData({ ...formData, sleepHours: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  >
                    {OPTIONS.LIFESTYLE.SLEEP.map(s => (
                      <option key={s} value={s}>{s} Hours</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Daily Activity Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {OPTIONS.LIFESTYLE.ACTIVITY.map(act => (
                    <button
                      key={act}
                      onClick={() => setFormData({ ...formData, activityLevel: act })}
                      className={`py-2 px-3 rounded-xl border text-center font-bold text-[11px] ${
                        formData.activityLevel === act ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ENVIRONMENT & EQUIPMENT */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <Dumbbell className="text-[#d4af37]" size={18} /> Location & Available Equipment
                </h4>
                <p className="text-gray-400 text-[11px]">Filters exercise database to match your exact setup.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Workout Location</label>
                  <div className="flex gap-2">
                    {OPTIONS.LOCATION.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setFormData({ ...formData, location: loc })}
                        className={`flex-1 py-2.5 rounded-xl border font-bold text-center transition-all ${
                          formData.location === loc
                            ? 'bg-[#d4af37] text-black border-[#d4af37]'
                            : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Workout Duration</label>
                  <select
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  >
                    {OPTIONS.DURATIONS.map(d => (
                      <option key={d} value={d}>{d} Minutes</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase block">Equipment Available (Multi-Select)</label>
                <div className="flex flex-wrap gap-2">
                  {OPTIONS.EQUIPMENT.map(eq => {
                    const isSelected = formData.equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        onClick={() => handleEquipmentToggle(eq)}
                        className={`px-3 py-2 rounded-xl border font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-gray-400'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MEDICAL CONDITIONS & PHYSICAL LIMITATIONS */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldAlert className="text-[#d4af37]" size={18} /> Physical Limitations & Medical Safety
                </h4>
                <p className="text-gray-400 text-[11px]">The AI will strictly exclude exercises that strain painful or injured joints.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase block">Joint / Physical Limitations</label>
                <div className="flex flex-wrap gap-2">
                  {OPTIONS.LIMITATIONS.map(lim => {
                    const isSelected = formData.limitations.includes(lim);
                    return (
                      <button
                        key={lim}
                        onClick={() => handleLimitationToggle(lim)}
                        className={`px-3 py-2 rounded-xl border font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? lim === 'None'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-red-500/20 border-red-500 text-red-400'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-gray-400'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {lim}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-color)]">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Days Per Week</label>
                  <select
                    value={formData.workoutDays}
                    onChange={e => setFormData({ ...formData, workoutDays: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num} Days / Week</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Preferred Training Style</label>
                  <select
                    value={formData.preferredStyle}
                    onChange={e => setFormData({ ...formData, preferredStyle: e.target.value })}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white font-bold outline-none focus:border-[#d4af37]"
                  >
                    {OPTIONS.STYLES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="py-2.5 px-4 rounded-xl border border-[var(--border-color)] font-bold text-gray-300 flex items-center gap-1 hover:text-white"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="btn-primary py-2.5 px-5 font-black text-xs shadow-glow-gold flex items-center gap-1"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn-primary py-2.5 px-6 font-black text-xs shadow-glow-gold flex items-center gap-2"
            >
              <Sparkles size={16} /> Save & Calibrate Archetype
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
