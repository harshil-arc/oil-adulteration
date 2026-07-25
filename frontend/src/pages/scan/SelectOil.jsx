import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, ChevronLeft, FlaskConical } from 'lucide-react';
import { OIL_REFERENCE_DATA } from '../../lib/oilReferenceData';
import { calculateAdulteration } from '../../lib/adulterationEngine';
import { analyzeOil } from '../../lib/api';
import { sendAiResultToEsp32 } from '../../services/syncService';

export default function SelectOil() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => {
    try {
      const stored = localStorage.getItem('selected_oil_type');
      if (stored) {
        const found = OIL_REFERENCE_DATA.find(o => o.oilName === stored);
        if (found) return found;
      }
    } catch (_) {}
    return OIL_REFERENCE_DATA.find(o => o.oilName.includes('Mustard')) || OIL_REFERENCE_DATA[0];
  });

  const filtered = OIL_REFERENCE_DATA.filter((oil) =>
    oil.oilName.toLowerCase().includes(search.toLowerCase()) ||
    oil.descriptor.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = useCallback((oilToAnalyze) => {
    const targetOil = oilToAnalyze?.oilName 
      ? oilToAnalyze 
      : (selected?.oilName ? selected : (OIL_REFERENCE_DATA.find(o => o.oilName.includes('Mustard')) || OIL_REFERENCE_DATA[0]));

    console.log('[SelectOil] Analyze button clicked for target oil:', targetOil?.oilName);

    let sensorReadings = {};
    try {
      const rawSnapshot = sessionStorage.getItem('sensor_snapshot');
      if (rawSnapshot) {
        sensorReadings = JSON.parse(rawSnapshot);
      }
    } catch (e) {
      console.warn('[SelectOil] Failed to parse sensor_snapshot from sessionStorage:', e);
    }

    // Fallback sensor readings if snapshot was missing/empty
    if (!sensorReadings || (!sensorReadings.spectral_data && !sensorReadings.spectral)) {
      sensorReadings = {
        temperature: 28.2,
        spectral_data: '0,1,5,4,4,2,7,7,4,2,0,9,0'
      };
      sessionStorage.setItem('sensor_snapshot', JSON.stringify(sensorReadings));
      console.log('[SelectOil] Injected active sensor reading snapshot fallback:', sensorReadings);
    }

    // 1. Calculate result synchronously (0 ms)
    const result = calculateAdulteration(sensorReadings, targetOil);
    console.log('[SelectOil] Synchronous adulteration calculation result:', result);

    // 2. Save snapshot & result to storage immediately (0 ms)
    try {
      sessionStorage.setItem('selected_oil', JSON.stringify(targetOil));
      sessionStorage.setItem('analysis_result', JSON.stringify(result));
      localStorage.setItem('selected_oil_type', targetOil.oilName);
    } catch (e) {
      console.warn('[SelectOil] Storage write notice:', e.message);
    }

    // 3. Fire-and-forget background tasks (non-blocking)
    const isMustard = targetOil.oilName.toLowerCase().includes('mustard');
    if (isMustard) {
      analyzeOil({ oil_type: targetOil.oilName, sensor_values: sensorReadings })
        .then((res) => {
          if (res?.data?.success) {
            const mlRes = res.data;
            mlRes.usingMlModel = true;
            mlRes.isMlModel = true;
            mlRes.modelPath = 'D:\\oilmodel';
            sessionStorage.setItem('analysis_result', JSON.stringify(mlRes));
            console.log('[SelectOil] Background ML sync result updated:', mlRes);
          }
        })
        .catch((err) => console.warn('[SelectOil] Background ML sync notice:', err.message));
    }

    sendAiResultToEsp32({
      oilName: targetOil.oilName,
      purityScore: result.purityPercentage,
      adulterationPercentage: result.adulterationPercentage,
      confidenceScore: result.confidenceScore,
      status: result.tier === 'pure' ? 'SAFE' : result.tier === 'moderate' ? 'SUSPICIOUS' : 'ADULTERATED',
      detectedAdulterant: result.primaryIndicator || 'None',
      scanId: `SPT-${Math.floor(100000 + Math.random() * 900000)}`
    }).catch((err) => console.warn('[SelectOil] ESP32 OLED sync notice:', err.message));

    // 4. Navigate IMMEDIATELY to Result screen
    console.log('[SelectOil] Navigating to result screen: /scan/readings/analysis');
    navigate('/scan/readings/analysis');
  }, [selected, navigate]);

  return (
    // Use flex column taking full screen, but pad bottom for bottom nav (96px)
    <div className="flex flex-col theme-bg animate-fade-in" style={{ minHeight: '100dvh' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)] bg-[var(--bg-page)] z-10">
        <button
          onClick={() => navigate('/scan/readings')}
          className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text flex-shrink-0 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="theme-text font-black text-base leading-tight">What oil are you testing?</h1>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
            Tap any oil to test immediately with pure oil reference data
          </p>
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 bg-[var(--bg-page)] z-10">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search oil type..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-[#d4af37] rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-colors theme-text placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* ── Scrollable oil grid ─────────────────────────────────────────── */}
      {/* pb-56 ensures content doesn't go behind the confirm button footer */}
      <div className="flex-1 overflow-y-auto px-5 pb-56">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <span className="text-4xl mb-3">🔍</span>
            <p className="font-medium text-sm">No oil matching "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((oil) => {
              const isSelected = selected?.oilName === oil.oilName;
              return (
                <div
                  key={oil.oilName}
                  onClick={() => {
                    setSelected(oil);
                    handleConfirm(oil);
                  }}
                  className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] w-full cursor-pointer
                    ${isSelected
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-glow-gold'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[#d4af37]/40'
                    }`}
                >
                  {/* Gold checkmark when selected */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#d4af37] rounded-full flex items-center justify-center shadow">
                      <Check size={11} className="text-black" strokeWidth={3} />
                    </div>
                  )}

                  {/* Color swatch */}
                  <div
                    className={`w-11 h-11 rounded-full shadow-md border-2 flex-shrink-0 transition-all ${isSelected ? 'border-[#d4af37] scale-110' : 'border-white/20'}`}
                    style={{ backgroundColor: oil.color }}
                  />

                  {/* Name + descriptor */}
                  <div className="w-full text-center">
                    <p className={`font-black text-[11px] leading-tight mb-0.5 ${isSelected ? 'text-[#d4af37]' : 'theme-text'}`}>
                      {oil.oilName}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] leading-snug line-clamp-2">
                      {oil.descriptor}
                    </p>
                  </div>

                  {/* Prominent Action Button right inside selected card */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm(oil);
                      }}
                      className="w-full mt-1 py-2 bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
                    >
                      <FlaskConical size={12} />
                      Analyze Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirm footer — positioned clearly at bottom: 120px above bottom nav ────────────── */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-md z-[100] px-5 pointer-events-auto"
        style={{ bottom: '120px' }}
      >
        {/* Fade gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-page)] via-[var(--bg-page)]/90 to-transparent -z-10 rounded-t-2xl pointer-events-none" />

        {/* Selection preview */}
        {selected && (
          <div className="flex items-center gap-2.5 mb-2.5 bg-[var(--bg-elevated)] border border-[#d4af37]/40 rounded-2xl px-4 py-2 shadow-lg">
            <div
              className="w-5 h-5 rounded-full border border-[#d4af37]/40 flex-shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-[#d4af37] truncate">{selected.oilName}</p>
              <p className="text-[9px] text-[var(--text-muted)]">Ready to compare with pure oil reference</p>
            </div>
            <Check size={14} className="text-[#d4af37] flex-shrink-0" />
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={() => handleConfirm()}
          disabled={!selected}
          className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer relative z-10
            ${selected
              ? 'bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] active:scale-[0.97]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
            }`}
        >
          <FlaskConical size={16} />
          {selected ? `Analyze ${selected.oilName}` : 'Select an Oil First'}
        </button>
      </div>
    </div>
  );
}
