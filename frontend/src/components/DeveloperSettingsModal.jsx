import { useState, useEffect } from 'react';
import { Settings, Sliders, Play, RotateCcw, ShieldCheck, Zap, X, CheckCircle2 } from 'lucide-react';
import { getVerificationSettings, saveVerificationSettings, generateDemoReports, resetDemoData } from '../services/intelligenceService';

export default function DeveloperSettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [settings, setSettings] = useState(getVerificationSettings());
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSettings(getVerificationSettings());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Sliders className="text-[#d4af37]" size={18} />
            <h3 className="text-sm font-black text-[var(--text-color)]">Developer & Verification Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">

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
                Development Mode
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
                Production Mode
              </button>
            </div>
            <p className="text-[11px] text-gray-400 italic">
              {settings.mode === 'dev'
                ? '⚡ Development Mode: 1 suspicious scan is enough to trigger a public hotspot immediately (designed for hackathon demos).'
                : '🛡️ Production Mode: Requires multiple independent users/devices before publishing a public hotspot.'}
            </p>
          </div>

          {/* Configurable Threshold */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block">
              Minimum Reports Required Before Public Hotspot
            </label>
            <select
              value={settings.threshold}
              onChange={e => handleThresholdChange(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold text-white"
            >
              <option value={1}>1 Report (Immediate Demo Verification)</option>
              <option value={2}>2 Independent Reports</option>
              <option value={3}>3 Independent Reports</option>
              <option value={5}>5 Independent Reports (Standard Production)</option>
              <option value={10}>10 Independent Reports (High Confidence)</option>
            </select>
          </div>

          {/* Demo Data Generator */}
          <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
              <Play size={14} /> Demo Data Generator
            </label>
            <p className="text-[11px] text-gray-400">Seed realistic sample reports across Indian cities to demonstrate heatmaps & analytics:</p>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleGenerateDemoData(10)}
                className="py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-white transition-all"
              >
                +10 Reports
              </button>
              <button
                onClick={() => handleGenerateDemoData(50)}
                className="py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] border border-[var(--border-color)] rounded-xl text-xs font-bold font-black text-[#d4af37] transition-all"
              >
                +50 Reports
              </button>
              <button
                onClick={() => handleGenerateDemoData(100)}
                className="py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-emerald-400 transition-all"
              >
                +100 Reports
              </button>
            </div>
          </div>

          {/* Reset Demo Data Action */}
          <div className="border-t border-[var(--border-color)] pt-4">
            <button
              onClick={handleResetData}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={14} /> Reset Demo Hotspots & Data
            </button>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} /> {toastMsg}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
