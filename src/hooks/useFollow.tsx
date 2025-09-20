import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FollowUserParams {
  userId: string;
  isFollowing?: boolean;
}

export const useFollow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowing }: FollowUserParams) => {
      if (!user) throw new Error('User not authenticated');

      if (isFollowing) {
        // Unfollow the user
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
      } else {
        // Follow the user
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, { isFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Now following!');
    },
    onError: () => {
      toast.error('Failed to update follow status. Please try again.');
    }
  });

  return {
    followUser: followMutation.mutate,
    isLoading: followMutation.isPending
  };
};