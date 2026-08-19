/**
 * Optimized Job Card Component with performance enhancements
 */

import React, { memo, useCallback } from 'react';
import { MapPin, Clock, Coins, Heart, Eye, Users, Star, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface OptimizedJobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    posted_at: string;
    is_featured: boolean;
    employment_type: string;
    is_remote?: boolean;
    skills_required?: string[];
    views_count?: number;
    applications_count?: number;
    external_url?: string;
    companies?: {
      name: string;
      logo_url?: string;
      is_verified?: boolean;
    };
  };
  isLoading?: boolean;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
}

const OptimizedJobCard: React.FC<OptimizedJobCardProps> = memo(({
  job,
  isLoading = false,
  onSave,
  onApply,
  isSaved = false
}) => {
  const handleSave = useCallback(() => {
    onSave?.(job.id);
  }, [onSave, job.id]);

  const handleApply = useCallback(() => {
    if (job.external_url) {
      console.log('🔗 External job detected, redirecting to:', job.external_url);
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
    } else {
      // Navigate to internal apply page
      window.location.href = `/jobs/${(job as any).seo_slug || job.id}/apply`;
    }
    onApply?.(job.id);
  }, [onApply, job.id, job.external_url, (job as any).seo_slug]);

  const formatSalary = useCallback((min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) {
      return `₹${(min / 100000).toFixed(1)}-${(max / 100000).toFixed(1)}L`;
    }
    return min ? `₹${(min / 100000).toFixed(1)}L+` : `Up to ₹${(max! / 100000).toFixed(1)}L`;
  }, []);

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }, []);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all hover:shadow-lg ${job.is_featured ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {job.is_featured && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="text-xs">
                  Remote
                </Badge>
              )}
            </div>
            
            <h3 
              onClick={() => {
                window.location.href = `/jobs/${(job as any).seo_slug || job.id}`;
              }}
              className="font-semibold text-lg leading-tight truncate hover:text-blue-600 transition-colors cursor-pointer"
            >
              {job.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span className="truncate">
                {job.companies?.name || job.company_name}
              </span>
              {job.companies?.is_verified && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`ml-2 ${isSaved ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(job.posted_at)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-semibold text-primary">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <Badge variant="outline" className="text-xs">
            {job.employment_type}
          </Badge>
        </div>

        {job.skills_required && job.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills_required.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills_required.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills_required.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {job.views_count && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{job.views_count}</span>
              </div>
            )}
            {job.applications_count && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.applications_count} applied</span>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleApply}
          className="w-full"
          size="sm"
          disabled={!job.id}
        >
          {job.external_url ? (
            <>
              <ExternalLink className="h-4 w-4 mr-1" />
              Apply on Site
            </>
          ) : (
            'Apply Now'
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

OptimizedJobCard.displayName = 'OptimizedJobCard';

export { OptimizedJobCard };