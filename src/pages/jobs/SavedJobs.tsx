
import React, { useState } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Search, Filter, Trash2, Eye, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function SavedJobs() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('saved_at');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // Fetch saved jobs
  const { data: savedJobs = [], isLoading } = useQuery({
    queryKey: ['saved-jobs', searchTerm, sortBy],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('saved_jobs')
        .select(`
          *,
          jobs!inner (
            *,
            companies (
              id,
              name,
              logo_url,
              industry
            ),
            job_categories (
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id);

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `jobs.title.ilike.%${searchTerm}%,jobs.companies.name.ilike.%${searchTerm}%`,
          { foreignTable: 'jobs' }
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'saved_at':
          query = query.order('saved_at', { ascending: false });
          break;
        case 'job_posted':
          query = query.order('posted_at', { foreignTable: 'jobs', ascending: false });
          break;
        case 'salary':
          query = query.order('salary_max', { foreignTable: 'jobs', ascending: false });
          break;
        case 'company':
          query = query.order('name', { foreignTable: 'jobs.companies', ascending: true });
          break;
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

  // Remove saved job mutation
  const removeSavedJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      toast.success('Job removed from saved');
    },
    onError: (error) => {
      toast.error('Failed to remove job');
      console.error('Remove saved job error:', error);
    }
  });

  // Bulk remove mutation
  const bulkRemoveMutation = useMutation({
    mutationFn: async (jobIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .in('job_id', jobIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      setSelectedJobs([]);
      toast.success('Selected jobs removed from saved');
    },
    onError: (error) => {
      toast.error('Failed to remove jobs');
      console.error('Bulk remove error:', error);
    }
  });

  const handleRemoveJob = (jobId: string) => {
    removeSavedJobMutation.mutate(jobId);
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === savedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(savedJobs.map(item => item.jobs.id));
    }
  };

  const handleBulkRemove = () => {
    if (selectedJobs.length === 0) return;
    bulkRemoveMutation.mutate(selectedJobs);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Heart className="h-8 w-8 mr-3 text-red-500" />
                Saved Jobs
              </h1>
              <p className="text-gray-600 mt-2">
                {savedJobs.length} jobs saved for later
              </p>
            </div>
            {selectedJobs.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkRemove}
                disabled={bulkRemoveMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Selected ({selectedJobs.length})
              </Button>
            )}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search saved jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved_at">Recently Saved</SelectItem>
                <SelectItem value="job_posted">Job Posted Date</SelectItem>
                <SelectItem value="salary">Highest Salary</SelectItem>
                <SelectItem value="company">Company Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {savedJobs.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg border">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === savedJobs.length && savedJobs.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm">Select all</span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedJobs.length} of {savedJobs.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {savedJobs.length > 0 ? (
          <div className="space-y-4">
            {savedJobs.map((savedJob) => (
              <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4 p-6">
                    <label className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(savedJob.jobs.id)}
                        onChange={() => handleSelectJob(savedJob.jobs.id)}
                        className="rounded"
                      />
                    </label>
                    
                    <div className="flex-1">
                      <JobCard
                        job={savedJob.jobs}
                        onSave={handleRemoveJob}
                        isSaved={true}
                        showCompany={true}
                      />
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Saved {formatDistanceToNow(new Date(savedJob.saved_at))} ago
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveJob(savedJob.jobs.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
              <p className="text-gray-500 mb-6">
                Start exploring jobs and save the ones you're interested in.
              </p>
              <Button onClick={() => window.location.href = '/jobs'}>
                <Search className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
