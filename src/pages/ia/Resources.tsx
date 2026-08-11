import React from 'react';
import { useParams } from 'react-router-dom';
import { LandingLayout, LinkGrid, breadcrumbSchema, schemaGraph } from '@/components/landing/LandingLayout';
import { RESOURCE_HUBS } from '@/config/publicIA';
import NotFound from '@/pages/NotFound';

export const ResourcesIndex: React.FC = () => {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Resources' }];
  return (
    <LandingLayout
      metaTitle="Career, Resume, Interview & Hiring Guides | TalentXcel"
      metaDescription="Practical guides for candidates and hiring teams: career planning, ATS resumes, interview preparation and structured hiring."
      path="/resources"
      crumbs={crumbs}
      eyebrow="Resources"
      h1="Guides and resources"
      intro="Short, practical guides drawn from what actually moves candidates through hiring processes on TalentXcel."
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
    >
      <LinkGrid
        heading="Guide libraries"
        columns={2}
        items={RESOURCE_HUBS.map((h) => ({ href: `/resources/${h.slug}`, title: h.name, body: h.intro }))}
      />
    </LandingLayout>
  );
};

export const ResourceHubPage: React.FC<{ slug?: string }> = ({ slug: slugProp }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug;
  const hub = RESOURCE_HUBS.find((h) => h.slug === slug);
  if (!hub) return <NotFound />;

  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: hub.name }];

  return (
    <LandingLayout
      metaTitle={hub.metaTitle}
      metaDescription={hub.metaDescription}
      path={`/resources/${hub.slug}`}
      crumbs={crumbs}
      eyebrow="Resources"
      h1={hub.name}
      intro={hub.intro}
      structuredData={schemaGraph(breadcrumbSchema(crumbs))}
    >
      <LinkGrid
        heading={`In ${hub.name.toLowerCase()}`}
        columns={3}
        items={hub.articles.map((a) => ({ href: a.href, title: a.title, body: a.summary }))}
      />
      <LinkGrid
        heading="Other guides"
        columns={3}
        items={RESOURCE_HUBS.filter((h) => h.slug !== hub.slug).map((h) => ({
          href: `/resources/${h.slug}`,
          title: h.name,
          body: h.intro,
        }))}
      />
    </LandingLayout>
  );
};
