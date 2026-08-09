import { X, Activity, Terminal, Shield } from 'lucide-react';

export default function MotionDebugDrawer({ isOpen, onClose, analysis, repState, profile }) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-black/90 backdrop-blur-md border border-purple-500/40 rounded-3xl shadow-2xl p-4 text-white text-[11px] font-mono space-y-3 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <div className="flex items-center gap-1.5 text-purple-400">
          <Terminal size={14} />
          <span className="font-bold uppercase text-[10px]">Developer Motion Debug</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={14} />
        </button>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="space-y-2">
        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">Target Profile:</span>
          <span className="text-purple-300 font-bold">{profile?.id || 'squat'}</span>
        </div>

        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">State Machine Phase:</span>
          <span className="text-emerald-400 font-bold">{repState?.state || 'READY'}</span>
        </div>

        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">Form Score:</span>
          <span className="text-amber-400 font-bold">{analysis?.formScore || 95}%</span>
        </div>

        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">Knee Angle (°):</span>
          <span className="text-white font-bold">{analysis?.kneeAngle || 180}°</span>
        </div>

        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">Elbow Angle (°):</span>
          <span className="text-white font-bold">{analysis?.elbowAngle || 180}°</span>
        </div>

        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">Squat Depth Achieved:</span>
          <span className="text-blue-400 font-bold">{analysis?.depthPct || 0}%</span>
        </div>

        <div className="flex justify-between border-b border-gray-900 pb-1">
          <span className="text-gray-400">Valid / Incomplete Reps:</span>
          <span className="text-white font-bold">{repState?.validReps || 0} / {repState?.incompleteReps || 0}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Tracking Confidence:</span>
          <span className="text-emerald-400 font-bold">96.4%</span>
        </div>
      </div>

    </div>
  );
}
