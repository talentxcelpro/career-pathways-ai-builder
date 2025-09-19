import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Briefcase, DollarSign, Search, Filter } from 'lucide-react';
import { useJobs, Job } from '@/hooks/useJobs';
import { useJobApplication } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface JobFilters {
  search: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  isRemote: boolean;
}

const JobListings: React.FC = () => {
  const { user } = useAuth();
  const { applyToJob, isApplying } = useJobApplication();
  
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    employmentType: '',
    experienceLevel: '',
    isRemote: false,
  });

  const { jobs, isLoading, totalCount } = useJobs({
    search: filters.search || undefined,
    location: filters.location || undefined,
    employment_types: filters.employmentType ? [filters.employmentType] : undefined,
    experience_levels: filters.experienceLevel ? [filters.experienceLevel] : undefined,
    is_remote: filters.isRemote || undefined,
    limit: 20,
  });

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast.error('Please sign in to apply for jobs');
      return;
    }

    try {
      await applyToJob.mutateAsync({
        jobId,
        coverLetter: 'I am interested in this position and would like to apply.',
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleFilterChange = (key: keyof JobFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      return `₹${job.salary_min/100000}-${job.salary_max/100000} LPA`;
    } else if (job.salary_range) {
      return job.salary_range;
    }
    return 'Salary not disclosed';
  };

  const getExperienceLabel = (level: string) => {
    const labels = {
      'entry_level': 'Entry Level',
      'mid_level': 'Mid Level', 
      'senior_level': 'Senior Level',
      'executive': 'Executive'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
        <p className="text-muted-foreground">
          Discover {totalCount} job opportunities from top companies
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
            
            <Select value={filters.employmentType} onValueChange={(value) => handleFilterChange('employmentType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.experienceLevel} onValueChange={(value) => handleFilterChange('experienceLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="entry_level">Entry Level</SelectItem>
                <SelectItem value="mid_level">Mid Level</SelectItem>
                <SelectItem value="senior_level">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant={filters.isRemote ? "default" : "outline"}
              onClick={() => handleFilterChange('isRemote', !filters.isRemote)}
            >
              Remote Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Results */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  search: '',
                  location: '',
                  employmentType: '',
                  experienceLevel: '',
                  isRemote: false,
                })}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      {job.companies?.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                      {job.is_featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-lg font-medium text-primary mb-1">
                      {job.companies?.name || job.company_name}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {getEmploymentTypeLabel(job.employment_type)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getExperienceLabel(job.experience_level)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatSalary(job)}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills_required.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills_required.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills_required.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <Button 
                      onClick={() => handleApply(job.id)}
                      disabled={isApplying}
                      className="mb-2"
                    >
                      {isApplying ? 'Applying...' : 'Apply Now'}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {job.applications_count} applicants
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobListings;