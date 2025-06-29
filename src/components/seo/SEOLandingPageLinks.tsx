
import React from 'react';
import { Link } from 'react-router-dom';

export const SEOLandingPageLinks = () => {
  const jobLocations = [
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Gurgaon', slug: 'gurgaon' },
  ];

  const jobRoles = [
    { name: 'Software Engineer', slug: 'software-engineer' },
    { name: 'Data Scientist', slug: 'data-scientist' },
    { name: 'Product Manager', slug: 'product-manager' },
    { name: 'DevOps Engineer', slug: 'devops-engineer' },
    { name: 'UI/UX Designer', slug: 'ui-ux-designer' },
    { name: 'Business Analyst', slug: 'business-analyst' },
  ];

  const jobSkills = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'Python', slug: 'python' },
    { name: 'React', slug: 'react' },
    { name: 'Java', slug: 'java' },
    { name: 'AWS', slug: 'aws' },
    { name: 'Machine Learning', slug: 'machine-learning' },
  ];

  const courseCategories = [
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Digital Marketing', slug: 'digital-marketing' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Cloud Computing', slug: 'cloud-computing' },
    { name: 'Cybersecurity', slug: 'cybersecurity' },
  ];

  const salaryGuides = [
    { name: 'Software Engineer Salary', slug: 'software-engineer' },
    { name: 'Data Scientist Salary', slug: 'data-scientist' },
    { name: 'Product Manager Salary', slug: 'product-manager' },
    { name: 'DevOps Engineer Salary', slug: 'devops-engineer' },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Career Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover jobs, companies, courses, and salary insights across India's top locations and trending skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          
          {/* Jobs by Location */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Jobs by Location</h3>
            <div className="space-y-2">
              {jobLocations.map((location) => (
                <Link
                  key={location.slug}
                  to={`/jobs/location/${location.slug}`}
                  className="block text-gray-700 hover:text-blue-600 text-sm hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  Jobs in {location.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Jobs by Role */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">Jobs by Role</h3>
            <div className="space-y-2">
              {jobRoles.map((role) => (
                <Link
                  key={role.slug}
                  to={`/jobs/role/${role.slug}`}
                  className="block text-gray-700 hover:text-purple-600 text-sm hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                >
                  {role.name} Jobs
                </Link>
              ))}
            </div>
          </div>

          {/* Jobs by Skill */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-cyan-600">Jobs by Skill</h3>
            <div className="space-y-2">
              {jobSkills.map((skill) => (
                <Link
                  key={skill.slug}
                  to={`/jobs/skill/${skill.slug}`}
                  className="block text-gray-700 hover:text-cyan-600 text-sm hover:bg-cyan-50 px-2 py-1 rounded transition-colors"
                >
                  {skill.name} Jobs
                </Link>
              ))}
            </div>
          </div>

          {/* Courses by Category */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Learning Paths</h3>
            <div className="space-y-2">
              {courseCategories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/courses/category/${category.slug}`}
                  className="block text-gray-700 hover:text-green-600 text-sm hover:bg-green-50 px-2 py-1 rounded transition-colors"
                >
                  {category.name} Courses
                </Link>
              ))}
            </div>
          </div>

          {/* Salary Guides */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-4 text-emerald-600">Salary Insights</h3>
            <div className="space-y-2">
              {salaryGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/salary/${guide.slug}`}
                  className="block text-gray-700 hover:text-emerald-600 text-sm hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                >
                  {guide.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Company Links */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm border">
          <h3 className="text-xl font-semibold mb-6 text-center text-gray-900">Companies by Location</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {jobLocations.map((location) => (
              <Link
                key={location.slug}
                to={`/companies/location/${location.slug}`}
                className="text-center bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {location.name} Companies
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
