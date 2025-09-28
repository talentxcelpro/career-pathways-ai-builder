import React, { useState } from 'react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getUserAvatarProps } from '@/utils/avatarUtils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Send, 
  ArrowLeft,
  MoreHorizontal,
  Reply
} from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    title?: string;
  };
  content: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  onClose: () => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Sample comments data - in real app this would come from API
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=100&h=100&fit=crop&crop=face',
        title: 'Product Manager at Google'
      },
      content: 'This is exactly what I needed to hear today! Knowledge without application is just trivia.',
      timeAgo: '2h',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: '2',
          user: {
            name: 'Mike Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            title: 'Software Engineer'
          },
          content: 'Absolutely! Implementation is everything.',
          timeAgo: '1h',
          likes: 5,
          isLiked: true
        }
      ]
    },
    {
      id: '3',
      user: {
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        title: 'UX Designer at Meta'
      },
      content: 'Thanks for sharing this insight! It resonates with my experience in design thinking.',
      timeAgo: '3h',
      likes: 8,
      isLiked: false
    }
  ]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: user?.user_metadata?.full_name || 'You',
        avatar: user?.user_metadata?.picture,
        title: 'Professional'
      },
      content: newComment,
      timeAgo: 'now',
      likes: 0,
      isLiked: false
    };

    if (replyTo) {
      // Add as reply
      setComments(prev => prev.map(c => 
        c.id === replyTo 
          ? { ...c, replies: [...(c.replies || []), comment] }
          : c
      ));
      setReplyTo(null);
    } else {
      // Add as new comment
      setComments(prev => [comment, ...prev]);
    }

    setNewComment('');
    toast({
      title: "Comment posted",
      description: "Your comment has been added successfully.",
    });
  };

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(c => 
        c.id === parentId 
          ? {
              ...c,
              replies: c.replies?.map(r => 
                r.id === commentId 
                  ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
                  : r
              )
            }
          : c
      ));
    } else {
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      ));
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo(commentId);
    setNewComment(`@${userName} `);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Comments</h1>
        <div className="w-10" />
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <Card className="border-0 shadow-none bg-gray-50/50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <UserAvatar 
                      src={comment.user.avatar}
                      userName={comment.user.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{comment.user.name}</h4>
                        <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                      </div>
                      {comment.user.title && (
                        <p className="text-xs text-gray-600 mb-2">{comment.user.title}</p>
                      )}
                      <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          {comment.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleReply(comment.id, comment.user.name)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 space-y-2">
                  {comment.replies.map((reply) => (
                    <Card key={reply.id} className="border-0 shadow-none bg-white">
                      <CardContent className="p-3">
                        <div className="flex gap-2">
                          <UserAvatar 
                            src={reply.user.avatar}
                            userName={reply.user.name}
                            size="xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-xs text-gray-900">{reply.user.name}</h5>
                              <span className="text-xs text-gray-500">{reply.timeAgo}</span>
                            </div>
                            <p className="text-xs text-gray-800 leading-relaxed">{reply.content}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-xs"
                                onClick={() => handleLikeComment(reply.id, true, comment.id)}
                              >
                                <Heart className={`h-2 w-2 mr-1 ${reply.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                {reply.likes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="border-t bg-white p-4">
        {replyTo && (
          <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
            Replying to comment...
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-2 h-6 px-2 text-xs"
              onClick={() => {
                setReplyTo(null);
                setNewComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <UserAvatar 
            {...getUserAvatarProps(user)}
            size="sm"
          />
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[40px] max-h-24 resize-none border-gray-200 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="h-10 w-10 rounded-xl shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};