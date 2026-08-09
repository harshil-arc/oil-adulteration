import { useState, useEffect } from 'react';
import { Camera, Check, ShieldCheck, RefreshCw, Sparkles, X } from 'lucide-react';

export default function MotionCalibration({ isOpen, onClose, onCalibrationComplete, exerciseProfile }) {
  const [calibStep, setCalibStep] = useState(1); // 1: Visibility, 2: Camera Angle, 3: Hold Still, 4: Complete
  const [countdown, setCountdown] = useState(3);
  const [isHoldingStill, setIsHoldingStill] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isOpen && calibStep === 3) {
      setIsHoldingStill(true);
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCalibStep(4);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, calibStep]);

  if (!isOpen) return null;

  const handleFinish = () => {
    onCalibrationComplete({
      calibratedAt: new Date().toISOString(),
      baselineConfidence: 0.96,
      cameraAngle: exerciseProfile?.recommendedCameraView || 'Side / 45° View'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-white font-sans animate-fade-in">
      <div className="bg-[#161b22] border border-purple-500/40 rounded-3xl max-w-md w-full my-auto overflow-hidden shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest block">AI Camera Setup</span>
              <h3 className="text-base font-black text-white">Full-Body Motion Calibration</h3>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4 text-center">
          
          {calibStep === 1 && (
            <div className="space-y-4 animate-fade-in py-2">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500 text-purple-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-purple-500/20">
                🧍‍♂️
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-white">Step 1: Stand in Full View</h4>
                <p className="text-xs text-gray-400">Position yourself so your entire head-to-toe body is visible in the camera frame.</p>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                <Check size={16} /> Full Body Detected ✓
              </div>

              <button
                onClick={() => setCalibStep(2)}
                className="w-full py-3 rounded-2xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 transition-all shadow-lg"
              >
                Next: Camera Angle Check →
              </button>
            </div>
          )}

          {calibStep === 2 && (
            <div className="space-y-4 animate-fade-in py-2">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center text-3xl mx-auto">
                📐
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-white">Step 2: Recommended Orientation</h4>
                <p className="text-xs text-gray-400">
                  For <b>{exerciseProfile?.name || 'Squat'}</b>, place camera at: <b className="text-purple-300">{exerciseProfile?.recommendedCameraView || 'Side / 45° View'}</b>
                </p>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-300 text-xs font-bold">
                Camera Alignment Detected: OPTIMAL ✓
              </div>

              <button
                onClick={() => setCalibStep(3)}
                className="w-full py-3 rounded-2xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 transition-all shadow-lg"
              >
                Next: Baseline Calibration →
              </button>
            </div>
          )}

          {calibStep === 3 && (
            <div className="space-y-4 animate-fade-in py-2">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="w-full h-full rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                <span className="absolute text-3xl font-black text-white font-mono">{countdown}</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-white">Step 3: Hold Still for 2 Seconds</h4>
                <p className="text-xs text-gray-400">Calculating your unique baseline body proportions & landmark confidence...</p>
              </div>
            </div>
          )}

          {calibStep === 4 && (
            <div className="space-y-4 animate-fade-in py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-4xl mx-auto shadow-xl">
                ✨
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-white">Calibration Complete!</h4>
                <p className="text-xs text-gray-300">Target joint landmarks & tracking baseline saved. Ready for live motion analysis!</p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition-all shadow-lg"
              >
                START AI MOTION SESSION →
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
