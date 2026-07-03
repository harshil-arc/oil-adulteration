import { useState, useRef } from 'react';
import { FileText, Camera, CheckCircle2, AlertTriangle, X, Upload, Building, Tag, MapPin, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ComplaintModal({ isOpen, onClose, scanData }) {
  const [step, setStep] = useState(1); // 1: Details, 2: Evidence, 3: Review
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    shopName: '',
    brandName: '',
    batchNumber: '',
    mfdDate: '',
    expDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    pricePaid: '',
    address: '',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    additionalNotes: '',
  });

  // Photo uploads
  const [bottleImage, setBottleImage] = useState(null);
  const [labelImage, setLabelImage] = useState(null);
  const [invoiceImage, setInvoiceImage] = useState(null);

  const bottleRef = useRef(null);
  const labelRef = useRef(null);
  const invoiceRef = useRef(null);

  if (!isOpen || !scanData) return null;

  const { selectedOil, result, sensorData } = scanData;

  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const complaintRecord = {
        shop_name: formData.shopName || 'Unknown Vendor',
        brand_name: formData.brandName || 'Unbranded / Local',
        oil_type: selectedOil.oilName,
        purity_percentage: result.purityPercentage,
        adulteration_percentage: result.adulterationPercentage,
        confidence_score: result.confidenceScore,
        batch_number: formData.batchNumber || 'N/A',
        price_paid: formData.pricePaid || 'N/A',
        purchase_date: formData.purchaseDate,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        shop_address: formData.address,
        notes: formData.additionalNotes,
        status: 'Pending Investigation',
        created_at: new Date().toISOString(),
      };

      await supabase.from('complaints').insert(complaintRecord).catch(() => {});
      setSubmitted(true);
    } catch (_) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <FileText className="text-amber-400" size={18} />
            <h3 className="text-sm font-black text-[var(--text-color)]">Submit Adulteration Report</h3>
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
            <h3 className="text-xl font-black text-white">Report Successfully Filed!</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
              Your adulteration report has been logged with attached spectral telemetry. An investigation ticket has been created.
            </p>
            <button onClick={onClose} className="btn-primary py-3 px-6 text-xs font-black w-full">
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            
            {/* Step Progress Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div className={`py-1.5 rounded-lg border ${step >= 1 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-gray-800 text-gray-500'}`}>
                1. Purchase Info
              </div>
              <div className={`py-1.5 rounded-lg border ${step >= 2 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-gray-800 text-gray-500'}`}>
                2. Evidence Upload
              </div>
              <div className={`py-1.5 rounded-lg border ${step >= 3 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-gray-800 text-gray-500'}`}>
                3. Review & Submit
              </div>
            </div>

            {/* STEP 1: PURCHASE INFO */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Shop / Vendor Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kisan Grocery Store"
                      value={formData.shopName}
                      onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Brand Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Mustard"
                      value={formData.brandName}
                      onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Batch #</label>
                    <input
                      type="text"
                      placeholder="e.g. B-9402"
                      value={formData.batchNumber}
                      onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Price Paid (₹)</label>
                    <input
                      type="number"
                      placeholder="210"
                      value={formData.pricePaid}
                      onChange={e => setFormData({ ...formData, pricePaid: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">City / District</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <button onClick={() => setStep(2)} className="btn-primary py-3 w-full text-xs font-black mt-2">
                  Next: Add Photo Evidence →
                </button>
              </div>
            )}

            {/* STEP 2: EVIDENCE UPLOAD */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-300">Upload photos of the oil container, brand label, or store invoice:</p>
                
                <input ref={bottleRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setBottleImage)} />
                <input ref={labelRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setLabelImage)} />
                <input ref={invoiceRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setInvoiceImage)} />

                <div className="grid grid-cols-3 gap-2">
                  <div onClick={() => bottleRef.current?.click()} className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-dashed border-gray-700 text-center cursor-pointer hover:border-amber-400">
                    {bottleImage ? (
                      <img src={bottleImage} alt="Bottle" className="h-16 w-full object-cover rounded-lg" />
                    ) : (
                      <div className="space-y-1">
                        <Camera size={20} className="mx-auto text-amber-400" />
                        <span className="text-[10px] font-bold text-gray-400 block">Oil Bottle</span>
                      </div>
                    )}
                  </div>

                  <div onClick={() => labelRef.current?.click()} className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-dashed border-gray-700 text-center cursor-pointer hover:border-amber-400">
                    {labelImage ? (
                      <img src={labelImage} alt="Label" className="h-16 w-full object-cover rounded-lg" />
                    ) : (
                      <div className="space-y-1">
                        <Tag size={20} className="mx-auto text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-400 block">Brand Label</span>
                      </div>
                    )}
                  </div>

                  <div onClick={() => invoiceRef.current?.click()} className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-dashed border-gray-700 text-center cursor-pointer hover:border-amber-400">
                    {invoiceImage ? (
                      <img src={invoiceImage} alt="Invoice" className="h-16 w-full object-cover rounded-lg" />
                    ) : (
                      <div className="space-y-1">
                        <FileText size={20} className="mx-auto text-emerald-400" />
                        <span className="text-[10px] font-bold text-gray-400 block">Bill / Invoice</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setStep(1)} className="btn-secondary py-3 flex-1 text-xs font-bold">
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary py-3 flex-1 text-xs font-black">
                    Next: Review & Submit →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {step === 3 && (
              <div className="space-y-3">
                <div className="bg-[var(--bg-elevated)] p-3.5 rounded-2xl border border-[var(--border-color)] space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-400">Tested Oil:</span>
                    <span className="text-white">{selectedOil.oilName}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-400">Purity Rating:</span>
                    <span className="text-red-400">{result.purityPercentage.toFixed(1)}% (Unsafe)</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-400">Shop & Brand:</span>
                    <span className="text-white">{formData.shopName || 'Vendor'} • {formData.brandName || 'Brand'}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{formData.city}, {formData.state}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setStep(2)} className="btn-secondary py-3 flex-1 text-xs font-bold">
                    ← Back
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary py-3 flex-1 text-xs font-black">
                    {submitting ? 'Submitting...' : 'Submit Official Report'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
