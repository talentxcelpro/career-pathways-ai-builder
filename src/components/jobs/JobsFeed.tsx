import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModernJobCard } from './ModernJobCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, AlertTriangle } from 'lucide-react';
import { useJobsEngagement } from '@/hooks/useJobsEngagement';
import { Badge } from '@/components/ui/badge';

interface JobsFeedProps {
  filters?: {
    search?: string;
    location?: string;
    employment_type?: string[];
    experience_level?: string[];
    is_remote?: boolean;
    skills?: string[];
  };
  sortBy?: string;
  className?: string;
}

export const JobsFeed: React.FC<JobsFeedProps> = ({ 
  filters = {}, 
  sortBy = 'created_at',
  className = '' 
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { savedJobs, isJobSaved } = useJobsEngagement();

  const { 
    data: jobs = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['jobs-feed', filters, sortBy, refreshKey],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gte('expires_at', new Date().toISOString());

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.employment_type && filters.employment_type.length > 0) {
        query = query.in('employment_type', filters.employment_type);
      }

      if (filters.experience_level && filters.experience_level.length > 0) {
        query = query.in('experience_level', filters.experience_level);
      }

      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }

      if (filters.skills && filters.skills.length > 0) {
        query = query.contains('skills_required', filters.skills);
      }

      // Apply sorting
      switch (sortBy) {
        case 'salary_max':
          query = query.order('salary_max', { ascending: false, nullsFirst: false });
          break;
        case 'views_count':
          query = query.order('views_count', { ascending: false, nullsFirst: false });
          break;
        case 'applications_count':
          query = query.order('applications_count', { ascending: true, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('jobs-feed-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          console.log('🔄 Job updated:', payload);
          setRefreshKey(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_engagement',
        },
        (payload) => {
          const newRecord = payload.new as any;
          if (newRecord?.content_type === 'job') {
            console.log('🔄 Job engagement updated:', payload);
            setRefreshKey(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sort jobs - featured first, then by criteria
  const sortedJobs = React.useMemo(() => {
    return [...jobs].sort((a, b) => {
      // Featured jobs first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      // Then apply selected sorting
      switch (sortBy) {
        case 'salary_max':
          return (b.salary_max || 0) - (a.salary_max || 0);
        case 'views_count':
          return (b.views_count || 0) - (a.views_count || 0);
        case 'applications_count':
          return (a.applications_count || 0) - (b.applications_count || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [jobs, sortBy]);

  const featuredJobs = sortedJobs.filter(job => job.is_featured);
  const regularJobs = sortedJobs.filter(job => !job.is_featured);

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load jobs. Please try again.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Latest Jobs</h2>
          <Badge variant="secondary">
            {sortedJobs.length} jobs
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && sortedJobs.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-lg font-semibold">Featured Jobs</h3>
            <Badge className="bg-yellow-100 text-yellow-800">
              {featuredJobs.length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {featuredJobs.map((job) => (
              <ModernJobCard
                key={job.id}
                job={{
                  ...job,
                  company: job.companies ? {
                    id: job.companies.id,
                    name: job.companies.name || job.company_name,
                    logo_url: job.companies.logo_url,
                    industry: job.companies.industry,
                  } : {
                    id: '',
                    name: job.company_name || 'Unknown Company',
                  }
                }}
                variant="featured"
                isSaved={isJobSaved(job.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Jobs */}
      {regularJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">All Jobs</h3>
            <Badge variant="outline">
              {regularJobs.length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {regularJobs.map((job) => (
              <ModernJobCard
                key={job.id}
                job={{
                  ...job,
                  company: job.companies ? {
                    id: job.companies.id,
                    name: job.companies.name || job.company_name,
                    logo_url: job.companies.logo_url,
                    industry: job.companies.industry,
                  } : {
                    id: '',
                    name: job.company_name || 'Unknown Company',
                  }
                }}
                variant="regular"
                isSaved={isJobSaved(job.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search criteria
          </p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Jobs
          </Button>
        </div>
      )}
    </div>
  );
};