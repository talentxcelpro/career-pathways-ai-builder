import { useEffect } from 'react';

export const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Set Content Security Policy meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.openai.com https://api.razorpay.com https://*.supabase.co wss://*.supabase.co",
      "frame-src 'self' https://js.stripe.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
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

    return () => {
      // Cleanup
      document.head.removeChild(meta);
      document.head.removeChild(frameOptions);
      document.head.removeChild(contentTypeOptions);
      document.head.removeChild(referrerPolicy);
    };
  }, []);

  return null;
};