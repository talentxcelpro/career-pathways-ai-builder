// src/components/products/payscale/PayslipAndDocumentsModule.tsx
// Module 4: Payslip & Compensation Documents Generator
// Printable/PDF Payslip, Salary Structure Builder, Offer Comparison Matrix & Increment Letter

import React, { useState, useMemo, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign,
  Scale,
  Send,
  Copy,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  calculateIndianSalaryBreakdown, 
  formatINR, 
  numberToIndianWords 
} from '@/services/salary/indianTaxAndPayrollEngine';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const PayslipAndDocumentsModule: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'payslip' | 'structure' | 'compare' | 'increment'>('payslip');

  // Derive real authenticated user details
  const realUserName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : '') || 'Employee Name';
  const realEmpId = user?.id ? `TX-${user.id.substring(0, 6).toUpperCase()}` : 'TX-2026-001';

  // Payslip Generator State
  const [companyName, setCompanyName] = useState<string>('TalentXcel Technologies India Pvt Ltd');
  const [employeeName, setEmployeeName] = useState<string>(realUserName);
  const [employeeId, setEmployeeId] = useState<string>(realEmpId);

  // Sync if auth state resolves asynchronously
  React.useEffect(() => {
    if (user) {
      if (employeeName === 'Employee Name' || !employeeName) {
        setEmployeeName(realUserName);
      }
      if (employeeId === 'TX-2026-001') {
        setEmployeeId(realEmpId);
      }
    }
  }, [user, realUserName, realEmpId]);
  const [designation, setDesignation] = useState<string>('Senior Full-Stack Engineer');
  const [department, setDepartment] = useState<string>('Core Platform Engineering');
  const [payPeriod, setPayPeriod] = useState<string>('March 2026');
  const [ctcLakhs, setCtcLakhs] = useState<number>(18);
  const [uanNumber, setUanNumber] = useState<string>('101489201948');
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [bankAccount, setBankAccount] = useState<string>('HDFC Bank •••• 9821');

  // Compute live payroll breakdown
  const breakdown = useMemo(() => {
    return calculateIndianSalaryBreakdown({
      annualCtc: ctcLakhs * 100000,
      basicPercent: 50,
      state: 'karnataka',
      regime: 'new',
      isMetro: true
    });
  }, [ctcLakhs]);

  // Offer Comparison State
  const [offerACompany, setOfferACompany] = useState<string>('Current Employer');
  const [offerACtc, setOfferACtc] = useState<number>(14);
  const [offerBCompany, setOfferBCompany] = useState<string>('New Tech Unicorn');
  const [offerBCtc, setOfferBCtc] = useState<number>(20);
  const [offerBJoiningBonus, setOfferBJoiningBonus] = useState<number>(150000);

  const breakdownA = useMemo(() => {
    return calculateIndianSalaryBreakdown({ annualCtc: offerACtc * 100000 });
  }, [offerACtc]);

  const breakdownB = useMemo(() => {
    return calculateIndianSalaryBreakdown({ annualCtc: offerBCtc * 100000 });
  }, [offerBCtc]);

  const handlePrint = () => {
    toast.success('Opening print dialog for official payslip...');
    window.print();
  };

  const handleCopyIncrementLetter = () => {
    const text = `Date: 15 March 2026\n\nDear ${employeeName},\n\nSubject: Annual Compensation Revision & Promotion Letter\n\nOn behalf of ${companyName}, we are pleased to inform you that your annual compensation has been revised effective 01 April 2026. In recognition of your stellar technical contributions as ${designation}, your new Annual Cost to Company (CTC) has been updated to ₹${ctcLakhs} LPA.\n\nYour revised monthly gross salary and structured allowances are available on the PayScale portal.\n\nWe look forward to your continued leadership and high impact.\n\nSincerely,\nPeople Operations & Compensation Team\n${companyName}`;
    navigator.clipboard.writeText(text);
    toast.success('Salary increment letter copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Sub-Navigation Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('payslip')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'payslip'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📄 Formal Payslip Generator
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('structure')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'structure'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🧱 Salary Structure Builder
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('compare')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'compare'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚖️ Offer Comparison Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('increment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'increment'
              ? 'bg-white text-[#2563EB] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ✉️ Increment Letter Template
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. FORMAL PAYSLIP GENERATOR (PRINTABLE / PDF COMPLIANT)
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'payslip' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-9 text-xs font-semibold rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employee Name</label>
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="h-9 text-xs font-semibold rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Designation</label>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="h-9 text-xs font-semibold rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePrint}
                className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>

          {/* PRINTABLE PAYSLIP CONTAINER */}
          <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 shadow-md max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-800 gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{companyName}</h1>
                <p className="text-xs text-slate-500 font-medium">Registered Office: Prestige Tech Park, Outer Ring Road, Bengaluru - 560103</p>
                <div className="text-xs font-bold text-[#2563EB] mt-1">PAYSLIP FOR THE MONTH OF {payPeriod.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                  CONFIDENTIAL
                </span>
              </div>
            </div>

            {/* Employee Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Employee Name</span>
                <span className="font-bold text-slate-900">{employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Employee ID</span>
                <span className="font-bold text-slate-900">{employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Designation</span>
                <span className="font-bold text-slate-900">{designation}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Department</span>
                <span className="font-bold text-slate-900">{department}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">PAN Number</span>
                <span className="font-bold text-slate-900">{panNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">UAN (EPFO)</span>
                <span className="font-bold text-slate-900">{uanNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Bank Account</span>
                <span className="font-bold text-slate-900">{bankAccount}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Days Worked</span>
                <span className="font-bold text-slate-900">30 / 30 Days</span>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Column */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 font-black text-xs text-slate-800 uppercase tracking-wider flex justify-between">
                  <span>Earnings</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2 flex justify-between">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-bold text-slate-900">₹{(breakdown?.monthly?.basic ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-4 py-2 flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-bold text-slate-900">₹{(breakdown?.monthly?.hra ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-4 py-2 flex justify-between">
                    <span className="text-slate-600">Special / Flexi Allowance</span>
                    <span className="font-bold text-slate-900">₹{(breakdown?.monthly?.specialAllowance ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-4 py-2.5 bg-blue-50/70 font-black flex justify-between text-slate-900">
                    <span>Total Gross Earnings (A)</span>
                    <span className="text-[#2563EB]">₹{(breakdown?.monthly?.gross ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 font-black text-xs text-slate-800 uppercase tracking-wider flex justify-between">
                  <span>Deductions</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2 flex justify-between">
                    <span className="text-slate-600">Provident Fund (EPF Employee 12%)</span>
                    <span className="font-bold text-slate-900">₹{(breakdown?.monthly?.pfEmployee ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-4 py-2 flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT Karnataka)</span>
                    <span className="font-bold text-slate-900">₹{(breakdown?.monthly?.professionalTax ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-4 py-2 flex justify-between">
                    <span className="text-slate-600">TDS / Income Tax (New Regime)</span>
                    <span className="font-bold text-slate-900">₹{(breakdown?.monthly?.incomeTaxTds ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-4 py-2.5 bg-red-50/70 font-black flex justify-between text-slate-900">
                    <span>Total Deductions (B)</span>
                    <span className="text-red-600">₹{(breakdown?.monthly?.totalDeductions ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NET SALARY HIGHLIGHT */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-[#2563EB] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Net Take-Home Pay (A - B)</span>
                <div className="text-2xl font-black text-[#2563EB]">
                  ₹{(breakdown?.monthly?.netInHand ?? 0).toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1 capitalize">
                  In Words: <em>{numberToIndianWords(breakdown?.monthly?.netInHand ?? 0)}</em>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div>Direct Credit to Bank A/c</div>
                <div className="font-bold text-slate-900">Value Date: 31 March 2026</div>
              </div>
            </div>

            {/* Footer Signoff */}
            <div className="pt-6 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
              <span>This is a computer-generated salary slip and does not require a physical signature.</span>
              <span>Generated via TalentXcel PayScale OS</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SALARY STRUCTURE BUILDER
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'structure' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Enterprise CTC Architecture & Structure Builder</h3>
            <p className="text-xs text-slate-500 mt-0.5">Design a compliant CTC distribution that maximizes tax efficiency and preserves employer statutory limits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">CTC Parameters</h4>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Annual CTC (LPA)</label>
                <Input
                  type="number"
                  value={ctcLakhs}
                  onChange={(e) => setCtcLakhs(parseFloat(e.target.value) || 0)}
                  className="font-bold rounded-xl"
                />
              </div>
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Annual Base:</span>
                  <span className="font-bold text-slate-900">₹{(ctcLakhs * 100000).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Average:</span>
                  <span className="font-bold text-slate-900">₹{Math.round((ctcLakhs * 100000) / 12).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Salary Component</th>
                    <th className="p-3">% of CTC</th>
                    <th className="p-3 text-right">Monthly (₹)</th>
                    <th className="p-3 text-right">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Basic Salary</td>
                    <td className="p-3 text-slate-500">50.0%</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.monthly?.basic ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.annual?.basic ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">House Rent Allowance (HRA)</td>
                    <td className="p-3 text-slate-500">25.0%</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.monthly?.hra ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.annual?.hra ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Special Allowance</td>
                    <td className="p-3 text-slate-500">~15.2%</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.monthly?.specialAllowance ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.annual?.specialAllowance ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Employer EPF (12% of Basic)</td>
                    <td className="p-3 text-slate-500">6.0%</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.monthly?.pfEmployer ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.annual?.pfEmployer ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Gratuity (Statutory 4.81%)</td>
                    <td className="p-3 text-slate-500">2.4%</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.monthly?.gratuity ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{(breakdown?.annual?.gratuity ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-blue-50 font-black text-slate-900">
                    <td className="p-3">Total Cost to Company (CTC)</td>
                    <td className="p-3 text-[#2563EB]">100%</td>
                    <td className="p-3 text-right text-[#2563EB]">₹{(breakdown?.monthly?.ctc ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right text-[#2563EB]">₹{(breakdown?.annual?.ctc ?? 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. OFFER COMPARISON MATRIX
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'compare' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Side-by-Side Employment Offer Evaluation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Compare two competing job offers on real net take-home pay, joining bonuses, and actual wealth accumulation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OFFER A */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Offer A</span>
                <Badge className="bg-slate-100 text-slate-700">Baseline</Badge>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company / Role</label>
                <Input value={offerACompany} onChange={(e) => setOfferACompany(e.target.value)} className="h-8 text-xs font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Annual CTC (LPA)</label>
                <Input type="number" value={offerACtc} onChange={(e) => setOfferACtc(parseFloat(e.target.value) || 0)} className="h-8 text-xs font-bold" />
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Monthly:</span>
                  <span className="font-bold">₹{(breakdownA?.monthly?.gross ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly TDS / Tax:</span>
                  <span className="font-bold text-red-600">-₹{(breakdownA?.monthly?.incomeTaxTds ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t">
                  <span>Net Monthly In-Hand:</span>
                  <span className="text-[#2563EB] text-sm">₹{(breakdownA?.monthly?.netInHand ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* OFFER B */}
            <div className="border-2 border-[#2563EB] bg-blue-50/20 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                <span className="text-xs font-black uppercase tracking-wider text-[#2563EB]">Offer B (Competing)</span>
                <Badge className="bg-[#2563EB] text-white">Target Offer</Badge>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company / Role</label>
                <Input value={offerBCompany} onChange={(e) => setOfferBCompany(e.target.value)} className="h-8 text-xs font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Annual CTC (LPA)</label>
                  <Input type="number" value={offerBCtc} onChange={(e) => setOfferBCtc(parseFloat(e.target.value) || 0)} className="h-8 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Joining Bonus (₹)</label>
                  <Input type="number" value={offerBJoiningBonus} onChange={(e) => setOfferBJoiningBonus(parseInt(e.target.value) || 0)} className="h-8 text-xs font-bold" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Monthly:</span>
                  <span className="font-bold">₹{(breakdownB?.monthly?.gross ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly TDS / Tax:</span>
                  <span className="font-bold text-red-600">-₹{(breakdownB?.monthly?.incomeTaxTds ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t">
                  <span>Net Monthly In-Hand:</span>
                  <span className="text-[#2563EB] text-sm">₹{(breakdownB?.monthly?.netInHand ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DELTA SUMMARY BANNER */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">
                  Offer B Delivers +{Math.round(((offerBCtc - offerACtc) / Math.max(1, offerACtc)) * 100)}% CTC Hike
                </h4>
                <p className="text-xs text-emerald-800">
                  You pocket an additional <strong>+₹{Math.max(0, (breakdownB?.monthly?.netInHand ?? 0) - (breakdownA?.monthly?.netInHand ?? 0)).toLocaleString('en-IN')}</strong> in liquid in-hand cash every month.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-emerald-700">1st Year Cash Delta</span>
              <div className="text-xl font-black text-emerald-900">
                +₹{Math.max(0, ((breakdownB?.monthly?.netInHand ?? 0) - (breakdownA?.monthly?.netInHand ?? 0)) * 12 + (offerBJoiningBonus ?? 0)).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SALARY INCREMENT LETTER TEMPLATE
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'increment' && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Formal Salary Increment & Revision Letter</h3>
              <p className="text-xs text-slate-500 mt-0.5">Executive template ready for HR teams or personal performance appraisal records.</p>
            </div>
            <Button
              onClick={handleCopyIncrementLetter}
              className="bg-[#2563EB] text-white font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Template</span>
            </Button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
{`Date: 15 March 2026

Dear ${employeeName},

Subject: Annual Compensation Revision & Promotion Letter

On behalf of ${companyName}, we are pleased to inform you that your annual compensation has been revised effective 01 April 2026. In recognition of your stellar technical contributions as ${designation}, your new Annual Cost to Company (CTC) has been updated to ₹${ctcLakhs} LPA.

Your revised monthly gross salary and structured allowances are available on the PayScale portal.

We look forward to your continued leadership and high impact.

Sincerely,
People Operations & Compensation Team
${companyName}`}
          </div>
        </div>
      )}
    </div>
  );
};
