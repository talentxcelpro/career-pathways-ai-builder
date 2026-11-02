import React, { useState } from 'react';
import { X, GitBranch, CheckCircle2, Lock, Shield, Award, Zap } from 'lucide-react';
import { CareerSkillNode, careerSkillTreeService } from '@/services/careerverse/careerSkillTreeService';
import { toast } from 'sonner';

interface FullSkillTreeModalProps {
  skills: CareerSkillNode[];
  userId: string;
  onClose: () => void;
  onSkillUpdated: () => void;
}

export const FullSkillTreeModal: React.FC<FullSkillTreeModalProps> = ({
  skills,
  userId,
  onClose,
  onSkillUpdated,
}) => {
  const [selectedNode, setSelectedNode] = useState<CareerSkillNode>(skills[0] || {
    id: 'node_frontend',
    name: 'Frontend',
    level_range: 'Lv. 1–5',
    category: 'core',
    status: 'mastered',
    prerequisites: [],
    description: 'HTML5, CSS3, DOM APIs, Responsive Design and Web Core Vitals.',
    verification_status: 'verified',
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await careerSkillTreeService.verifySkill(userId, selectedNode.id);
      if (res.success) {
        toast.success(`Skill Node Mastered! Awarded +${res.xp_awarded} XP!`);
        onSkillUpdated();
      } else {
        toast.error('Skill verification could not be completed.');
      }
    } catch (err) {
      toast.error('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#101E3B] border border-[#7047F5]/40 shadow-2xl p-6 text-white space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7047F5]/20 flex items-center justify-center text-[#36D9F5]">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Career Skill Tree — Full Technology Constellation</h3>
              <p className="text-xs text-slate-400">Master progressive technical prerequisites to unlock high-tier job challenges.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Skill Tree Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node List */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Skill Nodes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isMastered = node.status === 'mastered';
                const isLocked = node.status === 'locked';

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#071329] border-[#36D9F5] shadow-[0_0_15px_rgba(54,217,245,0.3)]'
                        : isMastered
                        ? 'bg-[#071329]/60 border-[#20D994]/40 hover:border-[#20D994]'
                        : isLocked
                        ? 'bg-[#071329]/30 border-white/5 opacity-60'
                        : 'bg-[#071329]/60 border-white/10 hover:border-[#7047F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">{node.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMastered
                            ? 'bg-[#20D994]/20 text-[#20D994]'
                            : isLocked
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-[#36D9F5]/20 text-[#36D9F5]'
                        }`}
                      >
                        {node.level_range}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="capitalize">{node.category}</span>
                      {isMastered ? (
                        <span className="flex items-center gap-1 text-[#20D994] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mastered</span>
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center gap-1 text-slate-500 font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#36D9F5] font-bold">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Detail Inspector */}
          <div className="bg-[#071329] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#36D9F5] uppercase tracking-wider">Node Details</span>
                <span className="text-xs font-bold text-slate-400">{selectedNode.level_range}</span>
              </div>

              <h4 className="text-lg font-black text-white">{selectedNode.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.description || 'Master core foundational capabilities and advance to specialized domain nodes.'}
              </p>

              {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-bold text-slate-400">Prerequisites Required:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.prerequisites.map((req) => (
                      <span key={req} className="text-[10px] bg-[#101E3B] px-2 py-0.5 rounded text-[#A34EFF] border border-[#7047F5]/30">
                        {req.replace('node_', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-[#20D994]" />
                <span>Recruiter Certified Competence</span>
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || selectedNode.status === 'locked'}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#20D994] to-[#00E676] hover:from-[#00E676] hover:to-[#20D994] text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(32,217,148,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <Award className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying...' : 'Take Skill Assessment (+120 XP)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
