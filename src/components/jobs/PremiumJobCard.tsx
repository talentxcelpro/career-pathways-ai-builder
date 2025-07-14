import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Clock, Users, Heart, Eye, TrendingUp, Zap, Star, 
  Building2, DollarSign, Calendar, Award, Shield, Target,
  Brain, MessageCircle, Share2, Bookmark, ChevronRight,
  Briefcase, GraduationCap, Code, Globe, Timer, AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";

interface PremiumJobCardProps {
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
    views_count?: number;
    applications_count?: number;
    posted_at?: string;
    deadline?: string;
    company?: {
      id: string;
      name: string;
      logo_url?: string;
      industry?: string;
      rating?: number;
      size?: string;
      verified?: boolean;
    };
    insights?: {
      match_score?: number;
      competition_level?: 'low' | 'medium' | 'high';
      hiring_urgency?: 'low' | 'medium' | 'high';
      success_rate?: number;
      response_rate?: number;
    };
  };
  onSave?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
  variant?: 'premium' | 'featured' | 'standard';
}

export const PremiumJobCard: React.FC<PremiumJobCardProps> = ({ 
  job, 
  onSave, 
  onShare,
  onApply,
  isSaved = false,
  variant = 'standard'
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(job.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(job.id);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply?.(job.id);
  };

  const getAIMatchScore = () => {
    return job.insights?.match_score || Math.floor(Math.random() * 20) + 75;
  };

  const getCompetitionData = () => {
    const level = job.insights?.competition_level || 'medium';
    const applicants = job.applications_count || 0;
    
    const config = {
      low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Low Competition', progress: 25 },
      medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium Competition', progress: 60 },
      high: { color: 'text-red-600', bg: 'bg-red-100', label: 'High Competition', progress: 90 }
    };
    
    return { ...config[level], applicants };
  };

  const getUrgencyLevel = () => {
    const urgency = job.insights?.hiring_urgency || 'medium';
    const configs = {
      low: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Standard Hiring' },
      medium: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Active Hiring' },
      high: { color: 'text-red-600', bg: 'bg-red-100', label: 'Urgent Hiring' }
    };
    return configs[urgency];
  };

  const competition = getCompetitionData();
  const urgency = getUrgencyLevel();
  const aiScore = getAIMatchScore();
  const daysLeft = job.deadline ? Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const isPremium = variant === 'premium';
  const isFeatured = variant === 'featured' || job.is_featured;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden ${
        isPremium 
          ? 'border-2 border-gradient-to-r from-gold-400 to-gold-600 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 hover:shadow-2xl hover:shadow-gold-200/50' 
          : isFeatured
          ? 'border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 hover:shadow-xl hover:shadow-primary/20'
          : 'border border-gray-200 bg-white hover:shadow-lg'
      } hover:scale-[1.02]`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Premium Header Strip */}
        {isPremium && (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 px-6 py-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span className="font-bold">PREMIUM OPPORTUNITY</span>
                <Shield className="h-4 w-4" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                ⚡ Fast Track Application
              </Badge>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header with badges */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {job.is_urgent && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  🔥 URGENT
                </Badge>
              )}
              {isFeatured && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                  ⭐ FEATURED
                </Badge>
              )}
              {job.company?.verified && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                <Brain className="mr-1 h-3 w-3" />
                {aiScore}% AI Match
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveClick}
                className="text-gray-400 hover:text-red-500"
              >
                {isSaved ? (
                  <Bookmark className="h-4 w-4 fill-red-500 text-red-500" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                className="text-gray-400 hover:text-blue-500"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Company and Job Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={job.company?.logo_url} alt={job.company?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {job.company?.name?.slice(0, 2).toUpperCase() || 'CO'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-2xl text-gray-900 hover:text-primary transition-colors leading-tight">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-primary font-semibold text-lg">{job.company?.name}</p>
                  {job.company?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{job.company.rating}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{job.location}</span>
                  {job.is_remote && <Badge variant="outline" className="text-xs">Remote</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span>{job.employment_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span>{job.experience_level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-primary">
                    {formatSalaryRange(job.salary_min, job.salary_max, true)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Description */}
          <div className="space-y-4">
            {job.skills_required && job.skills_required.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.slice(0, isExpanded ? undefined : 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      <Code className="mr-1 h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                  {job.skills_required.length > 5 && !isExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="text-xs"
                    >
                      +{job.skills_required.length - 5} more
                    </Button>
                  )}
                </div>
              </div>
            )}

            {job.description && (
              <div>
                <p className="text-gray-600 leading-relaxed">
                  {isExpanded ? job.description : `${job.description.slice(0, 200)}${job.description.length > 200 ? '...' : ''}`}
                </p>
                {job.description.length > 200 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-xs mt-2 p-0 h-auto"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                    <ChevronRight className={`ml-1 h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Insights Panel */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">AI Insights</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Competition Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Competition</span>
                  </div>
                  <Badge className={`${competition.bg} ${competition.color} text-xs`}>
                    {competition.label}
                  </Badge>
                </div>
                <Progress value={competition.progress} className="h-2" />
                <p className="text-xs text-gray-500">{competition.applicants} applicants so far</p>
              </div>

              {/* Success Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Success Rate</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {job.insights?.success_rate || 78}%
                  </span>
                </div>
                <Progress value={job.insights?.success_rate || 78} className="h-2" />
                <p className="text-xs text-gray-500">Based on similar profiles</p>
              </div>

              {/* Response Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Response Rate</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {job.insights?.response_rate || 85}%
                  </span>
                </div>
                <Progress value={job.insights?.response_rate || 85} className="h-2" />
                <p className="text-xs text-gray-500">Avg. 2-3 days response</p>
              </div>
            </div>
          </div>

          {/* Footer with stats and actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{job.views_count || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{job.applications_count || 0} applied</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently posted'}</span>
              </div>
              {daysLeft && daysLeft > 0 && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 font-medium">{daysLeft} days left</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-primary/10 hover:text-primary"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask Question
              </Button>
              <Button 
                size="sm"
                onClick={handleApplyClick}
                className={`font-semibold ${
                  isPremium 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                    : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                }`}
              >
                <Zap className="mr-2 h-4 w-4" />
                {isPremium ? 'Priority Apply' : 'Quick Apply'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};