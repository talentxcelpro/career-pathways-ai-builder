import React from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from './Footer';

export const FooterWrapper: React.FC = () => {
  const location = useLocation();
  
  // Hide footer on jobs-related routes
  if (location.pathname.startsWith('/jobs')) {
    return null;
  }
  
  // Show full footer only on homepage
  // Show the full footer (with the public site directory) on the homepage and
  // across the public marketing / SEO information architecture.
  const IA_PREFIXES = [
    '/industries',
    '/locations',
    '/resources',
    '/employers',
    '/company-info',
    '/resume-builder',
    '/ai-career-coach',
    '/job-matching',
    '/reverse-job-search',
    '/career-coaching',
    '/staffing',
    '/recruitment',
    '/rpo',
    '/staff-augmentation',
  ];
  if (location.pathname === '/' || IA_PREFIXES.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))) {
    return <Footer />;
  }
  
  // Show minimal copyright footer on all other pages
  return (
    <div className="w-full text-center py-4 text-sm text-muted-foreground bg-background border-t">
      © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
    </div>
  );
};