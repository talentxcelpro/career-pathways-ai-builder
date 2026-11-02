import React, { useState } from 'react';
import { X, Target, CheckCircle2, Star, Coins, ArrowRight } from 'lucide-react';
import { CareerQuest, careerQuestService } from '@/services/careerverse/careerQuestService';
import { toast } from 'sonner';

interface QuestWorkspaceModalProps {
  quest: CareerQuest;
  userId: string;
  onClose: () => void;
  onQuestCompleted: () => void;
}

export const QuestWorkspaceModal: React.FC<QuestWorkspaceModalProps> = ({
  quest,
  userId,
  onClose,
  onQuestCompleted,
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await careerQuestService.completeQuest(userId, quest.id);
      if (res.success) {
        toast.success(`Quest Completed! Awarded +${res.xp_awarded} XP and +${quest.coin_reward || 10} Coins!`);
        onQuestCompleted();
        onClose();
      } else {
        toast.error('Failed to submit quest proof. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred during verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#101E3B] border border-[#7047F5]/40 shadow-2xl p-6 text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#36D9F5]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">{quest.title}</h3>
              <span className="text-xs text-slate-400 capitalize">{quest.category} Mission</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission Briefing */}
        <div className="bg-[#071329]/80 border border-white/5 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#36D9F5]">Mission Briefing</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{quest.description}</p>
        </div>

        {/* Rewards Card */}
        <div className="flex items-center gap-4 bg-[#071329]/60 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFCA55]">
            <Star className="w-4 h-4 fill-[#FFCA55]" />
            <span>+{quest.xp_reward} XP</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#36D9F5]">
            <Coins className="w-4 h-4" />
            <span>+{quest.coin_reward || 10} Career Coins</span>
          </div>
        </div>

        {/* Proof of Work Submission */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Submit Execution Artifact or Link:
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Paste your GitHub repository, live URL, or solution notes here..."
            rows={3}
            className="w-full bg-[#071329] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#36D9F5] transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7047F5] to-[#278DFF] hover:from-[#278DFF] hover:to-[#7047F5] text-white text-xs font-black shadow-[0_0_15px_rgba(112,71,245,0.4)] flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Validating...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Claim XP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
