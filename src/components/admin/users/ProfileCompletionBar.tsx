import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, AlertTriangle } from 'lucide-react';
import { useProfileCompletion, getCompletionColor, getCompletionBgColor } from '@/hooks/useProfileCompletion';

interface ProfileCompletionBarProps {
  user: any;
  onSendReminder?: (userId: string, completionPercentage: number) => void;
  compact?: boolean;
}

export const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({
  user,
  onSendReminder,
  compact = false
}) => {
  const { percentage, criteria, completedCount, totalCount } = useProfileCompletion(user);

  const getProgressColor = (percentage: number): string => {
    if (percentage <= 25) return 'bg-red-500';
    if (percentage <= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getMissingCriteria = () => {
    const missing: string[] = [];
    if (!criteria.basicInfo) missing.push('Basic Info');
    if (!criteria.professionalInfo) missing.push('Professional Info');
    if (!criteria.aboutSection) missing.push('About Section');
    if (!criteria.socialLinks) missing.push('Social Links');
    if (!criteria.skills) missing.push('Skills');
    if (!criteria.workExperience) missing.push('Work Experience');
    if (!criteria.profileImages) missing.push('Profile Images');
    if (!criteria.resume) missing.push('Resume');
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