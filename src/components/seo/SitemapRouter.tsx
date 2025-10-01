import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Component to handle dynamic sitemap requests and redirect to edge function
 * Mounts when route matches /sitemap-*.xml or /api/sitemap
 */
export const SitemapRouter = () => {
  const location = useLocation();

  useEffect(() => {
    const handleSitemapRequest = async () => {
      const path = location.pathname;
      
      // Extract module from path like /sitemap-jobs.xml
      const match = path.match(/\/sitemap-(\w+)\.xml/);
      if (!match) return;
      
      const module = match[1];
      
      try {
        // Call edge function to generate dynamic sitemap
        const { data, error } = await supabase.functions.invoke('generate-sitemap', {
          body: { module, page: 1 }
        });

        if (error) {
          console.error('Sitemap generation error:', error);
          return;
        }

        // Serve the XML response
        const blob = new Blob([data], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        window.location.href = url;
      } catch (error) {
        console.error('Sitemap fetch error:', error);
      }
    };

    handleSitemapRequest();
  }, [location]);

  return null;
};
