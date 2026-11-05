import React, { useState } from 'react';
import { Swords, Shield, Zap, Heart, Award, Star, CheckCircle2, AlertTriangle, ArrowRight, Skull } from 'lucide-react';
import { CareerBossBattle, CareerBossBattleService } from '@/services/careerverse/careerBossBattleService';
import { CareerDomainId, CAREER_DOMAINS, CombatActionDefinition } from '@/services/careerverse/careerDomainCatalog';
import { gameAudio } from '@/utils/gameAudio';
import { toast } from 'sonner';

interface PlayableBossBattleArenaProps {
  battle: CareerBossBattle;
  userId: string;
  domainId?: CareerDomainId;
  onClose: () => void;
  onVictory: () => void;
}

export const PlayableBossBattleArena: React.FC<PlayableBossBattleArenaProps> = ({
  battle,
  userId,
  domainId = 'technology',
  onClose,
  onVictory,
}) => {
  const domainConfig = CAREER_DOMAINS[domainId] || CAREER_DOMAINS.technology;
  const combatActions = domainConfig.boss.combatActions;

  const [bossMaxHp] = useState(10000);
  const [bossHp, setBossHp] = useState(10000);
  const [playerEnergy, setPlayerEnergy] = useState(100);
  const [activeAction, setActiveAction] = useState<CombatActionDefinition | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([
    `[Arena Broadcast] Challenger entered the arena. Target: ${battle.title} (${battle.company_name}).`,
    `[Arena Broadcast] Boss HP initialized at 10,000. Select an industry combat action from the left to strike!`,
  ]);
  const [isVictory, setIsVictory] = useState(false);

  const handleSelectAction = (action: CombatActionDefinition) => {
    if (bossHp <= 0) return;
    gameAudio.playClick();
    setActiveAction(action);
    setSelectedOption(null);
  };

  const handleExecuteMove = async () => {
    if (!activeAction || selectedOption === null || isEvaluating) return;

    setIsEvaluating(true);
    const isCorrect = selectedOption === activeAction.correctIndex;

    setTimeout(async () => {
      if (isCorrect) {
        gameAudio.playLevelUp();
        const newHp = Math.max(0, bossHp - activeAction.damage);
        setBossHp(newHp);
        setCombatLog((prev) => [
          ...prev,
          `💥 CRITICAL HIT! You executed "${activeAction.name}" correctly! Dealt ${activeAction.damage.toLocaleString()} DMG!`,
          `[Boss Status] Boss HP decreased to ${newHp.toLocaleString()} / ${bossMaxHp.toLocaleString()}`,
        ]);
        toast.success(`Strike landed! Dealt ${activeAction.damage.toLocaleString()} damage!`);

        if (newHp === 0) {
          setIsVictory(true);
          setCombatLog((prev) => [
            ...prev,
            `👑 VICTORY! Boss eliminated! Interview Fast-Track and Verified Skill Badge Unlocked!`,
          ]);
          await CareerBossBattleService.advanceBattleStage(userId, battle.id, 4);
          onVictory();
        }
      } else {
        gameAudio.playIncorrect();
        toast.error('Move failed! Incorrect choice. Boss retaliated!');
        setCombatLog((prev) => [
          ...prev,
          `⚠️ Move failed! The boss deflected your strike. Review the problem statement and try another move.`,
        ]);
      }

      setIsEvaluating(false);
      setActiveAction(null);
    }, 700);
  };

  const bossHpPercent = Math.round((bossHp / bossMaxHp) * 100);

  // Dynamic header based on chosen domain
  const domainMoveCategory = {
    student_early_career: 'Campus Placement & Reasoning Moves',
    business_operations: 'Operations & Strategic Leadership Moves',
    marketing_growth: 'Growth & Acquisition Marketing Moves',
    finance_accounting: 'Valuation & Liquidity Analysis Moves',
    human_resources: 'Talent Acquisition & Culture Moves',
    technology: 'Engineering & Systems Combat Moves',
  }[domainId] || 'Industry Combat Moves';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] rounded-3xl bg-[#071329] border border-rose-500/40 shadow-[0_0_60px_rgba(244,63,94,0.3)] flex flex-col overflow-hidden text-white">
        {/* Top Arena Header */}
        <div className="bg-[#101E3B] px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <div className="w-full h-full bg-[#071329] rounded-[10px] flex items-center justify-center text-rose-400">
                <Swords className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-xl text-white">{battle.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black animate-pulse">
                  BOSS ARENA LIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">{battle.company_name} • {domainConfig.label}</p>
            </div>
          </div>

          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#071329] hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Boss Creature Banner & Health Meter */}
        <div className="relative bg-gradient-to-r from-rose-950/60 via-[#101E3B] to-purple-950/60 p-5 sm:p-6 border-b border-white/10 shrink-0">
          {/* Ambient red boss glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
            {/* Cyber Boss Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-1 shadow-[0_0_25px_rgba(244,63,94,0.5)] shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#071329] rounded-[14px] flex items-center justify-center text-rose-400">
                  <Skull className="w-9 h-9 sm:w-10 sm:h-10 animate-pulse text-rose-500" />
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                  {domainConfig.shortLabel} Employer Challenge
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-white">{battle.company_name}</h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 mt-1">
                  <span>Defeat challenge to unlock:</span>
                  <span className="text-[#FFCA55] font-bold">+{battle.xp_reward || 500} XP</span>
                  <span>•</span>
                  <span className="text-[#20D994] font-bold">Interview Fast-Track</span>
                </div>
              </div>
            </div>

            {/* Boss HP Gauge */}
            <div className="w-full sm:w-80 space-y-2 bg-[#071329]/90 p-4 rounded-2xl border border-rose-500/30 shadow-lg">
              <div className="flex justify-between items-center text-xs sm:text-sm font-black">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>BOSS HP</span>
                </span>
                <span className="font-mono text-white">
                  {bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()} ({bossHpPercent}%)
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-900 overflow-hidden border border-rose-500/30 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Combat Field */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Combat Moves Selector */}
          <div className="w-full md:w-80 lg:w-96 bg-[#0B1730] border-r border-white/10 p-5 space-y-3 overflow-y-auto shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              {domainMoveCategory}
            </span>

            {!isVictory ? (
              <div className="space-y-2.5">
                {combatActions.map((action) => {
                  const isSelected = activeAction?.id === action.id;

                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelectAction(action)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          : 'bg-[#071329]/80 border-white/10 hover:border-white/20 hover:bg-[#071329]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-black text-white">{action.name}</span>
                        <span className="text-xs font-bold text-rose-400">-{action.damage} DMG</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{action.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-5 rounded-2xl text-center space-y-2.5">
                <Award className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-black text-lg text-white">Boss Defeated!</h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Congratulations! You conquered the challenge. Your profile is fast-tracked for employer review.
                </p>
                <button
                  onClick={() => {
                    gameAudio.playClick();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#20D994] hover:bg-[#1cb57b] text-slate-950 font-black text-xs sm:text-sm rounded-xl mt-2 cursor-pointer shadow-lg"
                >
                  Claim Victory Loot
                </button>
              </div>
            )}

            {/* Combat Log Drawer */}
            <div className="pt-3 border-t border-white/10 space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Live Battle Log</span>
              <div className="bg-[#050D1C] p-3 rounded-xl border border-white/5 space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs text-slate-300">
                {combatLog.map((log, i) => (
                  <div key={i} className="leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Task Resolver */}
          <div className="flex-1 bg-[#050D1C] p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
            {activeAction ? (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-[#071329] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                      Problem Solving Challenge
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#FFCA55]">Deals {activeAction.damage} Damage</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {activeAction.taskPrompt}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {activeAction.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        gameAudio.playClick();
                        setSelectedOption(idx);
                      }}
                      className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedOption === idx
                          ? 'bg-rose-950/80 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : 'bg-[#101E3B]/70 border-white/10 text-slate-200 hover:border-white/20 hover:bg-[#101E3B]'
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExecuteMove}
                    disabled={selectedOption === null || isEvaluating}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-amber-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isEvaluating ? 'Evaluating Strike...' : 'Execute Move'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !isVictory ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Swords className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
                <h4 className="text-base sm:text-lg font-bold text-white">Awaiting Move Selection</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
                  Choose a strategy or diagnostic move from the left panel to execute an attack against the employer boss.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
