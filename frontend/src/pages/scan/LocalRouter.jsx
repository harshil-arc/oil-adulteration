import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, RefreshCw, ChevronLeft, AlertTriangle, CheckCircle2, Smartphone, Search, Zap } from 'lucide-react';
import { setActiveConnection } from '../../lib/sensorConnection';

export default function LocalRouter() {
  const navigate = useNavigate();
  const [ip, setIp] = useState(() => {
    try {
      return localStorage.getItem('esp32_last_ip') || '192.168.1.';
    } catch {
      return '192.168.1.';
    }
  });
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isHttps = window.location.protocol === 'https:';

  const testIpConnection = async (testIp) => {
    const clean = testIp.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const targetUrl = `http://${clean}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      // 1. Try /connect endpoint
      let res = await fetch(`${targetUrl}/connect`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // Fallback to /data
        const ctrl2 = new AbortController();
        const tid2 = setTimeout(() => ctrl2.abort(), 3000);
        res = await fetch(`${targetUrl}/data`, { signal: ctrl2.signal });
        clearTimeout(tid2);
      }

      if (!res.ok) {
        // Fallback to /sensor
        const ctrl3 = new AbortController();
        const tid3 = setTimeout(() => ctrl3.abort(), 3000);
        res = await fetch(`${targetUrl}/sensor`, { signal: ctrl3.signal });
        clearTimeout(tid3);
      }

      if (!res.ok) return null;
      const json = await res.json();
      if (json && (json.status === 'ok' || json.deviceId || json.temperature !== undefined)) {
        return { ip: clean, data: json };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleConnect = async (customIp = null) => {
    const targetIp = customIp || ip;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const cleanIp = targetIp.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!cleanIp) {
        throw new Error('Please enter a valid IP address.');
      }

      const result = await testIpConnection(cleanIp);
      if (!result) {
        throw new Error(`Could not reach ESP32 at http://${cleanIp}. Verify that both device & app are connected to the same Wi-Fi/Hotspot.`);
      }

      try {
        localStorage.setItem('esp32_last_ip', cleanIp);
      } catch (_) {}

      setActiveConnection({ mode: 'LOCAL', ip: cleanIp });
      setSuccess(true);
      setTimeout(() => {
        navigate('/scan/readings');
      }, 500);
    } catch (err) {
      console.error('[Connection Error]', err);
      if (err.name === 'AbortError') {
        setError('Connection timed out. Is the device powered on and connected to the same network?');
      } else if (err.name === 'TypeError' && isHttps) {
        setError('Browser security notice: If running on HTTPS, mixed-content requests to local HTTP IPs may be blocked. Please run the app on HTTP (e.g. localhost or direct IP) for direct LAN mode.');
      } else {
        setError(err.message || 'Could not reach that IP. Check the address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick auto-scanner for common hotspot subnets (192.168.43.x, 192.168.1.x, 192.168.0.x)
  const handleScanSubnet = async () => {
    setIsScanning(true);
    setError(null);
    setScanStatus('Scanning common subnets for ESP32...');

    const subnets = ['192.168.43.', '192.168.1.', '192.168.0.', '192.168.137.'];
    let found = null;

    // Scan top common host IDs (e.g., .2 to .30, .100 to .115)
    const hostIds = [1, 2, 3, 4, 5, 10, 15, 20, 50, 100, 101, 102, 105, 110, 150];

    for (const sub of subnets) {
      if (found) break;
      setScanStatus(`Checking ${sub}x network...`);
      
      const promises = hostIds.map(async (host) => {
        const candidate = `${sub}${host}`;
        const res = await testIpConnection(candidate);
        if (res) return candidate;
        return null;
      });

      const results = await Promise.all(promises);
      found = results.find(r => r !== null);
    }

    if (found) {
      setScanStatus(`Found ESP32 at ${found}! Connecting...`);
      setIp(found);
      setIsScanning(false);
      handleConnect(found);
    } else {
      setIsScanning(false);
      setScanStatus('');
      setError('Auto-scan could not locate ESP32. Please enter the IP manually from your hotspot connected devices list or Arduino Serial Monitor.');
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
          <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">LOCAL NETWORK DIRECT LINK</h1>
          <p className="text-[9px] text-[#d4af37] font-bold uppercase tracking-widest">Fast Zero-Latency Mode</p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe overflow-y-auto pb-12">
        {/* Hotspot / Wi-Fi Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-[#d4af37]/15 to-amber-500/10 border border-[#d4af37]/30 p-4 rounded-2xl flex items-start gap-3 mb-6">
          <Smartphone size={20} className="text-[#d4af37] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#d4af37]">Low Connectivity / Offline Ready</p>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Connect your phone & ESP32 to the same Wi-Fi router or Mobile Hotspot for instant, uninterrupted readings and OLED display updates.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5c842] to-[#d4af37] flex items-center justify-center text-black mb-3 shadow-glow-gold">
            <Wifi size={32} />
          </div>
          <h3 className="theme-text font-black text-center text-xl mb-1">Direct ESP32 Link</h3>
          <p className="text-xs text-gray-500 text-center mb-6 max-w-[280px]">
            Enter the IP address assigned to your ESP32 device on your local network.
          </p>

          {/* Manual IP input */}
          <div className="w-full bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                ESP32 Local IP Address
              </label>
              <button
                type="button"
                onClick={handleScanSubnet}
                disabled={isScanning || loading}
                className="text-[10px] font-bold text-[#d4af37] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Search size={11} /> {isScanning ? 'Scanning...' : 'Auto-Discover'}
              </button>
            </div>

            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 192.168.43.100"
              className="w-full bg-[var(--bg-input)] text-white font-mono text-center text-lg tracking-wider py-3.5 rounded-xl border border-[var(--border-color)] focus:border-[#d4af37] outline-none transition-colors"
            />

            {/* Quick preset subnets */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIp('192.168.43.')}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#d4af37]/20 border border-[var(--border-color)] text-[10px] text-gray-400 hover:text-[#d4af37] font-mono"
              >
                Hotspot (192.168.43.x)
              </button>
              <button
                type="button"
                onClick={() => setIp('192.168.1.')}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#d4af37]/20 border border-[var(--border-color)] text-[10px] text-gray-400 hover:text-[#d4af37] font-mono"
              >
                Router (192.168.1.x)
              </button>
              <button
                type="button"
                onClick={() => setIp('localhost:3000')}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[#d4af37]/20 border border-[var(--border-color)] text-[10px] text-gray-400 hover:text-[#d4af37] font-mono"
              >
                Simulator
              </button>
            </div>
            
            {scanStatus && (
              <p className="text-[11px] text-[#d4af37] text-center mt-3 animate-pulse font-medium">
                {scanStatus}
              </p>
            )}

            <button
              onClick={() => handleConnect()}
              disabled={loading || isScanning || ip.length < 3}
              className="w-full mt-4 bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-wider shadow-glow-gold cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Verifying Connection...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} /> Connected! Opening Telemetry...
                </>
              ) : (
                <>
                  <Zap size={16} /> Connect to Device
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex items-start gap-2.5 mt-2">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-400 text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Tips Box */}
        <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
          <h4 className="text-xs font-bold theme-text uppercase tracking-wider mb-2">💡 Quick Setup Guide</h4>
          <ol className="text-[11px] text-gray-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Turn on <strong>Mobile Hotspot</strong> on your mobile phone.</li>
            <li>Power on your ESP32 device (it connects automatically to your hotspot).</li>
            <li>Look in your phone's Hotspot settings under <strong>"Connected Devices"</strong> to copy the assigned IP (e.g. <span className="font-mono text-[#d4af37]">192.168.43.105</span>).</li>
            <li>Paste the IP above and tap <strong>Connect to Device</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

