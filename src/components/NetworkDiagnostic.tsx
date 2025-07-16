import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const NetworkDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (index: number, updates: Partial<DiagnosticResult>) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, ...updates } : r));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Basic connectivity
    const basicTest = { test: 'Basic Connectivity', status: 'pending' as const, message: 'Testing basic internet connectivity...' };
    addResult(basicTest);
    
    try {
      const response = await fetch('https://httpbin.org/json', { method: 'GET' });
      if (response.ok) {
        updateResult(0, { status: 'success', message: 'Internet connectivity working' });
      } else {
        updateResult(0, { status: 'error', message: 'Basic connectivity failed' });
      }
    } catch (error) {
      updateResult(0, { status: 'error', message: `Internet connectivity error: ${error.message}` });
    }

    // Test 2: Supabase API connectivity
    const supabaseTest = { test: 'Supabase API', status: 'pending' as const, message: 'Testing Supabase API connectivity...' };
    addResult(supabaseTest);
    
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        }
      });
      updateResult(1, { 
        status: response.ok ? 'success' : 'error', 
        message: response.ok ? 'Supabase API accessible' : `Supabase API error: ${response.status}`,
        details: { status: response.status, statusText: response.statusText }
      });
    } catch (error) {
      updateResult(1, { status: 'error', message: `Supabase API error: ${error.message}` });
    }

    // Test 3: Edge Function OPTIONS (should work)
    const optionsTest = { test: 'Edge Function OPTIONS', status: 'pending' as const, message: 'Testing Edge Function OPTIONS request...' };
    addResult(optionsTest);
    
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-function', {
        method: 'OPTIONS',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        }
      });
      updateResult(2, { 
        status: response.ok ? 'success' : 'error', 
        message: response.ok ? 'OPTIONS request successful' : `OPTIONS failed: ${response.status}`,
        details: { status: response.status, headers: Object.fromEntries(response.headers.entries()) }
      });
    } catch (error) {
      updateResult(2, { status: 'error', message: `OPTIONS error: ${error.message}` });
    }

    // Test 4: Edge Function POST (this should fail)
    const postTest = { test: 'Edge Function POST', status: 'pending' as const, message: 'Testing Edge Function POST request...' };
    addResult(postTest);
    
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-function', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      updateResult(3, { 
        status: response.ok ? 'success' : 'error', 
        message: response.ok ? 'POST request successful!' : `POST failed: ${response.status}`,
        details: { status: response.status, body: await response.text() }
      });
    } catch (error) {
      updateResult(3, { 
        status: 'error', 
        message: `POST error: ${error.message}`, 
        details: { error: error.name, message: error.message }
      });
    }

    // Test 5: Alternative method check
    const altTest = { test: 'Alternative Check', status: 'pending' as const, message: 'Checking for network restrictions...' };
    addResult(altTest);
    
    try {
      // Try a simple GET to Edge Function path
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-function', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        }
      });
      updateResult(4, { 
        status: 'success', 
        message: `GET request status: ${response.status}`,
        details: { status: response.status, headers: Object.fromEntries(response.headers.entries()) }
      });
    } catch (error) {
      updateResult(4, { 
        status: 'error', 
        message: `GET error: ${error.message}`,
        details: { error: error.name }
      });
    }

    // Test 6: TalentXcel AI Agent Function (requires authentication)
    const aiTest = { test: 'TalentXcel AI Agent', status: 'pending' as const, message: 'Testing AI agent function with authentication...' };
    addResult(aiTest);
    
    try {
      // Check authentication first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        updateResult(5, { 
          status: 'error', 
          message: `Authentication error: ${sessionError.message}`,
          details: { error: sessionError }
        });
      } else if (!session) {
        updateResult(5, { 
          status: 'error', 
          message: 'No active session - authentication required',
          details: { error: 'No session' }
        });
      } else {
        // Test the ai-agent function with authentication
        const { data, error } = await supabase.functions.invoke('ai-agent', {
          body: { 
            module: 'test', 
            task: 'ping', 
            input: { test: true } 
          }
        });
        
        if (error) {
          updateResult(5, { 
            status: 'error', 
            message: `AI function error: ${error.message}`,
            details: { error: error }
          });
        } else if (data && data.success) {
          updateResult(5, { 
            status: 'success', 
            message: `AI function working: ${data.data?.message || data.response || 'OK'}`,
            details: { response: data }
          });
        } else {
          updateResult(5, { 
            status: 'error', 
            message: `AI function failed: ${data?.error || 'Unknown error'}`,
            details: { response: data }
          });
        }
      }
    } catch (error) {
      updateResult(5, { 
        status: 'error', 
        message: `AI function request failed: ${error.message}`,
        details: { error: error.name, message: error.message }
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Network Diagnostic Tool</CardTitle>
        <p className="text-sm text-gray-600">
          Comprehensive network connectivity testing for Edge Functions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Full Network Diagnostic'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Diagnostic Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500">Technical Details</summary>
                      <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};