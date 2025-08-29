import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  IndianRupee, 
  Clock, 
  Star,
  Heart,
  Share2,
  TrendingUp,
  Zap,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSalaryRange } from '@/utils/currencyUtils';

interface EnhancedJobCardProps {
  job: any;
  showAIInsights?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const EnhancedJobCard = ({ 
  job, 
  showAIInsights = false, 
  variant = 'default'
}: EnhancedJobCardProps) => {
  const navigate = useNavigate();

  const handleJobClick = () => {
    navigate(`/jobs/${job.seo_slug || job.id}`);
  };

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${
        isFeatured 
          ? 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50' 
          : job.is_urgent 
          ? 'border-l-red-500' 
          : job.is_remote 
          ? 'border-l-green-500' 
          : 'border-l-blue-500'
      }`}
      onClick={handleJobClick}
    >
      <CardContent className={isCompact ? 'p-3' : 'p-4'}>
        {/* Header with badges */}
        <div className="flex gap-2 flex-wrap mb-3">
          {isFeatured && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {job.is_urgent && (
            <Badge className="bg-red-100 text-red-800">
              <Zap className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
          {job.is_remote && (
            <Badge className="bg-green-100 text-green-800">
              Remote
            </Badge>
          )}
        </div>

        {/* Job Title and Company */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage 
              src={job.companies?.logo_url || job.company_logo} 
              alt={job.companies?.name || job.company_name} 
            />
            <AvatarFallback className="text-sm">
              {(job.companies?.name || job.company_name || 'C').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <p className="font-medium text-sm">
              {job.companies?.name || job.company_name}
            </p>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {formatSalaryRange(job.salary_min, job.salary_max, true)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span>{job.views_count || 0} views</span>
          </div>
        </div>

        {/* AI Insights */}
        {showAIInsights && job.ai_insights && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI Match Score</span>
              <Badge className="bg-blue-100 text-blue-800">
                {job.ai_insights.match_score}%
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedJobCard;