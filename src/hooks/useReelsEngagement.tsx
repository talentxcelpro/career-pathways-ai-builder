import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LikeReelParams {
  reelId: string;
  hasLiked?: boolean;
}

interface ShareReelParams {
  reelId: string;
  url: string;
  title?: string;
}

export const useReelsEngagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async ({ reelId, hasLiked }: LikeReelParams) => {
      if (!user) throw new Error('User not authenticated');

      if (hasLiked) {
        // Unlike the reel
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', reelId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like the reel
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: reelId,
            user_id: user.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
    onError: () => {
      toast.error('Failed to update like. Please try again.');
    }
  });

  const shareMutation = useMutation({
    mutationFn: async ({ reelId, url, title }: ShareReelParams) => {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Check out this reel',
          url: url
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }

      // Track the share
      if (user) {
        await supabase
          .from('post_shares')
          .insert({
            post_id: reelId,
            user_id: user.id
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
    onError: () => {
      toast.error('Failed to share reel. Please try again.');
    }
  });

  return {
    likeReel: likeMutation.mutate,
    shareReel: shareMutation.mutate,
    isLiking: likeMutation.isPending,
    isSharing: shareMutation.isPending
  };
};