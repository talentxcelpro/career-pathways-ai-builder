// src/pages/seo/jobs/JobsByRoleExperienceCity.tsx
// Master Programmatic SEO Landing Page for TalentXcel Global Jobs Discovery Engine
// Supports both India (/jobs/:role/:experience/:city) & International (/jobs/:role/:experience/:country/:city)
// Strict Rule: Zero JobPosting schema on listing pages. Injects BreadcrumbList & CollectionPage only.

import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { resolveMatrixParams } from '@/config/jobs/matrixResolver';
import { useMatrixJobs } from '@/hooks/useMatrixJobs';
import { JobMatrixHero } from '@/components/seo/jobs/JobMatrixHero';
import { JobResultsList } from '@/components/seo/jobs/JobResultsList';
import { JobAlertConversionCTA } from '@/components/seo/jobs/JobAlertConversionCTA';
import { ResumeScannerCTA } from '@/components/seo/jobs/ResumeScannerCTA';
import { SalaryIntelligence } from '@/components/seo/jobs/SalaryIntelligence';
import { ExperienceNavigation } from '@/components/seo/jobs/ExperienceNavigation';
import { RelatedCitiesGrid } from '@/components/seo/jobs/RelatedCitiesGrid';
import { RelatedRolesGrid } from '@/components/seo/jobs/RelatedRolesGrid';
import { MatrixBreadcrumbs } from '@/components/seo/jobs/MatrixBreadcrumbs';
import { MatrixFAQAccordion } from '@/components/seo/jobs/MatrixFAQAccordion';

export const JobsByRoleExperienceCity: React.FC = () => {
  const { role: roleParam, experience: expParam, city: cityParam, country: countryParam } = useParams<{
    role: string;
    experience: string;
    city: string;
    country?: string;
  }>();

  const resolved = resolveMatrixParams(
    roleParam || '',
    expParam || '',
    cityParam || '',
    countryParam
  );

  const { jobs, loading, totalCount, indexability } = useMatrixJobs(
    resolved?.role || null,
    resolved?.experience || null,
    resolved?.location || null
  );

  if (!resolved) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Job Discovery Category Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          The requested job role, experience level, or city combination could not be found in our global directory.
        </p>
        <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-500 text-white">
          <a href="/jobs">Browse All Jobs</a>
        </Button>
      </div>
    );
  }

  const { role, experience, location, canonicalUrl, isInternational, pageTitle, pageDescription } = resolved;
  const robotsDirective = indexability?.robotsDirective || 'noindex, follow';

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://talentxcel.in' },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://talentxcel.in/jobs' },
      { '@type': 'ListItem', position: 3, name: role.title, item: `https://talentxcel.in/jobs/${role.slug}` },
      { '@type': 'ListItem', position: 4, name: `${role.title} in ${location.cityName}`, item: canonicalUrl },
    ],
  };

  // Schema.org CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalCount,
      itemListElement: jobs.map((j, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://talentxcel.in${j.url}`,
        name: j.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content={robotsDirective} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Helmet>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        <MatrixBreadcrumbs
          role={role}
          experience={experience}
          location={location}
          canonicalUrl={canonicalUrl}
        />

        <JobMatrixHero
          role={role}
          experience={experience}
          location={location}
          totalJobs={totalCount}
        />

        <ExperienceNavigation
          role={role}
          currentExperience={experience}
          location={location}
          isInternational={isInternational}
        />

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <JobResultsList
            jobs={jobs}
            role={role}
            location={location}
          />
        )}

        <JobAlertConversionCTA
          role={role}
          location={location}
        />

        <SalaryIntelligence
          role={role}
          experience={experience}
          location={location}
        />

        <ResumeScannerCTA
          role={role}
          location={location}
        />

        <RelatedCitiesGrid
          role={role}
          experience={experience}
          currentLocation={location}
          isInternational={isInternational}
        />

        <RelatedRolesGrid
          currentRole={role}
          experience={experience}
          location={location}
          isInternational={isInternational}
        />

        <MatrixFAQAccordion
          role={role}
          experience={experience}
          location={location}
        />
      </main>
    </div>
  );
};

export default JobsByRoleExperienceCity;
