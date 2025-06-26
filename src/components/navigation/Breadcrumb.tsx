
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    profile: 'Profile',
    edit: 'Edit Profile',
    resume: 'Resume',
    'cover-letter': 'Cover Letters',
    preferences: 'Job Preferences',
    settings: 'Settings',
    media: 'Media & Portfolio',
    analytics: 'Analytics',
    documents: 'Documents',
    jobs: 'Jobs',
    saved: 'Saved Jobs',
    applied: 'Applied Jobs',
    categories: 'Job Categories',
    companies: 'Companies',
    recommendations: 'Recommendations',
    alerts: 'Job Alerts',
    post: 'Post Job',
    manage: 'Manage Jobs',
    network: 'Network',
    people: 'People',
    posts: 'Posts',
    groups: 'Groups',
    events: 'Events',
    messages: 'Messages',
    notifications: 'Notifications',
    suggestions: 'Suggestions',
    learning: 'Learning',
    'my-courses': 'My Courses',
    paths: 'Learning Paths',
    certificates: 'Certificates',
    tools: 'Tools',
    'resume-check': 'Resume Checker',
    'cover-letter-generator': 'Cover Letter Generator',
    'salary-analyzer': 'Salary Analyzer',
    'interview-prep': 'Interview Prep',
    'ai-assistant': 'AI Assistant',
    'profile-score': 'Profile Score',
    'market-insights': 'Market Insights',
    'career-map': 'Career Map',
    generate: 'Generate Map',
    'ai-roadmap-builder': 'AI Roadmap Builder',
    'my-roadmaps': 'My Roadmaps',
    'skills-gap': 'Skills Gap Analysis',
    comparison: 'Comparison',
    switch: 'Career Switch',
    marketplace: 'Marketplace',
    'post-service': 'Post Service',
    employer: 'Employer Dashboard',
    colleges: 'Colleges',
    auth: 'Authentication',
    login: 'Login',
    register: 'Register',
    'forgot-password': 'Forgot Password',
    'reset-password': 'Reset Password'
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', path: ROUTES.HOME }
  ];

  let currentPath = '';
  pathnames.forEach((name, index) => {
    currentPath += `/${name}`;
    const isLast = index === pathnames.length - 1;
    
    breadcrumbItems.push({
      label: breadcrumbNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1),
      path: isLast ? undefined : currentPath
    });
  });

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {index === 0 && <Home className="h-4 w-4 mr-1" />}
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
