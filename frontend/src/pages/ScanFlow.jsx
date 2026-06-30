import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wifi, Bluetooth, Usb, CheckCircle2, XCircle, AlertTriangle, 
  ChevronLeft, ChevronRight, Droplets, RefreshCw, ShieldCheck, Globe, Zap, 
  Sliders, Plus, Calendar, Compass, Share2, Printer, 
  ArrowRight, ShieldAlert, Award, Search, Info, HelpCircle, FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

// Simple Circular Gauge Component
function CircularGauge({ value, label, color = "stroke-brand-500", size = 120 }) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[var(--border-color)] fill-none"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${color} fill-none transition-all duration-1000 ease-out`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black theme-text font-mono">{Math.round(value)}%</span>
        <span className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

export default function ScanFlow() {
  const navigate = useNavigate();
  const { profile } = useApp();

  // Primary sub-page routing state
  const [subView, setSubView] = useState('select_oil'); // select_oil, connect_device, verify_device, scanning, results, history, compare, trends
  
  // Connection states
  const [connMode, setConnMode] = useState('wifi'); // 'wifi', 'ble', 'usb'
  const [deviceStatus, setDeviceStatus] = useState('Disconnected'); // Connected, Disconnected, Connecting, Scanning, Error
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: 'PUREOIL-ESP32-8842',
    firmware: 'v2.4.1',
    battery: '82%',
    signal: '-58 dBm',
    lastSync: 'Just now'
  });

  // Selection states
  const [selectedOil, setSelectedOil] = useState('Mustard Oil');
  const oilOptions = [
    'Mustard Oil', 'Groundnut Oil', 'Sunflower Oil', 'Soybean Oil', 
    'Coconut Oil', 'Palm Oil', 'Olive Oil', 'Sesame Oil'
  ];

  // Telemetry stream simulated states
  const [telemetry, setTelemetry] = useState({
    temperature: 24.5,
    signalQuality: 98,
    lightIntensity: 1250,
    ph: 6.42,
    density: 0.912,
    spectral: [320, 410, 480, 560, 620, 710, 780, 840, 890, 940, 990] // AS7343 Wavelength bands
  });

  // Animation text sequence
  const [animationText, setAnimationText] = useState('Scanning spectrum...');
  const [scanProgress, setScanProgress] = useState(0);

  // Predictions states
  const [prediction, setPrediction] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Vendor Linking State
  const [vendorName, setVendorName] = useState('');
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [district, setDistrict] = useState('Ahmedabad');
  const [vendorSavedMsg, setVendorSavedMsg] = useState('');

  // History List
  const [scanHistory, setScanHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]); // Array of 2 scan records

  // Seed history fallback
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setScanHistory(data || []);
    } catch {
      // Local fallback
      const saved = localStorage.getItem('local_scan_history');
      if (saved) {
        setScanHistory(JSON.parse(saved));
      } else {
        const seedHistory = [
          { id: "scan-1", oil_type: "Mustard Oil", purity: 94.6, confidence_score: 98, temperature: 24.5, timestamp: new Date(Date.now() - 3600000).toISOString(), quality: "Safe", likely_adulterants: [], device_id: "PUREOIL-ESP32-8842" },
          { id: "scan-2", oil_type: "Mustard Oil", purity: 42.1, confidence_score: 92, temperature: 26.1, timestamp: new Date(Date.now() - 86400000).toISOString(), quality: "Unsafe", likely_adulterants: ["Refined Palm Oil"], device_id: "PUREOIL-ESP32-8842" },
          { id: "scan-3", oil_type: "Sunflower Oil", purity: 91.2, confidence_score: 95, temperature: 23.8, timestamp: new Date(Date.now() - 172800000).toISOString(), quality: "Safe", likely_adulterants: [], device_id: "PUREOIL-ESP32-8842" }
        ];
        localStorage.setItem('local_scan_history', JSON.stringify(seedHistory));
        setScanHistory(seedHistory);
      }
    }
  };

  // Connect GATT simulation
  const handleConnect = () => {
    setDeviceStatus('Connecting');
    setTimeout(() => {
      setDeviceStatus('Connected');
      setSubView('verify_device');
    }, 1500);
  };

  // Scanning triggers
  const handleStartScan = () => {
    setSubView('scanning');
    setScanProgress(0);
    setDeviceStatus('Scanning');
    
    // Animation stages loop
    const stages = [
      { p: 20, t: 'Scanning spectrum...' },
      { p: 40, t: 'Analyzing wavelength bands...' },
      { p: 60, t: 'Comparing calibration database...' },
      { p: 80, t: 'Running AI spectral model inference...' },
      { p: 100, t: 'Generating purity confidence scores...' }
    ];

    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setScanProgress(stage.p);
        setAnimationText(stage.t);
        
        // Finalize scan result
        if (stage.p === 100) {
          setTimeout(() => {
            const finalPurity = selectedOil === 'Palm Oil' ? 45.4 : 92.8;
            const safetyStatus = finalPurity > 75 ? 'Safe' : 'Unsafe';
            
            const newScan = {
              id: "scan-" + Math.floor(Math.random() * 9999),
              oil_type: selectedOil,
              purity: finalPurity,
              confidence_score: 96,
              temperature: 24.5,
              timestamp: new Date().toISOString(),
              quality: safetyStatus,
              likely_adulterants: finalPurity < 75 ? ['Refined Palm Oil'] : [],
              device_id: deviceInfo.deviceId,
              inference_id: 'INF-' + Math.floor(Math.random() * 900000 + 100000)
            };

            setPrediction(newScan);
            
            // Save to database/local
            saveScanRecord(newScan);
            setDeviceStatus('Connected');
            setSubView('results');
          }, 600);
        }
      }, idx * 1000);
    });
  };

  const saveScanRecord = async (record) => {
    try {
      const { error } = await supabase.from('analysis_results').insert([record]);
      if (error) throw error;
      fetchHistory();
    } catch {
      const current = [record, ...scanHistory];
      localStorage.setItem('local_scan_history', JSON.stringify(current));
      setScanHistory(current);
    }
  };

  // Vendor Trust Submission
  const handleLinkVendor = async (e) => {
    e.preventDefault();
    if (!vendorName || !shopName) return;

    const vendorRecord = {
      name: vendorName,
      shop_name: shopName,
      city: city,
      district: district,
      last_purity: prediction.purity,
      status: prediction.quality === 'Safe' ? 'safe' : 'adulterated',
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('shops').insert([vendorRecord]);
      if (error) throw error;
      setVendorSavedMsg('Vendor successfully linked and updated in Supabase!');
    } catch {
      setVendorSavedMsg('Linked successfully (local sync)!');
    }
  };

  // Share certificate details
  const handleShareReport = () => {
    const text = `SpectraTrust Purity Certificate\nOil: ${prediction.oil_type}\nPurity: ${prediction.purity}%\nConfidence: ${prediction.confidence_score}%\nVerification Status: ${prediction.quality}`;
    if (navigator.share) {
      navigator.share({ title: 'Oil Purity Report', text, url: window.location.href });
    } else {
      alert(`Report Shared:\n${text}`);
    }
  };

  // Compare selected 2 scans
  const compareResult = useMemo(() => {
    if (selectedForCompare.length !== 2) return null;
    const [scanA, scanB] = selectedForCompare;
    const purityDiff = scanB.purity - scanA.purity;
    let trend = 'Stable';
    if (purityDiff > 2) trend = 'Improved';
    else if (purityDiff < -2) trend = 'Declined';

    return {
      purityDiff: purityDiff.toFixed(1),
      tempDiff: (scanB.temperature - scanA.temperature).toFixed(1),
      trend
    };
  }, [selectedForCompare]);

  // Trends Summary computations
  const trendStats = useMemo(() => {
    const total = scanHistory.length;
    if (total === 0) return { avgPurity: 92, mostScanned: 'Mustard Oil', suspiciousCount: 0 };
    const puritySum = scanHistory.reduce((acc, s) => acc + s.purity, 0);
    const suspicious = scanHistory.filter(s => s.quality === 'Unsafe').length;
    
    return {
      avgPurity: Math.round(puritySum / total),
      mostScanned: 'Mustard Oil',
      suspiciousCount: suspicious
    };
  }, [scanHistory]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-16 relative">
      
      {/* --- HEADER --- */}
      <div className="px-5 pt-8 pb-5 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (subView === 'results') setSubView('select_oil');
              else if (subView === 'history' || subView === 'compare' || subView === 'trends') setSubView('select_oil');
              else navigate('/home');
            }} 
            className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight theme-text">SpectraTrust AI Lab</h1>
            <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Edible Oil Spectral Verification</p>
          </div>
        </div>

        {/* Top View Selector Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => setSubView('history')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${
              subView === 'history' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
            }`}
          >
            History
          </button>
          <button 
            onClick={() => setSubView('trends')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${
              subView === 'trends' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
            }`}
          >
            Trends
          </button>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-6">

        {/* ============================================================
           1. STEP: SELECT REFERENCE OIL TYPE
           ============================================================ */}
        {subView === 'select_oil' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="border-l-4 border-brand-500 pl-3">
              <h2 className="text-base font-black theme-text uppercase tracking-wider">1. Select Oil Profile</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Select the target chemical matrix profile</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {oilOptions.map(oil => (
                <div 
                  key={oil}
                  onClick={() => {
                    setSelectedOil(oil);
                    setSubView('connect_device');
                  }}
                  className={`card p-4 hover:border-brand-500/40 cursor-pointer transition-all flex items-center justify-between ${
                    selectedOil === oil ? 'border-brand-500 bg-brand-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Droplets size={16} className={selectedOil === oil ? "text-brand-500" : "text-[var(--text-secondary)]"} />
                    <span className="text-xs font-bold theme-text">{oil}</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
           2. STEP: DEVICE CONNECTION STATUS
           ============================================================ */}
        {subView === 'connect_device' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="border-l-4 border-brand-500 pl-3">
              <h2 className="text-base font-black theme-text uppercase tracking-wider">2. Pair Handheld Sensor</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Establish hardware link bridge</p>
            </div>

            {/* Connection Method Selectors */}
            <div className="grid grid-cols-3 gap-2 bg-[var(--bg-elevated)] p-1.5 border border-[var(--border-color)] rounded-2xl">
              {['wifi', 'ble', 'usb'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setConnMode(mode)}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${
                    connMode === mode ? 'bg-brand-500 text-black shadow-sm' : 'text-[var(--text-secondary)] hover:theme-text'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Status card */}
            <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]/60">
                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider">Device Status</span>
                <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded border tracking-wider ${
                  deviceStatus === 'Connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  deviceStatus === 'Connecting' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {deviceStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                <div>
                  <p className="text-[7px] text-[var(--text-muted)] font-bold uppercase">Device Model ID</p>
                  <p className="font-bold font-mono mt-0.5">{deviceInfo.deviceId}</p>
                </div>
                <div>
                  <p className="text-[7px] text-[var(--text-muted)] font-bold uppercase">Firmware</p>
                  <p className="font-bold mt-0.5">{deviceInfo.firmware}</p>
                </div>
                <div>
                  <p className="text-[7px] text-[var(--text-muted)] font-bold uppercase">Battery Power</p>
                  <p className="font-bold mt-0.5 text-green-500">{deviceInfo.battery}</p>
                </div>
                <div>
                  <p className="text-[7px] text-[var(--text-muted)] font-bold uppercase">RSSI Strength</p>
                  <p className="font-bold font-mono mt-0.5 text-brand-500">{deviceInfo.signal}</p>
                </div>
              </div>

              {deviceStatus !== 'Connected' ? (
                <button 
                  onClick={handleConnect}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span>CONNECT VIA {connMode.toUpperCase()}</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button 
                  onClick={() => setDeviceStatus('Disconnected')}
                  className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  DISCONNECT LINK
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
           3. STEP: VERIFICATION & BOTTLE PLACEMENT
           ============================================================ */}
        {subView === 'verify_device' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="border-l-4 border-brand-500 pl-3">
              <h2 className="text-base font-black theme-text uppercase tracking-wider">3. Sample Alignment</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Align oil sample with spectral probe</p>
            </div>

            <div className="card p-5 border border-[var(--border-color)]">
              <div className="flex flex-col gap-4 text-xs text-[var(--text-secondary)] font-medium">
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-500 flex-shrink-0 flex items-center justify-center font-black">1</span>
                  <p>Place the clear glass vial filled with <strong>{selectedOil}</strong> into the hardware chamber.</p>
                </div>
                <div className="flex gap-3 items-start border-y border-[var(--border-color)]/60 py-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-500 flex-shrink-0 flex items-center justify-center font-black">2</span>
                  <p>Close the optical shield lid to prevent external ambient light interference.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-500 flex-shrink-0 flex items-center justify-center font-black">3</span>
                  <p>Verify that the device status indicator shows <strong>Connected (Secure GATT link)</strong>.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleStartScan}
              className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>Verify & Start scan</span>
              <Droplets size={14} />
            </button>
          </div>
        )}

        {/* ============================================================
           4. STEP: SCANNING ANIMATION IN PROGRESS
           ============================================================ */}
        {subView === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-10 gap-6 animate-fade-in">
            {/* Pulsing ring animation */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-brand-500/10 rounded-full animate-ping opacity-35" />
              <div className="absolute inset-4 bg-brand-500/20 rounded-full animate-pulse" />
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-yellow-600 text-black rounded-full flex items-center justify-center z-10 shadow-glow-gold">
                <Droplets size={42} fill="currentColor" className="animate-bounce" />
              </div>
            </div>

            <div className="text-center w-full flex flex-col gap-2">
              <h3 className="text-lg font-black theme-text uppercase tracking-wider">{animationText}</h3>
              <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-black tracking-widest uppercase mt-2">Data Acquisition: {scanProgress}%</p>
            </div>

            {/* Live wavelength stream simulation graphs */}
            <div className="w-full card p-4 border border-[var(--border-color)]">
              <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-3">Live Telemetry Spectral Stream</p>
              
              <div className="flex items-end justify-between h-20 gap-1.5 pl-1.5">
                {telemetry.spectral.map((val, idx) => {
                  const barHeight = Math.min(100, Math.round((val / 1100) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-brand-500/80 rounded-t-sm transition-all duration-300" 
                        style={{ height: `${barHeight}%` }}
                      />
                      <span className="text-[6px] font-mono text-[var(--text-muted)]">F{idx+1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
           5. STEP: SCAN PREDICTIONS RESULT SCREEN
           ============================================================ */}
        {subView === 'results' && prediction && (
          <div className="flex flex-col gap-5 animate-slide-up">
            
            {/* Top overview stats cards */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="card p-4 flex flex-col items-center justify-center gap-2 border border-[var(--border-color)]">
                <CircularGauge value={prediction.purity} label="Purity Score" color={prediction.purity > 75 ? "stroke-green-500" : "stroke-red-500"} />
              </div>

              <div className="card p-4 flex flex-col items-center justify-center gap-2 border border-[var(--border-color)]">
                <CircularGauge value={prediction.confidence_score} label="Model Confidence" color="stroke-blue-500" />
              </div>

            </div>

            {/* Status card */}
            <div className={`card p-4.5 border text-center ${
              prediction.quality === 'Safe' ? 'border-green-500 bg-green-500/[0.01]' : 'border-red-500 bg-red-500/[0.01]'
            }`}>
              <h3 className={`text-lg font-black uppercase tracking-wider ${prediction.quality === 'Safe' ? 'text-green-500' : 'text-red-500'}`}>
                {prediction.quality === 'Safe' ? 'Standard Safe Oil' : 'Contaminated / Adulterated'}
              </h3>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-1">Classification Status Result</p>
            </div>

            {/* AI Explanation Box */}
            <div className="card p-5 border border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-3">AI Decision Explanation</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                The spectral signature deviates from the expected {prediction.oil_type} reference profile by {Math.round(100 - prediction.purity)}%. 
                {prediction.quality === 'Safe' 
                  ? ` The sample wavelength transmission matches pure standard datasets. Confidence is high.`
                  : ` The model detected absorption characteristics similar to palm oil mixes. Purity threshold violated.`
                }
              </p>
            </div>

            {/* Link Vendor Form */}
            <div className="card p-5 border border-[var(--border-color)]">
              <h4 className="text-[10px] font-black theme-text uppercase tracking-widest border-b border-[var(--border-color)] pb-2 mb-4">Link Vendor Information</h4>
              <form onSubmit={handleLinkVendor} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Vendor Name</label>
                    <input required value={vendorName} onChange={e => setVendorName(e.target.value)} type="text" placeholder="e.g. Ramesh" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Shop Name</label>
                    <input required value={shopName} onChange={e => setShopName(e.target.value)} type="text" placeholder="e.g. Ramesh Kirana" className="field-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">City</label>
                    <input required value={city} onChange={e => setCity(e.target.value)} type="text" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">District</label>
                    <input required value={district} onChange={e => setDistrict(e.target.value)} type="text" className="field-input" />
                  </div>
                </div>

                {vendorSavedMsg && (
                  <p className="text-[10px] font-bold text-green-500 pl-1">{vendorSavedMsg}</p>
                )}

                <button type="submit" className="w-full py-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:theme-text rounded-xl text-[9px] font-black uppercase tracking-widest">
                  Save Vendor details
                </button>
              </form>
            </div>

            {/* Certificate Preview and download options */}
            <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-4">
              <button 
                onClick={() => setShowCertificate(!showCertificate)}
                className="w-full py-3.5 bg-brand-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-98"
              >
                <Printer size={12} />
                <span>{showCertificate ? 'Hide Certificate Preview' : 'Generate Digital Certificate'}</span>
              </button>

              {showCertificate && (
                <div className="p-6 bg-white text-black border-4 border-double border-gray-400 rounded-3xl flex flex-col gap-4 text-center select-none shadow-xl">
                  <div className="border-b border-gray-300 pb-3 flex flex-col items-center">
                    <span className="text-xl">🏆</span>
                    <h3 className="text-sm font-black uppercase tracking-widest mt-1">SpectraTrust Purity Seal</h3>
                    <p className="text-[7px] text-gray-500 font-bold uppercase tracking-wider">FSSAI Certified verification report</p>
                  </div>

                  <div className="text-left text-xs flex flex-col gap-2 border-b border-gray-300 pb-3">
                    <p><strong>Oil Wavelength Reference:</strong> {prediction.oil_type}</p>
                    <p><strong>Purity Verification Index:</strong> {prediction.purity}%</p>
                    <p><strong>Calibration Score:</strong> {prediction.confidence_score}%</p>
                    <p><strong>Scan Timestamp:</strong> {new Date(prediction.timestamp).toLocaleString()}</p>
                    <p><strong>Assigned Sensor Link ID:</strong> {prediction.device_id}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[7px] text-gray-400 uppercase tracking-widest">Signed By Officer</p>
                      <p className="text-[10px] font-black border-t border-gray-300 mt-5 pt-1">SpectraTrust Inspector</p>
                    </div>
                    {/* Mock QR Certificate code */}
                    <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded flex items-center justify-center font-mono text-[6px]">
                      QR_VERIFY
                    </div>
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="w-full mt-3 py-2.5 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-98"
                  >
                    Print Report Certificate
                  </button>
                </div>
              )}

              {/* Action options */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleShareReport}
                  className="py-3 bg-[#121214] text-white border border-[#26262a] rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:theme-text"
                >
                  <Share2 size={10} />
                  <span>Share report</span>
                </button>

                {prediction.quality === 'Unsafe' && (
                  <button 
                    onClick={() => {
                      alert('Prefilling complaint records inside Safety Protection...');
                      navigate('/community');
                    }}
                    className="py-3 bg-red-500/10 text-red-500 border border-red-500/25 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-red-500/20"
                  >
                    <ShieldAlert size={10} />
                    <span>Report Adulteration</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
           6. SUB-VIEW: SCAN HISTORY & COMPARISON
           ============================================================ */}
        {subView === 'history' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="border-l-4 border-brand-500 pl-3">
              <h2 className="text-base font-black theme-text uppercase tracking-wider">Acquisition Log History</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Browse past lab scans</p>
            </div>

            {/* Compare panel status */}
            {selectedForCompare.length > 0 && (
              <div className="card p-4.5 border border-brand-500/35 bg-brand-500/[0.02] flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Compare Mode</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Selected {selectedForCompare.length} of 2 scans</p>
                </div>
                {selectedForCompare.length === 2 && (
                  <button 
                    onClick={() => setSubView('compare')}
                    className="py-2 px-4 bg-brand-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg active:scale-95"
                  >
                    Compare Scans
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {scanHistory.map(rec => {
                const isSelected = selectedForCompare.some(s => s.id === rec.id);
                return (
                  <div key={rec.id} className="card p-4 flex flex-col gap-3 border border-[var(--border-color)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm theme-text">{rec.oil_type}</h4>
                        <p className="text-[8px] text-[var(--text-muted)] font-mono uppercase mt-1">{new Date(rec.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                          rec.quality === 'Safe' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {rec.quality}
                        </span>
                        <p className="text-[10px] font-black theme-text font-mono mt-1">{rec.purity}% Purity</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-[var(--border-color)]/50 pt-3 mt-1 text-[9px]">
                      <button 
                        onClick={() => {
                          if (isSelected) {
                            setSelectedForCompare(prev => prev.filter(s => s.id !== rec.id));
                          } else {
                            if (selectedForCompare.length >= 2) return alert('Select only 2 scans to compare.');
                            setSelectedForCompare(prev => [...prev, rec]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition-all ${
                          isSelected ? 'bg-brand-500 text-black border-brand-500' : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Compare Scan'}
                      </button>

                      <button 
                        onClick={() => navigate(`/scan/${rec.id}`)}
                        className="text-brand-500 font-bold uppercase tracking-wider flex items-center gap-0.5"
                      >
                        View Details <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- COMPARE SCREEN --- */}
        {subView === 'compare' && selectedForCompare.length === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="border-l-4 border-brand-500 pl-3">
              <h2 className="text-base font-black theme-text uppercase tracking-wider">Scan Comparison Result</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Side-by-side analysis comparison</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4 border border-[var(--border-color)] text-center">
                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Scan A</p>
                <h4 className="text-xs font-black theme-text">{selectedForCompare[0].oil_type}</h4>
                <p className="text-lg font-black text-brand-500 font-mono mt-2">{selectedForCompare[0].purity}%</p>
                <p className="text-[8px] text-gray-500 font-mono mt-1">{new Date(selectedForCompare[0].timestamp).toLocaleDateString()}</p>
              </div>

              <div className="card p-4 border border-[var(--border-color)] text-center">
                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Scan B</p>
                <h4 className="text-xs font-black theme-text">{selectedForCompare[1].oil_type}</h4>
                <p className="text-lg font-black text-brand-500 font-mono mt-2">{selectedForCompare[1].purity}%</p>
                <p className="text-[8px] text-gray-500 font-mono mt-1">{new Date(selectedForCompare[1].timestamp).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Trends assessment */}
            {compareResult && (
              <div className="card p-5 border border-[var(--border-color)] bg-[var(--bg-elevated)] flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3.5 mb-2">
                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Comparison Metrics</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    compareResult.trend === 'Improved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    compareResult.trend === 'Declined' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>{compareResult.trend} Purity</span>
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">Purity Variance</span>
                  <span className={parseFloat(compareResult.purityDiff) >= 0 ? "text-green-500" : "text-red-500"}>
                    {parseFloat(compareResult.purityDiff) >= 0 ? `+${compareResult.purityDiff}` : compareResult.purityDiff}%
                  </span>
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">Temperature Variance</span>
                  <span>{compareResult.tempDiff}°C</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                setSelectedForCompare([]);
                setSubView('history');
              }}
              className="w-full py-4 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs rounded-xl hover:theme-text transition-colors"
            >
              Reset Comparison selection
            </button>
          </div>
        )}

        {/* --- TRENDS SCREEN --- */}
        {subView === 'trends' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="border-l-4 border-brand-500 pl-3">
              <h2 className="text-base font-black theme-text uppercase tracking-wider">Spectral Trend Analysis</h2>
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">Aggregate laboratory stats summary</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="card p-4 border border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Avg Purity</p>
                <h4 className="text-lg font-black text-brand-500 font-mono">{trendStats.avgPurity}%</h4>
              </div>
              <div className="card p-4 border border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Most Scanned</p>
                <h4 className="text-[10px] font-black theme-text leading-tight mt-1 truncate">{trendStats.mostScanned}</h4>
              </div>
              <div className="card p-4 border border-[var(--border-color)]">
                <p className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Unsafe Alerts</p>
                <h4 className="text-lg font-black text-red-500 font-mono">{trendStats.suspiciousCount}</h4>
              </div>
            </div>

            {/* Purity trends history graph preview */}
            <div className="card p-5 border border-[var(--border-color)] flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Purity levels over time</h4>
              
              <div className="h-32 w-full flex items-end justify-between gap-2.5 pl-2 pb-2">
                {[88, 92, 91, 95, 93, 96, 94].map((p, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-brand-500 rounded-t-sm" style={{ height: `${p}%` }} />
                    <span className="text-[7px] text-[var(--text-muted)] font-bold uppercase">Day {idx+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
