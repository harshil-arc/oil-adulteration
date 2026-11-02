import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, RefreshCw, ChevronLeft, CheckCircle, Database } from 'lucide-react';
import { setActiveConnection } from '../../lib/sensorConnection';
import { fetchLatestCloudReading } from '../../lib/firestoreSensorService';

export default function CloudSync() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('checking'); // 'checking' | 'ready' | 'idle'
  const [latestSnippet, setLatestSnippet] = useState(null);

  useEffect(() => {
    let active = true;
    fetchLatestCloudReading()
      .then((reading) => {
        if (!active) return;
        if (reading) {
          setCloudStatus('ready');
          setLatestSnippet(reading);
        } else {
          setCloudStatus('idle');
        }
      })
      .catch(() => {
        if (active) setCloudStatus('idle');
      });

    return () => { active = false; };
  }, []);

  const handleConnect = () => {
    setLoading(true);
    // Cloud mode flags the connection — polling runs in Readings
    setTimeout(() => {
      setActiveConnection({ mode: 'CLOUD' });
      navigate('/scan/readings');
    }, 400);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-20 theme-bg">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)]">
        <button onClick={() => navigate('/scan')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">CLOUD SYNC</h1>
          <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Firebase RTDB & Firestore</p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe">
        <div className="flex flex-col items-center py-8">
          <div className="w-24 h-24 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-5 border border-purple-500/30 animate-pulse">
            <Cloud size={46} />
          </div>
          <h3 className="theme-text font-black text-2xl mb-2 text-center">Firebase Cloud Sync</h3>
          <p className="text-sm text-gray-400 text-center max-w-[300px]">
            Your ESP32 pushes sensor telemetry to Firebase over the internet. This mode fetches the latest readings in real-time.
          </p>

          {/* Cloud Status Pill */}
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333]">
            <div className={`w-2 h-2 rounded-full ${cloudStatus === 'ready' ? 'bg-green-500 animate-pulse' : cloudStatus === 'checking' ? 'bg-amber-500 animate-spin' : 'bg-gray-500'}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300">
              {cloudStatus === 'ready' ? 'Firebase Cloud Active' : cloudStatus === 'checking' ? 'Connecting to Firebase...' : 'Ready for Telemetry'}
            </span>
          </div>

          {latestSnippet && (
            <div className="mt-3 text-center">
              <span className="text-[10px] text-gray-500 font-mono">
                Latest: {latestSnippet.temperature}°C | {latestSnippet.oil_type}
              </span>
            </div>
          )}
        </div>

        <div className="card bg-[#1c1c1c] border-[#333] mb-4 shadow-none">
          <div className="flex items-start gap-3">
            <Database size={18} className="text-purple-400 mt-1 shrink-0" />
            <div>
              <h4 className="text-white text-sm font-bold">Dual-Channel Sync</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Seamlessly connects to Firebase Realtime Database for zero-lag streaming and Google Cloud Firestore for historical analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-[#1c1c1c] border-[#333] mb-6 shadow-none">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-green-400 mt-1 shrink-0" />
            <div>
              <h4 className="text-white text-sm font-bold">No Local Network Required</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Operates across different Wi-Fi networks, mobile hotspots, or cellular internet with automatic reconnect.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.99]"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'START FETCHING'}
          </button>
          <button onClick={() => navigate('/scan')} className="w-full py-3 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
