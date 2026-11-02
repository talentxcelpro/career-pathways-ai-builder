import React, { useState } from 'react';
import { Swords, Shield, Zap, Heart, Award, Star, CheckCircle2, AlertTriangle, ArrowRight, Skull } from 'lucide-react';
import { CareerBossBattle, CareerBossBattleService } from '@/services/careerverse/careerBossBattleService';
import { toast } from 'sonner';

interface PlayableBossBattleArenaProps {
  battle: CareerBossBattle;
  userId: string;
  onClose: () => void;
  onVictory: () => void;
}

interface CombatAction {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'ultimate';
  damage: number;
  description: string;
  taskPrompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const PlayableBossBattleArena: React.FC<PlayableBossBattleArenaProps> = ({
  battle,
  userId,
  onClose,
  onVictory,
}) => {
  const [bossMaxHp] = useState(10000);
  const [bossHp, setBossHp] = useState(10000);
  const [playerEnergy, setPlayerEnergy] = useState(100);
  const [activeAction, setActiveAction] = useState<CombatAction | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([
    `[Arena Broadcast] Challenger entered the arena. Target: ${battle.title} (${battle.company_name}).`,
    `[Arena Broadcast] Boss HP initialized at 10,000. Select an engineering combat action to strike!`,
  ]);
  const [isVictory, setIsVictory] = useState(false);

  const combatActions: CombatAction[] = [
    {
      id: 'action_optimize',
      name: 'Algorithmic Optimization Strike',
      type: 'attack',
      damage: 3500,
      description: 'Refactor an O(N^2) nested loop into an O(N) hash map lookup.',
      taskPrompt: 'A backend service executes nested lookups across 50,000 records. Which data structure optimizes lookup to O(1) average time?',
      options: ['Linked List', 'Hash Map (Key-Value Index)', 'Unsorted Array', 'Binary Search Tree'],
      correctIndex: 1,
      explanation: 'A Hash Map provides O(1) average time key lookups, dropping loop complexity from O(N^2) to linear O(N).',
    },
    {
      id: 'action_harden',
      name: 'Security Shield & Defend',
      type: 'defense',
      damage: 2500,
      description: 'Defend against an unauthorized data injection attack by implementing strict RLS.',
      taskPrompt: 'In Supabase PostgreSQL, which security primitive enforces tenant isolation at the database layer rather than the application layer?',
      options: ['Client-side if() checks', 'Row Level Security (RLS) Policies', 'CORS origin headers', 'JWT token expiration'],
      correctIndex: 1,
      explanation: 'Row Level Security (RLS) ensures that even if application logic is breached, PostgreSQL rejects unauthorized row reads at the query engine level.',
    },
    {
      id: 'action_ultimate',
      name: 'Distributed Architectural Surge (Ultimate)',
      type: 'ultimate',
      damage: 4500,
      description: 'Deploy idempotency-protected event sourcing with Redis distributed locks.',
      taskPrompt: 'To prevent duplicate payments and race conditions under peak traffic, what must every transactional event carry?',
      options: ['Random Math.random() seed', 'Unique Idempotency Key', 'Client screen resolution', 'Browser user-agent'],
      correctIndex: 1,
      explanation: 'An Idempotency Key guarantees that duplicate or retried requests produce the identical result without re-executing credit mutations.',
    },
  ];

  const handleSelectAction = (action: CombatAction) => {
    if (bossHp <= 0) return;
    setActiveAction(action);
    setSelectedOption(null);
  };

  const handleExecuteMove = async () => {
    if (!activeAction || selectedOption === null || isEvaluating) return;

    setIsEvaluating(true);
    const isCorrect = selectedOption === activeAction.correctIndex;

    setTimeout(async () => {
      if (isCorrect) {
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
        toast.error('Move failed! Incorrect engineering choice. Boss retaliated!');
        setCombatLog((prev) => [
          ...prev,
          `⚠️ Move failed! The boss deflected your strike. Review the technical requirements and try another attack.`,
        ]);
      }

      setIsEvaluating(false);
      setActiveAction(null);
      setSelectedOption(null);
    }, 700);
  };

  const bossHpPercent = Math.round((bossHp / bossMaxHp) * 100);

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
                <h3 className="font-black text-base sm:text-lg text-white">{battle.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black animate-pulse">
                  BOSS ARENA LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">{battle.company_name} Employer Challenge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#071329] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Boss Creature Banner & Health Meter */}
        <div className="relative bg-gradient-to-r from-rose-950/60 via-[#101E3B] to-purple-950/60 p-6 border-b border-white/10 shrink-0">
          {/* Ambient red boss glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
            {/* Cyber Boss Identity */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-1 shadow-[0_0_25px_rgba(244,63,94,0.5)] shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#071329] rounded-[14px] flex items-center justify-center text-rose-400">
                  <Skull className="w-10 h-10 animate-pulse text-rose-500" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                  Megacorp Boss Challenge
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">{battle.company_name} Megastructure</h2>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                  <span>Defeat challenge to unlock:</span>
                  <span className="text-[#FFCA55] font-bold">+500 XP</span>
                  <span>•</span>
                  <span className="text-[#20D994] font-bold">Fast-Track Interview</span>
                </div>
              </div>
            </div>

            {/* Boss HP Gauge */}
            <div className="w-full sm:w-80 space-y-1.5 bg-[#071329]/90 p-4 rounded-2xl border border-rose-500/30 shadow-lg">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-rose-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
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
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Engineering Combat Moves
            </span>

            {!isVictory ? (
              <div className="space-y-2.5">
                {combatActions.map((action) => {
                  const isSelected = activeAction?.id === action.id;

                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelectAction(action)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          : 'bg-[#071329]/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-white">{action.name}</span>
                        <span className="text-[10px] font-bold text-rose-400">-{action.damage} DMG</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{action.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2">
                <Award className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-black text-white">Boss Defeated!</h4>
                <p className="text-xs text-slate-300">
                  Congratulations! You conquered the challenge. Your profile is fast-tracked for employer review.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-[#20D994] text-slate-950 font-black text-xs rounded-xl mt-2"
                >
                  Claim Victory Loot
                </button>
              </div>
            )}

            {/* Combat Log Drawer */}
            <div className="pt-3 border-t border-white/10 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Battle Log</span>
              <div className="bg-[#050D1C] p-3 rounded-xl border border-white/5 space-y-1 max-h-36 overflow-y-auto font-mono text-[10px] text-slate-400">
                {combatLog.map((log, i) => (
                  <div key={i} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Task Resolver */}
          <div className="flex-1 bg-[#050D1C] p-6 flex flex-col justify-between overflow-y-auto">
            {activeAction ? (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-[#071329] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                      Combat Execution Puzzle
                    </span>
                    <span className="text-xs font-bold text-[#FFCA55]">Deals {activeAction.damage} Damage</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {activeAction.taskPrompt}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {activeAction.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedOption === idx
                          ? 'bg-rose-950/80 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : 'bg-[#101E3B]/70 border-white/10 text-slate-300 hover:border-white/20'
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
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-amber-500 hover:to-rose-600 text-white font-black text-xs shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    <span>{isEvaluating ? 'Evaluating Strike...' : 'Execute Combat Move'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : !isVictory ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Swords className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h4 className="text-base font-bold text-slate-300">Awaiting Move Selection</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Choose an engineering attack or architectural defense move from the left panel to strike the employer boss.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
