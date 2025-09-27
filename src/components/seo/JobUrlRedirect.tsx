import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getJobDetailUrl, extractJobId, isValidJobSlug } from '@/utils/seoUrls';

// Component to handle legacy UUID redirects to SEO URLs
export const JobUrlRedirect: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!slugOrId) return;

      // If it's already a valid SEO slug, no redirect needed
      if (isValidJobSlug(slugOrId)) {
        return;
      }

      // If it's a UUID, fetch job data and redirect to SEO URL
      if (slugOrId.length === 36 && slugOrId.includes('-')) {
        try {
          const { data: job } = await supabase
            .from('jobs')
            .select('id, title, location, seo_slug')
            .eq('id', slugOrId)
            .single();

          if (job) {
            const seoUrl = getJobDetailUrl(job);
            // 301 redirect to SEO-friendly URL
            window.location.replace(seoUrl);
            return;
          }
        } catch (error) {
          console.error('Error fetching job for redirect:', error);
        }
      }

      // If we can extract an ID from the slug, try to find the job using the new database function
      const extractedId = extractJobId(slugOrId);
      if (extractedId && extractedId !== slugOrId) {
        try {
          const { data: job } = await supabase
            .rpc('find_job_by_partial_id', { partial_id: extractedId })
            .maybeSingle();

          if (job) {
            const seoUrl = getJobDetailUrl(job);
            window.location.replace(seoUrl);
            return;
          }
        } catch (error) {
          console.error('Error fetching job by partial ID:', error);
        }
      }

      // If no valid job found, redirect to jobs listing
      navigate('/jobs', { replace: true });
    };

    handleRedirect();
  }, [slugOrId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to job details...</p>
      </div>
    </div>
  );
};