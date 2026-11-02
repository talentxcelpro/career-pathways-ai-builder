import React, { useState, useEffect } from 'react';
import { X, Gift, Coins, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerReward, CareerBadgeAndRewardsService } from '@/services/careerverse/careerBadgeAndRewardsService';
import { toast } from 'sonner';

interface RewardsModalProps {
  isOpen: boolean;
  userId: string;
  coins: number;
  onClose: () => void;
  onCoinsUpdated: () => void;
}

export const RewardsStoreModal: React.FC<RewardsModalProps> = ({
  isOpen,
  userId,
  coins,
  onClose,
  onCoinsUpdated
}) => {
  const [rewards, setRewards] = useState<CareerReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await CareerBadgeAndRewardsService.getRewards();
        setRewards(data);
      } catch (err) {
        console.error('Failed to load rewards:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRedeem = async (reward: CareerReward) => {
    if (userId === 'guest') {
      toast.error('Please log in to spend Career Coins.');
      return;
    }

    try {
      setRedeemingId(reward.id);
      await CareerBadgeAndRewardsService.redeemReward(userId, reward, coins);
      toast.success(`🎁 Successfully redeemed ${reward.title}! Check your email for details.`);
      onCoinsUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#101E3B] border border-[#FFCA55]/30 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCA55]/20 flex items-center justify-center text-[#FFCA55]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Career Rewards Store</h3>
              <p className="text-xs text-slate-400">Redeem hard-earned coins for high-impact perks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#071329] border border-[#FFCA55]/30 text-[#FFCA55] font-black text-xs">
              <Coins className="w-4 h-4" />
              <span>{coins} Coins</span>
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rewards List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#FFCA55] animate-spin" />
            </div>
          ) : (
            rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#071329] border border-white/5 gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white">{reward.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{reward.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-black text-[#FFCA55] bg-[#FFCA55]/10 px-2.5 py-1 rounded-md">
                    {reward.coin_cost} Coins
                  </span>
                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={coins < reward.coin_cost || redeemingId === reward.id}
                    size="sm"
                    className="bg-[#FFCA55] hover:bg-[#e6b345] text-slate-950 font-bold text-xs"
                  >
                    {redeemingId === reward.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Redeem'
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
