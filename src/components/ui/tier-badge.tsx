import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AccessTier } from '@/types/access';

interface TierBadgeProps {
  tier: AccessTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ 
  tier, 
  size = 'md', 
  showIcon = true 
}) => {
  const getConfig = (tier: AccessTier) => {
    switch (tier) {
      case 'enterprise':
        return {
          label: 'Enterprise',
          icon: <Star className={`h-${size === 'sm' ? '3' : '4'} w-${size === 'sm' ? '3' : '4'}`} />,
          className: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0'
        };
      case 'pro':
        return {
          label: 'Pro',
          icon: <Crown className={`h-${size === 'sm' ? '3' : '4'} w-${size === 'sm' ? '3' : '4'}`} />,
          className: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0'
        };
      default:
        return {
          label: 'Free',
          icon: <Zap className={`h-${size === 'sm' ? '3' : '4'} w-${size === 'sm' ? '3' : '4'}`} />,
          className: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0'
        };
    }
  };

  const config = getConfig(tier);

  return (
    <Badge 
      className={`${config.className} ${
        size === 'sm' ? 'text-xs px-2 py-1' : 
        size === 'lg' ? 'text-base px-4 py-2' : 
        'text-sm px-3 py-1.5'
      } font-semibold`}
    >
      {showIcon && (
        <span className="mr-1.5">
          {config.icon}
        </span>
      )}
      {config.label}
    </Badge>
  );
};