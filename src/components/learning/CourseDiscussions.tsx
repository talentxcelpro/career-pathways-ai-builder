import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getAvatarProps } from '@/utils/avatarUtils';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  Pin, 
  MoreVertical,
  Send,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Discussion {
  id: string;
  course_id: string;
  lesson_id?: string;
  user_id: string;
  parent_id?: string;
  title?: string;
  content: string;
  discussion_type: 'question' | 'comment' | 'answer' | 'announcement';
  is_pinned: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
  replies?: Discussion[];
  user_liked?: boolean;
}

interface CourseDiscussionsProps {
  courseId: string;
  lessonId?: string;
  className?: string;
}

export const CourseDiscussions: React.FC<CourseDiscussionsProps> = ({
  courseId,
  lessonId,
  className
}) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'question' | 'comment'>('question');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchDiscussions();
    subscribeToDiscussions();
  }, [courseId, lessonId]);

  const fetchDiscussions = async () => {
    try {
      let query = supabase
        .from('course_discussions')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('course_id', courseId)
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (lessonId) {
        query = query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies } = await supabase
            .from('course_discussions')
            .select(`
              *,
              user:profiles(full_name, avatar_url)
            `)
            .eq('parent_id', discussion.id)
            .order('created_at', { ascending: true });

          return {
            ...discussion,
            replies: replies || []
          };
        })
      );

      setDiscussions(discussionsWithReplies);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToDiscussions = () => {
    const subscription = supabase
      .channel('course_discussions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_discussions',
          filter: `course_id=eq.${courseId}`
        },
        () => {
          fetchDiscussions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleCreatePost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to post');
        return;
      }

      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          lesson_id: lessonId,
          user_id: user.id,
          title: newPostTitle,
          content: newPostContent,
          discussion_type: newPostType
        });

      if (error) throw error;

      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleReply = async (parentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to reply');
        return;
      }

      const { error } = await supabase
        .from('course_discussions')
        .insert({
          course_id: courseId,
          lesson_id: lessonId,
          user_id: user.id,
          parent_id: parentId,
          content: replyContent,
          discussion_type: 'answer'
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const handleLike = async (discussionId: string) => {
    try {
      // In a real implementation, you'd track user likes
      // For now, just increment the count
      const { error } = await supabase
        .from('course_discussions')
        .update({ 
          likes_count: discussions.find(d => d.id === discussionId)?.likes_count! + 1 
        })
        .eq('id', discussionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const getDiscussionIcon = (type: string) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'announcement':
        return '📢';
      case 'answer':
        return '💡';
      default:
        return '💬';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discussions</h2>
        <Button onClick={() => setShowNewPost(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Discussion
        </Button>
      </div>

      {/* New post form */}
      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={newPostType === 'question' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewPostType('question')}
              >
                Question
              </Button>
              <Button
                variant={newPostType === 'comment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewPostType('comment')}
              >
                Comment
              </Button>
            </div>
            
            <Input
              placeholder="Discussion title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
            
            <Textarea
              placeholder="What would you like to discuss?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            
            <div className="flex gap-2">
              <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                Post Discussion
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions list */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id} className="relative">
            {discussion.is_pinned && (
              <div className="absolute top-4 right-4">
                <Pin className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <UserAvatar 
                  {...getAvatarProps(discussion.user)}
                  size="md"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {discussion.user?.full_name || 'Anonymous'}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {getDiscussionIcon(discussion.discussion_type)} 
                      {discussion.discussion_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {discussion.title && (
                    <h3 className="font-semibold text-lg mb-2">
                      {discussion.title}
                    </h3>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">
                {discussion.content}
              </p>
              
              {/* Action buttons */}
              <div className="flex items-center gap-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(discussion.id)}
                  className="gap-1 h-8"
                >
                  <Heart className="h-4 w-4" />
                  {discussion.likes_count || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(discussion.id)}
                  className="gap-1 h-8"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
                
                <span className="text-muted-foreground">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  {discussion.replies?.length || 0} replies
                </span>
              </div>

              {/* Reply form */}
              {replyingTo === discussion.id && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(discussion.id)}
                      disabled={!replyContent.trim()}
                      className="gap-1"
                    >
                      <Send className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {discussion.replies && discussion.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar 
                          {...getAvatarProps(reply.user)}
                          size="xs"
                        />
                        <span className="font-medium text-sm">
                          {reply.user?.full_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap pl-8">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {discussions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No discussions yet
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to start a discussion in this course!
            </p>
            <Button onClick={() => setShowNewPost(true)}>
              Start Discussion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};