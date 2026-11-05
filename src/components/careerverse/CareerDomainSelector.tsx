// src/components/careerverse/CareerDomainSelector.tsx
// Responsive Multi-Industry Track Selector for CareerVerse

import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  Coins, 
  Users, 
  Code2, 
  Sparkles 
} from 'lucide-react';
import { CareerDomainId, CAREER_DOMAINS } from '@/services/careerverse/careerDomainCatalog';
import { gameAudio } from '@/utils/gameAudio';

interface CareerDomainSelectorProps {
  selectedDomain: CareerDomainId;
  onSelectDomain: (domain: CareerDomainId) => void;
}

export const CareerDomainSelector: React.FC<CareerDomainSelectorProps> = ({
  selectedDomain,
  onSelectDomain,
}) => {
  const domains: Array<{
    id: CareerDomainId;
    label: string;
    icon: React.ElementType;
    accent: string;
  }> = [
    { id: 'student_early_career', label: 'Student & Campus', icon: GraduationCap, accent: '#36D9F5' },
    { id: 'business_operations', label: 'Business & Ops', icon: Briefcase, accent: '#FFCA55' },
    { id: 'marketing_growth', label: 'Marketing & Growth', icon: TrendingUp, accent: '#A34EFF' },
    { id: 'finance_accounting', label: 'Finance & Accounts', icon: Coins, accent: '#20D994' },
    { id: 'human_resources', label: 'HR & Talent', icon: Users, accent: '#FF6492' },
    { id: 'technology', label: 'Tech & Engineering', icon: Code2, accent: '#278DFF' },
  ];

  return (
    <div className="w-full bg-[#101E3B]/80 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#36D9F5]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-white">Career Industry Tracks</span>
            <span className="text-xs text-slate-400 ml-2 hidden md:inline">
              Select your path to personalize quests, boss battles & skill tree
            </span>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
          Current: <strong className="text-white">{CAREER_DOMAINS[selectedDomain]?.shortLabel || 'All Industries'}</strong>
        </span>
      </div>

      {/* Domain Pill Tabs with horizontal scroll on small screens */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {domains.map((d) => {
          const isSelected = selectedDomain === d.id;
          const Icon = d.icon;

          return (
            <button
              key={d.id}
              onClick={() => {
                gameAudio.playClick();
                onSelectDomain(d.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r text-white shadow-lg shadow-black/40 border'
                  : 'bg-[#071329]/80 text-slate-300 hover:text-white hover:bg-[#071329] border border-white/5'
              }`}
              style={{
                borderColor: isSelected ? d.accent : 'rgba(255, 255, 255, 0.08)',
                background: isSelected
                  ? `linear-gradient(135deg, #101E3B 0%, ${d.accent}30 100%)`
                  : undefined,
              }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{
                  backgroundColor: isSelected ? `${d.accent}40` : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? d.accent : '#94A3B8',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{d.label}</span>
              {isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: d.accent }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
