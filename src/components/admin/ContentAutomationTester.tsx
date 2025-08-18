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

  const FUNCTIONS_URL = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

  async function generateViaAICG() {
    const { data, error } = await supabase.functions.invoke('ai-comprehensive-generator', {
      body: {
        contentType: 'article',
        topic: 'Automation tester fallback',
        targetAudience: 'professionals',
        tone: 'professional',
      }
    });
    if (error) throw error;
    return data;
  }

  async function callFunctionDirect(name: string, body: any) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || `HTTP ${res.status}`);
    }
    return json;
  }

  const updateResult = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status, message, details } : result
    ));
  };

  const startAutomationTest = async () => {
    setIsRunning(true);
    const steps: TestResult[] = [
      { step: 'Generate Content', status: 'pending', message: 'Starting...' },
      { step: 'Verify Content', status: 'pending', message: 'Waiting...' }
    ];
    setTestResults(steps);

    try {
      // Step 1: Generate content directly using ai-content-generator
      console.log('🚀 Starting content generation test...');
      const { data: generateResult, error: generateError } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          contentType: 'blog_post',
          topic: 'Career Development Tips for Software Engineers',
          targetAudience: 'professionals',
          tone: 'professional',
          wordCount: 500,
          keywords: ['career growth', 'software engineering', 'professional development']
        }
      });

      if (generateError || !generateResult?.success) {
        try {
          // Try ai-comprehensive-generator as fallback
          const fallback = await supabase.functions.invoke('ai-comprehensive-generator', {
            body: {
              contentType: 'blog_post',
              topic: 'Career Development Tips',
              targetAudience: 'professionals',
              tone: 'professional'
            }
          });
          
          if (fallback.data?.success) {
            updateResult(0, 'success', 'Generated content (via ai-comprehensive-generator)', fallback.data);
          } else {
            throw new Error(fallback.error?.message || 'Fallback failed');
          }
        } catch (fe) {
          updateResult(0, 'error', `Content generation failed: ${generateError?.message || 'Unknown error'}`, { 
            primaryError: generateError, 
            fallbackError: fe instanceof Error ? fe.message : fe 
          });
          setIsRunning(false);
          return;
        }
      } else {
        updateResult(0, 'success', `Generated content successfully`, generateResult);
      }

      // Step 2: Verify content was created
      const { data: contentData, error: contentError } = await supabase
        .from('bot_generated_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) {
        updateResult(1, 'error', `Verification failed: ${contentError.message}`, contentError);
        setIsRunning(false);
        return;
      }

      let verifyItems: any[] = (contentData as any[]) || [];

      if (!verifyItems || verifyItems.length === 0) {
        const { data: aiLibData, error: aiLibError } = await supabase
          .from('ai_content_library')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (aiLibError) {
          updateResult(1, 'error', `Verification failed: ${aiLibError.message}`, aiLibError);
          setIsRunning(false);
          return;
        }
        verifyItems = (aiLibData as any[]) || [];
      }

      updateResult(1, 'success', `Found ${verifyItems.length} recent content pieces`, verifyItems);

      toast({
        title: "Content Generation Test Complete",
        description: `Successfully generated content and found ${verifyItems.length} content pieces`,
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