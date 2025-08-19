import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { websocketManager } from '@/utils/websocketManager';

interface FeedItem {
  id: string;
  type: 'post' | 'like' | 'comment' | 'share' | 'connection';
  data: any;
  timestamp: string;
  priority: number;
  seen: boolean;
}

interface FeedUpdate {
  action: 'ADD' | 'UPDATE' | 'DELETE';
  items: FeedItem[];
  timestamp: string;
}

/**
 * Real-time Feed Hook with Incremental Updates
 * Implements pub/sub pattern for live feed updates
 */
export const useRealtimeFeed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<FeedUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const feedQueueRef = useRef<FeedUpdate[]>([]);
  const processingRef = useRef(false);

  // Feed ranking algorithm
  const calculatePriority = useCallback((item: FeedItem): number => {
    const baseScore = {
      post: 10,
      like: 3,
      comment: 5,
      share: 7,
      connection: 8
    }[item.type];

    const ageMinutes = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60);
    const freshnessFactor = Math.max(0, 1 - (ageMinutes / 1440)); // Decay over 24 hours
    
    return baseScore * (1 + freshnessFactor);
  }, []);

  // Process incremental updates with batching
  const processUpdateQueue = useCallback(async () => {
    if (processingRef.current || feedQueueRef.current.length === 0) return;
    
    processingRef.current = true;
    const updates = [...feedQueueRef.current];
    feedQueueRef.current = [];

    try {
      // Batch process updates
      const itemsToAdd: FeedItem[] = [];
      const itemsToUpdate = new Map<string, FeedItem>();
      const itemsToDelete = new Set<string>();

      updates.forEach(update => {
        update.items.forEach(item => {
          const priority = calculatePriority(item);
          const enrichedItem = { ...item, priority };

          switch (update.action) {
            case 'ADD':
              itemsToAdd.push(enrichedItem);
              break;
            case 'UPDATE':
              itemsToUpdate.set(item.id, enrichedItem);
              break;
            case 'DELETE':
              itemsToDelete.add(item.id);
              break;
          }
        });
      });

      setFeedItems(current => {
        let updated = [...current];

        // Apply deletions
        if (itemsToDelete.size > 0) {
          updated = updated.filter(item => !itemsToDelete.has(item.id));
        }

        // Apply updates
        if (itemsToUpdate.size > 0) {
          updated = updated.map(item => 
            itemsToUpdate.has(item.id) ? itemsToUpdate.get(item.id)! : item
          );
        }

        // Add new items
        if (itemsToAdd.length > 0) {
          updated = [...itemsToAdd, ...updated];
          setUnreadCount(prev => prev + itemsToAdd.length);
        }

        // Sort by priority and timestamp
        return updated.sort((a, b) => {
          if (a.priority !== b.priority) return b.priority - a.priority;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      });
    } finally {
      processingRef.current = false;
      // Process any updates that came in while we were processing
      if (feedQueueRef.current.length > 0) {
        setTimeout(processUpdateQueue, 100);
      }
    }
  }, [calculatePriority]);

  // Queue updates for batch processing
  const queueUpdate = useCallback((update: FeedUpdate) => {
    feedQueueRef.current.push(update);
    if (!processingRef.current) {
      // Debounce processing for smooth performance
      setTimeout(processUpdateQueue, 50);
    }
  }, [processUpdateQueue]);

  // Set up real-time subscriptions with optimized event handling
  useEffect(() => {
    if (!user?.id) return;

    const channels: any[] = [];

    // Posts channel - new posts and updates
    const postsChannel = websocketManager.createChannel(`realtime-posts-${user.id}`);
    postsChannel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `visibility=eq.public`
        }, 
        (payload) => {
          console.log('Real-time post update:', payload);
          
          const postData = (payload.new || payload.old) as any;
          const feedItem: FeedItem = {
            id: `post-${postData?.id}`,
            type: 'post',
            data: postData,
            timestamp: postData?.created_at || new Date().toISOString(),
            priority: 0,
            seen: false
          };

          const action = payload.eventType === 'DELETE' ? 'DELETE' : 
                        payload.eventType === 'INSERT' ? 'ADD' : 'UPDATE';

          queueUpdate({
            action,
            items: [feedItem],
            timestamp: new Date().toISOString()
          });
        }
      );
    channels.push(postsChannel);

    // Likes channel - real-time like updates
    const likesChannel = websocketManager.createChannel(`realtime-likes-${user.id}`);
    likesChannel
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          console.log('Real-time like update:', payload);
          
          const likeData = (payload.new || payload.old) as any;
          if (likeData?.user_id !== user.id) { // Don't show own likes
            const feedItem: FeedItem = {
              id: `like-${likeData?.id}`,
              type: 'like',
              data: likeData,
              timestamp: likeData?.created_at || new Date().toISOString(),
              priority: 0,
              seen: false
            };

            queueUpdate({
              action: payload.eventType === 'DELETE' ? 'DELETE' : 'ADD',
              items: [feedItem],
              timestamp: new Date().toISOString()
            });
          }
        }
      );
    channels.push(likesChannel);

    // Comments channel
    const commentsChannel = websocketManager.createChannel(`realtime-comments-${user.id}`);
    commentsChannel
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments'
        },
        (payload) => {
          console.log('Real-time comment update:', payload);
          
          const commentData = (payload.new || payload.old) as any;
          const feedItem: FeedItem = {
            id: `comment-${commentData?.id}`,
            type: 'comment',
            data: commentData,
            timestamp: commentData?.created_at || new Date().toISOString(),
            priority: 0,
            seen: false
          };

          queueUpdate({
            action: payload.eventType === 'DELETE' ? 'DELETE' : 'ADD',
            items: [feedItem],
            timestamp: new Date().toISOString()
          });
        }
      );
    channels.push(commentsChannel);

    // Connection updates
    setIsConnected(true);

    return () => {
      channels.forEach(channel => {
        websocketManager.removeChannel(channel.topic);
      });
      setIsConnected(false);
    };
  }, [user?.id, queueUpdate]);

  // Mark items as seen
  const markAsSeen = useCallback((itemIds: string[]) => {
    setFeedItems(current => 
      current.map(item => 
        itemIds.includes(item.id) ? { ...item, seen: true } : item
      )
    );
    
    setUnreadCount(prev => {
      const unseenItems = feedItems.filter(item => 
        itemIds.includes(item.id) && !item.seen
      );
      return Math.max(0, prev - unseenItems.length);
    });
  }, [feedItems]);

  // Clear all feed items
  const clearFeed = useCallback(() => {
    setFeedItems([]);
    setUnreadCount(0);
    feedQueueRef.current = [];
  }, []);

  // Get feed items by type
  const getItemsByType = useCallback((type: FeedItem['type']) => {
    return feedItems.filter(item => item.type === type);
  }, [feedItems]);

  return {
    feedItems,
    pendingUpdates,
    isConnected,
    unreadCount,
    markAsSeen,
    clearFeed,
    getItemsByType
  };
};