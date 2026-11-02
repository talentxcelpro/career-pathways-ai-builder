import React from 'react';
import { Edit2, ExternalLink, ChevronRight, Award, Zap, Code, Mic } from 'lucide-react';
import { CareerPlayer, getLevelFloorXP, getNextLevelThreshold } from '@/services/careerverse/careerPlayerService';

interface PlayerCardProps {
  player: CareerPlayer;
  onOpenPassport: () => void;
  onOpenAchievements: () => void;
  onEditProfile?: () => void;
}

export const PlayerProfileCard: React.FC<PlayerCardProps> = ({
  player,
  onOpenPassport,
  onOpenAchievements,
  onEditProfile
}) => {
  const currentLevel = player.level;
  const currentXP = player.xp;
  const floorXP = getLevelFloorXP(currentLevel);
  const ceilXP = getNextLevelThreshold(currentLevel);
  const levelProgressXP = Math.max(0, currentXP - floorXP);
  const levelRequiredXP = Math.max(1, ceilXP - floorXP);
  const percentage = Math.min(100, Math.round((levelProgressXP / levelRequiredXP) * 100));

  const stats = player.stats || { javascript: 82, react: 76, communication: 64 };

  return (
    <div className="bg-[#101E3B] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Top Identity: Avatar + Hexagon Badge + Name */}
      <div className="flex items-start gap-4">
        {/* Avatar with Level 12 Hexagon Badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 shadow-lg shadow-[#7047F5]/30">
            {player.avatar_url ? (
              <img
                src={player.avatar_url}
                alt={player.display_name}
                className="w-full h-full rounded-[14px] object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-[#071329] flex items-center justify-center text-xl font-black text-white">
                {player.display_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Hexagon Level Badge */}
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#FFCA55] to-[#FFA726] text-slate-950 font-black text-[11px] shadow-md flex items-center gap-0.5 border border-white/20">
            <span>Lv.</span>
            <span>{player.level}</span>
          </div>
        </div>

        {/* Name, Title, and College */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white truncate">{player.display_name}</h3>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Edit Player Profile"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-[#36D9F5]">{player.career_title}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{player.college}</p>
        </div>
      </div>

      {/* XP Progression Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Level Progress</span>
          <span className="font-bold text-white">
            {currentXP.toLocaleString()} / {ceilXP.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#278DFF] via-[#36D9F5] to-[#20D994] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Skill Statistic Chips (JavaScript, React, Communication) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#071329] border border-white/5 rounded-xl p-2.5 text-center flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#FFCA55]/15 flex items-center justify-center mb-1">
            <Code className="w-3 h-3 text-[#FFCA55]" />
          </div>
          <span className="text-sm font-black text-white">{stats.javascript ?? 82}</span>
          <span className="text-[10px] text-slate-400 font-medium truncate">JavaScript</span>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-xl p-2.5 text-center flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#36D9F5]/15 flex items-center justify-center mb-1">
            <Zap className="w-3 h-3 text-[#36D9F5]" />
          </div>
          <span className="text-sm font-black text-white">{stats.react ?? 76}</span>
          <span className="text-[10px] text-slate-400 font-medium truncate">React</span>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-xl p-2.5 text-center flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#A34EFF]/15 flex items-center justify-center mb-1">
            <Mic className="w-3 h-3 text-[#A34EFF]" />
          </div>
          <span className="text-sm font-black text-white">{stats.communication ?? 64}</span>
          <span className="text-[10px] text-slate-400 font-medium truncate">Comm.</span>
        </div>
      </div>

      {/* Career Passport Gateway */}
      <button
        onClick={onOpenPassport}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#18264A] to-[#121E38] border border-[#278DFF]/25 hover:border-[#36D9F5]/60 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#278DFF]/20 flex items-center justify-center text-[#36D9F5]">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white group-hover:text-[#36D9F5] transition-colors">Career Passport</h4>
            <p className="text-[10px] text-slate-400">Your verified career profile</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* Achievements Preview */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Achievements</span>
          <button
            onClick={onOpenAchievements}
            className="text-[11px] font-semibold text-[#36D9F5] hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl bg-[#071329] border border-[#FFCA55]/30">
            <Award className="w-5 h-5 text-[#FFCA55] mb-1" />
            <span className="text-[10px] font-bold text-white text-center">First Quest</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-[#071329] border border-[#7047F5]/30">
            <Code className="w-5 h-5 text-[#A34EFF] mb-1" />
            <span className="text-[10px] font-bold text-white text-center">Code Warrior</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-[#071329] border border-[#20D994]/30">
            <Mic className="w-5 h-5 text-[#20D994] mb-1" />
            <span className="text-[10px] font-bold text-white text-center">Interview Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
