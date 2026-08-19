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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-8 w-8 text-purple-600" />
          Global Scholarships &amp; Funding
        </h1>
        <p className="mt-2 text-gray-600 text-sm md:text-base max-w-3xl">
          Verified scholarships from official providers. Deadlines and amounts are sourced directly
          from official sources.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: <Award className="h-5 w-5 text-purple-500" />,
            label: 'Total Scholarships',
            value: totalCount,
          },
          {
            icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
            label: 'Full Coverage',
            value: fullCoverageCount,
          },
          {
            icon: <DollarSign className="h-5 w-5 text-blue-500" />,
            label: 'Can Make Tuition ₹0',
            value: zeroTuitionCount,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search scholarships…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={coverage} onValueChange={(v) => setCoverage(v as 'all' | ScholarshipCoverage)}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Coverage Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coverage Types</SelectItem>
            <SelectItem value="FULL">Full Coverage</SelectItem>
            <SelectItem value="TUITION">Tuition Only</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="LIVING">Living Stipend</SelectItem>
            <SelectItem value="TRAVEL">Travel</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={fullCoverageOnly ? 'default' : 'outline'}
          onClick={() => setFullCoverageOnly((prev) => !prev)}
          className={fullCoverageOnly ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        >
          Full Coverage Only
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {isLoading
          ? 'Loading…'
          : `${scholarships.length} scholarship${scholarships.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Scholarship cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scholarships.map((scholarship, idx) => {
          const covCfg = COVERAGE_CONFIG[scholarship.coverage];

          return (
            <Card
              key={scholarship.id ?? `${scholarship.title}-${idx}`}
              className="flex flex-col hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {flagFor(scholarship.provider_country)} {scholarship.provider_country}
                    </p>
                    <p className="text-sm text-gray-700 font-semibold leading-snug mt-0.5">
                      {scholarship.provider}
                    </p>
                  </div>
                  {scholarship.verification_status === 'VERIFIED' && (
                    <ShieldCheck
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      title="Verified"
                    />
                  )}
                </div>
                <CardTitle className="text-base leading-tight mt-2">
                  {scholarship.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 flex-1">
                {/* Coverage badge */}
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${covCfg.className}`}
                  >
                    {covCfg.label}
                  </span>
                </div>

                {/* Coverage detail */}
                {scholarship.coverage_detail && (
                  <p className="text-xs text-gray-500 italic">{scholarship.coverage_detail}</p>
                )}

                {/* Amount */}
                {scholarship.amount_usd && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Up to ${(scholarship.amount_usd / 1000).toFixed(0)}k / year
                  </div>
                )}

                {/* Eligible levels */}
                {scholarship.eligible_levels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {scholarship.eligible_levels.map((l) => (
                      <Badge key={l} variant="secondary" className="text-xs">
                        {LEVEL_LABELS[l]}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Deadline */}
                {scholarship.deadline && (
                  <div className={`flex items-center gap-1.5 text-xs ${deadlineClass(scholarship.deadline)}`}>
                    <CalendarClock className="h-3.5 w-3.5" />
                    Deadline: {formatDeadline(scholarship.deadline)}
                  </div>
                )}

                {/* Can make tuition ₹0 */}
                {scholarship.can_make_tuition_zero && (
                  <div className="inline-flex w-fit items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    Can make tuition ₹0
                  </div>
                )}

                {/* Globe link */}
                <div className="mt-auto pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                    asChild
                  >
                    <a href={scholarship.official_url} target="_blank" rel="noopener noreferrer">
                      Apply / Learn More <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {!isLoading && scholarships.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No scholarships match your filters.</p>
          <p className="text-sm mt-1">Try adjusting your search or removing filters.</p>
        </div>
      )}
    </div>
  );
}
