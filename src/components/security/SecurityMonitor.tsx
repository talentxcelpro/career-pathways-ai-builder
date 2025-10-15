import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata: any;
}

/**
 * Security monitoring component for admins
 * Displays recent security events and system health
 */
export const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityEvents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching security events:', error);
          return;
        }

        setEvents(data || []);
      } catch (error) {
        console.error('Security monitor error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityEvents();

    // Subscribe to realtime security events
    const channel = supabase
      .channel('security_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events'
        },
        (payload) => {
          setEvents((prev) => [payload.new as SecurityEvent, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading security events...</p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('blocked')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (eventType.includes('success') || eventType.includes('verified')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent security events</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {getSeverityIcon(event.event_type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{event.description}</p>
                  {event.metadata?.severity && (
                    <Badge 
                      variant={event.metadata.severity === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {event.metadata.severity}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
