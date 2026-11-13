// src/components/products/payscale/IncrementAppraisalPlannerModule.tsx
// Module 8: Increment & Appraisal Planner (Merit Matrix, Performance Ratings 1–5, Compa-Ratio, Budget Simulations & Flight Risk)

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  SlidersHorizontal,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const IncrementAppraisalPlannerModule: React.FC = () => {
  const [totalAnnualPayrollCr, setTotalAnnualPayrollCr] = useState<number>(25.0);
  const [targetHikePoolPct, setTargetHikePoolPct] = useState<number>(9.5); // 9.5% average org hike
  const [promotionBudgetPct, setPromotionBudgetPct] = useState<number>(2.0); // 2% for off-cycle promotions

  const poolAmountCr = useMemo(() => {
    return Math.round((totalAnnualPayrollCr * (targetHikePoolPct / 100)) * 100) / 100;
  }, [totalAnnualPayrollCr, targetHikePoolPct]);

  // Merit Matrix (Performance 1 to 5 vs Compa-Ratio)
  const MERIT_MATRIX = [
    { rating: '5 - Outstanding (Top 10%)', lowCompa: '16%–22%', midCompa: '12%–16%', highCompa: '8%–12%' },
    { rating: '4 - Exceeds Expectations (25%)', lowCompa: '12%–15%', midCompa: '9%–12%', highCompa: '6%–9%' },
    { rating: '3 - Consistently Meets (55%)', lowCompa: '8%–11%', midCompa: '6%–8%', highCompa: '4%–6%' },
    { rating: '2 - Needs Improvement (8%)', lowCompa: '0%–4%', midCompa: '0%–3%', highCompa: '0%' },
    { rating: '1 - Unsatisfactory (2%)', lowCompa: '0%', midCompa: '0%', highCompa: '0%' }
  ];

  const FLIGHT_RISK_COHORT = [
    { id: 'EMP-9021', role: 'Staff ML Engineer', currentCtc: '₹32L', marketMedian: '₹46L', compa: 0.70, rating: 5, risk: 'Critical Flight Risk' },
    { id: 'EMP-7104', role: 'Lead DevOps Architect', currentCtc: '₹24L', marketMedian: '₹34L', compa: 0.71, rating: 5, risk: 'Critical Flight Risk' },
    { id: 'EMP-6382', role: 'Senior Product Manager', currentCtc: '₹22L', marketMedian: '₹29L', compa: 0.76, rating: 4, risk: 'High Flight Risk' },
    { id: 'EMP-5190', role: 'Full-Stack SDE III', currentCtc: '₹18L', marketMedian: '₹24L', compa: 0.75, rating: 4, risk: 'High Flight Risk' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Merit-Linked Annual Compensation & Retention Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Merit Matrix, Increment Cycle Simulator & Retention Risk
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Distribute appraisal budgets equitably based on performance ratings and compa-ratios. Automatically flag top performers at high flight risk before they receive outside offers.
          </p>
        </div>
      </div>

      {/* Appraisal Budget Simulator Bar */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Total Annual Payroll (₹ Cr)
          </label>
          <Input
            type="number"
            value={totalAnnualPayrollCr}
            onChange={(e) => setTotalAnnualPayrollCr(parseFloat(e.target.value) || 0)}
            className="h-10 text-base font-bold rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Org Hike Pool: <span className="text-[#2563EB] font-black">{targetHikePoolPct}%</span>
          </label>
          <input
            type="range"
            min={4}
            max={18}
            step={0.5}
            value={targetHikePoolPct}
            onChange={(e) => setTargetHikePoolPct(parseFloat(e.target.value))}
            className="w-full accent-[#2563EB]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>4% (Conservative)</span>
            <span>9.5% (Market)</span>
            <span>18% (Aggressive)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Allocated Increment Budget</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹{poolAmountCr} Cr</div>
          <div className="text-[10px] text-emerald-900 mt-0.5">+₹{Math.round((poolAmountCr / 12) * 100) / 100} Cr Monthly Additional Payroll</div>
        </div>
      </div>

      {/* Merit Matrix Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900">Standard 9-Box Merit Increment Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">Recommended percentage hike range by Performance Score vs Compa-Ratio Quartile.</p>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Performance Rating</th>
                <th className="p-3.5 text-center">Below Band (&lt; 0.90)</th>
                <th className="p-3.5 text-center">At Market (0.90 – 1.10)</th>
                <th className="p-3.5 text-center">Above Band (&gt; 1.10)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MERIT_MATRIX.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{row.rating}</td>
                  <td className="p-3.5 text-center font-black text-emerald-600 bg-emerald-50/30">{row.lowCompa}</td>
                  <td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">{row.midCompa}</td>
                  <td className="p-3.5 text-center font-medium text-slate-600">{row.highCompa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Retention & Flight Risk Warnings */}
      <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Critical Employee Flight Risk Radar</h3>
              <p className="text-xs text-slate-500">Top performers (Rating 4 & 5) whose current pay is &gt;20% below market median.</p>
            </div>
          </div>
          <Badge className="bg-red-50 text-red-700 border border-red-300 font-bold">
            {FLIGHT_RISK_COHORT.length} Immediate Interventions Needed
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FLIGHT_RISK_COHORT.map((emp, i) => (
            <div key={i} className="p-4 rounded-2xl border border-red-100 bg-red-50/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{emp.id}</span>
                  <h4 className="text-xs font-black text-slate-900">{emp.role}</h4>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Current: <strong className="text-slate-900">{emp.currentCtc}</strong> • Market Median: <strong className="text-[#2563EB]">{emp.marketMedian}</strong> (Compa: {emp.compa})
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                  {emp.risk}
                </span>
                <Button
                  size="sm"
                  onClick={() => toast.success(`Pre-emptive compensation revision queued for ${emp.id} (${emp.role})`)}
                  className="mt-2 bg-[#2563EB] text-white text-[10px] font-bold h-7 rounded-lg"
                >
                  Adjust Pay
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
