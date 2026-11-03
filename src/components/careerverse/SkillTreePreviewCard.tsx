import React from 'react';
import { GitBranch, ChevronRight, CheckCircle2, Lock, Zap, Sparkles } from 'lucide-react';
import { CareerTreeSkill } from '@/services/careerverse/careerSkillTreeService';

interface SkillTreePreviewProps {
  skills: CareerTreeSkill[];
  onOpenFullTree: () => void;
}

export const SkillTreePreviewCard: React.FC<SkillTreePreviewProps> = ({
  skills,
  onOpenFullTree
}) => {
  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#7047F5]/20 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF] border border-[#7047F5]/30">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">Skill Tree</h3>
            <p className="text-[11px] text-slate-400">Technology & Architecture</p>
          </div>
        </div>

        <button
          onClick={onOpenFullTree}
          className="text-xs font-semibold text-[#36D9F5] hover:text-[#7047F5] transition-colors flex items-center gap-1 group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Branching Tree Diagram (Centered & Proportioned) */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 z-10">
        {/* Tier 1 Node: Frontend */}
        <div className="flex flex-col items-center">
          <div className="px-5 py-2 rounded-xl bg-[#071329] border-2 border-[#20D994] shadow-lg shadow-[#20D994]/20 text-center flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#20D994]" />
            <div>
              <span className="text-xs font-black text-white block leading-tight">Frontend</span>
              <span className="text-[9px] text-[#20D994] font-bold uppercase tracking-wider">Lv. 1–5 • Mastered</span>
            </div>
          </div>
          {/* Connector down */}
          <div className="w-0.5 h-4 bg-gradient-to-b from-[#20D994] to-[#36D9F5]" />
        </div>

        {/* Tier 2 Crossbar & Nodes: React & Backend */}
        <div className="w-full max-w-[280px] flex flex-col items-center relative">
          {/* Horizontal crossbar */}
          <div className="w-48 h-0.5 bg-[#36D9F5]/80" />

          <div className="w-full flex justify-between pt-2">
            {/* React Node */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-0.5 h-2 bg-[#36D9F5]" />
              <div className="px-3.5 py-2 rounded-xl bg-[#071329] border border-[#36D9F5] shadow-md shadow-[#36D9F5]/20 text-center flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#36D9F5]" />
                <div>
                  <span className="text-xs font-black text-white block leading-tight">React</span>
                  <span className="text-[9px] text-[#36D9F5] font-semibold">Lv. 6–10</span>
                </div>
              </div>
              <div className="w-0.5 h-3 bg-[#36D9F5]/60" />
            </div>

            {/* Backend Node */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-0.5 h-2 bg-[#36D9F5]" />
              <div className="px-3.5 py-2 rounded-xl bg-[#071329] border border-[#36D9F5] shadow-md shadow-[#36D9F5]/20 text-center flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#36D9F5]" />
                <div>
                  <span className="text-xs font-black text-white block leading-tight">Backend</span>
                  <span className="text-[9px] text-[#36D9F5] font-semibold">Lv. 6–10</span>
                </div>
              </div>
              <div className="w-0.5 h-3 bg-[#36D9F5]/60" />
            </div>
          </div>
        </div>

        {/* Tier 3 Nodes: Full Stack & AI/ML */}
        <div className="w-full max-w-[280px] flex justify-between z-10">
          <div className="px-3 py-1.5 rounded-xl bg-[#071329] border border-[#7047F5] shadow-md shadow-[#7047F5]/20 text-center flex-1 mx-1 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#A34EFF]" />
            <div>
              <span className="text-[11px] font-black text-white block leading-tight">Full Stack</span>
              <span className="text-[9px] text-[#A34EFF] font-semibold">Lv. 11–15</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#071329] border border-[#7047F5] shadow-md shadow-[#7047F5]/20 text-center flex-1 mx-1 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#A34EFF]" />
            <div>
              <span className="text-[11px] font-black text-white block leading-tight">AI / ML</span>
              <span className="text-[9px] text-[#A34EFF] font-semibold">Lv. 11–15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Interactive Trigger */}
      <button
        onClick={onOpenFullTree}
        className="w-full py-2.5 rounded-xl bg-[#071329] hover:bg-[#16274D] border border-white/10 hover:border-[#36D9F5]/50 transition-all text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 z-10"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#36D9F5]" />
        <span>Expand Interactive Tech Tree</span>
      </button>
    </div>
  );
};
