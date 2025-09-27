
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, IndianRupee, Clock, Users, Heart, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    experience_level?: string;
    skills_required?: string[];
    is_remote?: boolean;
    is_featured?: boolean;
    views_count?: number;
    applications_count?: number;
    posted_at?: string;
    company?: {
      id: string;
      name: string;
      logo_url?: string;
      industry?: string;
    };
  };
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
  showCompany?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onSave, 
  isSaved = false, 
  showCompany = true 
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Check if this is an external job
    if ((job as any).external_url) {
      console.log('🔗 External job detected, redirecting to:', (job as any).external_url);
      window.open((job as any).external_url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Internal job - navigate to detail page using seo_slug if available
    const jobPath = (job as any).seo_slug || job.id;
    navigate(`/jobs/${jobPath}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(job.id);
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-apple transition-apple ${
        job.is_featured ? 'ring-1 ring-primary/20 bg-primary/5' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {job.is_featured && (
                <Badge variant="secondary" className="text-apple-small bg-primary/10 text-primary">
                  Featured
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="text-apple-small border-border/50">
                  Remote
                </Badge>
              )}
            </div>
            <CardTitle className="text-apple-body font-apple-semibold hover:text-primary transition-apple leading-tight truncate">
              {job.title}
            </CardTitle>
            {showCompany && job.company && (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={job.company.logo_url} alt={job.company.name} />
                  <AvatarFallback className="text-apple-small bg-muted">
                    {job.company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-apple-caption font-apple-medium text-foreground truncate">{job.company.name}</p>
                  {job.company.industry && (
                    <p className="text-apple-small text-muted-foreground truncate">{job.company.industry}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className={`shrink-0 h-8 w-8 p-0 ${isSaved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Heart className={`icon-apple-xs ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-apple-caption text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 text-apple-caption text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="icon-apple-xs" />
              <span className="truncate">{job.location}</span>
            </div>
            {((job.salary_min || job.salary_max) || (job as any).salary_range) && (
              <div className="flex items-center gap-1">
                <IndianRupee className="icon-apple-xs" />
                <span className="truncate">{formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}</span>
              </div>
            )}
          </div>
          
          {(job.employment_type || job.experience_level) && (
            <div className="flex items-center gap-2">
              {job.employment_type && (
                <Badge variant="outline" className="text-apple-small border-border/50 px-2 py-0.5">
                  {job.employment_type}
                </Badge>
              )}
              {job.experience_level && (
                <Badge variant="outline" className="text-apple-small border-border/50 px-2 py-0.5">
                  {job.experience_level}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-apple-small bg-muted/50 px-2 py-0.5">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 3 && (
                <Badge variant="secondary" className="text-apple-small bg-muted/50 px-2 py-0.5">
                  +{job.skills_required.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-apple-small text-muted-foreground">
          <div className="flex items-center gap-3">
            {job.views_count !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="icon-apple-xs" />
                <span>{job.views_count}</span>
              </div>
            )}
            {job.applications_count !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="icon-apple-xs" />
                <span>{job.applications_count}</span>
              </div>
            )}
          </div>
          {job.posted_at && (
            <div className="flex items-center gap-1">
              <Clock className="icon-apple-xs" />
              <span>{formatDistanceToNow(new Date(job.posted_at))} ago</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
