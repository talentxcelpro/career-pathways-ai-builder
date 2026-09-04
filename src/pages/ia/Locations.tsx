import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { LandingLayout, LinkGrid, JobsBlock, breadcrumbSchema, schemaGraph } from '@/components/landing/LandingLayout';
import { Section } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { LOCATION_HUBS, INDUSTRY_HUBS } from '@/config/publicIA';
import { useLandingJobs } from '@/hooks/useLandingJobs';

const NotFound = lazy(() => import('@/pages/NotFound'));

export const LocationsIndex: React.FC = () => {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Locations' }];
  return (
    <LandingLayout
      metaTitle="Jobs by City in India | TalentXcel"
      metaDescription="Find jobs by city — Delhi NCR, Bangalore, Hyderabad, Pune, Mumbai, Chennai and more, plus fully remote roles across India."
      path="/locations"
      crumbs={crumbs}
      eyebrow="Locations"
      h1="Jobs by location"
      intro="Hiring markets differ city by city. Pick a location to see live openings, the sectors that dominate local hiring, and where the demand is concentrated."
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
    >
      <LinkGrid
        heading="All locations"
        items={LOCATION_HUBS.map((l) => ({ href: `/locations/${l.slug}`, title: l.name, body: l.intro }))}
      />
    </LandingLayout>
  );
};

export const LocationPage: React.FC<{ slug?: string }> = ({ slug: slugProp }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug;
  const hub = LOCATION_HUBS.find((l) => l.slug === slug);
  const { jobs, total, loading } = useLandingJobs({
    locationAliases: hub?.aliases ?? [],
    remoteOnly: hub?.slug === 'remote',
    limit: 12,
  });

  if (!hub) return <Suspense fallback={null}><NotFound /></Suspense>;

  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Locations', href: '/locations' }, { label: hub.name }];
  const isRemote = hub.slug === 'remote';

  return (
    <LandingLayout
      metaTitle={`Jobs in ${hub.name} — Live Openings | TalentXcel`}
      metaDescription={`Live job openings in ${hub.name}. Browse verified roles by sector, match your profile and apply directly on TalentXcel.`}
      path={`/locations/${hub.slug}`}
      crumbs={crumbs}
      eyebrow={isRemote ? 'Work from anywhere' : hub.state}
      h1={isRemote ? 'Remote jobs in India' : `Jobs in ${hub.name}`}
      intro={hub.intro}
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
    >
      <JobsBlock
        heading={`Live openings in ${hub.name}`}
        jobs={jobs}
        total={total}
        loading={loading}
        emptyHint={`No roles are live in ${hub.name} at this moment. New postings are added daily.`}
      />

      <Section>
        <h2 className="text-title-1 mb-4">What drives hiring in {hub.name}</h2>
        <div className="flex flex-wrap gap-2">
          {hub.sectors.map((s) => (
            <Badge key={s} variant="secondary" className="text-sm">
              {s}
            </Badge>
          ))}
        </div>
      </Section>

      <LinkGrid
        heading="Browse by industry"
        columns={4}
        items={INDUSTRY_HUBS.slice(0, 8).map((i) => ({ href: `/industries/${i.slug}`, title: i.name }))}
      />

      <LinkGrid
        heading="Next steps"
        columns={4}
        items={[
          { href: '/resume-builder', title: 'Build a resume' },
          { href: '/job-matching', title: 'Match my profile' },
          { href: '/reverse-job-search', title: 'Let employers find me' },
          { href: '/staffing', title: 'Hiring here?' },
        ]}
      />
    </LandingLayout>
  );
};
