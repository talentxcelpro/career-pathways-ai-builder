import React, { useState } from 'react';
import { Plus, Users, Award, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface RecruiterBossBattleDashboardProps {
  onClose?: () => void;
}

export const RecruiterBossBattleDashboard: React.FC<RecruiterBossBattleDashboardProps> = ({
  onClose,
}) => {
  const [candidateSubmissions, setCandidateSubmissions] = useState([
    {
      id: 'sub_1',
      candidate_name: 'Priya Sharma',
      stage_reached: 4,
      score: 98,
      status: 'Ready for Interview',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'sub_2',
      candidate_name: 'Arjun Verma',
      stage_reached: 3,
      score: 94,
      status: 'Tech Interview Pending',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'sub_3',
      candidate_name: 'Rohan Mehta',
      stage_reached: 2,
      score: 88,
      status: 'In Evaluation',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
  ]);

  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#278DFF]/20 text-[#278DFF] text-xs font-bold border border-[#278DFF]/30">
              Recruiter Mode
            </span>
            <h2 className="text-xl font-black text-white">Employer Challenge & Boss Battle Control</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish verified technical quests, review live IDE execution telemetry, and fast-track top engineering talent.
          </p>
        </div>

        <button
          onClick={() => toast.success('Challenge creation wizard initialized.')}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#278DFF] to-[#36D9F5] hover:from-[#36D9F5] hover:to-[#278DFF] text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(39,141,255,0.4)] flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Boss Challenge</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users className="w-4 h-4 text-[#36D9F5]" />
            <span>Active Contestants</span>
          </div>
          <div className="text-2xl font-black text-white">142</div>
          <p className="text-[10px] text-[#20D994] mt-1">+18 joined this week</p>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Award className="w-4 h-4 text-[#FFCA55]" />
            <span>Completed Submissions</span>
          </div>
          <div className="text-2xl font-black text-white">28</div>
          <p className="text-[10px] text-slate-400 mt-1">Passing score: 85%+</p>
        </div>

        <div className="bg-[#071329] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Shield className="w-4 h-4 text-[#20D994]" />
            <span>Fast-Track Interviews Scheduled</span>
          </div>
          <div className="text-2xl font-black text-white">9</div>
          <p className="text-[10px] text-[#36D9F5] mt-1">Average candidate time-to-hire: 4 days</p>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Top Evaluated Candidates</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#071329] text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Candidate</th>
                <th className="py-3 px-4">Stage Reached</th>
                <th className="py-3 px-4">Algorithmic Score</th>
                <th className="py-3 px-4">Hiring Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidateSubmissions.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={c.avatar} alt={c.candidate_name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-white">{c.candidate_name}</div>
                      <div className="text-[10px] text-slate-500">Career Passport Verified</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">Stage {c.stage_reached} / 4</td>
                  <td className="py-3 px-4 font-black text-[#20D994]">{c.score}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#20D994]/20 text-[#20D994] text-[10px] font-bold">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toast.success(`Interview invitation dispatched to ${c.candidate_name}!`)}
                      className="px-3 py-1 rounded-lg bg-[#7047F5] hover:bg-[#7047F5]/80 text-white font-bold text-[11px] transition-all"
                    >
                      Fast-Track Interview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
