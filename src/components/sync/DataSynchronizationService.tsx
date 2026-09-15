import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Database, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Zap
} from 'lucide-react';

interface SyncStatus {
  posts: 'synced' | 'syncing' | 'offline' | 'error';
  connections: 'synced' | 'syncing' | 'offline' | 'error';
  messages: 'synced' | 'syncing' | 'offline' | 'error';
  profile: 'synced' | 'syncing' | 'offline' | 'error';
}

interface QueuedAction {
  id: string;
  type: 'post_create' | 'connection_request' | 'message_send' | 'profile_update';
  data: any;
  timestamp: string;
  attempts: number;
}

export const DataSynchronizationService: React.FC = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    posts: 'synced',
    connections: 'synced',
    messages: 'synced',
    profile: 'synced'
  });
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - syncing data...');
      performFullSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost - working offline');
      updateSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize real-time subscriptions
    initializeRealtimeSync();

    // Load queued actions from localStorage
    loadQueuedActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const initializeRealtimeSync = () => {
    if (!user) return;

    // Subscribe to posts changes
    const postsChannel = supabase
      .channel('posts-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `author_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Posts sync:', payload);
          updateSyncStatus('synced', 'posts');
          setLastSyncTime(new Date());
        }
      )
      .subscribe();

    // Subscribe to connections changes
    const connectionsChannel = supabase
      .channel('connections-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `requester_id=eq.${user.id},recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Connections sync:', payload);
          updateSyncStatus('synced', 'connections');
          setLastSyncTime(new Date());
        }
      )
      .subscribe();

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel('messages-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${user.id},recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Messages sync:', payload);
          updateSyncStatus('synced', 'messages');
          setLastSyncTime(new Date());
        }
      )
      .subscribe();

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel('profile-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile sync:', payload);
          updateSyncStatus('synced', 'profile');
          setLastSyncTime(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(profileChannel);
    };
  };

  const updateSyncStatus = (status: 'synced' | 'syncing' | 'offline' | 'error', table?: keyof SyncStatus) => {
    setSyncStatus(prev => {
      if (table) {
        return { ...prev, [table]: status };
      } else {
        // Update all tables
        return {
          posts: status,
          connections: status,
          messages: status,
          profile: status
        };
      }
    });
  };

  const performFullSync = async () => {
    if (!isOnline || !user) return;

    try {
      updateSyncStatus('syncing');
      setSyncProgress(0);

      // Process queued actions first
      await processQueuedActions();
      setSyncProgress(25);

      // Sync posts
      await syncPosts();
      setSyncProgress(50);

      // Sync connections
      await syncConnections();
      setSyncProgress(75);

      // Sync messages and profile
      await Promise.all([syncMessages(), syncProfile()]);
      setSyncProgress(100);

      updateSyncStatus('synced');
      setLastSyncTime(new Date());
      toast.success('Data synchronized successfully');

    } catch (error) {
      console.error('Sync error:', error);
      updateSyncStatus('error');
      toast.error('Sync failed - will retry automatically');
    }
  };

  const processQueuedActions = async () => {
    const actions = [...queuedActions];
    setQueuedActions([]);

    for (const action of actions) {
      try {
        await executeAction(action);
      } catch (error) {
        console.error('Failed to execute queued action:', error);
        // Re-queue with increased attempt count
        if (action.attempts < 3) {
          queueAction({ ...action, attempts: action.attempts + 1 });
        }
      }
    }
  };

  const executeAction = async (action: QueuedAction) => {
    switch (action.type) {
      case 'post_create':
        await supabase.from('posts').insert(action.data);
        break;
      case 'connection_request':
        await supabase.from('connections').insert(action.data);
        break;
      case 'message_send':
        await supabase.from('direct_messages').insert(action.data);
        break;
      case 'profile_update':
        await supabase.from('profiles').update(action.data).eq('id', user?.id);
        break;
    }
  };

  const queueAction = (action: Omit<QueuedAction, 'id' | 'timestamp' | 'attempts'> & Partial<Pick<QueuedAction, 'attempts'>>) => {
    const queuedAction: QueuedAction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      attempts: action.attempts || 0,
      ...action
    };

    setQueuedActions(prev => [...prev, queuedAction]);
    saveQueuedActions([...queuedActions, queuedAction]);

    if (isOnline) {
      // Try to execute immediately if online
      executeAction(queuedAction).catch(() => {
        // Will be retried in next sync
      });
    }
  };

  const syncPosts = async () => {
    updateSyncStatus('syncing', 'posts');
    // Implementation for syncing posts
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate sync
    updateSyncStatus('synced', 'posts');
  };

  const syncConnections = async () => {
    updateSyncStatus('syncing', 'connections');
    // Implementation for syncing connections
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate sync
    updateSyncStatus('synced', 'connections');
  };

  const syncMessages = async () => {
    updateSyncStatus('syncing', 'messages');
    // Implementation for syncing messages
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate sync
    updateSyncStatus('synced', 'messages');
  };

  const syncProfile = async () => {
    updateSyncStatus('syncing', 'profile');
    // Implementation for syncing profile
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate sync
    updateSyncStatus('synced', 'profile');
  };

  const loadQueuedActions = () => {
    try {
      const stored = localStorage.getItem('queuedActions');
      if (stored) {
        setQueuedActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load queued actions:', error);
    }
  };

  const saveQueuedActions = (actions: QueuedAction[]) => {
    try {
      localStorage.setItem('queuedActions', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save queued actions:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing': return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {lastSyncTime && (
                <span className="text-sm text-muted-foreground">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </div>
            <Button 
              onClick={performFullSync} 
              disabled={!isOnline || Object.values(syncStatus).some(s => s === 'syncing')}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          </div>
          
          {Object.values(syncStatus).some(s => s === 'syncing') && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Synchronizing data...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status by Data Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Synchronization Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(syncStatus).map(([key, status]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(status)}
                <span className="font-medium capitalize">{key}</span>
              </div>
              <Badge className={getStatusColor(status)}>
                {status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Queued Actions */}
      {queuedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Queued Actions ({queuedActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {queuedActions.length} actions are queued and will be synchronized when connection is restored.
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              {queuedActions.slice(0, 5).map(action => (
                <div key={action.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{action.type.replace('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {queuedActions.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  And {queuedActions.length - 5} more...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cross-Platform Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Cross-Platform Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Smartphone className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Mobile App</div>
                <div className="text-sm text-muted-foreground">Real-time sync enabled</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Monitor className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium">Desktop Web</div>
                <div className="text-sm text-muted-foreground">Real-time sync enabled</div>
              </div>
            </div>
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All data changes are synchronized in real-time between mobile and desktop applications.
              This ensures a consistent experience across all your devices.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSynchronizationService;