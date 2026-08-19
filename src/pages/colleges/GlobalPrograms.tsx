// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Degree & Program Discovery Page
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Globe,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Search,
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          Global Degree &amp; Program Discovery
        </h1>
        <p className="mt-2 text-gray-600 text-sm md:text-base max-w-3xl">
          Verified tuition-free, fully funded and scholarship-eligible programs worldwide.
          All costs shown are real.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <BookOpen className="h-5 w-5 text-blue-500" />, label: 'Total Programs', value: totalPrograms },
          { icon: <ShieldCheck className="h-5 w-5 text-blue-500" />, label: 'Tuition-Free', value: tuitionFreeCount },
          { icon: <GraduationCap className="h-5 w-5 text-green-500" />, label: 'Fully Funded', value: fullyFundedCount },
          { icon: <Globe className="h-5 w-5 text-purple-500" />, label: 'Countries', value: countriesCount },
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
            placeholder="Search programs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={country || 'all'} onValueChange={(v) => setCountry(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {flagFor(c)} {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={level} onValueChange={(v) => setLevel(v as 'all' | ProgramLevel)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {(['bachelor', 'master', 'phd', 'certificate'] as ProgramLevel[]).map((l) => (
              <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={accessType} onValueChange={(v) => setAccessType(v as 'all' | AccessType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Access Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access Types</SelectItem>
            <SelectItem value="FULLY_FUNDED">Fully Funded</SelectItem>
            <SelectItem value="TUITION_FREE">Tuition Free</SelectItem>
            <SelectItem value="SCHOLARSHIP_MAKES_IT_FREE">Scholarship Available</SelectItem>
            <SelectItem value="FREE_TO_LEARN_PAID_CREDENTIAL">Free to Learn</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={zeroCostOnly ? 'default' : 'outline'}
          onClick={() => setZeroCostOnly((prev) => !prev)}
          className={zeroCostOnly ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        >
          ₹0 Only
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {isLoading ? 'Loading…' : `${programs.length} program${programs.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Program grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((program, idx) => {
          const accessCfg = ACCESS_CONFIG[program.access_type];
          const durationYears = Math.round(program.duration_months / 12);
          const durationLabel =
            durationYears >= 1
              ? `${durationYears} yr${durationYears > 1 ? 's' : ''}`
              : `${program.duration_months} mo`;

          return (
            <Card
              key={program.id ?? `${program.program_title}-${idx}`}
              className="flex flex-col hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {flagFor(program.institution_country)} {program.institution_country}
                    </p>
                    <p className="text-sm text-gray-700 font-semibold leading-snug mt-0.5">
                      {program.institution_name}
                    </p>
                  </div>
                  {program.verification_status === 'VERIFIED' && (
                    <ShieldCheck
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      title="Verified"
                    />
                  )}
                </div>
                <CardTitle className="text-lg leading-tight mt-2">
                  {program.program_title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 flex-1">
                {/* Level / Language / Duration */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs">{LEVEL_LABELS[program.level]}</Badge>
                  <Badge variant="outline" className="text-xs">{program.language}</Badge>
                  <Badge variant="outline" className="text-xs">{durationLabel}</Badge>
                </div>

                {/* Access type badge */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${accessCfg.className}`}>
                    {accessCfg.label}
                  </span>
                </div>

                {/* Cost section */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuition</span>
                    <span className="font-semibold text-gray-900">
                      {program.tuition_cost_usd === 0
                        ? <span className="text-green-700 font-bold">₹0</span>
                        : `$${program.tuition_cost_usd.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other fees</span>
                    <span className="font-medium text-gray-700">
                      {program.other_mandatory_costs_usd === 0
                        ? '—'
                        : `$${program.other_mandatory_costs_usd.toLocaleString()}`}
                    </span>
                  </div>
                  {program.scholarship_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scholarship</span>
                      <span className="text-purple-700 font-medium text-xs">{program.scholarship_name}</span>
                    </div>
                  )}
                </div>

                {/* Currency note */}
                {program.currency_note && (
                  <p className="text-xs text-gray-400 italic">{program.currency_note}</p>
                )}

                {/* CTA */}
                <div className="mt-auto pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    asChild
                  >
                    <a href={program.official_url} target="_blank" rel="noopener noreferrer">
                      View Official Program <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {!isLoading && programs.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No programs match your filters.</p>
          <p className="text-sm mt-1">Try adjusting your search or removing filters.</p>
        </div>
      )}
    </div>
  );
}
