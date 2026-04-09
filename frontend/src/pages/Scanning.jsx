import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, WifiOff } from 'lucide-react';
import { socket } from '../lib/socket';
import { useApp } from '../context/AppContext';

const SCAN_STEPS = [
  'Validating API Handshake',
  'Reading Molecular TDS',
  'Mapping pH Acidity',
  'Density Refraction Check',
  'Final AI Inspection',
];

export default function ScanningPage() {
  const navigate = useNavigate();
  const { deviceStatus, liveData } = useApp();
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [done, setDone] = useState(false);

  // Connection logic: No simulation. Only real data moves the needle.
  useEffect(() => {
    if (deviceStatus === 'offline') {
      setProgress(0);
      setCompletedSteps([]);
      return;
    }

    // Capture the 'new_reading' event to know when analysis is officially complete
    socket.on('new_reading', () => {
      setProgress(100);
      setCompletedSteps(SCAN_STEPS);
      setDone(true);
      setTimeout(() => navigate('/analytics'), 1500);
    });

    return () => {
      socket.off('new_reading');
    };
  }, [deviceStatus, navigate]);

  // Update progress UI based on live incoming sensor packets
  useEffect(() => {
    if (liveData && !done) {
      // Each packet received moves progress slightly until backend emits 'new_reading'
      setProgress(prev => Math.min(prev + 15, 95));
      const stepsDone = Math.floor((progress / 100) * SCAN_STEPS.length);
      setCompletedSteps(SCAN_STEPS.slice(0, Math.max(stepsDone, 1)));
    }
  }, [liveData, done, progress]);

  const handleCancel = () => navigate('/');

  const isConnecting = deviceStatus === 'offline';

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-between px-6 pt-8 pb-12 animate-slide-up">
      <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full">
        <div className="relative">
          <div className="w-52 h-52 rounded-full bg-[#111] border border-[#333] flex items-center justify-center">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center shadow-xl relative overflow-hidden transition-all duration-1000 ${
              isConnecting ? 'bg-gray-900 grayscale' : 'bg-gradient-to-br from-amber-400 to-yellow-700'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/20 rounded-full" />
              <span className={`text-6xl transition-transform duration-500 ${!done && !isConnecting ? 'animate-pulse' : ''}`}>
                {isConnecting ? '📡' : '🧪'}
              </span>
            </div>
          </div>
          
          {!done && !isConnecting && (
            <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/40 animate-ping" />
          )}
          
          {done && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-brand-500/20 flex items-center justify-center">
                <CheckCircle size={48} className="text-[#d4af37]" />
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">
            {isConnecting ? 'Awaiting Sensor...' : done ? 'Analysis Complete!' : 'Verifying PureOil'}
          </h1>
          <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
            {isConnecting 
              ? 'Please scan the oil sample using your physically connected ESP device.' 
              : done 
                ? 'Results have been verified by AI.' 
                : 'Processing high-frequency telemetry from sensors...'}
          </p>
        </div>

        {/* Live Stream Data Card */}
        <div className="w-full card border-[#333] p-5 bg-[#0f0f0f]">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Telemetry</span>
             </div>
             <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">
               {isConnecting ? 'Disconnected' : 'Streaming...'}
             </span>
          </div>
          
          {isConnecting ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-gray-600">
               <WifiOff size={32} />
               <p className="text-xs font-medium">Connect ESP to Start Data Flow</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[9px] text-gray-500 font-bold uppercase">PH LEVEL</p>
                 <p className="text-lg font-black text-white">{liveData?.sensor_values?.ph?.toFixed(2) || '---'}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[9px] text-gray-500 font-bold uppercase">DENSITY</p>
                 <p className="text-lg font-black text-white">{liveData?.sensor_values?.density_gcm3?.toFixed(3) || '---'}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[9px] text-gray-500 font-bold uppercase">TDS PPM</p>
                 <p className="text-lg font-black text-white">{liveData?.sensor_values?.tds_ppm || '---'}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[9px] text-gray-500 font-bold uppercase">TEMP °C</p>
                 <p className="text-lg font-black text-white">{liveData?.sensor_values?.temperature_c?.toFixed(1) || '---'}</p>
               </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!isConnecting && (
          <div className="w-full">
            <div className="flex justify-between mb-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase">Analysis Progress</span>
               <span className="text-[10px] font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-yellow-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-4 mt-8">
        {!done && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-red-500/70 font-bold text-sm hover:text-red-500 transition-colors uppercase tracking-widest text-[11px]"
          >
            <X size={14} />
            Cancel Session
          </button>
        )}
      </div>
    </div>
  );
}
