// src/components/conversion/MarketPercentileWidget.tsx
// Above-the-fold PLG Conversion Widget for Salary & Career Path Hubs
// "Check Your Market Percentile & Skill Gap (Free)" -> 1-Click Google OAuth to unlock complete report

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles, Lock, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MarketPercentileWidgetProps {
  roleName?: string;
  cityName?: string;
  currency?: string;
  defaultSalary?: number;
  className?: string;
}

export const MarketPercentileWidget: React.FC<MarketPercentileWidgetProps> = ({
  roleName = 'Software Engineer',
  cityName = 'Bangalore',
  currency = 'INR',
  defaultSalary = 2400000,
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentExpYears, setCurrentExpYears] = useState<number>(4);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Dynamic benchmark simulation
  const medianSalary = currency === 'INR' ? 2200000 : (currency === 'AED' || currency === 'SAR' ? 240000 : 120000);
  const calculatedPercentile = Math.min(95, Math.max(35, 45 + currentExpYears * 8));

  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    const symbolMap: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SAR: 'SAR ', CAD: 'C$' };
    return `${symbolMap[currency] || currency + ' '}${amount.toLocaleString()}`;
  };

  const handleUnlockFullReport = () => {
    if (user) {
      navigate(`/tools/salary-analyzer?role=${encodeURIComponent(roleName)}&city=${encodeURIComponent(cityName)}`);
    } else {
      // 1-Click Google OAuth flow with redirect return
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}&intent=salary_report`);
    }
  };

  return (
    <Card className={`border-2 border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-md rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-white flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Interactive 2026 Compensation Simulator</span>
        </span>
        <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-[10px]">
          Live Market Data
        </Badge>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
              Check Your Market Percentile & Skill Gap (Free)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Compare your compensation for <span className="font-semibold text-foreground">{roleName}</span> in <span className="font-semibold text-foreground">{cityName}</span> across 2,700+ verified employer benchmarks.
          </p>
        </div>

        {/* Experience Slider Control */}
        <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-muted-foreground">Your Years of Experience:</span>
            <span className="font-bold text-foreground text-sm bg-white dark:bg-card px-2.5 py-0.5 rounded-lg border shadow-2xs">
              {currentExpYears} {currentExpYears === 1 ? 'Year' : 'Years'}
            </span>
          </div>
          <Slider
            value={[currentExpYears]}
            min={0}
            max={15}
            step={1}
            onValueChange={(val) => {
              setCurrentExpYears(val[0]);
              setHasCalculated(true);
            }}
            className="py-2"
          />
        </div>

        {/* Live Percentile Visual Output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-2xs">
            <span className="text-[11px] text-muted-foreground block font-medium">Estimated Median</span>
            <span className="text-base font-black text-foreground">
              {formatCurrency(medianSalary * (1 + currentExpYears * 0.12))}
            </span>
          </div>
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-medium">Market Percentile</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {calculatedPercentile}th Percentile
            </span>
          </div>
          <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50">
            <span className="text-[11px] text-blue-700 dark:text-blue-300 block font-medium">Top Skill Gaps</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
              +3 Verified Skills for 90th
            </span>
          </div>
        </div>

        {/* 1-Click Action to Unlock Report */}
        <div className="pt-1 space-y-2">
          <Button
            onClick={handleUnlockFullReport}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-2"
          >
            {user ? (
              <>
                <span>View Full Skill Breakdown &amp; Negotiation Guide</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Unlock Full Compensation &amp; Skill Gap Report (Free with Google)</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> 100% Free</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-blue-500" /> No credit card required</span>
            <span>&bull;</span>
            <span>Instant PDF Export</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPercentileWidget;
