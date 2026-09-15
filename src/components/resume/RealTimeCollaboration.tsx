import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Video, MessageSquare, Share2, Edit3, Eye,
  Clock, Bell, Check, X, UserPlus, Crown, Shield,
  Zap, Globe, Lock, AlertCircle, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastActive: Date;
  isTyping?: boolean;
  cursor?: { x: number; y: number };
}

interface CollaborationActivity {
  id: string;
  user: Collaborator;
  action: 'joined' | 'left' | 'edited' | 'commented' | 'shared';
  timestamp: Date;
  details?: string;
}

interface RealTimeCollaborationProps {
  resumeId: string;
  isOwner: boolean;
  className?: string;
}

export const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  resumeId,
  isOwner,
  className
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'online',
      lastActive: new Date(),
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'editor',
      status: 'online',
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      isTyping: true
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'viewer',
      status: 'away',
      lastActive: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  const [activities, setActivities] = useState<CollaborationActivity[]>([
    {
      id: '1',
      user: collaborators[1],
      action: 'edited',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      details: 'Updated work experience section'
    },
    {
      id: '2',
      user: collaborators[2],
      action: 'commented',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      details: 'Added feedback on skills section'
    }
  ]);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('viewer');
  const [showActivity, setShowActivity] = useState(false);

  const handleInviteUser = useCallback(async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);
    
    try {
      // Mock invitation process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviting(false);
    } catch (error) {
      toast.error('Failed to send invitation');
      setIsInviting(false);
    }
  }, [inviteEmail]);

  const updateUserRole = useCallback((userId: string, newRole: 'editor' | 'viewer') => {
    setCollaborators(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast.success('User role updated');
  }, []);

  const removeCollaborator = useCallback((userId: string) => {
    setCollaborators(prev => prev.filter(user => user.id !== userId));
    toast.success('User removed from collaboration');
  }, []);

  const onlineCollaborators = collaborators.filter(c => c.status === 'online');
  const roleIcons = {
    owner: <Crown className="h-3 w-3 text-yellow-500" />,
    editor: <Edit3 className="h-3 w-3 text-blue-500" />,
    viewer: <Eye className="h-3 w-3 text-gray-500" />
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Live Collaboration Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Live Collaboration
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActivity(!showActivity)}
                className="flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                Activity
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Video className="h-3 w-3 mr-1" />
                Meet
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {onlineCollaborators.slice(0, 4).map((user) => (
                <div key={user.id} className="relative">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                    statusColors[user.status]
                  )} />
                  {user.isTyping && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
              {onlineCollaborators.length > 4 && (
                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium">+{onlineCollaborators.length - 4}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {onlineCollaborators.length} online
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators Management */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({collaborators.length})
          </CardTitle>
          {isOwner && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Invite
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite Section */}
          {isOwner && (
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <Button 
                    onClick={handleInviteUser}
                    disabled={isInviting}
                    size="sm"
                  >
                    {isInviting ? 'Sending...' : 'Invite'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collaborators List */}
          <div className="space-y-3">
            {collaborators.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                      statusColors[user.status]
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{user.name}</span>
                      {roleIcons[user.role]}
                      {user.isTyping && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          <Edit3 className="h-2 w-2 mr-1" />
                          Typing...
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <span className="text-xs text-muted-foreground block">
                      Last active: {user.lastActive.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                  {isOwner && user.role !== 'owner' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateUserRole(user.id, user.role === 'editor' ? 'viewer' : 'editor')}
                        className="h-6 w-6 p-0"
                      >
                        {user.role === 'editor' ? <Eye className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaborator(user.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      {showActivity && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{activity.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {activity.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaboration Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live sync active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              All changes saved
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};