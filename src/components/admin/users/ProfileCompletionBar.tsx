import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, AlertTriangle } from 'lucide-react';

interface ProfileCompletionBarProps {
  user: any;
  onSendReminder?: (userId: string, completionPercentage: number) => void;
  compact?: boolean;
}

// Helper function to calculate completion from user data
const calculateUserCompletion = (user: any) => {
  if (!user) return { percentage: 0, completedCount: 0, totalCount: 8 };
  
  let completed = 0;
  const total = 8;
  
  if (user.full_name) completed++;
  if (user.title) completed++;
  if (user.about && user.about.length > 50) completed++;
  if (user.profile_picture_url) completed++;
  if (user.skills && user.skills.length > 0) completed++;
  if (user.company) completed++;
  if (user.location) completed++;
  if (user.linkedin_url) completed++;
  
  return {
    percentage: Math.round((completed / total) * 100),
    completedCount: completed,
    totalCount: total
  };
};

export const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({
  user,
  onSendReminder,
  compact = false
}) => {
  const { percentage, completedCount, totalCount } = calculateUserCompletion(user);
  
  // Helper functions for styling
  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getCompletionBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage <= 25) return 'bg-red-500';
    if (percentage <= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getMissingCriteria = () => {
    const missing: string[] = [];
    if (!user?.full_name) missing.push('Full Name');
    if (!user?.title) missing.push('Job Title');
    if (!user?.about || user.about.length < 50) missing.push('About Section');
    if (!user?.profile_picture_url) missing.push('Profile Picture');
    if (!user?.skills || user.skills.length === 0) missing.push('Skills');
    if (!user?.company) missing.push('Company');
    if (!user?.location) missing.push('Location');
    if (!user?.linkedin_url) missing.push('LinkedIn Profile');
    return missing;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getProgressColor(percentage)}`}
            style={{ 
              width: `${percentage}%`,
              transform: 'translateX(0)',
              animation: 'slide-in-right 0.8s ease-out'
            }}
          />
        </div>
        <span className={`text-xs font-medium transition-colors duration-300 ${getCompletionColor(percentage)}`}>
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getCompletionColor(percentage)} ${getCompletionBgColor(percentage)}`}
            >
              {completedCount}/{totalCount}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getCompletionColor(percentage)}`}>
              {percentage}%
            </span>
            {percentage < 75 && onSendReminder && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSendReminder(user.id, percentage)}
                    className="h-6 w-6 p-0 hover:bg-blue-50"
                  >
                    <Mail className="h-3 w-3 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send completion reminder</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Progress 
            value={percentage} 
            className="h-2 animate-scale-in"
            style={{
              '--progress-background': getProgressColor(percentage),
              transition: 'all 0.5s ease-out'
            } as React.CSSProperties}
          />
        </div>

        {percentage < 100 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <AlertTriangle className="h-3 w-3" />
                <span>Missing: {getMissingCriteria().slice(0, 2).join(', ')}{getMissingCriteria().length > 2 ? ` +${getMissingCriteria().length - 2}` : ''}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Missing Criteria:</p>
                <ul className="text-xs space-y-0.5">
                  {getMissingCriteria().map((criteria, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-current rounded-full" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
  );
};