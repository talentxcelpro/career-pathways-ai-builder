import React from 'react';
import { Gamepad2, BookOpen, Briefcase, Users, UserCheck, Bell, Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CareerPlayer } from '@/services/careerverse/careerPlayerService';

interface CareerVerseHeaderProps {
  player: CareerPlayer | null;
  onOpenNotifications?: () => void;
  onOpenAICompanion?: () => void;
}

export const CareerVerseHeader: React.FC<CareerVerseHeaderProps> = ({
  player,
  onOpenNotifications,
  onOpenAICompanion,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#071329]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-2.5 flex items-center justify-between transition-all">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/play')}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7047F5] via-[#278DFF] to-[#36D9F5] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(112,71,245,0.4)]">
            <div className="w-full h-full bg-[#071329] rounded-[6px] flex items-center justify-center font-black text-xs text-white">
              TX
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white hidden sm:inline">
            Talent<span className="text-[#36D9F5]">Xcel</span>
          </span>
        </div>

        <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#7047F5]/20 to-[#A34EFF]/30 border border-[#7047F5]/40 text-[#A34EFF] text-xs font-bold tracking-wide">
          Career RPG
        </div>
      </div>

      {/* Main Mode Navigation Bar matching reference screenshot */}
      <nav className="hidden md:flex items-center gap-1.5 bg-[#0B1730] border border-white/5 rounded-full p-1 shadow-inner">
        {/* PLAY */}
        <button
          onClick={() => navigate('/play')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            currentPath.includes('/play') || currentPath.includes('/rpg') || currentPath.includes('/careerverse')
              ? 'bg-gradient-to-r from-[#7047F5] to-[#278DFF] text-white shadow-[0_0_15px_rgba(112,71,245,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Play</span>
        </button>

        {/* LEARN */}
        <button
          onClick={() => navigate('/learning')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learn</span>
        </button>

        {/* JOBS */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Jobs</span>
        </button>

        {/* COMMUNITY */}
        <button
          onClick={() => navigate('/communities')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Community</span>
        </button>

        {/* FOR RECRUITERS */}
        <button
          onClick={() => navigate('/recruiters')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>For Recruiters</span>
        </button>
      </nav>

      {/* Right User Bar */}
      <div className="flex items-center gap-3">
        {/* AI Career Companion quick trigger */}
        <button
          onClick={onOpenAICompanion}
          title="Open AI Career Companion"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101E3B] border border-[#7047F5]/30 text-xs font-medium text-slate-300 hover:text-[#36D9F5] hover:border-[#36D9F5]/50 transition-all shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-[#36D9F5]" />
          <span>AI Companion</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-full bg-[#101E3B] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/20 transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* Player Avatar */}
        <div
          onClick={() => navigate('/passport')}
          className="cursor-pointer flex items-center gap-2 pl-1 group"
          title="View Career Passport"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-r from-[#7047F5] to-[#36D9F5] group-hover:shadow-[0_0_12px_rgba(54,217,245,0.6)] transition-all">
              <img
                src={player?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={player?.name || 'Player'}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1 rounded-full bg-[#7047F5] text-[9px] font-black text-white border border-[#071329]">
              {player?.level || 12}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
