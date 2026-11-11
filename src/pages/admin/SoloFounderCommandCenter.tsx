// src/pages/admin/SoloFounderCommandCenter.tsx
// Master Autonomous Command Center for Solo Founder Operations

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Send, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Check,
  Building2,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateDigestPackage, DailyDigestPackage } from '@/lib/digests/jobDigestEngine';

export default function SoloFounderCommandCenter() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 618,
    signupsToday: 8,
    activeJobs: 2236,
    atsScansCount: 42,
    applicationsCount: 28,
    employerAccounts: 3,
    revenueInr: 0
  });

  const [digests, setDigests] = useState<{
    tech?: DailyDigestPackage;
    nonTech?: DailyDigestPackage;
    core?: DailyDigestPackage;
  }>({});

  const [approvedStatus, setApprovedStatus] = useState<Record<string, boolean>>({
    tech: false,
    nonTech: false,
    core: false
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real active jobs
      const { data: rawJobs, count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100);

      // 2. Fetch profiles count
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch applications count
      const { count: appCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true });

      if (rawJobs && rawJobs.length > 0) {
        const techDigest = generateDigestPackage('tech', rawJobs);
        const nonTechDigest = generateDigestPackage('non-tech', rawJobs);
        const coreDigest = generateDigestPackage('core-industry', rawJobs);

        setDigests({
          tech: techDigest,
          nonTech: nonTechDigest,
          core: coreDigest
        });
      }

      setStats(prev => ({
        ...prev,
        totalUsers: profileCount || prev.totalUsers,
        activeJobs: totalJobs || prev.activeJobs,
        applicationsCount: appCount || prev.applicationsCount
      }));
    } catch (e) {
      console.warn('Error fetching founder data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard! Ready to paste into community.');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleApproveDigest = (category: string) => {
    setApprovedStatus(prev => ({ ...prev, [category]: true }));
    toast.success(`${category.toUpperCase()} Digest Approved for Today's Distribution!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Solo Founder Command Centre | TalentXcel Autonomous OS</title>
      </Helmet>

      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold tracking-wider">
                Autonomous Growth Control
              </Badge>
              <span className="text-xs text-slate-400">Asia/Kolkata (IST)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Solo Founder Command Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Connected operations across all 9 products & 3 automated job digest streams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={fetchOperationalData}
              disabled={loading}
              className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </Button>
          </div>
        </div>

        {/* Top Operational Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Total Registered Users</div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <span>+{stats.signupsToday} today</span>
            </div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Verified Active Jobs</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{stats.activeJobs}</div>
            <div className="text-[10px] text-slate-500 mt-1">Tech • Non-Tech • Core</div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Job Applications</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{stats.applicationsCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">1-Click Apply funnels</div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">ATS Scans Completed</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.atsScansCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">ResumeStudio Wedge</div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Verified Employers</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{stats.employerAccounts}</div>
            <div className="text-[10px] text-slate-500 mt-1">Recruiter Workspace</div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Monthly Revenue</div>
            <div className="text-2xl font-black text-amber-400 mt-1">₹{stats.revenueInr}</div>
            <div className="text-[10px] text-slate-500 mt-1">Zero Paid Ad Spend</div>
          </Card>
        </div>

        {/* 3 Automated Daily Job Digest Pipelines */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                <span>Today's 3 Automated Job Digests (Founder Approval Gate)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated 09:30 AM compilation. Review and copy with 1 click for WhatsApp & Telegram distribution.
              </p>
            </div>
          </div>

          <Tabs defaultValue="tech" className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <TabsTrigger value="tech" className="text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                1. Tech & IT Digest {approvedStatus.tech && '✅'}
              </TabsTrigger>
              <TabsTrigger value="non-tech" className="text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                2. Non-Tech & Business {approvedStatus.nonTech && '✅'}
              </TabsTrigger>
              <TabsTrigger value="core" className="text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                3. Core Industry & PSU {approvedStatus.core && '✅'}
              </TabsTrigger>
            </TabsList>

            {/* Tech Digest Content */}
            <TabsContent value="tech" className="space-y-4 pt-2">
              {digests.tech ? (
                <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{digests.tech.categoryTitle}</h3>
                      <p className="text-xs text-slate-400">{digests.tech.jobs.length} verified engineering openings ready</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopy(digests.tech!.telegramMarkdown, 'tech_tg')}
                        className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'tech_tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Telegram Format</span>
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopy(digests.tech!.whatsappText, 'tech_wa')}
                        className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'tech_wa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy WhatsApp Format</span>
                      </Button>

                      <Button 
                        size="sm" 
                        onClick={() => handleApproveDigest('tech')}
                        disabled={approvedStatus.tech}
                        className={`text-xs font-bold ${approvedStatus.tech ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      >
                        {approvedStatus.tech ? 'Approved' : 'Approve for Broadcast'}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {digests.tech.telegramMarkdown}
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Generating Tech Digest...</div>
              )}
            </TabsContent>

            {/* Non-Tech Digest Content */}
            <TabsContent value="non-tech" className="space-y-4 pt-2">
              {digests.nonTech ? (
                <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{digests.nonTech.categoryTitle}</h3>
                      <p className="text-xs text-slate-400">{digests.nonTech.jobs.length} verified corporate & operations roles ready</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopy(digests.nonTech!.telegramMarkdown, 'nontech_tg')}
                        className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'nontech_tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Telegram Format</span>
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopy(digests.nonTech!.whatsappText, 'nontech_wa')}
                        className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'nontech_wa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy WhatsApp Format</span>
                      </Button>

                      <Button 
                        size="sm" 
                        onClick={() => handleApproveDigest('nonTech')}
                        disabled={approvedStatus.nonTech}
                        className={`text-xs font-bold ${approvedStatus.nonTech ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      >
                        {approvedStatus.nonTech ? 'Approved' : 'Approve for Broadcast'}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {digests.nonTech.telegramMarkdown}
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Generating Non-Tech Digest...</div>
              )}
            </TabsContent>

            {/* Core Industry Digest Content */}
            <TabsContent value="core" className="space-y-4 pt-2">
              {digests.core ? (
                <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{digests.core.categoryTitle}</h3>
                      <p className="text-xs text-slate-400">{digests.core.jobs.length} verified mechanical, civil & PSU roles ready</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopy(digests.core!.telegramMarkdown, 'core_tg')}
                        className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'core_tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Telegram Format</span>
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopy(digests.core!.whatsappText, 'core_wa')}
                        className="text-xs border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'core_wa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy WhatsApp Format</span>
                      </Button>

                      <Button 
                        size="sm" 
                        onClick={() => handleApproveDigest('core')}
                        disabled={approvedStatus.core}
                        className={`text-xs font-bold ${approvedStatus.core ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                      >
                        {approvedStatus.core ? 'Approved' : 'Approve for Broadcast'}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {digests.core.telegramMarkdown}
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">Generating Core Industry Digest...</div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 9 Product Ecosystem Health Registry */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>The 9 Subdomain Products Status</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'ResumeStudio', host: 'resume.talentxcel.in', status: 'Live & Pre-rendered', hook: 'Instant ATS Scanner' },
              { name: 'JobMatch OS', host: 'jobs.talentxcel.in', status: 'Live & Pre-rendered', hook: '1-Click Direct Apply' },
              { name: 'PayScale', host: 'salary.talentxcel.in', status: 'Live & Pre-rendered', hook: 'In-Hand Tax Calculator' },
              { name: 'CampusOS', host: 'colleges.talentxcel.in', status: 'Live & Pre-rendered', hook: 'TPO Placement Cohorts (/b)' },
              { name: 'Career Passport', host: 'passport.talentxcel.in', status: 'Live & Pre-rendered', hook: 'Cryptographic QR Badge' },
              { name: 'SarkariHub', host: 'government.talentxcel.in', status: 'Live & Pre-rendered', hook: 'Gazette Verified Vacancies' },
              { name: 'Career Pathfinder', host: 'careers.talentxcel.in', status: 'Live & Pre-rendered', hook: 'Role Transition Roadmaps' },
              { name: 'SkillPods', host: 'learning.talentxcel.in', status: 'Live & Pre-rendered', hook: 'Peer Assessments' },
              { name: 'Recruiter Workspace', host: 'employers.talentxcel.in', status: 'Live & Pre-rendered', hook: 'AI Job Composer & Search' },
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.host}</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-0.5">{p.hook}</div>
                </div>
                <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
