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
    
    // Test 1: Supabase client method
    try {
      addLog({ type: 'connectivity', message: 'Testing with Supabase client...', status: 'info' });
      
      const result = await supabase.functions.invoke('test-function', {
        body: { test: true, timestamp: Date.now() }
      });
      
      if (result.error) {
        addLog({ 
          type: 'connectivity', 
          message: `Supabase client failed: ${result.error.message}`, 
          status: 'warning',
          details: result.error 
        });
        
        // Test 2: Direct fetch fallback
        await testDirectFetch();
        return;
      }
      
      setConnectivityStatus('online');
      addLog({ 
        type: 'connectivity', 
        message: 'Supabase client connectivity successful', 
        status: 'success',
        details: result.data 
      });
      
    } catch (err) {
      addLog({ 
        type: 'connectivity', 
        message: `Supabase client error: ${err.message}`, 
        status: 'warning',
        details: err 
      });
      
      // Test 2: Direct fetch fallback
      await testDirectFetch();
    }
  };

  const testDirectFetch = async () => {
    addLog({ type: 'connectivity', message: 'Testing with direct fetch...', status: 'info' });
    
    try {
      const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-function`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({ test: true, timestamp: Date.now() })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setConnectivityStatus('online');
      addLog({ 
        type: 'connectivity', 
        message: 'Direct fetch connectivity successful', 
        status: 'success',
        details: { response_status: response.status, data } 
      });
      
    } catch (err) {
      setConnectivityStatus('offline');
      addLog({ 
        type: 'connectivity', 
        message: `Direct fetch failed: ${err.message}`, 
        status: 'error',
        details: err 
      });
    }
  };

  const testAIFunction = async () => {
    addLog({ type: 'request', message: 'Testing AI agent function (requires auth)...', status: 'info' });
    
    // Test 1: Supabase client method
    try {
      addLog({ type: 'request', message: 'Testing AI agent with Supabase client...', status: 'info' });
      
      const result = await supabase.functions.invoke('ai-agent', {
        body: {
          module: 'test',
          task: 'ping',
          input: { test: true }
        }
      });
      
      if (result.error) {
        let errorMessage = `Supabase client AI function failed: ${result.error.message}`;
        let shouldRetry = false;
        
        // Check for authentication issues
        if (result.error.message?.includes('401') || result.error.message?.includes('403')) {
          errorMessage += ' (Authentication issue detected)';
          shouldRetry = true;
        }
        
        addLog({ 
          type: 'request', 
          message: errorMessage, 
          status: 'warning',
          details: result.error 
        });
        
        // Try token refresh if auth issue
        if (shouldRetry) {
          const refreshResult = await attemptTokenRefresh();
          if (refreshResult) {
            // Retry with Supabase client after refresh
            const retryResult = await supabase.functions.invoke('ai-agent', {
              body: {
                module: 'test',
                task: 'ping',
                input: { test: true }
              }
            });
            
            if (!retryResult.error) {
              addLog({ 
                type: 'response', 
                message: 'AI function succeeded with Supabase client after token refresh', 
                status: 'success',
                details: retryResult.data 
              });
              return;
            }
          }
        }
        
        // Fallback to direct fetch
        await testAIFunctionDirectFetch();
        return;
      }
      
      addLog({ 
        type: 'response', 
        message: 'AI function responded successfully with Supabase client', 
        status: 'success',
        details: result.data 
      });
      
    } catch (err) {
      addLog({ 
        type: 'request', 
        message: `Supabase client AI function error: ${err.message}`, 
        status: 'warning',
        details: err 
      });
      
      // Fallback to direct fetch
      await testAIFunctionDirectFetch();
    }
  };

  const testAIFunctionDirectFetch = async () => {
    addLog({ type: 'request', message: 'Testing AI agent with direct fetch...', status: 'info' });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addLog({ 
          type: 'request', 
          message: 'No session available for direct fetch test', 
          status: 'error' 
        });
        return;
      }
      
      const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-agent`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        },
        body: JSON.stringify({
          module: 'test',
          task: 'ping',
          input: { test: true }
        })
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          addLog({ 
            type: 'request', 
            message: `Direct fetch authentication failed (${response.status})`, 
            status: 'warning' 
          });
          
          const refreshResult = await attemptTokenRefresh();
          if (refreshResult) {
            // Retry with fresh token
            const newSession = await supabase.auth.getSession();
            if (newSession.data.session) {
              const retryResponse = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newSession.data.session.access_token}`,
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
                  'Content-Type': 'application/json',
                  'cache-control': 'no-cache'
                },
                body: JSON.stringify({
                  module: 'test',
                  task: 'ping',
                  input: { test: true }
                })
              });
              
              if (retryResponse.ok) {
                const data = await retryResponse.json();
                addLog({ 
                  type: 'response', 
                  message: 'AI function succeeded with direct fetch after token refresh', 
                  status: 'success',
                  details: data 
                });
                return;
              }
            }
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addLog({ 
        type: 'response', 
        message: 'AI function responded successfully with direct fetch', 
        status: 'success',
        details: data 
      });
      
    } catch (err) {
      addLog({ 
        type: 'error', 
        message: `Direct fetch AI function failed: ${err.message}`, 
        status: 'error',
        details: err 
      });
    }
  };

  const attemptTokenRefresh = async (): Promise<boolean> => {
    addLog({ type: 'auth', message: 'Attempting token refresh...', status: 'info' });
    
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        addLog({ 
          type: 'auth', 
          message: `Token refresh failed: ${refreshError.message}`, 
          status: 'error',
          details: refreshError 
        });
        return false;
      }
      
      addLog({ type: 'auth', message: 'Token refreshed successfully', status: 'success' });
      return true;
    } catch (err) {
      addLog({ 
        type: 'auth', 
        message: `Token refresh error: ${err.message}`, 
        status: 'error',
        details: err 
      });
      return false;
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