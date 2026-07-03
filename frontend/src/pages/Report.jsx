import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, MapPin, Upload, FileText, CheckCircle2, 
  ChevronRight, ArrowLeft, Camera, ShieldCheck, Download, 
  Clock, AlertTriangle, RefreshCw, X, Image as ImageIcon, Trash2
} from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Form State
  const [category, setCategory] = useState('Oil Adulteration');
  const [vendorName, setVendorName] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [district, setDistrict] = useState('Ahmedabad');
  const [stateName, setStateName] = useState('Gujarat');
  
  const [oilType, setOilType] = useState('Mustard Oil');
  const [brand, setBrand] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('1 Litre');
  const [invoiceNo, setInvoiceNo] = useState('');

  const [description, setDescription] = useState('');
  const [observedProblems, setObservedProblems] = useState('');
  const [healthEffects, setHealthEffects] = useState('');
  
  const [files, setFiles] = useState([]);
  const [verifiedCheck, setVerifiedCheck] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');

  // Auto-fill GPS location
  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}, Main Market Area`);
        setValidationError('');
      }, () => alert("Could not resolve location"));
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const uploaded = Array.from(e.target.files);
    if (uploaded.length > 0) {
      setFiles(prev => [...prev, ...uploaded]);
      setValidationError('');
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Step Navigations with Validation
  const handleNextStep1 = () => {
    if (!category) {
      setValidationError("Please select a complaint category.");
      return;
    }
    setValidationError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!shopName.trim()) {
      setValidationError("Please enter the Store / Shop Name.");
      return;
    }
    if (!address.trim()) {
      setValidationError("Please enter the Shop Address (or click Auto GPS Fill).");
      return;
    }
    setValidationError('');
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (!brand.trim()) {
      setValidationError("Please enter the Brand Name or Product Name.");
      return;
    }
    setValidationError('');
    setStep(4);
  };

  const handleNextStep4 = () => {
    if (files.length === 0) {
      setValidationError("Please attach at least one photo or video evidence file before proceeding.");
      return;
    }
    setValidationError('');
    setStep(5);
  };

  const handleNextStep5 = () => {
    if (!description.trim()) {
      setValidationError("Please enter a brief incident description.");
      return;
    }
    setValidationError('');
    setStep(6);
  };

  // Final Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verifiedCheck) {
      setValidationError("You must confirm the legal accuracy checkbox.");
      return;
    }
    if (!digitalSignature.trim()) {
      setValidationError("Please enter your full name for digital signature.");
      return;
    }

    setValidationError('');
    setLoading(true);
    setTimeout(() => {
      const generatedId = 'CMP-2026-' + Math.floor(1000 + Math.random() * 9000);
      setComplaintId(generatedId);
      setLoading(false);
      setStep(7); // Show receipt
    }, 1200);
  };

  return (
    <div className="min-h-screen theme-bg theme-text pb-24 pt-safe px-4 max-w-2xl mx-auto space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between py-4 border-b border-[var(--border-color)]">
        <button onClick={() => navigate('/home')} className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-400 hover:text-[var(--text-color)]">
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">Step {step} of 7</span>
          <h1 className="text-lg font-black text-[var(--text-color)]">Official Food Safety Complaint Portal</h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-[#d4af37] h-full transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }} />
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-shake">
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> {validationError}</span>
          <button onClick={() => setValidationError('')}><X size={16} /></button>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-color)]">1. Select Complaint Category</h3>
            <p className="text-xs text-gray-400">Choose the type of food safety violation observed.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Oil Adulteration', icon: '🛢️', desc: 'Adulterated or diluted edible oils' },
              { id: 'Food Adulteration', icon: '🧪', desc: 'Chemical or synthetic additives' },
              { id: 'Fake Brand / Counterfeit', icon: '⚠️', desc: 'Fake labels & unauthorized brands' },
              { id: 'Expired Product', icon: '📅', desc: 'Sale of expired items past date' },
              { id: 'Unsafe Storage / Hygiene', icon: '🪰', desc: 'Unclean storage environment' },
              { id: 'Others', icon: '📋', desc: 'General food safety violation' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setValidationError(''); }}
                className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all ${
                  category === cat.id 
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-glow-gold' 
                    : 'card border-[var(--border-color)] text-gray-400 hover:text-[var(--text-color)]'
                }`}
              >
                <div className="text-2xl">{cat.icon}</div>
                <h4 className="text-xs font-bold text-[var(--text-color)]">{cat.id}</h4>
                <p className="text-[10px] text-gray-400">{cat.desc}</p>
              </button>
            ))}
          </div>

          <button onClick={handleNextStep1} className="btn-primary w-full py-3 text-xs mt-4">
            Next: Vendor Details →
          </button>
        </div>
      )}

      {/* STEP 2: VENDOR INFORMATION */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-color)]">2. Vendor & Store Location</h3>
            <p className="text-xs text-gray-400">Provide details about where the oil/food was purchased.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Store / Shop Name <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. Shree Ji Traders" 
                value={shopName} 
                onChange={e => { setShopName(e.target.value); setValidationError(''); }} 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none focus:border-[#d4af37]" 
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Vendor / Owner Name (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Ramesh Shah" 
                value={vendorName} 
                onChange={e => setVendorName(e.target.value)} 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none focus:border-[#d4af37]" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-400">Shop Address <span className="text-red-400">*</span></label>
                <button type="button" onClick={handleAutoGPS} className="text-[10px] text-[#d4af37] font-bold hover:underline flex items-center gap-1">
                  <MapPin size={12} /> Auto GPS Fill
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Full Market Address or GPS Location" 
                value={address} 
                onChange={e => { setAddress(e.target.value); setValidationError(''); }} 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none focus:border-[#d4af37]" 
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-gray-400 block mb-1">City</label>
                <input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">District</label>
                <input type="text" value={district} onChange={e=>setDistrict(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">State</label>
                <input type="text" value={stateName} onChange={e=>setStateName(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setValidationError(''); setStep(1); }} className="btn-secondary flex-1 py-3 text-xs">Back</button>
            <button onClick={handleNextStep2} className="btn-primary flex-1 py-3 text-xs">Next: Product Info →</button>
          </div>
        </div>
      )}

      {/* STEP 3: PRODUCT INFORMATION */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-color)]">3. Product & Sample Details</h3>
            <p className="text-xs text-gray-400">Specify brand name, batch details, and purchase information.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Oil / Food Type</label>
                <select value={oilType} onChange={e=>setOilType(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none">
                  <option className="bg-[#18181b] text-white">Mustard Oil</option>
                  <option className="bg-[#18181b] text-white">Sunflower Oil</option>
                  <option className="bg-[#18181b] text-white">Groundnut Oil</option>
                  <option className="bg-[#18181b] text-white">Palm Oil</option>
                  <option className="bg-[#18181b] text-white">Soybean Oil</option>
                  <option className="bg-[#18181b] text-white">Ghee / Butter</option>
                  <option className="bg-[#18181b] text-white">Spices / Pulses</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Brand Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Sunrise / Fortune / Loose" 
                  value={brand} 
                  onChange={e => { setBrand(e.target.value); setValidationError(''); }} 
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none focus:border-[#d4af37]" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Batch Number (If any)</label>
                <input type="text" placeholder="e.g. B-8842" value={batchNo} onChange={e=>setBatchNo(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Quantity Purchased</label>
                <input type="text" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Purchase Date</label>
                <input type="date" value={purchaseDate} onChange={e=>setPurchaseDate(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Invoice / Bill No (Optional)</label>
                <input type="text" placeholder="e.g. INV-9041" value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setValidationError(''); setStep(2); }} className="btn-secondary flex-1 py-3 text-xs">Back</button>
            <button onClick={handleNextStep3} className="btn-primary flex-1 py-3 text-xs">Next: Evidence Upload →</button>
          </div>
        </div>
      )}

      {/* STEP 4: EVIDENCE UPLOAD (FIXED FILE UPLOAD & PREVIEWS) */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-color)]">4. Upload Photo & Video Evidence <span className="text-red-400">*</span></h3>
            <p className="text-xs text-gray-400">Attach product photos, bill copies, or spectrometer test reports as proof.</p>
          </div>

          {/* Hidden File Input */}
          <input 
            ref={fileInputRef} 
            type="file" 
            multiple 
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange} 
            className="hidden" 
          />

          {/* Drag & Drop Upload Zone */}
          <div 
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="border-2 border-dashed border-[var(--border-color)] hover:border-[#d4af37] rounded-3xl p-6 text-center space-y-3 cursor-pointer bg-[var(--bg-card)] transition-colors"
          >
            <Upload size={36} className="text-[#d4af37] mx-auto" />
            <div>
              <p className="text-xs font-bold text-[var(--text-color)]">Click Here to Upload Photo or Document Proof</p>
              <p className="text-[10px] text-gray-400">Supports JPG, PNG, MP4, PDF (Max 10MB per file)</p>
            </div>
            <button type="button" className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5">
              <Camera size={14} /> Select Photos / Files
            </button>
          </div>

          {/* Uploaded File Previews */}
          {files.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[var(--text-color)] flex items-center justify-between">
                <span>Attached Proof Files ({files.length}):</span>
                <span className="text-[10px] text-emerald-400">✓ Ready to submit</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => {
                  const isImage = file.type.startsWith('image/');
                  const imageUrl = isImage ? URL.createObjectURL(file) : null;
                  return (
                    <div key={idx} className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {isImage ? (
                          <img src={imageUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-gray-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                            FILE
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-[var(--text-color)] truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => { setValidationError(''); setStep(3); }} className="btn-secondary flex-1 py-3 text-xs">Back</button>
            <button onClick={handleNextStep4} className="btn-primary flex-1 py-3 text-xs">Next: Description →</button>
          </div>
        </div>
      )}

      {/* STEP 5: DESCRIPTION & HEALTH EFFECTS */}
      {step === 5 && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-color)]">5. Incident Description & Health Symptoms</h3>
            <p className="text-xs text-gray-400">Describe the physical appearance, odor, or adverse health effects observed.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Incident Description <span className="text-red-400">*</span></label>
              <textarea 
                rows={3} 
                placeholder="Describe the suspected adulteration or problem in detail..." 
                value={description} 
                onChange={e => { setDescription(e.target.value); setValidationError(''); }} 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none focus:border-[#d4af37]" 
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Observed Physical Problems (e.g. Strange Odor, Murky Color)</label>
              <input 
                type="text" 
                placeholder="e.g. Foul chemical smell and thick sludge settling at bottom" 
                value={observedProblems} 
                onChange={e => setObservedProblems(e.target.value)} 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" 
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Health Symptoms Experienced (If Any)</label>
              <input 
                type="text" 
                placeholder="e.g. Nausea, stomach irritation" 
                value={healthEffects} 
                onChange={e => setHealthEffects(e.target.value)} 
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] outline-none" 
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setValidationError(''); setStep(4); }} className="btn-secondary flex-1 py-3 text-xs">Back</button>
            <button onClick={handleNextStep5} className="btn-primary flex-1 py-3 text-xs">Next: Verification →</button>
          </div>
        </div>
      )}

      {/* STEP 6: VERIFICATION & SIGNATURE */}
      {step === 6 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in pt-2">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[var(--text-color)]">6. Verification & Legal Confirmation</h3>
            <p className="text-xs text-gray-400">Review your complaint and confirm information accuracy.</p>
          </div>

          <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2 text-xs">
            <p><span className="text-gray-400">Category:</span> <span className="font-bold text-[var(--text-color)]">{category}</span></p>
            <p><span className="text-gray-400">Vendor:</span> <span className="font-bold text-[var(--text-color)]">{shopName} ({city})</span></p>
            <p><span className="text-gray-400">Product:</span> <span className="font-bold text-[var(--text-color)]">{oilType} ({brand})</span></p>
            <p><span className="text-gray-400">Attached Proof:</span> <span className="font-bold text-emerald-400">{files.length} Evidence Files Attached</span></p>
          </div>

          <div className="flex items-start gap-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/40">
            <input 
              type="checkbox" 
              id="legalVerify" 
              checked={verifiedCheck} 
              onChange={e => { setVerifiedCheck(e.target.checked); setValidationError(''); }} 
              className="mt-1 w-4 h-4 text-[#d4af37] accent-[#d4af37]" 
            />
            <label htmlFor="legalVerify" className="text-xs text-amber-300 font-medium cursor-pointer">
              I confirm that all information provided in this complaint is true and accurate to the best of my knowledge under food safety enforcement regulations.
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Digital Signature / Full Name <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              placeholder="Type your full name to sign" 
              value={digitalSignature} 
              onChange={e => { setDigitalSignature(e.target.value); setValidationError(''); }} 
              required 
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] p-3 rounded-xl text-[var(--text-color)] text-xs outline-none focus:border-[#d4af37]" 
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setValidationError(''); setStep(5); }} className="btn-secondary flex-1 py-3 text-xs">Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Submit Official Complaint'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 7: COMPLAINT RECEIPT & TRACKING */}
      {step === 7 && complaintId && (
        <div className="space-y-5 animate-scale-up text-center pt-4">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Official Complaint Lodged</span>
            <h2 className="text-2xl font-black text-[var(--text-color)] mt-1">ID: {complaintId}</h2>
            <p className="text-xs text-gray-400 mt-1">Submitted to FSSAI Regional Food Safety Enforcement Cell</p>
          </div>

          {/* QR Code & Timeline Card */}
          <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4 max-w-sm mx-auto text-left text-xs">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <span className="font-bold text-gray-300">Estimated Review Time:</span>
              <span className="font-bold text-[#d4af37]">24 - 48 Hours</span>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-[var(--text-color)]">Tracking Steps:</p>
              <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={14} /> 1. Complaint Received & Logged</div>
              <div className="flex items-center gap-2 text-blue-400"><Clock size={14} /> 2. FSSAI Inspector Assignment</div>
              <div className="flex items-center gap-2 text-gray-500">⚪ 3. Physical Lab Sampling & Raid</div>
            </div>
          </div>

          <div className="flex gap-2 max-w-sm mx-auto">
            <button onClick={() => alert(`Downloading PDF Receipt for ${complaintId}`)} className="btn-secondary flex-1 py-3 text-xs flex items-center justify-center gap-1.5">
              <Download size={14} /> PDF Receipt
            </button>
            <button onClick={() => navigate('/home')} className="btn-primary flex-1 py-3 text-xs">
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
