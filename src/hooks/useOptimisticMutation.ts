import { useMutation, useQueryClient } from '@tanstack/react-query';
import { optimisticUI } from '@/utils/optimisticUI';
import { toast } from 'sonner';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  updateFn: (old: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  updateFn,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Apply optimistic update
      const rollback = optimisticUI.applyUpdate(
        queryClient,
        queryKey,
        (old) => updateFn(old, variables)
      );

      return { rollback };
    },
    onSuccess: (data) => {
      // Confirm optimistic update
      optimisticUI.confirmUpdate(queryKey);
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      onSuccess?.(data);
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context?.rollback) {
        context.rollback();
      }

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error('Something went wrong. Please try again.');
      }

      onError?.(error);
    },
    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// Pre-built optimistic mutations for common actions
export const optimisticMutations = {
  // Like/Unlike post
  useLikePost: (postId: string) => {
    const queryClient = useQueryClient();
    return useOptimisticMutation({
      mutationFn: async ({ isLiked }: { isLiked: boolean }) => {
        // Your API call here
        return { success: true };
      },
      queryKey: ['post', postId],
      updateFn: (old: any, { isLiked }) => ({
        ...old,
        likes_count: (old.likes_count || 0) + (isLiked ? 1 : -1),
        is_liked: isLiked,
      }),
    });
  },

  // Follow/Unfollow user
  useFollowUser: (userId: string) => {
    return useOptimisticMutation({
      mutationFn: async ({ isFollowing }: { isFollowing: boolean }) => {
        // Your API call here
        return { success: true };
      },
      queryKey: ['user', userId],
      updateFn: (old: any, { isFollowing }) => ({
        ...old,
        is_following: isFollowing,
        followers_count: (old.followers_count || 0) + (isFollowing ? 1 : -1),
      }),
      successMessage: 'Profile updated successfully',
    });
  },

  // Add comment
  useAddComment: (postId: string) => {
    return useOptimisticMutation({
      mutationFn: async (comment: any) => {
        // Your API call here
        return comment;
      },
      queryKey: ['comments', postId],
      updateFn: (old: any[], comment) => [
        {
          ...comment,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
        },
        ...old,
      ],
      successMessage: 'Comment added',
    });
  },

  // Update connection status
  useUpdateConnection: (userId: string) => {
    return useOptimisticMutation({
      mutationFn: async ({ status }: { status: string }) => {
        // Your API call here
        return { success: true };
      },
      queryKey: ['connection', userId],
      updateFn: (old: any, { status }) => ({
        ...old,
        status,
      }),
    });
  },
};
