import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Briefcase } from 'lucide-react';
import { PageShell, Section } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PRODUCTION_ORIGIN } from '@/config/seo';
import type { FaqItem } from '@/config/publicIA';
import type { LandingJob } from '@/hooks/useLandingJobs';

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail + BreadcrumbList JSON-LD. */
export const LandingBreadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="flex items-center gap-1">
          {item.href ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
        </li>
      ))}
    </ol>
  </nav>
);

export const breadcrumbSchema = (items: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.label,
    ...(item.href ? { item: `${PRODUCTION_ORIGIN}${item.href}` } : {}),
  })),
});

export const faqSchema = (faqs: FaqItem[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/** Combine several schema nodes into one valid JSON-LD document. */
export const schemaGraph = (...nodes: Record<string, unknown>[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });

/**
 * LandingLayout — the shared frame for every public IA page.
 */
export const LandingLayout: React.FC<{
  metaTitle: string;
  metaDescription: string;
  path: string;
  crumbs: Crumb[];
  eyebrow?: string;
  h1: string;
  intro: string;
  actions?: React.ReactNode;
  structuredData?: string;
  children: React.ReactNode;
}> = ({ metaTitle, metaDescription, path, crumbs, eyebrow, h1, intro, actions, structuredData, children }) => (
  <>
    <SEOHead title={metaTitle} description={metaDescription} url={path} canonical={`${PRODUCTION_ORIGIN}${path}`} structuredData={structuredData} />
    <PageShell width="xl" pad="md">
      <LandingBreadcrumbs items={crumbs} />
      <PageHeader eyebrow={eyebrow} title={h1} description={intro} size="lg" actions={actions} />
      {children}
    </PageShell>
  </>
);

/** Feature/benefit grid. */
export const FeatureGrid: React.FC<{ items: { title: string; body: string }[] }> = ({ items }) => (
  <Section>
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-title-3">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-muted-foreground">{item.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

export const FaqBlock: React.FC<{ faqs: FaqItem[] }> = ({ faqs }) =>
  faqs.length ? (
    <Section>
      <h2 className="text-title-1 mb-6">Frequently asked questions</h2>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="border-b border-border pb-4">
            <h3 className="text-title-3 mb-1">{f.q}</h3>
            <p className="text-body text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </Section>
  ) : null;

const salary = (min: number | null, max: number | null) => {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(1)} LPA` : `${(n / 1000).toFixed(0)}K`);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min || max) as number);
};

/** Live openings pulled from the jobs table. */
export const JobsBlock: React.FC<{
  heading: string;
  jobs: LandingJob[];
  total: number;
  loading: boolean;
  emptyHint?: string;
}> = ({ heading, jobs, total, loading, emptyHint }) => (
  <Section>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-title-1">{heading}</h2>
      {!loading && total > 0 && (
        <Badge variant="secondary">
          {total} open {total === 1 ? 'role' : 'roles'}
        </Badge>
      )}
    </div>

    {loading ? (
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-border bg-muted/40 animate-pulse" />
        ))}
      </div>
    ) : jobs.length === 0 ? (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-body text-muted-foreground">
            {emptyHint || 'No live openings here right now. New roles are added daily.'}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/jobs">Browse all jobs</Link>
          </Button>
        </CardContent>
      </Card>
    ) : (
      <>
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block">
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="py-5">
                  <h3 className="text-title-3 mb-1 line-clamp-1">{job.title}</h3>
                  <p className="text-body text-muted-foreground line-clamp-1">{job.company_name || 'TalentXcel client'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" aria-hidden />
                        {job.employment_type}
                      </span>
                    )}
                    {salary(job.salary_min, job.salary_max) && <span>{salary(job.salary_min, job.salary_max)}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/jobs">View all jobs</Link>
        </Button>
      </>
    )}
  </Section>
);

/** Internal link grid used by the hub pages. */
export const LinkGrid: React.FC<{
  heading: string;
  items: { href: string; title: string; body?: string }[];
  columns?: 2 | 3 | 4;
}> = ({ heading, items, columns = 3 }) => (
  <Section>
    <h2 className="text-title-1 mb-6">{heading}</h2>
    <div
      className={
        columns === 4
          ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4'
          : columns === 2
            ? 'grid gap-3 sm:grid-cols-2'
            : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
      }
    >
      {items.map((item) => (
        <Link key={item.href} to={item.href} className="block">
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardContent className="py-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-title-3">{item.title}</h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              {item.body && <p className="text-body text-muted-foreground mt-1">{item.body}</p>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  </Section>
);
