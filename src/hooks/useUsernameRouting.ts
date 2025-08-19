import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useUsernameRouting() {
  const { username } = useParams<{ username: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserByUsername = async () => {
      if (!username) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Remove @ symbol if present
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('User not found');
          } else {
            throw error;
          }
        } else {
          setUserId(data.id);
        }
      } catch (err) {
        console.error('Error fetching user by username:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserByUsername();
  }, [username]);

  return {
    userId,
    username,
    isLoading,
    error
  };
}