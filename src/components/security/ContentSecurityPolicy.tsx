import { useEffect } from 'react';

export const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Only add non-CSP security headers since CSP is handled by Vercel
    
    // Add X-Frame-Options for additional clickjacking protection
    const frameOptions = document.createElement('meta');
    frameOptions.httpEquiv = 'X-Frame-Options';
    frameOptions.content = 'SAMEORIGIN';
    document.head.appendChild(frameOptions);

    // Add X-Content-Type-Options
    const contentTypeOptions = document.createElement('meta');
    contentTypeOptions.httpEquiv = 'X-Content-Type-Options';
    contentTypeOptions.content = 'nosniff';
    document.head.appendChild(contentTypeOptions);

    // Add Referrer Policy
    const referrerPolicy = document.createElement('meta');
    referrerPolicy.name = 'referrer';
    referrerPolicy.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicy);

    // Add Cross-Origin-Opener-Policy
    const coop = document.createElement('meta');
    coop.httpEquiv = 'Cross-Origin-Opener-Policy';
    coop.content = 'same-origin';
    document.head.appendChild(coop);

    return () => {
      // Cleanup
      try {
        if (frameOptions.parentNode) document.head.removeChild(frameOptions);
        if (contentTypeOptions.parentNode) document.head.removeChild(contentTypeOptions);
        if (referrerPolicy.parentNode) document.head.removeChild(referrerPolicy);
        if (coop.parentNode) document.head.removeChild(coop);
      } catch (error) {
        console.warn('Error cleaning up security headers:', error);
      }
    };
  }, []);

  return null;
};