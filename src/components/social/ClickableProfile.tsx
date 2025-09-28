import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface ClickableProfileProps {
  profile: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    headline?: string;
    current_company?: string;
    username?: string;
    slug?: string;
  };
  showBadge?: boolean;
  showCompany?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const ClickableProfile: React.FC<ClickableProfileProps> = ({
  profile,
  showBadge = true,
  showCompany = true,
  size = 'md',
  className,
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Navigate to profile using slug or username or fallback to ID
    const profilePath = profile.slug || profile.username || profile.id;
    navigate(`/${profilePath}`);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 cursor-pointer hover:bg-accent/5 rounded-lg p-2 transition-colors",
        className
      )}
      onClick={handleClick}
    >
      <Avatar className={cn(sizeClasses[size], "ring-2 ring-white shadow-sm")}>
        <AvatarImage src={profile.profile_picture_url} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {profile.full_name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={cn("font-semibold", textSizeClasses[size])}>{profile.full_name}</h4>
          {showBadge && profile.headline && (
            <Badge variant="secondary" className="text-xs">
              {profile.headline}
            </Badge>
          )}
        </div>
        
        {showCompany && profile.current_company && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            at {profile.current_company}
          </span>
        )}
      </div>
    </div>
  );
};