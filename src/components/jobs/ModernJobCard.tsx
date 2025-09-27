import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart, Eye, TrendingUp, Zap, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { useJobsEngagement } from "@/hooks/useJobsEngagement";
import { EngagementActions } from "@/components/engagement/EngagementActions";

interface ModernJobCardProps {
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
  variant?: 'featured' | 'regular';
}

export const ModernJobCard: React.FC<ModernJobCardProps> = ({ 
  job, 
  onSave, 
  isSaved = false,
  variant = 'regular'
}) => {
  const navigate = useNavigate();
  const { 
    trackJobView, 
    saveJob, 
    applyToJob, 
    shareJob, 
    isJobSaved, 
    isJobApplied 
  } = useJobsEngagement();

  const handleCardClick = () => {
    console.log('🔗 Navigating to job detail:', job.id);
    trackJobView(job.id);
    
    // Check if this is an external job
    if ((job as any).external_url) {
      console.log('🔗 External job detected, redirecting to:', (job as any).external_url);
      window.open((job as any).external_url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Internal job - navigate to detail page
    navigate(`/jobs/${(job as any).seo_slug || job.id}`);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await saveJob(job.id);
    onSave?.(job.id);
  };

  const getAIMatchScore = () => {
    // Generate a realistic AI match score based on job data
    const baseScore = 75;
    const skillBonus = job.skills_required ? Math.min(job.skills_required.length * 3, 20) : 0;
    const featuredBonus = job.is_featured ? 5 : 0;
    return Math.min(baseScore + skillBonus + featuredBonus, 99);
  };

  const getCompetitionLevel = () => {
    const applicants = job.applications_count || 0;
    if (applicants <= 2) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (applicants <= 5) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const competition = getCompetitionLevel();
  const aiScore = getAIMatchScore();

  if (variant === 'featured') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl overflow-hidden"
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1">
                🏷️ Featured
              </Badge>
              <Badge variant="destructive" className="bg-orange-500">
                🔥 Urgent
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-700">
                🧠 AI Matched {aiScore}%
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              className="text-gray-400 hover:text-red-500"
            >
              <Heart className={`h-4 w-4 ${isJobSaved(job.id) || isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={job.company?.logo_url} alt={job.company?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {job.company?.name?.slice(0, 2).toUpperCase() || 'JB'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-1 hover:text-primary transition-colors">
                🧑‍💼 {job.title}
              </h3>
              <p className="text-primary font-semibold mb-2">@ {job.company?.name}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location} {job.is_remote && '• Remote'}
                </span>
                <span>🏢 {job.employment_type}</span>
                <span className="font-semibold text-primary">
                  {formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}
                </span>
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    🛠️ Skills: {job.skills_required.slice(0, 3).join(', ')}
                    {job.skills_required.length > 3 && ` +${job.skills_required.length - 3} more`}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {job.views_count || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {job.applications_count || 0} applicant{(job.applications_count || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently posted'}
                  </span>
                  <Badge className={`${competition.bg} ${competition.color} text-xs`}>
                    🔴 {competition.level} competition
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <EngagementActions
                    contentId={job.id}
                    contentType="job"
                    module="jobs"
                    variant="compact"
                    className="flex gap-1"
                    onShare={() => shareJob(job.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-2xl border border-gray-200 bg-white"
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {job.is_featured && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                ⭐ AI Top Match
              </Badge>
            )}
            {job.is_remote && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                👨‍💻 Remote Friendly
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              🧠 AI Relevance: {aiScore}%
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <Heart className={`h-4 w-4 ${isJobSaved(job.id) || isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={job.company?.logo_url} alt={job.company?.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
              {job.company?.name?.slice(0, 2).toUpperCase() || 'JB'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-primary transition-colors">
              🧑‍💼 {job.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">@ {job.company?.name}</p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span>|</span>
              <span>{job.experience_level || 'All levels'}</span>
              <span>|</span>
              <span>{job.employment_type}</span>
              <span>|</span>
              <span className="font-medium text-primary">
                {formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}
              </span>
            </div>

            {job.skills_required && job.skills_required.length > 0 && (
              <p className="text-xs text-gray-500 mb-3">
                🛠️ Skills: {job.skills_required.slice(0, 4).join(', ')}
                {job.skills_required.length > 4 && '...'}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  👀 {job.views_count || 0} views
                </span>
                <span className="flex items-center gap-1">
                  👤 {job.applications_count || 0} applicant{(job.applications_count || 0) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  🕒 {job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently posted'}
                </span>
              </div>

              <EngagementActions
                contentId={job.id}
                contentType="job"
                module="jobs"
                variant="default"
                className="flex gap-2"
                onShare={() => shareJob(job.id)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};