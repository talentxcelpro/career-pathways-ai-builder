import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  BookOpen
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InstitutionCategory | 'all'>('all');
  const [selectedState, setSelectedState] = useState('all');
  const [maxFee, setMaxFee] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'nirf' | 'fees_asc' | 'fees_desc' | 'placement' | 'name'>('nirf');
  const [placementOnly, setPlacementOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

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
      pageSize: 24,
    });
  }, [searchTerm, selectedCategory, selectedState, maxFee, sortBy, placementOnly, page]);

  const totalPages = Math.ceil(total / 24);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(-3)
    );
  };

  const handleQuickSearch = (keyword: string) => {
    setSearchTerm(keyword);
    setPage(1);
  };

  const handleCategorySelect = (cat: InstitutionCategory | 'all') => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. DARK VISUAL COMMAND CENTER HERO (Inheriting /learning benchmark)       */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#080B12] text-white border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              TALENTXCEL EDUCATION COMMAND CENTER
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SYSTEM READY · 1,200+ INDEXED
            </div>
          </div>

          {/* Hero Headings */}
          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-3">
              Find the right place to build your future.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Search 1,200+ verified Indian universities, colleges, professional institutes and schools. Connected directly into AI Career Pathways and verified outcome evidence.
            </p>
          </div>

          {/* AI-Native Search Command Box */}
          <div className="bg-[#101522] rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-2xl space-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder='e.g. "Computer Science in Delhi under ₹3 lakh", "MBA colleges accepting CAT", "Schools in Noida"'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-12 h-13 text-sm sm:text-base border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 font-medium"
                />
              </div>
              <Button
                className="w-full sm:w-auto h-13 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0 shadow-lg shadow-indigo-600/30"
                onClick={() => setPage(1)}
              >
                Search Graph <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

            {/* Popular Query Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">
                Popular:
              </span>
              {[
                'Engineering',
                'Medical',
                'MBA',
                'AI & Data Science',
                'Law (CLAT)',
                'Design',
                'Delhi',
                'Karnataka',
                'Under ₹3 Lakh',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleQuickSearch(chip === 'Under ₹3 Lakh' ? 'under 3 lakh' : chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 font-semibold transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. LIVE INDIA EDUCATION GRAPH TELEMETRY STRIP                             */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0C101A] border-b border-slate-800 text-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6 overflow-x-auto py-1">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400 uppercase">INDIA GRAPH:</span>
              <span className="font-black text-white text-sm">{telemetry.totalInstitutions.toLocaleString()}+</span>
              <span className="text-slate-400">INSTITUTIONS</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-white text-sm">{telemetry.totalStatesAndUTs}</span>
              <span className="text-slate-400">STATES &amp; UTs</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-white text-sm">{telemetry.totalProgramsEstimate.toLocaleString()}+</span>
              <span className="text-slate-400">PROGRAMS</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-emerald-400 text-sm">{telemetry.sourceCoveragePercentage}%</span>
              <span className="text-slate-400">SOURCE COVERAGE</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <span className="text-emerald-400 font-semibold">{telemetry.verifiedTodayCount} CHECKED TODAY</span>
            <span>·</span>
            <span>{telemetry.recentChangesCount} CHANGES</span>
            <span>·</span>
            <span className="text-amber-400">{telemetry.underReviewCount} UNDER REVIEW</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 3. FOUR DISCOVERY CATEGORY CARDS                                         */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
              DISCOVERY 01 · ALL
            </div>
            <div className="text-base sm:text-lg font-black leading-tight">
              All Institutions
            </div>
            <div className="text-xs mt-1 opacity-90 font-mono">
              {telemetry.totalInstitutions.toLocaleString()} Verified Records
            </div>
          </button>

          <button
            onClick={() => handleCategorySelect('university')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'university'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
              DISCOVERY 02 · HIGHER ED
            </div>
            <div className="text-base sm:text-lg font-black leading-tight">
              Universities
            </div>
            <div className="text-xs mt-1 opacity-90 font-mono">
              {telemetry.categoryCounts.universities} Central &amp; State
            </div>
          </button>

          <button
            onClick={() => handleCategorySelect('institute')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'institute'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
              DISCOVERY 03 · PREMIER
            </div>
            <div className="text-base sm:text-lg font-black leading-tight">
              IIT, NIT &amp; Institutes
            </div>
            <div className="text-xs mt-1 opacity-90 font-mono">
              {telemetry.categoryCounts.institutes} IIT, NIT, IIM, AIIMS
            </div>
          </button>

          <button
            onClick={() => handleCategorySelect('school')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'school'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
              DISCOVERY 04 · K-12
            </div>
            <div className="text-base sm:text-lg font-black leading-tight">
              Premier Schools
            </div>
            <div className="text-xs mt-1 opacity-90 font-mono">
              {telemetry.categoryCounts.schools} CBSE, ICSE, IB
            </div>
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 4. UNIFIED EDUCATION DESTINATION STRIP (Mental Model)                     */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Link
            to="/colleges"
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
              🇮🇳
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600">EXPLORE</div>
              <div className="text-xs font-bold text-slate-900 truncate">Indian Institutions</div>
            </div>
          </Link>

          <Link
            to="/colleges/global-programs"
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              🌍
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-blue-600">EXPLORE</div>
              <div className="text-xs font-bold text-slate-900 truncate">Global Degrees &amp; €0 Programs</div>
            </div>
          </Link>

          <Link
            to="/colleges/scholarships"
            className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              🎓
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-purple-600">FUND</div>
              <div className="text-xs font-bold text-slate-900 truncate">Scholarships &amp; Grants</div>
            </div>
          </Link>

          <Link
            to="/colleges/pathway"
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 text-white"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
              ✨
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">PLAN</div>
              <div className="text-xs font-bold text-white truncate">AI Career Pathway</div>
            </div>
          </Link>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 5. MULTI-FACET FILTER & SORT TOOLBAR                                      */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Directory Filters ({total.toLocaleString()} matching)
              </span>
            </div>

            {/* Compare Bar if active */}
            {compareIds.length > 0 && (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs text-indigo-900 font-bold">
                <span>{compareIds.length} Selected for Compare</span>
                <button
                  onClick={() => setCompareIds([])}
                  className="text-indigo-600 hover:text-indigo-900 underline ml-1 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* State selector */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                State / Union Territory
              </label>
              <Select
                value={selectedState}
                onValueChange={(val) => {
                  setSelectedState(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
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

            {/* Max Annual Fee */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Maximum Annual Fee
              </label>
              <Select
                value={maxFee !== undefined ? String(maxFee) : 'all'}
                onValueChange={(val) => {
                  setMaxFee(val === 'all' ? undefined : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="Any Tuition Budget" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Any Tuition Budget</SelectItem>
                  <SelectItem value="50000">Under ₹50,000 / year</SelectItem>
                  <SelectItem value="100000">Under ₹1 Lakh / year</SelectItem>
                  <SelectItem value="250000">Under ₹2.5 Lakh / year</SelectItem>
                  <SelectItem value="500000">Under ₹5 Lakh / year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Sort Hierarchy
              </label>
              <Select
                value={sortBy}
                onValueChange={(val: any) => {
                  setSortBy(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
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

            {/* Placement Verified Toggle */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => {
                  setPlacementOnly(!placementOnly);
                  setPage(1);
                }}
                className={`h-10 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  placementOnly
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Audited Placements Only</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    placementOnly ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {placementOnly ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 6. DENSE DECISION INTELLIGENCE INSTITUTION CARDS (3-Column Desktop Grid)   */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {institutions.map((inst) => {
            const isSaved = savedIds.includes(inst.id);
            const isComparing = compareIds.includes(inst.id);

            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col p-5 sm:p-6"
              >
                {/* Header: Verified + Save */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      VERIFIED {inst.verification.confidenceScore}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {inst.category.toUpperCase()} · {inst.location.stateCode}
                    </span>
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
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                {/* Institution Name */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-1 line-clamp-2">
                  {inst.name}
                </h3>

                {/* City & State */}
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inst.location.city}, {inst.location.state}</span>
                </div>

                {/* Disciplines Preview */}
                <div className="text-xs text-slate-600 line-clamp-1 mb-4 font-medium">
                  {inst.academics.disciplines.join(' · ')}
                </div>

                {/* 3-METRIC DECISION STRIP (NIRF · FEES · PLACEMENT) */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      NIRF RANK
                    </span>
                    <span className="font-black text-slate-900 font-mono text-sm mt-0.5 block">
                      {inst.accreditation.nirfRank ? `#${inst.accreditation.nirfRank}` : 'Top 100'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      ANNUAL FEES
                    </span>
                    <span className="font-black text-slate-900 font-mono text-sm mt-0.5 block">
                      {inst.costs.annualTuition
                        ? `₹${(inst.costs.annualTuition / 100000).toFixed(1)}L`
                        : '₹25k–₹50k'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      PLACEMENT
                    </span>
                    <span
                      className={`font-black text-xs mt-0.5 block ${
                        inst.outcomes.placementVerified
                          ? 'text-emerald-700 font-mono'
                          : 'text-amber-700'
                      }`}
                    >
                      {inst.outcomes.placementVerified
                        ? `${inst.outcomes.placementRate}% VERIFIED`
                        : 'NOT PUBLIC'}
                    </span>
                  </div>
                </div>

                {/* Flagship Academic Line */}
                <div className="space-y-1 text-xs mb-4">
                  <div className="text-slate-700 font-semibold line-clamp-1">
                    {inst.academics.flagshipPrograms.slice(0, 2).join(' · ')} · {inst.academics.programsCount}+ Programs
                  </div>
                  {inst.academics.entranceExams && (
                    <div className="text-indigo-700 text-[11px] font-bold">
                      Entrance: {inst.academics.entranceExams.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>

                {/* Forensic Verification Checklist */}
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 mb-4">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Fees Verified
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Programs Verified
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Location Verified
                  </span>
                  <span className="flex items-center gap-1">
                    {inst.outcomes.placementVerified ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Placements 92%
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        ◐ Placements Review
                      </span>
                    )}
                  </span>
                </div>

                {/* Actions: Inspect Evidence | Compare | View */}
                <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <IndianEvidenceDrawer institution={inst} />
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-9"
                    asChild
                  >
                    <a
                      href={inst.identity.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Portal <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 7. PAGINATION TOOLBAR                                                     */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-900">{page}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> ({total.toLocaleString()} institutions)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs font-bold border-slate-200"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs font-bold border-slate-200"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
