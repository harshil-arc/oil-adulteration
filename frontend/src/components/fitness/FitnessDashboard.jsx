import { useState, useMemo } from 'react';
import { 
  loadFitnessProfile, loadWorkoutLogs, generateDynamicAiWorkout, 
  generateWeeklyAiSplit, calculateUserGamification, getAchievementBadges, 
  classifyUserArchetype, calculateRecoveryScore 
} from '../../services/aiFitnessEngine';
import LeapTrainingHome from './LeapTrainingHome';
import WorkoutPlayerView from './WorkoutPlayerView';
import PostWorkoutFeedbackModal from './PostWorkoutFeedbackModal';

export default function FitnessDashboard() {
  const [profile, setProfile] = useState(loadFitnessProfile());
  const [workoutLogs, setWorkoutLogs] = useState(loadWorkoutLogs());
  const [playerOpen, setPlayerOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [lastFinishedSummary, setLastFinishedSummary] = useState(null);

  const todayWorkout = useMemo(() => {
    return generateDynamicAiWorkout({
      ...profile,
      duration: profile.duration || 30
    });
  }, [profile]);

  const handleStartWorkout = (plan) => {
    setActiveWorkoutPlan(plan || todayWorkout);
    setPlayerOpen(true);
  };

  const handleWorkoutFinished = (summary) => {
    setPlayerOpen(false);
    setLastFinishedSummary(summary);
    setFeedbackOpen(true);
  };

  const handleFeedbackComplete = () => {
    setWorkoutLogs(loadWorkoutLogs());
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans">
      {/* Primary Leap Fitness Interface */}
      <LeapTrainingHome
        onStartInteractiveWorkout={() => handleStartWorkout(todayWorkout)}
      />

      {/* Fullscreen Immersive Workout Player View */}
      <WorkoutPlayerView
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        workoutPlan={activeWorkoutPlan}
        onWorkoutFinished={handleWorkoutFinished}
      />

      {/* Post Workout Celebration & Feedback Survey Modal */}
      <PostWorkoutFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        workoutSummary={lastFinishedSummary}
        onCompletedAll={handleFeedbackComplete}
      />
    </div>
  );
}
