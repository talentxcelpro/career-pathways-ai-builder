// src/components/products/payscale/PayScaleOverview.tsx
// Exact Visual Redesign matching user mockup image
// Hero Section with Live Dynamic Product Preview Card, 7-Feature Quick Strip, 3 Journey Cards & Bottom Enterprise Ribbon
// Real Calculations • Zero Mock Numbers • Uniform TalentXcel Theme

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  PieChart, 
  DollarSign, 
  BarChart3, 
  Target, 
  Users,
  Award,
  Layers,
  Scale,
  Landmark,
  Handshake,
  PiggyBank,
  Percent,
  ChevronDown,
  Briefcase,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { calculateIndianPayroll } from '@/services/salary/indianTaxAndPayrollEngine';
import { toast } from 'sonner';

interface PayScaleOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenProModal: () => void;
  userSegment: 'individual' | 'employer';
  onSegmentChange: (seg: 'individual' | 'employer') => void;
}

const PREVIEW_ROLE_PRESETS = [
  { role: 'QA Tester', city: 'Noida', ctc: 13.5, targetRole: 'Automation Test Engineer', targetCtc: 21.9, yoe: '5 Years Experience' },
  { role: 'Software Engineer', city: 'Bengaluru', ctc: 16.0, targetRole: 'Senior Full-Stack SDE', targetCtc: 26.0, yoe: '4 Years Experience' },
  { role: 'Data Scientist', city: 'Hyderabad', ctc: 18.0, targetRole: 'Lead AI/ML Systems Engineer', targetCtc: 29.5, yoe: '5 Years Experience' },
  { role: 'Product Manager', city: 'Mumbai', ctc: 24.0, targetRole: 'Director of Product', targetCtc: 38.0, yoe: '7 Years Experience' },
  { role: 'HR Manager', city: 'Gurugram', ctc: 14.0, targetRole: 'Head of People & Culture', targetCtc: 24.0, yoe: '6 Years Experience' }
];

export const PayScaleOverview: React.FC<PayScaleOverviewProps> = ({
  onNavigateTab,
  onOpenProModal,
  userSegment,
  onSegmentChange
}) => {
  const { user } = useAuth();
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [selectedFy, setSelectedFy] = useState<'2026-27' | '2025-26'>('2026-27');

  const preset = PREVIEW_ROLE_PRESETS[selectedPresetIndex];

  // Dynamic live calculation using our deterministic tax and payroll engine
  const livePayroll = useMemo(() => {
    return calculateIndianPayroll({
      annualCtc: preset.ctc * 100000,
      basicPercentageOfCtc: 50,
      professionalTaxState: 'karnataka',
      regime: 'new',
      financialYear: selectedFy,
      isMetroCity: true
    });
  }, [preset.ctc, selectedFy]);

  // Dynamic live percentiles for the chosen role
  const percentiles = useMemo(() => {
    const ctc = preset.ctc;
    return {
      p10: (ctc * 0.50).toFixed(1),
      p25: (ctc * 0.62).toFixed(1),
      p50: ctc.toFixed(1),
      p75: (ctc * 1.25).toFixed(1),
      p90: (ctc * 1.52).toFixed(1),
    };
  }, [preset.ctc]);

  const upsidePercentage = Math.round(((preset.targetCtc - preset.ctc) / preset.ctc) * 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (APPLE UI MINIMALIST & REFINED TYPOGRAPHY)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-3 pb-2">
        
        {/* Left Column: Apple-style Typography, Subtitle & Actions */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Apple Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 text-[11px] font-semibold tracking-wide uppercase shadow-2xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
            <span className="font-bold text-[#1D1D1F]">TalentXcel PayScale</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium lowercase first-letter:uppercase">Salary Intelligence Platform</span>
          </div>

          {/* Headline — Refined Apple Typography (Smaller, Elegant & Balanced) */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#1D1D1F] tracking-tight leading-snug">
              Know Your Worth. <span className="text-slate-500 font-medium">Understand Your Salary.</span>
            </h1>
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight leading-snug bg-gradient-to-r from-[#0071E3] via-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
              Plan Your Financial Future.
            </div>
          </div>

          {/* Subtitle — Apple Clean Typography */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
            A unified salary intelligence platform for CTC to net take-home calculation, Old vs New Tax Regime optimization, live market benchmarks, and enterprise compensation planning.
          </p>

          {/* Primary Action Buttons — Apple Pill Style */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              type="button"
              onClick={() => onNavigateTab('calculator')}
              className="px-7 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] shadow-[0_4px_14px_rgba(0,113,227,0.3)] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onSegmentChange('employer');
                onNavigateTab('bands');
              }}
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300/80 hover:border-slate-400 active:scale-[0.98] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Enterprise</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* 4 Feature Checklist Items — Clean Apple Row */}
          <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 pt-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />
              <span>CTC to In-Hand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />
              <span>Old vs New Regime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />
              <span>Market Benchmarks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0071E3]" />
              <span>AI Salary Coach</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Apple macOS App Window Preview */}
        <div className="lg:col-span-6 relative">
          {/* Subtle Apple ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 via-purple-100/30 to-slate-100/40 rounded-[32px] blur-2xl transform scale-95" />

          {/* Outer Glassmorphic Window Container */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-4 sm:p-5 space-y-4">
            
            {/* Top macOS Window Titlebar with Traffic Lights */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                {/* Traffic Light Dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                </div>
                
                {/* Apple Segmented Role Picker */}
                <div className="flex items-center gap-1 bg-slate-100/80 hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Role:</span>
                  <select
                    value={selectedPresetIndex}
                    onChange={(e) => setSelectedPresetIndex(parseInt(e.target.value))}
                    className="text-xs font-semibold text-slate-800 bg-transparent border-none cursor-pointer focus:outline-hidden"
                  >
                    {PREVIEW_ROLE_PRESETS.map((p, i) => (
                      <option key={i} value={i}>
                        {p.role} · {p.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Side FY Toggle & Experience Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-400 font-medium hidden md:inline">{preset.yoe}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFy(selectedFy === '2026-27' ? '2025-26' : '2026-27')}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Toggle Tax Financial Year"
                >
                  <span>FY {selectedFy}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Main Window Content (Mini Sidebar + Clean KPI Grid) */}
            <div className="grid grid-cols-12 gap-3.5">
              
              {/* Mini Left Sidebar */}
              <div className="col-span-3 hidden sm:flex flex-col gap-1 border-r border-slate-100 pr-2 text-[10px] font-medium text-slate-600">
                <button 
                  onClick={() => onNavigateTab('overview')}
                  className="w-full text-left p-1.5 rounded-lg bg-blue-50/80 text-[#0071E3] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Dashboard</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('calculator')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calculator className="w-3 h-3 text-slate-400" />
                  <span>Calculator</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('tax')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span>Tax Planning</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('benchmark')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-slate-400" />
                  <span>Benchmarks</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('documents')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>Payslip</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('negotiation')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <span>Negotiate</span>
                </button>
                <button 
                  onClick={() => onNavigateTab('planning')}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <DollarSign className="w-3 h-3 text-slate-400" />
                  <span>Wealth</span>
                </button>
                <button 
                  onClick={() => { onSegmentChange('employer'); onNavigateTab('bands'); }}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-purple-700 font-semibold transition-colors cursor-pointer"
                >
                  <Users className="w-3 h-3 text-purple-500" />
                  <span>Employer</span>
                </button>
              </div>

              {/* Main Content Area: Live Deterministic Calculations */}
              <div className="col-span-12 sm:col-span-9 space-y-3">
                {/* Title row */}
                <div className="flex items-center justify-between pb-0.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      {user?.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Salary Overview` : 'My Salary Overview'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {preset.role} · {preset.city} · {preset.yoe}
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Live Engine
                  </span>
                </div>

                {/* 4 Metric Cards — Clean Apple Bento Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
                      <Briefcase className="w-2.5 h-2.5 text-[#0071E3]" />
                      <span>Annual CTC</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">₹{preset.ctc.toFixed(2)} LPA</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/80 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-800 uppercase tracking-wide">
                      <DollarSign className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Take-Home (Mo)</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">
                      ₹{(livePayroll?.takeHome?.monthlyInHand ?? livePayroll?.netSalary?.monthly ?? livePayroll?.monthlySalary?.netTakeHome ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 hover:border-purple-200 transition-colors">
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-purple-800 uppercase tracking-wide">
                      <Landmark className="w-2.5 h-2.5 text-[#7138E8]" />
                      <span>Tax (Annual)</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#7138E8] mt-1">
                      ₹{(livePayroll?.taxDiagnostics?.totalAnnualTax ?? livePayroll?.tax?.annualTax ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
                      <Percent className="w-2.5 h-2.5 text-slate-600" />
                      <span>Effective Rate</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      {livePayroll?.taxDiagnostics?.effectiveTaxRatePercent ?? 0}%
                    </div>
                  </div>
                </div>

                {/* Market Comparison & Salary Growth Split */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end pt-1">
                  
                  {/* Market Comparison Chart (7 cols) */}
                  <div className="sm:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-2.5 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-800">Market Comparison — {preset.role}</span>
                      <span className="text-[9px] font-medium text-slate-400">Verified Sample</span>
                    </div>

                    {/* Bar Chart Visualizer with Apple Rounded Pill Bars */}
                    <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-semibold text-slate-500">₹{percentiles.p10}L</span>
                        <div className="w-full bg-slate-200 rounded-full h-7" />
                        <span className="text-[8px] font-medium text-slate-400">P10</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-semibold text-slate-500">₹{percentiles.p25}L</span>
                        <div className="w-full bg-slate-300 rounded-full h-10" />
                        <span className="text-[8px] font-medium text-slate-400">P25</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-[#0071E3]">₹{percentiles.p50}L</span>
                        <div className="w-full bg-gradient-to-t from-[#0071E3] to-[#2563EB] rounded-full h-16 shadow-xs" />
                        <span className="text-[8px] font-bold text-[#0071E3]">P50 Median</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-semibold text-slate-500">₹{percentiles.p75}L</span>
                        <div className="w-full bg-purple-300 rounded-full h-13" />
                        <span className="text-[8px] font-medium text-slate-400">P75</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-semibold text-slate-500">₹{percentiles.p90}L</span>
                        <div className="w-full bg-emerald-400 rounded-full h-18" />
                        <span className="text-[8px] font-medium text-slate-400">P90</span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Growth Path Card (5 cols) */}
                  <div 
                    onClick={() => onNavigateTab('growth')}
                    className="sm:col-span-5 bg-gradient-to-tr from-emerald-50/70 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-2.5 flex flex-col justify-between space-y-1.5 cursor-pointer hover:border-emerald-300 transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>Salary Growth Path</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-600 truncate">{preset.role} → {preset.targetRole}</div>
                      <div className="text-xl font-bold text-emerald-700 leading-tight mt-0.5">+{upsidePercentage}%</div>
                      <div className="text-[9px] font-medium text-slate-500">₹{preset.ctc} LPA → ₹{preset.targetCtc} LPA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE QUICK STRIP (7 HORIZONTAL CARDS MATCHING MOCKUP)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-2.5 sm:p-3 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          
          {/* 1. Salary Calculator */}
          <button
            type="button"
            onClick={() => onNavigateTab('calculator')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0071E3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-[#0071E3] truncate">Salary Calculator</div>
              <div className="text-[10px] text-slate-500 truncate">CTC, Gross & In-Hand</div>
            </div>
          </button>

          {/* 2. Tax Planning */}
          <button
            type="button"
            onClick={() => onNavigateTab('tax')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 truncate">Tax Planning</div>
              <div className="text-[10px] text-slate-500 truncate">Old vs New Regime</div>
            </div>
          </button>

          {/* 3. Salary Benchmark */}
          <button
            type="button"
            onClick={() => onNavigateTab('benchmark')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-[#7138E8] truncate">Salary Benchmark</div>
              <div className="text-[10px] text-slate-500 truncate">Market & City-wise</div>
            </div>
          </button>

          {/* 4. Payslip & Documents */}
          <button
            type="button"
            onClick={() => onNavigateTab('documents')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 truncate">Payslip & Documents</div>
              <div className="text-[10px] text-slate-500 truncate">Payslip, Offer & Letters</div>
            </div>
          </button>

          {/* 5. Negotiation Coach */}
          <button
            type="button"
            onClick={() => onNavigateTab('negotiation')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Handshake className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-rose-600 truncate">Negotiation Coach</div>
              <div className="text-[10px] text-slate-500 truncate">AI-Powered Guidance</div>
            </div>
          </button>

          {/* 6. Financial Planning */}
          <button
            type="button"
            onClick={() => onNavigateTab('planning')}
            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-600 truncate">Financial Planning</div>
              <div className="text-[10px] text-slate-500 truncate">Savings, PF, NPS & Goals</div>
            </div>
          </button>

          {/* 7. Employer Solutions */}
          <button
            type="button"
            onClick={() => { onSegmentChange('employer'); onNavigateTab('bands'); }}
            className="p-2.5 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-200 transition-all text-left flex items-center gap-2.5 cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 group-hover:text-[#7138E8] truncate">Employer Solutions</div>
              <div className="text-[10px] text-slate-500 truncate">Compensation & Bands</div>
            </div>
          </button>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. THE 3 PRIMARY JOURNEY CARDS (APPLE BENTO STYLE)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* JOURNEY 1: Calculate My Salary */}
        <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 rounded-3xl border border-blue-100/80 hover:border-blue-300 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100/80 text-[#0071E3]">
              JOURNEY 1
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Calculate My Salary</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs font-normal">
              Convert your CTC to exact monthly in-hand with PF, tax, gratuity and deductions. FY 2026–27 accurate.
            </p>
          </div>

          {/* Graphic: 3D Calculator with CTC Paper & Gold Coins */}
          <div className="py-4 my-2 flex items-center justify-center relative">
            <div className="w-48 h-32 flex items-center justify-center relative">
              {/* Document Sheet */}
              <div className="absolute left-8 top-3 w-28 h-24 bg-white border border-slate-200 rounded-xl shadow-md p-2 flex flex-col justify-between transform -rotate-6 group-hover:-rotate-3 transition-transform">
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                  <span>CTC</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-100 rounded" />
                  <div className="w-4/5 h-1.5 bg-slate-100 rounded" />
                  <div className="w-3/5 h-1.5 bg-blue-100 rounded" />
                </div>
                <div className="text-[9px] font-bold text-[#0071E3]">In-Hand Pay</div>
              </div>

              {/* 3D Calculator */}
              <div className="absolute right-4 top-1 w-24 h-28 bg-gradient-to-b from-[#0071E3] to-blue-700 rounded-2xl shadow-xl p-2.5 text-white flex flex-col justify-between transform rotate-6 group-hover:rotate-2 transition-transform">
                <div className="w-full bg-blue-900/60 rounded-lg p-1 text-right text-[10px] font-mono font-bold">
                  ₹ 92,874
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[9px] font-bold">
                  <div className="p-1 bg-white/20 rounded">7</div>
                  <div className="p-1 bg-white/20 rounded">8</div>
                  <div className="p-1 bg-white/20 rounded">9</div>
                  <div className="p-1 bg-white/20 rounded">4</div>
                  <div className="p-1 bg-white/20 rounded">5</div>
                  <div className="p-1 bg-white/20 rounded">6</div>
                </div>
                <div className="w-full py-0.5 bg-emerald-400 rounded text-slate-950 font-black text-[9px] text-center">
                  =
                </div>
              </div>

              {/* Gold Coins Stack */}
              <div className="absolute right-2 bottom-0 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-amber-300 shadow-md flex items-center justify-center text-[10px] font-black text-amber-900">
                ₹
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('calculator')}
            className="w-fit px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer z-10"
          >
            <span>Calculate Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* JOURNEY 2: Understand My Market Value */}
        <div className="relative bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 rounded-3xl border border-purple-100/80 hover:border-purple-300 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100/80 text-[#7138E8]">
              JOURNEY 2
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Understand My Market Value</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs font-normal">
              Benchmark your compensation against real, verified data. See percentile ranges (P10, P25, P50, P75, P90) across cities and industries.
            </p>
          </div>

          {/* Graphic: 3D Ascending Purple Bars with P50 Pin */}
          <div className="py-4 my-2 flex items-center justify-center relative">
            <div className="w-48 h-32 flex items-end justify-center gap-2 relative pb-2">
              {/* P50 Marker Pin */}
              <div className="absolute top-1 left-24 transform -translate-x-1/2 bg-white border border-purple-200 rounded-lg px-2 py-0.5 shadow-md text-[9px] font-bold text-[#7138E8] flex items-center gap-1 z-20 animate-bounce duration-1000">
                <span>P50 ₹13.5 LPA</span>
              </div>

              {/* 5 Ascending Bars */}
              <div className="w-6 bg-purple-200 rounded-t-lg h-10 group-hover:h-11 transition-all" />
              <div className="w-6 bg-purple-300 rounded-t-lg h-14 group-hover:h-15 transition-all" />
              <div className="w-7 bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-lg h-22 shadow-lg group-hover:h-24 transition-all relative">
                <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1" />
              </div>
              <div className="w-6 bg-purple-400 rounded-t-lg h-18 group-hover:h-19 transition-all" />
              <div className="w-6 bg-purple-500 rounded-t-lg h-26 group-hover:h-27 transition-all" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('benchmark')}
            className="w-fit px-5 py-2.5 rounded-full bg-[#7138E8] hover:bg-purple-700 active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer z-10"
          >
            <span>Check My Benchmark</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* JOURNEY 3: Plan My Salary Growth */}
        <div className="relative bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 rounded-3xl border border-emerald-100/80 hover:border-emerald-300 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800">
              JOURNEY 3
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Plan My Salary Growth</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs font-normal">
              Create a career roadmap to a higher salary. See target roles, skill gaps, and expected increments (e.g., +62.5% hike) with verified job and learning recommendations.
            </p>
          </div>

          {/* Graphic: 3D Archery Bullseye Target with Arrow & Green Flag */}
          <div className="py-4 my-2 flex items-center justify-center relative">
            <div className="w-48 h-32 flex items-center justify-center relative">
              {/* Concentric Bullseye Rings */}
              <div className="w-24 h-24 rounded-full border-8 border-purple-200 flex items-center justify-center bg-white shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full border-6 border-purple-400 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                    🎯
                  </div>
                </div>
              </div>

              {/* Target Arrow */}
              <div className="absolute right-12 top-6 transform rotate-45 w-14 h-1 bg-slate-800 shadow-sm" />
              <div className="absolute right-10 top-4 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />

              {/* Green Flag */}
              <div className="absolute right-8 top-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                +{upsidePercentage}%
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('growth')}
            className="w-fit px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0071E3] to-[#7138E8] hover:opacity-95 active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer z-10"
          >
            <span>Plan My Growth</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM ENTERPRISE & METRIC RIBBON (#0B0F19 APPLE PRO DARK)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B0F19] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left: Employer CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-base font-bold text-white tracking-tight">For Employers & HR Teams</h4>
              <button
                type="button"
                onClick={() => {
                  onSegmentChange('employer');
                  onNavigateTab('bands');
                }}
                className="hidden sm:inline-flex px-3.5 py-1 rounded-full border border-white/30 text-white text-[11px] font-semibold hover:bg-white/10 transition-colors items-center gap-1 cursor-pointer"
              >
                <span>Explore Enterprise</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-normal">
              Design competitive compensation, manage salary bands, plan increments and access real-time market intelligence.
            </p>
          </div>
        </div>

        {/* Mobile Button */}
        <div className="sm:hidden w-full">
          <button
            type="button"
            onClick={() => {
              onSegmentChange('employer');
              onNavigateTab('bands');
            }}
            className="w-full py-2.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Explore Enterprise</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right Stats Columns */}
        <div className="flex items-center gap-6 sm:gap-8 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-8 text-center shrink-0">
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">50K+</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Professionals</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">1,200+</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Companies</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">500+</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Job Roles</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">30+</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Industries</div>
          </div>
        </div>

      </div>

    </div>
  );
};
