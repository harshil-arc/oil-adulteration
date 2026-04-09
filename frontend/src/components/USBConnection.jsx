import { useState, useEffect } from 'react';
import { Usb, ShieldAlert, Zap, RefreshCw, Terminal } from 'lucide-react';

export default function USBConnection({ onConnected, onCancel }) {
  const [isSupported, setIsSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.serial) {
      setIsSupported(false);
    }
  }, []);

  const connectUSB = async () => {
    setLoading(true);
    setError(null);
    try {
      // Request a port and open it
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      console.log('USB Port opened successfully');
      
      onConnected({
        name: 'USB Device',
        method: 'Serial OTG',
        battery: 'Always Powered',
        firmware: 'v1.4.2-serial'
      });
      
      // We could start reading here, but for now we just verify connection
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setError('No device selected.');
      } else if (err.name === 'SecurityError') {
        setError('USB access requires a secure (HTTPS) connection.');
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
          <Usb size={32} />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg mb-2">USB Not Supported</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-[240px]">
            Web Serial API is not supported on this browser. Please use **Chrome**, **Edge**, or **Opera** on Desktop.
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
          loading ? 'bg-purple-500/20 text-purple-500 animate-pulse' : 'bg-purple-500/10 text-purple-500'
        }`}>
          <Usb size={48} strokeWidth={2.5} />
        </div>
        {loading && (
          <div className="absolute inset-0 rounded-full border-2 border-purple-500 animate-ping" />
        )}
      </div>

      <div>
        <h2 className="text-white font-bold text-xl mb-2">USB Serial Bridge</h2>
        <p className="text-gray-500 text-xs leading-relaxed max-w-[240px] mx-auto">
          Connect your ESP32 via USB-C or OTG cable. Baud rate is fixed at 115200.
        </p>
      </div>

      {error ? (
        <div className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 mt-2 text-left animate-shake">
          <ShieldAlert size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Hardware Error</p>
            <p className="text-white text-xs font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-3">
          <div className="w-full bg-[#1c1c1c] border border-[#333] p-4 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center">
               <Zap size={14} />
             </div>
             <p className="text-gray-400 text-[11px] text-left">
               Direct <strong>115200 Baud</strong> link for high-speed spectral sampling.
             </p>
          </div>
          <div className="w-full bg-[#0f0f0f] border border-[#333] p-3 rounded-xl flex items-center gap-3">
             <Terminal size={14} className="text-gray-600" />
             <code className="text-[10px] text-gray-500 font-mono">READY_FOR_HANDSHAKE_TX_RX</code>
          </div>
        </div>
      )}

      <div className="mt-auto w-full flex flex-col gap-3">
        <button 
          onClick={connectUSB} 
          disabled={loading}
          className="btn-primary w-full bg-purple-600 hover:bg-purple-700 border-0"
        >
          {loading ? (
             <span className="flex items-center gap-2"><RefreshCw size={18} className="animate-spin" /> INITIALIZING...</span>
          ) : (
             'SELECT USB PORT'
          )}
        </button>
        <button onClick={onCancel} className="btn-secondary w-full" disabled={loading}>Cancel</button>
      </div>
    </div>
  );
}
