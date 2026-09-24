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

      // If it's already a valid SEO slug, redirect to /jobs/:slugOrId
      if (isValidJobSlug(slugOrId)) {
        navigate(`/jobs/${slugOrId}`, { replace: true });
        return;
      }

      // If it's a UUID, fetch job data and redirect to SEO URL
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      if (isUuid) {
        try {
          const { data: job } = await supabase
            .from('jobs')
            .select('id, title, location, seo_slug')
            .eq('id', slugOrId)
            .maybeSingle();

          if (job) {
            navigate(getJobDetailUrl(job), { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error fetching job for redirect:', error);
        }
      }

      // If we can extract an ID from the slug, try to find the job using partial ID
      const extractedId = extractJobId(slugOrId);
      if (extractedId && extractedId !== slugOrId) {
        try {
          const { data: job } = await supabase
            .from('jobs')
            .select('id, title, location, seo_slug')
            .ilike('seo_slug', `%${extractedId}%`)
            .limit(1)
            .maybeSingle();

          if (job) {
            navigate(getJobDetailUrl(job), { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error fetching job by partial ID:', error);
        }
      }

      // General fallback: search by title keywords
      const titleKeywords = slugOrId.replace(/[-_]+/g, ' ').trim();
      if (titleKeywords.length >= 3) {
        try {
          const { data: job } = await supabase
            .from('jobs')
            .select('id, title, location, seo_slug')
            .ilike('title', `%${titleKeywords.split(' ')[0]}%`)
            .limit(1)
            .maybeSingle();

          if (job) {
            navigate(getJobDetailUrl(job), { replace: true });
            return;
          }
        } catch (e) {
          console.error('Error fuzzy searching job:', e);
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