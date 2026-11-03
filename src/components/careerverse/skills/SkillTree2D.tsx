import React, { useState } from 'react';
import { GitBranch, CheckCircle2, Lock, Zap, Award, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CareerSkillNode } from '@/services/careerverse/careerSkillTreeService';

interface SkillTree2DProps {
  skills: CareerSkillNode[];
  onSelectNode: (node: CareerSkillNode) => void;
  onLaunchAssessment: (node: CareerSkillNode) => void;
}

export const SkillTree2D: React.FC<SkillTree2DProps> = ({
  skills,
  onSelectNode,
  onLaunchAssessment,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(skills[0]?.id || 'node_frontend');

  const nodes = skills.length > 0 ? skills : [
    { id: 'node_frontend', name: 'HTML & Modern CSS', level_range: 'Lv. 1–5', category: 'core', status: 'mastered', prerequisites: [], description: 'Foundations of web presentation, semantics, flexbox, grid, and layout architecture.', verification_status: 'verified' as const },
    { id: 'node_js', name: 'JavaScript ES2024', level_range: 'Lv. 6–10', category: 'core', status: 'mastered', prerequisites: ['node_frontend'], description: 'Asynchronous event loop, closures, prototypes, promises, and high-performance DOM mutations.', verification_status: 'verified' as const },
    { id: 'node_react', name: 'React 19 & Hooks', level_range: 'Lv. 6–10', category: 'specialization', status: 'active', prerequisites: ['node_js'], description: 'Server components, concurrent mode, custom hooks, and state machine architecture.', verification_status: 'in_progress' as const },
    { id: 'node_backend', name: 'Node.js & Express', level_range: 'Lv. 6–10', category: 'specialization', status: 'unlocked', prerequisites: ['node_js'], description: 'RESTful API routing, middleware chaining, JWT auth, and microservice communication.', verification_status: 'unverified' as const },
    { id: 'node_db', name: 'PostgreSQL & RLS', level_range: 'Lv. 11–15', category: 'advanced', status: 'unlocked', prerequisites: ['node_backend'], description: 'Relational schemas, B-tree indexes, Row Level Security, and query optimization.', verification_status: 'unverified' as const },
    { id: 'node_fullstack', name: 'Full Stack Architecture', level_range: 'Lv. 11–15', category: 'advanced', status: 'locked', prerequisites: ['node_react', 'node_db'], description: 'End-to-end cloud platforms, SSR hydration, CDN caching, and high-availability deployment.', verification_status: 'unverified' as const },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF] border border-[#7047F5]/30">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">Interactive Skill Tree 2.0</h3>
            <p className="text-xs text-slate-400">Unlock advanced engineering abilities through verified assessments</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#071329] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-cyan-400 px-1">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map & Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Node Network Map (Span 8) */}
        <div className="lg:col-span-8 bg-[#071329] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[340px]">
          {/* Ambient Grid Lines */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #7047F5 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div
            className="relative z-10 space-y-6 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            {/* Tier 1: Core Foundation */}
            <div className="flex justify-center">
              <button
                onClick={() => setSelectedNodeId(nodes[0].id)}
                className={`group px-6 py-3 rounded-2xl border-2 text-center transition-all ${
                  selectedNodeId === nodes[0].id
                    ? 'bg-[#101E3B] border-[#20D994] shadow-[0_0_20px_rgba(32,217,148,0.4)] scale-105'
                    : 'bg-[#0B1730] border-[#20D994]/50 hover:border-[#20D994]'
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#20D994]" />
                  <span className="text-xs font-black text-white">{nodes[0].name}</span>
                </div>
                <span className="text-[10px] text-[#20D994] font-semibold">{nodes[0].level_range} • Mastered</span>
              </button>
            </div>

            {/* Connecting Arc 1 */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-[#20D994] to-[#36D9F5] mx-auto" />

            {/* Tier 2: Specializations */}
            <div className="flex justify-around items-center gap-4">
              {nodes.slice(1, 3).map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isMastered = node.status === 'mastered';
                const isActive = node.status === 'active';

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`px-5 py-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#101E3B] border-[#36D9F5] shadow-[0_0_20px_rgba(54,217,245,0.4)] scale-105'
                        : isMastered
                        ? 'bg-[#0B1730] border-[#20D994]/50'
                        : 'bg-[#0B1730] border-[#36D9F5]/40 hover:border-[#36D9F5]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      {isMastered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#20D994]" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-[#36D9F5]" />
                      )}
                      <span className="text-xs font-black text-white">{node.name}</span>
                    </div>
                    <span className="text-[10px] text-[#36D9F5] font-semibold">{node.level_range}</span>
                  </button>
                );
              })}
            </div>

            {/* Connecting Arc 2 */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-[#36D9F5] to-[#7047F5] mx-auto" />

            {/* Tier 3: Advanced */}
            <div className="flex justify-around items-center gap-4">
              {nodes.slice(3, 5).map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isLocked = node.status === 'locked';

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`px-4 py-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#101E3B] border-[#7047F5] shadow-[0_0_20px_rgba(112,71,245,0.4)] scale-105'
                        : isLocked
                        ? 'bg-[#071329]/60 border-white/5 opacity-50'
                        : 'bg-[#0B1730] border-[#7047F5]/40 hover:border-[#7047F5]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-500" />
                      ) : (
                        <Award className="w-3.5 h-3.5 text-[#A34EFF]" />
                      )}
                      <span className="text-xs font-bold text-white">{node.name}</span>
                    </div>
                    <span className="text-[10px] text-[#A34EFF] font-semibold">{node.level_range}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Drawer (Span 4) */}
        <div className="lg:col-span-4 bg-[#0B1730] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#36D9F5]">
                Node Inspector
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7047F5]/20 text-[#A34EFF] border border-[#7047F5]/30">
                {selectedNode.level_range}
              </span>
            </div>

            <h4 className="text-base font-black text-white">{selectedNode.name}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Prerequisites Required:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.prerequisites.map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-[#071329] border border-white/10 text-slate-300">
                      {p.replace('node_', '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onLaunchAssessment(selectedNode)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7047F5] via-[#A34EFF] to-[#36D9F5] hover:from-[#36D9F5] hover:to-[#7047F5] text-white font-black text-xs shadow-[0_0_15px_rgba(112,71,245,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Skill Assessment (+120 XP)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
