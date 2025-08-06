import React from 'react';
import { useParams } from 'react-router-dom';
import JobsSimple from '@/pages/JobsSimple';
import { SEOHead } from '@/components/seo/SEOHead';

const JobsByRole = () => {
  const { role } = useParams();
  const formattedRole = role?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const roleDescriptions: { [key: string]: string } = {
    'software-engineer': 'Software Engineer jobs across India. Find opportunities in development, programming, and software architecture.',
    'data-scientist': 'Data Scientist positions with top companies. Work with big data, machine learning, and analytics.',
    'product-manager': 'Product Manager roles to lead product development and strategy in innovative companies.',
    'devops-engineer': 'DevOps Engineer jobs focusing on CI/CD, cloud infrastructure, and automation.',
    'ui-ux-designer': 'UI/UX Designer positions to create beautiful and user-friendly digital experiences.',
    'business-analyst': 'Business Analyst roles to bridge technology and business requirements.',
    'full-stack-developer': 'Full Stack Developer jobs working on both frontend and backend technologies.',
    'frontend-developer': 'Frontend Developer positions focusing on user interfaces and web technologies.',
    'backend-developer': 'Backend Developer roles building server-side applications and APIs.',
    'machine-learning-engineer': 'Machine Learning Engineer jobs in AI, ML, and data science projects.'
  };
  
  return (
    <>
      <SEOHead
        title={`${formattedRole} Jobs in India | TalentXcel - Latest ${formattedRole} Opportunities`}
        description={roleDescriptions[role!] || `Find the best ${formattedRole} job opportunities in India. Browse verified positions with top companies on TalentXcel.`}
        keywords={[
          `${role} jobs`,
          `${formattedRole} careers`,
          `${role} opportunities India`,
          `${formattedRole} hiring`,
          `${role} positions`,
          'jobs in India',
          'TalentXcel'
        ]}
        canonical={`https://talentxcel.in/jobs/role/${role}`}
      />
      <JobsSimple roleFilter={role} />
    </>
  );
};

export default JobsByRole;