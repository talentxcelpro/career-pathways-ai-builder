import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  IndianRupee, 
  Clock, 
  Eye, 
  Users, 
  Heart,
  ExternalLink,
  Building2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { useNavigate } from "react-router-dom";

interface CompactJobCardProps {
  job: {
    id: string;
    title: string;
    description?: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    experience_level?: string;
    skills_required?: string[];
    posted_at: string;
    views_count?: number;
    applications_count?: number;
    company_name?: string;
    external_url?: string;
    companies?: {
      id: string;
      name: string;
      logo_url?: string;
      industry?: string;
      is_verified?: boolean;
    } | null;
    is_featured?: boolean;
    is_remote?: boolean;
  };
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
}

export const CompactJobCard: React.FC<CompactJobCardProps> = ({ 
  job, 
  onSave, 
  onApply,
  isSaved = false 
}) => {
  const navigate = useNavigate();

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(job.id);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (job.external_url) {
      window.open(job.external_url, '_blank');
    } else {
      navigate(`/jobs/${job.id}/apply`);
    }
    
    onApply?.(job.id);
  };

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const getCompanyName = () => {
    return job.companies?.name || job.company_name || 'Company';
  };

  const getCompanyLogo = () => {
    if (job.companies?.logo_url) return job.companies.logo_url;
    
    // Generate logo from company name
    const companyName = getCompanyName();
    const initials = companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=6366f1&color=ffffff&size=64&font-size=0.33`;
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border/50 bg-card"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={getCompanyLogo()} alt={getCompanyName()} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getCompanyName().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {job.is_featured && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Featured
                    </Badge>
                  )}
                  {job.is_remote && (
                    <Badge variant="outline" className="text-xs">
                      Remote
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-base text-foreground truncate">
                  {job.title}
                </h3>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{getCompanyName()}</span>
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
                className={`shrink-0 h-8 w-8 p-0 ${isSaved ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Job Details Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{job.location}</span>
              </div>
              
              {((job.salary_min || job.salary_max) || (job as any).salary_range) && (
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  <span className="truncate font-medium text-primary">
                    {formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}
                  </span>
                </div>
              )}

              {job.employment_type && (
                <Badge variant="outline" className="text-xs">
                  {job.employment_type}
                </Badge>
              )}
            </div>

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex flex-wrap gap-1">
                  {job.skills_required.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-muted/50">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills_required.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      +{job.skills_required.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {job.views_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{job.views_count}</span>
                  </div>
                )}
                {job.applications_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{job.applications_count}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(job.posted_at))} ago</span>
                </div>
              </div>

              <Button 
                onClick={handleApply}
                size="sm" 
                className="text-xs h-7"
              >
                {job.external_url ? (
                  <>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Apply
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};