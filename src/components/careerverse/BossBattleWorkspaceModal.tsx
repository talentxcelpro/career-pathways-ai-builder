import React, { useState } from 'react';
import { X, ShieldAlert, Code2, Play, CheckCircle2, Trophy, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerBossBattle, CareerBossBattleService } from '@/services/careerverse/careerBossBattleService';
import { toast } from 'sonner';

interface BossWorkspaceProps {
  battle: CareerBossBattle | null;
  userId: string;
  onClose: () => void;
  onBattleVictory: () => void;
}

export const BossBattleWorkspaceModal: React.FC<BossWorkspaceProps> = ({
  battle,
  userId,
  onClose,
  onBattleVictory
}) => {
  const [currentStage, setCurrentStage] = useState(battle?.user_participation?.current_stage || 1);
  const [code, setCode] = useState(`// Microsoft Partner Challenge - Frontend SDE Pipeline
// Task: Implement high-performance memoized selector for real-time candidate search

function createCandidateSelector(candidates, filterQuery) {
  if (!filterQuery) return candidates;
  const q = filterQuery.toLowerCase();
  return candidates.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.skills.some(s => s.toLowerCase().includes(q))
  );
}

// Write your solution below:
export function optimizedSearch(candidates, query) {
  // TODO: Add LRU cache memoization with 50-entry cap
  return createCandidateSelector(candidates, query);
}
`);
  const [isRunning, setIsRunning] = useState(false);

  if (!battle) return null;

  const handleRunAndAdvance = async () => {
    if (userId === 'guest') {
      toast.error('Please log in to submit challenge stages and earn fast-track interview status.');
      return;
    }

    try {
      setIsRunning(true);
      await new Promise(r => setTimeout(r, 1200)); // Simulate test runner execution

      const nextStage = currentStage + 1;
      await CareerBossBattleService.advanceBattleStage(userId, battle.id, nextStage, code);
      setCurrentStage(nextStage);

      if (nextStage > 4) {
        toast.success(`🏆 VICTORY! Boss Battle Defeated! +${battle.xp_reward} XP and Fast-Track Interview Unlocked!`);
        onBattleVictory();
        onClose();
      } else {
        toast.success(`✅ Stage ${currentStage} passed! Advanced to Stage ${nextStage}.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error advancing stage');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#101E3B] border border-[#FF4757]/40 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4757]/20 flex items-center justify-center text-[#FF4757]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{battle.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#278DFF]/20 text-[#36D9F5]">
                  {battle.company_name}
                </span>
              </div>
              <p className="text-xs text-slate-400">Stage {currentStage} of 4: {battle.stages[currentStage - 1] || 'Completed'}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Pipeline Stages Header */}
        <div className="grid grid-cols-4 gap-2">
          {battle.stages.map((stage, idx) => {
            const num = idx + 1;
            const isDone = num < currentStage;
            const isCurrent = num === currentStage;
            return (
              <div
                key={stage}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold ${
                  isDone
                    ? 'bg-[#20D994]/15 border-[#20D994]/40 text-[#20D994]'
                    : isCurrent
                    ? 'bg-[#7047F5]/20 border-[#7047F5] text-white shadow-md'
                    : 'bg-[#071329] border-white/5 text-slate-500'
                }`}
              >
                {stage}
              </div>
            );
          })}
        </div>

        {/* Code Workspace Editor */}
        <div className="flex-1 flex flex-col gap-2 min-h-[250px]">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#36D9F5]" />
              Interactive Code Evaluation Environment
            </span>
            <span className="text-[10px] text-slate-400 font-mono">TypeScript / Node 20 Runtime</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 bg-[#071329] font-mono text-xs text-[#20D994] border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[#36D9F5] leading-relaxed resize-none"
          />
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Trophy className="w-4 h-4 text-[#FFCA55]" />
            <span>Victory unlocks: +{battle.xp_reward} XP & Direct Recruiter Screening</span>
          </div>

          <Button
            onClick={handleRunAndAdvance}
            disabled={isRunning}
            className="bg-gradient-to-r from-[#20D994] to-[#278DFF] text-slate-950 font-black text-xs px-6 h-10 rounded-xl shadow-lg flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Automated Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Tests & Submit Stage {currentStage}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
