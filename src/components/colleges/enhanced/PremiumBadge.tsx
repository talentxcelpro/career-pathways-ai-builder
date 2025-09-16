import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Crown, Sparkles, Zap } from 'lucide-react';

interface PremiumBadgeProps {
  isPremium?: boolean;
  isFeatured?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  isPremium,
  isFeatured,
  showTooltip = true,
  size = 'md'
}) => {
  if (!isPremium && !isFeatured) return null;

  const getBadgeContent = () => {
    if (isPremium && isFeatured) {
      return {
        icon: Crown,
        text: 'Premium Featured',
        gradient: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600',
        tooltip: 'This is a premium featured college with enhanced visibility and detailed information. This is a promoted listing.'
      };
    }
    
    if (isPremium) {
      return {
        icon: Star,
        text: 'Premium',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
        tooltip: 'This is a premium college listing with enhanced features and priority placement. This is a promoted listing.'
      };
    }
    
    return {
      icon: Sparkles,
      text: 'Featured',
      gradient: 'bg-gradient-to-r from-blue-500 to-purple-500',
      tooltip: 'This college is featured for enhanced visibility. This is a promoted listing.'
    };
  };

  const { icon: Icon, text, gradient, tooltip } = getBadgeContent();
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  const badge = (
    <Badge className={`${gradient} text-white border-0 ${textSize} font-semibold shadow-lg`}>
      <Icon className={`${iconSize} mr-1`} />
      {text}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
  );
};