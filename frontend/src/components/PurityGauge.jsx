import { useEffect, useRef } from 'react';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 90; // radius = 90
const ARC_LENGTH = CIRCUMFERENCE * 0.75; // 270 degrees

const qualityConfig = {
  Safe: { color: '#1d9e75', bg: 'bg-[#e0f2ec]', text: 'text-[#177e5e]', Icon: ShieldCheck, label: 'Certified Pure' },
  Moderate: { color: '#f59e0b', bg: 'bg-yellow-100', text: 'text-yellow-700', Icon: AlertTriangle, label: 'Caution Advised' },
  Unsafe: { color: '#ef4444', bg: 'bg-red-100', text: 'text-red-700', Icon: XCircle, label: 'High Adulteration' },
};

export default function PurityGauge({ purity = 85, quality = 'Safe', animate = true }) {
  const circleRef = useRef(null);
  const cfg = qualityConfig[quality] || qualityConfig.Safe;
  
  // Calculate offset based on purity applied to the ARC_LENGTH out of the full CIRCUMFERENCE
  const targetOffset = CIRCUMFERENCE - (purity / 100) * ARC_LENGTH;

  useEffect(() => {
    if (circleRef.current && animate) {
      circleRef.current.style.transition = 'none';
      circleRef.current.style.strokeDashoffset = `${CIRCUMFERENCE}`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          circleRef.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
          circleRef.current.style.strokeDashoffset = `${targetOffset}`;
        });
      });
    }
  }, [purity, targetOffset, animate]);

  const { Icon } = cfg;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-52 h-44 overflow-hidden rounded-t-full">
        {/* We rotate 135deg backwards so the gap is at the bottom */}
        <svg className="absolute w-52 h-52 -left-0 -top-0" style={{ transform: 'rotate(135deg)' }} viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="#e8ede8"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
            strokeDashoffset="0"
          />
          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx="100" cy="100" r="90"
            fill="none"
            stroke={cfg.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
            strokeDashoffset={animate ? CIRCUMFERENCE : targetOffset}
            className="drop-shadow-sm"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 top-6 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Purity</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{Math.round(purity)}</span>
            <span className="text-2xl font-bold text-gray-400">%</span>
          </div>
        </div>
      </div>
      {/* Quality badge */}
      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full ${cfg.bg} ${cfg.text} text-sm font-semibold`}>
        <Icon size={14} />
        {cfg.label}
      </div>
    </div>
  );
}
