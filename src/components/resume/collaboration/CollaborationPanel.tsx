import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, MessageCircle, Clock, Users, Link2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface CollaborationPanelProps {
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  section?: string;
}

interface ShareLink {
  id: string;
  email: string;
  permission: 'view' | 'comment' | 'edit';
  status: 'pending' | 'accepted';
  createdAt: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  resumeId,
  isOpen,
  onClose
}) => {
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'comment' | 'edit'>('comment');
  const [newComment, setNewComment] = useState('');
  const [publicLink, setPublicLink] = useState('');

  // Mock data - would come from Supabase in real implementation
  const [comments] = useState<Comment[]>([
    {
      id: '1',
      user: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      content: 'Great experience section! Consider adding more quantifiable achievements.',
      timestamp: '2 hours ago',
      section: 'experience'
    },
    {
      id: '2',
      user: 'Mike Johnson',
      avatar: '/avatars/mike.jpg',
      content: 'The skills section looks comprehensive. Maybe reorganize by relevance?',
      timestamp: '1 day ago',
      section: 'skills'
    }
  ]);

  const [shareLinks] = useState<ShareLink[]>([
    {
      id: '1',
      email: 'mentor@company.com',
      permission: 'comment',
      status: 'accepted',
      createdAt: '2 days ago'
    },
    {
      id: '2',
      email: 'hr@startup.com',
      permission: 'view',
      status: 'pending',
      createdAt: '1 day ago'
    }
  ]);

  const handleShare = async () => {
    if (!shareEmail) return;
    
    // Would integrate with Supabase sharing system
    toast.success(`Resume shared with ${shareEmail}`);
    setShareEmail('');
  };

  const handleGeneratePublicLink = async () => {
    const link = `https://talentxcel.in/resume/public/${resumeId}-${Date.now()}`;
    setPublicLink(link);
    navigator.clipboard.writeText(link);
    toast.success('Public link generated and copied to clipboard!');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    // Would save to Supabase
    toast.success('Comment added successfully!');
    setNewComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resume Collaboration
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="h-full overflow-y-auto">
          <Tabs defaultValue="share" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="share">Share & Permissions</TabsTrigger>
              <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
              <TabsTrigger value="versions">Version History</TabsTrigger>
              <TabsTrigger value="public">Public Sharing</TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Share with Collaborators</h3>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1"
                  />
                  <select 
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value as any)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="view">View Only</option>
                    <option value="comment">Can Comment</option>
                    <option value="edit">Can Edit</option>
                  </select>
                  <Button onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Current Collaborators</h4>
                  {shareLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{link.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {link.permission} access • {link.createdAt}
                        </p>
                      </div>
                      <Badge variant={link.status === 'accepted' ? 'default' : 'secondary'}>
                        {link.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comments & Feedback</h3>
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment or suggestion..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddComment}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback>{comment.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.user}</span>
                          {comment.section && (
                            <Badge variant="outline">{comment.section}</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="versions" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Version History</h3>
                
                <div className="space-y-3">
                  {[
                    { version: 'v2.1', date: '2 hours ago', author: 'You', changes: 'Updated experience section' },
                    { version: 'v2.0', date: '1 day ago', author: 'Sarah Chen', changes: 'Added projects section' },
                    { version: 'v1.9', date: '3 days ago', author: 'You', changes: 'Refined skills layout' },
                    { version: 'v1.8', date: '1 week ago', author: 'Mike Johnson', changes: 'Initial feedback round' }
                  ].map((version, index) => (
                    <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{version.version}</p>
                          <p className="text-sm text-muted-foreground">
                            {version.changes} • by {version.author}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{version.date}</span>
                        {index > 0 && (
                          <Button variant="outline" size="sm">Restore</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="public" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Public Sharing</h3>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Generate Public Link</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a public link that anyone can view without signing in.
                  </p>
                  
                  {publicLink ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input value={publicLink} readOnly className="flex-1" />
                        <Button variant="outline" onClick={() => navigator.clipboard.writeText(publicLink)}>
                          Copy
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>Public link active • Anyone with this link can view</span>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleGeneratePublicLink}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Generate Public Link
                    </Button>
                  )}
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Privacy Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Allow search engines to index this resume</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Show in TalentXcel public resume gallery</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Allow anonymous feedback</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};