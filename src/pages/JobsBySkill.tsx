import React from 'react';
import { useParams } from 'react-router-dom';
import JobsSimple from '@/pages/JobsSimple';
import { SEOHead } from '@/components/seo/SEOHead';

const JobsBySkill = () => {
  const { skill } = useParams();
  const formattedSkill = skill?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const skillDescriptions: { [key: string]: string } = {
    'javascript': 'JavaScript developer jobs across frontend, backend, and full-stack development roles.',
    'python': 'Python programming jobs in web development, data science, AI, and automation.',
    'react': 'React.js developer positions building modern user interfaces and web applications.',
    'java': 'Java development jobs in enterprise applications, Android development, and backend systems.',
    'aws': 'AWS cloud jobs focusing on cloud architecture, DevOps, and cloud migration projects.',
    'machine-learning': 'Machine Learning jobs in AI, data science, and predictive analytics.',
    'nodejs': 'Node.js backend development jobs building scalable server-side applications.',
    'sql': 'SQL database jobs for data analysts, database administrators, and backend developers.',
    'docker': 'Docker containerization jobs in DevOps, cloud deployment, and infrastructure.',
    'kubernetes': 'Kubernetes orchestration jobs managing container deployments and cloud infrastructure.',
    'typescript': 'TypeScript development jobs for type-safe JavaScript applications.',
    'angular': 'Angular framework jobs building enterprise web applications and SPAs.'
  };
  
  return (
    <>
      <SEOHead
        title={`${formattedSkill} Jobs in India | TalentXcel - Latest ${formattedSkill} Developer Opportunities`}
        description={skillDescriptions[skill!] || `Find ${formattedSkill} developer jobs and career opportunities. Browse verified positions requiring ${formattedSkill} skills on TalentXcel.`}
        keywords={[
          `${skill} jobs`,
          `${formattedSkill} developer`,
          `${skill} programming jobs`,
          `${formattedSkill} careers`,
          `${skill} opportunities`,
          'developer jobs India',
          'programming careers',
          'TalentXcel'
        ]}
        canonical={`https://talentxcel.in/jobs/skill/${skill}`}
      />
      <JobsSimple skillFilter={skill} />
    </>
  );
};

export default JobsBySkill;