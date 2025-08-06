import React from 'react';
import { useParams } from 'react-router-dom';
import JobsSimple from '@/pages/JobsSimple';
import { SEOHead } from '@/components/seo/SEOHead';

const JobsByLocation = () => {
  const { location } = useParams();
  const formattedLocation = location?.charAt(0).toUpperCase() + location?.slice(1);
  
  const locationDescriptions: { [key: string]: string } = {
    'bangalore': 'Jobs in Bangalore - India\'s Silicon Valley. Find tech, startup, and corporate opportunities.',
    'mumbai': 'Jobs in Mumbai - Financial capital of India. Explore finance, media, and business roles.',
    'delhi': 'Jobs in Delhi - Capital city opportunities in government, consulting, and corporate sectors.',
    'hyderabad': 'Jobs in Hyderabad - Growing tech hub with opportunities in IT and biotechnology.',
    'chennai': 'Jobs in Chennai - South India\'s major city with automotive, IT, and healthcare jobs.',
    'pune': 'Jobs in Pune - Educational and IT hub with diverse career opportunities.',
    'kolkata': 'Jobs in Kolkata - Cultural capital with opportunities in education, arts, and business.',
    'gurgaon': 'Jobs in Gurgaon - Millennium city with corporate headquarters and tech companies.',
    'noida': 'Jobs in Noida - Planned city with IT, media, and software development opportunities.',
    'ahmedabad': 'Jobs in Ahmedabad - Commercial hub with textile, chemical, and IT industry jobs.'
  };
  
  return (
    <>
      <SEOHead
        title={`Jobs in ${formattedLocation} | TalentXcel - Top Career Opportunities in ${formattedLocation}`}
        description={locationDescriptions[location!] || `Find the best job opportunities in ${formattedLocation}. Browse 1000+ verified jobs across various industries on TalentXcel.`}
        keywords={[
          `jobs in ${location}`,
          `${location} jobs`,
          `careers ${location}`,
          `employment ${location}`,
          `hiring ${location}`,
          `${formattedLocation} opportunities`,
          'jobs India',
          'TalentXcel'
        ]}
        canonical={`https://talentxcel.in/jobs/location/${location}`}
      />
      <JobsSimple locationFilter={location} />
    </>
  );
};

export default JobsByLocation;