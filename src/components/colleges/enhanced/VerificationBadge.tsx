import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  verificationStatus = 'pending',
  showTooltip = true,
  size = 'md'
}) => {
  const getVerificationContent = () => {
    if (isVerified || verificationStatus === 'verified') {
      return {
        icon: CheckCircle,
        text: 'Verified',
        color: 'bg-green-500 text-white',
        tooltip: 'This college has been verified by TalentXcel for authenticity, accurate information, and quality standards.'
      };
    }
    
    if (verificationStatus === 'pending') {
      return {
        icon: Clock,
        text: 'Pending',
        color: 'bg-yellow-500 text-white',
        tooltip: 'This college is currently under verification review. Information accuracy is being validated.'
      };
    }
    
    return {
      icon: AlertCircle,
      text: 'Unverified',
      color: 'bg-gray-400 text-white',
      tooltip: 'This college has not yet completed our verification process. Please verify information independently.'
    };
  };

  const { icon: Icon, text, color, tooltip } = getVerificationContent();
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  const badge = (
    <Badge className={`${color} border-0 ${textSize} font-semibold`}>
      <Icon className={`${iconSize} mr-1`} />
      {text}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};