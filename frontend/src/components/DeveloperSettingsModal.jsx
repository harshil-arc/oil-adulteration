import { useState, useEffect } from 'react';
import { Settings, Sliders, Play, RotateCcw, ShieldCheck, Zap, X, CheckCircle2, Tv, Cpu } from 'lucide-react';
import { getVerificationSettings, saveVerificationSettings, generateDemoReports, resetDemoData } from '../services/intelligenceService';
import { isOledSyncEnabled, setOledSyncEnabled, sendDemoAiResultToEsp32 } from '../services/syncService';

export default function DeveloperSettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState(getVerificationSettings());
  const [oledEnabled, setOledEnabled] = useState(isOledSyncEnabled());
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSettings(getVerificationSettings());
      setOledEnabled(isOledSyncEnabled());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModeChange = (mode) => {
    const newSettings = {
      ...settings,
      mode,
      threshold: mode === 'dev' ? 1 : 5,
    };
    setSettings(newSettings);
    saveVerificationSettings(newSettings);
    if (onSettingsUpdated) onSettingsUpdated(newSettings);
    showToast(`Switched to ${mode === 'dev' ? 'Development Mode (Threshold = 1)' : 'Production Mode (Threshold = 5)'}`);
  };

  const handleOledSyncToggle = (val) => {
    setOledEnabled(val);
    setOledSyncEnabled(val);
    showToast(`ESP32 OLED AI Results Display: ${val ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleSendDemoAiResult = async () => {
    const res = await sendDemoAiResultToEsp32();
    if (res.success) {
      showToast('🎉 Hackathon Demo: Test AI Result Packet sent to ESP32 OLED!');
    } else {
      showToast('⚠️ Demo Packet sent via Cloud RTDB sync.');
    }
  };

  const handleThresholdChange = (threshold) => {
    const newSettings = { ...settings, threshold: Number(threshold) };
    setSettings(newSettings);
    saveVerificationSettings(newSettings);
    if (onSettingsUpdated) onSettingsUpdated(newSettings);
    showToast(`Verification threshold set to ${threshold} report(s).`);
  };

  const handleGenerateDemoData = (count) => {
    generateDemoReports(count);
    showToast(`Generated ${count} realistic demo reports for heatmap visualization.`);
    if (onSettingsUpdated) onSettingsUpdated(settings);
  };

  const handleResetData = () => {
    resetDemoData();
    showToast('Reset all demo hotspots and analytics statistics.');
    if (onSettingsUpdated) onSettingsUpdated(settings);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Sliders className="text-[#d4af37]" size={18} />
            <h3 className="text-sm font-black text-[var(--text-color)]">Hardware & AI Sync Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* TWO-WAY OLED DISPLAY AI RESULT SETTING */}
          <div className="bg-[#d4af37]/10 p-4 rounded-2xl border border-[#d4af37]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="text-[#d4af37]" size={18} />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">ESP32 OLED Display AI Results</h4>
                  <p className="text-[10px] text-gray-400">Sync app predictions to hardware OLED pages</p>
                </div>
              </div>

              <button
                onClick={() => handleOledSyncToggle(!oledEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  oledEnabled ? 'bg-emerald-500 text-black shadow-glow-green' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {oledEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* HACKATHON DEMO MODE BUTTON */}
            <button
              onClick={handleSendDemoAiResult}
              className="w-full py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[#d4af37]/40 text-xs font-black text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <Cpu size={14} />
              Demo Mode (Hackathon): Test OLED Carousel Sync →
            </button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block">
              Operating Mode Selector
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[var(--bg-elevated)] p-1 rounded-2xl border border-[var(--border-color)]">
              <button
                onClick={() => handleModeChange('dev')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  settings.mode === 'dev'
                    ? 'bg-[#d4af37] text-black font-black shadow-glow-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap size={14} />
                Dev Mode
              </button>

              <button
                onClick={() => handleModeChange('prod')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  settings.mode === 'prod'
                    ? 'bg-emerald-500 text-black font-black shadow-glow-green'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={14} />
                Prod Mode
              </button>
            </div>
          </div>

          {/* Verification Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Hotspot Threshold
              </label>
              <span className="text-xs font-mono font-bold text-[#d4af37]">
                {settings.threshold} Report(s)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.threshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="w-full accent-[#d4af37] bg-gray-700 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Demo Actions */}
          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block">
              Analytics Heatmap Controls
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGenerateDemoData(10)}
                className="py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-1"
              >
                <Play size={14} className="text-emerald-400" />
                +10 Demo Scans
              </button>

              <button
                onClick={handleResetData}
                className="py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-gray-300 hover:text-red-400 flex items-center justify-center gap-1"
              >
                <RotateCcw size={14} className="text-red-400" />
                Reset Heatmap
              </button>
            </div>
          </div>

          {toastMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} />
              {toastMsg}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
