import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  useConnectionsRealtime,
  useMessagesRealtime,
  useActivitiesRealtime,
  useTXCRealtime,
  useApplicationsRealtime 
} from '@/hooks/useRealtimeUpdates';
import { RealtimePayload } from '@/lib/realtimeManager';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Briefcase, Users, GraduationCap, UserPlus, MessageSquare } from 'lucide-react';

interface RealtimeEvent {
  id: string;
  table: string;
  eventType: string;
  timestamp: Date;
  data: any;
}

export const RealtimeDemo: React.FC = () => {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const { toast } = useToast();

  // Applications realtime
  useApplicationsRealtime((payload) => {
    addEvent('job_applications', payload);
    toast({
      title: "Application Update",
      description: `Application ${payload.eventType.toLowerCase()}d in real-time!`,
      duration: 3000,
    });
  });

  // Messages realtime
  useMessagesRealtime((payload) => {
    addEvent('messages', payload);
    toast({
      title: "Message Update", 
      description: `Message ${payload.eventType.toLowerCase()}d in real-time!`,
      duration: 3000,
    });
  });

  // Activities realtime
  useActivitiesRealtime((payload) => {
    addEvent('user_activities', payload);
    toast({
      title: "Activity Update",
      description: `Activity ${payload.eventType.toLowerCase()}d in real-time!`,
      duration: 3000,
    });
  });

  // TXC transactions realtime
  useTXCRealtime((payload) => {
    addEvent('txc_transactions', payload);
    toast({
      title: "TXC Update",
      description: `Transaction ${payload.eventType.toLowerCase()}d in real-time!`,
      duration: 3000,
    });
  });

  // Connections realtime
  useConnectionsRealtime((payload) => {
    addEvent('connections', payload);
    toast({
      title: "Connections Update",
      description: `Connection ${payload.eventType.toLowerCase()}d in real-time!`,
      duration: 3000,
    });
  });

  const addEvent = (table: string, payload: RealtimePayload) => {
    const event: RealtimeEvent = {
      id: Date.now().toString(),
      table,
      eventType: payload.eventType,
      timestamp: new Date(),
      data: payload
    };
    
    setEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  };

  const getEventIcon = (table: string) => {
    switch (table) {
      case 'jobs': return <Briefcase className="h-4 w-4" />;
      case 'network': return <MessageSquare className="h-4 w-4" />;
      case 'profiles': return <Users className="h-4 w-4" />;
      case 'colleges': return <GraduationCap className="h-4 w-4" />;
      case 'connections': return <UserPlus className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  const triggerTestUpdate = async () => {
    if (!testMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test message first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a test post to trigger realtime update
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            content: `Real-time test: ${testMessage}`,
            post_type: 'text',
            visibility: 'public'
          }
        ]);

      if (error) throw error;

      setTestMessage('');
      toast({
        title: "Test Triggered",
        description: "Created a test post - watch for real-time update!",
      });
    } catch (error) {
      console.error('Error creating test post:', error);
      toast({
        title: "Error",
        description: "Failed to create test post",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          TalentXcel Real-time Updates
        </CardTitle>
        <CardDescription>
          Live demonstration of real-time updates across all TalentXcel modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Real-time Updates</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter a test message to create a post..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="min-h-[60px]"
            />
            <Button onClick={triggerTestUpdate} className="shrink-0">
              Trigger Test
            </Button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Recent Events ({events.length})</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEvents([])}
            >
              Clear
            </Button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No real-time events yet.</p>
                <p className="text-sm">Trigger a test or make changes in other tabs!</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.table)}
                    <Badge variant={getEventColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm capitalize">
                      {event.table} Updated
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {event.data.table}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Module Status */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t">
          <div className="text-center p-2">
            <div className="text-sm font-medium">Jobs Module</div>
            <div className="text-xs text-muted-foreground">Real-time enabled</div>
          </div>
          <div className="text-center p-2">
            <div className="text-sm font-medium">Network Module</div>
            <div className="text-xs text-muted-foreground">Real-time enabled</div>
          </div>
          <div className="text-center p-2">
            <div className="text-sm font-medium">Colleges Module</div>
            <div className="text-xs text-muted-foreground">Real-time enabled</div>
          </div>
          <div className="text-center p-2">
            <div className="text-sm font-medium">Connections Module</div>
            <div className="text-xs text-muted-foreground">Real-time enabled</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};