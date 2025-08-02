import { useEffect } from 'react';

export const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Set Content Security Policy meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.razorpay.com https://accounts.google.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.openai.com https://api.razorpay.com https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://www.google-analytics.com",
      "frame-src 'self' https://js.stripe.com https://checkout.razorpay.com https://accounts.google.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "worker-src 'self' blob:",
      "media-src 'self' data: blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ');
    
    document.head.appendChild(meta);

    // Add X-Frame-Options for additional clickjacking protection
    const frameOptions = document.createElement('meta');
    frameOptions.httpEquiv = 'X-Frame-Options';
    frameOptions.content = 'DENY';
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

    // Add Permissions Policy (formerly Feature Policy)
    const permissionsPolicy = document.createElement('meta');
    permissionsPolicy.httpEquiv = 'Permissions-Policy';
    permissionsPolicy.content = 'camera=(), microphone=(), geolocation=(), payment=()';
    document.head.appendChild(permissionsPolicy);

    // Add Cross-Origin-Embedder-Policy
    const coep = document.createElement('meta');
    coep.httpEquiv = 'Cross-Origin-Embedder-Policy';
    coep.content = 'require-corp';
    document.head.appendChild(coep);

    // Add Cross-Origin-Opener-Policy
    const coop = document.createElement('meta');
    coop.httpEquiv = 'Cross-Origin-Opener-Policy';
    coop.content = 'same-origin';
    document.head.appendChild(coop);

    return () => {
      // Cleanup
      try {
        if (meta.parentNode) document.head.removeChild(meta);
        if (frameOptions.parentNode) document.head.removeChild(frameOptions);
        if (contentTypeOptions.parentNode) document.head.removeChild(contentTypeOptions);
        if (referrerPolicy.parentNode) document.head.removeChild(referrerPolicy);
        if (permissionsPolicy.parentNode) document.head.removeChild(permissionsPolicy);
        if (coep.parentNode) document.head.removeChild(coep);
        if (coop.parentNode) document.head.removeChild(coop);
      } catch (error) {
        console.warn('Error cleaning up security headers:', error);
      }
    };
  }, []);

  return null;
};