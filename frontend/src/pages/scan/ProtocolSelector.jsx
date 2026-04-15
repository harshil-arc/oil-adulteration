import { useNavigate } from 'react-router-dom';
import { Bluetooth, Wifi, Cloud, AlertTriangle, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function ProtocolSelector() {
  const navigate = useNavigate();
  const isHttps = window.location.protocol === 'https:';

  const showUsbToast = () => {
    // Simple alert-based toast for USB
    alert('USB mode works best on desktop Chrome with Arduino Serial Monitor.');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-20 theme-bg">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)] pb-4">
        <button onClick={() => navigate('/home')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">
            Connection Hub
          </h1>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            Level 4 Secured Link
          </p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-black theme-text mb-1">Pair Sensor</h2>
          <p className="text-gray-500 text-sm">Select a connection method for your ESP32 device.</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Card 1 — Bluetooth (PRIMARY) */}
          <div
            onClick={() => navigate('/scan/bluetooth')}
            className="card hover:border-blue-500/50 cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Bluetooth size={120} strokeWidth={1} />
            </div>
            <div className="flex items-start gap-4 relative z-10 w-full">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Bluetooth size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start w-full">
                  <h3 className="theme-text font-bold text-lg">Bluetooth</h3>
                  <span className="bg-[#C8952A] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">✓ Recommended</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Wire-free pairing via GATT. Best for portable field tests. Requires Chrome.</p>
              </div>
            </div>
          </div>

          {/* Card 2 — Local Network (DEV ONLY) */}
          <div
            onClick={() => navigate('/scan/local')}
            className="card transition-all group overflow-hidden relative cursor-pointer hover:border-[#C8952A]/50 active:scale-[0.98]"
          >
            <div className="flex items-start gap-4 relative z-10 w-full">
              <div className="p-3 bg-[#C8952A]/10 rounded-2xl text-[#C8952A] transition-colors">
                <Wifi size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start w-full">
                  <h3 className="theme-text font-bold text-lg">Local Network</h3>
                  <span className="bg-gray-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">Dev Only</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Direct IP or router scan. Most stable for long sessions & real-time data.</p>
                {!isHttps && <p className="text-[#C8952A] text-[9px] font-bold mt-1 uppercase tracking-tighter">Perfect for local testing</p>}
                {isHttps && <p className="text-amber-500/80 text-[9px] font-bold mt-1 uppercase tracking-tighter">Requires "Allow Insecure Content" in browser</p>}
              </div>
            </div>
          </div>

          {/* Card 3 — Cloud Sync (FALLBACK) */}
          <div
            onClick={() => navigate('/scan/cloud')}
            className="card hover:border-purple-500/50 cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cloud size={120} strokeWidth={1} />
            </div>
            <div className="flex items-start gap-4 relative z-10 w-full">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Cloud size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start w-full">
                  <h3 className="theme-text font-bold text-lg">Cloud Mode</h3>
                  <span className="bg-[#1c1c1c] border border-[#333] text-gray-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">Fallback</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Fetches latest data pushed by the ESP32 to the Supabase cloud database.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom warning */}
        <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            ⚠️ Web Bluetooth and USB require <strong className="text-[#C8952A]">Chrome or Edge browser</strong> and a secure HTTPS connection. Samsung Internet and Firefox are not supported.
          </p>
        </div>
      </div>
    </div>
  );
}
