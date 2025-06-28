
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, DollarSign, Clock, Users, Heart, Eye, Briefcase, Zap, Star, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { incrementJobViews } from "@/utils/supabaseHelpers";

interface EnhancedJobCardProps {
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
    is_urgent?: boolean;
    is_hiring_fast?: boolean;
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
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
  isApplied?: boolean;
  matchScore?: number;
  matchingSkills?: string[];
  showMatchScore?: boolean;
  currentUser?: any;
}

export const EnhancedJobCard: React.FC<EnhancedJobCardProps> = ({ 
  job, 
  onSave, 
  onApply,
  isSaved = false,
  isApplied = false,
  matchScore,
  matchingSkills = [],
  showMatchScore = true,
  currentUser
}) => {
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);

  const handleCardClick = async () => {
    // Track job view
    try {
      await incrementJobViews(job.id);
    } catch (error) {
      console.error('Error tracking job view:', error);
    }
    navigate(`/jobs/${job.id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(job.id);
  };

  const handleApplyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('Please login to apply for jobs');
      navigate('/auth/login');
      return;
    }

    if (isApplied) {
      toast.info('You have already applied to this job');
      return;
    }

    setIsApplying(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          user_id: currentUser.id,
          status: 'applied'
        });

      if (error) throw error;
      
      toast.success('Application submitted successfully!');
      onApply?.(job.id);
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const getEmploymentTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800 border-green-200';
      case 'part-time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contract': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'freelance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'internship': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getExperienceLevelColor = (level?: string) => {
    switch (level) {
      case 'entry-level': return 'bg-green-100 text-green-700';
      case 'mid-level': return 'bg-blue-100 text-blue-700';
      case 'senior-level': return 'bg-purple-100 text-purple-700';
      case 'executive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
            {/* Status badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {job.is_featured && (
                <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {job.is_urgent && (
                <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {job.is_hiring_fast && (
                <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                  <Calendar className="h-3 w-3 mr-1" />
                  Hiring Fast
                </Badge>
              )}
              {job.is_remote && (
                <Badge variant="outline" className="text-xs">
                  Remote
                </Badge>
              )}
            </div>

            <CardTitle className="text-lg hover:text-blue-600 transition-colors mb-2">
              {job.title}
            </CardTitle>

            {/* Company info */}
            {job.company && (
              <div className="flex items-center gap-2 mb-3">
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

            {/* Match score */}
            {showMatchScore && matchScore && currentUser && (
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Match Score:</div>
                  <div className={`text-sm font-bold ${
                    matchScore >= 80 ? 'text-green-600' : 
                    matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {matchScore}%
                  </div>
                </div>
                {matchingSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {matchingSkills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {skill}
                      </Badge>
                    ))}
                    {matchingSkills.length > 3 && (
                      <span className="text-xs text-gray-500">+{matchingSkills.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save button */}
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
        
        {/* Job details */}
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
          
          {/* Employment type and experience level */}
          <div className="flex items-center gap-2 text-sm flex-wrap">
            {job.employment_type && (
              <Badge className={`text-xs ${getEmploymentTypeBadgeColor(job.employment_type)}`}>
                <Briefcase className="h-3 w-3 mr-1" />
                {job.employment_type}
              </Badge>
            )}
            {job.experience_level && (
              <Badge className={`text-xs ${getExperienceLevelColor(job.experience_level)}`}>
                {job.experience_level}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.skills_required.slice(0, 4).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={`text-xs ${
                    matchingSkills.includes(skill) ? 'bg-green-100 text-green-700 border-green-200' : ''
                  }`}
                >
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills_required.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
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
            {job.posted_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(job.posted_at))} ago</span>
              </div>
            )}
          </div>

          {/* Apply button */}
          {currentUser && (
            <Button
              onClick={handleApplyClick}
              disabled={isApplying || isApplied}
              size="sm"
              className={isApplied ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isApplying ? 'Applying...' : isApplied ? 'Applied' : 'Apply Now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
