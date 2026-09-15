import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Share2, MessageSquare, Star, Send, Eye,
  UserPlus, Link, Mail, ThumbsUp, ThumbsDown, 
  Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  created_at: string;
  section: string;
  is_resolved: boolean;
  likes: number;
  is_suggestion: boolean;
}

interface CollaborationFeaturesProps {
  resumeId: string;
  onAddComment: (comment: Omit<Comment, 'id' | 'created_at'>) => void;
  className?: string;
}

export const CollaborationFeatures: React.FC<CollaborationFeaturesProps> = ({
  resumeId,
  onAddComment,
  className
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedSection, setSelectedSection] = useState('general');
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const sections = [
    { id: 'general', label: 'General', icon: MessageSquare },
    { id: 'header', label: 'Header', icon: Users },
    { id: 'summary', label: 'Summary', icon: Star },
    { id: 'experience', label: 'Experience', icon: Star },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'education', label: 'Education', icon: Star }
  ];

  useEffect(() => {
    loadComments();
  }, [resumeId]);

  const loadComments = async () => {
    try {
      // Mock data for now since database tables don't exist yet
      const mockComments = [
        {
          id: '1',
          content: 'Great resume! Consider adding more quantifiable achievements.',
          author: { id: '1', name: 'John Expert', avatar: '' },
          created_at: new Date().toISOString(),
          section: 'general',
          is_resolved: false,
          likes: 3,
          is_suggestion: false
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        author: { id: 'current', name: 'You', avatar: '' },
        created_at: new Date().toISOString(),
        section: selectedSection,
        is_resolved: false,
        likes: 0,
        is_suggestion: false
      };

      setComments([newCommentObj, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const shareResume = async () => {
    if (!shareEmail.trim()) return;

    setIsSharing(true);
    try {
      const { error } = await supabase.functions.invoke('share-resume', {
        body: {
          resumeId,
          email: shareEmail,
          permission: 'comment' // comment, edit, view
        }
      });

      if (error) throw error;

      setShareEmail('');
      setShowShareDialog(false);
      toast.success('Resume shared successfully');
    } catch (error) {
      console.error('Failed to share resume:', error);
      toast.error('Failed to share resume');
    } finally {
      setIsSharing(false);
    }
  };

  const updateCommentStatus = async (commentId: string, resolved: boolean) => {
    try {
      // Update local state since we're using mock data
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, is_resolved: resolved } : comment
      ));

      toast.success(resolved ? 'Comment resolved' : 'Comment reopened');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Share Resume */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Share2 className="h-5 w-5 mr-2 text-blue-600" />
            Share for Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && shareResume()}
            />
            <Button 
              onClick={shareResume}
              disabled={isSharing || !shareEmail.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Link className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Expert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Comments & Feedback ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={selectedSection === section.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(section.id)}
                  className={cn(
                    "text-xs",
                    selectedSection === section.id && "bg-blue-600 text-white"
                  )}
                >
                  {section.label}
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Textarea
                placeholder="Add your feedback or suggestion..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[80px] resize-none"
              />
              <Button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <Card key={comment.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>
                        {comment.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.author.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {comment.section}
                          </Badge>
                          <Badge 
                            className={cn(
                              "text-xs",
                              comment.is_resolved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {comment.is_resolved ? 'Resolved' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm">{comment.content}</p>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCommentStatus(comment.id, !comment.is_resolved)}
                          className="text-xs h-7"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {comment.is_resolved ? 'Reopen' : 'Resolve'}
                        </Button>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500">{comment.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No comments yet</p>
                <p className="text-sm text-gray-400">Share your resume to get feedback from others</p>
              </div>
            )}
          </div>

          {/* Comment Stats */}
          {comments.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-yellow-600">
                    {comments.filter(c => !c.is_resolved).length}
                  </div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {comments.filter(c => c.is_resolved).length}
                  </div>
                  <div className="text-xs text-gray-600">Resolved</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};