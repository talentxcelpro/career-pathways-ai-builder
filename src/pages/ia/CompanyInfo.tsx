import React from 'react';
import { LandingLayout, LinkGrid, breadcrumbSchema, schemaGraph } from '@/components/landing/LandingLayout';
import { Section } from '@/components/layout/PageShell';
import { PRODUCTION_ORIGIN, SITE_NAME } from '@/config/seo';

const CompanyInfo: React.FC = () => {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Company' }];

  const org = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: PRODUCTION_ORIGIN,
    slogan: 'Careers, Designed — Not Discovered.',
    areaServed: 'IN',
  };

  return (
    <LandingLayout
      metaTitle="About TalentXcel — Company, Careers & Contact"
      metaDescription="TalentXcel builds a verified career record for professionals in India and hiring solutions for employers. Company information, careers and contact."
      path="/company-info"
      crumbs={crumbs}
      eyebrow="Company"
      h1="About TalentXcel"
      intro="Careers, Designed — Not Discovered. TalentXcel gives professionals a verified record of what they have actually done, and gives employers a way to hire against evidence instead of claims."
      structuredData={schemaGraph(breadcrumbSchema(crumbs), org)}
    >
      <Section>
        <div className="max-w-[768px] space-y-4">
          <h2 className="text-title-1">What we do</h2>
          <p className="text-body text-muted-foreground">
            Hiring is slow because nothing on a resume can be trusted without checking it. TalentXcel starts from the
            opposite end: a Career Passport that carries verified education, employment, certifications and assessments,
            with tamper-evident proof attached to each credential.
          </p>
          <p className="text-body text-muted-foreground">
            For candidates, that record powers job matching, an AI career coach and a shareable public profile. For
            employers, it shortens screening — the checks are already done before the first interview slot is spent.
          </p>
          <h2 className="text-title-1 pt-4">How we work</h2>
          <p className="text-body text-muted-foreground">
            We operate across India, with the deepest coverage in Delhi NCR, Bangalore, Hyderabad, Pune, Mumbai and
            Chennai. Engagements run against written scorecards and agreed timelines, and every shortlist is measurable.
          </p>
        </div>
      </Section>

      <LinkGrid
        heading="More about us"
        columns={4}
        items={[
          { href: '/about', title: 'Our story', body: 'Why TalentXcel exists.' },
          { href: '/careers', title: 'Careers', body: 'Work with us.' },
          { href: '/contact', title: 'Contact', body: 'Reach the team.' },
          { href: '/security', title: 'Security', body: 'How we protect your data.' },
        ]}
      />

      <LinkGrid
        heading="Policies"
        columns={3}
        items={[
          { href: '/terms', title: 'Terms of service' },
          { href: '/privacypolicy', title: 'Privacy policy' },
          { href: '/return-refund-policy', title: 'Return & refund policy' },
        ]}
      />
    </LandingLayout>
  );
};

export default CompanyInfo;
