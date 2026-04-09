import { Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DeviceStatus() {
  const { deviceStatus } = useApp();
  const isOnline = deviceStatus === 'online';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
      isOnline 
        ? 'bg-green-500/10 border-green-500/30 text-green-500' 
        : 'bg-red-500/10 border-red-500/30 text-red-500'
    }`}>
      {isOnline ? (
        <>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <Wifi size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">ESP32 Online</span>
        </>
      ) : (
        <>
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <WifiOff size={14} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest">No Device</span>
        </>
      )}
    </div>
  );
}
