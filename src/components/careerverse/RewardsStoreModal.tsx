import React, { useState } from 'react';
import { X, Gift, Coins, Check, Sparkles } from 'lucide-react';
import { CareerReward, careerRewardsService } from '@/services/careerverse/careerBadgeAndRewardsService';
import { toast } from 'sonner';

interface RewardsStoreModalProps {
  userCoins: number;
  userId: string;
  onClose: () => void;
  onRewardRedeemed: () => void;
}

export const RewardsStoreModal: React.FC<RewardsStoreModalProps> = ({
  userCoins,
  userId,
  onClose,
  onRewardRedeemed,
}) => {
  const [rewards, setRewards] = useState<CareerReward[]>(careerRewardsService.getDefaultRewards());
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const handleRedeem = async (reward: CareerReward) => {
    if (userCoins < reward.cost_coins) {
      toast.error(`Insufficient coins! You need ${reward.cost_coins} coins.`);
      return;
    }

    setRedeemingId(reward.id);
    try {
      const res = await careerRewardsService.redeemReward(userId, reward.id);
      if (res.success) {
        toast.success(`Success! ${reward.title} has been added to your inventory!`);
        onRewardRedeemed();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Could not complete redemption.');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#101E3B] border border-[#7047F5]/40 shadow-2xl p-6 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFCA55]/20 flex items-center justify-center text-[#FFCA55]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Career Rewards Store</h3>
              <p className="text-xs text-slate-400">Redeem coins earned through quests and boss battles for career perks.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071329] border border-[#FFCA55]/40 text-[#FFCA55] font-black text-xs shadow-inner">
              <Coins className="w-4 h-4" />
              <span>{userCoins} Coins Available</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => {
            const canAfford = userCoins >= reward.cost_coins;
            const isRedeeming = redeemingId === reward.id;

            return (
              <div
                key={reward.id}
                className="bg-[#071329] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-[#7047F5]/50 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#36D9F5] px-2 py-0.5 rounded bg-[#101E3B]">
                      {reward.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-black text-[#FFCA55]">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{reward.cost_coins} Coins</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{reward.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{reward.description}</p>
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford || isRedeeming}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#FFCA55] to-[#FFA726] hover:from-[#FFA726] hover:to-[#FFCA55] text-slate-950 shadow-[0_0_12px_rgba(255,202,85,0.3)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRedeeming ? 'Redeeming...' : canAfford ? 'Redeem Perk' : 'Insufficient Coins'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
