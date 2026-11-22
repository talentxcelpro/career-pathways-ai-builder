import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTXCIntegration } from './useTXCIntegration';

export interface NetworkConnectionRecord {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string | null;
  created_at: string | null;
  connected_at: string | null;
  message?: string | null;
}

export interface UserRelationship {
  isSelf: boolean;
  isConnected: boolean;
  isPendingSent: boolean;
  isPendingReceived: boolean;
  isFollowing: boolean;
  followsYou: boolean;
  connectionId?: string;
  status: 'self' | 'connected' | 'pending_sent' | 'pending_received' | 'none' | 'unauthenticated';
}

export function useNetworkRelationships() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { triggerConnectionMade } = useTXCIntegration();

  // 1. Fetch all connection records involving the current user
  const { data: rawConnections = [], isLoading: isConnectionsLoading } = useQuery<NetworkConnectionRecord[]>({
    queryKey: ['network-relationships-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('connections')
        .select('id, requester_id, recipient_id, status, created_at, connected_at, message')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching network relationships connections:', error);
        return [];
      }
      return (data || []) as NetworkConnectionRecord[];
    },
    enabled: !!user?.id,
    staleTime: 10000,
  });

  // 2. Fetch all follows involving the current user
  const { data: rawFollows = { following: [], followers: [] }, isLoading: isFollowsLoading } = useQuery<{
    following: { id: string; following_id: string }[];
    followers: { id: string; follower_id: string }[];
  }>({
    queryKey: ['network-relationships-follows', user?.id],
    queryFn: async () => {
      if (!user?.id) return { following: [], followers: [] };

      const [followingRes, followersRes] = await Promise.all([
        supabase
          .from('user_follows')
          .select('id, following_id')
          .eq('follower_id', user.id),
        supabase
          .from('user_follows')
          .select('id, follower_id')
          .eq('following_id', user.id)
      ]);

      if (followingRes.error) console.error('Error fetching following:', followingRes.error);
      if (followersRes.error) console.error('Error fetching followers:', followersRes.error);

      return {
        following: (followingRes.data || []) as { id: string; following_id: string }[],
        followers: (followersRes.data || []) as { id: string; follower_id: string }[]
      };
    },
    enabled: !!user?.id,
    staleTime: 10000,
  });

  // 3. Realtime subscriptions for connections and follows
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`network-relationships-realtime-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, () => {
        queryClient.invalidateQueries({ queryKey: ['network-relationships-connections'] });
        queryClient.invalidateQueries({ queryKey: ['following-followers-connections'] });
        queryClient.invalidateQueries({ queryKey: ['following-followers-partner-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['userConnections'] });
        queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
        queryClient.invalidateQueries({ queryKey: ['pendingRequestsCount'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_follows' }, () => {
        queryClient.invalidateQueries({ queryKey: ['network-relationships-follows'] });
        queryClient.invalidateQueries({ queryKey: ['following-followers-follows'] });
        queryClient.invalidateQueries({ queryKey: ['following-followers-partner-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['user-follows'] });
        queryClient.invalidateQueries({ queryKey: ['following'] });
        queryClient.invalidateQueries({ queryKey: ['followers'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['following-followers-partner-profiles'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // 4. Construct high-speed lookup maps and sets
  const {
    connectedUserIds,
    pendingSentMap,
    pendingReceivedMap,
    connectionMap,
    followingUserIds,
    followerUserIds,
    acceptedConnectionsList,
    pendingReceivedList,
    pendingSentList
  } = useMemo(() => {
    const connected = new Set<string>();
    const pendingSent = new Map<string, NetworkConnectionRecord>();
    const pendingReceived = new Map<string, NetworkConnectionRecord>();
    const allConn = new Map<string, NetworkConnectionRecord>();

    const acceptedList: NetworkConnectionRecord[] = [];
    const receivedList: NetworkConnectionRecord[] = [];
    const sentList: NetworkConnectionRecord[] = [];

    if (user?.id) {
      for (const conn of rawConnections) {
        const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        if (!otherId) continue;
        allConn.set(otherId, conn);

        if (conn.status === 'accepted') {
          connected.add(otherId);
          acceptedList.push(conn);
        } else if (conn.status === 'pending') {
          if (conn.requester_id === user.id) {
            pendingSent.set(otherId, conn);
            sentList.push(conn);
          } else {
            pendingReceived.set(otherId, conn);
            receivedList.push(conn);
          }
        }
      }
    }

    const following = new Set<string>((rawFollows.following || []).map(f => f.following_id));
    const followers = new Set<string>((rawFollows.followers || []).map(f => f.follower_id));

    return {
      connectedUserIds: connected,
      pendingSentMap: pendingSent,
      pendingReceivedMap: pendingReceived,
      connectionMap: allConn,
      followingUserIds: following,
      followerUserIds: followers,
      acceptedConnectionsList: acceptedList,
      pendingReceivedList: receivedList,
      pendingSentList: sentList
    };
  }, [rawConnections, rawFollows, user?.id]);

  // 5. Lookup helper for any targetUserId
  const getRelationship = useCallback((targetUserId: string): UserRelationship => {
    if (!user?.id) {
      return {
        isSelf: false,
        isConnected: false,
        isPendingSent: false,
        isPendingReceived: false,
        isFollowing: false,
        followsYou: false,
        status: 'unauthenticated'
      };
    }

    if (user.id === targetUserId) {
      return {
        isSelf: true,
        isConnected: false,
        isPendingSent: false,
        isPendingReceived: false,
        isFollowing: false,
        followsYou: false,
        status: 'self'
      };
    }

    const isConnected = connectedUserIds.has(targetUserId);
    const pendingSent = pendingSentMap.get(targetUserId);
    const pendingReceived = pendingReceivedMap.get(targetUserId);
    const isFollowing = followingUserIds.has(targetUserId);
    const followsYou = followerUserIds.has(targetUserId);

    let status: UserRelationship['status'] = 'none';
    let connectionId: string | undefined = undefined;

    if (isConnected) {
      status = 'connected';
      connectionId = connectionMap.get(targetUserId)?.id;
    } else if (pendingSent) {
      status = 'pending_sent';
      connectionId = pendingSent.id;
    } else if (pendingReceived) {
      status = 'pending_received';
      connectionId = pendingReceived.id;
    }

    return {
      isSelf: false,
      isConnected,
      isPendingSent: !!pendingSent,
      isPendingReceived: !!pendingReceived,
      isFollowing,
      followsYou,
      connectionId,
      status
    };
  }, [user?.id, connectedUserIds, pendingSentMap, pendingReceivedMap, followingUserIds, followerUserIds, connectionMap]);

  // 6. Action Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async ({ targetUserId, targetName, message }: { targetUserId: string; targetName?: string; message?: string }) => {
      if (!user) throw new Error('Please sign in to send connection requests');
      if (user.id === targetUserId) throw new Error('Cannot connect with yourself');

      // Check existing
      const existing = connectionMap.get(targetUserId);
      if (existing) {
        if (existing.status === 'accepted') throw new Error('You are already connected');
        if (existing.status === 'pending') throw new Error('A connection request is already pending');
      }

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: targetUserId,
          message: message || `Hi ${targetName || 'there'}, I'd like to connect on TalentXcel!`,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Dispatch notification email
      Promise.all([
        supabase.from('profiles').select('email, full_name').eq('id', targetUserId).maybeSingle(),
        supabase.from('profiles').select('full_name, headline, current_job_title, current_company, location, profile_picture_url').eq('id', user.id).maybeSingle()
      ]).then(([{ data: recProfile }, { data: myProfile }]) => {
        if (recProfile?.email) {
          const myName = myProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'A TalentXcel Member';
          fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recProfile.email,
              recipientName: recProfile.full_name || 'Professional',
              template: 'connection_request',
              priority: 1,
              immediate: true,
              variables: {
                sender_name: myName,
                senderName: myName,
                inviter_name: myName,
                sender_title: myProfile?.headline || myProfile?.current_job_title || '',
                sender_company: myProfile?.current_company || '',
                sender_location: myProfile?.location || '',
                sender_avatar: myProfile?.profile_picture_url || '',
                personal_note: message || '',
                recipient_name: recProfile.full_name || 'Professional'
              }
            })
          }).catch(() => {});
        }
      }).catch(() => {});

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network-relationships-connections'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success(`Connection invitation sent to ${variables.targetName || 'user'}!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to send connection request');
    }
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async ({ connectionId, targetName }: { connectionId: string; targetName?: string }) => {
      if (!user) throw new Error('Please sign in');

      const { data, error } = await supabase
        .from('connections')
        .update({
          status: 'accepted',
          connected_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;

      await triggerConnectionMade().catch(() => {});

      // Dispatch acceptance email
      if (data?.requester_id) {
        Promise.all([
          supabase.from('profiles').select('email, full_name').eq('id', data.requester_id).maybeSingle(),
          supabase.from('profiles').select('full_name, headline, current_job_title, profile_picture_url').eq('id', user.id).maybeSingle()
        ]).then(([{ data: reqProfile }, { data: myProfile }]) => {
          if (reqProfile?.email) {
            const myName = myProfile?.full_name || user.user_metadata?.full_name || 'A TalentXcel Member';
            fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: reqProfile.email,
                recipientName: reqProfile.full_name || 'Professional',
                template: 'connection_accepted',
                priority: 1,
                immediate: true,
                variables: {
                  connection_name: myName,
                  connectionName: myName,
                  sender_name: myName,
                  recipient_name: reqProfile.full_name || 'Professional'
                }
              })
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network-relationships-connections'] });
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success(`You are now connected with ${variables.targetName || 'user'}! 🎉`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to accept connection');
    }
  });

  const declineRequestMutation = useMutation({
    mutationFn: async ({ connectionId }: { connectionId: string; targetName?: string }) => {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-relationships-connections'] });
      toast.info('Connection request declined');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to decline request');
    }
  });

  const withdrawRequestMutation = useMutation({
    mutationFn: async ({ connectionId }: { connectionId: string; targetName?: string }) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-relationships-connections'] });
      toast.success('Connection invitation withdrawn');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to withdraw invitation');
    }
  });

  const removeConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, targetName }: { connectionId: string; targetName?: string }) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network-relationships-connections'] });
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      toast.info(`Removed connection with ${variables.targetName || 'user'}`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to remove connection');
    }
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async ({ targetUserId, targetName }: { targetUserId: string; targetName?: string }) => {
      if (!user) throw new Error('Please sign in to follow professionals');
      if (user.id === targetUserId) throw new Error('Cannot follow yourself');

      const isFollowing = followingUserIds.has(targetUserId);

      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        return { isFollowing: false, targetName };
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;
        return { isFollowing: true, targetName };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['network-relationships-follows'] });
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      if (result.isFollowing) {
        toast.success(`You are now following ${result.targetName || 'user'}`);
      } else {
        toast.info(`Unfollowed ${result.targetName || 'user'}`);
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update follow');
    }
  });

  return {
    currentUser: user,
    isLoading: isConnectionsLoading || isFollowsLoading,
    connectedCount: connectedUserIds.size,
    pendingReceivedCount: pendingReceivedMap.size,
    pendingSentCount: pendingSentMap.size,
    followingCount: followingUserIds.size,
    followersCount: followerUserIds.size,
    getRelationship,
    connect: (targetUserId: string, targetName?: string, message?: string) =>
      sendRequestMutation.mutate({ targetUserId, targetName, message }),
    accept: (connectionId: string, targetName?: string) =>
      acceptRequestMutation.mutate({ connectionId, targetName }),
    decline: (connectionId: string, targetName?: string) =>
      declineRequestMutation.mutate({ connectionId, targetName }),
    withdraw: (connectionId: string, targetName?: string) =>
      withdrawRequestMutation.mutate({ connectionId, targetName }),
    removeConnection: (connectionId: string, targetName?: string) =>
      removeConnectionMutation.mutate({ connectionId, targetName }),
    toggleFollow: (targetUserId: string, targetName?: string) =>
      toggleFollowMutation.mutate({ targetUserId, targetName }),
    isConnecting: sendRequestMutation.isPending,
    isAccepting: acceptRequestMutation.isPending,
    isDeclining: declineRequestMutation.isPending,
    isWithdrawing: withdrawRequestMutation.isPending,
    isRemoving: removeConnectionMutation.isPending,
    isTogglingFollow: toggleFollowMutation.isPending,
  };
}
