import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Circle } from 'lucide-react';
import { socket } from '../lib/socket';

const SCAN_STEPS = [
  'Refractive index verified',
  'Detecting lipid structure',
  'UV fluorescence mapped',
  'Density analysis complete',
  'Running adulteration model',
];

const SCAN_STATUSES = [
  'INITIALIZING SENSORS',
  'CALIBRATING IR BEAM',
  'SCANNING SPECTRUM',
  'ANALYZING DENSITY',
  'PROCESSING RESULTS',
];

export default function ScanningPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Listen for real scan progress from server
    socket.on('scan_progress', ({ progress: p, status }) => {
      setProgress(p);
      const idx = SCAN_STATUSES.indexOf(status);
      if (idx >= 0) setStatusIdx(idx);
      const stepsCompleted = Math.floor((p / 100) * SCAN_STEPS.length);
      setCompletedSteps(SCAN_STEPS.slice(0, stepsCompleted));
      if (p >= 100) {
        setDone(true);
        setTimeout(() => navigate('/analytics'), 1500);
      }
    });

    // Fallback local simulation if no socket event
    let localProgress = 0;
    const interval = setInterval(() => {
      localProgress += Math.random() * 8 + 4;
      if (localProgress >= 100) {
        localProgress = 100;
        clearInterval(interval);
        setDone(true);
        setTimeout(() => navigate('/analytics'), 1500);
      }
      setProgress(Math.round(localProgress));
      setStatusIdx(Math.min(Math.floor(localProgress / 22), SCAN_STATUSES.length - 1));
      setCompletedSteps(SCAN_STEPS.slice(0, Math.floor((localProgress / 100) * SCAN_STEPS.length)));
    }, 600);

    return () => {
      clearInterval(interval);
      socket.off('scan_progress');
    };
  }, [navigate]);

  const handleCancel = () => navigate('/');

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-between px-6 pt-8 pb-12 animate-slide-up">
      {/* Oil drop illustration */}
      <div className="flex flex-col items-center gap-8 flex-1 justify-center">
        <div className="relative">
          <div className="w-52 h-52 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 flex items-center justify-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/20 to-white/40 rounded-full" />
              <span className="text-6xl select-none">🧪</span>
            </div>
          </div>
          {/* Pulsing ring */}
          {!done && (
            <div className="absolute inset-0 rounded-full border-2 border-brand-400/40 animate-ping" style={{ animationDuration: '2s' }} />
          )}
          {done && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-brand-500/20 flex items-center justify-center">
                <CheckCircle size={48} className="text-brand-600" />
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {done ? 'Analysis Complete!' : 'Analyzing Oil Purity...'}
          </h1>
          <p className="text-gray-500 text-sm">
            {done ? 'Redirecting to results...' : 'Calibrating molecular sensors for density mapping'}
          </p>
        </div>

        {/* Progress card */}
        <div className="w-full card">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-widest mb-1">Current Progress</p>
              <p className="text-4xl font-extrabold text-gray-900">{progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-widest mb-1">Status</p>
              <p className="text-xs font-bold text-brand-600">{SCAN_STATUSES[statusIdx]}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full scan-bar-animated transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step list */}
        <div className="w-full flex flex-col gap-3">
          {SCAN_STEPS.map((step, i) => {
            const isComplete = completedSteps.includes(step);
            const isActive = !isComplete && i === completedSteps.length;
            return (
              <div key={step} className="flex items-center gap-3">
                {isComplete ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0" />
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive ? 'bg-gray-300 animate-pulse-soft' : 'bg-gray-200'}`} />
                )}
                <p className={`text-sm ${isComplete ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{step}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note + cancel */}
      <div className="w-full flex flex-col items-center gap-4">
        <p className="text-xs text-gray-400 text-center uppercase tracking-widest font-medium px-4">
          Scanning in progress. Keep the sensor stationary for clinical accuracy.
        </p>
        {!done && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-red-500 font-bold text-sm hover:text-red-600 transition-colors"
          >
            <X size={16} />
            Cancel Scan
          </button>
        )}
      </div>
    </div>
  );
}
