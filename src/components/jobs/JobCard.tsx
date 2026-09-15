import React, { memo } from 'react';
import { MapPin, Clock, Heart, Eye, Users, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    posted_at: string;
    is_featured?: boolean;
    employment_type: string;
    is_remote?: boolean;
    skills_required?: string[];
    views_count?: number;
    applications_count?: number;
    external_url?: string;
    seo_slug?: string;
    companies?: {
      name: string;
      logo_url?: string;
      is_verified?: boolean;
    };
  };
  variant?: 'default' | 'compact';
  isLoading?: boolean;
  isSaved?: boolean;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  className?: string;
}

const JobCard: React.FC<JobCardProps> = memo(({
  job,
  variant = 'default',
  isLoading = false,
  isSaved = false,
  onSave,
  onApply,
  className,
}) => {
  const handleApply = () => {
    if (job.external_url) {
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = `/jobs/${job.seo_slug || job.id}/apply`;
    }
    onApply?.(job.id);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${(min / 100000).toFixed(1)}-${(max / 100000).toFixed(1)}L`;
    return min ? `₹${(min / 100000).toFixed(1)}L+` : `Up to ₹${(max! / 100000).toFixed(1)}L`;
  };

  const formatTimeAgo = (dateString: string) => {
    const hours = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', variant === 'compact' ? 'p-4' : '', className)}>
        <CardHeader className={cn(variant === 'compact' ? 'p-0 mb-3' : '')}>
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </CardHeader>
        <CardContent className={cn(variant === 'compact' ? 'p-0' : '')}>
          <div className="h-3 bg-slate-100 rounded w-full mb-2" />
          <div className="h-3 bg-slate-100 rounded w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 group overflow-hidden relative p-4",
        job.is_featured && "ring-1 ring-blue-500/20",
        className
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate text-sm">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span className="truncate">{job.companies?.name || job.company_name}</span>
              {job.companies?.is_verified && <Shield className="h-3 w-3 text-blue-500" />}
            </div>
          </div>
          <button
            onClick={() => onSave?.(job.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[100px]">{job.location}</span>
          </div>
          <div className="text-emerald-600">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-white border-slate-100 hover:shadow-xl transition-all duration-300 group overflow-hidden relative",
      job.is_featured && "ring-2 ring-blue-500/20",
      className
    )}>
      {job.is_featured && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl z-20">
          Featured
        </div>
      )}
      
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              {job.is_remote && (
                <Badge variant="outline" className="rounded-lg border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Remote
                </Badge>
              )}
              <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                {job.employment_type}
              </Badge>
            </div>
            
            <h3 className="font-black text-xl leading-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {job.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mt-2">
              <span className="truncate">{job.companies?.name || job.company_name}</span>
              {job.companies?.is_verified && (
                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none px-1.5 py-0">
                  <Shield className="h-3 w-3 fill-current" />
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => onSave?.(job.id)}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-2xl transition-all duration-200",
                isSaved 
                  ? "bg-red-50 text-red-500" 
                  : "bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
            <button
              onClick={() => window.open(`https://gemini.google.com/app?prompt=Analyze my fit for this job: ${job.title} at ${job.company_name}. Location: ${job.location}. Skills required: ${job.skills_required?.join(', ')}.`)}
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white transition-all duration-200"
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimeAgo(job.posted_at)}</span>
            </div>
          </div>
          <div className="text-lg font-black text-blue-600">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
        </div>

        {job.skills_required && job.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.skills_required.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 border-slate-200 uppercase px-2.5 py-1">
                {skill}
              </Badge>
            ))}
            {job.skills_required.length > 3 && (
              <Badge variant="secondary" className="rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-500 px-2.5 py-1">
                +{job.skills_required.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
          
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Now</span>
          </div>
        </div>

        <Button 
          onClick={handleApply}
          className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all duration-200"
          disabled={!job.id}
        >
          {job.external_url ? (
            <><ExternalLink className="h-4 w-4 mr-2" /> Apply on Partner Site</>
          ) : 'Execute Application'}
        </Button>
      </CardContent>
    </Card>
  );
});

JobCard.displayName = 'JobCard';
export { JobCard };
