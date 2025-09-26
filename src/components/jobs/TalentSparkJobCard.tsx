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
  const [aiMatchScore] = useState(Math.floor(Math.random() * 30) + 70); // 70-100%
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
      await navigator.share({
        title: job.title,
        text: `Check out this job at ${job.companies?.name || job.company_name}`,
        url: url
      });
    } else {
      await navigator.clipboard.writeText(url);
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
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <p className="text-lg text-primary font-semibold">
                {job.companies?.name || job.company_name}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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

          {/* Salary & Benefits */}
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-bold text-green-700">
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
              <div className="text-sm font-medium mb-2">Required Skills</div>
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

  // Swipe mode card (mobile-optimized)
  if (viewMode === 'swipe') {
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-primary/5 hover:shadow-xl transition-all duration-300">
        {/* AI Match Score Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
        
        <div className="p-4" onClick={handleViewJob}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {job.companies?.logo_url ? (
                <img 
                  src={job.companies.logo_url} 
                  alt={job.companies.name}
                  className="w-8 h-8 object-contain rounded"
                />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 line-clamp-2">
                {job.title}
              </h3>
              <p className="text-primary font-medium">
                {job.companies?.name || job.company_name}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {job.location}
                <span>•</span>
                <DollarSign className="h-3 w-3" />
                {formatSalary(job.salary_min, job.salary_max)}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">AI Match</div>
              <div className="text-lg font-bold text-primary">{aiMatchScore}%</div>
            </div>
          </div>
          
          {/* Swipe Actions */}
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowApplicationDialog(true);
              }}
            >
              <Send className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSave(job.id);
              }}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
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
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <p className="text-primary font-semibold">
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
              <div className="text-lg font-bold text-primary">{aiMatchScore}%</div>
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
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company?.name || 'Company Name'}
        onApplicationSubmit={() => {
          onQuickApply(job.id);
          setShowApplicationDialog(false);
        }}
      />
    </Card>
  );
};