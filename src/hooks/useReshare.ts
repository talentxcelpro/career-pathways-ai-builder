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
      // Create the reshare post (triggers will update reshare_count on original)
      const { error: insertError } = await supabase
        .from('posts')
        .insert([{
          author_id: user.id,
          content: comment || null,
          post_type: 'reshare',
          reshared_from_id: originalPostId,
        }]);

      if (insertError) {
        throw insertError;
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