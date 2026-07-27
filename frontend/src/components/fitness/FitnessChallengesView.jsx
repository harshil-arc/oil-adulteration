import { useState } from 'react';
import { Trophy, Flame, Zap, Award, CheckCircle2, Sparkles, Star, Target } from 'lucide-react';
import { CHALLENGES_LIST } from '../../services/aiFitnessEngine';

export default function FitnessChallengesView({ gamification = {} }) {
  const [joinedChallenges, setJoinedChallenges] = useState(['ch-1']);

  const handleToggleJoin = (id) => {
    setJoinedChallenges(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Challenges Banner Header */}
      <div className="card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[var(--bg-card)] to-purple-500/10 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            <h3 className="text-xl font-black text-white">AI Quests & Fitness Challenges</h3>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-mono font-bold">
            💰 {gamification.totalCoins || 120} Coins Available
          </span>
        </div>
        <p className="text-gray-300 text-xs">
          Complete daily missions and structured 30-day quests to earn XP bonuses, exclusive badges, and coin rewards.
        </p>
      </div>

      {/* Daily & Weekly Missions Checklist */}
      <div className="card p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-[#d4af37] tracking-wider block">Today's Daily Missions</span>
          <span className="text-[10px] font-bold text-gray-400">Resets in 12h</span>
        </div>

        <div className="space-y-2.5">
          {[
            { id: 'm1', title: 'Complete Today\'s Prescribed AI Session', xp: '+100 XP', coins: '+25 Coins', done: true },
            { id: 'm2', title: 'Perform 10-Min Postural Spine Stretch', xp: '+50 XP', coins: '+10 Coins', done: false },
            { id: 'm3', title: 'Log Post-Workout Protein Fueling Meal', xp: '+40 XP', coins: '+10 Coins', done: true }
          ].map(m => (
            <div key={m.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${
              m.done ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--bg-elevated)] border-[var(--border-color)]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  m.done ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}>
                  {m.done ? '✓' : ''}
                </div>
                <div>
                  <h4 className={`font-black ${m.done ? 'text-emerald-300 line-through' : 'text-white'}`}>{m.title}</h4>
                  <span className="text-[10px] text-gray-400">{m.xp} • {m.coins}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-3 py-1 rounded-xl ${
                m.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}>
                {m.done ? 'Claimed' : 'In Progress'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Challenges Cards */}
      <div className="space-y-3">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Structured Transformation Challenges</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHALLENGES_LIST.map(ch => {
            const isJoined = joinedChallenges.includes(ch.id);
            return (
              <div key={ch.id} className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{ch.icon}</span>
                    <span className="bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded-xl text-[10px] font-bold">
                      {ch.durationDays} Days Quest
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white">{ch.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{ch.desc}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
                  <div className="flex justify-between text-[11px] font-mono text-gray-300">
                    <span>Reward: <b className="text-amber-400">+{ch.rewardXP} XP</b></span>
                    <span>Coins: <b className="text-amber-400">+{ch.rewardCoins}</b></span>
                  </div>

                  <button
                    onClick={() => handleToggleJoin(ch.id)}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all ${
                      isJoined 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'btn-primary shadow-glow-gold'
                    }`}
                  >
                    {isJoined ? '✓ Quest Joined (Day 4 of 30)' : 'Join Quest Now →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
