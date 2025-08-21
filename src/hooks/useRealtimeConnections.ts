import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeUser {
  id: string;
  full_name: string | null;
  profile_picture_url: string | null;
  headline: string | null;
  title: string | null;
  current_company: string | null;
  location: string | null;
  skills: string[] | null;
  is_online: boolean;
  last_seen: string;
  email: string | null;
}

export function useRealtimeConnections() {
  const { user } = useAuth();
  const [users, setUsers] = useState<RealtimeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Fetch initial users
  const fetchUsers = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get users excluding current user and existing connections
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('recipient_id, requester_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connectedUserIds = existingConnections?.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      ) || [];

      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          profile_picture_url,
          headline,
          title,
          current_company,
          location,
          skills,
          is_online,
          last_seen,
          email
        `)
        .neq('id', user.id);

      // Exclude already connected users
      if (connectedUserIds.length > 0) {
        query = query.not('id', 'in', `(${connectedUserIds.join(',')})`);
      }

      // Filter by online status if requested
      if (showOnlineOnly) {
        query = query.eq('is_online', true);
      }

      const { data, error } = await query
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false })
        .limit(20);

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchUsers();

    // Subscribe to realtime changes on profiles
    const channel = supabase
      .channel('profiles_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedProfile = payload.new as RealtimeUser;
            
            // Update the user in our list if they exist
            setUsers(prevUsers => 
              prevUsers.map(u => 
                u.id === updatedProfile.id 
                  ? { ...u, ...updatedProfile }
                  : u
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, showOnlineOnly]);

  const getLastSeenText = (lastSeen: string): string => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'Over a week ago';
  };

  const sendConnectionRequest = async (recipientId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;

      // Remove user from suggestions after sending request
      setUsers(prev => prev.filter(u => u.id !== recipientId));
      
      return { success: true };
    } catch (error) {
      console.error('Error sending connection request:', error);
      return { success: false, error };
    }
  };

  const filteredUsers = showOnlineOnly 
    ? users.filter(u => u.is_online) 
    : users;

  return {
    users: filteredUsers,
    loading,
    showOnlineOnly,
    setShowOnlineOnly,
    sendConnectionRequest,
    getLastSeenText,
    refetch: fetchUsers
  };
}