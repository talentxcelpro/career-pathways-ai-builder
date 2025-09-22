import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APP_CONFIG } from '@/config/constants';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EdgeFunctionTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedFunction, setSelectedFunction] = useState('test-function-2025');

  const functions = [
    { name: 'test-function-2025', method: 'POST' },
    { name: 'simple-test', method: 'both' },
    { name: 'health', method: 'GET' },
    { name: 'ping', method: 'GET' },
  ];

  const domains = [
    'https://dthlgsnakhoftinssokm.supabase.co/functions/v1',
    'https://dthlgsnakhoftinssokm.functions.supabase.co'
  ];


  const testSupabaseInvoke = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log(`Testing ${selectedFunction} via supabase.functions.invoke...`);
      
      const { data, error } = await supabase.functions.invoke(selectedFunction, {
        body: { test: 'data', timestamp: new Date().toISOString() }
      });

      if (error) {
        console.error('Edge function error:', error);
        setResult({ 
          error: error.message, 
          errorDetails: error,
          via: 'supabase.functions.invoke',
          function: selectedFunction 
        });
        toast({
          title: "Function Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Edge function success:', data);
        setResult({ data, via: 'supabase.functions.invoke', function: selectedFunction });
        toast({
          title: "Function Test Success",
          description: "Edge function is working!",
        });
      }
    } catch (err: any) {
      console.error('Test error:', err);
      setResult({ 
        error: err.message, 
        errorDetails: err,
        via: 'supabase.functions.invoke',
        function: selectedFunction 
      });
      toast({
        title: "Test Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectHTTP = async (method: 'GET' | 'POST' = 'POST') => {
    setIsLoading(true);
    setResult(null);
    
    const results: any[] = [];
    
    for (const domain of domains) {
      try {
        console.log(`Testing ${selectedFunction} via direct ${method} to ${domain}...`);
        
        const url = `${domain}/${selectedFunction}`;
        const options: RequestInit = {
          method,
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          }
        };
        
        if (method === 'POST') {
          options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
          };
          options.body = JSON.stringify({ direct: true, method, timestamp: new Date().toISOString() });
        }
        
        const res = await fetch(url, options);
        const text = await res.text();
        let json: any = null;
        try { json = JSON.parse(text); } catch {}
        
        results.push({
          domain,
          method,
          url,
          status: res.status,
          ok: res.ok,
          statusText: res.statusText,
          response: json || text,
          headers: Object.fromEntries(res.headers.entries())
        });
        
      } catch (e: any) {
        results.push({
          domain,
          method,
          url: `${domain}/${selectedFunction}`,
          error: e.message,
          errorType: e.name
        });
      }
    }
    
    setResult({ 
      via: `direct-${method}`,
      function: selectedFunction,
      results 
    });
    
    const successCount = results.filter(r => r.ok).length;
    if (successCount > 0) {
      toast({ 
        title: `Direct ${method} Success`, 
        description: `${successCount}/${results.length} domains responded` 
      });
    } else {
      toast({ 
        title: `Direct ${method} Failed`, 
        description: 'All domains failed', 
        variant: 'destructive' 
      });
    }
    
    setIsLoading(false);
  };

  const testAllMethods = async () => {
    setIsLoading(true);
    setResult(null);
    
    const allResults: any[] = [];
    
    // Test supabase.functions.invoke
    try {
      const { data, error } = await supabase.functions.invoke(selectedFunction, {
        body: { test: 'comprehensive', timestamp: new Date().toISOString() }
      });
      allResults.push({
        method: 'supabase.functions.invoke',
        success: !error,
        data: error ? { error: error.message, errorDetails: error } : data
      });
    } catch (err: any) {
      allResults.push({
        method: 'supabase.functions.invoke',
        success: false,
        data: { error: err.message, errorDetails: err }
      });
    }
    
    // Test direct HTTP methods
    const httpMethods = ['GET', 'POST'] as const;
    for (const method of httpMethods) {
      for (const domain of domains) {
        try {
          const url = `${domain}/${selectedFunction}`;
          const options: RequestInit = {
            method,
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
            }
          };
          
          if (method === 'POST') {
            options.headers = { ...options.headers, 'Content-Type': 'application/json' };
            options.body = JSON.stringify({ comprehensive: true, method, timestamp: new Date().toISOString() });
          }
          
          const res = await fetch(url, options);
          const text = await res.text();
          let json: any = null;
          try { json = JSON.parse(text); } catch {}
          
          allResults.push({
            method: `${method} ${domain}`,
            success: res.ok,
            data: {
              status: res.status,
              statusText: res.statusText,
              response: json || text
            }
          });
        } catch (e: any) {
          allResults.push({
            method: `${method} ${domain}`,
            success: false,
            data: { error: e.message, errorType: e.name }
          });
        }
      }
    }
    
    setResult({
      via: 'comprehensive-test',
      function: selectedFunction,
      results: allResults,
      summary: {
        total: allResults.length,
        successful: allResults.filter(r => r.success).length,
        failed: allResults.filter(r => !r.success).length
      }
    });
    
    const successCount = allResults.filter(r => r.success).length;
    toast({
      title: 'Comprehensive Test Complete',
      description: `${successCount}/${allResults.length} tests passed`,
      variant: successCount > 0 ? 'default' : 'destructive'
    });
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edge Function Comprehensive Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Function:</label>
          <Select value={selectedFunction} onValueChange={setSelectedFunction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {functions.map((func) => (
                <SelectItem key={func.name} value={func.name}>
                  {func.name} ({func.method})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button 
            onClick={testSupabaseInvoke} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test via Invoke'}
          </Button>
          
          <Button 
            onClick={() => testDirectHTTP('POST')} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test POST'}
          </Button>
          
          <Button 
            onClick={() => testDirectHTTP('GET')} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test GET (no preflight)'}
          </Button>
          
          <Button 
            onClick={testAllMethods} 
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test All Methods'}
          </Button>
        </div>
        
        {result && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm max-h-96 overflow-auto">
            <strong>Result ({result.via}):</strong>
            {result.summary && (
              <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded">
                <strong>Summary:</strong> {result.summary.successful}/{result.summary.total} tests passed
              </div>
            )}
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};