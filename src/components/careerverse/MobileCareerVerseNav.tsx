import React from 'react';
import { Home, Gamepad2, Target, Briefcase, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MobileNavProps {
  onOpenQuests: () => void;
  onOpenProfile: () => void;
}

export const MobileCareerVerseNav: React.FC<MobileNavProps> = ({
  onOpenQuests,
  onOpenProfile
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#071329]/95 backdrop-blur-lg border-t border-[#101E3B] px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          currentPath === '/' ? 'text-[#36D9F5]' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      <Link
        to="/play"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          currentPath === '/play' ? 'text-[#36D9F5]' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Gamepad2 className="w-5 h-5" />
        <span className="text-[10px] font-bold">Play</span>
      </Link>

      <button
        onClick={onOpenQuests}
        className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-400 hover:text-white transition-colors"
      >
        <Target className="w-5 h-5" />
        <span className="text-[10px] font-bold">Quests</span>
      </button>

      <Link
        to="/jobs"
        className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-400 hover:text-white transition-colors"
      >
        <Briefcase className="w-5 h-5" />
        <span className="text-[10px] font-bold">Jobs</span>
      </Link>

      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-400 hover:text-white transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </nav>
  );
};
