import React from 'react';
import { Link } from 'react-router-dom';

export const SEOLandingPageLinks = () => {
  const jobLocations = [
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Delhi NCR', slug: 'delhi' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Noida', slug: 'noida' },
    { name: 'Gurgaon', slug: 'gurgaon' },
  ];

  const jobRoles = [
    { name: 'Software Engineer', slug: 'software-engineer' },
    { name: 'Data Scientist', slug: 'data-scientist' },
    { name: 'Product Manager', slug: 'product-manager' },
    { name: 'DevOps Engineer', slug: 'devops-engineer' },
    { name: 'UI/UX Designer', slug: 'ui-ux-designer' },
    { name: 'Recruiter', slug: 'recruiter' },
    { name: 'Curriculum Developer', slug: 'curriculum-developer' },
    { name: 'Customer Experience Manager', slug: 'customer-experience-manager' },
  ];

  const jobSkills = [
    { name: 'Python', slug: 'python' },
    { name: 'React', slug: 'react' },
    { name: 'Java', slug: 'java' },
    { name: 'AWS Cloud', slug: 'aws' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Generative AI', slug: 'generative-ai' },
  ];

  const coreHubs = [
    { name: 'AI Product Rankings', url: '/rankings/ai-products' },
    { name: 'ATS Resume Studio', url: '/resume' },
    { name: 'Career Tools Suite', url: '/tools' },
    { name: '10,250+ Indian Colleges', url: '/colleges' },
    { name: '6-Step AI Career Pathway', url: '/colleges/pathway' },
    { name: 'Global Tuition-Free Degrees', url: '/colleges/global-programs' },
    { name: 'Global Scholarships Directory', url: '/colleges/scholarships' },
    { name: 'Corporate Staffing & RPO', url: '/services' },
  ];

  const featuredGuides = [
    { name: 'ATS Resume Guide 2026', slug: 'ats-resume-guide-2026' },
    { name: 'Talent Acquisition Strategy', slug: 'how-to-build-an-effective-talent-acquisition-strategy-india' },
  ];

  return (
    <section className="py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            TalentXcel Complete Career &amp; Hiring Ecosystem
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mx-auto">
            Discover verified jobs, executive recruitment services, Indian higher ed institutions, and high-income skills across India's top tech hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Jobs by Location */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-4 text-blue-400">Tech Hiring by Hub</h3>
            <div className="space-y-1.5">
              {jobLocations.map((location) => (
                <Link
                  key={location.slug}
                  to={`/locations/${location.slug}`}
                  className="block text-slate-300 hover:text-blue-400 text-xs py-1 transition-colors"
                >
                  Jobs in {location.name} &rarr;
                </Link>
              ))}
            </div>
          </div>

          {/* Jobs by Role */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-4 text-purple-400">Career &amp; Role Guides</h3>
            <div className="space-y-1.5">
              {jobRoles.map((role) => (
                <Link
                  key={role.slug}
                  to={`/roles/${role.slug}`}
                  className="block text-slate-300 hover:text-purple-400 text-xs py-1 transition-colors"
                >
                  {role.name} Careers &rarr;
                </Link>
              ))}
            </div>
          </div>

          {/* Skill & Learning Hubs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-4 text-emerald-400">Skills &amp; Technology</h3>
            <div className="space-y-1.5">
              {jobSkills.map((skill) => (
                <Link
                  key={skill.slug}
                  to={`/skills/${skill.slug}`}
                  className="block text-slate-300 hover:text-emerald-400 text-xs py-1 transition-colors"
                >
                  {skill.name} Certification &rarr;
                </Link>
              ))}
            </div>
          </div>

          {/* Core Public Product Surfaces */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-4 text-amber-400">Public Intelligence Tools</h3>
            <div className="space-y-1.5">
              {coreHubs.map((hub) => (
                <Link
                  key={hub.url}
                  to={hub.url}
                  className="block text-slate-300 hover:text-amber-400 text-xs py-1 transition-colors"
                >
                  {hub.name} &rarr;
                </Link>
              ))}
              {featuredGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/resources/${guide.slug}`}
                  className="block text-blue-400 hover:underline text-xs py-1 pt-2 transition-colors font-medium"
                >
                  📖 {guide.name} &rarr;
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
