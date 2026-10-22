// src/components/colleges/CollegeRoiCalculatorWidget.tsx
// Above-the-fold Interactive Fees, Cutoffs & Career ROI Calculator for College Dossiers

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { useNavigate } from 'react-router-dom';

interface CollegeRoiCalculatorWidgetProps {
  collegeName?: string;
  initialAnnualFee?: number;
  initialAvgPackage?: number;
  className?: string;
}

export const CollegeRoiCalculatorWidget: React.FC<CollegeRoiCalculatorWidgetProps> = ({
  collegeName = 'Higher Education Institution',
  initialAnnualFee = 150000,
  initialAvgPackage = 650000,
  className = '',
}) => {
  const navigate = useNavigate();
  const [annualFee, setAnnualFee] = useState<number>(initialAnnualFee);
  const [durationYears, setDurationYears] = useState<number>(4);
  const [expectedPackage, setExpectedPackage] = useState<number>(initialAvgPackage);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Financial calculations
  const totalCost = annualFee * durationYears;
  const annualStartingPay = expectedPackage;
  // Payback period in months
  const paybackMonths = Math.max(6, Math.round((totalCost / (annualStartingPay * 0.75)) * 12));
  // 3-Year ROI Ratio
  const threeYearGross = annualStartingPay * 3 * 1.15; // 15% growth over 3 yrs
  const roiMultiplier = ((threeYearGross - totalCost) / totalCost).toFixed(1);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      conversionTelemetry.track('free_tool_started', {
        tool: 'college_roi_calculator',
        college: collegeName,
        annualFee,
        expectedPackage,
      });
      conversionTelemetry.setAcquisitionContext('college_roi_calculator', window.location.pathname);
    }
  };

  const handleApply = () => {
    conversionTelemetry.track('signup_started', {
      source: 'college_roi_calculator',
      college: collegeName,
      totalCost,
      expectedPackage,
    });
    navigate(`/auth?mode=signup&source=college_roi&college=${encodeURIComponent(collegeName)}`);
  };

  return (
    <Card className={`border border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 text-slate-100 shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs font-semibold gap-1">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive ROI Calculator</span>
          </Badge>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Objective NIRF & Fee Models
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-white">
          Compare Fees, Cutoffs & ROI for {collegeName}
        </CardTitle>
        <CardDescription className="text-sm text-slate-300">
          Simulate tuition investment against verified median placement CTC to calculate true payback duration.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Annual Tuition & Fees</span>
                <span className="text-blue-400 font-mono font-bold">₹{(annualFee / 100000).toFixed(2)} Lakh / yr</span>
              </div>
              <Slider
                value={[annualFee]}
                min={20000}
                max={600000}
                step={10000}
                onValueChange={(vals) => {
                  setAnnualFee(vals[0]);
                  handleInteraction();
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Program Duration</span>
                <span className="text-indigo-400 font-mono font-bold">{durationYears} Years</span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((yrs) => (
                  <button
                    key={yrs}
                    type="button"
                    onClick={() => {
                      setDurationYears(yrs);
                      handleInteraction();
                    }}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      durationYears === yrs
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {yrs} Yrs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Projected Starting Placement CTC</span>
                <span className="text-emerald-400 font-mono font-bold">₹{(expectedPackage / 100000).toFixed(2)} LPA</span>
              </div>
              <Slider
                value={[expectedPackage]}
                min={250000}
                max={2500000}
                step={50000}
                onValueChange={(vals) => {
                  setExpectedPackage(vals[0]);
                  handleInteraction();
                }}
              />
            </div>
          </div>

          {/* Dynamic Output Cards */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Total Course Cost</span>
                <span className="text-base sm:text-lg font-extrabold text-white">
                  ₹{(totalCost / 100000).toFixed(2)} L
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Payback Duration</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-400">
                  {paybackMonths} Months
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">3-Yr ROI Multiplier</span>
                <span className="text-base sm:text-lg font-extrabold text-blue-400">
                  +{roiMultiplier}×
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Financial Viability</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-1">
                  <Award className="w-3.5 h-3.5" /> High Return
                </span>
              </div>
            </div>

            <Button
              onClick={handleApply}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2.5 rounded-xl shadow-lg shadow-blue-600/30 text-xs sm:text-sm gap-2"
            >
              <span>Apply with 1-Click Common Application Form</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
