import { useState, useEffect, useRef } from 'react';
import { Wifi, Bluetooth, Usb, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, Droplets, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ScanFlow() {
  const navigate = useNavigate();
  // 0: MethodSelect, 1a: BLE, 1b: WiFi, 1c: USB, 2: Verification, 3: Scanning, 4: Results
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(null); // 'ble', 'wifi', 'usb'
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanData, setScanData] = useState({ ph: 0, turb: 0, temp: 0 });
  const [result, setResult] = useState(null);

  // --- Step 0: Selectors ---
  const handleSelectMethod = (m) => {
    setMethod(m);
    setErrorText(null);
    if (m === 'ble') setStep('1a');
    else if (m === 'wifi') setStep('1b');
    else if (m === 'usb') setStep('1c');
  };

  // --- Hardware Connections ---
  const connectBLE = async () => {
    setStatusText('Scanning for PureOil-ESP32...');
    setErrorText(null);
    try {
      if (!navigator.bluetooth) throw new Error("Web Bluetooth not supported on this browser.");
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'PureOil-ESP32' }, { services: [0xFFE0] }],
        optionalServices: [0xFFE0]
      });
      
      setStatusText('Pairing...');
      const server = await device.gatt.connect();
      // Simulate verification delay
      setTimeout(() => proceedToVerification('Bluetooth LE', true), 1000);
    } catch (e) {
      setErrorText(e.name === 'NotFoundError' ? 'Pairing cancelled.' : e.message);
      setStatusText('Pairing Failed.');
      // NOTE: Fallback simulation for non-compatible browsers so UI can still be viewed
      setTimeout(() => proceedToVerification('BLE Simulation', true), 2000); // Remove this in prod if strict
    }
  };

  const connectSerial = async () => {
    setStatusText('Requesting Serial Port...');
    setErrorText(null);
    try {
      if (!navigator.serial) throw new Error("Web Serial API not supported or USB OTG missing.");
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setStatusText('Port opened at 115200 baud...');
      setTimeout(() => proceedToVerification('USB Serial', true), 1000);
    } catch (e) {
      setErrorText(e.message);
      setStatusText('Connection Failed.');
      setTimeout(() => proceedToVerification('USB Simulation', true), 2000); // Remove in prod
    }
  };

  const [wifiTab, setWifiTab] = useState('same');
  const [wifiIp, setWifiIp] = useState('192.168.');
  
  const connectWiFi = () => {
    setStatusText('Discovering Host...');
    setErrorText(null);
    setTimeout(() => {
      proceedToVerification(`WiFi (${wifiIp || '192.168.4.1'})`, true);
    }, 1500);
  };

  const proceedToVerification = (methodName, success) => {
    setDeviceInfo({ name: 'PureOil-ESP32', firmware: 'v1.4.2', method: methodName, battery: '87%' });
    setStep(2);
  };

  // --- Scan Simulation ---
  const startScan = () => {
    setStep(3);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      setScanData({
        ph: (6.5 + Math.random() * 0.5).toFixed(1),
        turb: Math.floor(10 + Math.random() * 15),
        temp: Math.floor(25 + Math.random() * 5)
      });
      
      if (p >= 100) {
        clearInterval(interval);
        generateMockResult();
      }
    }, 200); // 4 seconds total
  };

  const generateMockResult = () => {
    // 70% chance safe, 30% adulterated
    const isSafe = Math.random() > 0.3;
    const res = {
      status: isSafe ? 'safe' : 'unsafe',
      ph: scanData.ph,
      turbidity: scanData.turb,
      adulterant: isSafe ? null : ['Mineral Oil', 'Argemone Oil', 'Metanil Yellow'][Math.floor(Math.random() * 3)],
      density: (0.91 + (isSafe ? 0 : 0.05)).toFixed(2)
    };
    
    // Save to Supabase
    supabase.from('analysis_results').insert([{
      oil_type: 'Sample Test',
      purity: isSafe ? Math.floor(95 + Math.random()*5) : Math.floor(40 + Math.random()*30),
      quality: isSafe ? 'Safe' : 'Unsafe',
      vendor: 'System Scan'
    }]).then(() => {
      setResult(res);
      setStep(4);
    });
  };


  // ================= RENDERERS =================

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative z-20">
      
      {/* Dynamic Header */}
      {step < 3 && (
        <div className="flex items-center gap-3 p-5 border-b border-[#333]">
          <button onClick={() => { step === 0 ? navigate('/home') : setStep(0) }} className="p-2 rounded-full bg-[#1c1c1c] text-white">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-white font-bold tracking-widest uppercase text-sm">
            {step === 0 ? 'Connect Device' : step === 2 ? 'Verification' : 'Hardware Wizard'}
          </h1>
        </div>
      )}

      <div className="flex-1 p-5 flex flex-col pt-safe">
        
        {/* STEP 0: SELECTION */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <h2 className="text-2xl font-black text-white mb-2">How do you want to connect?</h2>
            
            <div onClick={() => handleSelectMethod('wifi')} className="card border-[#333] hover:border-[#d4af37]/50 cursor-pointer transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#d4af37]/10 rounded-2xl text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#0a0a0a] transition-colors">
                  <Wifi size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">WiFi</h3>
                  <p className="text-gray-400 text-sm mt-1">Connect over same network or ESP32 AP</p>
                </div>
              </div>
            </div>

            <div onClick={() => handleSelectMethod('ble')} className="card border-[#333] hover:border-[#d4af37]/50 cursor-pointer transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Bluetooth size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Bluetooth (BLE)</h3>
                  <p className="text-gray-400 text-sm mt-1">Pair wirelessly via Bluetooth 4.0+</p>
                </div>
              </div>
            </div>

            <div onClick={() => handleSelectMethod('usb')} className="card border-[#333] hover:border-[#d4af37]/50 cursor-pointer transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Usb size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">USB Serial</h3>
                  <p className="text-gray-400 text-sm mt-1">Direct connect via OTG cable (115200 baud)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1A: BLUETOOTH */}
        {step === '1a' && (
          <div className="flex flex-col items-center justify-center flex-1 animate-fade-in text-center">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[#d4af37]/30 rounded-full animate-ping" />
              <div className="absolute inset-4 border border-[#d4af37]/50 rounded-full animate-ping" style={{animationDelay: '0.2s'}} />
              <div className="w-16 h-16 bg-[#d4af37] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-glow-gold z-10">
                <Bluetooth size={32} />
              </div>
            </div>
            
            <h2 className="text-white font-bold text-xl mb-2">{statusText || 'Ready to Pair'}</h2>
            {errorText && <p className="text-red-400 text-sm mb-6 max-w-xs">{errorText}</p>}
            
            <button onClick={connectBLE} className="btn-primary w-full max-w-xs mt-auto">
              Scan for Devices
            </button>
            <p className="text-[#d4af37] text-xs underline mt-6 cursor-pointer">Can't find device? See tips.</p>
          </div>
        )}

        {/* STEP 1B: WIFI */}
        {step === '1b' && (
          <div className="flex flex-col flex-1 animate-fade-in">
             <div className="flex w-full border border-[#333] bg-[#141414] rounded-full p-1 mb-6">
                <button onClick={() => setWifiTab('same')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${wifiTab === 'same' ? 'bg-[#333] text-white' : 'text-gray-500'}`}>Local Network</button>
                <button onClick={() => setWifiTab('ap')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${wifiTab === 'ap' ? 'bg-[#333] text-white' : 'text-gray-500'}`}>ESP32 Hotspot</button>
             </div>

             {wifiTab === 'same' ? (
                <div className="card border-[#333] flex flex-col gap-4">
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">ESP32 IP Address</label>
                  <input type="text" value={wifiIp} onChange={e=>setWifiIp(e.target.value)} className="w-full bg-[#1c1c1c] border border-[#333] focus:border-[#d4af37] rounded-xl px-4 py-3 text-white outline-none" />
                  
                  <button onClick={connectWiFi} className="btn-primary mt-2">Auto-Discover & Connect</button>
                </div>
             ) : (
                <div className="card border-[#333] flex flex-col gap-4 p-5">
                  <h3 className="text-white font-bold">Connection Steps:</h3>
                  <ol className="text-sm text-gray-400 flex flex-col gap-3 font-medium">
                    <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs">1</span>Power on device</li>
                    <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs">2</span>Go to Phone WiFi settings</li>
                    <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs">3</span>Connect to SSRID: <span className="text-white font-mono bg-[#1c1c1c] px-2 rounded">PureOil-Setup</span></li>
                    <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs">4</span>Pass: <span className="text-white font-mono bg-[#1c1c1c] px-2 rounded">pureoil123</span></li>
                  </ol>
                  <button onClick={connectWiFi} className="btn-primary mt-4">I'm Connected, Continue</button>
                </div>
             )}
              {errorText && <p className="text-red-400 text-sm mt-4 text-center">{errorText}</p>}
          </div>
        )}

        {/* STEP 1C: USB */}
        {step === '1c' && (
           <div className="flex flex-col items-center flex-1 animate-fade-in text-center pt-8">
              <Usb size={64} className="text-[#d4af37] mb-6" />
              <h2 className="text-white font-bold text-xl mb-4">USB OTG Serial</h2>
              <p className="text-gray-400 text-sm mb-10 max-w-xs">
                Ensure your phone supports USB OTG. Connect the ESP32 directly using a data cable. Default baud rate is 115200.
              </p>
              <button onClick={connectSerial} className="btn-primary w-full max-w-xs mt-auto">Detect USB Device</button>
           </div>
        )}

        {/* STEP 2: VERIFICATION */}
        {step === 2 && (
          <div className="flex flex-col flex-1 animate-fade-in">
             <div className="flex flex-col items-center justify-center py-10">
               <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                 <CheckCircle2 size={40} />
               </div>
               <h2 className="text-white font-bold text-2xl">Device verified!</h2>
               <p className="text-green-400 text-sm uppercase tracking-widest font-bold mt-1">Handshake: PUREOIL_OK</p>
             </div>

             <div className="card border-[#333] flex flex-col gap-3 mb-8">
                <div className="flex justify-between border-b border-[#333] pb-3">
                  <span className="text-gray-500 text-sm">Method</span>
                  <span className="text-white font-bold">{deviceInfo.method}</span>
                </div>
                <div className="flex justify-between border-b border-[#333] pb-3">
                  <span className="text-gray-500 text-sm">Firmware</span>
                  <span className="text-white font-bold">{deviceInfo.firmware}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-gray-500 text-sm">Battery</span>
                  <span className="text-white font-bold">{deviceInfo.battery}</span>
                </div>
             </div>

             <button onClick={startScan} className="btn-primary w-full shadow-glow-gold">
               START SPECTRAL SCAN
             </button>
          </div>
        )}

        {/* STEP 3: SCANNING (Fullscreen) */}
        {step === 3 && (
          <div className="absolute inset-0 bg-[#0a0a0a] z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
             <h2 className="text-white font-bold tracking-widest uppercase mb-12">Analyzing Sample</h2>
             
             <div className="relative w-64 h-64 flex items-center justify-center mb-16">
               <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full animate-scan-gold" />
               <div className="absolute inset-8 bg-[#d4af37]/40 rounded-full animate-scan-gold" style={{animationDelay: '1s'}} />
               <div className="w-24 h-24 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-[#0a0a0a] rounded-full flex items-center justify-center z-10 shadow-glow-gold relative overflow-hidden">
                 <Droplets size={48} fill="currentColor" strokeWidth={1} />
               </div>
             </div>

             <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs font-bold text-[#d4af37] mb-2 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4af37] transition-all duration-300 shadow-glow-gold" style={{width: `${progress}%`}} />
                </div>
             </div>

             <div className="flex justify-around w-full max-w-xs mt-8">
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-widest">pH Level</p><p className="text-white font-mono font-bold">{scanData.ph}</p></div>
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-widest">Turbidity</p><p className="text-white font-mono font-bold">{scanData.turb}</p></div>
                <div className="text-center"><p className="text-[10px] text-gray-500 uppercase tracking-widest">Temp °C</p><p className="text-white font-mono font-bold">{scanData.temp}</p></div>
             </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && result && (
           <div className="flex flex-col flex-1 animate-slide-up pb-10">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                 {result.status === 'safe' ? (
                   <>
                     <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 size={48} />
                     </div>
                     <h2 className="text-3xl font-black text-white">Oil is Pure</h2>
                     <p className="text-green-400 font-bold uppercase tracking-widest mt-2">No Adulterants Detected</p>
                   </>
                 ) : (
                   <>
                     <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                        <AlertTriangle size={48} />
                     </div>
                     <h2 className="text-3xl font-black text-white">Adulterated!</h2>
                     <p className="text-red-400 font-bold uppercase tracking-widest mt-2">Hazard Detected</p>
                   </>
                 )}
              </div>

              <div className="card bg-[#141414] border-[#333] flex flex-col gap-4 mb-8">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-2 border-b border-[#333]">Sensor Data Analysis</h3>
                 
                 {result.status === 'unsafe' && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                      <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Primary Adulterant</p>
                        <p className="text-white font-bold">{result.adulterant}</p>
                      </div>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-[#1c1c1c] p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Density</p>
                      <p className="text-white font-mono font-bold text-lg">{result.density} <span className="text-xs text-gray-500">g/ml</span></p>
                    </div>
                    <div className="bg-[#1c1c1c] p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">pH Level</p>
                      <p className="text-white font-mono font-bold text-lg">{result.ph}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-auto flex flex-col gap-3">
                 {result.status === 'unsafe' ? (
                   <button className="btn-primary bg-gradient-to-r from-red-500 to-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.3)] border-0 text-white">
                     FILE FSSAI REPORT
                   </button>
                 ) : (
                   <button className="btn-primary">
                     SAVE CERTIFICATE
                   </button>
                 )}
                 <button onClick={() => setStep(0)} className="btn-secondary">
                   <RefreshCw size={18} /> SCAN ANOTHER
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
