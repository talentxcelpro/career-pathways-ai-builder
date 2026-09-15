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
    <Card className={cn(
      "glass-pro border-white/20 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden relative",
      job.is_featured && "ring-2 ring-primary/20"
    )}>
      {job.is_featured && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-apple-heavy uppercase tracking-widest rounded-bl-xl z-20">
          Featured
        </div>
      )}
      
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              {job.is_remote && (
                <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-apple-bold uppercase tracking-wider px-2 py-0.5">
                  Remote
                </Badge>
              )}
              <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 text-[10px] font-apple-bold uppercase tracking-wider px-2 py-0.5">
                {job.employment_type}
              </Badge>
            </div>
            
            <h3 className="font-apple-heavy text-xl leading-tight tracking-tight text-slate-950 group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm font-apple-medium text-slate-500 mt-2">
              <span className="truncate">
                {job.companies?.name || job.company_name}
              </span>
              {job.companies?.is_verified && (
                <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 border-none px-1.5 py-0">
                  <Shield className="h-3 w-3 fill-current" />
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSave}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-2xl transition-all duration-300",
                isSaved 
                  ? "bg-red-50 text-red-500 shadow-inner" 
                  : "bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
            <button
              onClick={() => window.open(`https://gemini.google.com/app?prompt=Analyze my fit for this job: ${job.title} at ${job.company_name}. Location: ${job.location}. Skills required: ${job.skills_required?.join(', ')}. My TalentScore is available in my profile.`)}
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
              title="Match with AI"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-apple-bold text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-apple-bold text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimeAgo(job.posted_at)}</span>
            </div>
          </div>
          <div className="text-lg font-apple-heavy text-primary tracking-tighter">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
        </div>

        {job.skills_required && job.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills_required.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="rounded-lg bg-slate-50 text-[10px] font-apple-bold text-slate-500 border-slate-100 uppercase tracking-tighter px-2.5 py-1">
                {skill}
              </Badge>
            ))}
            {job.skills_required.length > 3 && (
              <Badge variant="secondary" className="rounded-lg bg-white border border-slate-100 text-[10px] font-apple-heavy text-slate-400 px-2.5 py-1">
                +{job.skills_required.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">
            {job.views_count && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>{job.views_count.toLocaleString()}</span>
              </div>
            )}
            {job.applications_count && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{job.applications_count.toLocaleString()} Applied</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-apple-heavy uppercase tracking-widest text-emerald-600">Active Now</span>
          </div>
        </div>

        <Button 
          onClick={handleApply}
          className="w-full h-12 rounded-2xl bg-slate-950 text-white font-apple-bold hover:bg-slate-800 transition-all duration-300 shadow-xl"
          disabled={!job.id}
        >
          {job.external_url ? (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply on Partner Site
            </>
          ) : (
            'Execute Application'
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

OptimizedJobCard.displayName = 'OptimizedJobCard';

export { OptimizedJobCard };