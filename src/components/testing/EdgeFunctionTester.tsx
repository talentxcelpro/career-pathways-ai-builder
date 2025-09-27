import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, CheckCircle, AlertCircle, Globe, Brain, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  function: string;
  status: 'loading' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

export const EdgeFunctionTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const updateTestResult = (functionName: string, update: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.function === functionName);
      if (existing) {
        return prev.map(r => r.function === functionName ? { ...r, ...update } : r);
      } else {
        return [...prev, { function: functionName, ...update } as TestResult];
      }
    });
  };

  const testMassiveSitemapGenerator = async () => {
    const startTime = Date.now();
    updateTestResult('massive-sitemap-generator', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('massive-sitemap-generator', {
        body: { 
          sitemapType: 'seo', 
          limit: 100 // Small limit for testing
        }
      });
      
      if (error) throw error;
      
      const duration = Date.now() - startTime;
      updateTestResult('massive-sitemap-generator', {
        status: 'success',
        response: data,
        duration
      });
      
      toast.success(`Massive sitemap generator test passed! (${duration}ms)`);
    } catch (error) {
      updateTestResult('massive-sitemap-generator', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Massive sitemap generator test failed');
    }
  };

  const testAIContentGenerator = async () => {
    const startTime = Date.now();
    updateTestResult('ai-content-generator', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          contentType: 'blog_post',
          topic: 'Career Development Tips for Software Engineers',
          targetAudience: 'software developers',
          tone: 'professional',
          keywords: ['career', 'development', 'software', 'engineering']
        }
      });
      
      if (error) throw error;
      
      const duration = Date.now() - startTime;
      updateTestResult('ai-content-generator', {
        status: 'success',
        response: data,
        duration
      });
      
      toast.success(`AI content generator test passed! (${duration}ms)`);
    } catch (error) {
      updateTestResult('ai-content-generator', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('AI content generator test failed');
    }
  };

  const testSocialContentGenerator = async () => {
    const startTime = Date.now();
    updateTestResult('social-content-generator', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('social-content-generator', {
        body: {
          contentType: 'post',
          platform: 'linkedin',
          topic: 'Remote Work Best Practices',
          hashtags: ['#RemoteWork', '#Productivity', '#Tech']
        }
      });
      
      if (error) throw error;
      
      const duration = Date.now() - startTime;
      updateTestResult('social-content-generator', {
        status: 'success',
        response: data,
        duration
      });
      
      toast.success(`Social content generator test passed! (${duration}ms)`);
    } catch (error) {
      updateTestResult('social-content-generator', {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Social content generator test failed');
    }
  };

  const testAllFunctions = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    
    try {
      await Promise.all([
        testMassiveSitemapGenerator(),
        testAIContentGenerator(),
        testSocialContentGenerator()
      ]);
      
      toast.success('All edge function tests completed!');
    } catch (error) {
      toast.error('Some tests failed');
    } finally {
      setIsTestingAll(false);
    }
  };

  const edgeFunctions = [
    {
      name: 'massive-sitemap-generator',
      title: 'Massive Sitemap Generator',
      description: 'Generates millions of SEO-optimized pages',
      icon: Globe,
      color: 'text-blue-600',
      test: testMassiveSitemapGenerator
    },
    {
      name: 'ai-content-generator',
      title: 'AI Content Generator',
      description: 'Creates AI-powered content with OpenAI',
      icon: Brain,
      color: 'text-purple-600',
      test: testAIContentGenerator
    },
    {
      name: 'social-content-generator',
      title: 'Social Content Generator',
      description: 'Generates social media content for multiple platforms',
      icon: Share2,
      color: 'text-green-600',
      test: testSocialContentGenerator
    }
  ];

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Edge Function Tester
          </CardTitle>
          <p className="text-muted-foreground">
            Test the newly created edge functions for massive sitemap generation
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAllFunctions}
            disabled={isTestingAll}
            className="mb-6"
            size="lg"
          >
            {isTestingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing All Functions...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test All Edge Functions
              </>
            )}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {edgeFunctions.map((func) => {
              const Icon = func.icon;
              const result = testResults.find(r => r.function === func.name);
              
              return (
                <Card key={func.name} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${func.color}`} />
                        <div className="text-sm font-medium">{func.title}</div>
                      </div>
                      {result && getStatusIcon(result.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{func.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={func.test}
                      disabled={result?.status === 'loading'}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {result?.status === 'loading' ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Test Function
                        </>
                      )}
                    </Button>
                    
                    {result && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                          >
                            {result.status}
                          </Badge>
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                        
                        {result.error && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {result.error}
                          </div>
                        )}
                        
                        {result.response && result.status === 'success' && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Response
                            </summary>
                            <Textarea
                              className="mt-2 text-xs h-24"
                              value={JSON.stringify(result.response, null, 2)}
                              readOnly
                            />
                          </details>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div key={result.function} className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="font-medium">{result.function}</span>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-sm text-muted-foreground">{result.duration}ms</span>
                    )}
                    {getStatusIcon(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};