import { useCallback } from 'react';
import { useRealtimeEngagement } from './useRealtimeEngagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Network-specific engagement hook
 * Provides network module specific engagement actions and real-time updates
 */
export const useNetworkEngagement = () => {
  const { user } = useAuth();
  const engagement = useRealtimeEngagement('network');

  // Handle connection requests with engagement tracking
  const sendConnectionRequest = useCallback(async (recipientId: string) => {
    if (!user) return;

    try {
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .single();

      if (existingConnection) {
        toast.error('Connection request already exists or you are already connected');
        return;
      }

      // Create connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        });

      if (error) throw error;

      // Track engagement event
      await engagement.publishEvent(
        'connection_request',
        'user',
        recipientId,
        recipientId
      );

      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  }, [user, engagement]);

  // Handle connection acceptance
  const acceptConnectionRequest = useCallback(async (connectionId: string, requesterId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      // Track engagement event
      await engagement.publishEvent(
        'connection_accepted',
        'user',
        requesterId,
        requesterId
      );

      toast.success('Connection request accepted!');
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection request');
    }
  }, [user, engagement]);

  // Handle post sharing with network tracking
  const sharePost = useCallback(async (postId: string, postOwnerId: string) => {
    if (!user) return;

    try {
      await engagement.shareContent('post', postId, postOwnerId);
      toast.success('Post shared to your network!');
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
    }
  }, [user, engagement]);

  // Get network activity statistics
  const getNetworkStats = useCallback(() => {
    const networkEvents = engagement.events.filter(event => event.module === 'network');
    const recentActivity = networkEvents.filter(event => {
      const eventTime = new Date(event.created_at);
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return eventTime > hourAgo;
    });

    return {
      totalEvents: networkEvents.length,
      recentActivity: recentActivity.length,
      connections: engagement.onlineUsers.size,
      activeUsers: Array.from(engagement.onlineUsers.values()).filter(user => user.is_online).length
    };
  }, [engagement]);

  // Get trending network content
  const getTrendingContent = useCallback(() => {
    const contentMap = new Map<string, { id: string; score: number; type: string }>();
    
    engagement.contentScores.forEach((score, contentId) => {
      // Filter by module through events if available  
      const hasNetworkActivity = engagement.events.some(event => 
        event.event_type.includes('network') || event.event_type.includes('post') || event.event_type.includes('connection')
      );
      
      if (hasNetworkActivity) {
        contentMap.set(contentId, {
          id: contentId,
          score: score.likes_count + score.comments_count + score.shares_count,
          type: score.content_type
        });
      }
    });

    return Array.from(contentMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [engagement]);

  return {
    // Real-time engagement data
    ...engagement,
    
    // Network-specific actions
    sendConnectionRequest,
    acceptConnectionRequest,
    sharePost,
    
    // Network analytics
    getNetworkStats,
    getTrendingContent,
    
    // Connection status
    isConnected: engagement.isConnected,
    onlineUsers: engagement.onlineUsers,
    contentScores: engagement.contentScores
  };
};