import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Cloud, Bluetooth, ChevronLeft, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setActiveConnection } from '../../lib/sensorConnection';

export default function ProtocolSelector() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [savedIp, setSavedIp] = useState('');

  useEffect(() => {
    try {
      const lastIp = localStorage.getItem('esp32_last_ip');
      if (lastIp) setSavedIp(lastIp);
    } catch (_) {}
  }, []);

  const handleQuickLocalConnect = (ipToUse) => {
    const cleanIp = (ipToUse || savedIp || '192.168.1.1').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    setActiveConnection({ mode: 'LOCAL', ip: cleanIp });
    navigate('/scan/readings');
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
            {t('scan.connection_hub', 'Connection Hub')}
          </h1>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            {t('scan.level4_link', 'Level 4 Secured Link')}
          </p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe overflow-y-auto pb-12">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-black theme-text mb-1">{t('scan.pair_sensor', 'Pair Sensor')}</h2>
          <p className="text-gray-500 text-xs">{t('scan.select_connection_desc', 'Connect your ESP32 device directly over the same Wi-Fi/Hotspot or through Cloud.')}</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* 1. Local Network Mode (RECOMMENDED FOR LOW CONNECTIVITY / DIRECT SPEED) */}
          <div
            onClick={() => navigate('/scan/local')}
            className="card hover:border-[#d4af37] cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative border-2 border-[#d4af37]/60 bg-gradient-to-br from-[var(--bg-card)] via-amber-500/10 to-[#d4af37]/20 shadow-glow-gold"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wifi size={120} strokeWidth={1} className="text-[#d4af37]" />
            </div>
            <div className="flex flex-col gap-3 relative z-10 w-full p-2">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-gradient-to-br from-[#f5c842] to-[#d4af37] rounded-2xl text-black shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                  <Wifi size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start w-full gap-2">
                    <h3 className="theme-text font-black text-lg leading-tight">Same Network Direct Link</h3>
                    <span className="bg-[#d4af37] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm shrink-0">
                      ⚡ FAST / LOW NET
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 font-medium leading-relaxed">
                    Direct communication when phone & ESP32 are on the same Wi-Fi or Hotspot. Instant live readings & OLED sync.
                  </p>
                </div>
              </div>

              {savedIp && (
                <div className="mt-1 pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 font-mono truncate">
                    Last Device: <strong className="text-[#d4af37]">{savedIp}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLocalConnect(savedIp);
                    }}
                    className="px-3 py-1 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shrink-0"
                  >
                    Quick Connect <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Cloud Mode */}
          <div
            onClick={() => navigate('/scan/cloud')}
            className="card hover:border-[#0052ff] cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-blue-500/5"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cloud size={100} strokeWidth={1} />
            </div>
            <div className="flex items-start gap-4 relative z-10 w-full p-2">
              <div className="p-3 bg-[#0052ff]/20 text-[#0052ff] rounded-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Cloud size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start w-full gap-2">
                  <h3 className="theme-text font-black text-base">Cloud Remote Sync</h3>
                  <span className="bg-[#0052ff]/20 text-[#0052ff] text-[8px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                    Internet Mode
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1 font-medium">
                  Fetches sensor telemetry pushed to Firebase / Supabase cloud database over the internet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl flex gap-3 items-center">
          <ShieldCheck size={22} className="text-[#d4af37] flex-shrink-0" />
          <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
            For low-connectivity areas or field tests, turn on your Phone's Hotspot, connect the ESP32 to it, and use <strong>Same Network Direct Link</strong> for instant zero-lag testing!
          </p>
        </div>
      </div>
    </div>
  );
}

