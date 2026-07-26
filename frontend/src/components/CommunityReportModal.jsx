import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Camera, CheckCircle2, AlertTriangle, X, Upload, 
  MapPin, Calendar, Thermometer, ShieldAlert, Sparkles, Navigation, RefreshCw, Layers 
} from 'lucide-react';
import { submitCommunityReport } from '../services/communityReportService';
import MapLocationPickerModal from './MapLocationPickerModal';

export default function CommunityReportModal({ isOpen, onClose, scanData }) {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null); // { latitude, longitude, accuracy }

  // Map Picker Modal state
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [shopName, setShopName] = useState('');
  const [comments, setComments] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const fileInputRef = useRef(null);

  // Effective scan payload extract
  const effectiveScan = scanData || {
    selectedOil: { oilName: 'Mustard Oil' },
    result: { purityPercentage: 45.0, adulterationPercentage: 55.0, confidenceScore: 92 },
    sensorData: { temperature: 28.4 }
  };

  const oilType = effectiveScan.selectedOil?.oilName || 'Edible Oil';
  const purity = effectiveScan.result?.purityPercentage ?? 45.0;
  const adulteration = effectiveScan.result?.adulterationPercentage ?? 55.0;
  const confidence = effectiveScan.result?.confidenceScore ?? 92;
  const temperature = effectiveScan.sensorData?.temperature ?? 28.4;
  const formattedDateTime = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Request Geolocation when modal opens
  useEffect(() => {
    if (isOpen) {
      requestGpsLocation();
    }
  }, [isOpen]);

  const requestGpsLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn('[CommunityReportModal] GPS capture error:', err.message);
        setGpsError('GPS permission denied or unavailable. Please select your location on the map.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gpsCoords) {
      setErrorMessage('Please select or capture GPS location coordinates.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        oilType,
        adulterationPercentage: adulteration,
        predictionConfidence: confidence,
        temperature,
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude,
        accuracy: gpsCoords.accuracy || 10,
        timestamp: new Date().toISOString(),
        vendorName: vendorName.trim(),
        shopName: shopName.trim(),
        comments: comments.trim(),
        photoURL: photoPreview,
        sensorReadings: effectiveScan.sensorData || {}
      };

      const res = await submitCommunityReport(payload);

      if (res.duplicate) {
        setErrorMessage(res.message || 'You have already submitted a report for this location recently.');
      } else if (res.success) {
        setSuccessResult(res.data);
      } else {
        setErrorMessage('Failed to transmit community report. Please try again.');
      }
    } catch (err) {
      console.error('[CommunityReportModal] Submission error:', err);
      setErrorMessage('An unexpected error occurred while saving the report.');
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
            <ShieldAlert className="text-amber-400" size={20} />
            <div>
              <h3 className="text-sm font-black text-white">Community Adulteration Report</h3>
              <p className="text-[10px] text-gray-400">Protect fellow consumers by geotagging verified scan telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* ── SUCCESS ANIMATION DIALOG ── */}
        {successResult ? (
          <div className="p-6 text-center space-y-5 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-glow-teal">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Report Published Live
              </span>
              <h3 className="text-xl font-black text-white mt-2">Community Map Updated</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">
                Thank you for contributing to public food safety! Your report has been geotagged to the SpectraTrust Hotspot Map.
              </p>
            </div>

            <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Report ID:</span>
                <span className="font-mono text-amber-400 font-bold">{successResult.reportId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coordinates:</span>
                <span className="font-mono text-emerald-400 font-bold">{successResult.latitude}, {successResult.longitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Oil & Adulteration:</span>
                <span className="font-bold text-white">{successResult.oilType} ({successResult.adulterationPercentage}%)</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/hotspots');
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
              >
                <MapPin size={16} /> View Hotspot Map →
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-800 text-gray-300 font-bold text-xs rounded-2xl hover:bg-gray-700"
              >
                Close Report
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM CONTENT ── */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Error Banner (Duplicate / GPS) */}
            {errorMessage && (
              <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Submission Notice</p>
                  <p className="text-[11px] text-red-300/90 leading-snug mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* PRE-FILLED SCAN METADATA CARDS */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Oil Type</p>
                <p className="text-sm font-black text-amber-400 font-mono mt-0.5">{oilType}</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Adulteration %</p>
                <p className="text-sm font-black text-red-400 font-mono mt-0.5">{adulteration.toFixed(1)}%</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">AI Confidence</p>
                <p className="text-xs font-bold text-purple-400 font-mono mt-0.5">{confidence}%</p>
              </div>

              <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Sample Temp</p>
                <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{temperature}°C</p>
              </div>
            </div>

            {/* DATE & TIME (Pre-filled) */}
            <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                <Calendar size={14} className="text-amber-400" /> Timestamp
              </span>
              <span className="font-mono text-gray-200 font-bold text-[11px]">{formattedDateTime}</span>
            </div>

            {/* GPS LOCATION SECTION */}
            <div className="bg-[var(--bg-elevated)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <MapPin size={15} className="text-emerald-400" /> Geotagged Location
                </span>
                <button
                  type="button"
                  onClick={() => setMapPickerOpen(true)}
                  className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/40 font-bold transition-colors"
                >
                  Change on Map
                </button>
              </div>

              {gpsLoading ? (
                <div className="flex items-center gap-2 text-xs text-amber-400 py-1 font-mono">
                  <RefreshCw size={14} className="animate-spin" /> Acquiring high-accuracy GPS coordinates...
                </div>
              ) : gpsCoords ? (
                <div className="text-xs font-mono text-emerald-400 bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                  <span>Lat: {gpsCoords.latitude}, Lng: {gpsCoords.longitude}</span>
                  <span className="text-[10px] text-gray-400 font-sans">±{gpsCoords.accuracy}m</span>
                </div>
              ) : (
                <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  {gpsError || 'Location not captured.'}
                </div>
              )}
            </div>

            {/* OPTIONAL VENDOR NAME */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-300 uppercase tracking-wider mb-1">
                Vendor / Distributor Name <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Shree Ji Traders, Local Wholesale Supplier"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
              />
            </div>

            {/* OPTIONAL SHOP NAME */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-300 uppercase tracking-wider mb-1">
                Shop / Store Name <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kalupur Grocery Store, Shop #4"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none"
              />
            </div>

            {/* OPTIONAL COMMENTS */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-300 uppercase tracking-wider mb-1">
                Field Observations & Comments <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Describe packaging condition, odor, visual haze, price, or batch number..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[var(--border-color)] text-white text-xs p-3 rounded-xl focus:border-amber-500 outline-none resize-none"
              />
            </div>

            {/* OPTIONAL PHOTO UPLOAD */}
            <div>
              <label className="block text-[11px] font-extrabold text-gray-300 uppercase tracking-wider mb-1">
                Attach Sample Photo <span className="text-gray-500 font-normal">(Optional)</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[var(--border-color)] group">
                  <img src={photoPreview} alt="Sample preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 bg-[#1c1c1c] border border-dashed border-gray-600 hover:border-amber-500 text-gray-400 hover:text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={16} className="text-amber-400" /> Upload Bottle / Receipt Photo
                </button>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !gpsCoords}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-red-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-glow-amber hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Transmitting to Community Database...
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} /> Submit Report to Community Map
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Embedded Leaflet Map Picker Modal */}
      <MapLocationPickerModal
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        initialCoords={gpsCoords ? [gpsCoords.latitude, gpsCoords.longitude] : [23.0255, 72.5874]}
        onSelectLocation={(coords) => {
          setGpsCoords({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: 5
          });
          setGpsError(null);
        }}
      />
    </div>
  );
}
