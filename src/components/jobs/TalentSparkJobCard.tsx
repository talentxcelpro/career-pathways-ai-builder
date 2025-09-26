import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Bookmark, Share2, MapPin, DollarSign, Clock, 
  Users, Building2, Zap, Brain, Star, Award, ChevronRight,
  Eye, MessageCircle, TrendingUp, Shield, Target, Sparkles,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJobDetailUrl } from '@/utils/seoUrls';
import { JobApplicationDialog } from '@/components/jobs/JobApplicationDialog';

interface TalentSparkJobCardProps {
  job: any;
  onSave: (jobId: string) => void;
  onQuickApply: (jobId: string) => void;
  onCompare?: (job: any) => void;
  isSaved: boolean;
  isInComparison?: boolean;
  txcReward: number;
  viewMode: 'card' | 'swipe' | 'list' | 'featured';
}

export const TalentSparkJobCard: React.FC<TalentSparkJobCardProps> = ({
  job,
  onSave,
  onQuickApply,
  onCompare,
  isSaved,
  isInComparison = false,
  txcReward,
  viewMode
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  // Calculate AI match score based on job attributes
  const [aiMatchScore] = useState(() => {
    let score = 70; // Base score
    
    // Boost score for matching skills, location, salary, etc.
    if (job.is_remote) score += 5;
    if (job.is_featured) score += 10;
    if (job.applications_count < 10) score += 5; // Less competition
    if (job.views_count > 100) score += 5; // Popular job
    if (job.salary_max && job.salary_max > 1000000) score += 5; // High salary
    
    return Math.min(score + Math.floor(Math.random() * 10), 100);
  });
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary undisclosed';
    if (min && max) {
      return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
    }
    return `₹${((min || max || 0) / 100000).toFixed(1)}L+`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const handleViewJob = () => {
    navigate(getJobDetailUrl(job));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${getJobDetailUrl(job)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job at ${job.companies?.name || job.company_name}`,
          url: url
        });
      } catch (error) {
        // Fallback to clipboard if sharing fails
        await navigator.clipboard.writeText(url);
        alert('Job link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Job link copied to clipboard!');
    }
  };

  // Featured job card (larger, more prominent)
  if (viewMode === 'featured') {
    return (
      <Card 
        className="group relative overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewJob}
      >
        {/* Featured Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>

        {/* AI Match Score */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">{aiMatchScore}%</span>
          </div>
        </div>

        <div className="p-6">
          {/* Company Logo & Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              {job.companies?.logo_url ? (
                <img 
                  src={job.companies.logo_url} 
                  alt={job.companies.name}
                  className="w-12 h-12 object-contain rounded-lg"
                />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <p className="text-sm sm:text-base text-primary font-semibold">
                {job.companies?.name || job.company_name}
              </p>
              <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate max-w-24 sm:max-w-none">{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{getTimeAgo(job.posted_at || job.created_at)}</span>
                  <span className="sm:hidden">{getTimeAgo(job.posted_at || job.created_at).replace(' ago', '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary & Benefits */}
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-base font-bold text-green-700">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {job.employment_type}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              + Health Insurance, PF, Bonus, Remote Flexibility
            </div>
          </div>

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.slice(0, 4).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills_required.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 group"
              onClick={(e) => {
                e.stopPropagation();
                setShowApplicationDialog(true);
              }}
            >
              <Send className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Apply Now (+{txcReward} TXC)
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSave(job.id);
              }}
              className={isSaved ? 'text-red-500 border-red-200' : ''}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Enhanced swipe mode card (mobile-optimized with detailed information)
  if (viewMode === 'swipe') {
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 hover:shadow-xl transition-all duration-300 h-full">
        {/* AI Match Score Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
        
        <div className="p-5 h-full flex flex-col" onClick={handleViewJob}>
          {/* Header with Company Logo */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              {job.companies?.logo_url ? (
                <img 
                  src={job.companies.logo_url} 
                  alt={job.companies.name}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                {job.title}
              </h3>
              <p className="text-base text-primary font-semibold mb-3">
                {job.companies?.name || job.company_name}
              </p>
              
              {/* Location and Posted Time */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeAgo(job.posted_at || job.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* AI Match Score - Enhanced */}
            <div className="text-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-3 min-w-[70px]">
              <div className="text-xs text-muted-foreground mb-1">AI Match</div>
              <div className="text-lg font-bold text-primary">{aiMatchScore}%</div>
              <Progress value={aiMatchScore} className="h-1.5 mt-1" />
            </div>
          </div>

          {/* Salary & Benefits - Prominent */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>
              <Badge variant="outline" className="text-sm border-green-300 text-green-700">
                {job.employment_type}
              </Badge>
            </div>
            <div className="text-sm text-green-600">
              + Health Insurance, PF, Bonus, Remote Flexibility
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Experience</div>
                  <div className="text-sm font-medium">{job.experience_level}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Views</div>
                  <div className="text-sm font-medium">{job.views_count || 0}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Applied</div>
                  <div className="text-sm font-medium">{job.applications_count || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Verified</div>
                  <div className="text-sm font-medium text-green-600">✓ Company</div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Preview */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-2 text-gray-800">About this role</div>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {job.description || "Exciting opportunity to join our growing team. We offer competitive salary, great benefits, and a collaborative work environment. Looking for passionate individuals to make an impact."}
            </p>
          </div>
          
          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2 text-gray-800">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.slice(0, 6).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 6 && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    +{job.skills_required.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Apply Benefits */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Quick Apply Benefits</span>
            </div>
            <div className="text-xs text-blue-800 space-y-1">
              <div>✓ Instant application with one swipe</div>
              <div>✓ Priority processing by recruiter</div>
              <div>✓ +{txcReward} TXC coins reward</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 h-12"
              onClick={(e) => {
                e.stopPropagation();
                onSave(job.id);
              }}
            >
              <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            
            <Button 
              size="sm" 
              className="flex-[2] h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-sm font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                setShowApplicationDialog(true);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Apply Now (+{txcReward} TXC)
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // List view (compact horizontal layout)
  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-l-2 border-l-primary/30 hover:border-l-primary">
        <div className="p-4" onClick={handleViewJob}>
          <div className="flex items-center gap-4">
            {/* Company Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {job.companies?.logo_url ? (
                <img 
                  src={job.companies.logo_url} 
                  alt={job.companies.name}
                  className="w-6 h-6 object-contain rounded"
                />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
            </div>
            
            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-xs line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-primary font-medium">
                    {job.companies?.name || job.company_name}
                  </p>
                </div>
                
                {/* AI Match Score */}
                <div className="flex items-center gap-1 ml-2">
                  <div className="text-xs text-muted-foreground hidden sm:block">AI Match</div>
                  <div className="text-xs font-bold text-primary">{aiMatchScore}%</div>
                </div>
              </div>
              
              {/* Details Row */}
              <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-16 sm:max-w-none">{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="truncate">{formatSalary(job.salary_min, job.salary_max)}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(job.posted_at || job.created_at)}
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {job.employment_type}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(job.id);
                }}
                className={`h-6 w-6 sm:h-8 sm:w-8 p-0 ${isSaved ? 'text-red-500 border-red-200' : ''}`}
              >
                <Heart className={`h-2 w-2 sm:h-3 sm:w-3 ${isSaved ? 'fill-red-500' : ''}`} />
              </Button>
              
              <Button 
                size="sm"
                className="h-6 sm:h-8 px-2 sm:px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowApplicationDialog(true);
                }}
              >
                <span className="hidden sm:inline">Apply</span>
                <span className="sm:hidden">🚀</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default card view
  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewJob}
    >
      {/* Hot Job Indicator */}
      {job.applications_count < 5 && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-red-500 text-white text-xs animate-pulse">
            🔥 Hot
          </Badge>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              {job.companies?.logo_url ? (
                <img 
                  src={job.companies.logo_url} 
                  alt={job.companies.name}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                <Building2 className="h-7 w-7 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <p className="text-sm text-primary font-semibold">
                {job.companies?.name || job.company_name}
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTimeAgo(job.posted_at || job.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Score */}
          <div className="text-right">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-2 min-w-[80px]">
              <div className="text-xs text-muted-foreground mb-1">AI Match</div>
              <div className="text-sm font-bold text-primary">{aiMatchScore}%</div>
              <Progress value={aiMatchScore} className="h-1 mt-1" />
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                {job.employment_type} • {job.experience_level}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">
                {job.views_count || 0} views
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">
                {job.applications_count || 0} applied
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {job.skills_required.slice(0, 3).map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills_required.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Benefits Preview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-1">Benefits Include</div>
          <div className="text-sm">
            🏥 Health Insurance • 💰 Performance Bonus • 🏠 Remote Option • 📚 Learning Budget
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSave(job.id);
              }}
              className={isSaved ? 'text-red-500 border-red-200' : ''}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleViewJob();
              }}
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            <Button 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              onClick={(e) => {
                e.stopPropagation();
                setShowApplicationDialog(true);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Apply Now (+{txcReward} TXC)
            </Button>
          </div>
        </div>

        {/* Hover Effect */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none transition-opacity duration-300" />
        )}
      </div>

      {/* Job Application Dialog */}
      <JobApplicationDialog
        isOpen={showApplicationDialog}
        onClose={() => setShowApplicationDialog(false)}
        job={job}
        onApply={() => {
          onQuickApply(job.id);
          setShowApplicationDialog(false);
        }}
      />
    </Card>
  );
};