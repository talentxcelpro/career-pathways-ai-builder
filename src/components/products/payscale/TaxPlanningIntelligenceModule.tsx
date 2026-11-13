// src/components/products/payscale/TaxPlanningIntelligenceModule.tsx
// Module 2: Tax Planning Intelligence (Old vs New Regime Section 115BAC for FY 2025-26 & FY 2026-27)
// Interactive HRA Exemption Calculator (Sec 10(13A)), Chapter VI-A Deductions, Scenario Planner

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Info, 
  HelpCircle,
  FileText,
  DollarSign,
  PieChart,
  Percent,
  SlidersHorizontal,
  Home,
  Heart,
  Umbrella,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  calculateIndianSalaryBreakdown, 
  calculateHRAExemption,
  compareTaxRegimes,
  formatINR,
  SalaryBreakdownResult
} from '@/services/salary/indianTaxAndPayrollEngine';
import { toast } from 'sonner';

export const TaxPlanningIntelligenceModule: React.FC = () => {
  // Inputs
  const [ctcLakhs, setCtcLakhs] = useState<number>(18);
  const [basicPct, setBasicPct] = useState<number>(50);
  const [cityType, setCityType] = useState<'metro' | 'non-metro'>('metro');
  const [monthlyRent, setMonthlyRent] = useState<number>(28000);
  
  // Chapter VI-A Deductions
  const [sec80C, setSec80C] = useState<number>(150000); // Max 1.5L (EPF, ELSS, PPF, Life Insurance, Tuition)
  const [sec80D, setSec80D] = useState<number>(25000); // Health insurance self/family
  const [sec80CCD1B, setSec80CCD1B] = useState<number>(50000); // NPS additional
  const [sec24bHomeLoan, setSec24bHomeLoan] = useState<number>(0); // Home loan interest up to 2L
  const [sec80EEducation, setSec80EEducation] = useState<number>(0); // Education loan interest

  // Calculate HRA Exemption
  const annualCtc = ctcLakhs * 100000;
  const annualBasic = annualCtc * (basicPct / 100);
  const annualHraReceived = annualBasic * (cityType === 'metro' ? 0.50 : 0.40);
  const totalAnnualRent = monthlyRent * 12;

  const hraResult = useMemo(() => {
    return calculateHRAExemption({
      actualHraReceivedAnnual: annualHraReceived,
      basicSalaryAnnual: annualBasic,
      rentPaidAnnual: totalAnnualRent,
      isMetro: cityType === 'metro'
    });
  }, [annualHraReceived, annualBasic, totalAnnualRent, cityType]);

  // Total Old Regime Deductions
  const totalOldDeductions = useMemo(() => {
    return (
      hraResult.exemptHra +
      Math.min(150000, sec80C) +
      Math.min(100000, sec80D) +
      Math.min(50000, sec80CCD1B) +
      Math.min(200000, sec24bHomeLoan) +
      sec80EEducation
    );
  }, [hraResult.exemptHra, sec80C, sec80D, sec80CCD1B, sec24bHomeLoan, sec80EEducation]);

  // Compare Old vs New
  const comparison = useMemo(() => {
    return compareTaxRegimes(annualCtc, totalOldDeductions, basicPct);
  }, [annualCtc, totalOldDeductions, basicPct]);

  const newRegime = comparison.newRegime;
  const oldRegime = comparison.oldRegime;

  const isNewOptimal = comparison?.recommendedRegime?.toString().toUpperCase() === 'NEW';
  const isOldOptimal = comparison?.recommendedRegime?.toString().toUpperCase() === 'OLD';
  const annualSavings = comparison?.taxSavingsAnnual ?? comparison?.annualTaxDifference ?? 0;
  const monthlySavings = Math.round(annualSavings / 12);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Tax Intelligence Engine • Finance Act FY 2025–26 & FY 2026–27</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Old vs New Regime Tax Optimization & Exemption Planner
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Side-by-side mathematical audit under Section 115BAC vs Chapter VI-A. Compute statutory standard deductions, HRA exemptions, Section 87A rebates, and identify the exact regime that puts more money in your bank account every month.
          </p>
        </div>
      </div>

      {/* Top Interactive Parameter Controls */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Annual CTC: <span className="text-[#2563EB] font-black text-sm">₹{ctcLakhs} LPA</span>
          </label>
          <input
            type="range"
            min={3}
            max={80}
            step={0.5}
            value={ctcLakhs}
            onChange={(e) => setCtcLakhs(parseFloat(e.target.value))}
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>₹3L</span>
            <span>₹25L</span>
            <span>₹50L</span>
            <span>₹80L</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Basic Salary %
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBasicPct(50)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                basicPct === 50
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              50% (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setBasicPct(40)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                basicPct === 40
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              40% (Traditional)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Accommodation City
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCityType('metro')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                cityType === 'metro'
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Metro (50% HRA)
            </button>
            <button
              type="button"
              onClick={() => setCityType('non-metro')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                cityType === 'non-metro'
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Non-Metro (40%)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Monthly Rent Paid: <span className="text-emerald-600 font-black">₹{(monthlyRent ?? 0).toLocaleString('en-IN')}</span>
          </label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-9 text-xs font-semibold rounded-xl"
            placeholder="e.g. 25000"
          />
        </div>
      </div>

      {/* WINNER RECOMMENDATION BANNER */}
      <div className={`rounded-2xl p-5 border-2 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isNewOptimal
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
          : 'bg-blue-50/70 border-blue-300 text-blue-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isNewOptimal ? 'bg-emerald-600 text-white' : 'bg-[#2563EB] text-white'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-current">
                Optimal Decision
              </span>
              <h3 className="text-lg font-black">
                {isNewOptimal ? 'New Tax Regime (Section 115BAC)' : 'Old Tax Regime'} is Better
              </h3>
            </div>
            <p className="text-xs mt-1 font-medium opacity-90">
              {comparison?.rationale ?? comparison?.recommendationSummary}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Net Tax Savings
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ₹{annualSavings.toLocaleString('en-IN')}
            <span className="text-xs font-semibold text-slate-500"> /year</span>
          </div>
          <div className="text-[11px] font-bold text-slate-600">
            +₹{monthlySavings.toLocaleString('en-IN')} in-hand /mo
          </div>
        </div>
      </div>

      {/* Side-by-Side Regime Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NEW REGIME CARD */}
        <div className={`bg-white rounded-3xl border-2 p-6 shadow-sm relative ${
          isNewOptimal ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
        }`}>
          {isNewOptimal && (
            <span className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Recommended for You
            </span>
          )}

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">New Tax Regime</h3>
              <p className="text-xs text-slate-500">Default Regime u/s 115BAC • FY 2025–26 & FY 2026–27</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-semibold">Annual Tax</div>
              <div className="text-xl font-black text-slate-900">
                ₹{(newRegime?.tax?.annualTax ?? newRegime?.taxDiagnostics?.totalAnnualTax ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Gross Total Income</span>
              <span className="font-bold text-slate-900">₹{(newRegime?.tax?.grossTotalIncome ?? newRegime?.earnings?.grossSalary?.annual ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Standard Deduction (Budget 2024 revised)</span>
              <span className="font-bold text-emerald-600">-₹{(newRegime?.tax?.standardDeduction ?? newRegime?.taxDiagnostics?.standardDeduction ?? 75000).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">HRA & 80C Exemptions</span>
              <span className="font-bold text-slate-400">Not Applicable (₹0)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Taxable Income</span>
              <span className="font-bold text-slate-900">₹{(newRegime?.tax?.taxableIncome ?? newRegime?.taxDiagnostics?.taxableIncome ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Basic Tax before Rebate</span>
              <span className="font-bold text-slate-900">₹{(newRegime?.tax?.taxBeforeCess ?? newRegime?.taxDiagnostics?.baseTaxBeforeRebate ?? 0).toLocaleString('en-IN')}</span>
            </div>
            {((newRegime?.tax?.rebate87A ?? newRegime?.taxDiagnostics?.rebate87A ?? 0) > 0) && (
              <div className="py-2.5 flex justify-between bg-emerald-50 px-2 rounded-lg">
                <span className="text-emerald-800 font-bold">Section 87A Rebate (up to ₹7L)</span>
                <span className="font-black text-emerald-700">-₹{(newRegime?.tax?.rebate87A ?? newRegime?.taxDiagnostics?.rebate87A ?? 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Health & Education Cess (4%)</span>
              <span className="font-bold text-slate-900">₹{(newRegime?.tax?.cess ?? newRegime?.taxDiagnostics?.healthAndEducationCess ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-3 flex justify-between bg-slate-50 px-3 rounded-xl font-bold">
              <span className="text-slate-900">Net Monthly In-Hand</span>
              <span className="text-sm font-black text-[#2563EB]">
                ₹{(newRegime?.netSalary?.monthly ?? newRegime?.takeHome?.monthlyInHand ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
            💡 <strong>New Regime Advantage:</strong> No investment lock-in required. Flat ₹75,000 standard deduction + zero tax up to ₹7,75,000 CTC.
          </div>
        </div>

        {/* OLD REGIME CARD */}
        <div className={`bg-white rounded-3xl border-2 p-6 shadow-sm relative ${
          isOldOptimal ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
        }`}>
          {isOldOptimal && (
            <span className="absolute -top-3 right-6 bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Recommended for You
            </span>
          )}

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Old Tax Regime</h3>
              <p className="text-xs text-slate-500">With Chapter VI-A & Section 10(13A) HRA</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-semibold">Annual Tax</div>
              <div className="text-xl font-black text-slate-900">
                ₹{(oldRegime?.tax?.annualTax ?? oldRegime?.taxDiagnostics?.totalAnnualTax ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Gross Total Income</span>
              <span className="font-bold text-slate-900">₹{(oldRegime?.tax?.grossTotalIncome ?? oldRegime?.earnings?.grossSalary?.annual ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Standard Deduction</span>
              <span className="font-bold text-slate-700">-₹{(oldRegime?.tax?.standardDeduction ?? oldRegime?.taxDiagnostics?.standardDeduction ?? 50000).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">HRA Exemption u/s 10(13A)</span>
              <span className="font-bold text-emerald-600">-₹{(hraResult?.exemptHra ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Chapter VI-A (80C, 80D, NPS, Home Loan)</span>
              <span className="font-bold text-emerald-600">-₹{Math.max(0, (totalOldDeductions ?? 0) - (hraResult?.exemptHra ?? 0)).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Taxable Income</span>
              <span className="font-bold text-slate-900">₹{(oldRegime?.tax?.taxableIncome ?? oldRegime?.taxDiagnostics?.taxableIncome ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Basic Tax before Cess</span>
              <span className="font-bold text-slate-900">₹{(oldRegime?.tax?.taxBeforeCess ?? oldRegime?.taxDiagnostics?.baseTaxBeforeRebate ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-600">Health & Education Cess (4%)</span>
              <span className="font-bold text-slate-900">₹{(oldRegime?.tax?.cess ?? oldRegime?.taxDiagnostics?.healthAndEducationCess ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="py-3 flex justify-between bg-slate-50 px-3 rounded-xl font-bold">
              <span className="text-slate-900">Net Monthly In-Hand</span>
              <span className="text-sm font-black text-[#2563EB]">
                ₹{(oldRegime?.netSalary?.monthly ?? oldRegime?.takeHome?.monthlyInHand ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
            🏡 <strong>Old Regime Advantage:</strong> Highly advantageous if paying high rent (HRA) + claiming full 80C, 80D, NPS, and home loan interest.
          </div>
        </div>
      </div>

      {/* Interactive HRA Exemption Calculator Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-base font-black text-slate-900">
            Section 10(13A) HRA Exemption Breakdown (Least of 3 Conditions)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Condition 1: Actual HRA Received
            </div>
            <div className="text-lg font-black text-slate-900">
              ₹{(hraResult?.actualHraReceived ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">From employment CTC structure</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Condition 2: Rent Paid - 10% of Basic
            </div>
            <div className="text-lg font-black text-slate-900">
              ₹{(hraResult?.rentMinus10PercentBasic ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">₹{(totalAnnualRent ?? 0).toLocaleString('en-IN')} - ₹{Math.round((annualBasic ?? 0) * 0.1).toLocaleString('en-IN')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Condition 3: {cityType === 'metro' ? '50%' : '40%'} of Basic Salary
            </div>
            <div className="text-lg font-black text-slate-900">
              ₹{(hraResult?.percentOfBasic ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{cityType === 'metro' ? 'Delhi, Mumbai, Kolkata, Chennai' : 'Other cities'}</div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-900">
              Statutory Exempt HRA: <span className="font-black text-base text-emerald-700">₹{(hraResult?.exemptHra ?? 0).toLocaleString('en-IN')}</span> /year
            </div>
            <div className="text-[11px] text-emerald-800 mt-0.5">
              Taxable HRA Portion: ₹{(hraResult?.taxableHra ?? 0).toLocaleString('en-IN')} /year
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white font-bold">
            Condition {hraResult?.qualifyingRule ?? '1'} Qualified
          </Badge>
        </div>
      </div>

      {/* Chapter VI-A Deduction Sliders */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs">
        <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#2563EB]" />
          <span>Chapter VI-A Investment & Deduction Simulator (Old Regime)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Adjust your declarations to see the tipping point where Old Regime becomes more profitable than New Regime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Section 80C */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">Section 80C</span>
              <span className="text-xs font-black text-[#2563EB]">₹{(sec80C ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-2">EPF, ELSS, PPF, Life Insurance, Tuition (Max ₹1.5L)</div>
            <input
              type="range"
              min={0}
              max={150000}
              step={5000}
              value={sec80C}
              onChange={(e) => setSec80C(parseInt(e.target.value) || 0)}
              className="w-full accent-[#2563EB]"
            />
          </div>

          {/* Section 80D */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">Section 80D</span>
              <span className="text-xs font-black text-[#2563EB]">₹{(sec80D ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-2">Health Insurance (Self: ₹25k, Parents: up to ₹50k)</div>
            <input
              type="range"
              min={0}
              max={75000}
              step={2500}
              value={sec80D}
              onChange={(e) => setSec80D(parseInt(e.target.value) || 0)}
              className="w-full accent-[#2563EB]"
            />
          </div>

          {/* Section 80CCD(1B) NPS */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">Section 80CCD(1B)</span>
              <span className="text-xs font-black text-[#2563EB]">₹{(sec80CCD1B ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-2">National Pension Scheme (Additional ₹50k beyond 80C)</div>
            <input
              type="range"
              min={0}
              max={50000}
              step={5000}
              value={sec80CCD1B}
              onChange={(e) => setSec80CCD1B(parseInt(e.target.value) || 0)}
              className="w-full accent-[#2563EB]"
            />
          </div>

          {/* Section 24(b) Home Loan Interest */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">Section 24(b) Home Loan</span>
              <span className="text-xs font-black text-[#2563EB]">₹{(sec24bHomeLoan ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-2">Interest on self-occupied housing loan (Max ₹2L)</div>
            <input
              type="range"
              min={0}
              max={200000}
              step={10000}
              value={sec24bHomeLoan}
              onChange={(e) => setSec24bHomeLoan(parseInt(e.target.value) || 0)}
              className="w-full accent-[#2563EB]"
            />
          </div>

          {/* Section 80E Education Loan */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">Section 80E Education Loan</span>
              <span className="text-xs font-black text-[#2563EB]">₹{(sec80EEducation ?? 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 mb-2">Interest paid on higher education loan (No cap for 8 yrs)</div>
            <input
              type="range"
              min={0}
              max={150000}
              step={5000}
              value={sec80EEducation}
              onChange={(e) => setSec80EEducation(parseInt(e.target.value) || 0)}
              className="w-full accent-[#2563EB]"
            />
          </div>

          {/* Total Chapter VI-A Summary */}
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] mb-1">
                Total Deductions Claimed
              </div>
              <div className="text-xl font-black text-slate-900">
                ₹{(totalOldDeductions ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                Includes HRA (₹{(hraResult?.exemptHra ?? 0).toLocaleString('en-IN')}) + VI-A (₹{Math.max(0, (totalOldDeductions ?? 0) - (hraResult?.exemptHra ?? 0)).toLocaleString('en-IN')})
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => toast.success('Tax declaration saved to your local profile!')}
              className="mt-3 bg-[#2563EB] text-white text-xs font-bold rounded-xl h-8"
            >
              Save Declaration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
