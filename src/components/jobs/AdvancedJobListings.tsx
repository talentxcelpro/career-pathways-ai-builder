import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PremiumJobCard } from './PremiumJobCard';
import { ModernJobCard } from './ModernJobCard';
import { SocialPagination } from '@/components/ui/social-pagination';
import { useJobsWithPagination } from '@/hooks/useJobsWithPagination';
import { 
  Filter, SortAsc, SortDesc, Grid, List, 
  Zap, Star, Clock, TrendingUp, Brain,
  MapPin, DollarSign, Users, Building2,
  ChevronDown, RefreshCw, Bookmark, Share2
} from "lucide-react";

interface AdvancedJobListingsProps {
  filters: {
    search: string;
    location: string;
    employment_type: string[];
    experience_level: string[];
    salary_min: number;
    salary_max: number;
    is_remote: boolean;
    skills: string[];
  };
  onClearFilters: () => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'created_at' | 'salary' | 'company' | 'title';

export const AdvancedJobListings: React.FC<AdvancedJobListingsProps> = ({
  filters,
  onClearFilters
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const { 
    jobs, 
    featuredJobs, 
    regularJobs, 
    totalCount, 
    hasMore, 
    isLoading, 
    loadMore, 
    refetch,
    currentPage,
    totalPages,
    goToPage
  } = useJobsWithPagination(filters, sortBy);

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleShareJob = (jobId: string) => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: `Job Opportunity`,
        url: `${window.location.origin}/jobs/${jobId}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`);
    }
  };

  const handleApplyJob = (jobId: string) => {
    // Apply functionality
    console.log('Applying to job:', jobId);
  };

  const refreshJobs = () => {
    refetch();
  };

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Job Opportunities
          </h2>
          <p className="text-muted-foreground">
            Find your perfect match from <span className="font-semibold text-primary">{totalCount}</span> active positions
            {jobs.length > 0 && jobs.length < totalCount && (
              <span className="text-xs ml-1">(showing {jobs.length})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshJobs}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Latest First
                </div>
              </SelectItem>
              <SelectItem value="salary">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Highest Salary
                </div>
              </SelectItem>
              <SelectItem value="company">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company A-Z
                </div>
              </SelectItem>
              <SelectItem value="title">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Job Title A-Z
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Quick filters:</span>
        <Button
          variant={showPremiumOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPremiumOnly(!showPremiumOnly)}
        >
          <Star className="mr-2 h-4 w-4" />
          Premium Only
        </Button>
        <Button variant="outline" size="sm">
          <Zap className="mr-2 h-4 w-4" />
          Quick Apply
        </Button>
        <Button variant="outline" size="sm">
          <MapPin className="mr-2 h-4 w-4" />
          Remote
        </Button>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Posted Today
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-2xl font-bold">No jobs found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your filters or search terms to find more opportunities.
            </p>
            <Button onClick={onClearFilters} className="mt-4">
              Clear all filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Featured Jobs Section */}
          {featuredJobs.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <h3 className="text-2xl font-bold">🏆 Featured Jobs (Top Priority)</h3>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  Premium Opportunities
                </Badge>
              </div>
              
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 xl:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {featuredJobs.map((job) => (
                  <ModernJobCard
                    key={job.id}
                    job={job}
                    onSave={handleSaveJob}
                    isSaved={savedJobs.includes(job.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Jobs Section */}
          {regularJobs.length > 0 && (
            <div className="space-y-6">
              {featuredJobs.length > 0 && <Separator />}
              
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">🗂 All Jobs List</h3>
                <Badge variant="outline">
                  {regularJobs.length} opportunities
                </Badge>
              </div>
              
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {regularJobs.map((job) => (
                  <ModernJobCard
                    key={job.id}
                    job={job}
                    onSave={handleSaveJob}
                    isSaved={savedJobs.includes(job.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <SocialPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};