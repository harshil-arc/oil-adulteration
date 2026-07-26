import { useState } from 'react';
import { 
  Heart, Package, Truck, Calendar, Clock, CheckCircle2, 
  X, ChevronRight, ChevronLeft, MapPin, Phone, Navigation, ShieldCheck, Sparkles 
} from 'lucide-react';
import { dispatchReliefDonation } from '../services/reliefCoordinationService';

const DONATION_TYPES = [
  { id: 'Cooked Food', label: 'Cooked Food', icon: '🍲', desc: 'Ready-to-eat hot meal packets' },
  { id: 'Dry Food', label: 'Dry Ration', icon: '🌾', desc: 'Rice, wheat flour, lentils, oil' },
  { id: 'Water', label: 'Drinking Water', icon: '💧', desc: 'Packaged water bottles / cans' },
  { id: 'Medicines', label: 'Medical & First Aid', icon: '💊', desc: 'Antiseptics, ORS, bandage kits' },
  { id: 'Clothes', label: 'Clothes & Wearables', icon: '👕', desc: 'Clean adult & children clothes' },
  { id: 'Blankets', label: 'Blankets & Tarpaulins', icon: '🛋️', desc: 'Thermal blankets, mats, tarps' },
  { id: 'Baby Food', label: 'Baby Food & Milk', icon: '🍼', desc: 'Infant milk powder, cereals' },
  { id: 'Other', label: 'Other Essential Supplies', icon: '📦', desc: 'Hygiene, solar lights, soap' }
];

export default function DonationWizardModal({ isOpen, onClose, targetItem, emergency }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedDonation, setConfirmedDonation] = useState(null);

  // Form State
  const [itemType, setItemType] = useState('Dry Food');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState('kg');
  const [deliveryMethod, setDeliveryMethod] = useState('self_delivery'); // 'self_delivery' | 'doorstep_pickup'
  const [pickupAddress, setPickupAddress] = useState('');
  const [dateSlot, setDateSlot] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');

  if (!isOpen) return null;

  const targetName = targetItem?.name || targetItem?.title || 'Assam Flood Relief Camp';
  const targetType = targetItem?.type || 'NGO';
  const targetAddress = targetItem?.address || 'Near Emergency Relief Sector';
  const targetPhone = targetItem?.contactNumber || '+91 98765 43210';
  const targetLat = targetItem?.latitude || 26.1445;
  const targetLng = targetItem?.longitude || 91.7362;

  const handleNext = () => {
    if (step === 2 && (!quantity || Number(quantity) <= 0)) {
      alert('Please enter a valid donation quantity.');
      return;
    }
    if (step === 3 && deliveryMethod === 'doorstep_pickup' && !pickupAddress.trim()) {
      alert('Please enter your pickup address.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = {
        emergencyId: emergency?.id || 'emg-assam-floods-2026',
        targetName,
        targetType,
        itemCategory: itemType,
        quantity,
        unit,
        deliveryMethod,
        pickupAddress,
        dateSlot,
        timeSlot,
        donorName: donorName || 'Generous Donor',
        donorPhone: donorPhone || '+91 98765 43210'
      };

      const res = await dispatchReliefDonation(payload);
      if (res.success) {
        setConfirmedDonation(res.donation);
        setStep(5); // Confirmation screen
      }
    } catch (e) {
      alert('Error submitting donation request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Heart className="text-rose-400" size={20} />
            <div>
              <h3 className="text-sm font-black text-white">Relief Donation Dispatch</h3>
              <p className="text-[10px] text-gray-400">Direct Delivery to {targetName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator Bar */}
        {step < 5 && (
          <div className="px-6 pt-4 bg-[var(--bg-elevated)]/50 border-b border-[var(--border-color)] pb-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
              <span className={step >= 1 ? 'text-amber-400' : ''}>1. Item</span>
              <span className={step >= 2 ? 'text-amber-400' : ''}>2. Quantity</span>
              <span className={step >= 3 ? 'text-amber-400' : ''}>3. Delivery</span>
              <span className={step >= 4 ? 'text-amber-400' : ''}>4. Schedule</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: SELECT DONATION TYPE ── */}
        {step === 1 && (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Step 1: Select Donation Type</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Choose the category of supplies you are contributing</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DONATION_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setItemType(type.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                    itemType === type.id 
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow-amber' 
                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{type.icon}</span>
                    {itemType === type.id && <CheckCircle2 size={16} className="text-amber-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight">{type.label}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] transition-transform"
            >
              Continue to Quantity <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: ENTER QUANTITY ── */}
        {step === 2 && (
          <div className="p-5 space-y-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Step 2: Enter Quantity</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Specify how much {itemType} you are donating</p>
            </div>

            <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Quantity & Unit
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 bg-[#1c1c1c] border border-[var(--border-color)] text-white text-lg font-black font-mono p-3.5 rounded-xl focus:border-amber-500 outline-none"
                  placeholder="Enter amount"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-28 bg-[#1c1c1c] border border-[var(--border-color)] text-amber-400 font-bold text-xs p-3.5 rounded-xl focus:border-amber-500 outline-none"
                >
                  <option value="kg">kilograms (kg)</option>
                  <option value="liters">liters (L)</option>
                  <option value="packets">packets</option>
                  <option value="boxes">boxes / crates</option>
                  <option value="units">units / sets</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleBack} className="py-3.5 px-5 bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl hover:bg-gray-700">
                Back
              </button>
              <button onClick={handleNext} className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
                Next: Delivery Method <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PICKUP OR SELF DELIVERY ── */}
        {step === 3 && (
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Step 3: Pickup or Self Delivery</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">How would you like to transfer the donation?</p>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => setDeliveryMethod('self_delivery')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === 'self_delivery' 
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow-amber' 
                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5">
                  <Navigation size={18} className="rotate-45" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white">Self Delivery to Center</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5">I will personally drop off the supplies at the collection point / camp.</p>
                  <p className="text-[10px] text-amber-300 font-mono mt-1">📍 {targetAddress}</p>
                </div>
              </div>

              <div 
                onClick={() => setDeliveryMethod('doorstep_pickup')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryMethod === 'doorstep_pickup' 
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow-amber' 
                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5">
                  <Truck size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white">Request NGO Doorstep Pickup</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5">An NGO volunteer vehicle will pick up supplies from your home/office.</p>
                </div>
              </div>
            </div>

            {deliveryMethod === 'doorstep_pickup' && (
              <div className="space-y-1.5 animate-fade-in pt-1">
                <label className="block text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">Pickup Address</label>
                <input
                  type="text"
                  placeholder="House #, Street Name, Landmark, City..."
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={handleBack} className="py-3.5 px-5 bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl hover:bg-gray-700">
                Back
              </button>
              <button onClick={handleNext} className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
                Next: Select Date & Time <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: SELECT DATE & TIME SLOT ── */}
        {step === 4 && (
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Step 4: Select Date & Time Slot</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Schedule when the transfer should take place</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-300 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={dateSlot}
                  onChange={(e) => setDateSlot(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-300 uppercase tracking-wider mb-1">Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-amber-400 font-bold text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
                >
                  <option value="08:00 AM - 11:00 AM">08:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 02:00 PM">11:00 AM - 02:00 PM</option>
                  <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                  <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">Contact Information</label>
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
              />
              <input
                type="tel"
                placeholder="Mobile Number for Coordinator SMS"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button onClick={handleBack} className="py-3.5 px-5 bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl hover:bg-gray-700">
                Back
              </button>
              <button
                onClick={handleFinalConfirm}
                disabled={submitting}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <Heart size={16} /> Confirm & Dispatch Donation
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: CONFIRMATION & GOOGLE MAPS DIRECTIONS ── */}
        {step === 5 && confirmedDonation && (
          <div className="p-6 text-center space-y-5 animate-scale-in">
            <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-400 shadow-glow-amber">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Donation Request Dispatched
              </span>
              <h3 className="text-xl font-black text-white mt-2">Thank You for Your Support!</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">
                Your donation request has been transmitted directly to <strong>{targetName}</strong>.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Donation ID:</span>
                <span className="text-amber-400 font-bold">{confirmedDonation.donationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Item & Quantity:</span>
                <span className="text-white font-bold">{confirmedDonation.quantity} {confirmedDonation.unit} of {confirmedDonation.itemCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scheduled:</span>
                <span className="text-emerald-400 font-bold">{confirmedDonation.dateSlot} ({confirmedDonation.timeSlot})</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${targetLat},${targetLng}`, '_blank')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <Navigation size={16} className="rotate-45" /> Navigate to Delivery Point
              </button>

              <button onClick={onClose} className="w-full py-3 bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl hover:bg-gray-700">
                Close Wizard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
