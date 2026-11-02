import React from 'react';
import { Edit2, ChevronRight, Award, Shield, Star, Code, Mic } from 'lucide-react';
import { CareerPlayer } from '@/services/careerverse/careerPlayerService';

interface PlayerProfileCardProps {
  player: CareerPlayer | null;
  onEditProfile?: () => void;
  onOpenPassport?: () => void;
  onViewAchievements?: () => void;
}

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({
  player,
  onEditProfile,
  onOpenPassport,
  onViewAchievements,
}) => {
  const currentXp = player?.xp || 2450;
  const nextLevelXp = player?.next_level_xp || 3000;
  const progressPct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Avatar & Player Identity with Level Badge */}
      <div className="relative flex flex-col items-center text-center">
        {/* Ambient Halo */}
        <div className="absolute top-0 w-36 h-36 bg-[#7047F5]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-2xl p-0.5 bg-gradient-to-tr from-[#7047F5] via-[#278DFF] to-[#36D9F5] shadow-[0_0_20px_rgba(112,71,245,0.4)]">
            <img
              src={player?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={player?.name || 'Player'}
              className="w-full h-full rounded-[14px] object-cover"
            />
          </div>

          {/* Level Badge matching reference screenshot */}
          <div className="absolute -bottom-2 -left-3 px-2 py-1 rounded-lg bg-gradient-to-r from-[#FFCA55] to-[#FFA726] text-slate-950 font-black text-xs shadow-lg flex items-center gap-1 border-2 border-[#101E3B]">
            <Shield className="w-3.5 h-3.5" />
            <span>Lv. {player?.level || 12}</span>
          </div>
        </div>

        {/* Player Name and Title */}
        <div className="flex items-center gap-1.5 justify-center">
          <h2 className="text-lg font-black text-white">{player?.name || 'Arjun Verma'}</h2>
          <button
            onClick={onEditProfile}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            title="Edit Title"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-[#36D9F5] font-semibold tracking-wide">
          {player?.title || 'Frontend Explorer'}
        </p>

        {/* XP Bar */}
        <div className="w-full mt-3 space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-300">
            <span>XP Progress</span>
            <span className="text-[#36D9F5]">
              {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#071329] overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7047F5] via-[#278DFF] to-[#36D9F5] transition-all duration-500 shadow-[0_0_8px_rgba(54,217,245,0.7)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Skill Statistic Chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#071329]/80 border border-white/5 rounded-xl p-2.5 text-center">
          <div className="text-[#FFCA55] flex justify-center mb-1">
            <Code className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-white">{player?.stats.javascript || 82}</div>
          <div className="text-[10px] text-slate-400 font-medium">JavaScript</div>
        </div>

        <div className="bg-[#071329]/80 border border-white/5 rounded-xl p-2.5 text-center">
          <div className="text-[#36D9F5] flex justify-center mb-1">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-white">{player?.stats.react || 76}</div>
          <div className="text-[10px] text-slate-400 font-medium">React</div>
        </div>

        <div className="bg-[#071329]/80 border border-white/5 rounded-xl p-2.5 text-center">
          <div className="text-[#A34EFF] flex justify-center mb-1">
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-white">{player?.stats.communication || 64}</div>
          <div className="text-[10px] text-slate-400 font-medium">Communication</div>
        </div>
      </div>

      {/* Career Passport Action Link */}
      <button
        onClick={onOpenPassport}
        className="w-full bg-[#071329]/90 hover:bg-[#071329] border border-[#7047F5]/30 hover:border-[#7047F5] rounded-xl p-3 flex items-center justify-between text-left transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF] group-hover:scale-110 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-[#36D9F5] transition-colors">
              Career Passport
            </div>
            <div className="text-[10px] text-slate-400">Your verified career profile</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* Achievements (8) Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Achievements (8)</span>
          <button
            onClick={onViewAchievements}
            className="text-[11px] font-semibold text-[#A34EFF] hover:underline flex items-center gap-0.5"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Badge 1 */}
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#071329]/50 border border-white/5 hover:border-[#FFCA55]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFCA55] to-[#FFA726] p-0.5 flex items-center justify-center shadow-[0_0_10px_rgba(255,202,85,0.3)] mb-1">
              <div className="w-full h-full bg-[#101E3B] rounded-[10px] flex items-center justify-center text-[#FFCA55]">
                <Star className="w-5 h-5 fill-[#FFCA55]" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-200">First Quest</span>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#071329]/50 border border-white/5 hover:border-[#7047F5]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7047F5] to-[#278DFF] p-0.5 flex items-center justify-center shadow-[0_0_10px_rgba(112,71,245,0.3)] mb-1">
              <div className="w-full h-full bg-[#101E3B] rounded-[10px] flex items-center justify-center text-[#36D9F5]">
                <Code className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-200">Code Warrior</span>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-[#071329]/50 border border-white/5 hover:border-[#20D994]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#20D994] to-[#00E676] p-0.5 flex items-center justify-center shadow-[0_0_10px_rgba(32,217,148,0.3)] mb-1">
              <div className="w-full h-full bg-[#101E3B] rounded-[10px] flex items-center justify-center text-[#20D994]">
                <Mic className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-200">Interview Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
