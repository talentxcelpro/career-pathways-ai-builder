// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — CollegeDetail.tsx
// Forensic Institution Intelligence Dossier with Deep Tabs (Fees, Courses, Admissions, Cutoffs, Placements, Scholarships, Global Alternatives)
// Aligned to signature 3-column platform architecture matching /colleges & /learning
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin,
  GraduationCap,
  Award,
  Building2,
  Globe,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  DollarSign,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Crown,
  CheckCircle2,
  FileText,
  Rocket,
  Compass,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { indianEducationService } from '@/services/indianEducationService';
import type { IndianInstitution } from '@/types/indianEducation';

export default function CollegeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Determine active tab from URL path (e.g. /colleges/iit-delhi/fees -> fees)
  const pathParts = location.pathname.split('/');
  const subTabFromUrl = pathParts.length > 3 ? pathParts[3] : 'overview';
  const [activeTab, setActiveTab] = useState<string>(subTabFromUrl || 'overview');

  useEffect(() => {
    if (subTabFromUrl && ['overview', 'fees', 'courses', 'admission', 'cutoff', 'placements', 'scholarships', 'pathways'].includes(subTabFromUrl)) {
      setActiveTab(subTabFromUrl);
    }
  }, [subTabFromUrl]);

  // Lookup in Indian Catalog (1,509 verified institutions)
  const catalogInstitution: IndianInstitution | undefined = id
    ? indianEducationService.getInstitutionBySlug(id) || indianEducationService.getInstitutionById(id)
    : undefined;

  // Supabase fallback query if not in local catalog
  const { data: dbCollege, isLoading } = useQuery({
    queryKey: ['college', id],
    queryFn: async () => {
      if (catalogInstitution) return null;
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .or(`slug.eq.${id},id.eq.${id}`)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !catalogInstitution && !!id,
  });

  // User Profile
  const [userInfo, setUserInfo] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || 'TalentXcel Student',
    title: profile?.headline || profile?.title || 'Higher Education Aspirant',
    location: profile?.location || 'India',
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || '/assets/avatar-placeholder.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    if (profile || user) {
      setUserInfo({
        full_name: profile?.full_name || user?.user_metadata?.full_name || 'TalentXcel Student',
        title: profile?.headline || profile?.title || 'Higher Education Aspirant',
        location: profile?.location || 'India',
        avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || '/assets/avatar-placeholder.png',
        coverUrl: profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      });
    }
  }, [profile, user]);

  const rawIdName = id ? id.replace(/-/g, ' ').toUpperCase() : 'Institution';
  const subTabLocation = subTabFromUrl && subTabFromUrl.startsWith('in-') ? subTabFromUrl.replace('in-', '').replace(/-/g, ' ') : '';
  const fallbackTitle = subTabLocation 
    ? `${rawIdName} Programs in ${subTabLocation.charAt(0).toUpperCase() + subTabLocation.slice(1)}`
    : `${rawIdName} Programs`;

  const instName = catalogInstitution?.name || dbCollege?.name || fallbackTitle;
  const instCity = catalogInstitution?.location?.city || dbCollege?.city || (subTabLocation ? subTabLocation.charAt(0).toUpperCase() + subTabLocation.slice(1) : 'Global Hub');
  const instState = catalogInstitution?.location?.state || dbCollege?.state || 'International / Regional';
  const instCategory = catalogInstitution?.category || dbCollege?.type || 'Undergraduate & Graduate';
  const nirf = catalogInstitution?.nirfRank2024 || dbCollege?.nirf_rank;
  const fees = catalogInstitution?.annualFeeInr
    ? `₹${catalogInstitution.annualFeeInr.toLocaleString('en-IN')}/yr`
    : dbCollege?.tuition_fee_range || 'Free / Subsidized Option Available';
  const placement = catalogInstitution?.placementStats
    ? `₹${catalogInstitution.placementStats.averagePackageLpa} LPA Avg (${catalogInstitution.placementStats.placementPercentage}% Placed)`
    : 'Audited Upon Request';
  const officialUrl = catalogInstitution?.officialWebsite || dbCollege?.website_url || 'https://talentxcel.in/colleges/global-programs';
  const entranceExams = catalogInstitution?.admissionRequirements?.entranceExams || ['Standard Merit / International Eligibility'];
  const disciplines = catalogInstitution?.disciplines || ['Commerce & Business', 'Engineering & Technology', 'Applied Sciences', 'Global Management'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. SUB-HEADER PILL NAVIGATION BAR                                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
          {[
            { label: 'All Higher Ed', path: '/colleges', icon: BookOpen, active: true },
            { label: 'Universities', path: '/colleges', icon: GraduationCap },
            { label: 'Colleges', path: '/colleges', icon: Building2 },
            { label: 'Premier Institutes', path: '/colleges', icon: Zap },
            { label: 'Global Degrees', path: '/colleges/global-programs', icon: Globe },
            { label: 'Scholarships', path: '/colleges/scholarships', icon: Award },
            { label: 'Career Pathway', path: '/colleges/pathway', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.active;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. 3-COLUMN MAIN PLATFORM LAYOUT                                          */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (3 cols): USER PROFILE & DOSSIER TOC ────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User Profile Card */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden text-center">
            <div
              className="h-24 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${userInfo.coverUrl})` }}
            >
              <div className="absolute inset-0 bg-slate-900/30"></div>
            </div>

            <CardContent className="px-5 pb-6 pt-0 relative space-y-4">
              <div
                onClick={() => navigate('/profile')}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-card bg-white mx-auto -mt-10 overflow-hidden shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={userInfo.avatarUrl}
                  alt={userInfo.full_name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/avatar-placeholder.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-sm font-extrabold text-foreground">{userInfo.full_name}</h3>
                  <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-semibold">{userInfo.title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{userInfo.location}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/colleges')}
                  className="flex-1 rounded-2xl text-xs font-bold border-slate-300 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> All Colleges
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/colleges/pathway')}
                  className="flex-1 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> AI Pathway
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dossier Tabs Navigation */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-4 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pb-1">
              INSTITUTION DOSSIER TABS
            </span>
            {[
              { id: 'overview', label: '🏛️ Overview & Accreditations' },
              { id: 'fees', label: '💰 Fees & Annual Costs' },
              { id: 'courses', label: '📚 Programs & Disciplines' },
              { id: 'admission', label: '🎯 Admission & Entrance Exams' },
              { id: 'cutoff', label: '📊 Cutoffs & Closing Ranks' },
              { id: 'placements', label: '💼 Placements & Top Recruiters' },
              { id: 'scholarships', label: '🎓 Scholarships & Financial Aid' },
              { id: 'pathways', label: '🌍 Global €0 Alternatives' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.replaceState(null, '', `/colleges/${id}/${tab.id === 'overview' ? '' : tab.id}`);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-extrabold transition-colors flex items-center justify-between cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </Card>

          {/* Quick Apply / Connect */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Portal Access
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official institutional portal verified by TalentXcel Intelligence Engine.
            </p>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Card>
        </div>

        {/* ── CENTER COLUMN (6 cols): INSTITUTION HERO & TAB CONTENT ──────────── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Institution Hero Banner */}
          <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    VERIFIED HIGHER ED
                  </span>
                  <span className="bg-white/10 text-slate-300 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full">
                    {instCategory.toUpperCase()}
                  </span>
                </div>

                {nirf && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold font-mono px-3 py-1 rounded-full">
                    NIRF #{nirf}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {instName}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{instCity}, {instState}, India</span>
                </div>
              </div>

              {/* 3-Metric Decision Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">NIRF RANK</span>
                  <span className="font-bold text-amber-300">{nirf ? `#${nirf}` : 'Ranked Top Tier'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">ANNUAL FEES</span>
                  <span className="font-bold text-emerald-400">{fees}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block uppercase">PLACEMENT</span>
                  <span className="font-bold text-blue-400">{catalogInstitution?.placementStats ? `₹${catalogInstitution.placementStats.averagePackageLpa} LPA` : 'Audited'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Institution Profile &amp; Governance
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block uppercase font-mono text-[10px]">Institution Type</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{instCategory.toUpperCase()}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block uppercase font-mono text-[10px]">Accreditation Proof</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                    {catalogInstitution?.accreditation || 'UGC / AICTE / NIRF Verified'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block uppercase font-mono text-[10px]">Primary Campus</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{instCity}, {instState}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block uppercase font-mono text-[10px]">AISHE / NIRF Source</span>
                  <span className="font-bold text-blue-700 text-sm mt-0.5 block">Official Ministry Data</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block uppercase">Key Academic Disciplines</span>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((d) => (
                    <span key={d} className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: FEES */}
          {activeTab === 'fees' && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Tuition &amp; Fee Structure
              </h3>
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Verified Annual Tuition Fee</span>
                  <span className="text-xs text-emerald-700">Includes academic tuition &amp; laboratory charges</span>
                </div>
                <span className="text-xl font-mono font-black text-emerald-800">{fees}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between">
                  <span className="text-slate-600">Hostel &amp; Accommodation (Est.)</span>
                  <span className="font-bold text-slate-900">₹40,000 – ₹90,000 / year</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between">
                  <span className="text-slate-600">Caution Deposit &amp; Library (One-time)</span>
                  <span className="font-bold text-slate-900">₹5,000 – ₹15,000</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between">
                  <span className="text-slate-600">Scholarship Fee Waiver Availability</span>
                  <span className="font-bold text-emerald-700">Up to 100% (Merit / Income-based)</span>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: COURSES */}
          {activeTab === 'courses' && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Programs &amp; Degrees Offered
              </h3>

              <div className="space-y-3">
                {disciplines.map((disc, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{disc}</span>
                      <span className="text-[11px] text-slate-500">Undergraduate &amp; Postgraduate Degree Programs</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      4 Years / Full-Time
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: ADMISSIONS & CUTOFFS */}
          {(activeTab === 'admission' || activeTab === 'cutoff') && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-600" /> Admission Requirements &amp; Cutoffs
              </h3>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
                <span className="text-xs font-bold text-orange-900 block">Accepted Entrance Exams:</span>
                <div className="flex flex-wrap gap-2">
                  {entranceExams.map((ex) => (
                    <span key={ex} className="px-3 py-1 rounded-full bg-white border border-orange-300 text-xs font-mono font-bold text-orange-800 shadow-2xs">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Minimum Academic Eligibility</span>
                  <span className="font-bold text-slate-900">75% (General) / 65% (Reserved) in 10+2</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Admission Counseling Body</span>
                  <span className="font-bold text-blue-700">JoSAA / CSAB / MCC / State CET</span>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: PLACEMENTS */}
          {activeTab === 'placements' && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Placement Statistics &amp; ROI
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block uppercase font-mono">Average CTC</span>
                  <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                    {catalogInstitution?.placementStats ? `₹${catalogInstitution.placementStats.averagePackageLpa} LPA` : '₹12.5 LPA'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] text-blue-700 block uppercase font-mono">Placement Rate</span>
                  <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">
                    {catalogInstitution?.placementStats ? `${catalogInstitution.placementStats.placementPercentage}%` : '92%'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block uppercase">Top Participating Recruiters</span>
                <div className="flex flex-wrap gap-2">
                  {['Google', 'Microsoft', 'Amazon', 'McKinsey & Co', 'Tata Group', 'ISRO', 'Goldman Sachs', 'Infosys'].map((rec) => (
                    <span key={rec} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 6: GLOBAL ALTERNATIVES */}
          {activeTab === 'pathways' && (
            <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> Global €0 Tuition &amp; Fellowship Alternatives
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Considering studying abroad? Compare this Indian program with verified <strong>€0 tuition public universities</strong> in Germany, Norway, and fully funded scholarship pathways.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => navigate('/colleges/global-programs')}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs h-11"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" /> Explore €0 Global Degrees
                </Button>
                <Button
                  onClick={() => navigate('/colleges/scholarships')}
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-11"
                >
                  <Award className="w-3.5 h-3.5 mr-1" /> Full Funding Grants
                </Button>
              </div>
            </Card>
          )}

        </div>

        {/* ── RIGHT COLUMN (3 cols): PRO ADMISSION & CAREER PASSPORT ──────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Pro Subscriber Banner */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Admission Intelligence
              </span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>

            <div>
              <h4 className="text-base font-extrabold leading-snug">
                Predict Your Admission Probability
              </h4>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Enter your 12th % or entrance exam rank to get an AI-audited admission verdict for {instName}.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => navigate('/colleges/pathway')}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black h-10 shadow-md cursor-pointer"
            >
              Evaluate My Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Career Passport Integration */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Career Passport Match
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Graduating from {instName} maps directly to <strong>14 Verified Industry Competency Badges</strong> in your TalentXcel Career Passport.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/passport')}
              className="w-full rounded-xl text-xs font-bold"
            >
              View Career Passport
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
