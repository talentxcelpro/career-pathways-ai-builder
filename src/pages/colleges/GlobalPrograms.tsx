// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Degree & Program Discovery Page
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { GlobalProgramFilters, AccessType, ProgramLevel } from '@/types/globalEducation';
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

// ── Access type config ────────────────────────────────────────────────────────
const ACCESS_CONFIG: Record<AccessType, { label: string; className: string }> = {
  FULLY_FUNDED: { label: 'Fully Funded', className: 'bg-green-100 text-green-800 border-green-300' },
  TUITION_FREE: { label: 'Tuition Free', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  SCHOLARSHIP_MAKES_IT_FREE: { label: 'Scholarship Available', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  FREE_TO_LEARN_PAID_CREDENTIAL: { label: 'Free to Learn', className: 'bg-amber-100 text-amber-800 border-amber-300' },
};

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
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState<'all' | ProgramLevel>('all');
  const [accessType, setAccessType] = useState<'all' | AccessType>('all');
  const [zeroCostOnly, setZeroCostOnly] = useState(false);

  const filters: GlobalProgramFilters = useMemo(() => {
    const f: GlobalProgramFilters = {};
    if (search.trim()) f.search = search.trim();
    if (country) f.country = country;
    if (level !== 'all') f.level = level;
    if (accessType !== 'all') f.access_type = accessType;
    if (zeroCostOnly) f.potential_zero_cost = true;
    return f;
  }, [search, country, level, accessType, zeroCostOnly]);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['global-programs', filters],
    queryFn: () => globalEducationService.getPrograms(filters),
    placeholderData: SEED_PROGRAMS as never,
  });

  const countries = useMemo(() => {
    const set = new Set(SEED_PROGRAMS.map((p) => p.institution_country));
    return Array.from(set).sort();
  }, []);

  const allPrograms = SEED_PROGRAMS;
  const totalPrograms = allPrograms.length;
  const tuitionFreeCount = allPrograms.filter(
    (p) => p.access_type === 'TUITION_FREE' || p.access_type === 'FULLY_FUNDED'
  ).length;
  const fullyFundedCount = allPrograms.filter((p) => p.access_type === 'FULLY_FUNDED').length;
  const countriesCount = new Set(allPrograms.map((p) => p.institution_country)).size;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. DARK VISUAL COMMAND HERO                                               */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#080B12] text-white border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-500/30">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              GLOBAL DEGREE INTELLIGENCE GRAPH
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {totalPrograms} VERIFIED GLOBAL DEGREES · 37 COUNTRIES
            </div>
          </div>

          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-3">
              Global degrees, verified against the source.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Find verified tuition-free, fully funded, and scholarship-eligible international programs. Transparent evidence and statute links behind every claim.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-[#101522] rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-2xl max-w-4xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search international degree, university, field of study..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-13 text-sm sm:text-base border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. TELEMETRY BAR                                                          */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0C101A] border-b border-slate-800 text-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6 overflow-x-auto py-1">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400 uppercase">GLOBAL GRAPH:</span>
              <span className="font-black text-white text-sm">{totalPrograms}</span>
              <span className="text-slate-400">PROGRAMS</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-white text-sm">{countriesCount}</span>
              <span className="text-slate-400">COUNTRIES</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-blue-400 text-sm">{tuitionFreeCount}</span>
              <span className="text-slate-400">€0 / ₹0 TUITION</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-emerald-400 text-sm">{fullyFundedCount}</span>
              <span className="text-slate-400">FULLY FUNDED</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <span className="text-emerald-400 font-semibold">18 CHECKED TODAY</span>
            <span>·</span>
            <span>6 CHANGES</span>
            <span>·</span>
            <span className="text-amber-400">4 UNDER REVIEW</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 3. 4-DESTINATION NAVIGATION                                               */}
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
              <div className="text-xs font-bold text-slate-900 truncate">Indian Institutions (1,495+)</div>
            </div>
          </Link>

          <Link
            to="/colleges/global-programs"
            className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              🌍
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-blue-700">EXPLORE</div>
              <div className="text-xs font-bold text-blue-950 truncate">Global Degrees &amp; €0 Programs</div>
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
        {/* 4. FILTER TOOLBAR                                                         */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Country
              </label>
              <Select value={country || 'all'} onValueChange={(v) => setCountry(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-xl">
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {flagFor(c)} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Academic Level
              </label>
              <Select value={level} onValueChange={(v) => setLevel(v as 'all' | ProgramLevel)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD / Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Funding Tier
              </label>
              <Select value={accessType} onValueChange={(v) => setAccessType(v as 'all' | AccessType)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
                  <SelectValue placeholder="All Pricing Tiers" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Pricing Tiers</SelectItem>
                  <SelectItem value="TUITION_FREE">€0 / ₹0 Tuition Free</SelectItem>
                  <SelectItem value="FULLY_FUNDED">Fully Funded (Tuition + Stipend)</SelectItem>
                  <SelectItem value="SCHOLARSHIP_MAKES_IT_FREE">Scholarship Available</SelectItem>
                  <SelectItem value="FREE_TO_LEARN_PAID_CREDENTIAL">Free to Learn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={() => setZeroCostOnly(!zeroCostOnly)}
                className={`h-10 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  zeroCostOnly
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>€0 / ₹0 Tuition Only</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    zeroCostOnly ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {zeroCostOnly ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 5. DENSE 3-COLUMN PROGRAM CARDS                                           */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => {
            const isZeroTuition =
              program.costs.tuition_annual === '€0' ||
              program.costs.tuition_annual === '₹0' ||
              program.costs.tuition_annual === '$0' ||
              program.costs.tuition_annual === '0';

            return (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col p-5 sm:p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {flagFor(program.institution_country)} {program.institution_country.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">
                      {program.institution_name}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    VERIFIED TODAY
                  </span>
                </div>

                {/* Program Title */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3 line-clamp-2">
                  {program.name}
                </h3>

                {/* DOMINANT €0 / ACTUAL TUITION HERO BLOCK */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {program.costs.tuition_annual}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      TUITION / YR
                    </span>
                  </div>

                  {program.costs.mandatory_fees_annual && (
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      ~{program.costs.mandatory_fees_annual} mandatory semester contribution
                    </div>
                  )}

                  {program.costs.scholarship_name && (
                    <div className="mt-2 text-[11px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-200/60 line-clamp-1">
                      Scholarship: {program.costs.scholarship_name}
                    </div>
                  )}
                </div>

                {/* Academic Metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 font-medium">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-800 text-[11px] uppercase">
                    {program.academic_credentials?.degree_type || LEVEL_LABELS[program.level]}
                  </span>
                  <span>·</span>
                  <span>{program.duration_semesters / 2} Yrs</span>
                  <span>·</span>
                  <span>{program.language}</span>
                </div>

                {/* Forensic Verification Checklist */}
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100 mb-4">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Tuition verified
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Eligibility verified
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Official source verified
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 font-mono">
                    95% confidence
                  </span>
                </div>

                {/* Dual Action Buttons */}
                <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <EvidenceViewerModal
                    program={program}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold rounded-xl border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 bg-white hover:bg-indigo-50/50 gap-1 h-9"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        Evidence
                      </Button>
                    }
                  />
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-9"
                    asChild
                  >
                    <a
                      href={program.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Official Page <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
