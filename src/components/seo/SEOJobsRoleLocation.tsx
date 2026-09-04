import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { InternalLinks } from './InternalLinks';

const Jobs = lazy(() => import('@/pages/Jobs'));

export const SEOJobsRoleLocation = () => {
  const { role, location } = useParams();
  const formattedRole = role?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const formattedLocation = location?.charAt(0).toUpperCase() + location?.slice(1);
  
  return (
    <>
      <SEOHead
        title={`${formattedRole} Jobs in ${formattedLocation} | TalentXcel - ${formattedRole} Careers ${formattedLocation}`}
        description={`Find ${formattedRole} job opportunities in ${formattedLocation}. Browse verified ${formattedRole} positions in ${formattedLocation}. Apply for ${formattedRole} jobs in ${formattedLocation} on TalentXcel.`}
        keywords={[`${role} jobs ${location}`, `${formattedRole} careers ${location}`, `${role} opportunities ${location}`, `${formattedRole} hiring ${location}`]}
        canonical={`https://talentxcel.in/jobs/${role}/${location}`}
      />
      <Suspense fallback={null}>
        <Jobs />
      </Suspense>
      <InternalLinks currentPage={`/jobs/${role}/${location}`} />
    </>
  );
};