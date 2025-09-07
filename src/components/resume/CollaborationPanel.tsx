import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Eye, 
  Edit, 
  MessageCircle,
  Check,
  Trash2,
  Reply,
  MoreHorizontal
} from "lucide-react";
import { useResumeCollaboration, type CollaborationPermission } from '@/hooks/useResumeCollaboration';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CollaborationPanelProps {
  resumeId?: string;
  currentUserId?: string;
  onInvite?: (email: string, role: string) => void;
  onComment?: (content: string, section?: string) => void;
  onShare?: () => void;
}

const PermissionBadge = ({ permission }: { permission: CollaborationPermission }) => {
  const variants = {
    view: { color: 'bg-blue-100 text-blue-800', icon: <Eye className="h-3 w-3" /> },
    comment: { color: 'bg-yellow-100 text-yellow-800', icon: <MessageCircle className="h-3 w-3" /> },
    edit: { color: 'bg-green-100 text-green-800', icon: <Edit className="h-3 w-3" /> }
  };

  const variant = variants[permission];
  
  return (
    <Badge variant="outline" className={`${variant.color} flex items-center space-x-1`}>
      {variant.icon}
      <span className="capitalize">{permission}</span>
    </Badge>
  );
};

const CommentCard = ({ 
  comment, 
  onReply, 
  onResolve, 
  onDelete 
}: {
  comment: any;
  onReply: (content: string, parentId: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent, comment.id);
      setReplyContent('');
      setShowReply(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${comment.is_resolved ? 'opacity-60 bg-gray-50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {comment.user_profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {comment.user_profile?.full_name || 'Anonymous'}
          </span>
          {comment.section_type && (
            <Badge variant="outline" className="text-xs">
              {comment.section_type}
            </Badge>
          )}
          {comment.is_resolved && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!comment.is_resolved && (
                <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowReply(!showReply)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(comment.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{comment.content}</p>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
          {comment.replies.map((reply: any) => (
            <div key={reply.id} className="bg-gray-50 p-3 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {reply.user_profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">
                  {reply.user_profile?.full_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-gray-600">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReply && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowReply(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleReply}>
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CollaborationPanel = ({ 
  resumeId = "default", 
  currentUserId = "current-user",
  onInvite,
  onComment,
  onShare
}: CollaborationPanelProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<CollaborationPermission>('view');
  const [newComment, setNewComment] = useState('');
  const [commentSection, setCommentSection] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  const {
    collaborations,
    comments,
    isLoading,
    inviteCollaborator,
    updatePermission,
    removeCollaborator,
    addComment,
    resolveComment,
    deleteComment,
    isInviting
  } = useResumeCollaboration(resumeId);

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      inviteCollaborator({ email: inviteEmail, permission: invitePermission });
      setInviteEmail('');
      setShowInviteDialog(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment({ 
        content: newComment, 
        sectionType: commentSection || undefined 
      });
      setNewComment('');
      setCommentSection('');
      setShowCommentDialog(false);
    }
  };

  const handleReply = (content: string, parentId: string) => {
    addComment({ content, parentId });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Collaboration</h3>
          <p className="text-sm text-muted-foreground">
            Work together on your resume
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Comment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={commentSection} onValueChange={setCommentSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Info</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="skills">Skills</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Write your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCommentDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddComment}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Collaborator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="collaborator@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Permission Level</label>
                  <Select value={invitePermission} onValueChange={(value: CollaborationPermission) => setInvitePermission(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">Can Comment</SelectItem>
                      <SelectItem value="edit">Can Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInviteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={isInviting}>
                    {isInviting ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Collaborators ({collaborations?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collaborations && collaborations.length > 0 ? (
            <div className="space-y-3">
              {collaborations.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {collab.collaborator_profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {collab.collaborator_profile?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {collab.collaborator_profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PermissionBadge permission={collab.permission_level} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updatePermission({ collaborationId: collab.id, permission: 'view' })}>
                          Change to View Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePermission({ collaborationId: collab.id, permission: 'comment' })}>
                          Change to Comment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePermission({ collaborationId: collab.id, permission: 'edit' })}>
                          Change to Edit
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem 
                          onClick={() => removeCollaborator(collab.id)}
                          className="text-red-600"
                        >
                          Remove Collaborator
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No collaborators yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments ({comments?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onResolve={resolveComment}
                  onDelete={deleteComment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No comments yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};