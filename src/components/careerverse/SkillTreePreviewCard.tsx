import React from 'react';
import { GitBranch, ChevronRight } from 'lucide-react';
import { CareerSkillNode } from '@/services/careerverse/careerSkillTreeService';

interface SkillTreePreviewProps {
  skills?: CareerSkillNode[];
  onOpenFullTree: () => void;
  onSelectNode?: (node: CareerSkillNode) => void;
}

export const SkillTreePreviewCard: React.FC<SkillTreePreviewProps> = ({
  skills = [],
  onOpenFullTree,
  onSelectNode,
}) => {
  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF]">
            <GitBranch className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Skill Tree – Technology</h3>
        </div>

        <button
          onClick={onOpenFullTree}
          className="text-xs font-semibold text-[#36D9F5] hover:underline flex items-center gap-0.5 transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Branching Visualization matching reference screenshot */}
      <div className="flex flex-col items-center justify-center py-2 relative select-none">
        {/* Tier 1: Frontend */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onSelectNode?.(skills[0] || { id: 'node_frontend', name: 'Frontend', level_range: 'Lv. 1–5', category: 'core', status: 'mastered', prerequisites: [] })}
            className="px-5 py-2 rounded-xl bg-[#071329] border-2 border-[#20D994] shadow-lg shadow-[#20D994]/20 text-center flex flex-col items-center hover:scale-105 transition-transform"
          >
            <span className="text-xs font-black text-white">Frontend</span>
            <span className="text-[10px] text-[#20D994] font-semibold">Lv. 1–5</span>
          </button>
          <div className="w-0.5 h-4 bg-[#20D994]" />
        </div>

        {/* Tier 2: React & Backend */}
        <div className="w-full flex justify-center relative">
          <div className="absolute top-0 w-36 h-0.5 bg-[#36D9F5]" />

          <div className="w-full flex justify-around pt-3">
            <div className="flex flex-col items-center">
              <button
                onClick={() => onSelectNode?.(skills[1] || { id: 'node_react', name: 'React', level_range: 'Lv. 6–10', category: 'specialization', status: 'active', prerequisites: ['node_frontend'] })}
                className="px-4 py-1.5 rounded-xl bg-[#071329] border border-[#36D9F5] shadow-md shadow-[#36D9F5]/20 text-center hover:scale-105 transition-transform"
              >
                <span className="text-xs font-black text-white">React</span>
                <p className="text-[9px] text-[#36D9F5] font-semibold">Lv. 6–10</p>
              </button>
              <div className="w-0.5 h-4 bg-[#36D9F5]" />
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={() => onSelectNode?.(skills[2] || { id: 'node_backend', name: 'Backend', level_range: 'Lv. 6–10', category: 'specialization', status: 'unlocked', prerequisites: ['node_frontend'] })}
                className="px-4 py-1.5 rounded-xl bg-[#071329] border border-[#36D9F5] shadow-md shadow-[#36D9F5]/20 text-center hover:scale-105 transition-transform"
              >
                <span className="text-xs font-black text-white">Backend</span>
                <p className="text-[9px] text-[#36D9F5] font-semibold">Lv. 6–10</p>
              </button>
              <div className="w-0.5 h-4 bg-[#36D9F5]" />
            </div>
          </div>
        </div>

        {/* Tier 3: Full Stack & AI/ML */}
        <div className="w-full flex justify-around">
          <button
            onClick={() => onSelectNode?.(skills[3] || { id: 'node_fullstack', name: 'Full Stack', level_range: 'Lv. 11–15', category: 'advanced', status: 'unlocked', prerequisites: ['node_react', 'node_backend'] })}
            className="px-3.5 py-1.5 rounded-xl bg-[#071329] border border-[#7047F5] shadow-md shadow-[#7047F5]/20 text-center hover:scale-105 transition-transform"
          >
            <span className="text-xs font-black text-white">Full Stack</span>
            <p className="text-[9px] text-[#A34EFF] font-semibold">Lv. 11–15</p>
          </button>

          <button
            onClick={() => onSelectNode?.(skills[4] || { id: 'node_aiml', name: 'AI/ML', level_range: 'Lv. 11–15', category: 'advanced', status: 'locked', prerequisites: ['node_backend'] })}
            className="px-3.5 py-1.5 rounded-xl bg-[#071329] border border-[#7047F5]/50 shadow-md shadow-[#7047F5]/10 text-center hover:scale-105 transition-transform"
          >
            <span className="text-xs font-black text-slate-300">AI/ML</span>
            <p className="text-[9px] text-[#A34EFF] font-semibold">Lv. 11–15</p>
          </button>
        </div>
      </div>
    </div>
  );
};
