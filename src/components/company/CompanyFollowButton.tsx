import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Loader2 } from "lucide-react";
import { useCompanyFollow } from "@/hooks/useCompanyFollow";
import { cn } from "@/lib/utils";

interface CompanyFollowButtonProps {
  companyId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  showFollowersCount?: boolean;
  className?: string;
}

export function CompanyFollowButton({ 
  companyId, 
  size = "default",
  variant = "outline",
  showFollowersCount = true,
  className 
}: CompanyFollowButtonProps) {
  const { 
    isFollowing, 
    followersCount, 
    isLoading, 
    isUpdating, 
    toggleFollow, 
    canFollow 
  } = useCompanyFollow(companyId);

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={isFollowing ? "default" : variant}
        size={size}
        onClick={toggleFollow}
        disabled={isUpdating || !canFollow}
        className={cn(
          "transition-all duration-200",
          isFollowing && "bg-red-500 hover:bg-red-600 text-white"
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Heart 
            className={cn(
              "h-4 w-4 mr-2 transition-all duration-200",
              isFollowing && "fill-current"
            )} 
          />
        )}
        {isFollowing ? 'Subscribed' : 'Subscribe'}
      </Button>
      
      {showFollowersCount && followersCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {followersCount} {followersCount === 1 ? 'subscriber' : 'subscribers'}
        </Badge>
      )}
    </div>
  );
}