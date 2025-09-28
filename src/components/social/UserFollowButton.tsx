import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Users, Loader2 } from "lucide-react";
import { useUserFollow } from "@/hooks/useUserFollow";
import { cn } from "@/lib/utils";

interface UserFollowButtonProps {
  userId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  showFollowersCount?: boolean;
  followersCount?: number;
  showText?: boolean;
  className?: string;
}

export function UserFollowButton({ 
  userId, 
  size = "default",
  variant = "outline",
  showFollowersCount = false,
  followersCount = 0,
  showText = true,
  className 
}: UserFollowButtonProps) {
  const { 
    isFollowing, 
    isLoading, 
    isUpdating, 
    toggleFollow, 
    canFollow 
  } = useUserFollow(userId);

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!canFollow) return null;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2 sm:gap-3", className)}>
      <Button
        variant={isFollowing ? "default" : variant}
        size={size}
        onClick={toggleFollow}
        disabled={isUpdating}
        className={cn(
          "mobile-optimized touch-target w-full sm:w-auto",
          "min-h-[44px] px-4 py-2 text-sm font-medium",
          "transition-all duration-200 ease-in-out",
          "flex items-center justify-center gap-2",
          isFollowing 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md" 
            : "border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {isFollowing ? (
              <UserMinus className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </>
        )}
        {showText && (
          <span className="font-medium">
            {isFollowing ? 'Following' : 'Follow'}
          </span>
        )}
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
            {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
          </span>
          <span className="sm:hidden">
            {followersCount}
          </span>
        </Badge>
      )}
    </div>
  );
}