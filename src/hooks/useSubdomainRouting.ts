import { useEffect } from 'react';
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

export const useSubdomainRouting = () => {
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

  // Helper to get current subdomain
  const getCurrentSubdomain = () => {
    if (typeof window === 'undefined') return null;
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return subdomainRoutes[subdomain] ? subdomain : null;
  };

  return {
    getCurrentSubdomain,
    isSubdomainRoute: !!getCurrentSubdomain()
  };
};