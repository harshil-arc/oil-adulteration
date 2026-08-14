import { useNavigate } from 'react-router-dom';
import { Cloud, ChevronLeft, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProtocolSelector() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

      <div className="flex-1 p-5 flex flex-col pt-safe">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-black theme-text mb-1">{t('scan.pair_sensor', 'Pair Sensor')}</h2>
          <p className="text-gray-500 text-sm">{t('scan.select_connection_desc', 'Select a connection method for your testing device.')}</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Cloud Mode (PRIMARY & ONLY METHOD) */}
          <div
            onClick={() => navigate('/scan/cloud')}
            className="card hover:border-[#0052ff] cursor-pointer transition-all active:scale-[0.98] group overflow-hidden relative border-2 border-[#0052ff]/40 bg-gradient-to-br from-[var(--bg-card)] to-blue-500/10 shadow-lg"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cloud size={120} strokeWidth={1} />
            </div>
            <div className="flex items-start gap-4 relative z-10 w-full p-2">
              <div className="p-3.5 bg-[#0052ff] rounded-2xl text-white shadow-md group-hover:scale-105 transition-transform">
                <Cloud size={28} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start w-full">
                  <h3 className="theme-text font-black text-xl">{t('scan.cloud_mode', 'Cloud Mode & Sensor Sync')}</h3>
                  <span className="bg-[#0052ff] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                    ✓ {t('common.active', 'ACTIVE')}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1.5 font-medium">
                  {t('scan.cloud_mode_desc', 'Fetches real-time spectral data synced directly from your ESP32 testing device.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-3 items-center">
          <ShieldCheck size={22} className="text-[#0052ff] flex-shrink-0" />
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
            {t('scan.cloud_info', 'Cloud Mode automatically connects your Rapid Testing Sensor to the Food 360 AI Analysis Engine.')}
          </p>
        </div>
      </div>
    </div>
  );
}
