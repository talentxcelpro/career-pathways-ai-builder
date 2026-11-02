import React from 'react';
import { Users, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampusGuild } from '@/services/careerverse/careerLeaderboardService';

interface GuildProps {
  guild: CampusGuild | null;
  onOpenGuildHub: () => void;
}

export const GuildWidget: React.FC<GuildProps> = ({ guild, onOpenGuildHub }) => {
  const defaultGuild = {
    name: 'TechTitans – ABC College',
    member_count: 42,
    campus_rank: 3,
    college: 'ABC College of Technology'
  };

  const g = guild || defaultGuild;

  return (
    <div className="bg-[#101E3B] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#A34EFF]/15 flex items-center justify-center text-[#A34EFF]">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-white text-base">My Guild</h3>
      </div>

      {/* Guild Details */}
      <div className="flex items-center gap-3.5">
        {/* Shield Emblem */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7047F5] to-[#278DFF] p-0.5 shadow-lg shadow-[#7047F5]/25 flex-shrink-0">
          <div className="w-full h-full bg-[#071329] rounded-[10px] flex items-center justify-center text-[#36D9F5]">
            <span className="font-mono font-black text-sm">&lt;/&gt;</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-white truncate">{g.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {g.member_count} Members · <span className="text-[#FFCA55] font-bold">Rank #{g.campus_rank}</span> (Campus)
          </p>
        </div>
      </div>

      {/* Guild Hub Button */}
      <Button
        onClick={onOpenGuildHub}
        variant="outline"
        className="w-full bg-[#071329] hover:bg-[#16274D] border-white/10 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
      >
        <span>Guild Hub</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
