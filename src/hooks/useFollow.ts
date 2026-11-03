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
        // Unfollow using canonical user_follows table
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        if (error) throw error;
      } else {
        // Follow using canonical user_follows table
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        
        if (error) throw error;
      }

      return !isFollowing;
    },
    onSuccess: (newFollowState, variables) => {
      // Invalidate relevant follow caches across entire application
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });

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
    onError: (error: any) => {
      console.error('Follow error:', error);
      const msg = error?.message || '';
      if (msg.includes('Not authenticated') || msg.includes('permission')) {
        toast.error('Please sign in to follow users.');
      } else {
        toast.error('Unable to update follow. Please try again.');
      }
    }
  });

  return {
    followUser: followMutation.mutate,
    isLoading: followMutation.isPending
  };
};
