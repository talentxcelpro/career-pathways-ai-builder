import React, { useState, useEffect } from 'react';
import { X, GitBranch, Lock, CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CareerSkillPath,
  CareerTreeSkill,
  CareerSkillTreeService
} from '@/services/careerverse/careerSkillTreeService';
import { toast } from 'sonner';

interface SkillTreeModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSkillMastered: () => void;
}

export const FullSkillTreeModal: React.FC<SkillTreeModalProps> = ({
  isOpen,
  userId,
  onClose,
  onSkillMastered
}) => {
  const [paths, setPaths] = useState<CareerSkillPath[]>([]);
  const [activePathId, setActivePathId] = useState<string>('technology');
  const [skills, setSkills] = useState<CareerTreeSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<CareerTreeSkill | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        const pList = await CareerSkillTreeService.getPaths();
        setPaths(pList);
        const sList = await CareerSkillTreeService.getSkillsForPath(activePathId, userId);
        setSkills(sList);
        setSelectedSkill(sList[0] || null);
      } catch (err) {
        console.error('Failed to load skill tree:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, activePathId, userId]);

  if (!isOpen) return null;

  const handleMaster = async (skill: CareerTreeSkill) => {
    if (userId === 'guest') {
      toast.error('Please log in to master skills and save progress.');
      return;
    }

    try {
      setActionLoading(true);
      await CareerSkillTreeService.unlockOrMasterSkill(userId, skill);
      toast.success(`⭐ Mastered ${skill.title}! +${skill.xp_reward} XP awarded.`);
      onSkillMastered();
      const updated = await CareerSkillTreeService.getSkillsForPath(activePathId, userId);
      setSkills(updated);
      setSelectedSkill(updated.find(s => s.id === skill.id) || null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update skill');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#101E3B] border border-[#7047F5]/30 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7047F5]/20 flex items-center justify-center text-[#A34EFF]">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Full Career Skill Tree</h3>
              <p className="text-xs text-slate-400">Unlock competencies and earn verified certifications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Path Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {paths.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePathId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activePathId === p.id
                  ? 'bg-gradient-to-r from-[#7047F5] to-[#278DFF] text-white shadow-lg'
                  : 'bg-[#071329] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Content Area: Grid of Nodes + Detail Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1">
          {/* Skill Nodes Grid */}
          <div className="md:col-span-7 grid grid-cols-2 gap-3 auto-rows-max">
            {loading ? (
              <div className="col-span-2 flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#36D9F5] animate-spin" />
              </div>
            ) : (
              skills.map((skill) => {
                const isSelected = selectedSkill?.id === skill.id;
                const isMastered = skill.user_status === 'mastered';
                const isLocked = skill.user_status === 'locked';

                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#36D9F5] bg-[#0C1B3E] shadow-lg shadow-[#36D9F5]/20'
                        : isMastered
                        ? 'border-[#20D994]/50 bg-[#071329]'
                        : isLocked
                        ? 'border-white/5 bg-[#071329]/50 opacity-60'
                        : 'border-white/10 bg-[#071329] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                        {skill.level_range}
                      </span>
                      {isMastered ? (
                        <CheckCircle2 className="w-4 h-4 text-[#20D994]" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Zap className="w-4 h-4 text-[#FFCA55]" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{skill.title}</h4>
                    <span className="text-[10px] text-[#20D994] font-semibold">+{skill.xp_reward} XP</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Node Inspector Panel */}
          <div className="md:col-span-5 bg-[#071329] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
            {selectedSkill ? (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#36D9F5] uppercase tracking-wider">
                    {selectedSkill.level_range} Skill Node
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">{selectedSkill.title}</h4>
                </div>

                <div className="p-3 rounded-lg bg-[#101E3B] border border-white/5 flex flex-col gap-1 text-xs">
                  <span className="text-slate-400">Prerequisite</span>
                  <span className="font-bold text-white">
                    {selectedSkill.prerequisite_id ? selectedSkill.prerequisite_id : 'None (Core Entry Node)'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#101E3B] border border-white/5 flex flex-col gap-1 text-xs">
                  <span className="text-slate-400">Mastery Reward</span>
                  <span className="font-bold text-[#20D994]">+{selectedSkill.xp_reward} XP & 25 Coins</span>
                </div>

                {selectedSkill.user_status === 'mastered' ? (
                  <div className="p-3 rounded-xl bg-[#20D994]/20 border border-[#20D994]/40 text-[#20D994] text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skill Mastered & Verified</span>
                  </div>
                ) : selectedSkill.user_status === 'locked' ? (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs text-center flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Complete prerequisite node first</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleMaster(selectedSkill)}
                    disabled={actionLoading}
                    className="w-full bg-[#20D994] hover:bg-[#1bb87d] text-slate-950 font-black text-xs h-10 rounded-xl"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pass Assessment & Master Node'}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">Select a node to inspect competencies</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
