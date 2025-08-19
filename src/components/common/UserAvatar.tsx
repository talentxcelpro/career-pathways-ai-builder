import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  userName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  hasUnread?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-32 h-32'
};

const fallbackSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  fallback,
  userName,
  size = 'md',
  className,
  hasUnread = false
}) => {
  const generateInitials = (name?: string) => {
    if (fallback) return fallback;
    if (!name || name === 'Professional User') return 'U';
    
    const names = name.split(' ').filter(n => n.length > 0);
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  // Use valid src only if it's a non-empty string
  const validSrc = src && typeof src === 'string' && src.trim().length > 0 ? src : undefined;

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage 
          src={validSrc} 
          alt={alt || `${userName || 'User'}'s profile picture`} 
        />
        <AvatarFallback className={cn(
          "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-medium",
          fallbackSizeClasses[size]
        )}>
          {generateInitials(userName)}
        </AvatarFallback>
      </Avatar>
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-background rounded-full"></div>
      )}
    </div>
  );
};