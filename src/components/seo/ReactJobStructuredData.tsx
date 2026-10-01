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

  // FAQ Schema for Search Appearance
  const salaryText = typeof job.salary_min === 'number' && job.salary_min > 0
    ? `The advertised compensation for this role ranges from ${job.salary_min.toLocaleString()} to ${(job.salary_max || job.salary_min).toLocaleString()} ${(job.salary_currency || 'INR').toUpperCase()} per annum.`
    : `Compensation is competitive and aligned with market standards for ${job.title}.`;

  const workLocationText = job.is_remote
    ? 'This is a remote position open to qualified candidates globally.'
    : `This role is based on-site in ${job.location || 'the specified office location'}.`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the salary for ${job.title} at ${companyName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: salaryText,
        },
      },
      {
        '@type': 'Question',
        name: `Is the ${job.title} position remote or on-site?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: workLocationText,
        },
      },
      {
        '@type': 'Question',
        name: `How do I apply for ${job.title} at ${companyName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can apply directly on TalentXcel using our 1-click application or Skill Intelligence (SI) Career Passport matching.`,
        },
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

      {/* FAQPage JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default ReactJobStructuredData;