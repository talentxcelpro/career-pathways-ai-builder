import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatCanonicalUrl } from '@/config/domainArchitecture';

const formatSlug = (value?: string) => value
  ? value.split(/[-_]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  : '';

const SalaryGuidePage = () => {
  const { role, location } = useParams();
  const roleName = formatSlug(role) || 'Role';
  const locationName = formatSlug(location);
  const pageName = `${roleName} Salary Information${locationName ? ` in ${locationName}` : ''}`;
  const canonical = formatCanonicalUrl(`/salary/${role || ''}${location ? `/${location}` : ''}`);

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-12">
      <SEOHead
        title={`${pageName} | TalentXcel`}
        description={`Source-backed salary information for ${roleName}${locationName ? ` in ${locationName}` : ''} will be published when available.`}
        canonical={canonical}
        noindex
        nofollow
        keywords={[]}
      />
      <section className="rounded-2xl border bg-card p-6 sm:p-8 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{pageName}</h1>
        <p className="text-muted-foreground leading-relaxed">
          TalentXcel does not currently have a source-backed salary distribution to publish for this role
          {locationName ? ` in ${locationName}` : ''}. Review current job listings for compensation details supplied by employers.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/jobs">
            Browse current job listings
          </a>
          <a className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold" href="/tools/salary-analyzer">
            Open salary analyzer
          </a>
        </div>
      </section>
    </main>
  );
};

export default SalaryGuidePage;