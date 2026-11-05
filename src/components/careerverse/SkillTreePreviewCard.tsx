import React from 'react';
import { GitBranch, ChevronRight, CheckCircle2, Lock, Zap, Sparkles } from 'lucide-react';
import { CareerTreeSkill } from '@/services/careerverse/careerSkillTreeService';
import { CareerDomainId, CAREER_DOMAINS } from '@/services/careerverse/careerDomainCatalog';
import { gameAudio } from '@/utils/gameAudio';

interface SkillTreePreviewProps {
  skills: CareerTreeSkill[];
  domainId?: CareerDomainId;
  onOpenFullTree: () => void;
}

export const SkillTreePreviewCard: React.FC<SkillTreePreviewProps> = ({
  skills,
  domainId = 'technology',
  onOpenFullTree,
}) => {
  const domainConfig = CAREER_DOMAINS[domainId] || CAREER_DOMAINS.technology;
  const nodes = domainConfig.skillNodes;

  const node1 = nodes[0] || { name: 'Foundation', levelRange: 'Lv. 1–5', status: 'mastered' };
  const node2 = nodes[1] || { name: 'Core Branch A', levelRange: 'Lv. 6–10', status: 'unlocked' };
  const node3 = nodes[2] || { name: 'Core Branch B', levelRange: 'Lv. 6–10', status: 'unlocked' };
  const node4 = nodes[3] || { name: 'Advanced Mastery', levelRange: 'Lv. 11–15', status: 'locked' };
  const node5 = nodes[4] || { name: 'Executive Level', levelRange: 'Lv. 11–15', status: 'locked' };

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-xl h-full">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#7047F5]/20 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF] border border-[#7047F5]/30">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-lg leading-tight">Skill Tree</h3>
            <p className="text-xs text-slate-300 font-medium">{domainConfig.label}</p>
          </div>
        </div>

        <button
          onClick={() => {
            gameAudio.playClick();
            onOpenFullTree();
          }}
          className="text-xs sm:text-sm font-bold text-[#36D9F5] hover:text-[#7047F5] transition-colors flex items-center gap-1 group cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Branching Tree Diagram (Centered & Proportioned) */}
      <div className="flex-1 flex flex-col items-center justify-center py-3 z-10">
        {/* Tier 1 Node: Root Mastered Node */}
        <div className="flex flex-col items-center">
          <div className="px-5 py-2.5 rounded-xl bg-[#071329] border-2 border-[#20D994] shadow-lg shadow-[#20D994]/20 text-center flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#20D994]" />
            <div>
              <span className="text-xs sm:text-sm font-black text-white block leading-tight">{node1.name}</span>
              <span className="text-[10px] sm:text-xs text-[#20D994] font-bold uppercase tracking-wider">{node1.levelRange} • Mastered</span>
            </div>
          </div>
          {/* Connector down */}
          <div className="w-0.5 h-4 bg-gradient-to-b from-[#20D994] to-[#36D9F5]" />
        </div>

        {/* Tier 2 Crossbar & Nodes: Branch A & Branch B */}
        <div className="w-full max-w-[320px] flex flex-col items-center relative">
          {/* Horizontal crossbar */}
          <div className="w-56 h-0.5 bg-[#36D9F5]/80" />

          <div className="w-full flex justify-between pt-2">
            {/* Branch A Node */}
            <div className="flex flex-col items-center flex-1 px-1">
              <div className="w-0.5 h-2 bg-[#36D9F5]" />
              <div className="w-full px-3 py-2 rounded-xl bg-[#071329] border border-[#36D9F5] shadow-md shadow-[#36D9F5]/20 text-center flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#36D9F5]" />
                <div>
                  <span className="text-xs sm:text-sm font-black text-white block leading-tight">{node2.name}</span>
                  <span className="text-[10px] sm:text-xs text-[#36D9F5] font-semibold">{node2.levelRange}</span>
                </div>
              </div>
              <div className="w-0.5 h-3 bg-[#36D9F5]/60" />
            </div>

            {/* Branch B Node */}
            <div className="flex flex-col items-center flex-1 px-1">
              <div className="w-0.5 h-2 bg-[#36D9F5]" />
              <div className="w-full px-3 py-2 rounded-xl bg-[#071329] border border-[#36D9F5] shadow-md shadow-[#36D9F5]/20 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#36D9F5]" />
                <div>
                  <span className="text-xs sm:text-sm font-black text-white block leading-tight">{node3.name}</span>
                  <span className="text-[10px] sm:text-xs text-[#36D9F5] font-semibold">{node3.levelRange}</span>
                </div>
              </div>
              <div className="w-0.5 h-3 bg-[#36D9F5]/60" />
            </div>
          </div>
        </div>

        {/* Tier 3 Nodes: Node 4 & Node 5 */}
        <div className="w-full max-w-[320px] flex justify-between z-10 pt-1">
          <div className="px-3 py-2 rounded-xl bg-[#071329] border border-[#7047F5] shadow-md shadow-[#7047F5]/20 text-center flex-1 mx-1 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#A34EFF]" />
            <div>
              <span className="text-xs sm:text-sm font-black text-white block leading-tight">{node4.name}</span>
              <span className="text-[10px] sm:text-xs text-[#A34EFF] font-semibold">{node4.levelRange}</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[#071329] border border-[#7047F5] shadow-md shadow-[#7047F5]/20 text-center flex-1 mx-1 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#A34EFF]" />
            <div>
              <span className="text-xs sm:text-sm font-black text-white block leading-tight">{node5.name}</span>
              <span className="text-[10px] sm:text-xs text-[#A34EFF] font-semibold">{node5.levelRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-white/5 z-10 text-slate-300">
        <span>Track Mastery</span>
        <span className="text-[#20D994] font-black">Tier 2 Unlocked</span>
      </div>
    </div>
  );
};
