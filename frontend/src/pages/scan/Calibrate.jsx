import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, FlaskConical, CheckCircle, AlertTriangle,
  Trash2, Clock, Zap, Search, ChevronRight, RotateCcw
} from 'lucide-react';
import { OIL_REFERENCE_DATA } from '../../lib/oilReferenceData';
import {
  saveCalibration, loadAllCalibrations, deleteCalibration, isCalibrated
} from '../../lib/calibrationStore';
import { getActiveConnection } from '../../lib/sensorConnection';
import { safeLocalFetch } from '../../lib/sensorApi';
import { supabase } from '../../lib/supabase';

const SAMPLE_INTERVAL_MS = 1500;  // read every 1.5s
const TOTAL_SAMPLES      = 8;     // collect 8 readings → ~12s total

// ── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ['select', 'prepare', 'recording', 'done'];

export default function Calibrate() {
  const navigate = useNavigate();
  const conn = getActiveConnection();

  const [step, setStep]           = useState('select');   // 'select' | 'prepare' | 'recording' | 'done'
  const [search, setSearch]       = useState('');
  const [selectedOil, setSelected]= useState(null);
  const [readings, setReadings]   = useState([]);         // collected raw readings
  const [samplesLeft, setSamplesLeft] = useState(TOTAL_SAMPLES);
  const [calibration, setCalibration] = useState(null);  // saved result
  const [error, setError]         = useState('');
  const [allCalibrations, setAllCalibrations] = useState({});
  const [showManage, setShowManage] = useState(false);

  const intervalRef = useRef(null);
  const readingsRef = useRef([]);

  // Load existing calibrations
  useEffect(() => {
    setAllCalibrations(loadAllCalibrations());
  }, []);

  const refreshCalibrations = () => setAllCalibrations(loadAllCalibrations());

  // ── Fetch a single reading from the ESP ─────────────────────────────────
  const fetchOneReading = useCallback(async () => {
    try {
      let data = null;

      if (conn?.mode === 'CLOUD') {
        // Cloud mode — pull latest from Supabase
        const { data: rows } = await supabase
          .from('readings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        data = rows?.[0] || null;
      } else {
        // Local / BLE mode — direct fetch
        const raw = await safeLocalFetch();
        data = raw;
      }

      if (!data) return null;
      return {
        wavelength:         parseFloat(data.wavelength  ?? data.light  ?? 0),
        temperature:        parseFloat(data.temperature ?? 0),
        density:            parseFloat(data.density     ?? 0),
        adulteration_index: parseFloat(data.adulteration_index ?? 0),
      };
    } catch (_) {
      return null;
    }
  }, [conn]);

  // ── Start recording ──────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    readingsRef.current = [];
    setReadings([]);
    setSamplesLeft(TOTAL_SAMPLES);
    setError('');
    setStep('recording');

    intervalRef.current = setInterval(async () => {
      const reading = await fetchOneReading();
      if (reading && (reading.wavelength > 0 || reading.density > 0)) {
        readingsRef.current = [...readingsRef.current, reading];
        setReadings([...readingsRef.current]);
        setSamplesLeft(TOTAL_SAMPLES - readingsRef.current.length);
      }

      if (readingsRef.current.length >= TOTAL_SAMPLES) {
        clearInterval(intervalRef.current);
        // Save calibration
        const result = saveCalibration(selectedOil.oilName, readingsRef.current);
        setCalibration(result);
        refreshCalibrations();
        setStep('done');
      }
    }, SAMPLE_INTERVAL_MS);
  }, [selectedOil, fetchOneReading]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleDeleteCal = (oilName) => {
    deleteCalibration(oilName);
    refreshCalibrations();
  };

  const handleRedo = () => {
    setStep('prepare');
    setReadings([]);
    setCalibration(null);
  };

  const filteredOils = OIL_REFERENCE_DATA.filter(o =>
    o.oilName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Step progress indicator ──────────────────────────────────────────────
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="flex flex-col min-h-screen theme-bg animate-fade-in pb-28">

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] sticky top-0 z-10 theme-bg">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-black text-sm theme-text uppercase tracking-widest">Sensor Calibration</h1>
          <p className="text-[9px] text-[#d4af37] font-bold">Device-Specific Accuracy</p>
        </div>
        <button
          onClick={() => setShowManage(!showManage)}
          className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text"
          title="Manage calibrations"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {['Select Oil', 'Prepare', 'Recording', 'Complete'].map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-all ${i <= stepIdx ? 'bg-[#d4af37]' : 'bg-[var(--bg-elevated)]'}`} />
              <span className={`text-[8px] font-bold uppercase tracking-wider ${i <= stepIdx ? 'text-[#d4af37]' : 'text-[var(--text-muted)]'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Existing calibrations manager ── */}
        {showManage && (
          <div className="card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm theme-text">Saved Calibrations</h2>
              <span className="text-[9px] text-[var(--text-muted)] font-bold">
                {Object.keys(allCalibrations).length} oil(s)
              </span>
            </div>
            {Object.keys(allCalibrations).length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-2">No calibrations saved yet.</p>
            ) : (
              Object.entries(allCalibrations).map(([oilName, cal]) => (
                <div key={oilName} className="flex items-center justify-between bg-[var(--bg-elevated)] rounded-xl p-3">
                  <div>
                    <p className="font-bold text-xs theme-text">{oilName}</p>
                    <p className="text-[9px] text-[var(--text-muted)]">
                      {cal.sampleCount} samples · {new Date(cal.calibratedAt).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] text-[#d4af37] font-mono mt-0.5">
                      λ: {cal.wavelength.min}–{cal.wavelength.max} nm
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCal(oilName)}
                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 1: Select Oil                                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 'select' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <FlaskConical size={20} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-sm text-[#d4af37] mb-1">How Calibration Works</p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Place a <strong className="theme-text">certified pure sample</strong> of your oil in front of the sensor.
                    The app reads 8 live readings and builds a <strong className="theme-text">device-specific baseline</strong>.
                    Future tests on this oil will use your exact device's sensor profile for maximum accuracy.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search oil to calibrate..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-[#d4af37] rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-colors theme-text placeholder:text-[var(--text-muted)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              {filteredOils.map(oil => {
                const hasCal = isCalibrated(oil.oilName);
                return (
                  <button
                    key={oil.oilName}
                    onClick={() => { setSelected(oil); setStep('prepare'); }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[#d4af37]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: oil.color }} />
                      <div className="text-left">
                        <p className="font-bold text-sm theme-text">{oil.oilName}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{oil.descriptor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasCal && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                          Calibrated
                        </span>
                      )}
                      <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[#d4af37] transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 2: Prepare                                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 'prepare' && selectedOil && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Oil badge */}
            <div className="flex items-center gap-3 p-4 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-color)]">
              <div className="w-10 h-10 rounded-full border border-white/20" style={{ backgroundColor: selectedOil.color }} />
              <div>
                <p className="font-black text-sm theme-text">{selectedOil.oilName}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{selectedOil.descriptor}</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="card p-5 flex flex-col gap-4">
              <h2 className="font-black text-sm theme-text flex items-center gap-2">
                <Clock size={16} className="text-[#d4af37]" />
                Before You Start — Checklist
              </h2>
              {[
                { ok: true, text: 'Use a certified FSSAI-approved or lab-grade pure sample' },
                { ok: true, text: 'Ensure the oil is at room temperature (20–35°C)' },
                { ok: true, text: 'Place the oil container in front of the sensor as you normally would during testing' },
                { ok: true, text: 'Keep the sensor still — any movement will affect readings' },
                { ok: conn !== null, text: conn ? `Sensor connected via ${conn.mode}` : '⚠ No sensor connected — connect a device first' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.ok ? 'bg-green-500/8 border border-green-500/20' : 'bg-red-500/8 border border-red-500/20'}`}>
                  {item.ok
                    ? <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    : <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={startRecording}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Start Calibration — {TOTAL_SAMPLES} Readings
              </button>
              <button
                onClick={() => setStep('select')}
                className="w-full py-3 rounded-2xl font-bold text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-color)]"
              >
                ← Back to Oil Selection
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 3: Recording                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 'recording' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Live progress ring */}
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                  <circle
                    cx="70" cy="70" r="60"
                    fill="none" stroke="#d4af37" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - readings.length / TOTAL_SAMPLES)}
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease-out', filter: 'drop-shadow(0 0 4px #d4af37)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#d4af37] font-mono">{readings.length}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">of {TOTAL_SAMPLES}</span>
                </div>
              </div>
              <p className="text-sm font-bold theme-text animate-pulse">Collecting pure oil readings…</p>
              <p className="text-xs text-[var(--text-muted)] text-center">
                Keep the sensor still. {samplesLeft} sample{samplesLeft !== 1 ? 's' : ''} remaining.
              </p>
            </div>

            {/* Live readings table */}
            {readings.length > 0 && (
              <div className="card p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Live Sample Data</p>
                <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">
                  <span>#</span><span>λ nm</span><span>°C</span><span>g/cm³</span>
                </div>
                {readings.map((r, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 text-[11px] font-mono text-[var(--text-secondary)] py-1.5 border-t border-[var(--border-color)] px-1">
                    <span className="text-[#d4af37] font-bold">{i + 1}</span>
                    <span>{r.wavelength.toFixed(1)}</span>
                    <span>{r.temperature.toFixed(1)}</span>
                    <span>{r.density.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 4: Done                                                      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 'done' && calibration && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Success banner */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-black text-base text-green-500">Calibration Saved!</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {selectedOil?.oilName} · {calibration.sampleCount} samples averaged
                </p>
              </div>
            </div>

            {/* Calibrated ranges */}
            <div className="card p-5 flex flex-col gap-4">
              <h2 className="font-black text-sm theme-text flex items-center gap-2">
                <Zap size={14} className="text-[#d4af37]" />
                Your Device's Pure Oil Baseline
              </h2>

              {[
                { label: 'Light Absorption (Wavelength)', center: calibration.wavelength.center, min: calibration.wavelength.min, max: calibration.wavelength.max, unit: 'nm', color: '#d4af37' },
                { label: 'Temperature',   center: calibration.temperature.center,  min: calibration.temperature.min,  max: calibration.temperature.max,  unit: '°C',   color: '#60a5fa' },
                { label: 'Density',       center: calibration.density.center,       min: calibration.density.min,       max: calibration.density.max,       unit: 'g/cm³',color: '#a78bfa' },
              ].map(({ label, center, min, max, unit, color }) => (
                <div key={label} className="bg-[var(--bg-elevated)] rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
                    <span className="text-xs font-black font-mono" style={{ color }}>{center} {unit}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-mono">
                    <span>Min: {min} {unit}</span>
                    <span className="text-green-500 font-bold">PURE RANGE</span>
                    <span>Max: {max} {unit}</span>
                  </div>
                </div>
              ))}

              <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-3">
                <p className="text-[10px] text-[#d4af37] font-bold leading-relaxed">
                  ✓ All future {selectedOil?.oilName} analyses will use these calibrated ranges (+10% confidence bonus).
                  This baseline reflects YOUR specific sensor hardware and environment.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/scan/readings')}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#f5c842] to-[#d4af37] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] active:scale-[0.97] transition-all"
              >
                Start Testing with Calibrated Mode
              </button>
              <button
                onClick={handleRedo}
                className="w-full py-3 rounded-2xl font-bold text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Recalibrate this Oil
              </button>
              <button
                onClick={() => { setStep('select'); setSelected(null); }}
                className="w-full py-3 rounded-2xl font-bold text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-color)]"
              >
                Calibrate Another Oil
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
