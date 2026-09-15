import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/layout/PageShell';
import { LandingLayout, FeatureGrid, FaqBlock, JobsBlock, breadcrumbSchema, faqSchema, schemaGraph } from '@/components/landing/LandingLayout';
import { useLandingJobs } from '@/hooks/useLandingJobs';
import type { ServicePage as ServiceConfig } from '@/config/publicIA';

/**
 * Generic renderer for a candidate or employer service page.
 * Content comes from src/config/publicIA.ts; live roles come from Supabase.
 */
const ServicePage: React.FC<{ service: ServiceConfig }> = ({ service }) => {
  const showJobs = service.audience === 'candidate';
  const { jobs, total, loading } = useLandingJobs({
    keywords: service.jobKeywords ?? [],
    limit: showJobs ? 6 : 0,
  });

  const crumbs = [
    { label: 'Home', href: '/' },
    ...(service.audience === 'employer' ? [{ label: 'Employers', href: '/employers' }] : []),
    { label: service.title },
  ];

  const path = `/${service.slug}`;

  return (
    <LandingLayout
      metaTitle={service.metaTitle}
      metaDescription={service.metaDescription}
      path={path}
      crumbs={crumbs}
      eyebrow={service.audience === 'employer' ? 'For employers' : 'For candidates'}
      h1={service.h1}
      intro={service.intro}
      structuredData={schemaGraph(breadcrumbSchema(crumbs), faqSchema(service.faqs))}
      actions={
        <Button asChild size="lg">
          <Link to={service.ctaHref}>{service.ctaLabel}</Link>
        </Button>
      }
    >
      <FeatureGrid items={service.bullets} />

      {showJobs && (
        <JobsBlock heading="Live openings" jobs={jobs} total={total} loading={loading} />
      )}

      <FaqBlock faqs={service.faqs} />

      <Section>
        <div className="rounded-3xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="text-title-1 mb-2">{service.audience === 'employer' ? 'Hiring for this?' : 'Ready to start?'}</h2>
          <p className="text-body text-muted-foreground mb-5">
            {service.audience === 'employer'
              ? 'Share a role brief and we will come back with a plan and a timeline.'
              : 'Everything on TalentXcel starts from your Career Passport — a verified record of what you have actually done.'}
          </p>
          <Button asChild size="lg">
            <Link to={service.ctaHref}>{service.ctaLabel}</Link>
          </Button>
        </div>
      </Section>
    </LandingLayout>
  );
};

export default ServicePage;
