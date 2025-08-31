import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useReelsEngagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async ({ reelId, hasLiked }: { reelId: string; hasLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', reelId)
          .eq('content_type', 'reel');
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            content_id: reelId,
            content_type: 'reel'
          });
        
        if (error) throw error;
      }

      return !hasLiked;
    },
    onSuccess: (newLikeState, variables) => {
      // Update cache optimistically
      queryClient.setQueryData(['reels-feed', user?.id], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((reel: any) =>
              reel.id === variables.reelId
                ? { 
                    ...reel, 
                    has_liked: newLikeState,
                    likes_count: newLikeState 
                      ? reel.likes_count + 1 
                      : Math.max(0, reel.likes_count - 1)
                  }
                : reel
            )
          )
        };
      });
    },
    onError: (error) => {
      console.error('Like error:', error);
      toast.error('Something went wrong');
    }
  });

  const shareMutation = useMutation({
    mutationFn: async ({ reelId, url, title }: { reelId: string; url: string; title: string }) => {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }

      // Track share
      await supabase
        .from('shares')
        .insert({
          user_id: user?.id,
          content_id: reelId,
          content_type: 'reel',
          platform: 'native'
        });
    },
    onSuccess: (_, variables) => {
      // Update share count
      queryClient.setQueryData(['reels-feed', user?.id], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((reel: any) =>
              reel.id === variables.reelId
                ? { ...reel, shares_count: reel.shares_count + 1 }
                : reel
            )
          )
        };
      });
    }
  });

  return {
    likeReel: likeMutation.mutate,
    shareReel: shareMutation.mutate,
    isLiking: likeMutation.isPending,
    isSharing: shareMutation.isPending
  };
};