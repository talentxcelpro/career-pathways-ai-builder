import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SubdomainConfig {
  [subdomain: string]: string;
}

const subdomainRoutes: SubdomainConfig = {
  'jobs': '/jobs',
  'employer': '/employer',
  'learning': '/learning', 
  'colleges': '/colleges'
};

export const SubdomainRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Only redirect if we're on a subdomain and not already on the correct route
    if (subdomainRoutes[subdomain] && !location.pathname.startsWith(subdomainRoutes[subdomain])) {
      // Preserve the current path but prefix with subdomain route
      const targetPath = location.pathname === '/' 
        ? subdomainRoutes[subdomain]
        : `${subdomainRoutes[subdomain]}${location.pathname}`;
        
      navigate(targetPath, { replace: true });
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};