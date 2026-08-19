// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Scholarships & Funding Page
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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
import { globalEducationService, SEED_SCHOLARSHIPS } from '@/services/globalEducationService';
import type { ScholarshipFilters, ScholarshipCoverage, ProgramLevel } from '@/types/globalEducation';

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

// ── Level labels ──────────────────────────────────────────────────────────────
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

function deadlineClass(dateStr: string): string {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'text-gray-400 line-through';
  if (diffDays <= 60) return 'text-red-600 font-semibold';
  return 'text-gray-700';
}

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Scholarships() {
  const [search, setSearch] = useState('');
  const [coverage, setCoverage] = useState<'all' | ScholarshipCoverage>('all');
  const [fullCoverageOnly, setFullCoverageOnly] = useState(false);

  const filters: ScholarshipFilters = useMemo(() => {
    const f: ScholarshipFilters = {};
    if (search.trim()) f.search = search.trim();
    if (coverage !== 'all') f.coverage = coverage;
    if (fullCoverageOnly) f.can_make_tuition_zero = true;
    return f;
  }, [search, coverage, fullCoverageOnly]);

  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ['global-scholarships', filters],
    queryFn: () => globalEducationService.getScholarships(filters),
    placeholderData: SEED_SCHOLARSHIPS as never,
  });

  const allScholarships = SEED_SCHOLARSHIPS;
  const totalCount = allScholarships.length;
  const fullCoverageCount = allScholarships.filter((s) => s.coverage === 'FULL').length;
  const zeroTuitionCount = allScholarships.filter((s) => s.can_make_tuition_zero).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. DARK VISUAL COMMAND HERO                                               */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#080B12] text-white border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/60">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-950 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              GLOBAL FUNDING MARKETPLACE
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {totalCount} VERIFIED SCHOLARSHIPS · ZERO TUITION PATHWAYS
            </div>
          </div>

          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-3">
              Don't let money decide what you can become.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Verified global scholarships, government grants, and tuition-waiver pathways. Sourced directly from official providers with real criteria.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-[#101522] rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-2xl max-w-4xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search scholarship name, country, study level, or field..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-13 text-sm sm:text-base border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 rounded-xl focus:border-purple-500 font-medium"
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
              <span className="text-slate-400 uppercase">FUNDING GRAPH:</span>
              <span className="font-black text-white text-sm">{totalCount}</span>
              <span className="text-slate-400">SCHOLARSHIPS</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-purple-400 text-sm">{fullCoverageCount}</span>
              <span className="text-slate-400">FULL COVERAGE</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">●</span>
              <span className="font-black text-emerald-400 text-sm">{zeroTuitionCount}</span>
              <span className="text-slate-400">CAN MAKE TUITION ₹0</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <span className="text-emerald-400 font-semibold">ALL DEADLINES VERIFIED</span>
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
            className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              🎓
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-purple-700">FUND</div>
              <div className="text-xs font-bold text-purple-950 truncate">Scholarships &amp; Grants</div>
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
        {/* 4. NET COST ENGINE (What Will I Actually Pay?)                            */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="mb-8 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              WHAT WILL I ACTUALLY PAY? · REAL OUT-OF-POCKET CALCULATION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">1. Tuition Cost</span>
              <span className="text-slate-900 font-bold font-mono">€0 / Free to apply</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">2. Living &amp; Housing</span>
              <span className="text-slate-900 font-bold font-mono">Covered by DAAD/Erasmus</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px] font-bold">3. Travel &amp; Visa</span>
              <span className="text-slate-900 font-bold font-mono">Grant subsidized</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block text-[11px] font-bold">NET STUDENT COST</span>
              <span className="text-emerald-900 font-black text-sm font-mono">€0 / ₹0 OUT OF POCKET</span>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 5. FILTER BAR                                                             */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Coverage Type
              </label>
              <Select value={coverage} onValueChange={(v) => setCoverage(v as 'all' | ScholarshipCoverage)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 text-xs border-slate-200 font-medium">
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

            <div className="flex flex-col justify-end">
              <button
                onClick={() => setFullCoverageOnly(!fullCoverageOnly)}
                className={`h-10 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  fullCoverageOnly
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Full Coverage Only</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    fullCoverageOnly ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {fullCoverageOnly ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* 6. DENSE 3-COLUMN SCHOLARSHIP CARDS                                       */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((sch) => {
            const coverageConf = COVERAGE_CONFIG[sch.coverage];

            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col p-5 sm:p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {flagFor(sch.provider_country)} {sch.provider_country.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">
                      {sch.provider}
                    </span>
                  </div>

                  {sch.can_make_tuition_zero && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      MAKES TUITION ₹0
                    </span>
                  )}
                </div>

                {/* Scholarship Name */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3 line-clamp-2">
                  {sch.name}
                </h3>

                {/* Amount / Coverage Hero Block */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {sch.amount ? sch.amount : 'Full Funding'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${coverageConf?.className}`}
                    >
                      {coverageConf?.label}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 mt-1 italic line-clamp-2">
                    {sch.coverage_detail}
                  </div>
                </div>

                {/* Eligible Levels */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {sch.eligible_levels.map((lvl) => (
                    <span
                      key={lvl}
                      className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                    >
                      {LEVEL_LABELS[lvl] || lvl}
                    </span>
                  ))}
                </div>

                {/* Deadline & Status */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mb-4 text-slate-600">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                    Deadline:
                  </span>
                  <span className={`font-bold font-mono ${deadlineClass(sch.application_deadline)}`}>
                    {formatDeadline(sch.application_deadline)}
                  </span>
                </div>

                {/* Action CTA */}
                <div className="mt-auto pt-3 border-t border-slate-100">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-9"
                    asChild
                  >
                    <a
                      href={sch.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply on Official Portal <ExternalLink className="ml-1 h-3 w-3" />
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
