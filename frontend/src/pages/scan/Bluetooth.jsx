import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bluetooth, RefreshCw, XCircle, Settings, ChevronLeft, Globe } from 'lucide-react';
import { setActiveConnection } from '../../lib/sensorConnection';

export default function BluetoothScan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const isBluetoothAvailable = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  const [serviceUuid, setServiceUuid] = useState(
    () => localStorage.getItem('ble_service_uuid') || '0000ffe0-0000-1000-8000-00805f9b34fb'
  );
  const [charUuid, setCharUuid] = useState(
    () => localStorage.getItem('ble_char_uuid') || '0000ffe1-0000-1000-8000-00805f9b34fb'
  );

  const saveSettings = () => {
    localStorage.setItem('ble_service_uuid', serviceUuid);
    localStorage.setItem('ble_char_uuid', charUuid);
    setShowSettings(false);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const svcUuid = localStorage.getItem('ble_service_uuid') || '0000ffe0-0000-1000-8000-00805f9b34fb';
      const chrUuid = localStorage.getItem('ble_char_uuid') || '0000ffe1-0000-1000-8000-00805f9b34fb';

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'PureOil-BLE' }],
        optionalServices: [svcUuid],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(svcUuid);
      const characteristic = await service.getCharacteristic(chrUuid);
      await characteristic.startNotifications();

      setActiveConnection({
        mode: 'BLE',
        characteristic,
        device,
      });

      navigate('/scan/readings');
    } catch (err) {
      console.error('BLE error:', err);
      setError('Pairing failed. Make sure ESP32 is powered and advertising BLE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-20 theme-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/scan')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">WEB BLUETOOTH</h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">GATT Pairing</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe">
        {/* Chrome warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 mb-6">
          <Globe size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">🌐 Chrome Browser Required</p>
            <p className="text-amber-500/80 text-xs font-medium">
              Web Bluetooth only works in Google Chrome on Android. Samsung Internet, Firefox, and in-app browsers from Instagram or WhatsApp are not supported and will silently fail. Open this page in Chrome before proceeding.
            </p>
          </div>
        </div>

        {/* BLE unavailable */}
        {!isBluetoothAvailable && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-500 text-xs font-bold leading-tight">
              Web Bluetooth is not available in this browser. Please open <strong>oil-adulteration4.vercel.app</strong> in Google Chrome.
            </p>
          </div>
        )}

        {/* Pulsing icon */}
        <div className="flex flex-col items-center justify-center py-10 relative">
          <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 relative z-10 animate-pulse">
            <Bluetooth size={40} />
          </div>
          <h2 className="theme-text font-black text-2xl text-center">Bluetooth Pairing</h2>
          <p className="text-gray-500 text-sm text-center mt-2 max-w-[250px]">
            Ensure your ESP32 is powered on and <strong>&quot;PureOil-BLE&quot;</strong> is discoverable.
          </p>
        </div>

        {/* Info card */}
        <div className="card bg-[#1c1c1c] border-[#333] mb-6 shadow-none">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-blue-500"><RefreshCw size={18} /></div>
            <div>
              <h4 className="text-white text-sm font-bold">Real-time pairing via GATT Web Standards</h4>
              <p className="text-xs text-gray-500 mt-1">No app installation required. Ensure ESP32 firmware is running and BLE is advertising.</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 mb-6 animate-shake">
            <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-xs font-medium">{error}</p>
              <button onClick={() => { setError(null); handleConnect(); }} className="text-blue-400 text-xs mt-2 underline">
                🔄 Scan Again
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleConnect}
            disabled={!isBluetoothAvailable || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'PAIR DEVICE'}
          </button>
          <button onClick={() => navigate('/scan')} className="w-full py-4 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-[#111] border border-[#333] p-5 rounded-2xl w-full max-w-sm">
            <h3 className="text-white font-bold mb-4">GATT Settings</h3>
            <div className="flex flex-col gap-3 mb-6">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Service UUID</label>
                <input type="text" value={serviceUuid} onChange={(e) => setServiceUuid(e.target.value)} className="w-full bg-[#1c1c1c] border border-[#333] p-3 rounded-lg text-white font-mono text-xs focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Characteristic UUID</label>
                <input type="text" value={charUuid} onChange={(e) => setCharUuid(e.target.value)} className="w-full bg-[#1c1c1c] border border-[#333] p-3 rounded-lg text-white font-mono text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mb-4">All GATT calls read from localStorage first, falling back to defaults.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-3 bg-[#1c1c1c] text-white font-bold rounded-xl">Cancel</button>
              <button onClick={saveSettings} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
