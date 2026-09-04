import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { InternalLinks } from './InternalLinks';

const Jobs = lazy(() => import('@/pages/Jobs'));

export const SEOJobsLocation = () => {
  const { location } = useParams();
  const formattedLocation = location?.charAt(0).toUpperCase() + location?.slice(1);
  
  return (
    <>
      <SEOHead
        title={`Jobs in ${formattedLocation} | TalentXcel - Top Opportunities in ${formattedLocation}`}
        description={`Find the best job opportunities in ${formattedLocation}. Browse 100+ verified jobs in ${formattedLocation} across various industries. Apply now on TalentXcel.`}
        keywords={[`jobs in ${location}`, `${location} jobs`, `careers ${location}`, `employment ${location}`, `hiring ${location}`]}
        canonical={`https://talentxcel.in/jobs/location/${location}`}
      />
      <Suspense fallback={null}>
        <Jobs />
      </Suspense>
      <InternalLinks currentPage={`/jobs/location/${location}`} />
    </>
  );
};