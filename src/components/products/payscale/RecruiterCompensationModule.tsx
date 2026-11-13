// src/components/products/payscale/RecruiterCompensationModule.tsx
// Module 9: Recruiter Compensation Intelligence (Offer Competitiveness Scoring, Hiring Budgets & Acceptance Probability)

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  FileCheck,
  Send,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const RecruiterCompensationModule: React.FC = () => {
  const [candidateCurrentCtc, setCandidateCurrentCtc] = useState<number>(14);
  const [candidateExperienceYoe, setCandidateExperienceYoe] = useState<number>(5);
  const [plannedOfferCtc, setPlannedOfferCtc] = useState<number>(19.5);
  const [targetRole, setTargetRole] = useState<string>('Senior Backend Engineer (Go/Distributed Systems)');
  const [joiningBonus, setJoiningBonus] = useState<number>(150000);
  const [hasCompetingOffers, setHasCompetingOffers] = useState<boolean>(true);

  // Acceptance Probability Scoring Model (0 to 100%)
  const hikePercentage = Math.round(((plannedOfferCtc - candidateCurrentCtc) / candidateCurrentCtc) * 100);

  const competitiveness = useMemo(() => {
    let score = 50;

    // Hike score contribution
    if (hikePercentage >= 40) score += 30;
    else if (hikePercentage >= 30) score += 20;
    else if (hikePercentage >= 20) score += 5;
    else score -= 25;

    // Joining bonus boost
    if (joiningBonus >= 200000) score += 15;
    else if (joiningBonus > 0) score += 10;

    // Competing offer penalty
    if (hasCompetingOffers) score -= 15;

    score = Math.max(10, Math.min(98, score));

    let verdict = 'Moderate Acceptance Likelihood';
    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-300';

    if (score >= 80) {
      verdict = 'High Acceptance Likelihood (Top Competitive)';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    } else if (score < 50) {
      verdict = 'High Rejection Risk (Under Competitive)';
      badgeColor = 'bg-red-50 text-red-700 border-red-300';
    }

    return { score, verdict, badgeColor };
  }, [hikePercentage, joiningBonus, hasCompetingOffers]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-blue-300" />
            <span>Recruiter Intelligence & Offer Scoring Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Predict Candidate Acceptance Probability & Optimize Hiring Budgets
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminate candidate drop-offs at the offer rollout stage. Calibrate competitive base-to-bonus ratios based on real-time candidate market expectations.
          </p>
        </div>
      </div>

      {/* Candidate Offer Parameters Input */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Candidate Current CTC (LPA)
          </label>
          <Input
            type="number"
            value={candidateCurrentCtc}
            onChange={(e) => setCandidateCurrentCtc(parseFloat(e.target.value) || 0)}
            className="h-10 text-sm font-bold rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Planned Offer CTC (LPA)
          </label>
          <Input
            type="number"
            value={plannedOfferCtc}
            onChange={(e) => setPlannedOfferCtc(parseFloat(e.target.value) || 0)}
            className="h-10 text-sm font-bold rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Sign-On / Joining Bonus (₹)
          </label>
          <Input
            type="number"
            step={25000}
            value={joiningBonus}
            onChange={(e) => setJoiningBonus(parseInt(e.target.value) || 0)}
            className="h-10 text-sm font-bold rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Competing Offers?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHasCompetingOffers(true)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                hasCompetingOffers
                  ? 'bg-amber-50 border-amber-400 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              Yes (Active)
            </button>
            <button
              type="button"
              onClick={() => setHasCompetingOffers(false)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                !hasCompetingOffers
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              No (Sole Offer)
            </button>
          </div>
        </div>
      </div>

      {/* Offer Competitiveness Score Gauge */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Offer Audit Diagnostic</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">Offer Competitiveness Score: {competitiveness.score}/100</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Hike Offered: <strong className="text-slate-900">+{hikePercentage}%</strong> against current baseline of ₹{candidateCurrentCtc}L</p>
          </div>
          <Badge className={`text-xs font-black px-4 py-1.5 rounded-full border ${competitiveness.badgeColor}`}>
            {competitiveness.verdict}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              style={{ width: `${competitiveness.score}%` }}
              className={`h-full transition-all duration-500 ${
                competitiveness.score >= 80 ? 'bg-emerald-600' : competitiveness.score >= 50 ? 'bg-[#2563EB]' : 'bg-red-500'
              }`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-500">
            <span>0% (Immediate Reject)</span>
            <span>50% (50/50 Chance)</span>
            <span className="text-emerald-600">100% (Guaranteed Acceptance)</span>
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">Base Hike Sufficiency</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {hikePercentage >= 35 ? '✅ Exceeds standard market threshold of 30%.' : '⚠️ Below optimal 35% threshold for tech talent in Bangalore/NCR.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">Sign-on Bonus Impact</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {joiningBonus > 0 ? `✅ ₹${(joiningBonus/100000).toFixed(1)}L bonus increases joining probability by +12%.` : '⚠️ No sign-on bonus provided. Increases vulnerability to counter-offers.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">Counter-Offer Resilience</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {hasCompetingOffers ? '⚠️ Active competing offers detected. Recommend accelerated 48-hour offer turnaround.' : '✅ High commitment pipeline with minimal outside distraction.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
