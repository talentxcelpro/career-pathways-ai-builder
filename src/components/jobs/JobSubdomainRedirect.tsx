import React, { useEffect, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { getCanonicalJobUrl } from '@/utils/crossDomainJobRouting';

const JobDetails = lazy(() => import('@/pages/jobs/JobDetails'));

/**
 * JobSubdomainRedirect
 *
 * Active on jobs.talentxcel.in (and jobs.localhost).
 * Immediately executes client-side redirect to the canonical job detail page on the apex domain
 * (https://talentxcel.in/jobs/{slug}), while cleanly rendering the complete JobDetails engine.
 */
export const JobSubdomainRedirect: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  useEffect(() => {
    if (typeof window !== 'undefined' && slugOrId) {
      const canonicalUrl = getCanonicalJobUrl(slugOrId);
      if (window.location.href !== canonicalUrl) {
        window.location.replace(canonicalUrl);
      }
    }
  }, [slugOrId]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="text-xs font-medium">Opening verified job details...</span>
      </div>
    }>
      <JobDetails />
    </Suspense>
  );
};

export default JobSubdomainRedirect;
