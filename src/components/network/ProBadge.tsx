import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";

interface ProBadgeProps {
  plan: 'Starter' | 'Business' | 'Elite';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ProBadge: React.FC<ProBadgeProps> = ({ plan, size = 'md', showIcon = true }) => {
  const getVariantConfig = () => {
    switch (plan) {
      case 'Starter':
        return {
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Zap className="h-3 w-3" />,
          text: 'Pro'
        };
      case 'Business':
        return {
          className: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Crown className="h-3 w-3" />,
          text: 'Pro+'
        };
      case 'Elite':
        return {
          className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400',
          icon: <Star className="h-3 w-3" />,
          text: 'Elite'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Crown className="h-3 w-3" />,
          text: 'Pro'
        };
    }
  };

  const config = getVariantConfig();
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-semibold flex items-center gap-1`}
    >
      {showIcon && config.icon}
      {config.text}
    </Badge>
  );
};

export default ProBadge;