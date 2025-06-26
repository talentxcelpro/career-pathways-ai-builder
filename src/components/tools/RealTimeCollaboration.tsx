
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Share2, 
  MessageCircle, 
  Eye, 
  Edit3,
  Clock,
  User
} from 'lucide-react';

interface CollaborationUser {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  status: 'online' | 'idle' | 'offline';
  current_tool?: string;
  last_activity: string;
}

interface CollaborationSession {
  id: string;
  session_name: string;
  tool_name: string;
  shared_data: any;
  participants: CollaborationUser[];
  created_at: string;
  is_active: boolean;
}

const RealTimeCollaboration = ({ toolName, toolData }: { toolName: string; toolData: any }) => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<CollaborationUser[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCollaborationSessions();
    setupRealTimeUpdates();
    trackUserPresence();
  }, [toolName]);

  const fetchCollaborationSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          *,
          session_participants (
            user_id,
            profiles (full_name, profile_picture_url)
          )
        `)
        .eq('tool_name', toolName)
        .eq('is_active', true);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching collaboration sessions:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('collaboration-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_sessions'
        },
        () => fetchCollaborationSessions()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const trackUserPresence = () => {
    const roomChannel = supabase.channel(`tool-${toolName}`)
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        const users = Object.values(state).flat() as CollaborationUser[];
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Users joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await roomChannel.track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            current_tool: toolName,
            status: 'online',
            last_activity: new Date().toISOString()
          });
        }
      });

    return () => supabase.removeChannel(roomChannel);
  };

  const createSession = async () => {
    if (!sessionName.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          session_name: sessionName,
          tool_name: toolName,
          shared_data: toolData,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      await supabase
        .from('session_participants')
        .insert({
          session_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      setSessionName('');
      fetchCollaborationSessions();
      
      toast({
        title: "Success",
        description: "Collaboration session created successfully!",
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create collaboration session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'participant'
        });

      if (error && error.code !== '23505') throw error; // Ignore duplicate key error

      const session = sessions.find(s => s.id === sessionId);
      setActiveSession(session || null);

      toast({
        title: "Success",
        description: "Joined collaboration session!",
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error",
        description: "Failed to join session.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Online Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Users Online ({onlineUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((user, index) => (
              <div key={index} className="flex items-center space-x-2 bg-green-50 p-2 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.profile_picture_url} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.full_name || 'Anonymous'}</span>
                <Badge variant="secondary" className="text-xs">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Session */}
      <Card>
        <CardHeader>
          <CardTitle>Start Collaboration</CardTitle>
          <CardDescription>Create a new collaboration session for this tool</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Session name..."
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createSession()}
            />
            <Button onClick={createSession} disabled={loading || !sessionName.trim()}>
              <Share2 className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Join existing collaboration sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{session.session_name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{session.participants?.length || 0} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(session.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => joinSession(session.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Session Details */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Active Session: {activeSession.session_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Shared Data</h5>
                <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-32">
                  {JSON.stringify(activeSession.shared_data, null, 2)}
                </pre>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveSession(null)}
              >
                Leave Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeCollaboration;
