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
      
      // Try to find job by numeric ID or partial match
      const { data, error } = await supabase
        .from('jobs')
        .select('id, seo_slug, title')
        .or(`seo_slug.ilike.%${id}%,title.ilike.%${id}%`)
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