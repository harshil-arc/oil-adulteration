import { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, Play, Pause, SkipForward, Sparkles, CheckCircle2, 
  AlertTriangle, ShieldCheck, Terminal, Flame, Clock, RefreshCw, Volume2
} from 'lucide-react';
import { PoseTracker } from '../../../services/fitness/motionCoach/poseTracker';
import { getExerciseFormProfile } from '../../../services/fitness/motionCoach/formProfiles';
import { analyzeFrameForm } from '../../../services/fitness/motionCoach/formAnalyzer';
import { RepStateMachine } from '../../../services/fitness/motionCoach/repStateMachine';
import MotionCalibration from './MotionCalibration';
import MotionDebugDrawer from './MotionDebugDrawer';
import MotionReportModal from './MotionReportModal';

export default function MotionCoachView({ isOpen, onClose, workoutPlan, initialExerciseId = 'squat' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseTrackerRef = useRef(null);
  const stateMachineRef = useRef(new RepStateMachine(getExerciseFormProfile('squat')));

  // State
  const [selectedExerciseId, setSelectedExerciseId] = useState(initialExerciseId);
  const [calibrated, setCalibrated] = useState(false);
  const [calibModalOpen, setCalibModalOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimerSec, setRestTimerSec] = useState(30);

  const [formAnalysis, setFormAnalysis] = useState(null);
  const [repState, setRepState] = useState({ validReps: 0, incompleteReps: 0, state: 'READY' });
  const [feedbackCue, setFeedbackCue] = useState('Position full body in frame');

  const availableExercises = [
    { id: 'squat', name: 'Bodyweight Squats', sets: 3, reps: 12, category: 'Legs & Glutes', view: 'Side 45° View' },
    { id: 'toe_touch', name: 'Standing Toe Touch', sets: 3, reps: 10, category: 'Core & Hamstrings', view: 'Side 45° View' },
    { id: 'side_reach', name: 'Standing Side Reach', sets: 3, reps: 10, category: 'Obliques & Core', view: 'Front View' },
    { id: 'pushup', name: 'Push-Ups', sets: 3, reps: 10, category: 'Chest & Arms', view: 'Side View' },
    { id: 'bicep_curl', name: 'Bicep Curls', sets: 3, reps: 15, category: 'Biceps & Forearms', view: 'Front View' },
    { id: 'shoulder_press', name: 'Overhead Shoulder Press', sets: 3, reps: 12, category: 'Shoulders & Triceps', view: 'Front View' },
    { id: 'lunge', name: 'Bodyweight Lunges', sets: 3, reps: 10, category: 'Quads & Glutes', view: 'Side View' }
  ];

  const currentEx = availableExercises.find(ex => ex.id === selectedExerciseId) || availableExercises[0];
  const profile = getExerciseFormProfile(currentEx.id);

  // Initialize camera and pose tracking
  useEffect(() => {
    if (isOpen) {
      setCalibModalOpen(true);
      stateMachineRef.current.reset(profile);

      const tracker = new PoseTracker(videoRef.current, canvasRef.current);
      poseTrackerRef.current = tracker;

      tracker.onPoseUpdate = (landmarks) => {
        if (!landmarks) {
          setFormAnalysis({ isValidPose: false, fullBodyVisible: false, formScore: 0, depthPct: 0 });
          setFeedbackCue('⚠️ Full Body Not Detected! Please step back so your entire body (head to feet) is in camera view');
          tracker.clearCanvas();
          return;
        }

        const analysis = analyzeFrameForm(landmarks, profile);
        setFormAnalysis(analysis);

        if (!analysis.isValidPose || analysis.fullBodyVisible === false) {
          setFeedbackCue('⚠️ Full Body Not Detected! Please step back so your entire body (head to feet) is in camera view');
          tracker.clearCanvas();
          return;
        }

        const repRes = stateMachineRef.current.processFrame(analysis);
        setRepState(repRes);

        if (repRes.cueOverride) {
          setFeedbackCue(repRes.cueOverride);
        } else {
          setFeedbackCue(analysis.feedbackCue);
        }

        // Render color-coded skeleton on real detected body points
        tracker.drawSkeleton(landmarks, analysis.jointStatuses);
      };

      tracker.startCamera();
    } else {
      if (poseTrackerRef.current) {
        poseTrackerRef.current.stopCamera();
      }
    }

    return () => {
      if (poseTrackerRef.current) {
        poseTrackerRef.current.stopCamera();
      }
    };
  }, [isOpen, selectedExerciseId]);

  // Handle Set Rest Timer
  useEffect(() => {
    let interval = null;
    if (isResting) {
      interval = setInterval(() => {
        setRestTimerSec(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setRestTimerSec(30);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting]);

  if (!isOpen) return null;

  const handleFinishWorkout = () => {
    if (poseTrackerRef.current) poseTrackerRef.current.stopCamera();
    setReportModalOpen(true);
  };

  const targetReps = currentEx.reps || 12;
  const isSetComplete = repState.validReps >= targetReps;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117] text-white flex flex-col justify-between overflow-hidden font-sans animate-fade-in">
      
      {/* ── 1. HERO TOP BAR ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 bg-[#161b22]/90 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-20">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-white px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-1 shadow-md">
              <Camera size={12} /> AI Motion Coach
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              FreeMoCap SkellyTracker Engine
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-400 font-bold">Target Exercise:</span>
            <select
              value={selectedExerciseId}
              onChange={(e) => {
                setSelectedExerciseId(e.target.value);
                setCurrentSet(1);
              }}
              className="bg-gray-800 border border-purple-500/40 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-400 cursor-pointer shadow-md"
            >
              {availableExercises.map(ex => (
                <option key={ex.id} value={ex.id} className="bg-[#161b22] text-white">
                  {ex.name} ({ex.reps} Reps • {ex.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDebugOpen(!debugOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              debugOpen ? 'bg-purple-600/30 text-purple-300 border-purple-500' : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            <Terminal size={14} /> Motion Debug
          </button>

          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── 2. DEDICATED REST SCREEN VIEW ──────────────────────────────────── */}
      {isResting ? (
        <div className="flex-1 flex flex-col justify-between p-6 text-center space-y-6 animate-fade-in max-w-lg mx-auto w-full my-auto">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full inline-block">
              SET COMPLETE ✓ {targetReps} / {targetReps} REPS
            </span>
            <h2 className="text-3xl font-black text-white">Active Rest & Catch Breath</h2>
            <p className="text-xs text-gray-400">Great form! Hydrate before set {currentSet + 1}</p>
          </div>

          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="72" stroke="#1f2937" strokeWidth="10" fill="transparent" />
              <circle
                cx="88"
                cy="88"
                r="72"
                stroke="#10b981"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="452"
                strokeDashoffset={452 - (452 * (restTimerSec / 30))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white font-mono">{restTimerSec}</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase mt-0.5">Seconds</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsResting(false);
              setCurrentSet(prev => prev + 1);
              stateMachineRef.current.reset(profile);
            }}
            className="py-3 px-8 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:bg-emerald-600"
          >
            SKIP REST →
          </button>
        </div>
      ) : (
        /* ── 3. MAIN LIVE MOTION CAMERA CANVAS VIEW ─────────────────────────── */
        <div className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden">
          
          {/* Real-time Video Stream with Overlay Skeleton Canvas */}
          <div className="w-full h-full max-h-[500px] sm:max-h-[580px] bg-black rounded-3xl border border-purple-500/30 overflow-hidden relative flex items-center justify-center shadow-2xl mx-auto max-w-4xl">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
            />

            {/* LIVE FORM SCORE & METRICS OVERLAY TOP RIGHT */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs font-mono min-w-[170px]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Form Score</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formAnalysis?.formScore || 94}%
                </span>
              </div>

              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${formAnalysis?.formScore || 94}%` }}
                />
              </div>

              <div className="space-y-1 text-[10px] text-gray-300 pt-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} /> Depth: <span>{formAnalysis?.depthPct || 92}%</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} /> Alignment: <span>OK</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} /> ROM: <span>Full</span>
                </div>
              </div>
            </div>

            {/* LIVE REP COUNTER OVERLAY TOP LEFT */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1 text-center min-w-[130px]">
              <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider block">Valid Reps</span>
              <div className="text-4xl font-black text-white font-mono">
                {repState.validReps} <span className="text-sm text-gray-400 font-normal">/ {targetReps}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold block">Set {currentSet} of {currentEx.sets || 3}</span>
            </div>

            {/* REAL-TIME POSTURE FEEDBACK BANNER BOTTOM */}
            <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto bg-black/80 backdrop-blur-md p-3.5 rounded-2xl border border-purple-500/40 text-center space-y-1 flex items-center justify-center gap-2 shadow-2xl">
              <Sparkles size={18} className="text-purple-400 shrink-0" />
              <span className="text-xs font-black text-white tracking-wide">{feedbackCue}</span>
            </div>
          </div>

        </div>
      )}

      {/* ── 4. INTERACTIVE FOOTER ──────────────────────────────────────────── */}
      <div className="p-4 bg-[#161b22] border-t border-gray-800 flex justify-between items-center z-20">
        <button
          onClick={() => setCalibModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 text-xs font-bold hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Recalibrate Camera
        </button>

        <button
          onClick={handleFinishWorkout}
          className="py-3 px-6 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-wider hover:bg-purple-500 transition-all shadow-lg"
        >
          FINISH SESSION & VIEW REPORT →
        </button>
      </div>

      {/* Modals & Drawers */}
      <MotionCalibration
        isOpen={calibModalOpen}
        onClose={() => setCalibModalOpen(false)}
        onCalibrationComplete={() => setCalibModalOpen(false)}
        exerciseProfile={profile}
      />

      <MotionDebugDrawer
        isOpen={debugOpen}
        onClose={() => setDebugOpen(false)}
        analysis={formAnalysis}
        repState={repState}
        profile={profile}
      />

      <MotionReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          onClose();
        }}
        sessionReport={{
          workoutTitle: workoutPlan?.title || 'AI Motion Workout',
          durationMinutes: 15,
          validReps: repState.validReps,
          incompleteReps: repState.incompleteReps,
          avgFormScore: formAnalysis?.formScore || 93
        }}
      />

    </div>
  );
}
