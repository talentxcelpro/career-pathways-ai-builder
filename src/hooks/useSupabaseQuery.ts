
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Generic hook for Supabase queries with authentication
export const useSupabaseQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    requireAuth?: boolean;
    onError?: (error: Error) => void;
  } = {}
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { requireAuth = true, onError, ...queryOptions } = options;

  return useQuery({
    queryKey,
    queryFn,
    enabled: requireAuth ? !!user && (options.enabled ?? true) : (options.enabled ?? true),
    onError: (error: Error) => {
      console.error(`Query failed for ${queryKey.join('.')}:`, error);
      if (onError) {
        onError(error);
      } else {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      }
    },
    ...queryOptions,
  });
};

// Generic hook for Supabase mutations with authentication
export const useSupabaseMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    requireAuth?: boolean;
  } = {}
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { requireAuth = true, invalidateQueries = [], onSuccess, onError } = options;

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (requireAuth && !user) {
        throw new Error('Authentication required');
      }
      return mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      if (onSuccess) {
        onSuccess(data, variables);
      }
      
      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onError: (error: Error, variables) => {
      console.error('Mutation failed:', error);
      if (onError) {
        onError(error, variables);
      } else {
        toast({
          title: "Error",
          description: error.message || "Operation failed. Please try again.",
          variant: "destructive",
        });
      }
    },
  });
};

// Hook for profile operations
export const useProfile = () => {
  const { user } = useAuth();

  const profileQuery = useSupabaseQuery(
    ['profile', user?.id],
    async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    { enabled: !!user?.id }
  );

  const updateProfileMutation = useSupabaseMutation(
    async (profileData: Partial<any>) => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      },
      invalidateQueries: [['profile', user?.id]],
    }
  );

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
