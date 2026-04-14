import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bluetooth, Wifi, Cloud, AlertTriangle, LogOut, ChevronLeft, RefreshCw, FlaskConical, Zap } from 'lucide-react';
import { getActiveConnection, clearConnection } from '../../lib/sensorConnection';
import { supabase } from '../../lib/supabase';


/* ------------------------------------------------------------------ */
/*  Readings Screen                                                    */
/* ------------------------------------------------------------------ */
export default function Readings() {
  const navigate = useNavigate();
  const connRef = useRef(getActiveConnection());

  const [data, setData] = useState({
    temperature: 0, wavelength: 0, density: 0, oil_type: '—', adulteration_index: 0,
  });

  const [failCount, setFailCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);
  // pollKey: incrementing this forces the polling useEffect to restart
  const [pollKey, setPollKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const conn = connRef.current;

  // Redirect if no connection
  useEffect(() => {
    if (!conn) navigate('/scan');
  }, [conn, navigate]);

  // ---- Polling / BLE listener ----------------------------------------
  useEffect(() => {
    if (!conn) return;
    let cancelled = false;
    let timer = null;
    let localFails = 0;

    console.log(`[Readings] Starting poll cycle (key=${pollKey}, mode=${conn.mode})`);

    // BLE mode — event-driven
    if (conn.mode === 'BLE') {
      const char = conn.characteristic;
      const handler = (event) => {
        try {
          const raw = new TextDecoder('utf-8').decode(event.target.value);
          const parsed = JSON.parse(raw);
          console.log('[Readings] BLE data:', parsed);
          setData(parsed);
          setFailCount(0);
          setLastUpdated(Date.now());
        } catch (e) { console.error('BLE parse', e); }
      };
      char.addEventListener('characteristicvaluechanged', handler);
      return () => char.removeEventListener('characteristicvaluechanged', handler);
    }

    // LOCAL or CLOUD — polling with exponential backoff
    const getBackoff = (fails) => {
      if (fails <= 0) return 2000;
      if (fails === 1) return 4000;
      if (fails === 2) return 8000;
      return 15000;
    };

    const poll = async () => {
      if (cancelled) return;
      if (localFails >= 5) {
        console.log('[Readings] 5 failures — stopping');
        setFailCount(5);
        return;
      }

      try {
        if (conn.mode === 'LOCAL') {
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), 2000);
          const res = await fetch(`http://${conn.ip}/data`, { signal: ctrl.signal });
          clearTimeout(tid);
          if (!res.ok) throw new Error('HTTP error');
          const json = await res.json();
          console.log('[Readings] LOCAL data:', json);
          setData({
            temperature:        json.temperature        ?? 0,
            wavelength:         json.wavelength         ?? 0,
            density:            json.density            ?? 0,
            oil_type:           json.oil_type           || '—',
            adulteration_index: json.adulteration_index ?? 0,
          });
          setFailCount(0);
          setLastUpdated(Date.now());
          localFails = 0;
        } else if (conn.mode === 'CLOUD') {
          console.log('[Readings] Fetching from Supabase readings table...');
          const { data: row, error } = await supabase
            .from('readings')
            .select('*')
            .eq('device', 'PureOil-Sensor')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error) {
            console.error('[Readings] Supabase error:', error);
            throw error;
          }
          if (row) {
            console.log('[Readings] CLOUD data:', row);
            setData({
              temperature:        row.temperature        ?? 0,
              wavelength:         row.wavelength         ?? 0,
              density:            row.density            ?? 0,
              oil_type:           row.oil_type           || '—',
              adulteration_index: row.adulteration_index ?? 0,
            });
            setFailCount(0);
            setLastUpdated(Date.now());
            localFails = 0;
          }
        }
      } catch (err) {
        console.error('[Readings] Poll error:', err);
        localFails++;
        setFailCount(localFails);
      }

      if (cancelled) return;
      if (localFails < 5) {
        timer = setTimeout(poll, getBackoff(localFails));
      }
    };

    // Start immediately
    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [conn, pollKey]); // pollKey forces restart on reconnect

  // ---- "Last updated Xs ago" counter ---------------------------------
  useEffect(() => {
    const t = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // ---- Disconnect handler --------------------------------------------
  const handleDisconnect = () => {
    if (conn?.mode === 'BLE' && conn.device?.gatt?.connected) {
      conn.device.gatt.disconnect();
    }
    clearConnection();
    navigate('/scan');
  };

  // ---- Reconnect handler — increments pollKey to restart useEffect ----
  const handleReconnect = () => {
    setFailCount(0);
    setPollKey(k => k + 1);
  };

  const handleSaveToHistory = async () => {
    setIsSaving(true);
    try {
      const record = {
        oil_type: data.oil_type || 'Unknown Raw Sample',
        purity: 0,
        quality: 'Raw Snapshot',
        adulteration_percentage: 0,
        confidence_score: 0,
        sensor_readings: data,
        connection_type: conn?.mode || 'Unknown',
        timestamp: new Date().toISOString(),
        vendor: 'Manual Save',
      };
      const { error } = await supabase.from('analysis_results').insert(record);
      if (error) throw error;
      alert("Reading saved to database history securely!");
    } catch (e) {
      console.error(e);
      alert("Failed to save: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!conn) return null;

  const isUnstable = failCount >= 3 && failCount < 5;
  const isDisconnected = failCount >= 5;

  const ModeIcon = conn.mode === 'BLE' ? Bluetooth : conn.mode === 'LOCAL' ? Wifi : Cloud;
  const modeColor = conn.mode === 'BLE' ? 'text-blue-500' : conn.mode === 'LOCAL' ? 'text-[#C8952A]' : 'text-purple-500';

  return (
    <div className="flex flex-col h-full relative z-20 theme-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button onClick={handleDisconnect} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="theme-text font-bold tracking-widest uppercase text-[10px]">LIVE TELEMETRY</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ModeIcon size={10} className={modeColor} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${modeColor}`}>
                {conn.mode === 'BLE' ? 'BLE' : conn.mode === 'LOCAL' ? 'WiFi Router' : 'Cloud'} Link
              </span>
            </div>
          </div>
        </div>
        <button onClick={handleDisconnect} className="text-gray-500 hover:text-red-500 transition-colors p-2" title="Disconnect">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex-1 p-5 flex flex-col pt-safe overflow-y-auto pb-24">
        {/* Failure banners */}
        {isDisconnected && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between gap-3 mb-4 animate-shake">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <div>
                <p className="text-red-500 text-xs font-bold uppercase">Disconnected from device</p>
                <p className="text-[10px] text-gray-500">Polling stopped after 5 consecutive failures.</p>
              </div>
            </div>
            <button onClick={handleReconnect} className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shrink-0">
              Reconnect
            </button>
          </div>
        )}
        {isUnstable && !isDisconnected && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3 mb-4">
            <RefreshCw size={16} className="text-amber-500 shrink-0 animate-spin" />
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-wider">Connection unstable — retrying…</p>
          </div>
        )}


        {/* Last updated pill */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1c1c1c] border border-[#333] px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${secondsAgo > 5 ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Last updated: {secondsAgo}s ago
            </span>
          </div>
        </div>

        {/* Sensor cards */}
        <div className="grid grid-cols-2 gap-4">
          <SensorCard label="Temperature" value={data.temperature} unit="°C" decimals={1} />
          <SensorCard label="Wavelength"  value={data.wavelength}  unit="nm"  decimals={0} />
          <SensorCard label="Density"     value={data.density}     unit="g/cm³" decimals={3} />
          <OilTypeCard label="Oil Type" value={data.oil_type} />
        </div>

        {/* ── Analyze Oil CTA ─────────────────────────── */}
        <div className="mt-2 p-[1px] rounded-2xl" style={{ background: 'linear-gradient(135deg, #f5c842, #d4af37)' }}>
          <button
            onClick={() => {
              // Snapshot the current sensor readings into sessionStorage
              sessionStorage.setItem('sensor_snapshot', JSON.stringify(data));
              navigate('/scan/readings/select-oil');
            }}
            className="w-full flex items-center justify-between p-5 bg-[var(--bg-card)] rounded-[calc(1rem-1px)] hover:bg-[#d4af37]/8 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5c842] to-[#d4af37] flex items-center justify-center shadow-glow-gold">
                <FlaskConical size={18} className="text-black" />
              </div>
              <div className="text-left">
                <p className="font-black text-sm theme-text">Analyze Oil Purity</p>
                <p className="text-[10px] text-[var(--text-muted)]">Select oil type → get adulteration %</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
              <FlaskConical size={14} className="text-[#d4af37] group-hover:text-black transition-colors" />
            </div>
          </button>
        </div>

        {/* ── Calibrate CTA ─────────────────────────────── */}
        <div className="mt-3 mb-2 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/scan/readings/calibrate')}
            className="flex items-center justify-center gap-2 p-4 border border-[var(--border-color)] bg-[var(--bg-elevated)] rounded-2xl hover:border-[#d4af37]/50 transition-colors group"
          >
            <Zap size={14} className="text-[#d4af37]" />
            <span className="font-bold text-[11px] theme-text uppercase tracking-widest">Calibrate</span>
          </button>
          
          <button
            onClick={handleSaveToHistory}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 p-4 border border-[var(--border-color)] bg-[var(--bg-elevated)] rounded-2xl hover:border-[#d4af37]/50 transition-colors group disabled:opacity-50"
          >
            <Cloud size={14} className="text-green-500" />
            <span className="font-bold text-[11px] theme-text uppercase tracking-widest">
              {isSaving ? 'Saving...' : 'Save DB'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable sensor value card                                         */
/* ------------------------------------------------------------------ */
function SensorCard({ label, value, unit, decimals = 1 }) {
  const display = value != null ? Number(value).toFixed(decimals) : '--';
  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{label}</span>
      <span className="text-2xl font-black text-white font-mono">
        {display}
        <span className="text-[12px] text-gray-500 ml-1">{unit}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Oil Type Card — text-based, no number formatting                   */
/* ------------------------------------------------------------------ */
function OilTypeCard({ label, value }) {
  return (
    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{label}</span>
      <span className="text-lg font-black text-[#d4af37] leading-tight mt-1">
        {value || '—'}
      </span>
    </div>
  );
}
