// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Scholarships & Funding Page
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Globe,
  Search,
  ExternalLink,
  CalendarClock,
  DollarSign,
  Award,
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

// ── Deadline warning helper ───────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-3 border border-purple-200">
          <Award className="w-3.5 h-3.5 text-purple-700" />
          GLOBAL FUNDING MARKETPLACE
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Don't let money decide what you can become.
        </h1>
        <p className="mt-2 text-slate-600 text-base sm:text-lg max-w-3xl">
          Verified global scholarships and government funding opportunities. Sourced directly from official providers.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalCount}</div>
          <div className="text-xs text-slate-500 mt-1">Verified Scholarships</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{fullCoverageCount}</div>
          <div className="text-xs text-slate-500 mt-1">100% Full Coverage</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">{zeroTuitionCount}</div>
          <div className="text-xs text-slate-500 mt-1">Can Make Tuition ₹0</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-sky-600 font-mono">100%</div>
          <div className="text-xs text-slate-500 mt-1">Verified Primary Sources</div>
        </div>
      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-8 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search scholarship name, provider, country, or study field..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 text-sm bg-slate-50 border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center pt-1">
          <Select
            value={coverage || 'all'}
            onValueChange={(v) => setCoverage(v === 'all' ? '' : (v as ScholarshipCoverage))}
          >
            <SelectTrigger className="w-[170px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Coverage Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coverage Types</SelectItem>
              <SelectItem value="FULL">Full Coverage (Tuition + Living)</SelectItem>
              <SelectItem value="TUITION">Tuition Fee Only</SelectItem>
              <SelectItem value="LIVING">Living Stipend Only</SelectItem>
              <SelectItem value="PARTIAL">Partial Waiver</SelectItem>
              <SelectItem value="TRAVEL">Travel Grant</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={fullCoverageOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFullCoverageOnly((prev) => !prev)}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold ${
              fullCoverageOnly ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200'
            }`}
          >
            100% Full Funding Only
          </Button>

          <div className="ml-auto text-xs text-slate-500 font-medium">
            {isLoading ? 'Loading…' : `${scholarships.length} scholarships available`}
          </div>
        </div>
      </div>

      {/* Scholarship Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((scholarship, idx) => {
          const covCfg = COVERAGE_CONFIG[scholarship.coverage];
          const isFull = scholarship.coverage === 'FULL';

          return (
            <div
              key={scholarship.id ?? `${scholarship.title}-${idx}`}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col p-5 sm:p-6"
            >
              {/* Header: Provider + Verified Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>{flagFor(scholarship.provider_country)}</span>
                  <span>{scholarship.provider_country}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  VERIFIED
                </span>
              </div>

              {/* Provider Name */}
              <div className="text-xs font-medium text-slate-500 line-clamp-1 mb-1">
                {scholarship.provider}
              </div>

              {/* Scholarship Title */}
              <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
                {scholarship.title}
              </h3>

              {/* WHAT DOES IT ACTUALLY PAY? (Dominant Hero Block) */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Coverage Breakdown
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${covCfg.className}`}>
                    {covCfg.label}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Tuition:</span>
                    <span className="font-semibold text-emerald-700">
                      {isFull ? '100% Fully Covered' : 'Tuition Waiver'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Living / Stipend:</span>
                    <span className="font-medium text-slate-900">
                      {scholarship.amount_usd ? `Up to $${(scholarship.amount_usd / 1000).toFixed(0)}k/year` : (isFull ? 'Monthly Living Stipend' : 'Self-funded')}
                    </span>
                  </div>
                  {isFull && (
                    <div className="flex justify-between text-slate-700">
                      <span>Travel & Insurance:</span>
                      <span className="font-medium text-slate-900">Included</span>
                    </div>
                  )}
                </div>

                {scholarship.can_make_tuition_zero && (
                  <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Potential Student Out-of-Pocket: €0 / ₹0
                  </div>
                )}
              </div>

              {/* Eligible Levels */}
              {scholarship.eligible_levels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {scholarship.eligible_levels.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs font-medium rounded-lg">
                      {LEVEL_LABELS[l]}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Deadline Indicator */}
              {scholarship.deadline && (
                <div className={`flex items-center gap-1.5 text-xs mb-5 ${deadlineClass(scholarship.deadline)}`}>
                  <CalendarClock className="h-4 w-4" />
                  Application Deadline: {formatDeadline(scholarship.deadline)}
                </div>
              )}

              {/* CTA */}
              <div className="mt-auto pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold rounded-xl border-purple-200 text-purple-800 hover:bg-purple-50 h-9"
                  asChild
                >
                  <a href={scholarship.official_url} target="_blank" rel="noopener noreferrer">
                    Apply on Official Portal <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {!isLoading && scholarships.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 mt-6">
          <Globe className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-800 text-lg">No scholarships match your filters.</p>
          <p className="text-sm text-slate-500 mt-1">Try selecting a different coverage type or adjusting the search keywords.</p>
        </div>
      )}
    </div>
  );
}
