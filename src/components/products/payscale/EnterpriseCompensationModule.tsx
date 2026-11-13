// src/components/products/payscale/EnterpriseCompensationModule.tsx
// Module 7: Enterprise Compensation Management (Grade Bands L1–L7, Department Analytics, Pay-Equity & Compa-Ratio)

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Download,
  Sparkles,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PayGradeBand {
  level: string;
  title: string;
  minCtc: number;
  midCtc: number;
  maxCtc: number;
  headcount: number;
  avgCompaRatio: number;
}

const DEFAULT_GRADE_BANDS: PayGradeBand[] = [
  { level: 'L1', title: 'Graduate Trainee / Associate', minCtc: 4.5, midCtc: 6.5, maxCtc: 8.5, headcount: 142, avgCompaRatio: 0.98 },
  { level: 'L2', title: 'Software Engineer / Specialist', minCtc: 8.0, midCtc: 12.5, maxCtc: 16.0, headcount: 310, avgCompaRatio: 1.02 },
  { level: 'L3', title: 'Senior Engineer / Team Lead', minCtc: 15.0, midCtc: 22.0, maxCtc: 28.0, headcount: 185, avgCompaRatio: 0.99 },
  { level: 'L4', title: 'Staff Engineer / Engineering Manager', minCtc: 26.0, midCtc: 35.0, maxCtc: 45.0, headcount: 68, avgCompaRatio: 1.04 },
  { level: 'L5', title: 'Principal Architect / Director', minCtc: 42.0, midCtc: 55.0, maxCtc: 70.0, headcount: 24, avgCompaRatio: 0.97 },
  { level: 'L6', title: 'Vice President / Head of Dept', minCtc: 65.0, midCtc: 85.0, maxCtc: 110.0, headcount: 9, avgCompaRatio: 1.01 },
  { level: 'L7', title: 'Chief Technology Officer / CXO', minCtc: 100.0, midCtc: 140.0, maxCtc: 190.0, headcount: 4, avgCompaRatio: 1.00 }
];

const DEPARTMENT_METRICS = [
  { name: 'Core Engineering', headcount: 382, annualPayrollCr: 68.4, compaRatio: 1.02, equityStatus: 'Optimal' },
  { name: 'Product & Design', headcount: 94, annualPayrollCr: 21.6, compaRatio: 0.99, equityStatus: 'Optimal' },
  { name: 'Sales & Enterprise BD', headcount: 145, annualPayrollCr: 32.8, compaRatio: 1.05, equityStatus: 'Watch' },
  { name: 'Operations & Support', headcount: 88, annualPayrollCr: 9.8, compaRatio: 0.96, equityStatus: 'Under Band' },
  { name: 'People Ops & HR', headcount: 33, annualPayrollCr: 5.4, compaRatio: 0.98, equityStatus: 'Optimal' }
];

export const EnterpriseCompensationModule: React.FC = () => {
  const [gradeBands, setGradeBands] = useState<PayGradeBand[]>(DEFAULT_GRADE_BANDS);
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const totalHeadcount = gradeBands.reduce((acc, g) => acc + g.headcount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            <span>B2B Enterprise Compensation Workspace • HR & C-Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Enterprise Grade Bands, Department Payroll & Pay-Equity Audits
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage organization-wide salary architecture (L1 to L7), evaluate compa-ratios, prevent pay discrepancies, and budget annual compensation reviews across departments.
          </p>
        </div>
      </div>

      {/* Top Organization Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active Workforce</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalHeadcount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across 7 Pay Bands</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Annual Payroll</span>
          <div className="text-2xl font-black text-[#2563EB] mt-1">₹138.0 Cr</div>
          <div className="text-[11px] text-slate-500 mt-0.5">₹11.5 Cr Monthly Burn</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Org Compa-Ratio</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">1.002</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Balanced to Market Midpoint</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Internal Pay Equity</span>
          <div className="text-2xl font-black text-slate-900 mt-1">98.4%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero Gender/Role Outliers</div>
        </div>
      </div>

      {/* Grade Bands Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Standardized Salary Band Structure (L1 to L7)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Defined min, mid, and max limits for each career seniority tier.</p>
          </div>
          <Button
            size="sm"
            onClick={() => toast.success('Salary bands exported as CSV')}
            className="bg-[#2563EB] text-white text-xs font-bold rounded-xl h-8 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bands</span>
          </Button>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Standard Title</th>
                <th className="p-3.5 text-right">Min (₹)</th>
                <th className="p-3.5 text-right">Midpoint (₹)</th>
                <th className="p-3.5 text-right">Max (₹)</th>
                <th className="p-3.5 text-center">Headcount</th>
                <th className="p-3.5 text-center">Compa-Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradeBands.map((band) => (
                <tr key={band.level} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-black text-blue-600">{band.level}</td>
                  <td className="p-3.5 font-bold text-slate-900">{band.title}</td>
                  <td className="p-3.5 text-right text-slate-600">₹{band.minCtc}L</td>
                  <td className="p-3.5 text-right font-black text-slate-900">₹{band.midCtc}L</td>
                  <td className="p-3.5 text-right text-slate-600">₹{band.maxCtc}L</td>
                  <td className="p-3.5 text-center font-bold text-slate-700">{band.headcount}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      band.avgCompaRatio >= 0.95 && band.avgCompaRatio <= 1.05
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {band.avgCompaRatio}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900">Department-wise Compensation Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">Budget utilization and market equity alignment by team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEPARTMENT_METRICS.map((dept, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900">{dept.name}</h4>
                <Badge className={dept.equityStatus === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                  {dept.equityStatus}
                </Badge>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Headcount:</span>
                  <span className="font-bold text-slate-900">{dept.headcount} employees</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Payroll:</span>
                  <span className="font-bold text-[#2563EB]">₹{dept.annualPayrollCr} Cr</span>
                </div>
                <div className="flex justify-between">
                  <span>Compa-Ratio:</span>
                  <span className="font-bold text-slate-900">{dept.compaRatio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
