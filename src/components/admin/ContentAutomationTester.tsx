import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const ContentAutomationTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const updateResult = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status, message, details } : result
    ));
  };

  const startAutomationTest = async () => {
    setIsRunning(true);
    const steps: TestResult[] = [
      { step: 'Queue Content Generation', status: 'pending', message: 'Starting...' },
      { step: 'Process Queue', status: 'pending', message: 'Waiting...' },
      { step: 'Verify Generated Content', status: 'pending', message: 'Waiting...' }
    ];
    setTestResults(steps);

    try {
      // Step 1: Queue content generation
      console.log('🚀 Starting content automation test...');
      const { data: queueResult, error: queueError } = await supabase.functions.invoke('content-queue-processor', {
        body: { action: 'queue', count: 5 }
      });

      if (queueError) {
        updateResult(0, 'error', `Queue failed: ${queueError.message}`, queueError);
        setIsRunning(false);
        return;
      }

      updateResult(0, 'success', `Queued ${queueResult.jobs_queued} jobs`, queueResult);

      // Step 2: Process the queue
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const { data: processResult, error: processError } = await supabase.functions.invoke('content-queue-processor', {
        body: { action: 'process' }
      });

      if (processError) {
        updateResult(1, 'error', `Processing failed: ${processError.message}`, processError);
        setIsRunning(false);
        return;
      }

      updateResult(1, 'success', `Processed ${processResult.processed} jobs`, processResult);

      // Step 3: Verify content was created
      const { data: contentData, error: contentError } = await supabase
        .from('bot_generated_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) {
        updateResult(2, 'error', `Verification failed: ${contentError.message}`, contentError);
        setIsRunning(false);
        return;
      }

      updateResult(2, 'success', `Found ${contentData.length} recent content pieces`, contentData);

      toast({
        title: "Content Automation Test Complete",
        description: `Successfully generated and processed ${processResult.processed} content pieces`,
      });

    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className={`h-4 w-4 text-gray-400 ${isRunning ? 'animate-spin' : ''}`} />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Content Automation Tester</CardTitle>
        <Button
          onClick={startAutomationTest}
          disabled={isRunning}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running Test...' : 'Start Test'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium">{result.step}</div>
                <div className="text-sm text-muted-foreground">{result.message}</div>
                {result.details && result.status === 'success' && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-blue-600">View Details</summary>
                    <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
          
          {testResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Start Test" to begin the content automation test
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};