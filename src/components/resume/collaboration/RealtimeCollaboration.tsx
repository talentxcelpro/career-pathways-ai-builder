import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  Eye, 
  Edit3,
  Copy,
  UserPlus,
  Bell,
  Clock
} from 'lucide-react';
import { EditorResume } from '@/types/editor-resume';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'offline';
  lastSeen: Date;
  cursor?: {
    section: string;
    position: { x: number; y: number };
  };
}

interface RealtimeChange {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  timestamp: Date;
  section: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

interface RealtimeCollaborationProps {
  resume: EditorResume;
  onResumeChange: (resume: EditorResume) => void;
  isOwner?: boolean;
  className?: string;
}

export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  resume,
  onResumeChange,
  isOwner = true,
  className = ""
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [changes, setChanges] = useState<RealtimeChange[]>([]);
  const [shareUrl, setShareUrl] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Initialize realtime collaboration
    initializeCollaboration();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const initializeCollaboration = async () => {
    // Create shareable URL
    const resumeId = resume.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
    const url = `${window.location.origin}/resume/collaborate/${resumeId}`;
    setShareUrl(url);

    // Set up realtime channel
    channelRef.current = supabase
      .channel(`resume-${resumeId}`)
      .on('broadcast', { event: 'cursor-move' }, (payload) => {
        updateCollaboratorCursor(payload);
      })
      .on('broadcast', { event: 'resume-change' }, (payload) => {
        handleRealtimeChange(payload);
      })
      .on('broadcast', { event: 'collaborator-join' }, (payload) => {
        addCollaborator(payload.collaborator);
      })
      .on('broadcast', { event: 'collaborator-leave' }, (payload) => {
        removeCollaborator(payload.collaboratorId);
      })
      .subscribe();

    // Add mock collaborators for demo
    setCollaborators([
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'editor',
        status: 'online',
        lastSeen: new Date(),
        cursor: { section: 'experience', position: { x: 100, y: 200 } }
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@example.com', 
        role: 'viewer',
        status: 'online',
        lastSeen: new Date()
      }
    ]);

    // Add mock changes
    setChanges([
      {
        id: '1',
        collaboratorId: '1',
        collaboratorName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 300000),
        section: 'experience',
        action: 'edit',
        description: 'Updated job title at Google',
        oldValue: 'Software Developer',
        newValue: 'Senior Software Engineer'
      },
      {
        id: '2',
        collaboratorId: '2',
        collaboratorName: 'Mike Chen',
        timestamp: new Date(Date.now() - 600000),
        section: 'skills',
        action: 'add',
        description: 'Added React Native skill',
        newValue: 'React Native'
      }
    ]);
  };

  const updateCollaboratorCursor = (payload: any) => {
    setCollaborators(prev => prev.map(collab => 
      collab.id === payload.collaboratorId 
        ? { ...collab, cursor: payload.cursor }
        : collab
    ));
  };

  const handleRealtimeChange = (payload: any) => {
    const change: RealtimeChange = {
      ...payload,
      timestamp: new Date(payload.timestamp)
    };
    
    setChanges(prev => [change, ...prev.slice(0, 9)]); // Keep last 10 changes
    
    // Apply change to resume
    if (payload.resumeData) {
      onResumeChange(payload.resumeData);
      toast.info(`${payload.collaboratorName} made a change`, {
        description: payload.description
      });
    }
  };

  const addCollaborator = (collaborator: Collaborator) => {
    setCollaborators(prev => [...prev, collaborator]);
    toast.success(`${collaborator.name} joined the collaboration`);
  };

  const removeCollaborator = (collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    if (collaborator) {
      toast.info(`${collaborator.name} left the collaboration`);
    }
  };

  const shareResume = async () => {
    setIsSharing(true);
    try {
      // In real implementation, save resume to shared storage
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share link');
    } finally {
      setIsSharing(false);
    }
  };

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // In real implementation, send invitation email
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const removeCollaboratorById = (id: string) => {
    if (!isOwner) {
      toast.error('Only the owner can remove collaborators');
      return;
    }
    
    const collaborator = collaborators.find(c => c.id === id);
    setCollaborators(prev => prev.filter(c => c.id !== id));
    
    if (collaborator) {
      toast.success(`Removed ${collaborator.name} from collaboration`);
    }
  };

  const changeCollaboratorRole = (id: string, newRole: 'editor' | 'viewer') => {
    if (!isOwner) {
      toast.error('Only the owner can change roles');
      return;
    }

    setCollaborators(prev => prev.map(collab => 
      collab.id === id ? { ...collab, role: newRole } : collab
    ));
    
    const collaborator = collaborators.find(c => c.id === id);
    if (collaborator) {
      toast.success(`Changed ${collaborator.name}'s role to ${newRole}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Collaboration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration ({collaborators.length + 1})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Share Controls */}
            <div className="flex gap-2">
              <Button onClick={shareResume} disabled={isSharing} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                {isSharing ? 'Copying...' : 'Copy Share Link'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowChanges(!showChanges)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Changes ({changes.length})
              </Button>
            </div>

            {/* Invite New Collaborator */}
            {isOwner && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email to invite..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && inviteCollaborator()}
                />
                <Button onClick={inviteCollaborator}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Owner (current user) */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">You (Owner)</p>
                  <p className="text-sm text-muted-foreground">Owner</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
              <Badge className={getRoleColor('owner')}>Owner</Badge>
            </div>

            {/* Other Collaborators */}
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {collaborator.avatar ? (
                      <AvatarImage src={collaborator.avatar} />
                    ) : (
                      <AvatarFallback>
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{collaborator.name}</p>
                    <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-xs ${
                      collaborator.status === 'online' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {collaborator.status === 'online' ? 'Online' : formatTimeAgo(collaborator.lastSeen)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(collaborator.role)}>
                    {collaborator.role}
                  </Badge>
                  
                  {collaborator.cursor && (
                    <Badge variant="outline" className="text-xs">
                      <Edit3 className="h-3 w-3 mr-1" />
                      {collaborator.cursor.section}
                    </Badge>
                  )}
                  
                  {isOwner && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeCollaboratorRole(
                          collaborator.id, 
                          collaborator.role === 'editor' ? 'viewer' : 'editor'
                        )}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCollaboratorById(collaborator.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      {showChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {changes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No changes yet
                </p>
              ) : (
                changes.map((change) => (
                  <div key={change.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {change.collaboratorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{change.collaboratorName}</span>
                        {' '}{change.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {change.section}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(change.timestamp)}
                        </span>
                      </div>
                      {change.oldValue && change.newValue && (
                        <div className="mt-2 text-xs">
                          <span className="text-red-600 line-through">{change.oldValue}</span>
                          {' → '}
                          <span className="text-green-600">{change.newValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
