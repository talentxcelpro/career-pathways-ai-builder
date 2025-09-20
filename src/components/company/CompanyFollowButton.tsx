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
    <div className={cn("flex flex-col sm:flex-row items-center gap-2 sm:gap-3", className)}>
      <Button
        variant={isFollowing ? "default" : variant}
        size={size}
        onClick={toggleFollow}
        disabled={isUpdating || !canFollow}
        className={cn(
          "mobile-optimized touch-target w-full sm:w-auto",
          "min-h-[44px] px-4 py-2 text-sm font-medium",
          "transition-all duration-200 ease-in-out",
          "flex items-center justify-center gap-2",
          isFollowing 
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md" 
            : "border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart 
            className={cn(
              "h-4 w-4 transition-all duration-200",
              isFollowing && "fill-current scale-110"
            )} 
          />
        )}
        <span className="font-medium">
          {isFollowing ? 'Subscribed' : 'Subscribe'}
        </span>
      </Button>
      
      {showFollowersCount && followersCount > 0 && (
        <Badge 
          variant="secondary" 
          className={cn(
            "flex items-center gap-1.5 px-3 py-1",
            "bg-muted/80 text-muted-foreground border border-border/50",
            "text-xs font-medium rounded-full"
          )}
        >
          <Users className="h-3 w-3" />
          <span className="hidden sm:inline">
            {followersCount} {followersCount === 1 ? 'subscriber' : 'subscribers'}
          </span>
          <span className="sm:hidden">
            {followersCount}
          </span>
        </Badge>
      )}
    </div>
  );
}