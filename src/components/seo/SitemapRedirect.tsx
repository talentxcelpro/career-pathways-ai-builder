import React, { useEffect } from 'react';

export const SitemapRedirect = () => {
  useEffect(() => {
    // Redirect to the enhanced sitemap function with SEO URLs
    window.location.href = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhanced-sitemap';
  }, []);

  return (
    <div className="p-8 text-center">
      <h1>Redirecting to Sitemap...</h1>
      <p>You are being redirected to the dynamic sitemap.</p>
      <p>If you are not redirected automatically, <a href="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/api-sitemap" className="text-blue-600 underline">click here</a>.</p>
    </div>
  );
};