import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LandingLayout, LinkGrid, breadcrumbSchema, schemaGraph } from '@/components/landing/LandingLayout';
import { EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS } from '@/config/publicIA';

const EmployersIndex: React.FC = () => {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Employers' }];

  return (
    <LandingLayout
      metaTitle="Hiring Solutions for Employers in India | TalentXcel"
      metaDescription="Staffing, recruitment, RPO and staff augmentation across India. Pre-verified candidates, structured screening and SLA-backed delivery."
      path="/employers"
      crumbs={crumbs}
      eyebrow="For employers"
      h1="Hiring solutions"
      intro="Four ways to work with TalentXcel, depending on whether you need a role filled, a team built, or a hiring function run for you."
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
      actions={
        <Button asChild size="lg">
          <Link to="/contact">Talk to our team</Link>
        </Button>
      }
    >
      <LinkGrid
        heading="Services"
        columns={2}
        items={EMPLOYER_SERVICES.map((s) => ({ href: `/${s.slug}`, title: s.title, body: s.intro }))}
      />

      <LinkGrid
        heading="Hiring by industry"
        columns={4}
        items={INDUSTRY_HUBS.slice(0, 8).map((i) => ({ href: `/industries/${i.slug}`, title: i.name }))}
      />

      <LinkGrid
        heading="Hiring by location"
        columns={4}
        items={LOCATION_HUBS.slice(1, 9).map((l) => ({ href: `/locations/${l.slug}`, title: l.name }))}
      />

      <LinkGrid
        heading="For hiring teams"
        columns={3}
        items={[
          { href: '/resources/hiring-guides', title: 'Hiring guides', body: 'Job briefs, scorecards and structured interviews.' },
          { href: '/company-info', title: 'About TalentXcel', body: 'Who we are and how we operate.' },
          { href: '/contact', title: 'Contact us', body: 'Share a requirement and get a plan back.' },
        ]}
      />
    </LandingLayout>
  );
};

export default EmployersIndex;
