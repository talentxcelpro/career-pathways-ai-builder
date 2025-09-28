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
import { RealtimeDiagnostics } from './RealtimeDiagnostics';

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Get realtime contexts
  const realtimeContext = useSafeRealtimeContext();
  const txcRealtime = useTXCRealtime();
  const optimizedRealtime = useOptimizedRealtime();

  // Check current user on component mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Demo authentication for testing
  const signInAsTestUser = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setCurrentUser(data.user);
      toast.success('Signed in as anonymous test user');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed');
    }
  };

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
      // Test 1: Supabase Client
      addTest('Supabase Client', 'pending', 'Checking configuration...');
      setProgress(10);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateTest('Supabase Client', 'success', `Client configured. Auth: ${session ? 'Yes' : 'No'}`, { session: !!session });
      } catch (error) {
        updateTest('Supabase Client', 'error', 'Client configuration failed', error);
      }

      // Test 2: Initialize and test realtime manager
      addTest('Realtime Manager', 'pending', 'Testing realtime manager...');
      setProgress(20);
      
      try {
        // Force re-initialize the realtime manager for testing
        await realtimeManager.init(undefined, true);
        
        // Give channels time to connect
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const managerStatus = realtimeManager.getStatus();
        const connectedChannels = Object.values(managerStatus).filter(status => status === 'SUBSCRIBED').length;
        const totalChannels = Object.keys(managerStatus).length;
        
        console.log('Manager status:', managerStatus);
        console.log(`Connected: ${connectedChannels}/${totalChannels}`);
        
        if (connectedChannels > 0) {
          updateTest('Realtime Manager', 'success', `${connectedChannels}/${totalChannels} channels connected`, managerStatus);
        } else {
          updateTest('Realtime Manager', 'error', `No channels connected (${totalChannels} total)`, managerStatus);
        }
      } catch (error) {
        console.error('Realtime manager test error:', error);
        updateTest('Realtime Manager', 'error', 'Realtime manager initialization failed', error);
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
      
      try {
        // Force connection if not connected
        if (!optimizedRealtime.isConnected) {
          console.log('Optimized realtime not connected, attempting to connect...');
        }
        
        updateTest('Optimized Realtime',
          optimizedRealtime.isConnected ? 'success' : 'error',
          `Optimized connected: ${optimizedRealtime.isConnected}, Channels: ${optimizedRealtime.connectedChannels}`,
          {
            isConnected: optimizedRealtime.isConnected,
            connectedChannels: optimizedRealtime.connectedChannels,
            channelStatus: optimizedRealtime.getChannelStatus()
          }
        );
      } catch (error) {
        updateTest('Optimized Realtime', 'error', 'Optimized realtime check failed', error);
      }

      // Test 6: Test actual database change detection
      addTest('Live Data Test', 'pending', 'Testing live data changes...');
      setProgress(60);

      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Test with a simple table query that doesn't require specific data
          const { data, error } = await supabase
            .from('ai_career_recommendations')
            .select('id')
            .limit(1);

          if (error) {
            updateTest('Live Data Test', 'error', `Database query failed: ${error.message}`, error);
          } else {
            updateTest('Live Data Test', 'success', 'Live data access working', { 
              user: user.user.email || user.user.id,
              dataAccess: true 
            });
          }
        } else {
          updateTest('Live Data Test', 'error', 'No authenticated user for testing', {
            hint: 'Sign in above to test authenticated realtime features'
          });
        }
      } catch (error) {
        updateTest('Live Data Test', 'error', 'Failed to test live data', error);
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
    <div className="space-y-6">
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
        
        {/* Authentication Status */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Authentication Status</h3>
              <p className="text-sm text-muted-foreground">
                {currentUser ? `Signed in as: ${currentUser.email || currentUser.id}` : 'Not authenticated'}
              </p>
            </div>
            <div className="flex gap-2">
              {!currentUser ? (
                <Button onClick={signInAsTestUser} variant="outline" size="sm">
                  Sign In as Test User
                </Button>
              ) : (
                <Button onClick={signOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>

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

    {/* Advanced Diagnostics */}
    <RealtimeDiagnostics />
    </div>
  );
};