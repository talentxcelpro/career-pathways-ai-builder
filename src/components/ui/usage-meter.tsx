import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from '@/components/ui/tier-badge';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { AlertTriangle } from 'lucide-react';

interface UsageMeterProps {
  type: 'dailyAIRequests' | 'monthlyJobApplications' | 'networkConnections' | 'storageGB';
  currentUsage: number;
  label: string;
  showUpgradePrompt?: boolean;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  type,
  currentUsage,
  label,
  showUpgradePrompt = true
}) => {
  const { tierLimits, currentTier, showUpgradePrompt: triggerUpgrade } = useTieredAccess();
  
  const limit = tierLimits[type] as number;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((currentUsage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getStatusColor()}>
            {isUnlimited ? `${currentUsage} / ∞` : `${currentUsage} / ${limit}`}
          </Badge>
          <TierBadge tier={currentTier} size="sm" />
        </div>
      </div>
      
      {!isUnlimited && (
        <div className="space-y-1">
          <Progress 
            value={percentage} 
            className="h-2"
          />
          <div 
            className={`h-2 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {(isNearLimit || isAtLimit) && showUpgradePrompt && (
        <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-xs text-amber-700">
            {isAtLimit 
              ? `You've reached your ${label.toLowerCase()} limit.`
              : `You're approaching your ${label.toLowerCase()} limit.`
            }
            {currentTier !== 'enterprise' && (
              <button
                onClick={() => triggerUpgrade(label, currentTier === 'free' ? 'pro' : 'enterprise')}
                className="ml-1 underline font-medium hover:no-underline"
              >
                Upgrade now
              </button>
            )}
          </span>
        </div>
      )}
    </div>
  );
};