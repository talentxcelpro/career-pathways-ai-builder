import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, MapPin, Target, Code, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const JobCategoriesSection = () => {
  const jobsByRole = [
    { title: 'Software Engineer Jobs', href: '/jobs?role=software-engineer' },
    { title: 'Data Scientist Jobs', href: '/jobs?role=data-scientist' },
    { title: 'Product Manager Jobs', href: '/jobs?role=product-manager' },
    { title: 'DevOps Engineer Jobs', href: '/jobs?role=devops-engineer' },
    { title: 'UI/UX Designer Jobs', href: '/jobs?role=ui-ux-designer' },
    { title: 'Business Analyst Jobs', href: '/jobs?role=business-analyst' },
    { title: 'Full Stack Developer Jobs', href: '/jobs?role=full-stack-developer' },
    { title: 'Frontend Developer Jobs', href: '/jobs?role=frontend-developer' },
    { title: 'Backend Developer Jobs', href: '/jobs?role=backend-developer' },
    { title: 'Machine Learning Engineer Jobs', href: '/jobs?role=ml-engineer' },
  ];

  const jobsByLocation = [
    { title: 'Jobs in Bangalore', href: '/jobs?location=bangalore' },
    { title: 'Jobs in Mumbai', href: '/jobs?location=mumbai' },
    { title: 'Jobs in Delhi', href: '/jobs?location=delhi' },
    { title: 'Jobs in Hyderabad', href: '/jobs?location=hyderabad' },
    { title: 'Jobs in Chennai', href: '/jobs?location=chennai' },
    { title: 'Jobs in Pune', href: '/jobs?location=pune' },
    { title: 'Jobs in Kolkata', href: '/jobs?location=kolkata' },
    { title: 'Jobs in Gurgaon', href: '/jobs?location=gurgaon' },
    { title: 'Jobs in Noida', href: '/jobs?location=noida' },
    { title: 'Jobs in Ahmedabad', href: '/jobs?location=ahmedabad' },
  ];

  const jobsBySkill = [
    { title: 'JavaScript Jobs', href: '/jobs?skill=javascript' },
    { title: 'Python Jobs', href: '/jobs?skill=python' },
    { title: 'React Jobs', href: '/jobs?skill=react' },
    { title: 'Java Jobs', href: '/jobs?skill=java' },
    { title: 'AWS Jobs', href: '/jobs?skill=aws' },
    { title: 'Machine Learning Jobs', href: '/jobs?skill=machine-learning' },
    { title: 'Node.js Jobs', href: '/jobs?skill=nodejs' },
    { title: 'SQL Jobs', href: '/jobs?skill=sql' },
    { title: 'Docker Jobs', href: '/jobs?skill=docker' },
    { title: 'Kubernetes Jobs', href: '/jobs?skill=kubernetes' },
    { title: 'TypeScript Jobs', href: '/jobs?skill=typescript' },
    { title: 'Angular Jobs', href: '/jobs?skill=angular' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Jobs by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover thousands of opportunities across different roles, locations, and skill sets
          </p>
        </div>

        {/* Main Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Role-focused Careers */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Role-focused Careers
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Discover roles across industries, tailored to your expertise.
              </p>
              <div className="space-y-2">
                {jobsByRole.slice(0, 5).map((job, index) => (
                  <Link
                    key={index}
                    to={job.href}
                    className="block text-blue-600 hover:text-blue-800 text-sm hover:underline transition-colors"
                  >
                    {job.title}
                  </Link>
                ))}
                <Link
                  to="/jobs"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                >
                  View all jobs →
                </Link>
              </div>
            </div>
          </div>

          {/* Find Jobs Near You */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Find Jobs Near You
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Browse job listings by location, from metro cities to emerging hubs.
              </p>
              <div className="space-y-2">
                {jobsByLocation.slice(0, 5).map((job, index) => (
                  <Link
                    key={index}
                    to={job.href}
                    className="block text-green-600 hover:text-green-800 text-sm hover:underline transition-colors"
                  >
                    {job.title}
                  </Link>
                ))}
                <Link
                  to="/jobs"
                  className="inline-flex items-center text-sm text-green-600 hover:text-green-800 font-medium mt-2"
                >
                  View all jobs →
                </Link>
              </div>
            </div>
          </div>

          {/* Skill-Focused Opportunities */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Skill-Focused Opportunities
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Explore openings aligned to your skillset.
              </p>
              <div className="space-y-2">
                {jobsBySkill.slice(0, 5).map((job, index) => (
                  <Link
                    key={index}
                    to={job.href}
                    className="block text-purple-600 hover:text-purple-800 text-sm hover:underline transition-colors"
                  >
                    {job.title}
                  </Link>
                ))}
                <Link
                  to="/jobs"
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium mt-2"
                >
                  View all jobs →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Job Categories */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Jobs by Role */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 text-blue-600 mr-2" />
                Jobs by Role
              </h4>
              <div className="space-y-3">
                {jobsByRole.map((job, index) => (
                  <Link
                    key={index}
                    to={job.href}
                    className="block text-gray-600 hover:text-blue-600 text-sm hover:underline transition-colors"
                  >
                    {job.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Jobs by Location */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 text-green-600 mr-2" />
                Jobs by Location
              </h4>
              <div className="space-y-3">
                {jobsByLocation.map((job, index) => (
                  <Link
                    key={index}
                    to={job.href}
                    className="block text-gray-600 hover:text-green-600 text-sm hover:underline transition-colors"
                  >
                    {job.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Jobs by Skills */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                Jobs by Skills
              </h4>
              <div className="space-y-3">
                {jobsBySkill.map((job, index) => (
                  <Link
                    key={index}
                    to={job.href}
                    className="block text-gray-600 hover:text-purple-600 text-sm hover:underline transition-colors"
                  >
                    {job.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Browse All Jobs CTA */}
        <div className="text-center mt-12">
          <Link to="/jobs">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-4 text-lg font-semibold group"
            >
              Browse All Jobs
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};