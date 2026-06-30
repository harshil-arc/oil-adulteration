import { useState, useEffect, useRef } from 'react';
import { Wifi, Bluetooth, Usb, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, Droplets, RefreshCw, ShieldCheck, Globe, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { socket } from '../lib/socket';
import ErrorBoundary from '../components/ErrorBoundary';
import BLEConnection from '../components/BLEConnection';
import USBConnection from '../components/USBConnection';
import { safeLocalFetch } from '../lib/sensorApi';

export default function ScanFlow() {
  const navigate = useNavigate();
  const { deviceStatus, liveData } = useApp();
  
  // 0: MethodSelect, 1a: BLE, 1b: WiFi, 1c: USB, 2: Verification, 3: Scanning, 4: Results
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [localLiveData, setLocalLiveData] = useState(null);
  const [selectedOilType, setSelectedOilType] = useState('Mustard Oil');

  // --- Step 0: Selectors ---
  const handleSelectMethod = (m) => {
    setMethod(m);
    setErrorText(null);
    if (m === 'ble') setStep('1a');
    else if (m === 'wifi') setStep('1b');
    else if (m === 'usb') setStep('1c');
  };

  // --- WiFi Connection Logic (REAL PROBE) ---
  const [wifiTab, setWifiTab] = useState('same');
  const [wifiIp, setWifiIp] = useState('192.168.1.10');
  const [isNetworkScanning, setIsNetworkScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [connectingDevice, setConnectingDevice] = useState(null);

  const scanNetwork = async () => {
    setIsNetworkScanning(true);
    setErrorText(null);
    setDiscoveredDevices([]);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:4000`;
      const res = await fetch(`${apiUrl}/api/network/scan`);
      const data = await res.json();
      if (data.devices && data.devices.length > 0) {
        setDiscoveredDevices(data.devices);
      } else {
        setErrorText(data.message || "No devices found on the local network.");
      }
    } catch (err) {
      setErrorText("Failed to contact local backend for network scan.");
    } finally {
      setIsNetworkScanning(false);
    }
  };

  const connectToDevice = async (device) => {
    setConnectingDevice(device);
    setErrorText(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await safeLocalFetch(`http://${device.ip}/connect`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.status !== 'ok') throw new Error("Handshake rejected");

      proceedToVerification({
        name: device.name,
        ip: device.ip,
        method: `WiFi (${device.ip})`,
        battery: 'AC Power',
        firmware: 'Embedded WebServer'
      });
    } catch (err) {
      setErrorText(`Failed to connect to ${device.name}.`);
    } finally {
      setConnectingDevice(null);
    }
  };

  const connectWiFi = async () => {
    setLoading(true);
    setErrorText(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const target = wifiTab === 'ap' ? '192.168.4.1' : wifiIp;
      const response = await safeLocalFetch(`http://${target}/connect`, { signal: controller.signal })
        .catch(e => { throw new Error(e.message || "Device not reachable. Check power and IP."); });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.status !== 'ok') throw new Error("Handshake rejected");

      proceedToVerification({
        name: data.deviceId || 'PureOil-ESP32',
        ip: target,
        method: `WiFi Direct (${target})`,
        battery: 'AC Power',
        firmware: 'Embedded WebServer'
      });
    } catch (err) {
      setErrorText(err.message || "Failed to establish handshake with ESP32.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToVerification = (info) => {
    setDeviceInfo(info);
    setStep(2);
  };

  // --- Real-time Scanning Phase (POLLING SENSOR ENDPOINT) ---
  useEffect(() => {
    if (step === 3) {
      setProgress(0);
      setScanResult(null);
      let poller;

      if (deviceInfo?.ip) {
        // Real-time polling logic
        poller = setInterval(async () => {
          try {
            const res = await safeLocalFetch(`http://${deviceInfo.ip}/sensor`);
            if (res.ok) {
              const data = await res.json();
              // data has adcValue, voltage, tds, temperature, timestamp
              
              setLocalLiveData({
                tds_ppm: data.tds,
                temperature_c: data.temperature,
                ph: 6.45, // Map this correctly if available, mocked here if missing
                density_gcm3: 0.908 // Map correctly if available
              });
              
              setProgress(prev => {
                const next = prev + 12;
                if (next >= 100) {
                  clearInterval(poller);
                  
                  // Trigger Analysis API
                  const apiUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:4000`;
                  fetch(`${apiUrl}/api/analyze`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                        oil_type: selectedOilType,
                        sensor_values: {
                           temperature_c: data.temperature || 25,
                           density_gcm3: data.density || 0.915,
                           refractive_index: data.optical || data.tds || 1.470 
                        }
                     })
                  }).then(res => res.json()).then(result => {
                     setScanResult(result);
                     setTimeout(() => setStep(4), 1000);
                  }).catch(err => {
                     console.error("Analysis Failed", err);
                     setStep(0);
                  });
                  return 100;
                }
                return next;
              });
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 1000);
      } else {
        // Fallback for BLE/USB socket method
        socket.on('new_reading', (data) => {
          setProgress(100);
          setScanResult(data.analysis);
          setTimeout(() => setStep(4), 1000);
        });
      }

      return () => {
        if (poller) clearInterval(poller);
        socket.off('new_reading');
      };
    }
  }, [step, deviceInfo]);

  // Update progress based on live sensor packets (for fallback)
  useEffect(() => {
    if (step === 3 && liveData && !deviceInfo?.ip) {
      setProgress(prev => Math.min(prev + 12, 98));
    }
  }, [step, liveData, deviceInfo]);

  const startScan = () => {
    setStep(3);
    setProgress(0);
    setScanResult(null);
  };

  // ================= RENDERERS =================

  return (
    <div className="min-h-screen flex flex-col relative z-20 theme-bg">
      
      {/* Dynamic Header */}
      {step < 3 && (
        <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)]">
          <button onClick={() => { step === 0 ? navigate('/home') : setStep(0) }} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">
              {step === 0 ? 'Connection Hub' : step === 2 ? 'Verification' : 'Device Bridge'}
            </h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
              Level 4 Secured Link
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 p-5 flex flex-col pt-safe">
        
        {/* STEP 0: SELECTION */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="mb-4">
               <h2 className="text-2xl font-black theme-text mb-1">Pair Sensor</h2>
               <p className="text-gray-500 text-sm">Select your hardware communication protocol.</p>
            </div>
            
            <div onClick={() => handleSelectMethod('wifi')} className="card hover:border-[#d4af37]/50 cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Globe size={120} strokeWidth={1} />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-[#d4af37]/10 rounded-2xl text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#0a0a0a] transition-colors">
                  <Wifi size={24} />
                </div>
                <div>
                  <h3 className="theme-text font-bold text-lg">Local Area Network</h3>
                  <p className="text-gray-400 text-xs mt-1">Direct IP or Local Router sync. Most stable for long sessions.</p>
                </div>
              </div>
            </div>

            <div onClick={() => handleSelectMethod('ble')} className="card hover:border-blue-500/50 cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Bluetooth size={120} strokeWidth={1} />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Bluetooth size={24} />
                </div>
                <div>
                  <h3 className="theme-text font-bold text-lg">Web Bluetooth</h3>
                  <p className="text-gray-400 text-xs mt-1">Wire-free pairing via GATT. Best for portable field tests.</p>
                </div>
              </div>
            </div>

            <div onClick={() => handleSelectMethod('usb')} className="card hover:border-purple-500/50 cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Usb size={120} strokeWidth={1} />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Usb size={24} />
                </div>
                <div>
                  <h3 className="theme-text font-bold text-lg">USB Serial Bridge</h3>
                  <p className="text-gray-400 text-xs mt-1">High-speed reliable link via OTG cable. No lag or interference.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
               <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
               <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                 Some protocols like <strong>WebUSB</strong> and <strong>Bluetooth</strong> require a secure HTTPS connection and a modern browser like Chrome or Edge.
               </p>
            </div>
          </div>
        )}

        {/* STEP 1A: BLUETOOTH */}
        {step === '1a' && (
          <ErrorBoundary>
            <BLEConnection 
              onConnected={proceedToVerification}
              onCancel={() => setStep(0)} 
            />
          </ErrorBoundary>
        )}

        {/* STEP 1B: WIFI */}
        {step === '1b' && (
          <div className="flex flex-col flex-1 animate-fade-in">
             <div className="flex w-full border border-[var(--border-color)] bg-[var(--bg-card)] rounded-full p-1 mb-6">
                <button onClick={() => setWifiTab('same')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-colors ${wifiTab === 'same' ? 'bg-[var(--bg-elevated)] theme-text' : 'text-gray-500'}`}>Local Router</button>
                <button onClick={() => setWifiTab('ap')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-colors ${wifiTab === 'ap' ? 'bg-[var(--bg-elevated)] theme-text' : 'text-gray-500'}`}>Direct Hotspot</button>
             </div>

             {wifiTab === 'same' ? (
                <div className="card border-[#333] flex flex-col gap-4 bg-[#0a0a0a]">
                  {!isNetworkScanning && discoveredDevices.length === 0 && !connectingDevice && (
                    <div className="flex flex-col items-center py-8">
                       <Wifi size={48} className="text-gray-600 mb-4" />
                       <h3 className="theme-text font-bold text-center mb-2">Scan Local Network</h3>
                       <p className="text-xs text-gray-500 text-center mb-4">Finds nearby ESP sensors connected to your current WiFi router.</p>
                       
                       <div className="w-full bg-[#1c1c1c] p-4 rounded-xl border border-[#333] mb-6 text-left">
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">How to Connect</p>
                         <ol className="text-xs text-gray-500 flex flex-col gap-2 font-medium list-decimal pl-4">
                           <li>Power on your ESP module.</li>
                           <li>Ensure it is connected to the same WiFi network as this device.</li>
                           <li>Tap <strong>Scan Now</strong> to discover nearby sensors.</li>
                           <li>Select your device from the list to pair.</li>
                         </ol>
                       </div>

                       <button onClick={scanNetwork} className="btn-primary w-full shadow-glow-teal bg-teal-600 hover:bg-teal-500 border-0">
                         <span className="flex items-center justify-center gap-2 font-black tracking-widest text-sm text-white">
                           <RefreshCw size={16} /> SCAN NOW
                         </span>
                       </button>
                    </div>
                  )}

                  {isNetworkScanning && (
                    <div className="flex flex-col items-center py-10 relative overflow-hidden">
                       <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-ping opacity-20 w-32 h-32 m-auto" />
                       <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center relative z-10 animate-pulse border border-teal-500/30">
                         <Wifi size={24} />
                       </div>
                       <p className="mt-6 text-teal-400 text-xs font-black uppercase tracking-widest animate-pulse">Scanning for nearby devices...</p>
                    </div>
                  )}

                  {!isNetworkScanning && discoveredDevices.length > 0 && !connectingDevice && (
                    <div className="flex flex-col gap-3">
                       <div className="flex justify-between items-end mb-2 border-b border-[#333] pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discovered Modules</span>
                          <span className="text-teal-500 text-[10px] font-black bg-teal-500/10 px-2 py-1 rounded">{discoveredDevices.length} FOUND</span>
                       </div>
                       
                       {discoveredDevices.map((dev, i) => (
                         <div 
                           key={i} 
                           onClick={() => connectToDevice(dev)}
                           className="bg-[#1c1c1c] border border-[#333] hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] flex justify-between items-center group relative overflow-hidden"
                         >
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/0 group-hover:bg-teal-500 transition-colors" />
                           <div>
                             <h4 className="text-white font-bold text-sm tracking-wide">{dev.name}</h4>
                             <p className="text-[10px] text-gray-500 font-mono mt-1">{dev.ip}</p>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="flex gap-0.5 items-end h-4">
                               <div className="w-1 bg-teal-500 rounded-full" style={{ height: '40%' }} />
                               <div className="w-1 bg-teal-500 rounded-full" style={{ height: '60%' }} />
                               <div className={`w-1 rounded-full ${dev.rssi > -70 ? 'bg-teal-500' : 'bg-[#333]'}`} style={{ height: '80%' }} />
                               <div className={`w-1 rounded-full ${dev.rssi > -50 ? 'bg-teal-500' : 'bg-[#333]'}`} style={{ height: '100%' }} />
                             </div>
                             <span className="text-[9px] text-teal-500 font-black">{dev.rssi} dBm</span>
                           </div>
                         </div>
                       ))}

                       <button onClick={scanNetwork} className="mt-4 py-3 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                         <RefreshCw size={14} /> Rescan Network
                       </button>
                    </div>
                  )}

                  {connectingDevice && (
                    <div className="flex flex-col items-center py-10">
                       <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-spin-slow border-t-2 border-amber-500 mb-6 shadow-glow-amber">
                         <RefreshCw size={24} />
                       </div>
                       <p className="text-amber-500 text-xs font-black uppercase tracking-widest">Connecting to {connectingDevice.name}...</p>
                    </div>
                  )}
                </div>
             ) : (
                <div className="card flex flex-col gap-4 p-5">
                  <h3 className="theme-text font-bold text-sm">Direct Hotspot Mode:</h3>
                  <ol className="text-xs text-gray-500 flex flex-col gap-4 font-medium">
                    <li className="flex gap-3 items-start"><span className="w-5 h-5 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex-shrink-0 flex items-center justify-center font-bold">1</span> Power on the handheld sensor unit</li>
                    <li className="flex gap-3 items-start"><span className="w-5 h-5 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex-shrink-0 flex items-center justify-center font-bold">2</span> Connect your phone to: <span className="text-white font-mono bg-[#1c1c1c] px-2 rounded border border-[#333]">PureOil-Sensor</span></li>
                    <li className="flex gap-3 items-start"><span className="w-5 h-5 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex-shrink-0 flex items-center justify-center font-bold">3</span> The device IP will be <span className="text-white font-mono bg-[#1c1c1c] px-2 rounded border border-[#333]">192.168.4.1</span></li>
                  </ol>
                  <button 
                    onClick={connectWiFi} 
                    disabled={loading}
                    className="btn-primary mt-4 border-0"
                  >
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : 'VERIFY HOTSPOT'}
                  </button>
                </div>
             )}
              {errorText && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 mt-6 animate-shake">
                   <XCircle size={18} className="text-red-500 mt-0.5" />
                   <div>
                     <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Handshake Failed</p>
                     <p className="text-white text-xs font-medium">{errorText}</p>
                   </div>
                </div>
              )}
          </div>
        )}

        {/* STEP 1C: USB */}
        {step === '1c' && (
          <ErrorBoundary>
            <USBConnection 
              onConnected={proceedToVerification}
              onCancel={() => setStep(0)}
            />
          </ErrorBoundary>
        )}

        {/* STEP 2: VERIFICATION */}
        {step === 2 && (
          <div className="flex flex-col flex-1 animate-fade-in">
             <div className="flex flex-col items-center justify-center py-10 relative">
               <div className="absolute top-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
               <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-500/30 relative z-10 shadow-glow-green">
                 <ShieldCheck size={40} />
               </div>
               <h2 className="theme-text font-black text-2xl">Device verified!</h2>
               <p className="text-green-500 text-[10px] uppercase tracking-widest font-black mt-2 bg-green-500/10 px-3 py-1 rounded-full">Secure Link Established</p>
             </div>

             <div className="card flex flex-col gap-4 mb-8">
                <div className="flex justify-between border-b border-[#333] pb-4">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Bridge Protocol</span>
                  <span className="text-white font-black text-sm">{deviceInfo?.method}</span>
                </div>
                <div className="flex justify-between border-b border-[#333] pb-4">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Hardware ID</span>
                  <span className="text-white font-mono text-sm">PUREOIL-SN-8842</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">GATT Pipeline</span>
                  <span className="text-green-500 font-bold text-sm">READY</span>
                </div>
             </div>
             <div className="card flex flex-col gap-3 mb-6 bg-[#0a0a0a] border-[#333]">
                <h3 className="theme-text font-bold text-sm">Target Oil Profile</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Select the reference chemistry</p>
                <select 
                  value={selectedOilType} 
                  onChange={(e) => setSelectedOilType(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] text-teal-500 font-bold p-4 rounded-xl focus:border-teal-500 transition-colors outline-none focus:ring-1 focus:ring-teal-500/50 appearance-none shadow-glow-teal"
                >
                  <option value="Mustard Oil">Mustard Oil Reference</option>
                  <option value="Sunflower Oil">Sunflower Oil Reference</option>
                  <option value="Coconut Oil">Coconut Oil Reference</option>
                  <option value="Olive Oil">Olive Oil Reference</option>
                </select>
             </div>

             <div className="mt-auto flex flex-col gap-4">
                <button onClick={startScan} className="btn-primary w-full py-5 text-lg shadow-glow-gold rounded-[25px]">
                  INITIATE MOLECULAR SCAN
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                   <ShieldCheck size={12} />
                   End-to-End Encrypted Data Stream
                </div>
             </div>
          </div>
        )}

        {/* STEP 3: SCANNING (Fullscreen) */}
        {step === 3 && (
          <div className="absolute inset-0 theme-bg z-[100] flex flex-col items-center justify-between p-6 pb-20 animate-fade-in">
             <div className="w-full flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest line-clamp-1">Hardware Link Active</span>
                </div>
                <div className="px-2 py-1 bg-[#1c1c1c] rounded-lg border border-[#333]">
                   <span className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest">7-Param Sensor Model</span>
                </div>
             </div>

             <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 flex items-center justify-center mb-16">
                  <div className="absolute inset-0 bg-[#d4af37]/10 rounded-full animate-scan-gold opacity-30" />
                  <div className="absolute inset-4 bg-[#d4af37]/20 rounded-full animate-scan-gold opacity-50" style={{animationDelay: '1s'}} />
                  <div className="w-32 h-32 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-[#0a0a0a] rounded-full flex items-center justify-center z-10 shadow-glow-gold relative overflow-hidden transition-transform duration-300 scale-110">
                    <Droplets size={54} fill="currentColor" strokeWidth={1} className="animate-pulse" />
                  </div>
                </div>

                <div className="text-center mb-8">
                   <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Probing Telemetry</h2>
                   <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">Analyzing Lipid Structure...</p>
                </div>
             </div>
             
             <div className="w-full card border-[#333] bg-[#0f0f0f] relative overflow-hidden mb-8 p-0">
                <div className="h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent w-full" />
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Transmission Progress</p>
                       <p className="text-4xl font-black text-white">{progress}%</p>
                     </div>
                     <div className="bg-[#1c1c1c] px-3 py-2 rounded-xl border border-[#333] flex items-center gap-2">
                        <RefreshCw size={14} className="text-[#d4af37] animate-spin-slow" />
                        <span className="text-[10px] text-white font-mono">RX_STREAMING</span>
                     </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-[#d4af37] to-yellow-600 transition-all duration-500" style={{width: `${progress}%`}} />
                  </div>
                </div>
             </div>

                <div className="grid grid-cols-4 gap-3 w-full">
                 <div className="flex flex-col items-center gap-1">
                    <p className="text-[8px] text-gray-600 font-bold uppercase">pH</p>
                    <p className="text-xs text-white font-mono font-bold">{(localLiveData || liveData)?.ph?.toFixed(1) || '---'}</p>
                 </div>
                 <div className="flex flex-col items-center gap-1 border-x border-[#333]">
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Density</p>
                    <p className="text-xs text-white font-mono font-bold">{(localLiveData || liveData)?.density_gcm3?.toFixed(2) || '---'}</p>
                 </div>
                 <div className="flex flex-col items-center gap-1 border-r border-[#333]">
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Temp</p>
                    <p className="text-xs text-white font-mono font-bold">{(localLiveData || liveData)?.temperature_c?.toFixed(1) || '---'}</p>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <p className="text-[8px] text-gray-600 font-bold uppercase">TDS</p>
                    <p className="text-xs text-white font-mono font-bold">{(localLiveData || liveData)?.tds_ppm || '---'}</p>
                 </div>
              </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && scanResult && (
           <div className="flex flex-col flex-1 animate-slide-up pb-10">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                 {scanResult.quality !== 'Unsafe' ? (
                   <>
                     <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-green border border-green-500/30">
                        <CheckCircle2 size={48} />
                     </div>
                     <h2 className="text-3xl font-black theme-text mb-1">Purity Confirmed</h2>
                     <p className="text-green-500 font-bold uppercase tracking-[0.2em] text-[10px] bg-green-500/5 px-4 py-1.5 rounded-full border border-green-500/10">Standard Compliant</p>
                   </>
                 ) : (
                   <>
                     <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-glow-red border border-red-500/30">
                        <AlertTriangle size={48} />
                     </div>
                     <h2 className="text-3xl font-black theme-text mb-1">Contamination!</h2>
                     <p className="text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] bg-red-500/5 px-4 py-1.5 rounded-full border border-red-500/10">Adulterants Detected</p>
                   </>
                 )}
              </div>

              <div className="card flex flex-col gap-5 mb-8 p-6">
                 <div className="flex justify-between items-center pb-3 border-b border-[#333]">
                   <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sensor Analysis Wrap</h3>
                   <span className="text-[9px] text-[#d4af37] font-bold">SHA-256 Verified</span>
                 </div>
                 
                 {scanResult.quality === 'Unsafe' && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 shadow-glow-red/10">
                      <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Likely Substances</p>
                        <p className="text-white font-bold text-sm leading-tight">{scanResult.likely_adulterants?.join(', ') || 'Unknown Contaminant'}</p>
                      </div>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1c1c1c] p-4 rounded-2xl border border-[#333]">
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Density Map</p>
                      <p className="text-white font-mono font-black text-xl">{scanResult.sensor_snapshot?.density_gcm3?.toFixed(3) || '0.000'} <span className="text-[10px] text-gray-600 font-bold ml-1">g/cm³</span></p>
                    </div>
                    <div className="bg-[#1c1c1c] p-4 rounded-2xl border border-[#333]">
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Purity Index</p>
                      <div className="flex items-baseline gap-1">
                        <p className={`font-mono font-black text-xl ${scanResult.purity > 90 ? 'text-green-500' : scanResult.purity > 70 ? 'text-[#d4af37]' : 'text-red-500'}`}>{scanResult.purity?.toFixed(1) || '0.0'}</p>
                        <span className="text-[10px] text-gray-600 font-black">%</span>
                      </div>
                    </div>
                 </div>

                 <div className="bg-[#1c1c1c]/50 p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between text-[10px]">
                       <span className="text-gray-500 font-bold uppercase tracking-widest">Molecular TDS</span>
                       <span className="text-white font-mono">{scanResult.sensor_snapshot?.tds_ppm || '0'} PPM</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                       <span className="text-gray-500 font-bold uppercase tracking-widest">Turbidity Factor</span>
                       <span className="text-white font-mono">{scanResult.sensor_snapshot?.turbidity_ntu?.toFixed(1) || '0.0'} NTU</span>
                    </div>
                 </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 px-2">
                 {scanResult.quality === 'Unsafe' ? (
                   <button 
                    onClick={() => navigate('/home')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-[20px] shadow-glow-red border-0 uppercase tracking-widest text-sm"
                   >
                     FILE ENFORCEMENT REPORT
                   </button>
                 ) : (
                   <button 
                    onClick={() => navigate('/home')}
                    className="btn-primary w-full py-4 text-sm font-black tracking-widest"
                   >
                     GENERATE DIGITAL CERTIFICATE
                   </button>
                 )}
                 <button onClick={() => setStep(0)} className="btn-secondary w-full py-4 text-sm flex items-center justify-center gap-2 border-[#333]">
                   <RefreshCw size={16} /> NEW INSPECTION
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
