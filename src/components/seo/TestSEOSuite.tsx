import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  TestTube,
  AlertTriangle,
  Info
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

export const TestSEOSuite: React.FC = () => {
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const seoFunctions = [
    {
      name: 'AI SEO Content Generator',
      function: 'ai-seo-content-generator',
      payload: {
        contentType: 'blog_post',
        topic: 'Software Engineer Career Guide',
        targetKeywords: ['software engineer', 'career guide'],
        wordCount: 500
      }
    },
    {
      name: 'Backlink Analyzer',
      function: 'backlink-automation',
      payload: {
        action: 'analyze',
        url: 'https://talentxcel.in'
      }
    },
    {
      name: 'Competitor Intelligence',
      function: 'competitor-intelligence',
      payload: {
        action: 'analyze',
        domain: 'talentxcel.in',
        competitors: ['naukri.com', 'indeed.com']
      }
    },
    {
      name: 'Rank Predictor',
      function: 'seo-rank-predictor',
      payload: {
        url: 'https://talentxcel.in/jobs',
        targetKeyword: 'software engineer jobs',
        currentRank: 25
      }
    },
    {
      name: 'SEO Automation Engine',
      function: 'seo-automation-engine',
      payload: {
        action: 'analyze',
        url: 'https://talentxcel.in'
      }
    },
    {
      name: 'Enhanced Sitemap',
      function: 'enhanced-sitemap',
      payload: {
        type: 'main',
        domain: 'talentxcel.in'
      }
    },
    {
      name: 'URL Metadata',
      function: 'url-metadata',
      payload: {
        url: 'https://talentxcel.in'
      }
    },
    {
      name: 'Google Analytics Integration',
      function: 'google-analytics-integration',
      payload: {
        propertyId: 'demo',
        dateRange: { startDate: '30daysAgo', endDate: 'today' },
        metrics: ['sessions']
      }
    }
  ];

  const testFunction = async (func: typeof seoFunctions[0]): Promise<TestResult> => {
    try {
      console.log(`Testing ${func.name}...`);
      
      const { data, error } = await supabase.functions.invoke(func.function, {
        body: func.payload
      });

      if (error) {
        return {
          name: func.name,
          status: 'error',
          message: `Error: ${error.message}`,
          details: error
        };
      }

      if (data?.success === false) {
        return {
          name: func.name,
          status: 'warning',
          message: data.error || 'Function returned success: false',
          details: data
        };
      }

      return {
        name: func.name,
        status: 'success',
        message: 'Function executed successfully',
        details: data
      };

    } catch (error: any) {
      return {
        name: func.name,
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      };
    }
  };

  const runAllTests = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    setProgress(0);

    const results: TestResult[] = [];
    
    for (let i = 0; i < seoFunctions.length; i++) {
      const func = seoFunctions[i];
      
      // Update progress
      setProgress((i / seoFunctions.length) * 100);
      
      // Add pending result
      const pendingResult: TestResult = {
        name: func.name,
        status: 'pending',
        message: 'Testing...'
      };
      
      setTestResults([...results, pendingResult]);
      
      // Test the function
      const result = await testFunction(func);
      results.push(result);
      
      // Update results
      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProgress(100);
    setIsTestingAll(false);

    // Show summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    if (errorCount === 0) {
      toast.success(`All tests completed! ${successCount} passed, ${warningCount} warnings`);
    } else {
      toast.error(`Tests completed with ${errorCount} errors, ${warningCount} warnings`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          SEO Suite Function Tests
        </CardTitle>
        <CardDescription>
          Test all SEO functions with talentxcel.in to identify issues and verify functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runAllTests} 
            disabled={isTestingAll}
            className="flex items-center gap-2"
          >
            {isTestingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            {isTestingAll ? 'Testing...' : 'Run All Tests'}
          </Button>
          
          {isTestingAll && (
            <div className="flex-1">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 
                              result.status === 'error' ? 'destructive' : 
                              result.status === 'warning' ? 'secondary' : 'outline'}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && result.status !== 'success' && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground">
                        Show details
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Testing Information:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Tests use realistic payloads with talentxcel.in domain</li>
            <li>• Functions should handle missing API keys gracefully</li>
            <li>• Success means function executed without errors</li>
            <li>• Warnings indicate non-critical issues (like demo data)</li>
            <li>• Errors need immediate attention</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};