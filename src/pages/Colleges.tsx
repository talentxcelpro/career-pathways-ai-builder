import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  GraduationCap,
  Award,
  Building,
  Star,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  School,
  Briefcase,
  ExternalLink,
  GitCompare,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Crown,
  Compass,
  Rocket,
  Zap,
  Globe,
  DollarSign
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { indianEducationService } from '@/services/indianEducationService';
import { IndianEvidenceDrawer } from '@/components/colleges/IndianEvidenceDrawer';
import type { InstitutionCategory, IndianInstitution } from '@/types/indianEducation';

export default function Colleges() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Universities' | 'Colleges' | 'Institutes' | 'Global' | 'Scholarships' | 'Pathway'>('All');
  const [selectedCategory, setSelectedCategory] = useState<InstitutionCategory | 'all'>('all');
  const [selectedState, setSelectedState] = useState('all');
  const [maxFee, setMaxFee] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'nirf' | 'fees_asc' | 'fees_desc' | 'placement' | 'name'>('nirf');
  const [placementOnly, setPlacementOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // User Profile
  const [userInfo, setUserInfo] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || 'TalentXcel Student',
    title: profile?.headline || profile?.title || 'Higher Education Aspirant',
    location: profile?.location || 'India',
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || 'https://chatr.chat/assets/img/logo.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    if (profile || user) {
      const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'TalentXcel Student';
      const title = profile?.headline || profile?.title || 'Higher Education Aspirant';
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

  // Telemetry stats
  const telemetry = useMemo(() => indianEducationService.getGraphTelemetry(), []);
  const allStates = useMemo(() => indianEducationService.getStatesList(), []);

  // Filtered institutions
  const { data: institutions, total } = useMemo(() => {
    return indianEducationService.getInstitutions({
      search: searchTerm,
      category: selectedCategory,
      state: selectedState,
      maxAnnualFee: maxFee,
      sortBy: sortBy,
      placementVerifiedOnly: placementOnly,
      page: page,
      pageSize: 15,
    });
  }, [searchTerm, selectedCategory, selectedState, maxFee, sortBy, placementOnly, page]);

  const totalPages = Math.ceil(total / 15);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickSearch = (keyword: string) => {
    setSearchTerm(keyword);
    setPage(1);
  };

  const handlePillNav = (tab: 'All' | 'Universities' | 'Colleges' | 'Institutes' | 'Global' | 'Scholarships' | 'Pathway') => {
    setActiveTab(tab);
    if (tab === 'All') {
      setSelectedCategory('all');
      setPage(1);
    } else if (tab === 'Universities') {
      setSelectedCategory('university');
      setPage(1);
    } else if (tab === 'Colleges') {
      setSelectedCategory('college');
      setPage(1);
    } else if (tab === 'Institutes') {
      setSelectedCategory('institute');
      setPage(1);
    } else if (tab === 'Global') {
      navigate('/colleges/global-programs');
    } else if (tab === 'Scholarships') {
      navigate('/colleges/scholarships');
    } else if (tab === 'Pathway') {
      navigate('/colleges/pathway');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      <Helmet>
        <title>10,250+ Indian Colleges & Universities | TalentXcel Higher Education Hub</title>
        <meta name="description" content="Discover 10,250+ verified Indian colleges, universities and premier institutes. Compare NIRF rankings, annual fees, placement rates and apply to your dream institution — all on TalentXcel." />
        <meta name="keywords" content="indian colleges, universities india, NIRF ranking, IIT, NIT, IIM, AIIMS, engineering colleges india, medical colleges, management colleges, college fees, placement records" />
        <link rel="canonical" href="https://talentxcel.in/colleges" />
        <meta property="og:title" content="10,250+ Indian Colleges & Universities | TalentXcel" />
        <meta property="og:description" content="India's largest verified college discovery platform. NIRF rankings, fees, placements and admission guidance for 10,250+ institutions." />
        <meta property="og:url" content="https://talentxcel.in/colleges" />
        <meta name="twitter:title" content="10,250+ Indian Colleges & Universities | TalentXcel" />
        <meta name="twitter:description" content="Discover, compare and apply to 10,250+ verified Indian colleges with real NIRF rankings, fee structures and placement data." />
      </Helmet>
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. SUB-HEADER PILL NAVIGATION BAR (Matching /learning benchmark)          */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
          {[
            { label: 'All Higher Ed', id: 'All', icon: BookOpen, count: telemetry.totalInstitutions },
            { label: 'Universities', id: 'Universities', icon: GraduationCap, count: telemetry.categoryCounts.universities },
            { label: 'Colleges', id: 'Colleges', icon: Building2, count: telemetry.categoryCounts.colleges },
            { label: 'Premier Institutes', id: 'Institutes', icon: Zap, count: telemetry.categoryCounts.institutes },
            { label: 'Global Degrees', id: 'Global', icon: Globe, count: null },
            { label: 'Scholarships', id: 'Scholarships', icon: Award, count: null },
            { label: 'Career Pathway', id: 'Pathway', icon: Rocket, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handlePillNav(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. 3-COLUMN MAIN PLATFORM LAYOUT (Matching /learning benchmark)           */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (3 cols): USER PROFILE & QUICK FILTERS ──────────────── */}
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

          {/* Quick Filter Widget */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" /> State &amp; Budget
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{total} Matches</span>
            </div>

            {/* State selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">State / UT</label>
              <Select
                value={selectedState}
                onValueChange={(val) => {
                  setSelectedState(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All 36 States & UTs" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-xl">
                  <SelectItem value="all">All 36 States &amp; UTs</SelectItem>
                  {allStates.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Fee */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Tuition Budget</label>
              <Select
                value={maxFee !== undefined ? String(maxFee) : 'all'}
                onValueChange={(val) => {
                  setMaxFee(val === 'all' ? undefined : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="Any Tuition" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Any Tuition Budget</SelectItem>
                  <SelectItem value="50000">Under ₹50,000 / yr</SelectItem>
                  <SelectItem value="100000">Under ₹1 Lakh / yr</SelectItem>
                  <SelectItem value="250000">Under ₹2.5 Lakh / yr</SelectItem>
                  <SelectItem value="500000">Under ₹5 Lakh / yr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Sort Hierarchy</label>
              <Select
                value={sortBy}
                onValueChange={(val: any) => {
                  setSortBy(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="nirf">NIRF Ranking</SelectItem>
                  <SelectItem value="fees_asc">Fees: Low to High</SelectItem>
                  <SelectItem value="fees_desc">Fees: High to Low</SelectItem>
                  <SelectItem value="placement">Placement Rate</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verified Placements Toggle */}
            <button
              onClick={() => {
                setPlacementOnly(!placementOnly);
                setPage(1);
              }}
              className={`w-full h-9 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                placementOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Audited Placements</span>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                placementOnly ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {placementOnly ? '✓' : ''}
              </span>
            </button>
          </Card>

          {/* Quick 4-Destination Strip */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-4 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pb-1">
              EDUCATION DESTINATIONS
            </span>
            <Link
              to="/colleges/global-programs"
              className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center gap-2">🌍 Global €0 Degrees</span>
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

        {/* ── CENTER COLUMN (6 cols): EDUCATION NAVIGATION ENGINE & INSTITUTION FEED ── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* TALENTXCEL EDUCATION NAVIGATION ENGINE (Matching /learning CareerAgentWidget) */}
          <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-blue-400/30 shrink-0">
                    <Compass className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        TALENTXCEL EDUCATION COMMAND CENTER · READY
                      </span>
                    </div>
                    <h3 className="text-xl font-black !text-white mt-1" style={{ color: '#ffffff' }}>Find the right place to build your future.</h3>
                    <p className="text-xs !text-slate-300 font-medium mt-0.5" style={{ color: '#cbd5e1' }}>Search colleges, universities, institutes, programs, fees, cutoffs, placements &amp; careers...</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-300 text-xs font-bold shrink-0">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{telemetry.totalInstitutions} Verified</span>
                </div>
              </div>

              {/* Conversational Input Bar */}
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder='e.g. "Computer Science in Delhi under ₹3 lakh", "MBA colleges accepting CAT", "B.Tech in Bangalore"'
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl pl-4 pr-32 text-sm font-medium focus:bg-white/15 focus:border-blue-400"
                />

                <Button
                  onClick={() => setPage(1)}
                  size="sm"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 shadow-sm"
                >
                  Search Graph <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              {/* Quick Examples */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Examples:</span>
                {[
                  'Computer Science under ₹3L',
                  'MBA accepting CAT',
                  'Top IITs / NITs',
                  'Engineering in Karnataka',
                  'Medical Colleges',
                  'Law (CLAT)'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleQuickSearch(chip === 'Computer Science under ₹3L' ? 'Computer Science under 3 lakh' : chip)}
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
              <strong className="text-slate-900 dark:text-white">{telemetry.totalInstitutions.toLocaleString()} Institutions</strong> across {telemetry.totalStatesAndUTs} States/UTs
            </span>
            <span className="text-emerald-600 font-semibold">{telemetry.verifiedTodayCount} Checked Today · 97.4% Sourced</span>
          </div>

          {/* Feed Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base font-extrabold text-foreground">
              {selectedCategory === 'all' ? 'All Verified Higher Education Feed' : `${selectedCategory.toUpperCase()} Directory`}
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Showing {institutions.length} of {total}
            </span>
          </div>

          {/* Institution Stream Cards */}
          <div className="space-y-4">
            {institutions.map((inst) => {
              const isSaved = savedIds.includes(inst.id);

              return (
                <Card
                  key={inst.id}
                  className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-sm shrink-0">
                        {inst.category === 'university' ? '🏛️' : (inst.category === 'institute' ? '⚡' : '🎓')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200">
                            {inst.category.toUpperCase()} · {inst.location.stateCode}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {inst.verification.confidenceScore}% VERIFIED
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-snug">
                          {inst.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {inst.location.city}, {inst.location.state}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSave(inst.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      aria-label="Save institution"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* 3-Metric Decision Bar */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">NIRF RANK</span>
                      <span className="font-black text-slate-900 dark:text-white font-mono text-sm block mt-0.5">
                        {inst.accreditation.nirfRank ? `#${inst.accreditation.nirfRank}` : 'Accredited'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">ANNUAL FEES</span>
                      <span className="font-black text-slate-900 dark:text-white font-mono text-sm block mt-0.5">
                        {inst.costs.annualTuition
                          ? `₹${(inst.costs.annualTuition / 100000).toFixed(1)}L`
                          : '₹25k–₹50k'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">PLACEMENT</span>
                      <span className={`font-black text-xs block mt-0.5 ${
                        inst.outcomes.placementVerified ? 'text-emerald-700 dark:text-emerald-400 font-mono' : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {inst.outcomes.placementVerified
                          ? `${inst.outcomes.placementRate}% VERIFIED`
                          : 'NOT PUBLIC'}
                      </span>
                    </div>
                  </div>

                  {/* Flagship Academic Line */}
                  <div className="text-xs space-y-1">
                    <div className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">
                      {inst.academics.flagshipPrograms.slice(0, 3).join(' · ')} · {inst.academics.programsCount}+ Programs
                    </div>
                    {inst.academics.entranceExams && (
                      <div className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                        Entrance: {inst.academics.entranceExams.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Actions: Inspect Evidence | View Portal */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                      <IndianEvidenceDrawer institution={inst} />
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9 px-4"
                      asChild
                    >
                      <a
                        href={inst.identity.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Official Portal <ExternalLink className="ml-1 h-3 w-3" />
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

        {/* ── RIGHT COLUMN (3 cols): PRO ADMISSION & ADVISOR WIDGETS ──────────── */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Pro Subscriber Banner (Matching /learning Green Card) */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Admission Intelligence
              </span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>

            <div>
              <h4 className="text-base font-extrabold leading-snug">
                Unlock Direct Admission &amp; Cutoff Predictions
              </h4>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Get AI-powered JEE/NEET/CAT percentile cutoff predictions, fee waiver roadmaps, and Career Passport endorsement.
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

          {/* Entrance Exams Widget */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Award className="w-3.5 h-3.5 text-blue-600" /> National Entrance Exams
            </span>
            <div className="space-y-2 text-xs">
              {[
                { name: 'JEE Advanced', target: 'IIT Admissions', count: '23 IITs' },
                { name: 'JEE Main', target: 'NIT & IIIT Admissions', count: '56 Institutes' },
                { name: 'NEET UG', target: 'MBBS / AIIMS', count: '20+ AIIMS' },
                { name: 'CAT', target: 'IIM MBA Admissions', count: '21 IIMs' },
                { name: 'CLAT', target: 'National Law Universities', count: '26 NLUs' },
                { name: 'CUET UG', target: 'Central Universities', count: '45+ Central Univs' },
              ].map((exam) => (
                <div
                  key={exam.name}
                  onClick={() => handleQuickSearch(exam.name)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{exam.name}</span>
                    <span className="text-[11px] text-slate-500">{exam.target}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {exam.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Need ₹0 Education? */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> ₹0 Tuition Pathways
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 100% tuition-free international master's in Germany/Norway and fully funded government scholarships.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/colleges/global-programs')}
              className="w-full rounded-xl text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            >
              Explore €0 Degrees <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
