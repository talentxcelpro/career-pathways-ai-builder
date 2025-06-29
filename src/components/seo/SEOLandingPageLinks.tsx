
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
  ];

  const jobRoles = [
    { name: 'Software Engineer', slug: 'software-engineer' },
    { name: 'Data Scientist', slug: 'data-scientist' },
    { name: 'Product Manager', slug: 'product-manager' },
    { name: 'DevOps Engineer', slug: 'devops-engineer' },
    { name: 'UI/UX Designer', slug: 'ui-ux-designer' },
    { name: 'Business Analyst', slug: 'business-analyst' },
  ];

  const courseCategories = [
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Digital Marketing', slug: 'digital-marketing' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Cloud Computing', slug: 'cloud-computing' },
    { name: 'Cybersecurity', slug: 'cybersecurity' },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Jobs by Location */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Jobs by Location</h3>
            <div className="space-y-2">
              {jobLocations.map((location) => (
                <Link
                  key={location.slug}
                  to={`/jobs/location/${location.slug}`}
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Jobs in {location.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Jobs by Role */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Jobs by Role</h3>
            <div className="space-y-2">
              {jobRoles.map((role) => (
                <Link
                  key={role.slug}
                  to={`/jobs/role/${role.slug}`}
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  {role.name} Jobs
                </Link>
              ))}
            </div>
          </div>

          {/* Courses by Category */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Courses by Category</h3>
            <div className="space-y-2">
              {courseCategories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/courses/category/${category.slug}`}
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  {category.name} Courses
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
