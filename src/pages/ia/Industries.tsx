import React from 'react';
import { useParams } from 'react-router-dom';
import { LandingLayout, LinkGrid, JobsBlock, breadcrumbSchema, schemaGraph } from '@/components/landing/LandingLayout';
import { Section } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { INDUSTRY_HUBS } from '@/config/publicIA';
import { useLandingJobs } from '@/hooks/useLandingJobs';
import NotFound from '@/pages/NotFound';

export const IndustriesIndex: React.FC = () => {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Industries' }];
  return (
    <LandingLayout
      metaTitle="Jobs & Hiring by Industry in India | TalentXcel"
      metaDescription="Browse live jobs and hiring support by industry — IT, healthcare, banking, manufacturing, logistics, pharma and more, across India."
      path="/industries"
      crumbs={crumbs}
      eyebrow="Industries"
      h1="Jobs and hiring by industry"
      intro="Every industry hires differently. Pick a sector to see the roles employers are filling right now, the titles that recur, and how progression works."
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
    >
      <LinkGrid
        heading="All industries"
        items={INDUSTRY_HUBS.map((i) => ({ href: `/industries/${i.slug}`, title: i.name, body: i.intro }))}
      />
    </LandingLayout>
  );
};

export const IndustryPage: React.FC<{ slug?: string }> = ({ slug: slugProp }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug;
  const hub = INDUSTRY_HUBS.find((i) => i.slug === slug);
  const { jobs, total, loading } = useLandingJobs({ keywords: hub?.keywords ?? [], limit: 12 });

  if (!hub) return <NotFound />;

  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: hub.name }];

  return (
    <LandingLayout
      metaTitle={hub.metaTitle}
      metaDescription={hub.metaDescription}
      path={`/industries/${hub.slug}`}
      crumbs={crumbs}
      eyebrow="Industry"
      h1={`${hub.name} jobs in India`}
      intro={hub.intro}
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
    >
      <JobsBlock
        heading={`Live ${hub.name.toLowerCase()} openings`}
        jobs={jobs}
        total={total}
        loading={loading}
        emptyHint={`No ${hub.name.toLowerCase()} roles are live at this moment. New postings are added daily.`}
      />

      <Section>
        <h2 className="text-title-1 mb-4">Common roles in {hub.name}</h2>
        <div className="flex flex-wrap gap-2">
          {hub.roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-sm">
              {role}
            </Badge>
          ))}
        </div>
      </Section>

      <LinkGrid
        heading="Continue from here"
        columns={4}
        items={[
          { href: '/locations', title: 'Browse by location', body: 'The same roles, filtered by city.' },
          { href: '/resume-builder', title: 'Build a resume', body: 'ATS-ready and role-specific.' },
          { href: '/job-matching', title: 'Match my profile', body: 'Score yourself against live roles.' },
          { href: '/recruitment', title: 'Hiring in this sector?', body: 'Recruitment support for employers.' },
        ]}
      />
    </LandingLayout>
  );
};
