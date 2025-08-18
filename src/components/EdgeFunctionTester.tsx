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
      console.log('Testing edge function...');
      
      const { data, error } = await supabase.functions.invoke('test-function-2025', {
        body: { test: 'data', timestamp: new Date().toISOString() }
      });

      if (error) {
        console.error('Edge function error:', error);
        setResult({ error: error.message });
        toast({
          title: "Function Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Edge function success:', data);
        setResult(data);
        toast({
          title: "Function Test Success",
          description: "Edge function is working!",
        });
      }
    } catch (err: any) {
      console.error('Test error:', err);
      setResult({ error: err.message });
      toast({
        title: "Test Error",
        description: err.message,
        variant: "destructive",
      });
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
          {isLoading ? 'Testing...' : 'Test Function'}
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