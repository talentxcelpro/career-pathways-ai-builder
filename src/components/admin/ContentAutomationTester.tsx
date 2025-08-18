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

  // Helpers to improve reliability
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let t: number | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          t = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
        })
      ]) as T;
    } finally {
      if (t) clearTimeout(t);
    }
  }

  async function invokeOrDirect(name: string, body: any): Promise<{ data: any; via: 'invoke' | 'direct' }> {
    try {
      const res = await supabase.functions.invoke(name, { body });
      if (!res.error) {
        return { data: res.data, via: 'invoke' };
      }
    } catch (e) {
      // fallthrough to direct
    }
    const data = await callFunctionDirect(name, body);
    return { data, via: 'direct' };
  }

  async function generateViaAICG() {
    const { data, error } = await supabase.functions.invoke('ai-content-generator', {
      body: {
        contentType: 'blog_post',
        topic: 'Automation tester sample',
        targetAudience: 'professionals',
        tone: 'professional',
        keywords: ['AI', 'automation'],
        industry: 'technology',
        wordCount: 300
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
      { step: 'Generate Content', status: 'pending', message: 'Invoking ai-content-generator...' },
      { step: 'Verify Generated Content', status: 'pending', message: 'Waiting...' }
    ];
    setTestResults(steps);

    try {
      console.log('🚀 Starting simple content generation test...');

      // Step 1: Generate content via ai-content-generator
      updateResult(0, 'success', 'Generating content...');

      const data = await withTimeout(
        generateViaAICG(),
        60000,
        'Generate'
      );

      updateResult(0, 'success', 'Content generated successfully', data);

      // Step 2: Verify generated content saved
      updateResult(1, 'success', 'Verifying generated content...');

      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay

      const { data: recentContent, error: contentError } = await supabase
        .from('ai_content_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) {
        updateResult(1, 'error', `Verification failed: ${contentError.message}`, contentError);
        setIsRunning(false);
        return;
      }

      updateResult(1, 'success', `Found ${recentContent?.length || 0} recent content entries`, recentContent);

      toast({
        title: 'Content Generation Test Complete',
        description: `Generated content and verified ${recentContent?.length || 0} recent entries`,
      });

    } catch (error) {
      console.error('Content generation test failed:', error);

      // Update the current step with error
      const currentStep = testResults.findIndex(r => r.status === 'pending');
      if (currentStep >= 0) {
        updateResult(currentStep, 'error', error instanceof Error ? error.message : 'Unknown error occurred');
      }

      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
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

  // Quick path: generate social posts without waiting for full AI pipeline
  const quickGenerateSocialPosts = async () => {
    setIsRunning(true);
    const steps: TestResult[] = [
      { step: 'Generate Social Posts', status: 'pending', message: 'Creating posts from active bots...' },
      { step: 'Verify Posts', status: 'pending', message: 'Waiting...' }
    ];
    setTestResults(steps);

    try {
      const { data: rsp, via } = await invokeOrDirect('bot-social-posts', {
        preset: 'linkedin_100',
        total_posts: 100,
        categories: [
          'System & Platform Updates',
          'Career Motivation',
          'Jobs & Networking',
          'Learning & Skills',
          'Resume & Career Tools',
          'Community & Inspiration'
        ],
        limit_bots: 4
      });

      // Also surface active bot count for clarity
      const { data: activeBots } = await supabase
        .from('ai_bots')
        .select('id')
        .eq('is_active', true);

      const wallCreated = rsp?.created ?? 0;
      const postsCreated = rsp?.posts_created ?? 0;
      const totalCreated = postsCreated || wallCreated;
      const totalErrors = rsp?.errors?.length ?? 0;

      if (!rsp || rsp.success === false || totalCreated === 0) {
        const errorDetails = [];
        
        // Show top 5 errors
        if (rsp?.errors?.length > 0) {
          const errorSummary = rsp.errors.slice(0, 5).map((e: any) => `${e.stage}: ${e.message.slice(0, 50)}`).join('; ');
          errorDetails.push(`Errors (${totalErrors}): ${errorSummary}`);
        }
        
        // Debug info
        if (rsp?.debug) {
          const debugInfo = [
            `admin_fallback=${rsp.debug.admin_fallback ? '✓' : '✗'}`,
            `auth_user=${rsp.debug.auth_user_from_req ? '✓' : '✗'}`,
            `wall_errors=${rsp.debug.wall_insert_errors || 0}`,
            `post_errors=${rsp.debug.posts_insert_errors || 0}`
          ].join(', ');
          errorDetails.push(`Debug: ${debugInfo}`);
        }
        
        const errorDetail = errorDetails.length > 0 ? errorDetails.join(' | ') : rsp?.error || rsp?.message || 'Unknown error';
        updateResult(0, 'error', `No posts created. Active bots: ${activeBots?.length ?? 0}. ${errorDetail}`, rsp);
      } else {
        const successMsg = `Created ${totalCreated} posts (${via}). Active bots: ${activeBots?.length ?? 0}`;
        const debugMsg = totalErrors > 0 ? ` [${totalErrors} errors]` : '';
        updateResult(0, 'success', successMsg + debugMsg, rsp);
      }

      // Verify in both bot_wall (source of truth) and posts (synced)
      const { data: recentWall, error: wallError } = await (supabase as any)
        .from('bot_wall')
        .select('id, title, published_at, source, bot_id')
        .eq('source', 'ai')
        .order('published_at', { ascending: false })
        .limit(5);

      if (wallError) throw wallError;

      const { data: recentPosts, error: postsError } = await (supabase as any)
        .from('posts')
        .select('id, content, created_at, metadata')
        .eq('is_ai_generated', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsError) throw postsError;

      updateResult(
        1,
        'success',
        `Found ${recentWall?.length || 0} AI wall items and ${recentPosts?.length || 0} AI posts`,
        { recentWall, recentPosts }
      );

      toast({
        title: 'Social Posts Check',
        description: `Wall: ${recentWall?.length || 0}, Posts: ${recentPosts?.length || 0}`,
      });
    } catch (error) {
      console.error('Quick social post failed:', error);
      const currentStep = testResults.findIndex(r => r.status === 'pending');
      if (currentStep >= 0) {
        updateResult(currentStep, 'error', error instanceof Error ? error.message : 'Unknown error');
      }
      toast({ title: 'Quick Post Failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Content Automation Tester</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={quickGenerateSocialPosts}
            disabled={isRunning}
            variant="secondary"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Quick Social Post
          </Button>
          <Button
            onClick={startAutomationTest}
            disabled={isRunning}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running Test...' : 'Start Test'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium">{result.step}</div>
                <div className="text-sm text-muted-foreground">{result.message}</div>
                {result.details && (
                  <details className="mt-2">
                    <summary className={`text-xs cursor-pointer ${result.status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                      View Details
                    </summary>
                    <pre className={`text-xs mt-1 p-2 rounded overflow-x-auto ${
                      result.status === 'error' ? 'bg-red-50 text-red-800' : 'bg-gray-50'
                    }`}>
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