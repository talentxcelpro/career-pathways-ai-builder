import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFollow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        
        if (error) throw error;
      }

      return !isFollowing;
    },
    onSuccess: (newFollowState, variables) => {
      // Update cache
      queryClient.setQueryData(['reels-feed', user?.id], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((reel: any) =>
              reel.user_id === variables.userId
                ? { ...reel, is_following: newFollowState }
                : reel
            )
          )
        };
      });

      toast.success(newFollowState ? 'Following!' : 'Unfollowed');
    },
    onError: (error) => {
      console.error('Follow error:', error);
      toast.error('Something went wrong');
    }
  });

  return {
    followUser: followMutation.mutate,
    isLoading: followMutation.isPending
  };
};