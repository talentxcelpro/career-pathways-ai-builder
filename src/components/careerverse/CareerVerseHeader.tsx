import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, BookOpen, Briefcase, Users, UserCheck, Bell, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CareerPlayer } from '@/services/careerverse/careerPlayerService';

interface HeaderProps {
  player: CareerPlayer;
  isGuest: boolean;
  onOpenAICoach: () => void;
}

export const CareerVerseHeader: React.FC<HeaderProps> = ({ player, isGuest, onOpenAICoach }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#071329]/95 backdrop-blur-md border-b border-[#101E3B] px-4 lg:px-8 py-3">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5 shadow-lg shadow-[#7047F5]/30">
              <div className="w-full h-full bg-[#071329] rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-[#36D9F5] group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                Talent<span className="text-[#36D9F5]">Xcel</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#7047F5]/20 text-[#A34EFF] border border-[#7047F5]/30 font-semibold tracking-normal">
                  Career RPG
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#101E3B]/60 p-1 rounded-xl border border-white/5">
          <button 
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#7047F5] to-[#278DFF] text-white shadow-md shadow-[#7047F5]/30 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            Play
          </button>
          <Link 
            to="/learning" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Learn
          </Link>
          <Link 
            to="/jobs" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Jobs
          </Link>
          <Link 
            to="/network" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Users className="w-4 h-4" />
            Community
          </Link>
          <Link 
            to="/recruiters" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            For Recruiters
          </Link>
        </nav>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-3">
          {/* AI Career Coach Pill */}
          <button
            onClick={onOpenAICoach}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7047F5]/20 to-[#36D9F5]/20 border border-[#36D9F5]/30 text-xs font-semibold text-[#36D9F5] hover:border-[#36D9F5] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#36D9F5] animate-pulse" />
            <span>AI Mentor</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-[#101E3B] text-slate-400 hover:text-white border border-white/5 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36D9F5]" />
          </button>

          {/* User Status / Login */}
          {isGuest ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth?tab=login')}
                className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Log In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth?tab=signup')}
                className="text-xs font-semibold bg-[#278DFF] hover:bg-[#1a7ae0] text-white"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Join Network
              </Button>
            </div>
          ) : (
            <Link to="/passport" className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7047F5] to-[#36D9F5] p-0.5">
                {player.avatar_url ? (
                  <img src={player.avatar_url} alt={player.display_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#101E3B] flex items-center justify-center text-xs font-bold text-white">
                    {player.display_name.charAt(0)}
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
