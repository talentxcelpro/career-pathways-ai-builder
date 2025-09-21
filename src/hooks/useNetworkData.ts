import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NetworkProfile {
  id: string;
  full_name: string;
  title?: string;
  email: string;
  avatar_url?: string;
  location?: string;
  about?: string;
  linkedin_url?: string;
  is_online?: boolean;
  last_seen?: string;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  profiles?: NetworkProfile;
}

export const useNetworkData = () => {
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);

      // Fetch all profiles for networking discovery
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);

      if (profilesError) throw profilesError;

      // Fetch user's connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_recipient_id_fkey(*)
        `)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (connectionsError) throw connectionsError;

      // Fetch pending connection requests
      const { data: pendingData, error: pendingError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_requester_id_fkey(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      setProfiles(profilesData || []);
      setConnections(connectionsData || []);
      setPendingRequests(pendingData || []);
    } catch (error) {
      console.error('Error fetching network data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch network data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (recipientId: string) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert([{
          recipient_id: recipientId,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully",
      });

      // Refresh data
      fetchNetworkData();
      
      return data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
      throw error;
    }
  };

  const respondToConnection = async (connectionId: string, status: 'accepted' | 'declined') => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Connection Accepted" : "Connection Declined",
        description: `Connection request has been ${status}`,
      });

      // Refresh data
      fetchNetworkData();
      
      return data;
    } catch (error) {
      console.error('Error responding to connection:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    profiles,
    connections,
    pendingRequests,
    loading,
    sendConnectionRequest,
    respondToConnection,
    refreshData: fetchNetworkData
  };
};