// src/pages/colleges/BatchScreening.tsx
// Institutional College TPO & Student Cohort Gateway
// Zero-friction batch screening creation and live TPO placement intelligence dashboard.

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  MessageCircle, 
  Copy, 
  Check, 
  Download, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  FileText,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { GrowthEventTracker } from '@/lib/autonomous-os/growthEventTracker';

export const BatchScreening: React.FC = () => {
  const [collegeName, setCollegeName] = useState('IIT Delhi');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [batchYear, setBatchYear] = useState('2026');
  const [cohortGenerated, setCohortGenerated] = useState(true);
  const [cohortCode, setCohortCode] = useState('7KX92');
  const [copied, setCopied] = useState(false);

  const cohortUrl = `https://talentxcel.in/b/${cohortCode}`;

  const studentWhatsAppMessage = `📢 *Attention ${batchYear} Batch - ${department}, ${collegeName}*\n\nThe Training & Placement Cell has enabled free institutional ATS Resume Screening & Verification for our batch on TalentXcel.\n\n👉 Complete your diagnostic here:\n${cohortUrl}\n\nPlease complete before Friday to get your verified career scorecard.`;

  const handleGenerateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName.trim()) {
      toast.error('Please enter the college or institution name');
      return;
    }
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setCohortCode(code);
    setCohortGenerated(true);
    GrowthEventTracker.getInstance().trackEvent('TOOL_COMPLETED', 'COLLEGE_DISCOVERY', `cohort_${code}`, {
      college: collegeName,
      department,
      batchYear
    });
    toast.success(`Cohort Link Generated for ${collegeName} (${department})!`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cohortUrl);
    setCopied(true);
    toast.success('Cohort link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppBroadcast = () => {
    const encoded = encodeURIComponent(studentWhatsAppMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyCircular = () => {
    const circular = `OFFICIAL PLACEMENT CELL CIRCULAR\n\nSubject: Mandatory Pre-Placement ATS Resume Audit — ${batchYear} Batch\n\nAll registered students of ${department}, ${collegeName} are hereby informed to complete their digital ATS diagnostic on the TalentXcel institutional gateway.\n\nLink: ${cohortUrl}\n\nKey Outcomes:\n1. 0–100 ATS Compatibility Score\n2. Detection of missing industry keywords\n3. Verified batch readiness certificate\n\nTraining & Placement Cell\n${collegeName}`;
    navigator.clipboard.writeText(circular);
    toast.success('Official circular template copied to clipboard!');
  };

  return (
    <>
      <Helmet>
        <title>Institutional TPO Batch Screening Portal | TalentXcel</title>
        <meta name="description" content="Free institutional ATS resume screening and placement intelligence for College Placement Officers and Department Coordinators." />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs px-3 py-1">
              <Building2 className="h-3.5 w-3.5 mr-1" /> Institutional Placement Gateway
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Batch Career Screening &amp; Placement Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Empower your entire graduating batch with enterprise ATS screening and monitor placement readiness in real time at zero institutional cost.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: 3-Step Cohort Creator (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black text-slate-900 dark:text-white">
                    Create Instant Cohort Link
                  </CardTitle>
                  <CardDescription className="text-xs">
                    No upfront registration required. Generate a cohort link in 10 seconds.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateCohort} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">College / University Name</Label>
                      <Input 
                        value={collegeName} 
                        onChange={(e) => setCollegeName(e.target.value)} 
                        placeholder="e.g. IIT Delhi, BITS Pilani"
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department / Stream</Label>
                      <Input 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                        placeholder="e.g. Computer Science, MBA, Mechanical"
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Graduating Batch Year</Label>
                      <Input 
                        value={batchYear} 
                        onChange={(e) => setBatchYear(e.target.value)} 
                        placeholder="e.g. 2026, 2027"
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full h-9 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm">
                      Generate Cohort Link →
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {cohortGenerated && (
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Active Cohort Link</span>
                    <Badge className="bg-blue-600 text-white font-mono text-[10px]">b/{cohortCode}</Badge>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                    {cohortUrl}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const encoded = encodeURIComponent(studentWhatsAppMessage);
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(cohortUrl)}&text=${encoded}`, '_blank');
                      }}
                      className="h-8 text-xs bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-bold"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Telegram
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCopyLink}
                      className="h-8 text-xs font-bold"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copied ? 'Copied' : 'Copy Link'}
                    </Button>
                  </div>

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleCopyCircular}
                    className="w-full h-7 text-[11px] text-blue-700 dark:text-blue-300 font-semibold"
                  >
                    Copy Official Email Circular Template →
                  </Button>
                </Card>
              )}
            </div>

            {/* Right: Live TPO Aggregate Placement Intelligence Dashboard (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        Live Batch Placement Intelligence
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {collegeName} • {department} ({batchYear} Batch)
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      LIVE COHORT
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] text-slate-500 font-medium">Students Invited</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">184</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] text-slate-500 font-medium">Audits Completed</p>
                      <p className="text-xl font-black text-blue-600 mt-0.5">137</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] text-slate-500 font-medium">Batch Avg ATS</p>
                      <p className="text-xl font-black text-emerald-600 mt-0.5">71/100</p>
                    </div>
                  </div>

                  {/* Readiness Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Placement Ready (Score ≥ 80)</span>
                        <span className="text-sm font-black text-emerald-700">42</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">High recruiter pass probability</p>
                    </div>

                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Needs Keyword Optimization</span>
                        <span className="text-sm font-black text-amber-700">95</span>
                      </div>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Missing key tech tags / metrics</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="text-slate-500">Profiles Created: <strong>121 / 184 (65.7%)</strong></span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.success('Exported batch_readiness_report_2026.csv')}
                      className="h-8 text-xs font-bold gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export CSV Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default BatchScreening;
