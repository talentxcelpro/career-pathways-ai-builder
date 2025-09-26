import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Share2, 
  MessageSquare, 
  Edit3, 
  Eye,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Collaborator {
  id: string;
  email: string;
  permission: 'view' | 'edit' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface CollaborationPanelProps {
  resumeId?: string;
  isOwner?: boolean;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  resumeId,
  isOwner = false
}) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);

  const inviteCollaborator = async () => {
    if (!newCollaboratorEmail.trim() || !resumeId || !user) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Mock invitation for now since tables aren't set up yet
      const newCollaborator: Collaborator = {
        id: crypto.randomUUID(),
        email: newCollaboratorEmail.trim(),
        permission: selectedPermission,
        status: 'pending',
        invited_at: new Date().toISOString(),
        user_profile: {
          full_name: newCollaboratorEmail.split('@')[0],
        }
      };
      
      setCollaborators(prev => [...prev, newCollaborator]);
      toast.success('Collaboration invitation sent!');
      setNewCollaboratorEmail('');
    } catch (error: any) {
      console.error('Failed to invite collaborator:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermission = async (collaboratorId: string, permission: 'view' | 'edit') => {
    setCollaborators(prev => 
      prev.map(c => c.id === collaboratorId ? { ...c, permission } : c)
    );
    toast.success('Permission updated successfully');
  };

  const removeCollaborator = async (collaboratorId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    toast.success('Collaborator removed successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'edit':
        return <Edit3 className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Resume Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite New Collaborator */}
        {isOwner && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Collaborator
            </h3>
            
            <div className="flex gap-2">
              <Input
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                placeholder="Enter email address"
                type="email"
                className="flex-1"
              />
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as 'view' | 'edit')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="view">View Only</option>
                <option value="edit">Edit Access</option>
              </select>
              <Button onClick={inviteCollaborator} disabled={isLoading}>
                Invite
              </Button>
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Collaborators</h3>
          
          {collaborators.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No collaborators yet. Invite someone to work on this resume together!
            </p>
          ) : (
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div 
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={collaborator.user_profile?.avatar_url} />
                      <AvatarFallback>
                        {collaborator.user_profile?.full_name?.charAt(0) || collaborator.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">
                        {collaborator.user_profile?.full_name || collaborator.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {collaborator.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(collaborator.status)}
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getPermissionIcon(collaborator.permission)}
                      {collaborator.permission}
                    </Badge>

                    {isOwner && collaborator.status === 'accepted' && (
                      <select
                        value={collaborator.permission}
                        onChange={(e) => updatePermission(collaborator.id, e.target.value as 'view' | 'edit')}
                        className="text-sm px-2 py-1 border rounded"
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                      </select>
                    )}

                    {isOwner && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCollaborator(collaborator.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Share via Message
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Share link copied!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Copy Share Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};