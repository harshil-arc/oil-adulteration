import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Share2, ChevronDown, ChevronUp, AlertTriangle,
  ShieldCheck, XCircle, ExternalLink, Info, Activity, Beaker, Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Groq config (same as AiChatbot) ────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      max_tokens: 1200,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  const raw = data.choices[0]?.message?.content || '{}';
  // Extract JSON from markdown code block if present
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(jsonMatch ? jsonMatch[1] : raw);
}

// ─── Animated Purity Gauge ───────────────────────────────────────────────────
function PurityGaugeAnimated({ purity = 100 }) {
  const clamped = Math.min(Math.max(purity, 0), 100);
  const circleRef = useRef(null);

  const radius = 80;
  const circumference = Math.PI * radius; // semicircle
  const targetOffset = circumference - (clamped / 100) * circumference;

  let color = '#22c55e';
  // We determine the color based on purity, but avoid changing the label below the percentage 
  // to "Adulterated" because it creates visual confusion (e.g. "47.4% Adulterated" looks like 
  // the adulteration percentage rather than the purity percentage).
  if (clamped < 40) { color = '#ef4444'; }
  else if (clamped < 80) { color = '#eab308'; }

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.transition = 'none';
    circleRef.current.style.strokeDashoffset = `${circumference}`;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!circleRef.current) return;
        circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.4s';
        circleRef.current.style.strokeDashoffset = `${targetOffset}`;
      });
    });
    return () => cancelAnimationFrame(raf1);
  }, [purity, targetOffset, circumference]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="220" height="120" viewBox="0 0 220 120">
          {/* Track */}
          <path d="M 10 110 A 100 100 0 0 1 210 110" fill="none" stroke="var(--bg-elevated)" strokeWidth={16} strokeLinecap="round" />
          {/* Progress */}
          <path
            ref={circleRef}
            d="M 10 110 A 100 100 0 0 1 210 110"
            fill="none"
            stroke={color}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-4xl font-black font-mono" style={{ color }}>{clamped.toFixed(1)}%</span>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">PURITY SCORE</span>
        </div>
      </div>
    </div>
  );
}

// ─── Deviation Bar ───────────────────────────────────────────────────────────
function DeviationBar({ detail }) {
  const { label, value, unit, rangeMin, rangeMax, inRange } = detail;
  const span = rangeMax - rangeMin;
  const pos = span > 0 ? Math.min(Math.max((value - rangeMin) / span, 0), 1) : 0.5;
  const dotColor = inRange ? '#22c55e' : '#ef4444';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
        <span className={`text-xs font-black font-mono ${inRange ? 'text-green-500' : 'text-red-500'}`}>
          {typeof value === 'number' ? value.toFixed(2) : value} {unit}
        </span>
      </div>
      <div className="relative h-2 bg-[var(--bg-elevated)] rounded-full overflow-visible">
        {/* Pure range zone */}
        <div
          className="absolute top-0 h-full rounded-full bg-green-500/20 border border-green-500/30"
          style={{ left: '0%', right: '0%' }}
        />
        {/* Actual value dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[var(--bg-page)] shadow-md"
          style={{ left: `calc(${pos * 100}% - 6px)`, backgroundColor: dotColor }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-[var(--text-muted)] font-mono">{rangeMin} {unit}</span>
        <span className="text-[9px] text-green-500 font-bold text-[9px]">PURE RANGE</span>
        <span className="text-[9px] text-[var(--text-muted)] font-mono">{rangeMax} {unit}</span>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`bg-[var(--bg-elevated)] animate-pulse rounded-xl ${className}`} />;
}

// ─── Main Analysis Screen ────────────────────────────────────────────────────
export default function Analysis() {
  const navigate = useNavigate();
  const shareCardRef = useRef(null);

  // Load persisted state
  const [sensorData] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('sensor_snapshot') || '{}'); } catch { return {}; }
  });
  const [selectedOil] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('selected_oil') || 'null'); } catch { return null; }
  });
  const [result] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('analysis_result') || 'null'); } catch { return null; }
  });

  // AI state
  const [adulterants, setAdulterants] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  // Know More drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('profile');
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const drawerRef = useRef(null);

  // Redirect guard
  useEffect(() => {
    if (!result || !selectedOil) navigate('/scan/readings', { replace: true });
  }, [result, selectedOil, navigate]);

  // ── Adulterant Groq call ────────────────────────────────────────────────
  useEffect(() => {
    if (!result || !selectedOil) return;

    const systemPrompt = 'You are an expert food scientist and oil adulteration specialist. Always respond with valid JSON only, no markdown.';
    const userPrompt = `The user tested ${selectedOil.oilName} edible oil.
Sensor analysis shows ${result.adulterationPercentage}% adulteration at ${result.confidenceScore}% confidence.
Primary sensor deviation: ${result.primaryIndicator}.
Common adulterants for this oil: ${selectedOil.commonAdulterants.join(', ')}.

Return JSON with this exact structure:
{
  "likelyAdulterants": [
    {
      "name": "string",
      "probability": number (0-100),
      "reason": "one sentence why",
      "healthRisk": "string",
      "riskLevel": "low" | "moderate" | "serious"
    }
  ]
}
Provide 2-3 likely adulterants only.`;

    callGroq(systemPrompt, userPrompt)
      .then((json) => setAdulterants(json.likelyAdulterants || []))
      .catch((e) => setAiError(e.message))
      .finally(() => setAiLoading(false));
  }, []); // run once

  // ── History save ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!result || !selectedOil) return;
    const record = {
      oil_type: selectedOil.oilName,
      purity: result.purityPercentage,
      quality: result.tier === 'pure' ? 'Safe' : result.tier === 'moderate' ? 'Moderate' : 'Unsafe',
      adulteration_percentage: result.adulterationPercentage,
      confidence_score: result.confidenceScore,
      sensor_readings: sensorData,
      connection_type: localStorage.getItem('esp_connection_type') || 'Unknown',
      timestamp: new Date().toISOString(),
      vendor: 'Field Test',
    };
    supabase.from('analysis_results').insert(record).then(({ error }) => {
      if (error) console.warn('[Analysis] History save failed:', error.message);
    });
  }, []); // run once

  // ── Know More drawer data ───────────────────────────────────────────────
  const loadDrawerData = useCallback(async () => {
    if (!selectedOil) return;
    const cacheKey = `oil_info_${selectedOil.oilName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setDrawerData(JSON.parse(cached)); return; } catch (_) {}
    }
    setDrawerLoading(true);
    const systemPrompt = 'You are a food safety expert. Return only valid JSON, no markdown or explanation.';
    const userPrompt = `Provide detailed information about ${selectedOil.oilName} edible oil in this exact JSON structure:
{
  "oilProfile": {
    "origin": "string",
    "naturalColor": "string",
    "cookingUses": ["string"],
    "smokePoint": number,
    "nutritionalHighlights": ["string"],
    "purityIdentification": "string"
  },
  "healthBenefits": ["string"],
  "adulterationRisks": {
    "moderate": ["string"],
    "heavy": ["string"]
  }
}
Make it medically accurate and practical for an Indian consumer.`;

    try {
      const json = await callGroq(systemPrompt, userPrompt);
      localStorage.setItem(cacheKey, JSON.stringify(json));
      setDrawerData(json);
    } catch (e) {
      console.error('[DrawerData]', e);
    } finally {
      setDrawerLoading(false);
    }
  }, [selectedOil]);

  const openDrawer = () => {
    setDrawerOpen(true);
    if (!drawerData) loadDrawerData();
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!result || !selectedOil) return;
    const tierLabel = result.tier === 'pure' ? 'PURE' : result.tier === 'moderate' ? 'ADULTERATED' : 'HEAVILY ADULTERATED';
    const text = `🫙 PureOil Analysis Result\nOil: ${selectedOil.oilName}\nPurity: ${result.purityPercentage}%\nAdulteration: ${result.adulterationPercentage}%\nStatus: ${tierLabel}\nTested with Pure Catalyst — oil-adulteration4.vercel.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PureOil Analysis', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Result copied to clipboard!');
      }
    } catch (_) {}
  };

  if (!result || !selectedOil) return null;

  const tierConfig = {
    pure: { color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'PURE', Icon: ShieldCheck },
    moderate: { color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'ADULTERATED', Icon: AlertTriangle },
    heavy: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'HEAVILY ADULTERATED', Icon: XCircle },
  };
  const tc = tierConfig[result.tier] || tierConfig.pure;

  const riskColors = { low: 'text-green-500', moderate: 'text-amber-500', serious: 'text-red-400' };

  return (
    <div className="flex flex-col min-h-screen theme-bg animate-fade-in pb-32">
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] sticky top-0 z-10 theme-bg">
        <button onClick={() => navigate('/scan/readings/select-oil')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="theme-text font-black text-sm uppercase tracking-widest">Analysis Result</h1>
          <p className="text-[9px] text-[var(--text-muted)] font-medium">{selectedOil.oilName}</p>
        </div>
        <button onClick={handleShare} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <Share2 size={18} />
        </button>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-5">

        {/* ── Section 1: Purity Gauge ── */}
        <div className="card flex flex-col items-center gap-4 p-6">
          <PurityGaugeAnimated purity={result.purityPercentage} />

          {/* Oil badge */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: selectedOil.color }} />
            <span className="text-xs font-bold text-[var(--text-muted)]">{selectedOil.oilName}</span>
          </div>

          {/* Numbers */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 text-center">
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Purity</p>
              <p className="text-3xl font-black text-green-500 font-mono">{result.purityPercentage.toFixed(1)}%</p>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 text-center">
              <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Adulteration</p>
              <p className={`text-3xl font-black font-mono ${result.adulterationPercentage > 20 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                {result.adulterationPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Tier badge + Confidence */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${tc.bg} ${tc.border}`}>
              <tc.Icon size={12} style={{ color: tc.color }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tc.color }}>
                {tc.label}
              </span>
            </div>
            <div className="bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                Confidence: <span className="text-[var(--text-primary)] font-black">{result.confidenceScore}%</span>
              </span>
            </div>
            {result.usingCalibration && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10">
                <Zap size={12} className="text-[#d4af37]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
                  Calibrated Baseline
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2: Sensor Deviation Breakdown ── */}
        <div className="card flex flex-col gap-5 p-5">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#d4af37]" />
            <h2 className="font-black text-sm theme-text uppercase tracking-widest">How We Calculated This</h2>
          </div>
          {Object.values(result.deviationDetails).map((detail) => (
            <DeviationBar key={detail.label} detail={detail} />
          ))}
          <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-color)]">
            <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
              <span className="font-bold text-[#d4af37]">Primary indicator:</span>{' '}
              {result.primaryIndicator}. Light absorption carries 60% weight, temperature and density 15% each, raw sensor index 10%.
            </p>
          </div>
        </div>

        {/* ── Section 3: AI Adulterant Suggestions ── */}
        <div className="card flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Beaker size={16} className="text-purple-400" />
            <h2 className="font-black text-sm theme-text uppercase tracking-widest">Probable Adulterants</h2>
          </div>

          {aiLoading && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-[var(--text-muted)] animate-pulse font-bold uppercase tracking-widest">
                Analyzing probable adulterants...
              </p>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {aiError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs">
              AI analysis unavailable: {aiError}
            </div>
          )}

          {!aiLoading && adulterants && adulterants.map((a, i) => (
            <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm theme-text">{a.name}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                  a.probability > 70 ? 'bg-red-500/20 text-red-400' :
                  a.probability > 40 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {a.probability}% likely
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{a.reason}</p>
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={10} className={`mt-0.5 flex-shrink-0 ${riskColors[a.riskLevel] || 'text-amber-500'}`} />
                <p className={`text-[10px] font-medium leading-relaxed ${riskColors[a.riskLevel] || 'text-amber-500'}`}>
                  {a.healthRisk}
                </p>
              </div>
            </div>
          ))}

          <p className="text-[9px] text-[var(--text-muted)] italic leading-relaxed">
            AI suggestions are probabilistic. For confirmed results, consult a certified food testing laboratory.
          </p>
        </div>

        {/* ── What To Do card ── */}
        <div className={`card p-5 border-2 ${tc.border}`} style={{ backgroundColor: `${tc.color}08` }}>
          <div className="flex items-center gap-2 mb-3">
            <tc.Icon size={16} style={{ color: tc.color }} />
            <h2 className="font-black text-sm theme-text">What To Do</h2>
          </div>
          {result.tier === 'pure' && (
            <ul className="flex flex-col gap-2">
              {['Your oil appears pure. Continue normal use.', 'Store in a cool, dark place away from heat.', 'Retest periodically for ongoing quality assurance.'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <ShieldCheck size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          )}
          {result.tier === 'moderate' && (
            <ul className="flex flex-col gap-2">
              {['Adulteration detected. Consider stopping use of this batch.', 'Purchase from a certified, trusted retailer.', 'Report to your local food safety authority.', 'Consider getting an independent lab test.'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          )}
          {result.tier === 'heavy' && (
            <>
              <ul className="flex flex-col gap-2 mb-4">
                {[
                  'STOP consuming this oil immediately.',
                  'Dispose of the current stock safely.',
                  'Get a medical checkup if consumed recently.',
                  'Report this batch to FSSAI.',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-red-400">
                    <XCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <a
                href="https://fssai.gov.in/cms/consumer-complaint.php"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-[14px] font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                <ExternalLink size={14} />
                Report to FSSAI
              </a>
            </>
          )}
        </div>

        {/* ── Know More Button ── */}
        <button
          onClick={openDrawer}
          className="w-full flex items-center justify-between p-5 card hover:border-[#d4af37]/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
              <Info size={18} className="text-[#d4af37]" />
            </div>
            <div className="text-left">
              <p className="font-black text-sm theme-text">Know More about this oil</p>
              <p className="text-[10px] text-[var(--text-muted)]">Profile · Health impact · Guidance</p>
            </div>
          </div>
          <ChevronDown size={18} className="text-[var(--text-muted)] group-hover:text-[#d4af37] transition-colors" />
        </button>
      </div>

      {/* ── Know More Bottom Drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[var(--bg-card)] rounded-t-3xl border-t border-[var(--border-color)] shadow-[0_-8px_40px_rgba(0,0,0,0.4)] animate-slide-up"
            style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[var(--border-color)]" />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: selectedOil.color }} />
                <h3 className="font-black text-sm theme-text">{selectedOil.oilName}</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-full bg-[var(--bg-elevated)] theme-text">
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border-color)] px-4">
              {[['profile', 'Oil Profile'], ['health', 'Health Impact'], ['action', 'What To Do']].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                    drawerTab === tab
                      ? 'text-[#d4af37] border-[#d4af37]'
                      : 'text-[var(--text-muted)] border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {drawerLoading && (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-20 w-full mt-2" />
                </div>
              )}

              {!drawerLoading && drawerData && drawerTab === 'profile' && (
                <DrawerProfile data={drawerData.oilProfile} />
              )}
              {!drawerLoading && drawerData && drawerTab === 'health' && (
                <DrawerHealth
                  benefits={drawerData.healthBenefits}
                  risks={drawerData.adulterationRisks}
                  tier={result.tier}
                />
              )}
              {!drawerLoading && drawerData && drawerTab === 'action' && (
                <DrawerAction tier={result.tier} adulterants={adulterants} />
              )}
              {!drawerLoading && !drawerData && (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">
                  Failed to load oil information. Check your internet connection.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Drawer sub-panels ───────────────────────────────────────────────────────

function DrawerProfile({ data }) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-4">
      <Row label="Origin" value={data.origin} />
      <Row label="Natural Color" value={data.naturalColor} />
      <Row label="Smoke Point" value={`${data.smokePoint}°C`} />
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Cooking Uses</p>
        <div className="flex flex-wrap gap-2">
          {(data.cookingUses || []).map((u, i) => (
            <span key={i} className="bg-[var(--bg-elevated)] text-[10px] font-medium theme-text px-2.5 py-1 rounded-full border border-[var(--border-color)]">{u}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Nutritional Highlights</p>
        {(data.nutritionalHighlights || []).map((n, i) => (
          <p key={i} className="text-xs text-[var(--text-secondary)] leading-relaxed">• {n}</p>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
        <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] mb-1">How to identify purity</p>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.purityIdentification}</p>
      </div>
    </div>
  );
}

function DrawerHealth({ benefits, risks, tier }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-2">✓ If Pure — Health Benefits</p>
        {(benefits || []).map((b, i) => (
          <p key={i} className="text-xs text-[var(--text-secondary)] leading-relaxed">• {b}</p>
        ))}
      </div>
      <div className="h-px bg-[var(--border-color)]" />
      <div>
        <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${tier === 'heavy' ? 'text-red-500' : 'text-amber-500'}`}>
          ⚠ If Adulterated — Health Risks
        </p>
        {tier === 'pure' && <p className="text-xs text-green-500">Minimal risk at current purity level.</p>}
        {tier === 'moderate' && (risks?.moderate || []).map((r, i) => (
          <p key={i} className="text-xs text-amber-400 leading-relaxed">• {r}</p>
        ))}
        {tier === 'heavy' && (risks?.heavy || []).map((r, i) => (
          <p key={i} className="text-xs text-red-400 leading-relaxed font-bold">• {r}</p>
        ))}
      </div>
    </div>
  );
}

function DrawerAction({ tier, adulterants }) {
  const actions = {
    pure: [
      'Your oil appears pure. Continue normal use.',
      'Store in a cool, dark place away from direct heat and sunlight.',
      'Retest periodically to monitor quality over time.',
    ],
    moderate: [
      'Adulteration detected. Stop using this batch.',
      'Purchase replacement oil from a certified, FSSAI-licensed retailer.',
      'Report to your local food safety authority immediately.',
      'Consider getting an independent NABL-certified lab test.',
    ],
    heavy: [
      'STOP consuming this oil immediately.',
      'Dispose of the current stock safely — do not donate.',
      'Report this to FSSAI or your local food safety authority.',
      'Get a medical checkup if this oil has been consumed regularly.',
    ],
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {(actions[tier] || actions.pure).map((a, i) => (
          <div key={i} className={`flex items-start gap-2 p-3 rounded-xl ${
            tier === 'heavy' ? 'bg-red-500/10 border border-red-500/20' :
            tier === 'moderate' ? 'bg-amber-500/10 border border-amber-500/20' :
            'bg-green-500/10 border border-green-500/20'
          }`}>
            <span className={`text-sm font-black ${tier === 'heavy' ? 'text-red-400' : tier === 'moderate' ? 'text-amber-400' : 'text-green-400'}`}>
              {i + 1}.
            </span>
            <p className={`text-xs leading-relaxed ${tier === 'heavy' ? 'text-red-300 font-bold' : 'text-[var(--text-secondary)]'}`}>{a}</p>
          </div>
        ))}
      </div>
      {tier === 'heavy' && (
        <a
          href="https://fssai.gov.in/cms/consumer-complaint.php"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white rounded-[14px] font-black text-sm uppercase tracking-widest"
        >
          <ExternalLink size={14} />
          Report to FSSAI
        </a>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-xs font-medium theme-text text-right">{value}</span>
    </div>
  );
}
