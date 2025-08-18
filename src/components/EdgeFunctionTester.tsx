import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const EdgeFunctionTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);


  const testEdgeFunction = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Testing edge function via supabase.functions.invoke...');
      
      const { data, error } = await supabase.functions.invoke('test-function-2025', {
        body: { test: 'data', timestamp: new Date().toISOString() }
      });

      if (error) {
        console.error('Edge function error:', error);
        setResult({ error: error.message, via: 'invoke' });
        toast({
          title: "Function Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Edge function success:', data);
        setResult({ data, via: 'invoke' });
        toast({
          title: "Function Test Success",
          description: "Edge function is working!",
        });
      }
    } catch (err: any) {
      console.error('Test error:', err);
      setResult({ error: err.message, via: 'invoke' });
      toast({
        title: "Test Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectHttp = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const url = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-function-2025';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Public function should work without auth, but include apikey for clarity
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
        },
        body: JSON.stringify({ direct: true, t: Date.now() })
      });
      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}
      setResult({ status: res.status, ok: res.ok, json: json || text, via: 'direct' });
      if (!res.ok) {
        toast({ title: 'Direct HTTP failed', description: `${res.status}: ${text}`, variant: 'destructive' });
      } else {
        toast({ title: 'Direct HTTP success', description: 'Function responded' });
      }
    } catch (e: any) {
      setResult({ error: e.message, via: 'direct' });
      toast({ title: 'Direct HTTP error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Edge Function Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testEdgeFunction} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Function (invoke)'}
        </Button>
        <Button 
          onClick={testDirectHttp} 
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Function (direct HTTP)'}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-50 rounded text-sm">
            <strong>Result:</strong>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};