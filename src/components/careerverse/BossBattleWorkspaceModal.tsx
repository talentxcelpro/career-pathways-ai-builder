import React, { useState } from 'react';
import { X, Swords, CheckCircle2, ChevronRight, Terminal, Award, Star } from 'lucide-react';
import { CareerBossBattle, careerBossBattleService } from '@/services/careerverse/careerBossBattleService';
import { toast } from 'sonner';

interface BossBattleWorkspaceModalProps {
  battle: CareerBossBattle;
  userId: string;
  onClose: () => void;
  onBattleStageAdvanced: () => void;
}

export const BossBattleWorkspaceModal: React.FC<BossBattleWorkspaceModalProps> = ({
  battle,
  userId,
  onClose,
  onBattleStageAdvanced,
}) => {
  const [activeStageId, setActiveStageId] = useState(2); // Stage 2: Debug & Improve
  const [codeAnswer, setCodeAnswer] = useState(
    `// Solution for Stage 2: Profile and eliminate render bottlenecks\nexport function optimizeVirtualList(items: any[]) {\n  // Implement useMemo & memoization cache\n  return items.slice(0, 50);\n}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdvanceStage = async () => {
    setIsSubmitting(true);
    try {
      const res = await careerBossBattleService.advanceStage(userId, battle.id, activeStageId);
      if (res.success) {
        if (res.completed) {
          toast.success(`VICTORY! Boss Battle Conquered! +${res.xp_awarded} XP, Verified Badge, and Fast-Track Interview Unlocked!`);
          onBattleStageAdvanced();
          onClose();
        } else {
          toast.success(`Stage ${activeStageId} Cleared! Moving to Stage ${activeStageId + 1}!`);
          setActiveStageId((prev) => prev + 1);
          onBattleStageAdvanced();
        }
      } else {
        toast.error('Could not verify submission. Please check unit tests.');
      }
    } catch (err) {
      toast.error('An error occurred during verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#101E3B] border border-[#7047F5]/40 shadow-2xl p-6 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
              <img
                src={battle.company_logo}
                alt={battle.company_name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">{battle.title}</h3>
              <p className="text-xs text-slate-400">{battle.company_name} • Stage {activeStageId} of 4</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Stage Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {battle.stages.map((stage) => {
            const isCompleted = stage.id < activeStageId;
            const isCurrent = stage.id === activeStageId;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-[#071329] border-[#20D994] shadow-[0_0_12px_rgba(32,217,148,0.3)]'
                    : isCompleted
                    ? 'bg-[#071329]/60 border-[#20D994]/40 text-slate-300'
                    : 'bg-[#071329]/30 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">STAGE {stage.id}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#20D994]" />}
                </div>
                <div className="text-xs font-bold text-white truncate">{stage.name}</div>
              </button>
            );
          })}
        </div>

        {/* Stage Workspace */}
        <div className="bg-[#071329] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#36D9F5]">
              <Terminal className="w-4 h-4" />
              <span>IDE Sandbox Environment</span>
            </div>
            <span className="text-xs text-[#20D994] font-semibold">Test Suite: 4 / 4 Passing</span>
          </div>

          <textarea
            value={codeAnswer}
            onChange={(e) => setCodeAnswer(e.target.value)}
            rows={8}
            className="w-full bg-[#050D1C] border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-[#7047F5] transition-all"
          />
        </div>

        {/* Victory Perks Bar */}
        <div className="flex items-center justify-between bg-[#071329]/80 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-slate-400">Victory Unlocks:</span>
            <div className="flex items-center gap-1 text-[#FFCA55]">
              <Star className="w-4 h-4 fill-[#FFCA55]" />
              <span>+500 XP</span>
            </div>
            <div className="flex items-center gap-1 text-[#20D994]">
              <Award className="w-4 h-4" />
              <span>Direct Recruiter Fast-Track</span>
            </div>
          </div>

          <button
            onClick={handleAdvanceStage}
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#7047F5] to-[#20D994] hover:from-[#20D994] hover:to-[#7047F5] text-white text-xs font-black shadow-[0_0_15px_rgba(112,71,245,0.4)] flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Evaluating...' : 'Run Tests & Advance Stage'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
