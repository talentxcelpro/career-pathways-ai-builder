import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Bookmark, Search, MapPin, Building, ExternalLink, Trash2 } from "lucide-react";
import { useJobInteractions } from "@/hooks/useJobInteractions";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from "date-fns";
import { formatSalaryRange } from "@/utils/currencyUtils";

interface SavedJob {
  id: string;
  job_id: string;
  interaction_type: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    salary_range?: string;
    employment_type?: string;
    experience_level?: string;
    company_name?: string;
    external_url?: string;
    seo_slug?: string;
    is_remote?: boolean;
    is_featured?: boolean;
    posted_at?: string;
    companies?: {
      name: string;
      logo_url?: string;
      industry?: string;
    };
  };
}

export function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_interactions')
        .select(`
          id,
          job_id,
          interaction_type,
          created_at,
          jobs!inner (
            id,
            title,
            description,
            location,
            salary_min,
            salary_max,
            salary_range,
            employment_type,
            experience_level,
            company_name,
            external_url,
            seo_slug,
            is_remote,
            is_featured,
            posted_at,
            companies (
              name,
              logo_url,
              industry
            )
          )
        `)
        .eq('user_id', user.id)
        .in('interaction_type', ['like', 'save'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => {
        const jobData = Array.isArray(item.jobs) ? item.jobs[0] : item.jobs;
        const companiesData = jobData?.companies;
        
        return {
          ...item,
          job: {
            ...jobData,
            companies: Array.isArray(companiesData) ? companiesData[0] : companiesData
          }
        };
      }) || [];
      
      setSavedJobs(formattedData as SavedJob[]);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load saved jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedJob = async (interactionId: string) => {
    try {
      const { error } = await supabase
        .from('job_interactions')
        .delete()
        .eq('id', interactionId);

      if (error) throw error;

      setSavedJobs(prev => prev.filter(job => job.id !== interactionId));
      toast({
        title: "Removed",
        description: "Job removed from saved list",
      });
    } catch (error) {
      console.error('Error removing saved job:', error);
      toast({
        title: "Error",
        description: "Failed to remove job",
        variant: "destructive",
      });
    }
  };

  const likedJobs = savedJobs.filter(job => job.interaction_type === 'like');
  const bookmarkedJobs = savedJobs.filter(job => job.interaction_type === 'save');

  const filteredLikedJobs = likedJobs.filter(job =>
    job.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookmarkedJobs = bookmarkedJobs.filter(job =>
    job.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const JobCard = ({ savedJob, onRemove }: { savedJob: SavedJob; onRemove: (id: string) => void }) => {
    const job = savedJob.job;
    const companyName = job.companies?.name || job.company_name || 'Company';

    const handleJobClick = () => {
      if (job.external_url) {
        window.open(job.external_url, '_blank', 'noopener,noreferrer');
      } else {
        const jobPath = job.seo_slug || job.id;
        window.open(`/jobs/${jobPath}`, '_blank');
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {job.is_featured && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Featured
                  </Badge>
                )}
                {job.is_remote && (
                  <Badge variant="outline">Remote</Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {savedJob.interaction_type === 'like' ? 'Liked' : 'Saved'}
                </Badge>
              </div>
              <h3 
                className="text-lg font-semibold hover:text-primary cursor-pointer transition-colors"
                onClick={handleJobClick}
              >
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building className="h-4 w-4" />
                <span>{companyName}</span>
                {job.companies?.industry && (
                  <>
                    <span>•</span>
                    <span>{job.companies.industry}</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(savedJob.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            {(job.salary_min || job.salary_max || job.salary_range) && (
              <div className="flex items-center gap-1">
                <span>💰</span>
                <span>{formatSalaryRange(job.salary_min, job.salary_max, true, job.salary_range)}</span>
              </div>
            )}
            {job.employment_type && (
              <Badge variant="outline" className="text-xs">
                {job.employment_type}
              </Badge>
            )}
            {job.experience_level && (
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {savedJob.interaction_type === 'like' ? 'Liked' : 'Saved'} {formatDistanceToNow(new Date(savedJob.created_at))} ago
            </p>
            <Button
              size="sm"
              onClick={handleJobClick}
              className="flex items-center gap-2"
            >
              {job.external_url ? (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Apply Now
                </>
              ) : (
                'View Details'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Jobs</h1>
        <p className="text-muted-foreground">
          Manage your liked and bookmarked job opportunities
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All ({savedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Liked ({filteredLikedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved ({filteredBookmarkedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center gap-2 mb-4">
                <Heart className="h-16 w-16 text-muted-foreground" />
                <Bookmark className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No saved jobs yet</h3>
              <p className="text-muted-foreground">
                Start liking and saving jobs you're interested in to see them here
              </p>
            </div>
          ) : (
            [...filteredLikedJobs, ...filteredBookmarkedJobs].map((savedJob) => (
              <JobCard key={savedJob.id} savedJob={savedJob} onRemove={removeSavedJob} />
            ))
          )}
        </TabsContent>

        <TabsContent value="liked" className="space-y-4 mt-6">
          {filteredLikedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No liked jobs</h3>
              <p className="text-muted-foreground">
                Like jobs you're interested in to see them here
              </p>
            </div>
          ) : (
            filteredLikedJobs.map((savedJob) => (
              <JobCard key={savedJob.id} savedJob={savedJob} onRemove={removeSavedJob} />
            ))
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4 mt-6">
          {filteredBookmarkedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookmarked jobs</h3>
              <p className="text-muted-foreground">
                Bookmark jobs to save them for later
              </p>
            </div>
          ) : (
            filteredBookmarkedJobs.map((savedJob) => (
              <JobCard key={savedJob.id} savedJob={savedJob} onRemove={removeSavedJob} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}