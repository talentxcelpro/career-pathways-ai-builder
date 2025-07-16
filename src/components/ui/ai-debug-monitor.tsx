import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react';

interface DebugLog {
  timestamp: string;
  type: 'auth' | 'connectivity' | 'request' | 'response' | 'error' | 'info';
  message: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: any;
}

export const AIDebugMonitor = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [connectivityStatus, setConnectivityStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [isVisible, setIsVisible] = useState(false);

  const addLog = (log: Omit<DebugLog, 'timestamp'>) => {
    setLogs(prev => [{
      ...log,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 19)]); // Keep only last 20 logs
  };

  const checkAuthStatus = async () => {
    addLog({ type: 'auth', message: 'Checking authentication status...', status: 'info' });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setAuthStatus('unauthenticated');
        addLog({ 
          type: 'auth', 
          message: `Auth error: ${error.message}`, 
          status: 'error',
          details: error 
        });
        return;
      }
      
      if (!session) {
        setAuthStatus('unauthenticated');
        addLog({ type: 'auth', message: 'No active session', status: 'warning' });
        return;
      }
      
      setAuthStatus('authenticated');
      addLog({ 
        type: 'auth', 
        message: `Authenticated as ${session.user.email}`, 
        status: 'success',
        details: {
          email: session.user.email,
          expires_at: new Date(session.expires_at * 1000),
          token_preview: session.access_token.substring(0, 20) + '...'
        }
      });
      
      // Check token expiry
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = session.expires_at - now;
      
      if (timeUntilExpiry < 300) {
        addLog({ 
          type: 'auth', 
          message: `Token expires in ${Math.floor(timeUntilExpiry / 60)} minutes`, 
          status: 'warning' 
        });
      }
      
    } catch (err) {
      setAuthStatus('unauthenticated');
      addLog({ 
        type: 'auth', 
        message: `Auth check failed: ${err.message}`, 
        status: 'error',
        details: err 
      });
    }
  };

  const checkConnectivity = async () => {
    addLog({ type: 'connectivity', message: 'Testing Edge Function connectivity...', status: 'info' });
    
    try {
      const result = await supabase.functions.invoke('test-function', {
        body: { test: true, timestamp: Date.now() }
      });
      
      if (result.error) {
        setConnectivityStatus('offline');
        addLog({ 
          type: 'connectivity', 
          message: `Test function failed: ${result.error.message}`, 
          status: 'error',
          details: result.error 
        });
        return;
      }
      
      setConnectivityStatus('online');
      addLog({ 
        type: 'connectivity', 
        message: 'Edge Function connectivity successful', 
        status: 'success',
        details: result.data 
      });
      
    } catch (err) {
      setConnectivityStatus('offline');
      addLog({ 
        type: 'connectivity', 
        message: `Connectivity test failed: ${err.message}`, 
        status: 'error',
        details: err 
      });
    }
  };

  const testAIFunction = async () => {
    addLog({ type: 'request', message: 'Testing AI agent function (requires auth)...', status: 'info' });
    
    try {
      const result = await supabase.functions.invoke('ai-agent', {
        body: {
          module: 'test',
          task: 'ping',
          input: { test: true }
        }
      });
      
      if (result.error) {
        let errorMessage = `AI function failed: ${result.error.message}`;
        let shouldRetry = false;
        
        // Check for authentication issues
        if (result.error.message?.includes('401') || result.error.message?.includes('403')) {
          errorMessage += ' (Authentication issue detected)';
          shouldRetry = true;
        }
        
        addLog({ 
          type: 'request', 
          message: errorMessage, 
          status: 'error',
          details: result.error 
        });
        
        // Try token refresh if auth issue
        if (shouldRetry) {
          addLog({ type: 'auth', message: 'Attempting token refresh...', status: 'info' });
          
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            addLog({ 
              type: 'auth', 
              message: `Token refresh failed: ${refreshError.message}`, 
              status: 'error',
              details: refreshError 
            });
            return;
          }
          
          addLog({ type: 'auth', message: 'Token refreshed, retrying AI function...', status: 'success' });
          
          // Retry the request
          const retryResult = await supabase.functions.invoke('ai-agent', {
            body: {
              module: 'test',
              task: 'ping',
              input: { test: true }
            }
          });
          
          if (retryResult.error) {
            addLog({ 
              type: 'request', 
              message: `AI function still failed after refresh: ${retryResult.error.message}`, 
              status: 'error',
              details: retryResult.error 
            });
            return;
          }
          
          addLog({ 
            type: 'response', 
            message: 'AI function succeeded after token refresh', 
            status: 'success',
            details: retryResult.data 
          });
        }
        
        return;
      }
      
      addLog({ 
        type: 'response', 
        message: 'AI function responded successfully', 
        status: 'success',
        details: result.data 
      });
      
    } catch (err) {
      addLog({ 
        type: 'error', 
        message: `AI function test failed: ${err.message}`, 
        status: 'error',
        details: err 
      });
    }
  };

  const runFullDiagnostic = async () => {
    setLogs([]);
    addLog({ type: 'info', message: 'Starting comprehensive diagnostic...', status: 'info' });
    
    // Step 1: Check authentication
    await checkAuthStatus();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Test basic connectivity (no auth required)
    await checkConnectivity();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Test authenticated AI function
    if (authStatus === 'authenticated') {
      await testAIFunction();
    } else {
      addLog({ 
        type: 'request', 
        message: 'Skipping AI function test - authentication required', 
        status: 'warning' 
      });
    }
    
    addLog({ 
      type: 'info', 
      message: 'Diagnostic complete', 
      status: authStatus === 'authenticated' && connectivityStatus === 'online' ? 'success' : 'warning' 
    });
  };

  useEffect(() => {
    if (isVisible) {
      runFullDiagnostic();
    }
  }, [isVisible]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          🔍 AI Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">AI Debug Monitor</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
          
          {/* Status Overview */}
          <div className="flex gap-2 mt-2">
            <Badge variant={authStatus === 'authenticated' ? 'default' : 'destructive'} className="text-xs">
              Auth: {authStatus}
            </Badge>
            <Badge variant={connectivityStatus === 'online' ? 'default' : 'destructive'} className="text-xs">
              {connectivityStatus === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              Network
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={runFullDiagnostic} size="sm" className="flex-1">
              Run Diagnostic
            </Button>
            <Button onClick={() => setLogs([])} variant="outline" size="sm">
              Clear
            </Button>
          </div>
          
          {/* Logs */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No logs yet. Click "Run Diagnostic" to start.
              </p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`p-2 rounded border text-xs ${getStatusColor(log.status)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(log.status)}
                    <span className="font-medium">{log.timestamp}</span>
                    <Badge variant="secondary" className="text-xs">
                      {log.type}
                    </Badge>
                  </div>
                  <p className="text-gray-700">{log.message}</p>
                  {log.details && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-gray-600">Details</summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};