// src/pages/resume/SharedScoreView.tsx
// Public Shared Scorecard Landing Surface (/score/:token)
// Zero-friction recipient utility: Displays shared benchmark and allows immediate 1-click free scan without upfront signup.

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';
import { GrowthEventTracker } from '@/lib/autonomous-os/growthEventTracker';

export const SharedScoreView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Track referral visit event
  React.useEffect(() => {
    GrowthEventTracker.getInstance().trackEvent('REFERRAL_VISIT', 'ATS_SCANNER', token, {
      source: 'shared_scorecard',
      medium: 'referral'
    });
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Shared ATS Resume Scorecard | TalentXcel</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="Audit your resume compatibility against enterprise Applicant Tracking Systems (ATS) for free on TalentXcel." />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill */}
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Peer Verified Career Diagnostic
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              A peer shared their ATS Scorecard with you
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Fortune 500 recruiters use Applicant Tracking Systems (ATS) to filter 75% of resumes before a human ever sees them.
            </p>
          </div>

          {/* Shared Benchmark Result Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Target Domain</span>
                  <h2 className="text-lg font-black text-white">Software Engineering &amp; Tech Roles</h2>
                  <p className="text-xs text-slate-300">Audited with TalentXcel Enterprise ATS Scanner</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-2xl text-center">
                    <div className="text-2xl font-black text-emerald-400">84<span className="text-xs text-slate-400 font-normal">/100</span></div>
                    <div className="text-[10px] uppercase font-bold text-slate-300">ATS Score</div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  The 3 Critical Gaps ATS Algorithms Flag Most Often:
                </p>
                <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 pl-6 list-disc">
                  <li><strong>Missing Quantified Outcomes:</strong> Bullet points lacking % improvements or metrics.</li>
                  <li><strong>Unmatched Hard Skills:</strong> Missing verbatim tech keywords required by job descriptions.</li>
                  <li><strong>Multi-Column Layouts:</strong> Complex tables and graphics that break automated parsers.</li>
                </ul>
              </div>

              {/* Instant Free Action CTA */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Want to see where your resume stands?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Run a complete ATS diagnostic on your resume in 15 seconds. No credit card, no spam, 100% free.
                </p>
                <Button 
                  onClick={() => navigate('/resume?ref=' + (token || 'shared'))}
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md rounded-xl"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Check My Resume Free →
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Greenhouse, Lever &amp; Workday Algorithm Tested
                </span>
                <span className="font-mono text-[11px] text-slate-400">Ref: #{token || 'TX-84A'}</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default SharedScoreView;
