import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share2, Loader2 } from "lucide-react";
import { useJobInteractions } from "@/hooks/useJobInteractions";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface JobInteractionButtonsProps {
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  showCounts?: boolean;
}

export function JobInteractionButtons({ 
  jobId, 
  jobTitle = "Job",
  companyName = "",
  size = "sm",
  className,
  showCounts = true
}: JobInteractionButtonsProps) {
  const { 
    isLiked,
    isSaved,
    likesCount,
    savesCount,
    sharesCount,
    isLoading,
    isUpdating,
    toggleLike,
    toggleSave,
    recordShare
  } = useJobInteractions(jobId);
  
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: `${jobTitle} at ${companyName}`,
      text: `Check out this job opportunity: ${jobTitle}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        await recordShare();
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        await recordShare();
        toast({
          title: "Link copied",
          description: "Job link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Unable to share this job",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size={size}
        onClick={toggleLike}
        disabled={isUpdating}
        className={cn(
          "flex items-center gap-1 px-2",
          isLiked && "text-red-500 hover:text-red-600"
        )}
      >
        <Heart 
          className={cn(
            "h-4 w-4",
            isLiked && "fill-current"
          )} 
        />
        {showCounts && likesCount > 0 && (
          <span className="text-xs">{likesCount}</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size={size}
        onClick={toggleSave}
        disabled={isUpdating}
        className={cn(
          "flex items-center gap-1 px-2",
          isSaved && "text-blue-500 hover:text-blue-600"
        )}
      >
        <Bookmark 
          className={cn(
            "h-4 w-4",
            isSaved && "fill-current"
          )} 
        />
        {showCounts && savesCount > 0 && (
          <span className="text-xs">{savesCount}</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size={size}
        onClick={handleShare}
        className="flex items-center gap-1 px-2"
      >
        <Share2 className="h-4 w-4" />
        {showCounts && sharesCount > 0 && (
          <span className="text-xs">{sharesCount}</span>
        )}
      </Button>
    </div>
  );
}