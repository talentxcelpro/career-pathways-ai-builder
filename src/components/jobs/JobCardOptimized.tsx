import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, IndianRupee, Clock, Users, Heart, Eye, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";

interface OptimizedJobCardProps {
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
    skills_required?: string[];
    is_remote?: boolean;
    is_featured?: boolean;
    views_count?: number;
    applications_count?: number;
    posted_at?: string;
    created_at?: string;
    external_url?: string;
    seo_slug?: string;
    company?: {
      id: string;
      name: string;
      logo_url?: string;
      industry?: string;
      is_verified?: boolean;
    };
  };
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
  showCompany?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export const JobCardOptimized = memo<OptimizedJobCardProps>(({ 
  job, 
  onSave, 
  isSaved = false, 
  showCompany = true,
  priority = 'normal'
}) => {
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    const url = job.seo_slug ? `/jobs/${job.seo_slug}` : `/jobs/${job.id}`;
    navigate(url);
  }, [navigate, job.id, job.seo_slug]);

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(job.id);
  }, [onSave, job.id]);

  // Memoized values for expensive calculations
  const formattedSalary = React.useMemo(() => {
    return formatSalaryRange(job.salary_min, job.salary_max, true, job.salary_range);
  }, [job.salary_min, job.salary_max, job.salary_range]);

  const timeAgo = React.useMemo(() => {
    const date = job.posted_at || job.created_at;
    return date ? formatDistanceToNow(new Date(date)) : null;
  }, [job.posted_at, job.created_at]);

  const truncatedDescription = React.useMemo(() => {
    return job.description?.length > 120 
      ? job.description.substring(0, 120) + '...'
      : job.description;
  }, [job.description]);

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${
        job.is_featured 
          ? 'border-l-yellow-500 bg-gradient-to-r from-yellow-50/30 to-transparent' 
          : 'border-l-transparent hover:border-l-primary/30'
      } ${priority === 'high' ? 'ring-1 ring-primary/20' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {job.is_featured && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                  Remote
                </Badge>
              )}
              {job.employment_type && (
                <Badge variant="outline" className="text-xs">
                  {job.employment_type}
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2 mb-2">
              {job.title}
            </CardTitle>
            
            {showCompany && job.company && (
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-8 w-8 ring-1 ring-gray-200">
                  <AvatarImage 
                    src={job.company.logo_url} 
                    alt={job.company.name}
                    loading={priority === 'high' ? 'eager' : 'lazy'}
                  />
                  <AvatarFallback className="text-xs bg-gray-50">
                    {job.company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {job.company.name}
                    </p>
                    {job.company.is_verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  {job.company.industry && (
                    <p className="text-xs text-gray-500 truncate">{job.company.industry}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className={`ml-2 shrink-0 ${
              isSaved 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {truncatedDescription}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{job.location}</span>
            </div>
            {formattedSalary && (
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                <span className="truncate">{formattedSalary}</span>
              </div>
            )}
          </div>
          
          {job.experience_level && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            </div>
          )}
        </div>
        
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 4 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{job.skills_required.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {job.views_count !== undefined && job.views_count > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{job.views_count}</span>
              </div>
            )}
            {job.applications_count !== undefined && job.applications_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.applications_count}</span>
              </div>
            )}
          </div>
          {timeAgo && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeAgo} ago</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

JobCardOptimized.displayName = 'JobCardOptimized';