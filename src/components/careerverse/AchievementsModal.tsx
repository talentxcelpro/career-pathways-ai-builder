import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, Lock, Shield, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerBadge, CareerBadgeAndRewardsService } from '@/services/careerverse/careerBadgeAndRewardsService';
import { toast } from 'sonner';

interface AchievementsModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  userId,
  onClose
}) => {
  const [badges, setBadges] = useState<CareerBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await CareerBadgeAndRewardsService.getBadges(userId);
        setBadges(data);
      } catch (err) {
        console.error('Failed to load badges:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/play');
    toast.success('CareerVerse profile link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#101E3B] border border-[#7047F5]/30 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Career Achievements Vault</h3>
              <p className="text-xs text-slate-400">Verified credentials and recruiter-certified credentials</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="bg-[#071329] border-white/10 text-xs font-bold text-slate-300 hover:text-white"
            >
              <Share2 className="w-3.5 h-3.5 mr-1" />
              Share
            </Button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pr-1">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#A34EFF] animate-spin" />
            </div>
          ) : (
            badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  b.is_unlocked
                    ? 'bg-[#071329] border-[#20D994]/40 shadow-lg'
                    : 'bg-[#071329]/50 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      b.is_unlocked
                        ? 'bg-[#20D994]/20 text-[#20D994]'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    {b.rarity}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{b.name}</h4>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5">{b.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  {b.is_unlocked ? (
                    <span className="text-[#20D994] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
