
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Users, 
  Eye,
  Bookmark,
  Share2,
  Star
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience_level?: string;
  skills_required?: string[];
  benefits?: string[];
  is_remote?: boolean;
  is_urgent?: boolean;
  is_hiring_fast?: boolean;
  posted_at: string;
  views_count?: number;
  applications_count?: number;
  companies?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
  } | null;
}

interface EnhancedJobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onShare?: (job: Job) => void;
  isSaved?: boolean;
  matchScore?: number;
  matchingSkills?: string[];
  showMatchScore?: boolean;
  currentUser?: any;
}

export default function EnhancedJobCard({ 
  job, 
  onSave, 
  onShare, 
  isSaved = false, 
  matchScore,
  matchingSkills,
  showMatchScore = false,
  currentUser
}: EnhancedJobCardProps) {
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
            text: `Check out this job at ${job.companies?.name}: ${job.title}`,
            url,
          });
        } catch (error) {
          console.log('Error sharing:', error);
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

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Match Score Badge */}
        {showMatchScore && matchScore && matchScore > 0 && (
          <div className="mb-3">
            <Badge className="bg-green-100 text-green-800">
              <Star className="h-3 w-3 mr-1" />
              {matchScore}% Match
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            {job.companies?.logo_url && (
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={job.companies.logo_url} alt={job.companies.name} />
                <AvatarFallback className="text-sm">
                  {job.companies.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                {job.title}
              </h3>
              {job.companies && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{job.companies.name}</span>
                  {job.companies.industry && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="truncate">{job.companies.industry}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSave}
              className={`h-8 w-8 p-0 ${isSaved ? 'text-blue-600' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
            </div>
            {(job.salary_min || job.salary_max) && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatDistanceToNow(new Date(job.posted_at))} ago</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm line-clamp-2">
            {job.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {job.employment_type && (
              <Badge variant="secondary" className="text-xs">
                {job.employment_type}
              </Badge>
            )}
            {job.experience_level && (
              <Badge variant="outline" className="text-xs">
                {job.experience_level}
              </Badge>
            )}
            {job.is_remote && (
              <Badge className="text-xs bg-green-100 text-green-800">
                Remote
              </Badge>
            )}
            {job.is_urgent && (
              <Badge className="text-xs bg-red-100 text-red-800">
                Urgent
              </Badge>
            )}
            {job.is_hiring_fast && (
              <Badge className="text-xs bg-orange-100 text-orange-800">
                Hiring Fast
              </Badge>
            )}
          </div>

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 5).map((skill, index) => {
                const isMatching = matchingSkills?.includes(skill);
                return (
                  <Badge 
                    key={index} 
                    variant={isMatching ? "default" : "outline"} 
                    className={`text-xs ${isMatching ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {skill}
                  </Badge>
                );
              })}
              {job.skills_required.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills_required.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 pt-4 border-t">
          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            <span>{job.views_count || 0} views</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>{job.applications_count || 0} applied</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
