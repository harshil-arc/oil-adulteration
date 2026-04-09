import { useState, useEffect } from 'react';
import { Bluetooth, BluetoothOff, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function BLEConnection({ onConnected, onCancel }) {
  const [isSupported, setIsSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.bluetooth) {
      setIsSupported(false);
    }
  }, []);

  const connectBLE = async () => {
    setLoading(true);
    setError(null);
    try {
      // Request device with specific PureOil service or generic
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        // Optional: filters: [{ namePrefix: 'PureOil' }]
      });

      console.log('Connecting to GATT Server...', device.name);
      const server = await device.gatt.connect();
      
      onConnected({
        name: device.name || 'PureOil-BLE',
        method: 'Bluetooth',
        battery: '94%',
        firmware: 'v1.4.2-ble'
      });
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setError('Connection cancelled by user.');
      } else if (err.name === 'SecurityError') {
        setError('Bluetooth requires a secure (HTTPS) connection.');
      } else {
        setError('Failed to connect: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 animate-fade-in text-center p-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
          <BluetoothOff size={32} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg mb-2">Bluetooth Not Supported</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-[240px]">
            Your browser doesn't support Web Bluetooth. Please use **Chrome** or **Edge** on Desktop/Android.
          </p>
        </div>
        <button onClick={onCancel} className="btn-secondary w-full max-w-xs mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 animate-fade-in text-center p-6 flex-1">
      <div className="relative">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
          loading ? 'bg-blue-500/20 text-blue-500 animate-pulse' : 'bg-blue-500/10 text-blue-500'
        }`}>
          <Bluetooth size={48} />
        </div>
        {loading && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping" />
        )}
      </div>

      <div>
        <h2 className="text-white font-bold text-xl mb-2">Bluetooth Connectivity</h2>
        <p className="text-gray-500 text-xs leading-relaxed max-w-[240px] mx-auto">
          Ensure your ESP32 is powered on and "PureOil-BLE" is discoverable.
        </p>
      </div>

      {error ? (
        <div className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 mt-2 text-left animate-shake">
          <ShieldAlert size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Connection Error</p>
            <p className="text-white text-xs font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#1c1c1c] border border-[#333] p-4 rounded-2xl flex items-center gap-3 mt-2">
           <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
             <Sparkles size={14} />
           </div>
           <p className="text-gray-400 text-[11px] text-left">
             Real-time pairing via <strong>GATT Web Standards</strong>. No app installation required.
           </p>
        </div>
      )}

      <div className="mt-auto w-full flex flex-col gap-3">
        <button 
          onClick={connectBLE} 
          disabled={loading}
          className="btn-primary w-full bg-blue-500 hover:bg-blue-600 border-0"
        >
          {loading ? (
             <span className="flex items-center gap-2"><RefreshCw size={18} className="animate-spin" /> DISCOVERING...</span>
          ) : (
             'PAIR DEVICE'
          )}
        </button>
        <button onClick={onCancel} className="btn-secondary w-full" disabled={loading}>Cancel</button>
      </div>
    </div>
  );
}
