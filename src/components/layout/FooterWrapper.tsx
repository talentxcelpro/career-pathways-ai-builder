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
  if (location.pathname === '/') {
    return <Footer />;
  }
  
  // Show minimal copyright footer on all other pages
  return (
    <div className="w-full text-center py-4 text-sm text-muted-foreground bg-background border-t">
      © 2026 TalentXcel Technologies Pvt Ltd. All rights reserved.
    </div>
  );
};