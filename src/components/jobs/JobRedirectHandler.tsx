import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const JobRedirectHandler = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job-redirect', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Check if it's a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { data: uuidJob } = await supabase
          .from('jobs')
          .select('id, seo_slug, title')
          .eq('id', id)
          .maybeSingle();
        if (uuidJob) return uuidJob;
      }

      // Try exact SEO slug match
      const { data: exactSlugJob } = await supabase
        .from('jobs')
        .select('id, seo_slug, title')
        .eq('seo_slug', id)
        .maybeSingle();
      if (exactSlugJob) return exactSlugJob;

      // Try partial match
      const cleanSearch = id.replace(/-/g, ' ');
      const { data, error } = await supabase
        .from('jobs')
        .select('id, seo_slug, title')
        .or(`seo_slug.ilike.%${id}%,title.ilike.%${cleanSearch}%`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!isLoading && job) {
      // Redirect to proper SEO URL
      navigate(`/jobs/${job.seo_slug}`, { replace: true });
    } else if (!isLoading && !job) {
      // Job not found, redirect to jobs list
      navigate('/jobs', { replace: true });
    }
  }, [job, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
        <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/jobs')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Back to Jobs
        </button>
      </div>
    </div>
  );
};