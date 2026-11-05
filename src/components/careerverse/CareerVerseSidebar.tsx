import React from 'react';
import { 
  Home, 
  Map, 
  Target, 
  GitBranch, 
  Swords, 
  Trophy, 
  ShoppingBag, 
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { gameAudio } from '@/utils/gameAudio';

interface SidebarProps {
  activeSection: string;
  onNavigateSection: (section: string) => void;
  onOpenPassport: () => void;
  onOpenRewards: () => void;
  onOpenSkillTree: () => void;
  onOpenAchievements: () => void;
}

export const CareerVerseSidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigateSection,
  onOpenPassport,
  onOpenRewards,
  onOpenSkillTree,
  onOpenAchievements,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => onNavigateSection('home') },
    { id: 'passport', label: 'Career Passport', icon: ShieldCheck, action: onOpenPassport },
    { id: 'quests', label: 'Quests', icon: Target, action: () => onNavigateSection('quests') },
    { id: 'tree', label: 'Skill Tree', icon: GitBranch, action: onOpenSkillTree },
    { id: 'boss', label: 'Boss Battles', icon: Swords, action: () => onNavigateSection('boss') },
    { id: 'guilds', label: 'Guilds', icon: Trophy, action: () => onNavigateSection('guilds') },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy, action: () => onNavigateSection('leaderboards') },
    { id: 'rewards', label: 'Rewards Store', icon: ShoppingBag, action: onOpenRewards },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col gap-6">
      {/* Navigation List */}
      <div className="bg-[#101E3B]/90 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                gameAudio.playClick();
                item.action();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#7047F5] to-[#278DFF] text-white shadow-lg shadow-[#7047F5]/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upgrade / Go Premium Box */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-b from-[#18264A] to-[#101E3B] border border-[#7047F5]/30 shadow-xl">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#7047F5]/20 rounded-full blur-2xl pointer-events-none" />
        
        {/* Chest Artwork */}
        <div className="w-14 h-14 rounded-2xl bg-[#071329] border border-[#FFCA55]/40 flex items-center justify-center mb-3 shadow-lg shadow-[#FFCA55]/20">
          <Sparkles className="w-7 h-7 text-[#FFCA55] animate-bounce" />
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="font-black text-white text-base">Go Premium</h4>
          <span className="text-sm">👑</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
          Unlock exclusive quests, verified certificates, and direct recruiter access.
        </p>

        <Link to="/pricing" onClick={() => gameAudio.playClick()}>
          <Button className="w-full bg-gradient-to-r from-[#FFCA55] to-[#FFA726] hover:from-[#ffbe3b] hover:to-[#f59714] text-slate-950 font-black text-xs sm:text-sm py-2.5 h-auto shadow-lg shadow-[#FFCA55]/25 cursor-pointer">
            Upgrade
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </aside>
  );
};
