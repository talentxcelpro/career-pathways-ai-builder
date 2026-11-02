import React from 'react';
import {
  Home,
  FileBadge,
  CheckSquare,
  GitBranch,
  ShieldAlert,
  Shield,
  BarChart2,
  Gift,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export type CareerVerseNavSection =
  | 'home'
  | 'passport'
  | 'quests'
  | 'skills'
  | 'boss-battles'
  | 'guilds'
  | 'leaderboards'
  | 'rewards';

interface CareerVerseSidebarProps {
  activeSection: CareerVerseNavSection;
  onSelectSection: (section: CareerVerseNavSection) => void;
  onOpenPremium?: () => void;
}

export const CareerVerseSidebar: React.FC<CareerVerseSidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenPremium,
}) => {
  const navItems: { id: CareerVerseNavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'passport', label: 'Career Passport', icon: <FileBadge className="w-4 h-4" /> },
    { id: 'quests', label: 'Quests', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'skills', label: 'Skill Tree', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'boss-battles', label: 'Boss Battles', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'guilds', label: 'Guilds', icon: <Shield className="w-4 h-4" /> },
    { id: 'leaderboards', label: 'Leaderboards', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'rewards', label: 'Rewards Store', icon: <Gift className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 flex flex-col justify-between h-[calc(100vh-5rem)] sticky top-20 select-none pb-4">
      {/* Navigation List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#7047F5] to-[#A34EFF] text-white shadow-[0_0_18px_rgba(112,71,245,0.45)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Go Premium Card matching reference screenshot */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#101E3B] to-[#0B1730] border border-[#7047F5]/30 p-4 text-center shadow-lg group">
        {/* Ambient radial glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#7047F5]/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-[#FFCA55]/20 rounded-full blur-2xl pointer-events-none" />

        {/* 3D Glowing Chest Icon */}
        <div className="relative mx-auto w-16 h-16 mb-2 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7047F5] via-[#A34EFF] to-[#FFCA55] p-0.5 shadow-[0_0_20px_rgba(255,202,85,0.35)] flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <div className="w-full h-full bg-[#101E3B] rounded-[14px] flex items-center justify-center text-[#FFCA55]">
              <Sparkles className="w-7 h-7 animate-pulse text-[#FFCA55]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h4 className="text-sm font-black text-white">Go Premium</h4>
          <span className="text-[#FFCA55] text-xs">👑</span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Unlock exclusive quests, verified certificates, and direct recruiter interview fast-tracks.
        </p>

        <button
          onClick={onOpenPremium}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FFCA55] to-[#FFA726] hover:from-[#FFA726] hover:to-[#FFCA55] text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(255,202,85,0.4)] flex items-center justify-center gap-1.5 transition-all transform hover:-translate-y-0.5"
        >
          <span>Upgrade</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
