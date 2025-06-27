
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useConversations = () => {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use filter to properly check if the user is in the participants array
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!conversations_last_message_id_fkey(
            id,
            content,
            created_at,
            sender_id,
            message_type,
            status
          )
        `)
        .filter('participants', 'cs', `{${user.id}}`)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({ participantIds, isGroup = false, name }: {
      participantIds: string[];
      isGroup?: boolean;
      name?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const allParticipants = [...new Set([user.id, ...participantIds])];

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participants: allParticipants,
          is_group: isGroup,
          name,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create conversation');
    }
  });

  const findOrCreateConversation = async (participantIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const allParticipants = [...new Set([user.id, ...participantIds])].sort();

    // Check if conversation already exists - fix the query here too
    const { data: existingConversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('is_group', false)
      .filter('participants', 'cs', `{${allParticipants.join(',')}}`)
      .filter('participants', 'cd', `{${allParticipants.join(',')}}`);

    // Find exact match by checking if participants arrays are equal
    const existingConversation = existingConversations?.find(conv => 
      conv.participants.length === allParticipants.length &&
      conv.participants.every((p: string) => allParticipants.includes(p))
    );

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    return createConversationMutation.mutateAsync({ participantIds });
  };

  return {
    conversations,
    isLoading,
    createConversation: createConversationMutation.mutate,
    findOrCreateConversation,
    isCreating: createConversationMutation.isPending
  };
};
