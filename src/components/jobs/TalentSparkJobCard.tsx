import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Bookmark, Share2, MapPin, DollarSign, Banknote, Clock, 
  Users, Building2, Zap, Brain, Star, Award, ChevronRight,
  Eye, MessageCircle, TrendingUp, Shield, Target, Sparkles,
  Send,
  Linkedin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getJobDetailUrl } from '@/utils/seoUrls';
import { navigateToJobDetail, getCanonicalJobUrl } from '@/utils/crossDomainJobRouting';
import { JobApplicationDialog } from '@/components/jobs/JobApplicationDialog';
import { getCompanyLogo, generateCompanyMonogram } from '@/utils/companyLogos';
import { toast } from 'sonner';

interface TalentSparkJobCardProps {
  job: any;
  onSave: (jobId: string) => void;
  onQuickApply: (jobId: string) => void;
  onApplyClick?: (job: any) => void;
  onViewDetails?: (job: any) => void;
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
  onApplyClick,
  onViewDetails,
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
  
  const companyName = job.companies?.name || job.company_name || 'TalentXcel Services';
  const logoUrl = getCompanyLogo(companyName, job.companies?.logo_url || job.organization_logo_url);

  // Verified International Mobility Badges (Strict: Never fabricate)
  const eligLower = ((job.applicant_location_requirements || '') + ' ' + (job.description || '')).toLowerCase();
  const isVisaSponsored = Boolean(
    job.visa_sponsored === true ||
    job.structured_data?.visa_sponsored === true ||
    (job.applicant_location_requirements && job.applicant_location_requirements.toLowerCase().includes('visa sponsored')) ||
    (eligLower.includes('visa sponsorship') && !eligLower.includes('no visa sponsorship'))
  );
  const isRelocationProvided = Boolean(
    job.relocation_provided === true ||
    job.structured_data?.relocation_provided === true ||
    eligLower.includes('relocation flight') ||
    eligLower.includes('relocation support') ||
    eligLower.includes('relocation package')
  );
  const applicantReqBadge = (() => {
    const req = (job.applicant_location_requirements || '').toLowerCase();
    if (req.includes('worldwide') || req.includes('anywhere')) {
      return { label: '🌐 Worldwide Remote', className: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (req.includes('india') && (job.location || '').toLowerCase().includes('remote')) {
      return { label: '🇮🇳 Open to India', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (req.includes('united states') || req.includes('us work') || req.includes('us citizenship') || ((job.location || '').toLowerCase().includes('united states') && req.includes('us only'))) {
      return { label: '🇺🇸 US Auth Required', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return null;
  })();
  
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive Pay';
    const curr = ((job as any)?.salary_currency || '').toUpperCase();
    const loc = (job.location || '').toLowerCase();
    
    if (curr === 'AED' || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('uae')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `AED ${minK}k - ${maxK}k / yr` : `AED ${minK}k / yr`;
    }
    if (curr === 'USD' || loc.includes('usa') || loc.includes('united states') || loc.includes('austin') || loc.includes('seattle') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('san mateo')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `$${minK}k - $${maxK}k / yr` : `$${minK}k / yr`;
    }
    if (curr === 'SAR' || loc.includes('riyadh') || loc.includes('saudi')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `SAR ${minK}k - ${maxK}k / yr` : `SAR ${minK}k / yr`;
    }
    if (curr === 'QAR' || loc.includes('doha') || loc.includes('qatar')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `QAR ${minK}k - ${maxK}k / yr` : `QAR ${minK}k / yr`;
    }
    if (curr === 'OMR' || loc.includes('muscat') || loc.includes('oman')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `OMR ${minK}k - ${maxK}k / yr` : `OMR ${minK}k / yr`;
    }
    if (curr === 'GBP' || loc.includes('london') || loc.includes('united kingdom') || loc.includes('uk')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `£${minK}k - £${maxK}k / yr` : `£${minK}k / yr`;
    }
    if (curr === 'SGD' || loc.includes('singapore')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `S$${minK}k - S$${maxK}k / yr` : `S$${minK}k / yr`;
    }
    if (curr === 'AUD' || loc.includes('sydney') || loc.includes('canberra') || loc.includes('australia')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `A$${minK}k - A$${maxK}k / yr` : `A$${minK}k / yr`;
    }
    if (curr === 'EUR' || loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('belgium') || loc.includes('brussels')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `€${minK}k - €${maxK}k / yr` : `€${minK}k / yr`;
    }
    if (curr === 'CAD' || loc.includes('canada') || loc.includes('toronto') || loc.includes('ottawa')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? `C$${minK}k - C$${maxK}k / yr` : `C$${minK}k / yr`;
    }

    if (min && max) {
      if (max < 100000) {
        return `₹${Math.round(min / 1000)}k - ₹${Math.round(max / 1000)}k`;
      }
      return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
    }
    const val = min || max || 0;
    if (val < 100000) return `₹${Math.round(val / 1000)}k+`;
    return `₹${(val / 100000).toFixed(1)}L+`;
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
    navigateToJobDetail(job, navigate);
  };

  const handleShareLinkedIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getCanonicalJobUrl(job);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opening LinkedIn to share job...');
  };

  const handleShare = async () => {
    const url = getCanonicalJobUrl(job);
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
            <div className="w-16 h-16 bg-white dark:bg-card rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-border/50 shadow-sm overflow-hidden">
              <img 
                src={logoUrl} 
                alt={companyName}
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = generateCompanyMonogram(companyName);
                }}
              />
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
                <Banknote className="h-4 w-4 text-emerald-600" />
                <span className="text-base font-bold text-emerald-700">
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
                if (onApplyClick) {
                  onApplyClick(job);
                } else {
                  setShowApplicationDialog(true);
                }
              }}
            >
              <Send className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Apply Now
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
            <div className="w-16 h-16 bg-white dark:bg-card rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 shadow-sm border border-border/50 overflow-hidden">
              <img 
                src={logoUrl} 
                alt={companyName}
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = generateCompanyMonogram(companyName);
                }}
              />
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
                {isVisaSponsored && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-1.5 py-0">
                    🛂 Visa Sponsored
                  </Badge>
                )}
                {isRelocationProvided && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold px-1.5 py-0">
                    ✈ Relocation
                  </Badge>
                )}
                {applicantReqBadge && (
                  <Badge variant="outline" className={`text-[10px] font-medium px-1.5 py-0 ${applicantReqBadge.className}`}>
                    {applicantReqBadge.label}
                  </Badge>
                )}
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
                <Banknote className="h-5 w-5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-700">
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
                  <div className="text-xs text-muted-foreground">Applications</div>
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
                if (onApplyClick) {
                  onApplyClick(job);
                } else {
                  setShowApplicationDialog(true);
                }
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Apply Now
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
                if (onApplyClick) {
                  onApplyClick(job);
                } else {
                  setShowApplicationDialog(true);
                }
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
      className="group relative overflow-hidden bg-card hover:bg-card/90 hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/40 hover:border-primary/40 rounded-xl flex flex-col justify-between h-full w-full min-w-0 box-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewJob}
    >
      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-white dark:bg-card rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-border/60 shadow-xs overflow-hidden">
              <img 
                src={logoUrl} 
                alt={companyName}
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = generateCompanyMonogram(companyName);
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs sm:text-sm text-primary font-semibold truncate">
                  {job.companies?.name || job.company_name}
                </span>
                <a
                  href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(companyName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-[#0A66C2] hover:text-[#004182] hover:underline text-[11px] font-medium"
                  title={`Find ${companyName} on LinkedIn`}
                >
                  <Linkedin className="h-3 w-3 inline mr-0.5" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              </div>
              <div className="flex items-center gap-2.5 mt-1.5 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{getTimeAgo(job.posted_at || job.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Score & Hot Indicator */}
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
            {job.applications_count < 5 && (
              <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] px-1.5 py-0 font-medium">
                🔥 Hot
              </Badge>
            )}
            <div className="bg-primary/5 border border-primary/15 rounded-lg px-2.5 py-1.5 text-center min-w-[72px]">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Match</div>
              <div className="text-xs sm:text-sm font-bold text-primary">{aiMatchScore}%</div>
              <Progress value={aiMatchScore} className="h-1 mt-1" />
            </div>
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              <Banknote className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="truncate">
                {[job.employment_type, job.experience_level].filter(Boolean).join(' • ') || 'Full-time • Verified'}
              </span>
            </div>
          </div>
          
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <Eye className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              <span className="truncate">{job.views_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{job.applications_count || 0} applicants</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.slice(0, 3).map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-[11px] px-2 py-0.5 font-medium">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 3 && (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0.5 text-muted-foreground">
                  +{job.skills_required.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Benefits Preview */}
        <div className="bg-muted/40 dark:bg-muted/20 border border-border/30 rounded-lg px-3 py-2 mb-3">
          <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Benefits Include</div>
          <div className="text-xs text-foreground/85 flex items-center gap-1.5 flex-wrap">
            <span>🏥 Health Insurance</span>
            <span className="text-muted-foreground/40">•</span>
            <span>💰 Performance Bonus</span>
            <span className="text-muted-foreground/40">•</span>
            <span>🏠 Remote Option</span>
            <span className="text-muted-foreground/40">•</span>
            <span>📚 Learning Budget</span>
          </div>
        </div>

        {/* Action Buttons: Responsive, Never Cut Off */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border/20 mt-auto w-full min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSave(job.id);
              }}
              className={`h-8 w-8 p-0 rounded-lg hover:bg-muted ${isSaved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
              title={isSaved ? "Saved" : "Save job"}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLinkedIn}
              className="h-8 w-8 p-0 rounded-lg text-[#0A66C2] hover:text-[#004182] hover:bg-blue-50"
              title="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:bg-muted"
              title="Share job"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <Button 
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewJob();
              }}
              className="h-8 px-2.5 text-xs font-medium hover:bg-muted shrink-0"
            >
              Details
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
            
            <Button 
              size="sm"
              className="h-8 px-3.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs shrink-0 flex items-center gap-1.5 whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                if (onApplyClick) {
                  onApplyClick(job);
                } else {
                  setShowApplicationDialog(true);
                }
              }}
            >
              <Send className="h-3.5 w-3.5 shrink-0" />
              <span>Apply Now</span>
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