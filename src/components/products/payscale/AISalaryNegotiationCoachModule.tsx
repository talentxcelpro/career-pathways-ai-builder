// src/components/products/payscale/AISalaryNegotiationCoachModule.tsx
// Module 5: AI Salary Negotiation Coach
// Offer Evaluation, Target Salary Recommendation, 4 Customized Negotiation Scripts & Counter-Offer Strategy Playbooks

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  FileText,
  ThumbsUp,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AISalaryNegotiationCoachModule: React.FC = () => {
  const { user } = useAuth();
  const realName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : '') || 'Candidate';

  const [currentCtc, setCurrentCtc] = useState<number>(12);
  const [offeredCtc, setOfferedCtc] = useState<number>(16);
  const [targetRole, setTargetRole] = useState<string>('Lead Frontend Architect');
  const [targetCompany, setTargetCompany] = useState<string>('Stripe India');
  const [competingOfferCtc, setCompetingOfferCtc] = useState<number>(18);
  const [selectedScriptType, setSelectedScriptType] = useState<'counter' | 'competing' | 'appraisal' | 'joining_bonus'>('counter');

  // Hike metrics
  const percentageHike = Math.round(((offeredCtc - currentCtc) / currentCtc) * 100);
  const recommendedTargetCtc = Math.round((currentCtc * 1.45) * 10) / 10; // Standard 45% anchor

  // Offer Evaluation
  const offerGrade = useMemo(() => {
    if (percentageHike < 20) {
      return {
        label: 'Low Hike (Under Market)',
        color: 'text-amber-600 bg-amber-50 border-amber-300',
        advice: 'Standard market mobility hike in India is 30%–45%. Countering is strongly advised.'
      };
    } else if (percentageHike <= 40) {
      return {
        label: 'Healthy Market Hike (Fair)',
        color: 'text-blue-600 bg-blue-50 border-blue-300',
        advice: 'Good baseline offer. You can still negotiate a joining bonus (₹1.5L–₹3L) or variable pay.'
      };
    } else {
      return {
        label: 'High Premium Offer (Top Tier)',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-300',
        advice: 'Excellent compensation leap. Focus on sign-on bonus and immediate RSUs/ESOP vesting schedule.'
      };
    }
  }, [percentageHike]);

  // Scripts
  const scripts = {
    counter: {
      title: 'Initial Counter-Offer Email (Anchor High)',
      subject: `Offer Discussion - ${targetRole} - Follow-up`,
      body: `Hi [Recruiter Name],

Thank you very much for extending the formal offer for the ${targetRole} position at ${targetCompany}. I am genuinely excited about the team's roadmap and the engineering scale we discussed.

After reviewing the compensation details and comparing them with current industry benchmarks for this level of ownership in [Location], I was hoping we could explore an annual fixed CTC closer to ₹${recommendedTargetCtc} LPA.

Given my direct track record with [Key Skill / Achievement] and my ability to hit the ground running from Day 1, I believe this reflects the market value I will bring to ${targetCompany}.

If we can reach this threshold, I am prepared to sign and accept the offer immediately.

Best regards,
${realName}`
    },
    competing: {
      title: 'Leveraging a Competing Offer',
      subject: `Update regarding ${targetRole} Offer - ${targetCompany}`,
      body: `Hi [Recruiter Name],

I wanted to provide a quick and transparent update regarding the offer for ${targetRole}. 

${targetCompany} remains my preferred technical home because of the team's vision and technical leadership. However, I have received a competing offer in the range of ₹${competingOfferCtc} LPA from another Tier-1 technology firm.

Because ${targetCompany} is where I see the highest mutual alignment, I would love to know if you can close the gap or bridge the delta through a combination of revised base compensation and an upfront joining bonus.

I am eager to finalize my decision this week.

Warm regards,
${realName}`
    },
    appraisal: {
      title: 'Internal Appraisal & Annual Hike Pitch',
      subject: `Performance & Compensation Review Discussion - ${realName}`,
      body: `Hi [Manager Name],

Thank you for the continuous support over this past year. Over the last 12 months, I have delivered [Key Deliverable 1] and [Key Deliverable 2], which directly improved our team's delivery velocity by [Metric %].

As we head into this cycle's compensation review, I have benchmarked my current responsibilities against market standards for senior contributors across our industry. Market data reflects a median of ₹${recommendedTargetCtc} LPA for this scope of impact.

I would appreciate setting aside 20 minutes to discuss aligning my compensation with these contributions and mapping out my growth trajectory for the upcoming year.

Best,
${realName}`
    },
    joining_bonus: {
      title: 'Sign-On / Joining Bonus Request',
      subject: `Clarification on Offer Terms - ${targetRole}`,
      body: `Hi [Recruiter Name],

Thank you for working through the salary breakdown with me. The base fixed salary of ₹${offeredCtc} LPA is aligned with my expectations.

However, moving before [Month] will result in forfeiting my upcoming annual bonus / unvested equity worth approximately ₹[Amount] at my current employer.

Would ${targetCompany} be open to offering a one-time sign-on bonus of ₹[Target Bonus, e.g. 2,00,000] to offset this transition loss? This would make accepting the offer an easy and immediate decision for me.

Thank you again for your partnership!

Sincerely,
${realName}`
    }
  };

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Negotiation script copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-400/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Negotiation Intelligence & Counter-Offer Strategist</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Maximize Your Next Job Offer Without Burning Bridges
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Data-backed negotiation scripts, percentage hike evaluators, and proven executive counter-offer frameworks to secure top-of-band pay.
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Current Annual CTC (LPA)
          </label>
          <Input
            type="number"
            min={1}
            max={100}
            step={0.5}
            value={currentCtc}
            onChange={(e) => setCurrentCtc(parseFloat(e.target.value) || 0)}
            className="h-10 text-sm font-bold rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Offered Annual CTC (LPA)
          </label>
          <Input
            type="number"
            min={1}
            max={150}
            step={0.5}
            value={offeredCtc}
            onChange={(e) => setOfferedCtc(parseFloat(e.target.value) || 0)}
            className="h-10 text-sm font-bold rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Role Title
          </label>
          <Input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="h-10 text-xs font-semibold rounded-xl"
            placeholder="e.g. Staff Engineer"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Hiring Company
          </label>
          <Input
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            className="h-10 text-xs font-semibold rounded-xl"
            placeholder="e.g. Swiggy, TCS, Razorpay"
          />
        </div>
      </div>

      {/* Offer Hike Evaluation Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Offer Health Score</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black text-slate-900">+{percentageHike}% Hike</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${offerGrade.color}`}>
                {offerGrade.label}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{offerGrade.advice}</p>
          </div>

          <div className="text-right bg-blue-50/70 border border-blue-200 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">AI Recommended Target Anchor</span>
            <div className="text-2xl font-black text-[#2563EB]">₹{recommendedTargetCtc} LPA</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Target +45% market mobility leap</div>
          </div>
        </div>

        {/* Script Type Tabs */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedScriptType('counter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedScriptType === 'counter'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Initial Counter-Offer
            </button>
            <button
              onClick={() => setSelectedScriptType('competing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedScriptType === 'competing'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Competing Offer Leverage
            </button>
            <button
              onClick={() => setSelectedScriptType('joining_bonus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedScriptType === 'joining_bonus'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. Request Sign-On Bonus
            </button>
            <button
              onClick={() => setSelectedScriptType('appraisal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedScriptType === 'appraisal'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              4. Internal Appraisal Pitch
            </button>
          </div>

          {/* Script Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">{scripts[selectedScriptType].title}</h4>
                <p className="text-[10px] text-slate-500">Subject: {scripts[selectedScriptType].subject}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleCopyScript(scripts[selectedScriptType].body)}
                className="bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold h-8 rounded-xl flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {scripts[selectedScriptType].body}
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Playbook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">1</div>
          <h4 className="text-sm font-bold text-slate-900">Always Negotiate Fixed First</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your PF, gratuity, future appraisal baselines, and in-hand monthly salary compound directly on Fixed Base Salary, not variable bonuses.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center font-bold">2</div>
          <h4 className="text-sm font-bold text-slate-900">Sign-on Bonus Closes Gaps</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            When recruiters hit internal band caps on base pay, they almost always have discretionary budget for one-time sign-on or joining bonuses.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">3</div>
          <h4 className="text-sm font-bold text-slate-900">Anchor High with Data</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Always quote a target range where your minimum acceptable pay is the bottom of the range. Reference empirical TalentXcel market percentiles.
          </p>
        </div>
      </div>
    </div>
  );
};
