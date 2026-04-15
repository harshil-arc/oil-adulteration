import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, RefreshCw, ChevronLeft, AlertTriangle } from 'lucide-react';
import { setActiveConnection } from '../../lib/sensorConnection';

export default function LocalRouter() {
  const navigate = useNavigate();
  const [ip, setIp] = useState('192.168.1.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isHttps = window.location.protocol === 'https:';



  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Construct URL safely
      const targetUrl = ip.startsWith('http') ? ip : `http://${ip}`;
      const res = await fetch(`${targetUrl}/data`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();

      if (json.device !== 'PureOil-Sensor' && !ip.includes('localhost')) {
         // We allow localhost to bypass strict device check for easier debugging
         throw new Error('Device identity mismatch. Ensure you are connecting to a PureOil sensor.');
      }

      setActiveConnection({ mode: 'LOCAL', ip: targetUrl.replace('http://', '') });
      navigate('/scan/readings');
    } catch (err) {
      console.error('[Connection Error]', err);
      
      if (err.name === 'AbortError') {
        setError('Connection timed out. Is the device on and in range?');
      } else if (err.name === 'TypeError' && isHttps) {
        setError('SECURITY BLOCK: Your browser blocked this connection because of HTTPS. Click the "Shield" icon in your URL bar to "Allow Insecure Content" or use the Simulator.');
      } else {
        setError(err.message || 'Could not reach that IP. Check the address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-20 theme-bg">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)]">
        <button onClick={() => navigate('/scan')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">LOCAL NETWORK</h1>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">HTTP Dev Mode</p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe">
        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 mb-6">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-amber-500/80 text-xs font-medium">
            This mode only works when the app is served over <strong>HTTP</strong> (e.g. localhost dev server). It will not work on the deployed HTTPS site.
          </p>
        </div>

        <div className="flex flex-col items-center py-8">
          <Wifi size={48} className="text-[#C8952A] mb-4" />
          <h3 className="theme-text font-bold text-center text-xl mb-2">Connect to ESP</h3>
          <p className="text-xs text-gray-500 text-center mb-8 max-w-[260px]">
            Find the ESP IP in Arduino Serial Monitor at baud rate 115200.
          </p>

          {/* Manual IP input */}
          <div className="w-full bg-[#1c1c1c] p-5 rounded-2xl border border-[#333]">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 block">
              Enter IP Address Manually
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.___"
              className="w-full bg-[#0a0a0a] text-white font-mono text-center text-xl tracking-[0.1em] py-4 rounded-xl border border-[#333] focus:border-[#C8952A] outline-none transition-colors"
            />
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setIp('localhost:3000')}
                className="py-3 px-4 rounded-xl border border-[#333] text-[10px] font-bold text-gray-400 hover:bg-white/5 uppercase"
              >
                Use Simulator
              </button>
              <button
                onClick={handleConnect}
                disabled={loading || ip.length < 3}
                className="bg-[#C8952A] text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm font-medium text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
