
import React from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { ModernJobCard } from '@/components/jobs/ModernJobCard';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Sparkles } from "lucide-react";

interface JobsListProps {
  jobs: any[];
  featuredJobs: any[];
  regularJobs: any[];
  savedJobs: string[];
  sortBy: string;
  setSortBy: (value: string) => void;
  isLoading: boolean;
  onSaveJob: (jobId: string) => void;
  onClearFilters: () => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  jobs,
  featuredJobs,
  regularJobs,
  savedJobs,
  sortBy,
  setSortBy,
  isLoading,
  onSaveJob,
  onClearFilters
}) => {
  return (
    <div className="lg:col-span-3">
      {/* Sort and Results */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {isLoading ? 'Loading...' : `${jobs.length} jobs found`}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="posted_at">Newest First</SelectItem>
            <SelectItem value="salary_max">Highest Salary</SelectItem>
            <SelectItem value="views_count">Most Viewed</SelectItem>
            <SelectItem value="applications_count">Least Competition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Jobs Priority Section */}
      {featuredJobs.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-primary">
              <Sparkles className="h-6 w-6 mr-3 text-yellow-500" />
              🏆 Featured Jobs (Top Priority)
            </h2>
            <div className="space-y-4">
              {featuredJobs.map((job) => (
                <ModernJobCard
                  key={job.id}
                  job={job}
                  onSave={onSaveJob}
                  isSaved={savedJobs.includes(job.id)}
                  variant="featured"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Jobs List */}
      {regularJobs.length > 0 && (
        <div>
          {featuredJobs.length > 0 && (
            <h2 className="text-2xl font-bold mb-6 text-foreground">🗂 All Jobs List</h2>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {regularJobs.map((job) => (
              <ModernJobCard
                key={job.id}
                job={job}
                onSave={onSaveJob}
                isSaved={savedJobs.includes(job.id)}
                variant="regular"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or removing some filters.
          </p>
          <Button onClick={onClearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg border p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
