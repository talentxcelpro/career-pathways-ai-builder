import React from 'react';
import { Swords, Check, ArrowRight, Star, Shield, Award } from 'lucide-react';
import { CareerBossBattle } from '@/services/careerverse/careerBossBattleService';

interface BossBattleCardProps {
  battle: CareerBossBattle | null;
  onAcceptBattle?: (battle: CareerBossBattle) => void;
}

export const BossBattleCard: React.FC<BossBattleCardProps> = ({
  battle,
  onAcceptBattle,
}) => {
  const stages = battle?.stages || [
    { id: 1, name: 'Code Challenge', description: '', status: 'completed' },
    { id: 2, name: 'Debug & Improve', description: '', status: 'active' },
    { id: 3, name: 'Tech Interview', description: '', status: 'locked' },
    { id: 4, name: 'Final Interview', description: '', status: 'locked' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl">
      {/* Background ambient monster / dragon glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7047F5]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#A34EFF]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#FFCA55]">
            <Swords className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Boss Battle – Job Challenge</h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Boss Creature Artwork + Challenge Details matching reference screenshot */}
      <div className="flex flex-col lg:flex-row items-center gap-5">
        {/* Fantasy Dragon / Boss Illustration */}
        <div className="w-full lg:w-48 h-36 rounded-2xl overflow-hidden relative shrink-0 border border-white/10 bg-[#071329] group">
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80"
            alt="Boss Battle Challenge"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071329] via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 text-[10px] font-black tracking-wider text-rose-400 uppercase bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
            Legendary Employer
          </div>
        </div>

        {/* Challenge Info */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
              <img
                src={battle?.company_logo || 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'}
                alt={battle?.company_name || 'Employer'}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="font-black text-white text-base leading-snug">
                {battle?.title || 'Frontend Developer Challenge'}
              </h4>
              <p className="text-xs text-slate-400 font-medium">
                {battle?.badge_subtitle || 'Microsoft (Hiring Internship)'}
              </p>
            </div>
          </div>

          {/* 4-Stage Stepper matching reference screenshot */}
          <div className="relative flex items-center justify-between pt-1">
            <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-700 -z-0" />

            {stages.map((stage) => {
              const isCompleted = stage.status === 'completed';
              const isActive = stage.status === 'active';

              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#20D994] text-slate-950 shadow-[0_0_8px_rgba(32,217,148,0.5)]'
                        : isActive
                        ? 'bg-[#20D994] text-slate-950 border-2 border-white animate-pulse'
                        : 'bg-[#071329] border border-slate-600 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stage.id}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 mt-1.5 text-center whitespace-nowrap">
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Victory Rewards & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="text-slate-400 font-semibold">Victory Reward:</span>
              <div className="flex items-center gap-1 text-[#FFCA55] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#FFCA55]" />
                <span>+500 XP</span>
              </div>
              <div className="flex items-center gap-1 text-[#36D9F5] font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Skill Badge</span>
              </div>
              <div className="flex items-center gap-1 text-[#20D994] font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Interview Fast-Track</span>
              </div>
            </div>

            <button
              onClick={() => battle && onAcceptBattle?.(battle)}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#7047F5] via-[#A34EFF] to-[#278DFF] hover:from-[#A34EFF] hover:to-[#7047F5] text-white text-xs font-black shadow-[0_0_20px_rgba(112,71,245,0.5)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <span>Accept Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
