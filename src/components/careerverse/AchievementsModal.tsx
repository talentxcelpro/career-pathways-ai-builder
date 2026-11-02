import React from 'react';
import { X, Award, CheckCircle2, Lock, Star, Code, Mic, Shield, Flame } from 'lucide-react';
import { CareerBadge } from '@/services/careerverse/careerBadgeAndRewardsService';

interface AchievementsModalProps {
  badges: CareerBadge[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  badges,
  onClose,
}) => {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="w-6 h-6 fill-[#FFCA55] text-[#FFCA55]" />;
      case 'code':
        return <Code className="w-6 h-6 text-[#36D9F5]" />;
      case 'mic':
        return <Mic className="w-6 h-6 text-[#20D994]" />;
      case 'shield':
        return <Shield className="w-6 h-6 text-[#A34EFF]" />;
      case 'flame':
        return <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />;
      default:
        return <Award className="w-6 h-6 text-[#FFCA55]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#101E3B] border border-[#7047F5]/40 shadow-2xl p-6 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFCA55]/20 flex items-center justify-center text-[#FFCA55]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Player Achievements</h3>
              <p className="text-xs text-slate-400">Verified cryptographic career badges anchored in your Career Passport.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badges List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                  badge.earned
                    ? 'bg-[#071329] border-white/10 hover:border-[#FFCA55]/50 shadow-md'
                    : 'bg-[#071329]/40 border-white/5 opacity-50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#101E3B] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                  {getBadgeIcon(badge.icon_name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-black text-white truncate">{badge.name}</h4>
                    {badge.earned ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#20D994]" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight mb-1">{badge.description}</p>
                  {badge.earned && badge.earned_date && (
                    <span className="text-[9px] text-[#36D9F5] font-semibold">Earned on {badge.earned_date}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
