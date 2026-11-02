import React from 'react';
import { Home, CheckSquare, GitBranch, Swords, Trophy } from 'lucide-react';
import { CareerVerseNavSection } from './CareerVerseSidebar';

interface MobileCareerVerseNavProps {
  activeSection: CareerVerseNavSection;
  onSelectSection: (section: CareerVerseNavSection) => void;
}

export const MobileCareerVerseNav: React.FC<MobileCareerVerseNavProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const tabs = [
    { id: 'home' as CareerVerseNavSection, label: 'RPG', icon: <Home className="w-5 h-5" /> },
    { id: 'quests' as CareerVerseNavSection, label: 'Quests', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'skills' as CareerVerseNavSection, label: 'Skills', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'boss-battles' as CareerVerseNavSection, label: 'Battles', icon: <Swords className="w-5 h-5" /> },
    { id: 'leaderboards' as CareerVerseNavSection, label: 'Rankings', icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#071329]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
      {tabs.map((tab) => {
        const isActive = activeSection === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectSection(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-[#36D9F5] scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                isActive ? 'bg-[#7047F5]/30 shadow-[0_0_10px_rgba(54,217,245,0.4)]' : ''
              }`}
            >
              {tab.icon}
            </div>
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
