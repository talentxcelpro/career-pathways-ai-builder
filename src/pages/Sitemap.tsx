import React from 'react';
import { useEffect } from 'react';

const SitemapRedirect = () => {
  useEffect(() => {
    // Redirect to the edge function
    window.location.href = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/dynamic-sitemap';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating sitemap...</p>
      </div>
    </div>
  );
};

export default SitemapRedirect;