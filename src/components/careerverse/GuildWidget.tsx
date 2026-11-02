import React from 'react';
import { Users, Code, ChevronRight } from 'lucide-react';
import { CareerGuild } from '@/services/careerverse/careerLeaderboardService';

interface GuildWidgetProps {
  guild: CareerGuild | null;
  onOpenGuildHub?: () => void;
}

export const GuildWidget: React.FC<GuildWidgetProps> = ({
  guild,
  onOpenGuildHub,
}) => {
  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#A34EFF]/20 flex items-center justify-center text-[#A34EFF]">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-white text-base">My Guild</h3>
      </div>

      {/* Guild Details matching reference screenshot */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#071329]/60 border border-white/5">
        {/* Holographic Shield Emblem */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7047F5] via-[#A34EFF] to-[#36D9F5] p-0.5 shadow-[0_0_15px_rgba(112,71,245,0.4)] shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-[#101E3B] rounded-[10px] flex items-center justify-center text-[#36D9F5]">
            <Code className="w-6 h-6" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-black text-white truncate">
            {guild?.name || 'TechTitans'} – {guild?.campus_name || 'ABC College'}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium">
            {guild?.member_count || 42} Members • Rank #{guild?.campus_rank || 3} (Campus)
          </p>
        </div>
      </div>

      {/* Guild Hub Action */}
      <button
        onClick={onOpenGuildHub}
        className="w-full py-2 px-3 rounded-xl bg-[#7047F5]/20 hover:bg-[#7047F5]/30 border border-[#7047F5]/50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
      >
        <span>Guild Hub</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
