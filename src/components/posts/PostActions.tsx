
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, Users, Link2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmojiReactions } from "./EmojiReactions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface PostActionsProps {
  postId: string;
  initialLikes: number;
  initialComments: number;
  initialShares: number;
  onCommentClick: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  initialLikes,
  initialComments,
  initialShares,
  onCommentClick
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Get user connections for sharing
  const { data: connections } = useQuery({
    queryKey: ['userConnections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get connections where user is either requester or recipient
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select('id, requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Get the user IDs of connections (excluding current user)
      const connectionUserIds = connectionsData.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      );

      if (connectionUserIds.length === 0) return [];

      // Get profiles for these connections
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', connectionUserIds);

      if (profilesError) throw profilesError;

      // Combine connection data with profiles
      return connectionsData.map(conn => {
        const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        const profile = profilesData.find(p => p.id === otherUserId);
        return {
          id: conn.id,
          user: profile || { id: otherUserId, full_name: 'User', profile_picture_url: null, title: 'Professional' }
        };
      });
    }
  });

  // Get real-time counts
  const { data: postCounts } = useQuery({
    queryKey: ['postCounts', postId],
    queryFn: async () => {
      const [likesResponse, commentsResponse, sharesResponse] = await Promise.all([
        supabase
          .from('post_likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('post_comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('post_shares')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId)
      ]);

      return {
        likes: likesResponse.count || 0,
        comments: commentsResponse.count || 0,
        shares: sharesResponse.count || 0
      };
    },
    initialData: {
      likes: initialLikes,
      comments: initialComments,
      shares: initialShares
    }
  });

  // Check if user has liked this post
  const { data: userLike } = useQuery({
    queryKey: ['postLike', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (userLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', userLike.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postLike', postId] });
      queryClient.invalidateQueries({ queryKey: ['postCounts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error('Failed to update like status');
      console.error('Like error:', error);
    }
  });

  // Enhanced share mutation with connections
  const shareMutation = useMutation({
    mutationFn: async ({ withConnections, message }: { withConnections: boolean; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Add regular share record
      const { error: shareError } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (shareError) throw shareError;

      // If sharing with connections, create notifications/messages
      if (withConnections && selectedConnections.length > 0) {
        const notifications = selectedConnections.map(connectionId => ({
          user_id: connectionId,
          type: 'post_share',
          title: 'Post shared with you',
          message: message || 'Someone shared a post with you',
          module: 'network',
          related_id: postId,
          link: `/network/posts`,
          priority: 'medium',
          icon: 'share-2'
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postCounts', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShareDialogOpen(false);
      setShareMessage('');
      setSelectedConnections([]);
      toast.success(selectedConnections.length > 0 ? 'Post shared with connections!' : 'Post shared!');
    },
    onError: (error) => {
      toast.error('Failed to share post');
      console.error('Share error:', error);
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleShare = () => {
    shareMutation.mutate({ withConnections: false });
  };

  const handleShareWithConnections = () => {
    shareMutation.mutate({ 
      withConnections: true, 
      message: shareMessage 
    });
  };

  const toggleConnection = (connectionId: string) => {
    setSelectedConnections(prev => 
      prev.includes(connectionId) 
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  return (
    <div className="border-t pt-4 space-y-3">
      {/* Emoji Reactions */}
      <EmojiReactions postId={postId} />
      
      {/* Traditional Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${userLike ? 'text-red-600' : 'text-gray-600'} hover:text-red-600`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <Heart className={`h-4 w-4 mr-2 ${userLike ? 'fill-current' : ''}`} />
            {postCounts?.likes || 0}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-blue-600"
            onClick={onCommentClick}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {postCounts?.comments || 0}
          </Button>
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-green-600"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {postCounts?.shares || 0}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Quick Share Options */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    disabled={shareMutation.isPending}
                    className="flex-1"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Quick Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied!');
                    }}
                    className="flex-1"
                  >
                    Copy Link
                  </Button>
                </div>

                {/* Share with Connections */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Share with Connections</h4>
                  <Textarea
                    placeholder="Add a message (optional)"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={2}
                    className="mb-3"
                  />
                  
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {connections && connections.length > 0 ? (
                      connections.map((connection) => (
                        <div key={connection.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`connection-${connection.id}`}
                            checked={selectedConnections.includes(connection.user.id)}
                            onCheckedChange={() => toggleConnection(connection.user.id)}
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={connection.user.profile_picture_url} />
                            <AvatarFallback className="text-xs">
                              {connection.user.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {connection.user.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {connection.user.title || 'Professional'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No connections to share with
                      </p>
                    )}
                  </div>

                  {selectedConnections.length > 0 && (
                    <Button 
                      onClick={handleShareWithConnections}
                      disabled={shareMutation.isPending}
                      className="w-full mt-3"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Share with {selectedConnections.length} connection{selectedConnections.length !== 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
