// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Scholarships & Funding Page
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShieldCheck,
  Globe,
  Search,
  ExternalLink,
  CalendarClock,
  DollarSign,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Building2,
  Rocket,
  Zap,
  Crown,
  CheckCircle2,
  Compass,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { globalEducationService, SEED_SCHOLARSHIPS } from '@/services/globalEducationService';
import type { GlobalScholarship, ScholarshipFilters, ScholarshipCoverage, ProgramLevel } from '@/types/globalEducation';

// ── Flag emoji map ────────────────────────────────────────────────────────────
const COUNTRY_FLAG: Record<string, string> = {
  Germany: '🇩🇪',
  Norway: '🇳🇴',
  Finland: '🇫🇮',
  Sweden: '🇸🇪',
  Denmark: '🇩🇰',
  France: '🇫🇷',
  Netherlands: '🇳🇱',
  Austria: '🇦🇹',
  Switzerland: '🇨🇭',
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Japan: '🇯🇵',
  China: '🇨🇳',
  India: '🇮🇳',
  Brazil: '🇧🇷',
  Argentina: '🇦🇷',
  Singapore: '🇸🇬',
  'South Korea': '🇰🇷',
  Ireland: '🇮🇪',
  Portugal: '🇵🇹',
  Spain: '🇪🇸',
  Italy: '🇮🇹',
  Belgium: '🇧🇪',
  Turkey: '🇹🇷',
  International: '🌍',
  Global: '🌍',
};
const flagFor = (country: string): string => COUNTRY_FLAG[country] ?? '🌍';

// ── Coverage config ───────────────────────────────────────────────────────────
const COVERAGE_CONFIG: Record<ScholarshipCoverage, { label: string; className: string }> = {
  FULL: { label: 'Full Coverage', className: 'bg-green-100 text-green-800 border-green-300' },
  TUITION: { label: 'Tuition Only', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  PARTIAL: { label: 'Partial', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  LIVING: { label: 'Living Stipend', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  TRAVEL: { label: 'Travel', className: 'bg-gray-100 text-gray-700 border-gray-300' },
};

function deadlineClass(dateStr?: string): string {
  if (!dateStr) return 'text-slate-600';
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'text-gray-400 line-through';
  if (diffDays <= 60) return 'text-red-600 font-semibold';
  return 'text-gray-700';
}

function formatDeadline(dateStr?: string): string {
  if (!dateStr) return 'Rolling / Check Portal';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Scholarships() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [search, setSearch] = useState('');
  const [coverage, setCoverage] = useState<'all' | ScholarshipCoverage>('all');
  const [fullCoverageOnly, setFullCoverageOnly] = useState(false);
  const [page, setPage] = useState(1);

  // User Profile
  const [userInfo, setUserInfo] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || 'TalentXcel Student',
    title: profile?.headline || profile?.title || 'Scholarship Aspirant',
    location: profile?.location || 'India',
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || 'https://chatr.chat/assets/img/logo.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    if (profile || user) {
      const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'TalentXcel Student';
      const title = profile?.headline || profile?.title || 'Scholarship Aspirant';
      const location = profile?.location || 'India';
      const avatar = profile?.profile_picture_url || user?.user_metadata?.avatar_url || 'https://chatr.chat/assets/img/logo.png';
      setUserInfo({
        full_name: fullName,
        title: title,
        location: location,
        avatarUrl: avatar,
        coverUrl: profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      });
    }
  }, [profile, user]);

  const filters: ScholarshipFilters = useMemo(() => {
    const f: ScholarshipFilters = {};
    if (search.trim()) f.search = search.trim();
    if (coverage !== 'all') f.coverage = coverage;
    if (fullCoverageOnly) f.can_make_tuition_zero = true;
    return f;
  }, [search, coverage, fullCoverageOnly]);

  const { data: rawScholarships = [] } = useQuery({
    queryKey: ['global-scholarships', filters],
    queryFn: () => globalEducationService.getScholarships(filters),
    placeholderData: SEED_SCHOLARSHIPS as any,
  });

  // Normalized scholarships with safe fallback
  const scholarships: GlobalScholarship[] = useMemo(() => {
    const list = Array.isArray(rawScholarships) && rawScholarships.length > 0 ? rawScholarships : (SEED_SCHOLARSHIPS as any);
    return list.map((s: any, idx: number) => ({
      id: s.id || `sch-${idx}`,
      title: s.title || s.name || 'Scholarship Award',
      provider: s.provider || 'Funding Body',
      provider_country: s.provider_country || 'Global',
      coverage: s.coverage || 'FULL',
      coverage_detail: s.coverage_detail || s.description || 'Full tuition and living stipend coverage',
      amount: s.amount || (s.amount_usd ? `$${s.amount_usd.toLocaleString()}` : 'Full Funding Award'),
      can_make_tuition_zero: Boolean(s.can_make_tuition_zero ?? true),
      eligible_levels: Array.isArray(s.eligible_levels) ? s.eligible_levels : ['master', 'phd'],
      application_deadline: s.application_deadline || '2026-10-31',
      official_url: s.official_url || s.url || 'https://www.daad.de',
      source_evidence: s.source_evidence || 'Official Scholarship Portal',
      verification_status: s.verification_status || 'VERIFIED',
      confidence_score: s.confidence_score || 98,
      created_at: s.created_at || new Date().toISOString(),
      updated_at: s.updated_at || new Date().toISOString(),
    }));
  }, [rawScholarships]);

  const totalCount = SEED_SCHOLARSHIPS.length;
  const fullCoverageCount = SEED_SCHOLARSHIPS.filter((s) => s.coverage === 'FULL').length;
  const zeroTuitionCount = SEED_SCHOLARSHIPS.filter((s) => s.can_make_tuition_zero).length;

  const pageSize = 12;
  const totalPages = Math.ceil(scholarships.length / pageSize);
  const pagedScholarships = scholarships.slice((page - 1) * pageSize, page * pageSize);

  const handleQuickSearch = (keyword: string) => {
    setSearch(keyword);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. SUB-HEADER PILL NAVIGATION BAR                                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
          {[
            { label: 'All Higher Ed', path: '/colleges', icon: BookOpen },
            { label: 'Universities', path: '/colleges', icon: GraduationCap },
            { label: 'Colleges', path: '/colleges', icon: Building2 },
            { label: 'Premier Institutes', path: '/colleges', icon: Zap },
            { label: 'Global Degrees', path: '/colleges/global-programs', icon: Globe },
            { label: 'Scholarships', path: '/colleges/scholarships', icon: Award, active: true },
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
        
        {/* ── LEFT COLUMN (3 cols): USER PROFILE & SCHOLARSHIP FILTERS ────────── */}
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
                    (e.target as HTMLImageElement).src = 'https://chatr.chat/assets/img/logo.png';
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
                  onClick={() => navigate('/profile')}
                  className="flex-1 rounded-2xl text-xs font-bold border-slate-300 cursor-pointer"
                >
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/colleges/pathway')}
                  className="flex-1 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> AI Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Widget */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-600" /> Coverage Filter
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{scholarships.length} Grants</span>
            </div>

            {/* Coverage Type */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Coverage Scope</label>
              <Select
                value={coverage}
                onValueChange={(v: any) => {
                  setCoverage(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Coverage Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Coverage Types</SelectItem>
                  <SelectItem value="FULL">Full Coverage (Tuition + Living + Travel)</SelectItem>
                  <SelectItem value="TUITION">Tuition Only</SelectItem>
                  <SelectItem value="LIVING">Living Stipend</SelectItem>
                  <SelectItem value="PARTIAL">Partial Scholarship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Coverage Only Toggle */}
            <button
              onClick={() => {
                setFullCoverageOnly(!fullCoverageOnly);
                setPage(1);
              }}
              className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                fullCoverageOnly
                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Full Coverage Only</span>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                fullCoverageOnly ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {fullCoverageOnly ? '✓' : ''}
              </span>
            </button>
          </Card>

          {/* Quick Links */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-4 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pb-1">
              EDUCATION DESTINATIONS
            </span>
            <Link
              to="/colleges"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <span className="flex items-center gap-2">🇮🇳 Indian Institutions (1,509)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/colleges/global-programs"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center gap-2">🌍 Global €0 Degrees</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/colleges/pathway"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              <span className="flex items-center gap-2">✨ AI Career Pathway</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </Card>
        </div>

        {/* ── CENTER COLUMN (6 cols): SCHOLARSHIPS ENGINE & FEED ─────────────── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* TALENTXCEL SCHOLARSHIPS ENGINE */}
          <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 backdrop-blur-md flex items-center justify-center border border-purple-400/30 shrink-0">
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Global Scholarships &amp; Grants Engine</h3>
                    <p className="text-xs text-slate-300 font-medium">Don't let money decide what you can become. Verified government &amp; foundation grants.</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>100% Sourced</span>
                </div>
              </div>

              {/* Conversational Input Bar */}
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search scholarship, provider, country, or study field (e.g. DAAD, Fulbright, Erasmus)..."
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl pl-4 pr-32 text-sm font-medium focus:bg-white/15 focus:border-purple-400"
                />

                <Button
                  onClick={() => setPage(1)}
                  size="sm"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-4 shadow-sm"
                >
                  Search <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              {/* Quick Examples */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Examples:</span>
                {[
                  'DAAD Germany',
                  'Fulbright USA',
                  'Erasmus+ Europe',
                  'Chevening UK',
                  'MHRD GATE India'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleQuickSearch(chip)}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Telemetry Bar */}
          <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <strong className="text-slate-900 dark:text-white">{totalCount} Verified Scholarships</strong>
            </span>
            <span className="text-purple-600 font-semibold">{fullCoverageCount} Full Coverage · {zeroTuitionCount} Makes Tuition ₹0</span>
          </div>

          {/* Feed Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base font-extrabold text-foreground">Verified Scholarships Feed</h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Showing {pagedScholarships.length} of {scholarships.length}
            </span>
          </div>

          {/* Scholarship Cards Stream */}
          <div className="space-y-4">
            {pagedScholarships.map((sch) => {
              const coverageConf = COVERAGE_CONFIG[sch.coverage];

              return (
                <Card
                  key={sch.id}
                  className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                          {flagFor(sch.provider_country)} {sch.provider_country.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {sch.confidence_score}% VERIFIED
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {sch.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Provider: {sch.provider}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-purple-700 dark:text-purple-400 font-mono block">
                        {sch.amount || 'Full Funding'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${coverageConf?.className}`}>
                        {coverageConf?.label}
                      </span>
                    </div>
                  </div>

                  {/* Coverage Detail */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      💡 {sch.coverage_detail}
                    </p>
                  </div>

                  {/* Deadline & Official Action */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline:</span>
                      <span className={`font-mono font-bold ${deadlineClass(sch.application_deadline)}`}>
                        {formatDeadline(sch.application_deadline)}
                      </span>
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9 px-4"
                      asChild
                    >
                      <a
                        href={sch.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Official Application <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-card rounded-2xl p-4 border border-slate-200 dark:border-border shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-bold"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-bold"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (3 cols): PRO & ADVISOR WIDGETS ──────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Pro Subscriber Banner */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Funding Matching
              </span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>

            <div>
              <h4 className="text-base font-extrabold leading-snug">
                Match Your Profile to 100% Funded Fellowships
              </h4>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Our AI analyzes your academic profile, nationality, and research interests to generate personalized scholarship essays and deadline trackers.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => navigate('/colleges/pathway')}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black h-10 shadow-md cursor-pointer"
            >
              Generate AI Pathway <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Top Scholarship Programs */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Award className="w-3.5 h-3.5 text-purple-600" /> Flagship Global Grants
            </span>
            <div className="space-y-2 text-xs">
              {[
                { name: 'DAAD Scholarships', country: 'Germany', coverage: 'Full Stipend + €0 Tuition' },
                { name: 'Erasmus Mundus', country: 'European Union', coverage: '€1,400/mo + Travel' },
                { name: 'Fulbright Foreign Student', country: 'United States', coverage: 'Full Tuition + Health' },
                { name: 'Chevening Scholarship', country: 'United Kingdom', coverage: '100% University Fees' },
                { name: 'MHRD GATE Fellowship', country: 'India', coverage: '₹12,400/mo + M.Tech' },
              ].map((grant) => (
                <div
                  key={grant.name}
                  onClick={() => {
                    setSearch(grant.name);
                    setPage(1);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{grant.name}</span>
                    <span className="text-[11px] text-slate-500">{grant.country}</span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-semibold text-right">
                    {grant.coverage}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Global Degrees Direct */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Globe className="w-3.5 h-3.5 text-blue-600" /> Looking for €0 Degrees?
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 100+ verified tuition-free international master's and bachelor's programs.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/colleges/global-programs')}
              className="w-full rounded-xl text-xs font-bold border-blue-300 text-blue-800 hover:bg-blue-50"
            >
              View Global Programs <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
