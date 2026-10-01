import React from 'react';
import { Helmet } from 'react-helmet-async';
import { buildJobPostingSchema, RawJobData } from '@/lib/seo/jobPostingSchema';
import { getPublicJobUrl } from '@/lib/seo/canonicalUrls';

interface ReactJobStructuredDataProps {
  job: RawJobData;
}

export const ReactJobStructuredData: React.FC<ReactJobStructuredDataProps> = ({ job }) => {
  const structuredData = buildJobPostingSchema(job);
  const companyName = job.companies?.name || job.company_name || 'TalentXcel Services';
  const seoTitle = `${job.title} at ${companyName} | TalentXcel`;
  const seoDescription = (job.description || '').slice(0, 160);
  const canonicalUrl = getPublicJobUrl(job.seo_slug || job.id);
  const logoUrl = job.companies?.logo_url || 'https://talentxcel.in/talentxcel-official-logo.png';

  // NOTE: FAQPage schema removed — Google deprecated FAQ rich results in 2026.
  // FAQs remain useful for users but no longer produce SERP rich snippet boosts.
  // Reference: https://developers.google.com/search/updates
  
  // Breadcrumbs Schema for Google Search Rich Results
  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://talentxcel.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Jobs',
        item: 'https://talentxcel.in/jobs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: job.title,
        item: canonicalUrl,
      },
    ],
  };


  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={logoUrl} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={logoUrl} />

      {/* JobPosting JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* BreadcrumbList JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbsSchema)}
      </script>

    </Helmet>
  );
};

export default ReactJobStructuredData;