// src/components/products/payscale/SmartSalaryCalculatorModule.tsx
// Module 1: Smart Salary Calculator (CTC to Gross to In-Hand)
// Deterministic breakdown with configurable salary components, retirals & tax deductions.

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Info, 
  HelpCircle,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  calculateIndianPayroll, 
  PayrollInput,
  PayrollCalculationResult 
} from '@/services/salary/indianTaxAndPayrollEngine';
import { toast } from 'sonner';

interface SmartSalaryCalculatorModuleProps {
  onNavigateToTax?: () => void;
  onNavigateToBenchmark?: () => void;
  onNavigateToDocuments?: () => void;
}

export const SmartSalaryCalculatorModule: React.FC<SmartSalaryCalculatorModuleProps> = ({
  onNavigateToTax,
  onNavigateToBenchmark,
  onNavigateToDocuments,
}) => {
  const [ctcInLakhs, setCtcInLakhs] = useState<number>(18);
  const [basicPct, setBasicPct] = useState<number>(40);
  const [isMetroCity, setIsMetroCity] = useState<boolean>(true);
  const [isPfCapped, setIsPfCapped] = useState<boolean>(false);
  const [hasGratuity, setHasGratuity] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<'Karnataka' | 'Maharashtra' | 'Delhi' | 'Telangana' | 'Tamil Nadu'>('Karnataka');
  const [variablePayPct, setVariablePayPct] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');

  const payrollResult: PayrollCalculationResult = useMemo(() => {
    return calculateIndianPayroll({
      annualCtc: ctcInLakhs * 100000,
      financialYear: '2026-27',
      regime: 'new', // Default to Section 115BAC
      basicSalaryPercentage: basicPct,
      hraPercentageOfBasic: 50,
      isMetroCity,
      isPfCapped,
      hasGratuity,
      stateForProfessionalTax: selectedState,
      variablePayPercentage: variablePayPct,
    });
  }, [ctcInLakhs, basicPct, isMetroCity, isPfCapped, hasGratuity, selectedState, variablePayPct]);

  const handleDownloadBreakdown = () => {
    const textContent = `TALENTXCEL PAYSCALE — OFFICIAL CTC BREAKDOWN REPORT
Financial Year: ${payrollResult.financialYear} | Tax Regime: New Regime (Section 115BAC)
Annual CTC: ₹${payrollResult.annualCtc.toLocaleString('en-IN')} (₹${ctcInLakhs} LPA)
------------------------------------------------------------
MONTHLY EARNINGS BREAKDOWN:
• Basic Salary: ₹${payrollResult.earnings.basic.monthly.toLocaleString('en-IN')}
• House Rent Allowance (HRA): ₹${payrollResult.earnings.hra.monthly.toLocaleString('en-IN')}
• Special Allowance: ₹${payrollResult.earnings.specialAllowance.monthly.toLocaleString('en-IN')}
${variablePayPct > 0 ? `• Variable Pay: ₹${payrollResult.earnings.variablePay.monthly.toLocaleString('en-IN')}\n` : ''}• Gross Paycheck: ₹${payrollResult.earnings.grossSalary.monthly.toLocaleString('en-IN')}

MONTHLY EMPLOYEE DEDUCTIONS:
• Employee Provident Fund (PF): ₹${payrollResult.employeeDeductions.providentFund.monthly.toLocaleString('en-IN')}
• Professional Tax (PT): ₹${payrollResult.employeeDeductions.professionalTax.monthly.toLocaleString('en-IN')}
• Estimated TDS / Income Tax: ₹${payrollResult.employeeDeductions.tdsMonthly.toLocaleString('en-IN')}
• Total Monthly Deductions: ₹${payrollResult.employeeDeductions.totalMonthlyDeductions.toLocaleString('en-IN')}

------------------------------------------------------------
NET IN-HAND MONTHLY TAKE-HOME: ₹${payrollResult.takeHome.monthlyInHand.toLocaleString('en-IN')} / month
NET IN-HAND ANNUAL TAKE-HOME: ₹${payrollResult.takeHome.annualInHand.toLocaleString('en-IN')} / year
Take-Home Percentage: ${payrollResult.takeHome.takeHomePercentageOfCtc}% of CTC
Effective Tax Rate: ${payrollResult.taxDiagnostics.effectiveTaxRatePercent}%
------------------------------------------------------------
Generated via TalentXcel PayScale (https://salary.talentxcel.in)`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TalentXcel_CTC_Breakdown_${ctcInLakhs}LPA.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CTC Breakdown downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/80 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              MODULE 1
            </span>
            <span className="text-xs font-bold text-slate-800">
              Deterministic Indian Payroll & Take-Home Engine (FY 2026-27)
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Calculated with ₹75,000 standard deduction under Section 115BAC, state-specific professional taxes, and exact employer retirals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode(viewMode === 'monthly' ? 'annual' : 'monthly')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Switch to {viewMode === 'monthly' ? 'Annual Breakdown' : 'Monthly Breakdown'}</span>
          </button>
          <Button
            onClick={handleDownloadBreakdown}
            className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CTC Sheet</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Net Take-Home Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 6 Columns: Interactive Controls & Allowance Configuration */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-white border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Annual Cost to Company (CTC)
                </span>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  ₹{(ctcInLakhs).toFixed(1)} LPA
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl sm:text-4xl font-black text-[#111827]">
                  ₹{ctcInLakhs}
                </span>
                <span className="text-base font-bold text-slate-500">Lakhs / year</span>
                <span className="text-xs text-slate-400 ml-auto font-medium">
                  (₹{payrollResult.monthlyCtc.toLocaleString('en-IN')} / mo)
                </span>
              </div>

              {/* Slider */}
              <div className="pt-4">
                <Slider
                  value={[ctcInLakhs]}
                  onValueChange={(val) => setCtcInLakhs(val[0])}
                  min={3}
                  max={120}
                  step={0.5}
                  className="py-1 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>₹3 LPA (Entry)</span>
                  <span>₹25 LPA (Senior)</span>
                  <span>₹60 LPA (Director)</span>
                  <span>₹120 LPA (Executive)</span>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[6, 10, 15, 20, 25, 35, 50, 75].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCtcInLakhs(amt)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      ctcInLakhs === amt
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    ₹{amt}L
                  </button>
                ))}
              </div>
            </div>

            {/* Advance Component Toggles */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Salary Structure & Retirals Customization</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Basic Percentage */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Basic Salary %</span>
                    <span className="font-extrabold text-[#2563EB]">{basicPct}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[40, 50].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setBasicPct(pct)}
                        className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          basicPct === pct ? 'bg-white text-[#2563EB] shadow-2xs border border-blue-200' : 'text-slate-500 hover:bg-white/50'
                        }`}
                      >
                        {pct}% of CTC
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">40% for non-metros, 50% standard corporate.</p>
                </div>

                {/* State for PT */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="font-bold text-slate-700 block">Work Location (PT)</span>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Karnataka">Karnataka (₹200/mo)</option>
                    <option value="Maharashtra">Maharashtra (₹200/mo)</option>
                    <option value="Delhi">Delhi (₹0/mo - Exempt)</option>
                    <option value="Telangana">Telangana (₹200/mo)</option>
                    <option value="Tamil Nadu">Tamil Nadu (₹208/mo)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-tight">Professional Tax state statutory deduction.</p>
                </div>
              </div>

              {/* Switches for PF Ceiling and Gratuity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div 
                  onClick={() => setIsPfCapped(!isPfCapped)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isPfCapped ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Cap PF at ₹1,800/mo</span>
                    <span className="text-[10px] text-slate-500">Increases monthly take-home</span>
                  </div>
                  <input type="checkbox" checked={isPfCapped} readOnly className="rounded text-[#2563EB]" />
                </div>

                <div 
                  onClick={() => setHasGratuity(!hasGratuity)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    hasGratuity ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Include Gratuity in CTC</span>
                    <span className="text-[10px] text-slate-500">4.81% of basic salary</span>
                  </div>
                  <input type="checkbox" checked={hasGratuity} readOnly className="rounded text-[#2563EB]" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 6 Columns: Transparent Net In-Hand Summary & Itemized Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Take-Home Card */}
          <div className="bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#1E1B4B] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Net Monthly In-Hand (Take-Home)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ₹{payrollResult.takeHome.monthlyInHand.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Annual In-Hand</span>
                <span className="text-lg font-black text-emerald-300">
                  ₹{payrollResult.takeHome.annualInHand.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block">
                  {payrollResult.takeHome.takeHomePercentageOfCtc}% of CTC
                </span>
              </div>
            </div>

            {/* Visual Progress Bar of CTC Retention */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Where does your ₹{(ctcInLakhs).toFixed(1)}L CTC go?</span>
                <span className="font-bold text-white">
                  Taxes: {payrollResult.taxDiagnostics.effectiveTaxRatePercent}% | Deductions: {(100 - payrollResult.takeHome.takeHomePercentageOfCtc).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
                <div 
                  style={{ width: `${payrollResult.takeHome.takeHomePercentageOfCtc}%` }} 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full" 
                  title={`Net In-Hand: ${payrollResult.takeHome.takeHomePercentageOfCtc}%`}
                />
                <div 
                  style={{ width: `${payrollResult.taxDiagnostics.effectiveTaxRatePercent}%` }} 
                  className="bg-amber-400 h-full" 
                  title={`Income Tax: ${payrollResult.taxDiagnostics.effectiveTaxRatePercent}%`}
                />
                <div 
                  style={{ width: `${Math.max(0, 100 - payrollResult.takeHome.takeHomePercentageOfCtc - payrollResult.taxDiagnostics.effectiveTaxRatePercent)}%` }} 
                  className="bg-purple-400 h-full" 
                  title="PF, PT & Retirals"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> Net Take-Home (₹{payrollResult.takeHome.monthlyInHand.toLocaleString('en-IN')})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400" /> Income Tax (₹{payrollResult.taxDiagnostics.monthlyTds.toLocaleString('en-IN')})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400" /> PF & Retirals
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/10 font-bold">
                <span>Salary Component</span>
                <span>{viewMode === 'monthly' ? 'Monthly Amount' : 'Annual Amount'}</span>
              </div>

              {/* Earnings */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Basic Salary</span>
                  <span className="font-semibold text-white">
                    ₹{(viewMode === 'monthly' ? payrollResult.earnings.basic.monthly : payrollResult.earnings.basic.annual).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-white">
                    ₹{(viewMode === 'monthly' ? payrollResult.earnings.hra.monthly : payrollResult.earnings.hra.annual).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Special Allowance</span>
                  <span className="font-semibold text-white">
                    ₹{(viewMode === 'monthly' ? payrollResult.earnings.specialAllowance.monthly : payrollResult.earnings.specialAllowance.annual).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-blue-300 pt-1 border-t border-white/5">
                  <span>Gross Paycheck Salary</span>
                  <span>₹{(viewMode === 'monthly' ? payrollResult.earnings.grossSalary.monthly : payrollResult.earnings.grossSalary.annual).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-rose-300">
                  <span>Employee PF (Provident Fund)</span>
                  <span>-₹{(viewMode === 'monthly' ? payrollResult.employeeDeductions.providentFund.monthly : payrollResult.employeeDeductions.providentFund.annual).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-rose-300">
                  <span>Professional Tax (PT)</span>
                  <span>-₹{(viewMode === 'monthly' ? payrollResult.employeeDeductions.professionalTax.monthly : payrollResult.employeeDeductions.professionalTax.annual).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-rose-300">
                  <span>Monthly TDS (Income Tax)</span>
                  <span>-₹{(viewMode === 'monthly' ? payrollResult.taxDiagnostics.monthlyTds : payrollResult.taxDiagnostics.totalAnnualTax).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions to other modules */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={onNavigateToTax}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>Old vs New Regime</span>
                  <span>→</span>
                </div>
                <div className="text-[10px] text-slate-300">Compare tax deductions</div>
              </button>

              <button
                onClick={onNavigateToBenchmark}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-sky-300 flex items-center gap-1">
                  <span>City Benchmarks</span>
                  <span>→</span>
                </div>
                <div className="text-[10px] text-slate-300">Check P10–P90 percentiles</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
