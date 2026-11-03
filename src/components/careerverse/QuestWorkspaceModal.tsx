import React, { useState } from 'react';
import { X, Target, Trophy, Coins, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerQuest, CareerQuestService } from '@/services/careerverse/careerQuestService';
import { toast } from 'sonner';

interface QuestModalProps {
  quest: CareerQuest | null;
  userId: string;
  onClose: () => void;
  onQuestClaimed: (result: any) => void;
}

export const QuestWorkspaceModal: React.FC<QuestModalProps> = ({
  quest,
  userId,
  onClose,
  onQuestClaimed
}) => {
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!quest) return null;

  const isClaimed = quest.user_progress?.status === 'claimed';

  const handleClaim = async () => {
    if (userId === 'guest') {
      toast.error('Please log in or sign up to save your XP and claim rewards!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await CareerQuestService.completeAndClaimQuest(userId, quest);
      toast.success(`🎉 Quest completed! +${quest.xp_reward} XP and +${quest.coins_reward} Coins awarded!`);
      onQuestClaimed(res);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to claim quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#101E3B] border border-[#36D9F5]/30 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Quest Title & Category */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#36D9F5]/20 flex items-center justify-center text-[#36D9F5] flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A34EFF] px-2 py-0.5 rounded-full bg-[#7047F5]/20 border border-[#7047F5]/30">
              {quest.category} Quest · {quest.difficulty}
            </span>
            <h3 className="text-xl font-black text-white mt-1">{quest.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed bg-[#071329] p-4 rounded-xl border border-white/5">
          {quest.description}
        </p>

        {/* Rewards Box */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFCA55]/10 border border-[#FFCA55]/30">
            <Trophy className="w-5 h-5 text-[#FFCA55]" />
            <div>
              <p className="text-xs text-slate-400 font-medium">XP Reward</p>
              <p className="text-base font-black text-white">+{quest.xp_reward} XP</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#20D994]/10 border border-[#20D994]/30">
            <Coins className="w-5 h-5 text-[#20D994]" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Career Coins</p>
              <p className="text-base font-black text-white">+{quest.coins_reward} Coins</p>
            </div>
          </div>
        </div>

        {/* Evidence / Completion Input */}
        {!isClaimed && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">
              Proof / Completion Notes (e.g. GitHub link, Passport section updated, or summary):
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Added React hooks and updated my verified skills..."
              rows={3}
              className="w-full bg-[#071329] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#36D9F5]"
            />
          </div>
        )}

        {/* Action Button */}
        {isClaimed ? (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#20D994]/20 border border-[#20D994]/40 text-[#20D994] font-bold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Completed & Claimed</span>
          </div>
        ) : (
          <Button
            onClick={handleClaim}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#7047F5] to-[#278DFF] hover:from-[#6035e0] hover:to-[#1a7ae0] text-white font-black text-sm h-11 rounded-xl shadow-lg shadow-[#7047F5]/30 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying & Crediting XP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify & Claim Rewards</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
