import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, RefreshCw, ChevronLeft, AlertTriangle } from 'lucide-react';
import { setActiveConnection } from '../../lib/sensorConnection';

export default function LocalRouter() {
  const navigate = useNavigate();
  const [ip, setIp] = useState('192.168.1.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`http://${ip}/data`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('HTTP error');
      const json = await res.json();

      if (json.device !== 'PureOil-Sensor') {
        throw new Error('Not a PureOil device');
      }

      setActiveConnection({ mode: 'LOCAL', ip });
      navigate('/scan/readings');
    } catch (err) {
      console.error(err);
      setError('Could not reach that IP. Check the address and try again.');
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
            <button
              onClick={handleConnect}
              disabled={loading || ip.length < 8}
              className="btn-primary w-full rounded-xl mt-4 shrink-0 transition-opacity disabled:opacity-50 border-0"
            >
              {loading ? <RefreshCw size={20} className="animate-spin mx-auto" /> : 'Connect'}
            </button>
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
