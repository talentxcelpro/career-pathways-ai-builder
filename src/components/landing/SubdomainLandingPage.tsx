import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { SubdomainIdentity, getSubdomainIdentity } from '@/config/subdomainIdentities';
import { ProductUniverse, UNIVERSE_PRIMARY_DOMAIN } from '@/config/domainArchitecture';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TalentXcelLogo } from '@/components/common/TalentXcelLogo';
import { LandingFooter } from './LandingFooter';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Users, 
  Building2, 
  Compass, 
  FileText, 
  GraduationCap, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Search,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Lock
} from 'lucide-react';

interface SubdomainLandingPageProps {
  universe: ProductUniverse;
}

export const SubdomainLandingPage: React.FC<SubdomainLandingPageProps> = ({ universe }) => {
  const navigate = useNavigate();
  const identityKey = universe.toLowerCase();
  const identity: SubdomainIdentity = getSubdomainIdentity(identityKey);

  // Universe-specific feature sets
  const renderFeaturesForUniverse = () => {
    switch (universe) {
      case 'LEARNING':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Practical Course Catalog</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Curated tech & management courses spanning full-stack development, AI/ML, cloud architecture, and data engineering.</p>
                <div className="pt-2">
                  <Link to="/courses" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>Browse courses catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Structured Learning Pathways</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>End-to-end curriculum roadmaps organized step-by-step from beginner to production-ready engineer.</p>
                <div className="pt-2">
                  <Link to="/learning/paths" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>Explore learning paths</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Employability & Certifications</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Earn verified skill certificates that bridge the gap between coursework and recruiter visibility on TalentXcel Jobs.</p>
                <div className="pt-2">
                  <Link to="/learning/certificates" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>View certificates</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'PASSPORT':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-emerald-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Structured Career Dossier</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Consolidate your employment history, project artifacts, verified competencies, and academic credentials in one unified profile.</p>
                <div className="pt-2">
                  <Link to="/passport" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <span>Manage your passport</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-emerald-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">TalentScore Capability Score</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Objective capability scoring based on skill assessments, role depth, and verifiable project evidence.</p>
                <div className="pt-2">
                  <Link to="/passport" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <span>View TalentScore breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-emerald-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Privacy-First QR & Link Sharing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Generate a secure, portable digital passport with full privacy settings. Control exactly which details employers see.</p>
                <div className="pt-2">
                  <Link to="/qr-networking" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <span>QR Networking portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'GOVERNMENT':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-amber-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">Public Sector Vacancies</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Curated notifications from Central Government, State PSCs, Public Sector Undertakings (PSUs), Defense, and Railways.</p>
                  <div className="pt-2">
                    <Link to="/government-jobs" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <span>View all notifications</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-amber-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">Exam Schedules & Deadlines</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Key exam dates, registration windows, and admit card updates for UPSC, SSC CGL, IBPS Bank PO, and State exams.</p>
                  <div className="pt-2">
                    <Link to="/government-jobs/exams/upsc-2026" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <span>UPSC & SSC calendars</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-amber-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">Eligibility & Criteria Guides</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Concise summaries of required educational qualifications, age relaxations, application fees, and official links.</p>
                  <div className="pt-2">
                    <Link to="/government-jobs/freshers" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <span>Fresher eligibility roles</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Independent Platform Transparency Notice */}
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5 font-bold">Important Independent Platform Notice</strong>
                TalentXcel is an independent career platform and is not affiliated with, authorized by, or endorsed by the Union Public Service Commission (UPSC), Staff Selection Commission (SSC), IBPS, or any government department. Job notices are aggregated from official public gazettes and employment news bulletins for informational convenience.
              </div>
            </div>
          </div>
        );

      case 'EMPLOYERS':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-purple-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Verified Candidate Discovery</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Search active professionals by verified role, verified skill competency, location, and immediate notice availability.</p>
                <div className="pt-2">
                  <Link to="/talent" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <span>Search candidate directory</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-purple-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Recruiter Operating System</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Manage candidate pipelines, automate application scoring, schedule interviews, and streamline your recruitment workflow.</p>
                <div className="pt-2">
                  <Link to="/recruiters" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <span>Explore Recruiter OS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-purple-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Post & Syndicate Openings</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Publish your vacancies directly into the TalentXcel Jobs search universe with instant ATS candidate matching.</p>
                <div className="pt-2">
                  <Link to="/hire" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <span>Post a job opening</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'COLLEGES':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Distinct entry point: Students */}
              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-teal-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-400 flex items-center justify-center mb-2 border border-teal-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="w-fit text-[10px] text-teal-300 border-teal-500/30 mb-1">For Students</Badge>
                  <CardTitle className="text-lg font-bold text-white">Explore Degrees & Cutoffs</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Detailed profiles for 10,250+ colleges: engineering branches, fee structures, entrance cutoffs, and NIRF rankings.</p>
                  <div className="pt-2">
                    <Link to="/colleges" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                      <span>Search 10,250+ institutions</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Distinct entry point: Placement Cells */}
              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-teal-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="w-fit text-[10px] text-blue-300 border-blue-500/30 mb-1">For Placement Cells</Badge>
                  <CardTitle className="text-lg font-bold text-white">Connect with Hiring Employers</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Connect your graduating batch with recruiting teams across India using verified student skill profiles.</p>
                  <div className="pt-2">
                    <Link to="/recruiters" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                      <span>Recruiter connection portal</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Distinct entry point: Institutional Partners */}
              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-teal-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="w-fit text-[10px] text-purple-300 border-purple-500/30 mb-1">For Institutions</Badge>
                  <CardTitle className="text-lg font-bold text-white">Institutional Analytics & Data</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Benchmark your institution against NIRF peers, verify institutional information, and showcase accredited achievements.</p>
                  <div className="pt-2">
                    <Link to="/global-programs" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1">
                      <span>Global education programs</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality & Non-Guarantee Notice */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
              <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">Objective Institutional Intelligence</strong>
                College profiles, fee estimates, and placement CTC statistics are compiled from public NIRF disclosures, university websites, and official admission bulletins. TalentXcel provides objective data and does not offer placement guarantees.
              </div>
            </div>
          </div>
        );

      case 'CAREERS':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-indigo-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Interactive Career Roadmaps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Visualize step-by-step career milestones from junior roles to senior staff engineer, cloud architect, and engineering manager.</p>
                <div className="pt-2">
                  <Link to="/career-map" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <span>Explore career maps</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-indigo-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Skill Gap Diagnostics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Benchmark your current skillset against the requirements of your target promotion or pivot role.</p>
                <div className="pt-2">
                  <Link to="/career-map/software-engineer" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <span>Software engineer pathway</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-indigo-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Career Intelligence & Coaching</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Access step-by-step transition guides and career-coaching insights to prepare for your next career move.</p>
                <div className="pt-2">
                  <Link to="/career-intelligence" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <span>Career intelligence engine</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'SALARY':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-sky-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-400 flex items-center justify-center mb-2 border border-sky-500/20">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">Market Percentile Distributions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>View verified compensation distributions: 25th percentile, Median (P50), 75th percentile, and top 90th percentile bands.</p>
                  <div className="pt-2">
                    <Link to="/tools/salary-analyzer" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <span>Launch Salary Analyzer</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-sky-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">City Pay Differentials</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Compare tech salaries across Bangalore, Hyderabad, Pune, Mumbai, Delhi NCR, and Remote hiring hubs.</p>
                  <div className="pt-2">
                    <Link to="/salary/software-engineer/bangalore" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <span>Bangalore software engineer pay</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-sky-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white">Offer Negotiation Insights</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <p>Benchmark your current CTC and target offer against verified market data before your next salary negotiation.</p>
                  <div className="pt-2">
                    <Link to="/salary/data-analyst/hyderabad" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <span>Hyderabad data analyst pay</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">Sourced Compensation Transparency</strong>
                Salary benchmarks and percentiles are derived from verified employer filings, platform compensation surveys, and statistical market estimations. All figures represent statistical benchmarks.
              </div>
            </div>
          </div>
        );

      case 'RESUME':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">ATS-Optimized Resume Builder</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Build recruiter-approved resumes with clean formatting, semantic headings, and high parser readability.</p>
                <div className="pt-2">
                  <Link to="/resume-builder" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>Open Resume Builder</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Instant ATS Scoring & Checker</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Upload your current resume for instant diagnostic feedback on ATS keywords, bullet impact, and structural flaws.</p>
                <div className="pt-2">
                  <Link to="/tools/ats-checker" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>Check resume ATS score</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-white">Recruiter-Tested Templates</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>Choose from battle-tested single and multi-page templates optimized for Naukri, LinkedIn, and enterprise applicant tracking systems.</p>
                <div className="pt-2">
                  <Link to="/resume-templates" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>Browse templates</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <SEOHead
        title={identity.title}
        description={identity.description}
        canonical={identity.canonical}
        type="website"
        structuredData={JSON.stringify(identity.schemaJsonLd)}
        keywords={identity.keywords}
      />

      {/* Subdomain-Specific Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/80 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 bg-radial-[circle_at_top] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Target Audience Pill */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Audience: {identity.audience}</span>
          </div>

          {/* Exact Required Headline (H1) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-5 max-w-4xl">
            {identity.headline}
          </h1>

          {/* Exact Required Supporting Copy */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-3xl">
            {identity.supportingCopy}
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
            <Button
              size="lg"
              onClick={() => navigate(identity.primaryCtaUrl)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 text-base"
            >
              <span>{identity.primaryCta}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {identity.secondaryCta && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(identity.secondaryCtaUrl)}
                className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold px-6 py-3 rounded-xl text-base"
              >
                <span>{identity.secondaryCta}</span>
              </Button>
            )}
          </div>

          {/* Quick-Access Internal Links */}
          {identity.featuredInternalLinks?.length > 0 && (
            <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-2">Featured entry points:</span>
              {identity.featuredInternalLinks.map((link) => (
                <Link
                  key={link.text}
                  to={link.href}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content & Features Section */}
      <section className="py-12 md:py-16 bg-[#070b14]/80 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs border-blue-500/30 text-sky-400">Capabilities</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Platform Features</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Empowering your career and recruitment with TalentXcel verified technology.
            </p>
            {renderFeaturesForUniverse()}
          </div>

          {/* Sibling Domain Cross-Links Section */}
          <div className="pt-8 border-t border-slate-800/80">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Part of the TalentXcel Career Ecosystem
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Explore interconnected career, compensation, learning, and hiring solutions across TalentXcel:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.JOBS}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>TalentXcel Jobs</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.SALARY}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>Salary Intelligence</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.RESUME}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>ATS Resume Studio</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.PASSPORT}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>Career Passport</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.LEARNING}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>Learning Hub</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.COLLEGES}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>Colleges Directory</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.EMPLOYERS}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>Recruiter OS</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href={UNIVERSE_PRIMARY_DOMAIN.GOVERNMENT}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
              >
                <span>Government Careers</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Official Master Brand Footer */}
      <LandingFooter />
    </div>
  );
};
export default SubdomainLandingPage;
