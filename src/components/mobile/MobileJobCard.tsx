import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, Building, TrendingUp } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { getCompanyLogoWithFallback } from '@/services/companyLogoService';

interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  posted_at: string;
  is_remote: boolean;
  experience_level: string;
  companies?: {
    name: string;
    logo_url?: string;
    industry?: string;
  };
}

interface MobileJobCardProps {
  job: Job;
  isLiked: boolean;
  onLike: () => void;
  onApply: () => void;
  onViewDetails: () => void;
}

export const MobileJobCard: React.FC<MobileJobCardProps> = ({
  job,
  isLiked,
  onLike,
  onApply,
  onViewDetails
}) => {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L`;
    if (min) return `₹${(min/100000).toFixed(1)}L+`;
    return 'Competitive salary';
  };

  const getExperienceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'junior': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 space-y-4 border-l-4 border-l-primary bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={job.companies?.logo_url || getCompanyLogoWithFallback(job.companies?.name || "Company")}
            alt={job.companies?.name || "Company"}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {job.title}
            </h3>
            <p className="text-gray-600 text-xs truncate">
              {job.companies?.name}
            </p>
            {job.companies?.industry && (
              <p className="text-gray-500 text-xs">
                {job.companies.industry}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onLike}
          className={`p-2 rounded-full transition-colors ${
            isLiked 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{job.location}</span>
          </div>
          {job.is_remote && (
            <Badge variant="secondary" className="text-xs py-0 px-2">
              Remote
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={`text-xs ${getExperienceColor(job.experience_level)}`}
          >
            {job.experience_level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {job.employment_type}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-primary">
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDistance(new Date(job.posted_at), new Date(), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 h-8 text-xs"
        >
          View Details
        </Button>
        <Button
          size="sm"
          onClick={onApply}
          className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
        >
          Quick Apply
        </Button>
      </div>

      {/* Match Score (if available) */}
      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span className="text-xs text-green-700 font-medium">
          85% match for your profile
        </span>
      </div>
    </Card>
  );
};