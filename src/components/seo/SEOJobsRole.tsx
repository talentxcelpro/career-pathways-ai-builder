import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { InternalLinks } from './InternalLinks';

const Jobs = lazy(() => import('@/pages/Jobs'));

export const SEOJobsRole = () => {
  const { role } = useParams();
  const formattedRole = role?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return (
    <>
      <SEOHead
        title={`${formattedRole} Jobs | TalentXcel - ${formattedRole} Career Opportunities`}
        description={`Explore ${formattedRole} job opportunities in India. Find verified ${formattedRole} positions with top companies. Apply for ${formattedRole} jobs on TalentXcel.`}
        keywords={[`${role} jobs`, `${formattedRole} careers`, `${role} opportunities`, `${formattedRole} hiring`, `${role} positions`]}
        canonical={`https://talentxcel.in/jobs/role/${role}`}
      />
      <Suspense fallback={null}>
        <Jobs />
      </Suspense>
      <InternalLinks currentPage={`/jobs/role/${role}`} />
    </>
  );
};