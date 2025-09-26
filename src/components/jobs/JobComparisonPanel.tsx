import React, { useState } from 'react';
import { X, ArrowRight, Building, MapPin, Clock, DollarSign, Users, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  experience_level: string;
  skills_required?: string[];
  is_remote: boolean;
  posted_at: string;
  companies?: {
    name: string;
    logo_url?: string;
    industry?: string;
    is_verified?: boolean;
  };
}

interface JobComparisonPanelProps {
  jobs: Job[];
  onRemoveJob: (jobId: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const JobComparisonPanel: React.FC<JobComparisonPanelProps> = ({
  jobs,
  onRemoveJob,
  onClearAll,
  isOpen,
  onClose
}) => {
  if (!isOpen || jobs.length === 0) return null;

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${min/100000}L - ₹${max/100000}L`;
    if (min) return `₹${min/100000}L+`;
    return `Up to ₹${max/100000}L`;
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <Card className="w-full max-w-6xl mx-4 mb-4 max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Job Comparison ({jobs.length}/3)
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="relative border rounded-lg p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => onRemoveJob(job.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="space-y-4">
                  {/* Company & Title */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {job.companies?.logo_url && (
                        <img 
                          src={job.companies.logo_url} 
                          alt={job.companies.name || job.company_name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-sm">
                          {job.companies?.name || job.company_name}
                        </h3>
                        {job.companies?.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium text-primary">{job.title}</h4>
                  </div>

                  <Separator />

                  {/* Key Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.location}</span>
                      {job.is_remote && (
                        <Badge variant="outline" className="text-xs">Remote</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{job.experience_level} • {job.employment_type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Posted {getTimeSince(job.posted_at)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Skills */}
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Required Skills</h5>
                      <div className="flex flex-wrap gap-1">
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
                  )}

                  {/* Company Industry */}
                  {job.companies?.industry && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Industry</h5>
                      <p className="text-sm text-muted-foreground">{job.companies.industry}</p>
                    </div>
                  )}

                  <Button className="w-full" size="sm">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {jobs.length < 3 && (
            <div className="mt-6 p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">You can compare up to 3 jobs at once</p>
              <p className="text-xs">Click the compare button on any job card to add it here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};