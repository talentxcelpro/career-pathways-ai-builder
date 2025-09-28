import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Smile, Laugh, Frown, Angry } from "lucide-react";
import { useCommentReactions } from "@/hooks/useCommentReactions";
import { cn } from "@/lib/utils";

const reactionIcons = {
  like: Heart,
  love: Heart,
  laugh: Laugh,
  sad: Frown,
  angry: Angry,
};

const reactionEmojis = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  sad: "😢",
  angry: "😠",
};

interface CommentReactionsProps {
  commentId: string;
  className?: string;
  compact?: boolean;
}

export function CommentReactions({ 
  commentId, 
  className,
  compact = false 
}: CommentReactionsProps) {
  const { 
    reactions,
    userReaction,
    isLoading,
    isUpdating,
    toggleReaction
  } = useCommentReactions(commentId);

  if (isLoading) return null;

  const hasReactions = Object.values(reactions).some(count => count > 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Quick like button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleReaction('like')}
        disabled={isUpdating}
        className={cn(
          "flex items-center gap-1 px-2 h-8",
          userReaction === 'like' && "text-blue-500 bg-blue-50"
        )}
      >
        <Heart 
          className={cn(
            "h-3 w-3",
            userReaction === 'like' && "fill-current"
          )} 
        />
        {reactions.like > 0 && (
          <span className="text-xs">{reactions.like}</span>
        )}
      </Button>

      {/* Other reaction buttons (show on hover or if compact is false) */}
      {!compact && (
        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
          {Object.entries(reactionEmojis).slice(1).map(([type, emoji]) => {
            const count = reactions[type as keyof typeof reactions];
            const isActive = userReaction === type;
            
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => toggleReaction(type as any)}
                disabled={isUpdating}
                className={cn(
                  "flex items-center gap-1 px-1 h-6 text-xs",
                  isActive && "bg-muted"
                )}
              >
                <span className="text-sm">{emoji}</span>
                {count > 0 && (
                  <span className="text-xs">{count}</span>
                )}
              </Button>
            );
          })}
        </div>
      )}

      {/* Summary of all reactions */}
      {hasReactions && compact && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {Object.entries(reactions).map(([type, count]) => {
            if (count === 0) return null;
            return (
              <span key={type} className="flex items-center gap-1">
                <span>{reactionEmojis[type as keyof typeof reactionEmojis]}</span>
                <span>{count}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
