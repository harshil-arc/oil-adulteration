import { useState } from 'react';
import { Building, X, CheckCircle2, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export default function NgoRequestModal({ isOpen, onClose, onRequestSubmitted }) {
  const [orgName, setOrgName] = useState('Roti Bank Foundation');
  const [verificationId, setVerificationId] = useState('FSSAI-NGO-88492');
  const [govtRegNum, setGovtRegNum] = useState('GOVT-REG-2024-8842');
  const [isGovtVerified, setIsGovtVerified] = useState(true);
  const [disasterType, setDisasterType] = useState('Monsoon Flood Relief');
  const [urgency, setUrgency] = useState('CRITICAL');
  const [mealsNeeded, setMealsNeeded] = useState(150);
  const [foodType, setFoodType] = useState('Cooked Meals (Rice & Dal)');
  const [beneficiaries, setBeneficiaries] = useState(150);
  const [address, setAddress] = useState('BMC Shelter Camp, Kurla East');
  const [city, setCity] = useState('Mumbai');
  const [contactPerson, setContactPerson] = useState('Suresh Patil');
  const [phone, setPhone] = useState('+91 98200 11223');
  const [storageCapacity, setStorageCapacity] = useState('Refrigerated Cold Room Available');

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onRequestSubmitted) {
      onRequestSubmitted({
        id: `REQ-${Date.now()}`,
        sourceType: isGovtVerified ? 'Government Advisory' : 'Manual NGO Request',
        orgName,
        verificationBadge: isGovtVerified ? 'Government Registered' : 'Awaiting Verification',
        badgeColor: isGovtVerified ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-gray-800 text-gray-400 border-gray-700',
        beneficiaries,
        mealsNeeded,
        foodTypeRequired: foodType,
        urgency,
        city,
        address,
        phone,
        createdAt: new Date().toISOString(),
        disasterTag: `🌊 ${disasterType}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden my-6">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Building className="text-emerald-400" size={18} />
            <div>
              <h3 className="text-sm font-black text-white">NGO Emergency Food Request Portal</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Government Verification & Disaster Relief</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-white">Emergency Request Posted!</h3>
            <p className="text-xs text-gray-300">
              Status: <span className="font-extrabold text-blue-400">Verified & Visible to Nearby Donors</span>
            </p>
            <button onClick={onClose} className="btn-primary py-3 w-full text-xs font-black">
              Return to Feed
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">NGO Name *</label>
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Govt Registration Number</label>
                <input type="text" value={govtRegNum} onChange={e => setGovtRegNum(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
              </div>
            </div>

            {/* STEP 18: GOVERNMENT VERIFICATION BADGE TOGGLE */}
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className={isGovtVerified ? 'text-blue-400' : 'text-gray-400'} />
                <span className="text-xs font-bold text-white">
                  {isGovtVerified ? 'Government Registered (Blue Badge Verified)' : 'Awaiting Verification (Grey Badge)'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isGovtVerified}
                onChange={e => setIsGovtVerified(e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Disaster Category</label>
                <select value={disasterType} onChange={e => setDisasterType(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white font-bold">
                  <option>Monsoon Flood Relief</option>
                  <option>Heatwave Emergency</option>
                  <option>Cyclone Preparedness</option>
                  <option>Earthquake Relief</option>
                  <option>Government Advisory</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Priority Urgency</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white font-bold">
                  <option value="CRITICAL">CRITICAL (Need under 3 hrs)</option>
                  <option value="HIGH">HIGH (Need under 6 hrs)</option>
                  <option value="MEDIUM">MEDIUM (Standard)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Meals Needed</label>
                <input type="number" value={mealsNeeded} onChange={e => setMealsNeeded(Number(e.target.value))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Food Type Required</label>
                <input type="text" value={foodType} onChange={e => setFoodType(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Delivery Location Address & Phone</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white" required />
            </div>

            <button type="submit" className="btn-primary py-3.5 w-full text-xs font-black">
              Broadcast Emergency Request →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
