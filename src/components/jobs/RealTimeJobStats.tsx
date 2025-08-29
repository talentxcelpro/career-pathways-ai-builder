import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  MapPin, 
  Building, 
  IndianRupee,
  Users,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface JobStats {
  total_jobs: number;
  jobs_today: number;
  trending_locations: Array<{
    location: string;
    job_count: number;
    growth_rate: number;
  }>;
  job_categories: Array<{
    category: string;
    job_count: number;
    avg_salary: number;
  }>;
  featured_jobs_count: number;
  remote_jobs_count: number;
}

export const RealTimeJobStats: React.FC = () => {
  const [liveStats, setLiveStats] = useState<JobStats | null>(null);

  // Fetch real-time job statistics
  const { data: jobStats, isLoading } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async (): Promise<JobStats> => {
      // Get total active jobs
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open');

      // Get jobs posted today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: jobsToday } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', today.toISOString());

      // Get featured jobs count
      const { count: featuredJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_featured', true);

      // Get remote jobs count
      const { count: remoteJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_remote', true);

      // Get trending locations using the database function
      const { data: trendingLocations } = await supabase
        .rpc('get_trending_job_locations');

      // Get job categories using the database function
      const { data: jobCategories } = await supabase
        .rpc('get_job_categories_with_counts');

      return {
        total_jobs: totalJobs || 0,
        jobs_today: jobsToday || 0,
        trending_locations: trendingLocations || [],
        job_categories: jobCategories || [],
        featured_jobs_count: featuredJobs || 0,
        remote_jobs_count: remoteJobs || 0
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('job-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          // Invalidate and refetch stats when jobs change
          setLiveStats(null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update live stats when data changes
  useEffect(() => {
    if (jobStats) {
      setLiveStats(jobStats);
    }
  }, [jobStats]);

  const stats = liveStats || jobStats;

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total_jobs.toLocaleString()}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Posted Today</p>
                <p className="text-2xl font-bold text-green-900">
                  +{stats.jobs_today}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Remote Jobs</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.remote_jobs_count.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.featured_jobs_count}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Locations & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trending Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.trending_locations.slice(0, 5).map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{location.location}</span>
                    {location.growth_rate > 0 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        +{location.growth_rate.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {location.job_count} jobs
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.job_categories.slice(0, 5).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{category.job_count} jobs</div>
                    {category.avg_salary > 0 && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {(category.avg_salary / 100000).toFixed(1)}L avg
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Updates Indicator */}
      <div className="flex items-center justify-center">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Live Data • Updated every minute
        </Badge>
      </div>
    </div>
  );
};