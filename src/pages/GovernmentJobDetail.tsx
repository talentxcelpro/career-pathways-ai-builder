/**
 * TalentXcel Government Job Detail Page (/government-jobs/detail/:id)
 * Canonical single-vacancy detail page with source provenance,
 * timeline tracking, AI eligibility, and official application routing.
 */

import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, Building, Calendar, MapPin, ExternalLink,
  ArrowLeft, CheckCircle2, AlertTriangle, FileText,
  Clock, Award, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GovernmentJobBadge } from '@/components/jobs/GovernmentJobBadge';
import { FresherBadge } from '@/components/jobs/FresherBadge';
import { SourceAttribution } from '@/components/jobs/SourceAttribution';
import { JobEligibilityCard } from '@/components/jobs/JobEligibilityCard';
import { EmploymentNewsConnector } from '@/lib/jobs/connectors/india/EmploymentNewsConnector';
import { USAJobsConnector } from '@/lib/jobs/connectors/usajobs/USAJobsConnector';
import { CentralGovConnector } from '@/lib/jobs/connectors/india/CentralGovConnector';
import { StateGovConnector } from '@/lib/jobs/connectors/india/StateGovConnector';
import { PSUConnector } from '@/lib/jobs/connectors/india/PSUConnector';
import { buildVacancyTimeline } from '@/lib/jobs/governmentUpdates';
import { evaluateGovernmentJobPostingEligibility } from '@/lib/seo/governmentJobPostingPolicy';
import { GlobalJob } from '@/types/jobs/globalJob';
import { toast } from 'sonner';

export default function GovernmentJobDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find job from connector feeds
  const job = useMemo<GlobalJob | undefined>(() => {
    const en = new EmploymentNewsConnector();
    const upsc = new CentralGovConnector();
    const state = new StateGovConnector();
    const psu = new PSUConnector();
    const usajobs = new USAJobsConnector();

    const pool = [
      ...en.discoverJobs().map((r) => en.normalize(r)),
      ...upsc.discoverJobs().map((r) => upsc.normalize(r)),
      ...state.discoverJobs().map((r) => state.normalize(r)),
      ...psu.discoverJobs().map((r) => psu.normalize(r)),
      ...usajobs.discoverJobs().map((r) => usajobs.normalize(r)),
    ];

    return pool.find((j) => j.id === id || j.slug.includes(id));
  }, [id]);

  if (!job) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-md">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
          <h2 className="text-xl font-bold">Government Vacancy Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested recruitment notice may have expired or concluded its application window.
          </p>
          <Button onClick={() => navigate('/government-jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Government Jobs
          </Button>
        </div>
      </div>
    );
  }

  const timeline = buildVacancyTimeline(job.posted_at, job.valid_through, job.corrigendum_history);
  const schemaEvaluation = evaluateGovernmentJobPostingEligibility(job, true);

  // Generate Schema.org JobPosting object ONLY if eligible
  const schemaJson = schemaEvaluation.isEligible ? {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.employer.display_name,
      value: job.advt_number || job.id,
    },
    datePosted: job.posted_at.split('T')[0],
    validThrough: job.valid_through ? job.valid_through.split('T')[0] : undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'GovernmentOrganization',
      name: job.employer.legal_name,
      sameAs: job.employer.website,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city || job.region_name || 'National',
        addressCountry: job.country_code,
      },
    },
    url: `https://talentxcel.in/government-jobs/detail/${job.id}`,
    // Invariant: directApply is strictly omitted because official portal application is required
  } : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Official Government Recruitment: ${job.title} at ${job.employer.legal_name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Vacancy link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Helmet>
        <title>{`${job.title} | ${job.employer.legal_name} | TalentXcel`}</title>
        <meta name="description" content={job.summary} />
        <link rel="canonical" href={`https://talentxcel.in/government-jobs/detail/${job.id}`} />
        {schemaJson && (
          <script type="application/ld+json">
            {JSON.stringify(schemaJson)}
          </script>
        )}
      </Helmet>

      {/* Top Breadcrumb Nav */}
      <div className="border-b border-border/40 bg-muted/20 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/government-jobs" className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Government Vacancies
          </Link>
          <Button variant="ghost" size="sm" onClick={handleShare} className="h-7 text-xs gap-1">
            <Share2 className="h-3 w-3" /> Share Notice
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Vacancy Hero Card */}
        <Card className="border border-border/50 shadow-sm bg-card/90">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <GovernmentJobBadge level={job.government_level} countryCode={job.country_code} />
              {job.accepts_freshers && <FresherBadge size="md" />}
              {job.advt_number && (
                <Badge variant="outline" className="text-xs font-mono">
                  Advt No: {job.advt_number}
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {job.title}
              </h1>
              <p className="text-sm font-semibold text-primary mt-1">
                {job.employer.legal_name}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 bg-muted/30 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Location</span>
                <span className="font-semibold text-foreground mt-0.5 block truncate">
                  {job.city || job.country_name}
                </span>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Compensation Band</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block truncate">
                  {job.salary?.original_display || 'As per Govt Rules'}
                </span>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Notification Date</span>
                <span className="font-semibold text-foreground mt-0.5 block truncate">
                  {new Date(job.posted_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Closing Deadline</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400 mt-0.5 block truncate">
                  {job.valid_through
                    ? new Date(job.valid_through).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Open'}
                </span>
              </div>
            </div>

            {/* Official Portal Apply Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-sm"
                onClick={() => window.open(job.application_url, '_blank', 'noopener,noreferrer')}
              >
                Apply on Official Government Portal
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Candidate applications are processed exclusively on the official government portal. TalentXcel does not collect application fees.
            </p>
          </CardContent>
        </Card>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vacancy Description */}
            <Card className="border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Recruitment Notification & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-foreground/90">
                <div className="whitespace-pre-line">
                  {job.description}
                </div>

                {job.skills.length > 0 && (
                  <div className="pt-3 border-t">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                      Disciplines & Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vacancy Timeline / Corrigenda */}
            <Card className="border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Official Timeline & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 relative pl-4 border-l-2 border-primary/30 ml-2">
                  {timeline.map((evt, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{evt.title}</span>
                        <span className="text-muted-foreground text-[11px]">
                          {new Date(evt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1 col) */}
          <div className="space-y-6">
            {/* AI Eligibility Widget */}
            <JobEligibilityCard
              jobTitle={job.title}
              isGovernment={true}
              minExperienceMonths={job.minimum_experience_months}
              skillsRequired={job.skills}
            />

            {/* Source Provenance Citation */}
            <SourceAttribution
              sourceName={job.provenance.source_name}
              sourceUrl={job.provenance.source_url}
              externalJobId={job.provenance.external_job_id}
              lastVerifiedAt={job.provenance.last_verified_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
