// src/components/products/payscale/FinancialPlanningModule.tsx
// Module 6: Income & Financial Planning (50/30/20 Budgeting, EPF & NPS Wealth Simulators, Bonus Allocator)

import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  PieChart, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Coins,
  HeartHandshake,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { calculateIndianSalaryBreakdown } from '@/services/salary/indianTaxAndPayrollEngine';
import { toast } from 'sonner';

export const FinancialPlanningModule: React.FC = () => {
  const [ctcLakhs, setCtcLakhs] = useState<number>(18);
  const [investmentHorizonYears, setInvestmentHorizonYears] = useState<number>(15);
  const [epfInterestRate, setEpfInterestRate] = useState<number>(8.25); // Statutory EPFO rate
  const [bonusAmount, setBonusAmount] = useState<number>(200000);

  const breakdown = useMemo(() => {
    return calculateIndianSalaryBreakdown({ annualCtc: ctcLakhs * 100000 });
  }, [ctcLakhs]);

  const monthlyNet = breakdown.monthly.netInHand;

  // 50/30/20 Rule
  const budget = useMemo(() => {
    const needs = Math.round(monthlyNet * 0.50);
    const wants = Math.round(monthlyNet * 0.30);
    const savings = Math.round(monthlyNet * 0.20);
    return { needs, wants, savings };
  }, [monthlyNet]);

  // EPF Compounding Projection
  // Monthly employee PF + employer EPF portion (3.67% of basic, remainder 8.33% goes to EPS)
  const monthlyTotalPf = breakdown.monthly.pfEmployee + Math.round(breakdown.monthly.basic * 0.0367);
  const annualPfContribution = monthlyTotalPf * 12;

  const epfWealthFutureValue = useMemo(() => {
    const r = epfInterestRate / 100;
    const n = investmentHorizonYears;
    // Future value of annual annuity: FV = P * [((1 + r)^n - 1) / r]
    const fv = annualPfContribution * ((Math.pow(1 + r, n) - 1) / r);
    return Math.round(fv);
  }, [annualPfContribution, epfInterestRate, investmentHorizonYears]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Personal Wealth & Retirement Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Turn Monthly Salary Into Lifelong Financial Independence
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Automated 50/30/20 expense mapping, EPFO 8.25% compounding simulations, NPS tax-efficient wealth growth, and structured bonus distribution.
          </p>
        </div>
      </div>

      {/* CTC Input Control */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Salary Baseline</span>
          <div className="text-xl font-black text-slate-900">₹{ctcLakhs} LPA Annual CTC</div>
          <div className="text-xs text-slate-500">Net Monthly In-Hand: <strong className="text-[#2563EB]">₹{(monthlyNet ?? 0).toLocaleString('en-IN')}</strong></div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Adjust CTC:</label>
          <input
            type="range"
            min={3}
            max={60}
            step={1}
            value={ctcLakhs}
            onChange={(e) => setCtcLakhs(parseInt(e.target.value) || 0)}
            className="w-48 accent-[#2563EB]"
          />
        </div>
      </div>

      {/* 50/30/20 Monthly Cash Flow Rule */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cash Flow Architecture</span>
          <h3 className="text-lg font-black text-slate-900">50/30/20 Monthly In-Hand Budget Allocation</h3>
          <p className="text-xs text-slate-500 mt-0.5">Based on your net monthly take-home of ₹{(monthlyNet ?? 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Needs 50% */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#2563EB] uppercase tracking-wider">50% Essential Needs</span>
              <Badge className="bg-blue-600 text-white font-bold">₹{(budget?.needs ?? 0).toLocaleString('en-IN')}</Badge>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Rent/EMIs, groceries, utilities, school fees, transport, and insurance premiums.
            </p>
          </div>

          {/* Wants 30% */}
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#7138E8] uppercase tracking-wider">30% Lifestyle Wants</span>
              <Badge className="bg-purple-600 text-white font-bold">₹{(budget?.wants ?? 0).toLocaleString('en-IN')}</Badge>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dining out, shopping, subscriptions, domestic travel, and entertainment.
            </p>
          </div>

          {/* Savings 20% */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">20% Wealth Building</span>
              <Badge className="bg-emerald-600 text-white font-bold">₹{(budget?.savings ?? 0).toLocaleString('en-IN')}</Badge>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mutual funds (SIPs), emergency fund, direct equity, PPF, and voluntary NPS.
            </p>
          </div>
        </div>
      </div>

      {/* EPF Compounding Wealth Simulator */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Statutory Retirement Asset</span>
            <h3 className="text-lg font-black text-slate-900">Employees' Provident Fund (EPF @ 8.25%) Wealth Growth</h3>
            <p className="text-xs text-slate-500 mt-0.5">Government-backed guaranteed compounding on your monthly salary deductions</p>
          </div>

          <div className="flex items-center gap-2">
            {[5, 10, 15, 20, 25].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setInvestmentHorizonYears(y)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  investmentHorizonYears === y
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {y} Yrs
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Monthly Contribution:</span>
              <span className="font-bold text-slate-900">₹{(monthlyTotalPf ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Annual Investment:</span>
              <span className="font-bold text-slate-900">₹{(annualPfContribution ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Govt EPFO Interest:</span>
              <span className="font-bold text-emerald-600">{epfInterestRate}% p.a.</span>
            </div>
          </div>

          <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Projected EPF Maturity Corpus ({investmentHorizonYears} Years)
              </span>
              <div className="text-3xl font-black text-emerald-800 mt-1">
                ₹{(epfWealthFutureValue ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Your investment: ₹{((annualPfContribution ?? 0) * investmentHorizonYears).toLocaleString('en-IN')} • 
                <strong className="text-emerald-700"> +₹{Math.max(0, (epfWealthFutureValue ?? 0) - ((annualPfContribution ?? 0) * investmentHorizonYears)).toLocaleString('en-IN')} Compounded Interest</strong>
              </div>
            </div>

            <Badge className="bg-emerald-600 text-white font-bold px-3 py-1">
              100% Tax-Free on Maturity
            </Badge>
          </div>
        </div>
      </div>

      {/* Annual Bonus & Variable Pay Allocation */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Windfall Planning</span>
          <h3 className="text-lg font-black text-slate-900">Smart Bonus & Variable Pay Allocator</h3>
          <p className="text-xs text-slate-500 mt-0.5">Avoid lifestyle inflation by pre-allocating your annual performance bonus.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Expected Bonus (₹):</label>
          <Input
            type="number"
            step={10000}
            value={bonusAmount}
            onChange={(e) => setBonusAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-48 font-bold h-9 text-xs rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">40% Long-Term Equity</span>
            <div className="text-base font-black text-slate-900 mt-1">₹{Math.round((bonusAmount ?? 0) * 0.40).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">30% Debt / Prepayment</span>
            <div className="text-base font-black text-slate-900 mt-1">₹{Math.round((bonusAmount ?? 0) * 0.30).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">20% Emergency Reserve</span>
            <div className="text-base font-black text-slate-900 mt-1">₹{Math.round((bonusAmount ?? 0) * 0.20).toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase">10% Guilt-Free Splurge</span>
            <div className="text-base font-black text-emerald-700 mt-1">₹{Math.round((bonusAmount ?? 0) * 0.10).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
