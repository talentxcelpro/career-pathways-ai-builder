/**
 * GoogleJobsPreviewCard
 * Shows a preview of how a job posting might appear in Google Jobs.
 * Labeled "TalentXcel Google Jobs Preview" — NOT a guarantee of placement.
 * Includes a Schema.org eligibility checklist.
 */

import React, { useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface GoogleJobsPreviewData {
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  currency?: string;
  datePosted?: string;         // ISO date
  validThrough?: string;       // ISO date
  description?: string;
  externalUrl?: string;
  isFresherEligible?: boolean;
  workplaceType?: string;
}

interface ChecklistItem {
  key: string;
  label: string;
  pass: boolean | null;       // null = optional
  required: boolean;
  hint: string;
}

function buildChecklist(data: GoogleJobsPreviewData): ChecklistItem[] {
  const descLen = (data.description ?? '').length;
  const hasSalaryInfo = !!(data.salary);

  return [
    {
      key: 'title',
      label: 'Job Title',
      pass: (data.title?.trim().length ?? 0) >= 3,
      required: true,
      hint: 'A clear, specific job title. Avoid keyword stuffing.',
    },
    {
      key: 'description',
      label: 'Description (≥ 500 chars)',
      pass: descLen >= 500,
      required: true,
      hint: 'Longer, detailed descriptions perform better in Google Jobs.',
    },
    {
      key: 'company',
      label: 'Hiring Organization',
      pass: (data.company?.trim().length ?? 0) >= 2,
      required: true,
      hint: 'Company name must be present.',
    },
    {
      key: 'location',
      label: 'Job Location',
      pass: (data.location?.trim().length ?? 0) >= 3,
      required: true,
      hint: 'Specific city/locality improves geographic indexing.',
    },
    {
      key: 'datePosted',
      label: 'Date Posted',
      pass: !!(data.datePosted),
      required: true,
      hint: 'ISO 8601 date is required for Schema.org eligibility.',
    },
    {
      key: 'validThrough',
      label: 'Valid Through (Expiry)',
      pass: !!(data.validThrough),
      required: false,
      hint: 'Strongly recommended. Jobs without an expiry date may rank lower.',
    },
    {
      key: 'salary',
      label: 'Salary Information',
      pass: hasSalaryInfo ? true : null,
      required: false,
      hint: 'Salary details significantly improve click-through rate in Google Jobs.',
    },
    {
      key: 'employmentType',
      label: 'Employment Type',
      pass: !!(data.employmentType),
      required: false,
      hint: 'E.g. FULL_TIME, PART_TIME, CONTRACTOR. Helps categorization.',
    },
    {
      key: 'externalUrl',
      label: 'Apply URL',
      pass: !!(data.externalUrl),
      required: true,
      hint: 'A valid application URL is required for Google Jobs.',
    },
  ];
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  CONTRACTOR: 'Contract',
  INTERNSHIP: 'Internship',
  INTERN: 'Internship',
  TEMPORARY: 'Temporary',
  VOLUNTEER: 'Volunteer',
  FREELANCE: 'Freelance',
};

export const GoogleJobsPreviewCard: React.FC<{ data: GoogleJobsPreviewData; className?: string }> = ({
  data,
  className,
}) => {
  const checklist = useMemo(() => buildChecklist(data), [data]);

  const requiredPassed = checklist.filter((c) => c.required && c.pass === true).length;
  const requiredTotal = checklist.filter((c) => c.required).length;
  const allRequiredPass = requiredPassed === requiredTotal;
  const optionalPassed = checklist.filter((c) => !c.required && c.pass === true).length;
  const optionalTotal = checklist.filter((c) => !c.required).length;

  const empLabel = EMPLOYMENT_LABELS[data.employmentType ?? ''] ?? data.employmentType ?? '';

  return (
    <Card className={cn('border-2 border-dashed border-muted-foreground/30 bg-card/50', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-4 h-4">
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </span>
            TalentXcel Google Jobs Preview
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-64 text-xs">
                  This is a preview only. Google independently decides which job postings
                  appear in Google Jobs. Passing all checks makes your job eligible, but
                  does not guarantee placement.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {allRequiredPass ? (
              <Badge className="text-[10px] h-5 px-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                Potentially Eligible
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-5 px-2 text-amber-600 border-amber-400/30">
                Incomplete
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Google Jobs card mockup */}
        <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
          {/* Header bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 opacity-70" />
          <div className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-semibold text-sm leading-tight truncate',
                  !data.title && 'text-muted-foreground italic',
                )}>
                  {data.title || 'Job Title (required)'}
                </h3>
                <p className={cn(
                  'text-xs text-muted-foreground mt-0.5 truncate',
                  !data.company && 'italic',
                )}>
                  {data.company || 'Company Name'}
                </p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold">
                {data.company?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              {data.location && (
                <span className="flex items-center gap-0.5">
                  📍 {data.location}
                </span>
              )}
              {empLabel && (
                <span className="flex items-center gap-0.5">
                  • {empLabel}
                </span>
              )}
              {data.workplaceType === 'REMOTE' && (
                <span className="flex items-center gap-0.5 text-blue-500">
                  • Remote
                </span>
              )}
              {data.workplaceType === 'HYBRID' && (
                <span>• Hybrid</span>
              )}
            </div>

            {/* Salary */}
            {data.salary && (
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {data.salary}
              </div>
            )}

            {/* Fresher badge */}
            {data.isFresherEligible && (
              <div>
                <Badge className="text-[10px] h-4 px-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                  🎓 Fresher / Entry Level
                </Badge>
              </div>
            )}

            {/* Posted date */}
            {data.datePosted && (
              <p className="text-[10px] text-muted-foreground">
                Posted {formatDate(data.datePosted)}
                {data.validThrough && ` · Closes ${formatDate(data.validThrough)}`}
              </p>
            )}

            {/* Apply button mockup */}
            <div className="flex items-center gap-2 pt-1">
              <div className="text-[10px] px-2.5 py-1 rounded-full bg-blue-600 text-white cursor-default select-none">
                Apply on {data.externalUrl ? new URL(data.externalUrl).hostname.replace('www.', '') : 'TalentXcel.com'}
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Schema.org eligibility checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Schema.org Checklist
            </p>
            <span className="text-xs text-muted-foreground">
              {requiredPassed}/{requiredTotal} required · {optionalPassed}/{optionalTotal} optional
            </span>
          </div>
          <div className="space-y-1">
            {checklist.map((item) => (
              <TooltipProvider key={item.key}>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      'flex items-center gap-2 text-xs py-0.5 cursor-default rounded px-1 transition-colors',
                      'hover:bg-muted/50',
                    )}>
                      {item.pass === true ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : item.pass === false && item.required ? (
                        <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                      ) : item.pass === false ? (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'flex-1',
                        item.pass === true && 'text-foreground',
                        item.pass === false && item.required && 'text-destructive',
                        item.pass === false && !item.required && 'text-muted-foreground',
                        item.pass === null && 'text-muted-foreground',
                      )}>
                        {item.label}
                      </span>
                      {!item.required && (
                        <span className="text-[10px] text-muted-foreground/60">optional</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-52 text-xs">
                    {item.hint}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/70 border-t pt-2 leading-relaxed">
          Google independently determines job eligibility and presentation. Passing all checks makes
          your posting technically eligible but does not guarantee inclusion in Google Jobs.
        </p>
      </CardContent>
    </Card>
  );
};

export default GoogleJobsPreviewCard;
