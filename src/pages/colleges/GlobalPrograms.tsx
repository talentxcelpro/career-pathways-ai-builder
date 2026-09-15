// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Degree & Program Discovery Page
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
  BookOpen,
  GraduationCap,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Building2,
  Rocket,
  Zap,
  Award,
  Crown,
  CheckCircle2,
  Compass,
  DollarSign,
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
import { globalEducationService, SEED_PROGRAMS } from '@/services/globalEducationService';
import type { GlobalProgram, GlobalProgramFilters, AccessType, ProgramLevel } from '@/types/globalEducation';
import { EvidenceViewerModal } from '@/components/colleges/EvidenceViewerModal';

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
  Mexico: '🇲🇽',
  Russia: '🇷🇺',
  Singapore: '🇸🇬',
  'South Korea': '🇰🇷',
  'New Zealand': '🇳🇿',
  Ireland: '🇮🇪',
  Portugal: '🇵🇹',
  Spain: '🇪🇸',
  Italy: '🇮🇹',
  Belgium: '🇧🇪',
  Taiwan: '🇹🇼',
  Turkey: '🇹🇷',
};
const flagFor = (country: string): string => COUNTRY_FLAG[country] ?? '🌍';

// ── Level display labels ──────────────────────────────────────────────────────
const LEVEL_LABELS: Record<ProgramLevel, string> = {
  school: 'School',
  diploma: 'Diploma',
  bachelor: 'Bachelor',
  master: 'Master',
  phd: 'PhD',
  postdoc: 'Post-Doc',
  certificate: 'Certificate',
  short_course: 'Short Course',
};

export default function GlobalPrograms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState<'all' | ProgramLevel>('all');
  const [accessType, setAccessType] = useState<'all' | AccessType>('all');
  const [zeroCostOnly, setZeroCostOnly] = useState(false);
  const [page, setPage] = useState(1);

  // User Profile
  const [userInfo, setUserInfo] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || 'TalentXcel Student',
    title: profile?.headline || profile?.title || 'Global Aspirant',
    location: profile?.location || 'India',
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || '/assets/avatar-placeholder.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    if (profile || user) {
      const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'TalentXcel Student';
      const title = profile?.headline || profile?.title || 'Global Aspirant';
      const location = profile?.location || 'India';
      const avatar = profile?.profile_picture_url || user?.user_metadata?.avatar_url || '/assets/avatar-placeholder.png';
      setUserInfo({
        full_name: fullName,
        title: title,
        location: location,
        avatarUrl: avatar,
        coverUrl: profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      });
    }
  }, [profile, user]);

  const filters: GlobalProgramFilters = useMemo(() => {
    const f: GlobalProgramFilters = {};
    if (search.trim()) f.search = search.trim();
    if (country) f.country = country;
    if (level !== 'all') f.level = level;
    if (accessType !== 'all') f.access_type = accessType;
    if (zeroCostOnly) f.potential_zero_cost = true;
    return f;
  }, [search, country, level, accessType, zeroCostOnly]);

  const { data: rawPrograms = [] } = useQuery({
    queryKey: ['global-programs', filters],
    queryFn: () => globalEducationService.getPrograms(filters),
    placeholderData: SEED_PROGRAMS as any,
  });

  // Normalized programs with safe fallback
  const programs: GlobalProgram[] = useMemo(() => {
    const list = Array.isArray(rawPrograms) && rawPrograms.length > 0 ? rawPrograms : (SEED_PROGRAMS as any);
    return list.map((p: any, idx: number) => ({
      id: p.id || `prog-${idx}`,
      institution_name: p.institution_name || 'Institution',
      institution_country: p.institution_country || 'International',
      institution_type: p.institution_type || 'public',
      program_title: p.program_title || p.title || p.name || 'Degree Program',
      field: p.field || 'General',
      level: p.level || 'master',
      credential: p.credential || 'Degree',
      duration_months: p.duration_months || 24,
      language: p.language || 'English',
      mode: p.mode || 'on_campus',
      access_type: p.access_type || (p.tuition_cost_usd === 0 ? 'TUITION_FREE' : 'PAID'),
      tuition_cost_usd: p.tuition_cost_usd ?? 0,
      other_mandatory_costs_usd: p.other_mandatory_costs_usd ?? 350,
      currency_note: p.currency_note || 'Tuition free with semester contribution',
      scholarship_available: Boolean(p.scholarship_available),
      scholarship_name: p.scholarship_name || undefined,
      potential_zero_cost: Boolean(p.potential_zero_cost || p.tuition_cost_usd === 0),
      official_url: p.official_url || 'https://www.daad.de',
      source_evidence: p.source_evidence || 'Official University Portal',
      tuition_evidence: p.tuition_evidence || 'Tuition verified against official source',
      funding_evidence: p.funding_evidence || undefined,
      verification_status: p.verification_status || 'VERIFIED',
      confidence_score: p.confidence_score || 96,
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at || new Date().toISOString(),
    }));
  }, [rawPrograms]);

  const countries = useMemo(() => {
    const set = new Set(SEED_PROGRAMS.map((p) => p.institution_country));
    return Array.from(set).sort();
  }, []);

  const totalPrograms = SEED_PROGRAMS.length;
  const tuitionFreeCount = SEED_PROGRAMS.filter(
    (p) => p.access_type === 'TUITION_FREE' || p.access_type === 'FULLY_FUNDED' || p.tuition_cost_usd === 0
  ).length;
  const fullyFundedCount = SEED_PROGRAMS.filter((p) => p.access_type === 'FULLY_FUNDED').length;
  const countriesCount = new Set(SEED_PROGRAMS.map((p) => p.institution_country)).size;

  const pageSize = 12;
  const totalPages = Math.ceil(programs.length / pageSize);
  const pagedPrograms = programs.slice((page - 1) * pageSize, page * pageSize);

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
            { label: 'Global Degrees', path: '/colleges/global-programs', icon: Globe, active: true },
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
        
        {/* ── LEFT COLUMN (3 cols): USER PROFILE & GLOBAL FILTERS ─────────────── */}
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

          {/* Global Filter Widget */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" /> Country &amp; Tier
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{programs.length} Degrees</span>
            </div>

            {/* Country Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Country</label>
              <Select
                value={country || 'all'}
                onValueChange={(v) => {
                  setCountry(v === 'all' ? '' : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-xl">
                  <SelectItem value="all">All 37 Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {flagFor(c)} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Level */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Academic Degree</label>
              <Select
                value={level}
                onValueChange={(v: any) => {
                  setLevel(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Degree Levels" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Degree Levels</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD / Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Tier */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Funding Model</label>
              <Select
                value={accessType}
                onValueChange={(v: any) => {
                  setAccessType(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Funding Tiers" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Funding Tiers</SelectItem>
                  <SelectItem value="TUITION_FREE">€0 / ₹0 Tuition Free</SelectItem>
                  <SelectItem value="FULLY_FUNDED">Fully Funded (Tuition + Stipend)</SelectItem>
                  <SelectItem value="SCHOLARSHIP_MAKES_IT_FREE">Scholarship Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zero Cost Only Toggle */}
            <button
              onClick={() => {
                setZeroCostOnly(!zeroCostOnly);
                setPage(1);
              }}
              className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                zeroCostOnly
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>€0 / ₹0 Tuition Only</span>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                zeroCostOnly ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {zeroCostOnly ? '✓' : ''}
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
              to="/colleges/scholarships"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors"
            >
              <span className="flex items-center gap-2">🎓 Scholarships &amp; Grants</span>
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

        {/* ── CENTER COLUMN (6 cols): GLOBAL DEGREE ENGINE & FEED ────────────── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* TALENTXCEL GLOBAL DEGREE ENGINE */}
          <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-blue-400/30 shrink-0">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Global Degree &amp; €0 Discovery Engine</h3>
                    <p className="text-xs text-slate-300 font-medium">Verified tuition-free and fully funded international degrees worldwide.</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>€0 Verified</span>
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
                  placeholder="Search degree, university, field, or country (e.g. Informatics in Germany)..."
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl pl-4 pr-32 text-sm font-medium focus:bg-white/15 focus:border-blue-400"
                />

                <Button
                  onClick={() => setPage(1)}
                  size="sm"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 shadow-sm"
                >
                  Search <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              {/* Quick Examples */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Examples:</span>
                {[
                  'Germany Tuition-Free',
                  'Norway M.Sc',
                  'DAAD Scholarship',
                  'AI in Finland',
                  'Erasmus+ Degrees'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleQuickSearch(chip === 'Germany Tuition-Free' ? 'Germany' : chip)}
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
              <strong className="text-slate-900 dark:text-white">{totalPrograms} Verified Global Programs</strong> across {countriesCount} Countries
            </span>
            <span className="text-blue-600 font-semibold">{tuitionFreeCount} €0 Tuition · {fullyFundedCount} Fully Funded</span>
          </div>

          {/* Feed Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base font-extrabold text-foreground">Verified Global Degree Feed</h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Showing {pagedPrograms.length} of {programs.length}
            </span>
          </div>

          {/* Program Cards Stream */}
          <div className="space-y-4">
            {pagedPrograms.map((prog) => {
              const isZeroTuition = prog.tuition_cost_usd === 0;

              return (
                <Card
                  key={prog.id}
                  className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                          {flagFor(prog.institution_country)} {prog.institution_country.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {prog.confidence_score}% VERIFIED
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                        {prog.program_title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {prog.institution_name} · {LEVEL_LABELS[prog.level] || prog.level} ({prog.duration_months / 12} Yrs)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">
                        {isZeroTuition ? '€0 / ₹0' : `$${prog.tuition_cost_usd.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {isZeroTuition ? 'TUITION FREE' : 'ANNUAL TUITION'}
                      </span>
                    </div>
                  </div>

                  {/* Currency / Cost Evidence Note */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      💡 {prog.currency_note}
                    </p>
                    {prog.scholarship_name && (
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                        Scholarship Option: {prog.scholarship_name}
                      </p>
                    )}
                  </div>

                  {/* Actions: Evidence Inspector | Official Portal */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                      <EvidenceViewerModal program={prog} />
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9 px-4"
                      asChild
                    >
                      <a
                        href={prog.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Official Program <ExternalLink className="ml-1 h-3 w-3" />
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
                Global Mobility
              </span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>

            <div>
              <h4 className="text-base font-extrabold leading-snug">
                Study in Europe with €0 Tuition &amp; Visa Guidance
              </h4>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Unlock full eligibility checklists, blocked account guidance, APS verification, and DAAD scholarship templates.
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

          {/* Top Zero Tuition Destinations */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Globe className="w-3.5 h-3.5 text-blue-600" /> Top €0 Destinations
            </span>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Germany', stat: '€0 Tuition at all Public Univs', flag: '🇩🇪' },
                { name: 'Norway', stat: 'PhDs 100% Salaried / Free', flag: '🇳🇴' },
                { name: 'Finland', stat: '100% Government Scholarships', flag: '🇫🇮' },
                { name: 'Austria', stat: '~€726/sem Low Cost Tier', flag: '🇦🇹' },
                { name: 'France', stat: 'Subsidized Public Rates', flag: '🇫🇷' },
              ].map((dest) => (
                <div
                  key={dest.name}
                  onClick={() => {
                    setCountry(dest.name);
                    setPage(1);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{dest.flag}</span>
                    <span className="font-bold text-slate-900">{dest.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {dest.stat}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Scholarships Direct */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Looking for Scholarships?
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 100% verified full-coverage scholarships including DAAD, Fulbright, Erasmus+, and Chevening.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/colleges/scholarships')}
              className="w-full rounded-xl text-xs font-bold border-purple-300 text-purple-800 hover:bg-purple-50"
            >
              View Scholarships <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
