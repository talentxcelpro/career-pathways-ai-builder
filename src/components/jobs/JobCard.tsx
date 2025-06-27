
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, DollarSign, Clock, Users, Heart, Eye } from "lucide-react";
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
    navigate(`/jobs/${job.id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(job.id);
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
        job.is_featured ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {job.is_featured && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  Featured
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="text-xs">
                  Remote
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg hover:text-blue-600 transition-colors">
              {job.title}
            </CardTitle>
            {showCompany && job.company && (
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={job.company.logo_url} alt={job.company.name} />
                  <AvatarFallback className="text-xs">
                    {job.company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{job.company.name}</p>
                  {job.company.industry && (
                    <p className="text-xs text-gray-500">{job.company.industry}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className={`ml-2 ${isSaved ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            {(job.salary_min || job.salary_max) && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
              </div>
            )}
          </div>
          
          {(job.employment_type || job.experience_level) && (
            <div className="flex items-center gap-2 text-sm">
              {job.employment_type && (
                <Badge variant="outline" className="text-xs">
                  {job.employment_type}
                </Badge>
              )}
              {job.experience_level && (
                <Badge variant="outline" className="text-xs">
                  {job.experience_level}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills_required.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {job.views_count !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{job.views_count} views</span>
              </div>
            )}
            {job.applications_count !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.applications_count} applicants</span>
              </div>
            )}
          </div>
          {job.posted_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(job.posted_at))} ago</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
