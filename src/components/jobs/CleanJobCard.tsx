import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Briefcase,
  IndianRupee,
  Clock,
  Eye,
  Users,
  Heart,
  Share2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CleanJobCardProps {
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
    posted_at: string;
    views_count?: number;
    applications_count?: number;
    company_name?: string;
    companies?: {
      id: string;
      name: string;
      logo_url?: string;
      industry?: string;
    } | null;
  };
  onSave?: (jobId: string) => void;
  onShare?: (job: any) => void;
  isSaved?: boolean;
}

export const CleanJobCard: React.FC<CleanJobCardProps> = ({ 
  job, 
  onSave, 
  onShare, 
  isSaved = false 
}) => {
  const navigate = useNavigate();

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(job.id);
    } else {
      toast.success('Job saved to your list!');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(job);
    } else {
      const url = `${window.location.origin}/jobs/${job.id}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: job.title,
            text: `Check out this job at ${getCompanyName()}: ${job.title}`,
            url,
          });
        } catch (error) {
          navigator.clipboard.writeText(url);
          toast.success('Job link copied to clipboard!');
        }
      } else {
        navigator.clipboard.writeText(url);
        toast.success('Job link copied to clipboard!');
      }
    }
  };

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const getCompanyName = () => {
    return job.companies?.name || job.company_name || 'Company';
  };

  const formatExperience = () => {
    if (!job.experience_level) return null;
    
    // Convert experience levels to readable format
    const experienceMap: { [key: string]: string } = {
      'intern': '0-1 Years',
      'fresher': '0-2 Years', 
      'junior': '1-3 Years',
      'mid-level': '3-7 Years',
      'senior-level': '5-10 Years',
      'lead': '7-12 Years',
      'manager': '8-15 Years',
      'senior-manager': '10+ Years',
      'director': '12+ Years',
      'vp': '15+ Years',
      'svp': '18+ Years',
      'cxo': '20+ Years',
      'executive': '15+ Years'
    };

    return experienceMap[job.experience_level] || job.experience_level;
  };

  const formatEmploymentType = () => {
    if (!job.employment_type) return null;
    
    const typeMap: { [key: string]: string } = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'freelance': 'Freelance',
      'internship': 'Internship'
    };

    return typeMap[job.employment_type] || job.employment_type;
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border/50 rounded-xl bg-card"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header with company logo and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={job.companies?.logo_url} alt={getCompanyName()} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {getCompanyName().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">
                🔹 {job.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>🏢 Company:</span>
                <span className="font-medium">{getCompanyName()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSave}
              className={`h-8 w-8 p-0 ${isSaved ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Job details in clean format */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>📍 Location:</span>
              <span className="font-medium text-foreground">{job.location}</span>
            </div>
            
            {formatExperience() && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>📅 Experience:</span>
                <span className="font-medium text-foreground">{formatExperience()}</span>
              </div>
            )}
            
            {formatEmploymentType() && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>💼 Type:</span>
                <span className="font-medium text-foreground">{formatEmploymentType()}</span>
              </div>
            )}
          </div>

          {/* Salary information */}
          {((job.salary_min || job.salary_max) || (job as any).salary_range) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span>💰 Salary:</span>
              <span className="font-medium text-primary">
                {formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}
              </span>
            </div>
          )}

          {/* Description */}
          <div className="text-sm text-muted-foreground">
            <span>📝 Description:</span>
            <p className="mt-1 text-foreground line-clamp-2">
              {job.description || `${getCompanyName()} is looking for a ${job.title} to join their team...`}
            </p>
          </div>

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <span>✅ Skills:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.slice(0, 6).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-xs bg-secondary/50 text-secondary-foreground"
                  >
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills_required.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with stats and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{job.views_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job.applications_count || 0} applicant{(job.applications_count || 0) !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              View Details
            </Button>
            <Button size="sm" className="text-xs">
              Apply Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};