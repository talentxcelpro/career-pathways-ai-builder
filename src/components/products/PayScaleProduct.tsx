import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BadgeDollarSign, 
  Calculator, 
  TrendingUp, 
  MapPin, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Percent,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { conversionTelemetry } from '@/utils/conversionTelemetry';

export const PayScaleProduct: React.FC = () => {
  const navigate = useNavigate();
  const [ctcInLakhs, setCtcInLakhs] = useState<number>(12); // Default 12 LPA
  const [selectedCity, setSelectedCity] = useState('Bangalore');

  // New Tax Regime (FY 2024-25 / 2025-26 under Budget 2024 update)
  // Standard Deduction: ₹75,000
  // Slabs: 0-3L: 0%, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
  // Section 87A rebate up to ₹7L taxable income
  const calculateInHand = (annualCtcLakhs: number) => {
    const annualGross = annualCtcLakhs * 100000;
    const standardDeduction = 75000;
    const epfEmployeeAnnual = Math.min(annualGross * 0.12, 1800 * 12 * 2); // Approximate standard EPF
    const taxableIncome = Math.max(0, annualGross - standardDeduction);

    let annualTax = 0;
    if (taxableIncome <= 700000) {
      annualTax = 0; // Full 87A Rebate
    } else {
      if (taxableIncome > 1500000) {
        annualTax += (taxableIncome - 1500000) * 0.30;
        annualTax += 300000 * 0.20; // 12-15L
        annualTax += 200000 * 0.15; // 10-12L
        annualTax += 300000 * 0.10; // 7-10L
        annualTax += 400000 * 0.05; // 3-7L
      } else if (taxableIncome > 1200000) {
        annualTax += (taxableIncome - 1200000) * 0.20;
        annualTax += 200000 * 0.15;
        annualTax += 300000 * 0.10;
        annualTax += 400000 * 0.05;
      } else if (taxableIncome > 1000000) {
        annualTax += (taxableIncome - 1000000) * 0.15;
        annualTax += 300000 * 0.10;
        annualTax += 400000 * 0.05;
      } else if (taxableIncome > 700000) {
        annualTax += (taxableIncome - 700000) * 0.10;
        annualTax += 400000 * 0.05;
      }
      annualTax = annualTax * 1.04; // 4% Health & Education Cess
    }

    const netAnnualInHand = Math.max(0, annualGross - annualTax - epfEmployeeAnnual);
    const monthlyInHand = Math.round(netAnnualInHand / 12);
    const monthlyGross = Math.round(annualGross / 12);
    const monthlyTax = Math.round(annualTax / 12);
    const monthlyDeduction = Math.round(epfEmployeeAnnual / 12);

    return {
      monthlyInHand,
      monthlyGross,
      monthlyTax,
      monthlyDeduction,
      effectiveTaxRate: ((annualTax / annualGross) * 100).toFixed(1)
    };
  };

  const results = calculateInHand(ctcInLakhs);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>PayScale by TalentXcel — Indian In-Hand Salary & Take-Home Calculator</title>
        <meta name="description" content="Calculate your exact monthly in-hand take-home salary from your CTC under the Indian New Tax Regime with standard deductions and city compensation percentiles." />
        <link rel="canonical" href="https://salary.talentxcel.in/" />
      </Helmet>

      {/* Product Banner */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-blue-900/30 to-slate-900 border-b border-emerald-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">PayScale 2026</span>
            <span className="text-slate-400 hidden sm:inline">• Official New Tax Regime (Section 115BAC) In-Hand Calculator</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/analyzer" className="text-slate-300 hover:text-white text-xs font-medium">
              Advanced Analyzer →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero & Interactive Calculator */}
      <section className="px-4 pt-8 pb-12 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 mb-3">
            Free Indian Salary & Tax Calculator
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-3">
            What is Your Real <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Monthly In-Hand Pay</span>?
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            CTC is not what reaches your bank account. Calculate your exact net take-home salary after Indian income tax, standard deduction (₹75k), and EPF.
          </p>
        </div>

        {/* The Calculator Box */}
        <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl shadow-emerald-950/20">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Annual CTC Package:</span>
                </label>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{ctcInLakhs.toFixed(1)} LPA
                </span>
              </div>
              <Slider 
                value={[ctcInLakhs]} 
                min={2} 
                max={60} 
                step={0.5} 
                onValueChange={(val) => setCtcInLakhs(val[0])}
                className="py-4 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>₹2 LPA (Entry)</span>
                <span>₹15 LPA (Mid)</span>
                <span>₹35 LPA (Senior)</span>
                <span>₹60 LPA (Executive)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[4, 6.5, 10, 15, 24, 36].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCtcInLakhs(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    ctcInLakhs === p 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ₹{p} LPA
                </button>
              ))}
            </div>

            {/* Result Display Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-center sm:text-left">
                <div className="text-xs text-emerald-300 font-medium mb-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Monthly In-Hand</span>
                </div>
                <div className="text-3xl font-black text-white">
                  ₹{results.monthlyInHand.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Direct Bank Deposit / Month</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center sm:text-left">
                <div className="text-xs text-slate-400 font-medium mb-1">Monthly Gross Pay</div>
                <div className="text-xl font-bold text-slate-200">
                  ₹{results.monthlyGross.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Pre-deduction baseline</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center sm:text-left">
                <div className="text-xs text-slate-400 font-medium mb-1">Monthly Income Tax (TDS)</div>
                <div className="text-xl font-bold text-amber-400">
                  ₹{results.monthlyTax.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Eff. Tax: {results.effectiveTaxRate}%</div>
              </div>
            </div>

            {/* Conversion CTA */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Want to see what peers with your experience earn in Bangalore vs Pune?
              </div>
              <Button 
                onClick={() => navigate('/auth?mode=signup&intent=salary_benchmark')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto"
              >
                <span>Unlock Full Compensation Benchmark Report</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sourced Data Disclosure */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-400">PayScale</span> is an independent compensation analytics product of TalentXcel.
          </div>
          <div className="flex gap-4">
            <Link to="https://jobs.talentxcel.in" className="hover:text-slate-300">Jobs</Link>
            <Link to="https://resume.talentxcel.in" className="hover:text-slate-300">Resume</Link>
            <Link to="https://passport.talentxcel.in" className="hover:text-slate-300">Passport</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
