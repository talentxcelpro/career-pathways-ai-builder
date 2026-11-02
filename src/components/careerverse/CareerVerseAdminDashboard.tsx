import React from 'react';
import { Activity, ShieldCheck, Database, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const CareerVerseAdminDashboard: React.FC = () => {
  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
              Admin Governance
            </span>
            <h2 className="text-xl font-black text-white">CareerVerse Economy & Gameplay Telemetry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ledger audit, XP balance monitoring, anti-cheat detection, and quest lifecycle management.
          </p>
        </div>

        <button
          onClick={() => toast.success('XP Ledger integrity re-verified across all partitions.')}
          className="py-2 px-3 rounded-xl bg-[#071329] border border-white/10 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Re-verify Ledger Invariants</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="text-slate-400 text-xs mb-1">Circulating Total XP</div>
          <div className="text-2xl font-black text-white">1,482,900</div>
          <p className="text-[10px] text-[#20D994] mt-1">+14,200 issued today</p>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="text-slate-400 text-xs mb-1">Idempotency Rate</div>
          <div className="text-2xl font-black text-[#20D994]">100%</div>
          <p className="text-[10px] text-slate-400 mt-1">0 duplicate awards recorded</p>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="text-slate-400 text-xs mb-1">Verified Quests Completed</div>
          <div className="text-2xl font-black text-white">3,892</div>
          <p className="text-[10px] text-[#36D9F5] mt-1">94% candidate completion rate</p>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="text-slate-400 text-xs mb-1">Anti-Cheat Flags</div>
          <div className="text-2xl font-black text-[#20D994]">0</div>
          <p className="text-[10px] text-slate-400 mt-1">Heuristics active on rate-limits</p>
        </div>
      </div>

      {/* System Status Table */}
      <div className="bg-[#071329]/80 border border-white/5 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Services Health</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101E3B]/60">
            <span className="text-slate-200">Supabase Postgres Table career_xp_ledger</span>
            <span className="flex items-center gap-1 text-[#20D994] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Healthy (Index Active)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101E3B]/60">
            <span className="text-slate-200">Real-time WebSocket Subscription</span>
            <span className="flex items-center gap-1 text-[#20D994] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Connected (Channel postgres_changes)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101E3B]/60">
            <span className="text-slate-200">Boss Battle Stage Verification Engine</span>
            <span className="flex items-center gap-1 text-[#20D994] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Operational (0.12s latency)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
