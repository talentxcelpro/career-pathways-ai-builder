import React from 'react';
import { Link } from 'react-router-dom';

interface InternalLinksProps {
  currentPage?: string;
}

export const InternalLinks: React.FC<InternalLinksProps> = ({ currentPage }) => {
  const corePages = [
    { name: 'Find Jobs', path: '/jobs', priority: 'high' },
    { name: 'Professional Network', path: '/network', priority: 'high' },
    { name: 'Top Companies', path: '/companies', priority: 'high' },
    { name: 'Learning Center', path: '/learning', priority: 'medium' },
    { name: 'Resume Builder', path: '/resume-builder', priority: 'medium' },
    { name: 'Career Mapping', path: '/career-map', priority: 'medium' },
    { name: 'AI Tools', path: '/tools', priority: 'low' },
  ];

  const jobCategories = [
    { name: 'Software Engineer Jobs', path: '/jobs/role/software-engineer' },
    { name: 'Product Manager Jobs', path: '/jobs/role/product-manager' },
    { name: 'Data Scientist Jobs', path: '/jobs/role/data-scientist' },
    { name: 'UX Designer Jobs', path: '/jobs/role/ux-designer' },
  ];

  const locations = [
    { name: 'Jobs in Bangalore', path: '/jobs/location/bangalore' },
    { name: 'Jobs in Mumbai', path: '/jobs/location/mumbai' },
    { name: 'Jobs in Delhi NCR', path: '/jobs/location/delhi-ncr' },
    { name: 'Remote Jobs', path: '/jobs/location/remote' },
  ];

  const filteredPages = corePages.filter(page => page.path !== currentPage);

  return (
    <nav className="internal-links-navigation" aria-label="Site Navigation">
      {/* Core Page Links */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {filteredPages.slice(0, 4).map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-glow transition-colors duration-200 hover:underline"
            >
              {page.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Contextual Links Based on Current Page */}
      {currentPage === '/' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Popular Roles</h3>
            <ul className="space-y-1">
              {jobCategories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Top Locations</h3>
            <ul className="space-y-1">
              {locations.map((location) => (
                <li key={location.path}>
                  <Link
                    to={location.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Career Tools</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/resume" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/career-map" className="text-muted-foreground hover:text-primary transition-colors">
                  Career Path Mapping
                </Link>
              </li>
              <li>
                <Link to="/learning" className="text-muted-foreground hover:text-primary transition-colors">
                  Skill Development
                </Link>
              </li>
              <li>
                <Link to="/network" className="text-muted-foreground hover:text-primary transition-colors">
                  Professional Network
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {currentPage?.startsWith('/jobs') && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-foreground">Related: </span>
            <Link to="/network" className="text-sm text-primary hover:underline mr-4">
              Meet Professionals
            </Link>
            <Link to="/resume" className="text-sm text-primary hover:underline mr-4">
              Build Resume
            </Link>
            <Link to="/learning" className="text-sm text-primary hover:underline">
              Skill Up
            </Link>
          </div>
        </div>
      )}

      {currentPage?.startsWith('/network') && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-foreground">Discover: </span>
            <Link to="/jobs" className="text-sm text-primary hover:underline mr-4">
              Job Opportunities
            </Link>
            <Link to="/companies" className="text-sm text-primary hover:underline mr-4">
              Top Companies
            </Link>
            <Link to="/career-map" className="text-sm text-primary hover:underline">
              Career Planning
            </Link>
          </div>
        </div>
      )}

      {currentPage?.startsWith('/companies') && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-foreground">Explore: </span>
            <Link to="/jobs" className="text-sm text-primary hover:underline mr-4">
              Open Positions
            </Link>
            <Link to="/network" className="text-sm text-primary hover:underline mr-4">
              Employee Profiles
            </Link>
            <Link to="/learning" className="text-sm text-primary hover:underline">
              Industry Skills
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};