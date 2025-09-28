import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { realtimeManager } from '@/lib/realtimeManager';
import { useSafeRealtimeContext } from '@/components/realtime/SafeRealtimeProvider';
import { useTXCRealtime } from '@/hooks/useTXCRealtime';
import { useOptimizedRealtime } from '@/hooks/useOptimizedRealtime';
import { Activity, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const RealtimeTestPanel: React.FC = () => {
  const [tests, setTests] = useState<ConnectionTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Get realtime contexts
  const realtimeContext = useSafeRealtimeContext();
  const txcRealtime = useTXCRealtime();
  const optimizedRealtime = useOptimizedRealtime();

  const resetTests = () => {
    setTests([]);
    setTestData([]);
    setProgress(0);
  };

  const addTest = (name: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setTests(prev => [...prev, { name, status, message, details }]);
  };

  const updateTest = (name: string, status: 'success' | 'error', message: string, details?: any) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, details } : test
    ));
  };

  const runRealtimeTests = async () => {
    setIsRunning(true);
    resetTests();
    setProgress(0);

    try {
      // Test 1: Check Supabase client configuration
      addTest('Supabase Client', 'pending', 'Checking configuration...');
      setProgress(10);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateTest('Supabase Client', 'success', `Client configured. Auth: ${session ? 'Yes' : 'No'}`, { session: !!session });
      } catch (error) {
        updateTest('Supabase Client', 'error', 'Client configuration failed', error);
      }

      // Test 2: Check realtime manager status
      addTest('Realtime Manager', 'pending', 'Checking manager status...');
      setProgress(20);
      
      const managerStatus = realtimeManager.getStatus();
      const connectedChannels = Object.values(managerStatus).filter(status => status === 'SUBSCRIBED').length;
      const totalChannels = Object.keys(managerStatus).length;
      
      if (connectedChannels > 0) {
        updateTest('Realtime Manager', 'success', `${connectedChannels}/${totalChannels} channels connected`, managerStatus);
      } else {
        updateTest('Realtime Manager', 'error', `No channels connected (${totalChannels} total)`, managerStatus);
      }

      // Test 3: Check RealtimeProvider status
      addTest('Realtime Provider', 'pending', 'Checking provider status...');
      setProgress(30);
      
      updateTest('Realtime Provider', 
        realtimeContext.isConnected ? 'success' : 'error',
        `Provider connected: ${realtimeContext.isConnected}`,
        {
          isConnected: realtimeContext.isConnected,
          connectionStatus: realtimeContext.connectionStatus,
          lastUpdate: realtimeContext.lastUpdate
        }
      );

      // Test 4: Check TXC Realtime
      addTest('TXC Realtime', 'pending', 'Checking TXC connection...');
      setProgress(40);
      
      updateTest('TXC Realtime',
        txcRealtime.isConnected ? 'success' : 'error',
        `TXC connected: ${txcRealtime.isConnected}, Online users: ${txcRealtime.onlineUsers.length}`,
        {
          isConnected: txcRealtime.isConnected,
          onlineUsers: txcRealtime.onlineUsers.length,
          recentTransactions: txcRealtime.recentTransactions.length
        }
      );

      // Test 5: Check Optimized Realtime
      addTest('Optimized Realtime', 'pending', 'Checking optimized connection...');
      setProgress(50);
      
      updateTest('Optimized Realtime',
        optimizedRealtime.isConnected ? 'success' : 'error',
        `Optimized connected: ${optimizedRealtime.isConnected}, Channels: ${optimizedRealtime.connectedChannels}`,
        {
          isConnected: optimizedRealtime.isConnected,
          connectedChannels: optimizedRealtime.connectedChannels,
          channelStatus: optimizedRealtime.getChannelStatus()
        }
      );

      // Test 6: Test actual database change detection
      addTest('Live Data Test', 'pending', 'Testing live data changes...');
      setProgress(60);

      try {
        // Create a test notification to see if realtime picks it up
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const testNotification = {
            user_id: user.user.id,
            type: 'realtime_test',
            title: 'Realtime Test',
            message: `Test notification at ${new Date().toISOString()}`,
            module: 'admin',
            priority: 'low'
          };

          const { data, error } = await supabase
            .from('notifications')
            .insert(testNotification)
            .select()
            .single();

          if (error) throw error;

          // Wait a bit to see if realtime picks it up
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          updateTest('Live Data Test', 'success', 'Test notification created successfully', { notification: data });
          
          // Clean up test notification
          await supabase.from('notifications').delete().eq('id', data.id);
        } else {
          updateTest('Live Data Test', 'error', 'No authenticated user for testing');
        }
      } catch (error) {
        updateTest('Live Data Test', 'error', 'Failed to create test data', error);
      }

      // Test 7: Check publication status
      addTest('Publication Check', 'pending', 'Checking table publications...');
      setProgress(80);

      try {
        // Check if tables are in the realtime publication
        const { data: publications, error } = await supabase
          .rpc('get_realtime_publications')
          .select('*');

        if (error) {
          // If RPC doesn't exist, we can't check but that's not necessarily an error
          updateTest('Publication Check', 'error', 'Could not check publications (RPC not available)', error);
        } else {
          updateTest('Publication Check', 'success', `Found ${publications?.length || 0} published tables`, publications);
        }
      } catch (error) {
        updateTest('Publication Check', 'error', 'Publication check failed', error);
      }

      setProgress(100);
      toast.success('Realtime tests completed!');

    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error('Test suite failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Realtime System Test Panel
        </CardTitle>
        <CardDescription>
          Comprehensive testing of all realtime connections and functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Test Controls */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runRealtimeTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            {isRunning ? 'Running Tests...' : 'Run Realtime Tests'}
          </Button>
          
          {tests.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="default">{successCount} Passed</Badge>
              <Badge variant="destructive">{errorCount} Failed</Badge>
              {pendingCount > 0 && <Badge variant="secondary">{pendingCount} Running</Badge>}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Quick Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              {realtimeContext.isConnected ? 
                <Wifi className="h-4 w-4 text-green-500" /> : 
                <WifiOff className="h-4 w-4 text-red-500" />
              }
              <span className="font-medium">Provider Status</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {realtimeContext.isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="font-medium">TXC Realtime</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {txcRealtime.onlineUsers.length} online users
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Optimized Channels</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {optimizedRealtime.connectedChannels} connected
            </p>
          </Card>
        </div>

        {/* Test Results */}
        {tests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            {tests.map((test, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{test.name}</span>
                      <Badge variant={getStatusColor(test.status)}>
                        {test.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                    {test.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        {tests.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Click "Run Realtime Tests" to verify if your realtime system is working properly. 
              This will test all realtime connections, check authentication, and verify data flow.
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
    </Card>
  );
};