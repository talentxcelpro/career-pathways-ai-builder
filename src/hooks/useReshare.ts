import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useReshare = () => {
  const { user } = useAuth();
  const [isResharing, setIsResharing] = useState(false);

  const resharePost = async (originalPostId: string, comment?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to reshare');
    }

    setIsResharing(true);
    
    try {
      // First, get the original post data
      const { data: originalPost, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', originalPostId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch original post');
      }

      // Create the reshare post
      const reshareData = {
        user_id: user.id,
        content: comment || `Reshared: ${originalPost.title}`,
        post_type: 'reshare',
        reshared_from_id: originalPostId,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('posts')
        .insert([reshareData]);

      if (insertError) {
        throw new Error('Failed to create reshare');
      }

      // Increment the reshare count on the original post
      const { error: updateError } = await supabase
        .rpc('increment_reshare_count', { post_id: originalPostId });

      if (updateError) {
        console.error('Failed to update reshare count:', updateError);
        // Don't throw here as the reshare was successful
      }

      return { success: true };
    } catch (error) {
      console.error('Reshare error:', error);
      throw error;
    } finally {
      setIsResharing(false);
    }
  };

  return {
    resharePost,
    isResharing,
  };
};