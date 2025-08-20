import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export const SEOJobCategories = () => {
  const jobRoles = [
    { name: 'Software Engineer', slug: 'software-engineer' },
    { name: 'Data Scientist', slug: 'data-scientist' },
    { name: 'Product Manager', slug: 'product-manager' },
    { name: 'DevOps Engineer', slug: 'devops-engineer' },
    { name: 'UI/UX Designer', slug: 'ui-ux-designer' },
    { name: 'Business Analyst', slug: 'business-analyst' },
    { name: 'Full Stack Developer', slug: 'full-stack-developer' },
    { name: 'Frontend Developer', slug: 'frontend-developer' },
    { name: 'Backend Developer', slug: 'backend-developer' },
    { name: 'Machine Learning Engineer', slug: 'machine-learning-engineer' }
  ];

  const jobLocations = [
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Gurgaon', slug: 'gurgaon' },
    { name: 'Noida', slug: 'noida' },
    { name: 'Ahmedabad', slug: 'ahmedabad' }
  ];

  const jobSkills = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'Python', slug: 'python' },
    { name: 'React', slug: 'react' },
    { name: 'Java', slug: 'java' },
    { name: 'AWS', slug: 'aws' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'SQL', slug: 'sql' },
    { name: 'Docker', slug: 'docker' },
    { name: 'Kubernetes', slug: 'kubernetes' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Angular', slug: 'angular' }
  ];

  const [query, setQuery] = useState('');
  const norm = (s: string) => s.toLowerCase();
  const filteredRoles = useMemo(() => jobRoles.filter(r => norm(r.name).includes(norm(query))), [query]);
  const filteredLocations = useMemo(() => jobLocations.filter(l => norm(l.name).includes(norm(query))), [query]);
  const filteredSkills = useMemo(() => jobSkills.filter(s => norm(s.name).includes(norm(query))), [query]);

  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Explore Jobs by Category
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover thousands of opportunities across different roles, locations, and skill sets
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <label htmlFor="seo-categories-search" className="sr-only">Search roles, locations, or skills</label>
          <input
            id="seo-categories-search"
            type="search"
            placeholder="Search roles, locations, or skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs by Role */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              Jobs by Role
            </h3>
            <div className="space-y-3">
              {filteredRoles.map((role) => (
                <Link
                  key={role.slug}
                  to={`/jobs/role/${role.slug}`}
                  className="block text-slate-600 hover:text-blue-600 transition-colors duration-200 py-1"
                >
                  {role.name} Jobs
                </Link>
              ))}
              <Link
                to="/jobs"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4"
              >
                View all jobs →
              </Link>
            </div>
          </div>

          {/* Jobs by Location */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Jobs by Location
            </h3>
            <div className="space-y-3">
              {filteredLocations.map((location) => (
                <Link
                  key={location.slug}
                  to={`/jobs/location/${location.slug}`}
                  className="block text-slate-600 hover:text-green-600 transition-colors duration-200 py-1"
                >
                  Jobs in {location.name}
                </Link>
              ))}
              <Link
                to="/jobs"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mt-4"
              >
                View all jobs →
              </Link>
            </div>
          </div>

          {/* Jobs by Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
              Jobs by Skills
            </h3>
            <div className="space-y-3">
              {filteredSkills.map((skill) => (
                <Link
                  key={skill.slug}
                  to={`/jobs/skill/${skill.slug}`}
                  className="block text-slate-600 hover:text-purple-600 transition-colors duration-200 py-1"
                >
                  {skill.name} Jobs
                </Link>
              ))}
              <Link
                to="/jobs"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mt-4"
              >
                View all jobs →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main CTA to all jobs */}
        <div className="text-center mt-12">
          <Link
            to="/jobs"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Browse All Jobs
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};