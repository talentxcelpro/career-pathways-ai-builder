import { getCurrentUniverse, UNIVERSE_ROOT_PATHS, normalizeHostname } from '@/config/domainArchitecture';

// Utility to handle subdomain redirect tracking
export const setSubdomainRedirect = (path: string) => {
  localStorage.setItem('subdomain_redirect', path);
};

export const getSubdomainRedirect = (): string | null => {
  return localStorage.getItem('subdomain_redirect');
};

export const clearSubdomainRedirect = () => {
  localStorage.removeItem('subdomain_redirect');
};

// Extract subdomain info from referrer or URL params
export const extractSubdomainContext = (): string | null => {
  // Check URL params first
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect') || urlParams.get('returnUrl');
    if (redirectParam) {
      return redirectParam;
    }
  }

  // Check referrer for subdomain context
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      const host = normalizeHostname(referrerUrl.hostname);
      if (host.includes('talentxcel.in')) {
        const universe = getCurrentUniverse(host);
        if (universe !== 'CORE') {
          return UNIVERSE_ROOT_PATHS[universe];
        }
      }
    } catch (error) {
      console.warn('Error parsing referrer URL:', error);
    }
  }

  // Check current window hostname
  if (typeof window !== 'undefined') {
    const host = normalizeHostname(window.location.hostname);
    if (host.includes('talentxcel.in')) {
      const universe = getCurrentUniverse(host);
      if (universe !== 'CORE') {
        return UNIVERSE_ROOT_PATHS[universe];
      }
    }
  }

  return null;
};