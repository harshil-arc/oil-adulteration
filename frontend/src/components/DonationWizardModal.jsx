import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Heart, X, CheckCircle2, AlertTriangle, Sparkles, Camera, 
  MapPin, Clock, ShieldCheck, Award, User, Phone, Building, Truck, Zap,
  Bike, ArrowRight, Activity, Info, Check, AlertCircle, FileText
} from 'lucide-react';
import { 
  calculateTransparentXaiScore, 
  calculatePreDonationImpact, 
  getVolunteerDetails, 
  getDeliveryTimeline,
  getNgos 
} from '../services/foodRedistributionService';

export default function DonationWizardModal({ isOpen, onClose, onDonationComplete }) {
  const [step, setStep] = useState(1);

  // Step 1: Donor Details
  const [donorType, setDonorType] = useState('Restaurant');
  const [donorName, setDonorName] = useState('Hotel Taj Palace Banquets');
  const [phone, setPhone] = useState('+91 98200 44556');
  const [email, setEmail] = useState('banquets@tajpalace.com');
  const [orgName, setOrgName] = useState('Taj Palace Group');
  const [linkOilScan, setLinkOilScan] = useState(true);

  // Step 2: Food Details
  const [foodCategory, setFoodCategory] = useState('Prepared Meals');
  const [vegNonVeg, setVegNonVeg] = useState('Vegetarian');
  const [foodPreparedOrPackaged, setFoodPreparedOrPackaged] = useState('Prepared Food');
  const [quantityKg, setQuantityKg] = useState('25 kg');
  const [mealsCount, setMealsCount] = useState(60);
  const [prepHoursAgo, setPrepHoursAgo] = useState(2);
  const [safeHoursRemaining, setSafeHoursRemaining] = useState(6);
  const [storageMethod, setStorageMethod] = useState('Sealed Stainless Steel Containers');
  const [isRefrigerated, setIsRefrigerated] = useState(true);
  const [foodImage, setFoodImage] = useState(null);

  // Step 3: Pickup Info
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Mumbai Suburban');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('Bandra Kurla Complex, Bandra East');
  const [pickupWindow, setPickupWindow] = useState('Within 45 Minutes');
  const [contactPerson, setContactPerson] = useState('Rajesh Verma (Events Manager)');

  // Step 4 & 5 Calculated State
  const [xaiResult, setXaiResult] = useState(null);
  const [volunteerMode, setVolunteerMode] = useState('demo'); // 'demo' or 'production'
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [trackingId] = useState(() => `DON-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const preImpact = calculatePreDonationImpact(mealsCount);
  const volunteer = getVolunteerDetails(volunteerMode);
  const timeline = getDeliveryTimeline(trackingId);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoodImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiVerification = () => {
    const ngos = getNgos();
    const bestNgo = ngos[0] || { distanceKm: 2.4 };

    const result = calculateTransparentXaiScore(
      {
        prepHoursAgo,
        safeHoursRemaining,
        storageMethod,
        isRefrigerated,
        hasPhotos: Boolean(foodImage),
        mealsCount,
      },
      bestNgo
    );
    setXaiResult(result);
    setStep(4);
  };

  const handleFinalSubmit = () => {
    setStep(5);
    if (onDonationComplete) {
      onDonationComplete({
        trackingId,
        donorName,
        foodCategory,
        mealsCount,
        ngoName: 'Roti Bank Foundation',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Heart className="text-pink-400" size={20} />
            <div>
              <h3 className="text-sm font-black text-white">Donation Quality Assessment Engine</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Explainable Food Safety & Distribution Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="px-5 pt-4 bg-[var(--bg-card)]">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
            {['1. Donor', '2. Food', '3. Pickup', '4. XAI Engine', '5. Delivery Workflow'].map((label, idx) => (
              <div
                key={label}
                className={`py-1.5 rounded-lg border transition-all ${
                  step === idx + 1
                    ? 'bg-[#d4af37] text-black font-black border-[#d4af37] shadow-glow-gold'
                    : step > idx + 1
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 border-gray-700'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5">

          {/* STEP 1: DONOR DETAILS & SENSOR HARDWARE INTEGRATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#d4af37]">Step 1: Donor & Organization Details</h4>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Donor Classification</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] font-bold">
                  {['Restaurant', 'Hotel', 'Marriage Hall', 'Corporate', 'Household', 'Individual'].map(t => (
                    <button
                      key={t}
                      onClick={() => setDonorType(t)}
                      className={`p-2 rounded-xl border transition-all ${
                        donorType === t ? 'bg-[#d4af37] text-black font-black border-[#d4af37]' : 'bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Donor Name *</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* FOOD 360 HARDWARE INTEGRATION LINK */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-extrabold text-emerald-400 block">Food 360 Sensor Verification</span>
                    <span className="text-gray-300 text-[11px]">Oil Purity: <span className="font-mono font-bold text-white">97.4%</span> • Confidence: <span className="font-mono font-bold text-purple-400">98.2%</span></span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={linkOilScan}
                  onChange={e => setLinkOilScan(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <button onClick={() => setStep(2)} className="btn-primary py-3 w-full text-xs font-black">
                Next: Food Specifications & Impact Preview →
              </button>
            </div>
          )}

          {/* STEP 2: FOOD DETAILS & PRE-DONATION IMPACT SIMULATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#d4af37]">Step 2: Food Safety Specifications</h4>

              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  onClick={() => setVegNonVeg('Vegetarian')}
                  className={`p-2.5 rounded-xl border ${vegNonVeg === 'Vegetarian' ? 'bg-emerald-500 text-black font-black border-emerald-400' : 'bg-[var(--bg-elevated)] text-gray-400'}`}
                >
                  🟢 Vegetarian
                </button>
                <button
                  onClick={() => setVegNonVeg('Non-Vegetarian')}
                  className={`p-2.5 rounded-xl border ${vegNonVeg === 'Non-Vegetarian' ? 'bg-red-500 text-white font-black border-red-400' : 'bg-[var(--bg-elevated)] text-gray-400'}`}
                >
                  🔴 Non-Veg
                </button>
                <button
                  onClick={() => setFoodPreparedOrPackaged(foodPreparedOrPackaged === 'Prepared Food' ? 'Packaged Food' : 'Prepared Food')}
                  className="p-2.5 rounded-xl border bg-[var(--bg-elevated)] text-gray-300 border-[var(--border-color)]"
                >
                  📦 {foodPreparedOrPackaged}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Approx Meals</label>
                  <input
                    type="number"
                    value={mealsCount}
                    onChange={e => setMealsCount(Number(e.target.value))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Weight (kg)</label>
                  <input
                    type="text"
                    value={quantityKg}
                    onChange={e => setQuantityKg(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Prep Time (hrs ago)</label>
                  <input
                    type="number"
                    value={prepHoursAgo}
                    onChange={e => setPrepHoursAgo(Number(e.target.value))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Safe Hours Left</label>
                  <input
                    type="number"
                    value={safeHoursRemaining}
                    onChange={e => setSafeHoursRemaining(Number(e.target.value))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* PRE-DONATION IMPACT SIMULATION PREVIEW (STEP 20) */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <span className="text-[10px] text-[#d4af37] font-extrabold uppercase tracking-widest block">Pre-Donation Impact Simulation</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] text-gray-400 block">Beneficiaries</span>
                    <span className="font-black text-white">{preImpact.beneficiaries} People</span>
                  </div>
                  <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] text-gray-400 block">Food Saved</span>
                    <span className="font-black text-emerald-400">{preImpact.foodSavedKg} kg</span>
                  </div>
                  <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] text-gray-400 block">CO₂ Saved</span>
                    <span className="font-black text-blue-400">{preImpact.co2SavedKg} kg</span>
                  </div>
                  <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] text-gray-400 block">Water Saved</span>
                    <span className="font-black text-purple-400">{preImpact.waterSavedL} L</span>
                  </div>
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Food Photo Proof</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <div onClick={() => fileInputRef.current?.click()} className="p-3 bg-[var(--bg-elevated)] rounded-2xl border border-dashed border-gray-700 text-center cursor-pointer hover:border-[#d4af37]">
                  {foodImage ? (
                    <img src={foodImage} alt="Food Proof" className="h-16 mx-auto object-cover rounded-xl" />
                  ) : (
                    <div className="space-y-1">
                      <Camera size={18} className="mx-auto text-[#d4af37]" />
                      <span className="text-xs font-bold text-gray-300 block">Upload Food Photo Proof</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-secondary py-3 flex-1 text-xs font-bold">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary py-3 flex-1 text-xs font-black">
                  Next: Pickup Location →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PICKUP INFORMATION */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#d4af37]">Step 3: Pickup Address & Time Window</h4>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">District</label>
                  <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">State</label>
                  <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Full Pickup Address *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Pickup Time Window</label>
                  <select value={pickupWindow} onChange={e => setPickupWindow(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white font-bold">
                    <option>Within 30 Minutes</option>
                    <option>Within 45 Minutes</option>
                    <option>Within 1 Hour</option>
                    <option>Within 2 Hours</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">On-Site Contact Person</label>
                  <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="btn-secondary py-3 flex-1 text-xs font-bold">
                  ← Back
                </button>
                <button onClick={handleRunAiVerification} className="btn-primary py-3 flex-1 text-xs font-black">
                  Run Explainable AI Assessment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: EXPLAINABLE AI (XAI) DONATION QUALITY ASSESSMENT ENGINE */}
          {step === 4 && xaiResult && (
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                    <Sparkles size={16} /> Donation Quality Assessment Engine
                  </h4>
                  <p className="text-[10px] text-gray-400">Explainable Food Safety & Distribution Intelligence</p>
                </div>
                <button
                  onClick={() => setDecisionModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold text-[11px] hover:bg-purple-500/20"
                >
                  View Decision Process →
                </button>
              </div>

              {/* Transparent Score & Recommendation Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-[var(--bg-elevated)] to-[#d4af37]/10 p-5 rounded-2xl border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Donation Quality Score</span>
                    <h3 className="text-4xl font-black text-emerald-400 font-mono">{xaiResult.score} / 100</h3>
                    <span className="text-xs font-extrabold text-[#d4af37]">{xaiResult.grade}</span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl inline-block border ${xaiResult.riskColor}`}>
                      {xaiResult.recommendation}
                    </span>
                    <p className="text-[10px] text-emerald-400 font-bold">Risk Level: {xaiResult.riskLevel}</p>
                  </div>
                </div>
              </div>

              {/* STEP 3: "WHY THIS SCORE?" EXPLAINABLE BREAKDOWN */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Why this score? (Factor Point Breakdown)</h5>
                <div className="space-y-1 text-xs">
                  {xaiResult.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-gray-800/50 last:border-none">
                      <span className="text-gray-300">• {item.factor}</span>
                      <span className="font-mono font-bold text-emerald-400">+{item.points} pts</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-black text-white">
                    <span>Total Calculated Score</span>
                    <span className="font-mono text-emerald-400 text-sm">={xaiResult.score}</span>
                  </div>
                </div>
              </div>

              {/* STEP 4: CONFIDENCE LEVEL & REASON */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">AI Confidence Level</span>
                  <span className="font-mono font-black text-purple-400 text-lg">{xaiResult.confidenceScore}%</span>
                </div>
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Confidence Rationale</span>
                  <p className="text-[10px] text-gray-300">{xaiResult.confidenceReason}</p>
                </div>
              </div>

              {/* STEP 9: TECHNICAL HONESTY DISCLAIMER */}
              <p className="text-[10px] text-gray-400 italic bg-gray-900/60 p-2.5 rounded-xl border border-gray-800 text-center">
                "{xaiResult.engineNotice}"
              </p>

              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="btn-secondary py-3 flex-1 text-xs font-bold">
                  ← Back
                </button>
                <button onClick={handleFinalSubmit} className="btn-primary py-3 flex-1 text-xs font-black">
                  Confirm & Submit Donation →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION & LIVE 8-STAGE DELIVERY WORKFLOW */}
          {step === 5 && (
            <div className="space-y-5">
              
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-white">Donation Active & Broadcasted!</h3>
                <p className="text-xs text-gray-300">Tracking ID: <span className="font-mono text-[#d4af37] font-bold">{trackingId}</span></p>
              </div>

              {/* STEP 10: LIVE 8-STAGE DELIVERY WORKFLOW TIMELINE */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                <h5 className="text-xs font-black text-[#d4af37] uppercase tracking-wider">Live Delivery Workflow Timeline</h5>
                <div className="space-y-2 text-xs">
                  {timeline.map((t) => (
                    <div key={t.step} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        t.status === 'Completed' ? 'bg-emerald-500 text-black' :
                        t.status === 'In Progress' ? 'bg-amber-500 text-black animate-pulse' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {t.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-white">{t.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{t.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 11 & 12: VOLUNTEER ASSIGNMENT CARD */}
              <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">Assigned Logistics Volunteer:</span>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {volunteer.badgeLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-white">{volunteer.name}</h4>
                    <p className="text-xs text-gray-400">{volunteer.vehicle} • {volunteer.distance}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
                    ETA {volunteer.eta}
                  </span>
                </div>
              </div>

              {/* STEP 16: POST-DONATION IMPACT DASHBOARD */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)]">
                  <span className="text-[9px] text-gray-400 block">Meals Provided</span>
                  <span className="font-mono font-black text-pink-400 text-base">{preImpact.meals} Meals</span>
                </div>
                <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)]">
                  <span className="text-[9px] text-gray-400 block">Food Waste Reduced</span>
                  <span className="font-mono font-black text-emerald-400 text-base">{preImpact.foodSavedKg} kg</span>
                </div>
                <div className="bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)]">
                  <span className="text-[9px] text-gray-400 block">CO₂ Saved</span>
                  <span className="font-mono font-black text-blue-400 text-base">{preImpact.co2SavedKg} kg</span>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto block text-center">
                <QRCodeSVG value={`https://spectratrust.org/track/${trackingId}`} size={110} />
              </div>

              <button onClick={onClose} className="btn-primary py-3.5 w-full text-xs font-black">
                Return to Emergency Response Hub
              </button>
            </div>
          )}

        </div>

      </div>

      {/* STEP 5: INTERACTIVE "VIEW DECISION PROCESS" PIPELINE MODAL */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-purple-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">Explainable AI Decision Pipeline</h4>
              <button onClick={() => setDecisionModalOpen(false)} className="p-1.5 rounded-full bg-gray-800 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { step: '1. Input Data', desc: 'Prep time, shelf-life, storage, refrigeration & photo proof parsed' },
                { step: '2. Rule Engine', desc: 'Weighted factor scoring algorithm applied (30% + 25% + 15% + 10% + 10% + 5% + 5%)' },
                { step: '3. Food Quality Assessment', desc: `Calculated Quality Score: ${xaiResult?.score} / 100 (${xaiResult?.grade})` },
                { step: '4. NGO Matching', desc: 'Spatial distance & capacity scoring selected Roti Bank Foundation (2.4 km)' },
                { step: '5. Route Optimization', desc: 'EV Bike volunteer route calculated for 18 min dispatch' },
                { step: '6. Final Recommendation', desc: xaiResult?.recommendation },
              ].map((node, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
                  <span className="font-extrabold text-white block">{node.step}</span>
                  <span className="text-[11px] text-gray-400">{node.desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setDecisionModalOpen(false)} className="btn-primary py-2.5 w-full text-xs font-black">
              Close Decision Pipeline
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
