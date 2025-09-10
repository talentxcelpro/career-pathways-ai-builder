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
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  if (redirectParam) {
    return redirectParam;
  }

  // Check referrer for subdomain context
  const referrer = document.referrer;
  if (referrer) {
    try {
      const referrerUrl = new URL(referrer);
      const hostname = referrerUrl.hostname;
      
      if (hostname.includes('employer.talentxcel.in')) {
        return '/employer';
      } else if (hostname.includes('jobs.talentxcel.in')) {
        return '/jobs';
      } else if (hostname.includes('learning.talentxcel.in')) {
        return '/learning';
      } else if (hostname.includes('colleges.talentxcel.in')) {
        return '/colleges';
      }
    } catch (error) {
      console.warn('Error parsing referrer URL:', error);
    }
  }

  return null;
};