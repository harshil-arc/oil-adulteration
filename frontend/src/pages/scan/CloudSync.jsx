import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, RefreshCw, ChevronLeft } from 'lucide-react';
import { setActiveConnection } from '../../lib/sensorConnection';

export default function CloudSync() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Cloud mode just flags the connection — actual polling happens in Readings
    setTimeout(() => {
      setActiveConnection({ mode: 'CLOUD' });
      navigate('/scan/readings');
    }, 800);
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
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Supabase Fallback</p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe">
        <div className="flex flex-col items-center py-12">
          <div className="w-24 h-24 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 animate-pulse">
            <Cloud size={48} />
          </div>
          <h3 className="theme-text font-black text-2xl mb-3">Sync from Cloud</h3>
          <p className="text-sm text-gray-400 text-center max-w-[280px]">
            Your ESP32 pushes sensor telemetry to the Supabase database every 5 seconds. This mode fetches the latest readings from the cloud.
          </p>
        </div>

        <div className="card bg-[#1c1c1c] border-[#333] mb-6 shadow-none">
          <div className="flex items-start gap-3">
            <Cloud size={18} className="text-purple-500 mt-1" />
            <div>
              <h4 className="text-white text-sm font-bold">No Direct Connection Needed</h4>
              <p className="text-xs text-gray-500 mt-1">
                Works on any browser, any network. As long as the ESP32 has internet access, data flows through the cloud.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'START FETCHING'}
          </button>
          <button onClick={() => navigate('/scan')} className="w-full py-4 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
