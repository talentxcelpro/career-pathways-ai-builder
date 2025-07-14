import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PremiumJobCard } from './PremiumJobCard';
import { useJobsManagement } from '@/hooks/useJobsManagement';
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
type SortOption = 'relevance' | 'date' | 'salary' | 'company' | 'match_score';

const SAMPLE_JOBS = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate should have strong expertise in React, Node.js, and cloud technologies. This is a great opportunity to work on cutting-edge projects with a collaborative team.',
    location: 'Bangalore',
    salary_min: 1200000,
    salary_max: 2000000,
    employment_type: 'full-time',
    experience_level: 'senior-level',
    skills_required: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    is_remote: true,
    is_featured: true,
    is_urgent: false,
    views_count: 456,
    applications_count: 23,
    posted_at: '2024-01-10T10:00:00Z',
    deadline: '2024-02-15T23:59:59Z',
    company: {
      id: 'c1',
      name: 'TechCorp Solutions',
      logo_url: null,
      industry: 'Technology',
      rating: 4.5,
      size: '100-500',
      verified: true
    },
    insights: {
      match_score: 95,
      competition_level: 'medium' as const,
      hiring_urgency: 'high' as const,
      success_rate: 85,
      response_rate: 92
    }
  },
  {
    id: '2',
    title: 'Product Manager - AI/ML',
    description: 'Join our AI team as a Product Manager to drive the development of machine learning products. You will work closely with engineering and data science teams to define product requirements and roadmaps. Experience with AI/ML products and agile methodologies is essential.',
    location: 'Mumbai',
    salary_min: 1500000,
    salary_max: 2500000,
    employment_type: 'full-time',
    experience_level: 'mid-level',
    skills_required: ['Product Management', 'AI/ML', 'Agile', 'Data Analysis'],
    is_remote: false,
    is_featured: true,
    is_urgent: true,
    views_count: 789,
    applications_count: 41,
    posted_at: '2024-01-12T14:30:00Z',
    company: {
      id: 'c2',
      name: 'AI Innovations Ltd',
      logo_url: null,
      industry: 'Artificial Intelligence',
      rating: 4.8,
      size: '50-100',
      verified: true
    },
    insights: {
      match_score: 88,
      competition_level: 'high' as const,
      hiring_urgency: 'high' as const,
      success_rate: 72,
      response_rate: 88
    }
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and deployment pipelines. Experience with Kubernetes, Docker, and CI/CD is required.',
    location: 'Hyderabad',
    salary_min: 800000,
    salary_max: 1400000,
    employment_type: 'full-time',
    experience_level: 'mid-level',
    skills_required: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'Jenkins'],
    is_remote: true,
    is_featured: false,
    is_urgent: false,
    views_count: 234,
    applications_count: 12,
    posted_at: '2024-01-14T09:15:00Z',
    company: {
      id: 'c3',
      name: 'CloudTech Systems',
      logo_url: null,
      industry: 'Cloud Computing',
      rating: 4.2,
      size: '200-500',
      verified: true
    },
    insights: {
      match_score: 82,
      competition_level: 'low' as const,
      hiring_urgency: 'medium' as const,
      success_rate: 78,
      response_rate: 85
    }
  }
];

export const AdvancedJobListings: React.FC<AdvancedJobListingsProps> = ({
  filters,
  onClearFilters
}) => {
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  useEffect(() => {
    // Filter jobs based on current filters
    const filteredJobs = SAMPLE_JOBS.filter(job => {
      if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !job.company.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.employment_type.length > 0 && !filters.employment_type.includes(job.employment_type)) {
        return false;
      }
      if (filters.experience_level.length > 0 && !filters.experience_level.includes(job.experience_level)) {
        return false;
      }
      if (filters.is_remote && !job.is_remote) {
        return false;
      }
      return true;
    });

    // Sort jobs
    const sortedJobs = [...filteredJobs].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
        case 'salary':
          return (b.salary_max || 0) - (a.salary_max || 0);
        case 'company':
          return a.company.name.localeCompare(b.company.name);
        case 'match_score':
          return (b.insights?.match_score || 0) - (a.insights?.match_score || 0);
        default: // relevance
          return (b.insights?.match_score || 0) - (a.insights?.match_score || 0);
      }
    });

    setJobs(sortedJobs);
  }, [filters, sortBy]);

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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const featuredJobs = jobs.filter(job => job.is_featured);
  const regularJobs = jobs.filter(job => !job.is_featured);

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Job Opportunities
          </h2>
          <p className="text-muted-foreground">
            Find your perfect match from <span className="font-semibold text-primary">{jobs.length}</span> active positions
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
              <SelectItem value="relevance">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Relevance
                </div>
              </SelectItem>
              <SelectItem value="date">
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
              <SelectItem value="match_score">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Best Match
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
                  <PremiumJobCard
                    key={job.id}
                    job={job}
                    variant="premium"
                    onSave={handleSaveJob}
                    onShare={handleShareJob}
                    onApply={handleApplyJob}
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
                  <PremiumJobCard
                    key={job.id}
                    job={job}
                    variant="standard"
                    onSave={handleSaveJob}
                    onShare={handleShareJob}
                    onApply={handleApplyJob}
                    isSaved={savedJobs.includes(job.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg" className="px-8">
              <RefreshCw className="mr-2 h-4 w-4" />
              Load More Jobs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};