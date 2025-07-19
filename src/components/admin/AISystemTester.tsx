
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  tool: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export const AISystemTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { invokeAITool, isProcessing } = useAIService();

  const testCases = [
    {
      tool: 'resume-enhancer',
      name: 'Resume Enhancement',
      data: {
        summary: 'Software developer with 3 years experience',
        experience: 'Worked at tech startup building web applications',
        skills: 'JavaScript, React, Node.js',
        education: 'BS Computer Science'
      }
    },
    {
      tool: 'ats-optimizer',
      name: 'ATS Optimization',
      data: {
        resumeContent: {
          summary: 'Experienced developer seeking new opportunities',
          skills: ['JavaScript', 'React', 'Python']
        },
        jobDescription: 'Looking for full-stack developer with React experience'
      }
    },
    {
      tool: 'career-advisor',
      name: 'Career Analysis',
      data: {
        userProfile: {
          currentRole: 'Junior Developer',
          experience: 2,
          skills: ['JavaScript', 'React'],
          interests: ['AI', 'Machine Learning']
        },
        targetRole: 'Senior Developer'
      }
    },
    {
      tool: 'salary-analyzer',
      name: 'Salary Analysis',
      data: {
        role: 'Software Engineer',
        location: 'San Francisco, CA',
        experience: 3
      }
    }
  ];

  const runSingleTest = async (testCase: any) => {
    console.log(`Testing ${testCase.tool} with data:`, testCase.data);
    
    const startTime = Date.now();
    setTestResults(prev => prev.map(result => 
      result.tool === testCase.tool 
        ? { ...result, status: 'pending' as const }
        : result
    ));

    try {
      const result = await invokeAITool({
        toolSlug: testCase.tool,
        inputData: testCase.data,
        category: 'test'
      });

      const duration = Date.now() - startTime;

      if (result.success) {
        console.log(`✅ ${testCase.tool} test passed:`, result.data);
        setTestResults(prev => prev.map(r => 
          r.tool === testCase.tool 
            ? { ...r, status: 'success' as const, message: 'Test passed', duration }
            : r
        ));
        toast.success(`${testCase.name} test passed!`);
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error: any) {
      console.error(`❌ ${testCase.tool} test failed:`, error);
      setTestResults(prev => prev.map(r => 
        r.tool === testCase.tool 
          ? { ...r, status: 'error' as const, message: error.message }
          : r
      ));
      toast.error(`${testCase.name} test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    if (isProcessing) return;
    
    setIsRunning(true);
    setTestResults(testCases.map(tc => ({ 
      tool: tc.tool, 
      status: 'pending' as const 
    })));

    toast.info('Starting AI system tests...');

    for (const testCase of testCases) {
      await runSingleTest(testCase);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    
    const passedTests = testResults.filter(r => r.status === 'success').length;
    const totalTests = testCases.length;
    
    if (passedTests === totalTests) {
      toast.success(`All ${totalTests} tests passed! 🎉`);
    } else {
      toast.warning(`${passedTests}/${totalTests} tests passed`);
    }
  };

  const handleTest = async (testCase: any) => {
    if (isProcessing || isRunning) return;
    await runSingleTest(testCase);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Running...</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI System Tester</h2>
          <p className="text-muted-foreground">
            Run predefined tests for common AI operations
          </p>
        </div>
        <Button 
          onClick={runAllTests}
          disabled={isProcessing || isRunning}
          className="gap-2"
        >
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          Run All Tests
        </Button>
      </div>

      <div className="grid gap-4">
        {testCases.map((testCase, index) => {
          const result = testResults.find(r => r.tool === testCase.tool);
          return (
            <Card key={testCase.tool}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result?.status || 'ready')}
                    <div>
                      <CardTitle className="text-lg">{testCase.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Tool: {testCase.tool}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result?.status || 'ready')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(testCase)}
                      disabled={isProcessing || isRunning}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {result?.message && (
                <CardContent>
                  <div className="text-sm">
                    <span className="font-medium">Result: </span>
                    <span className={result.status === 'error' ? 'text-red-600' : 'text-green-600'}>
                      {result.message}
                    </span>
                    {result.duration && (
                      <span className="text-muted-foreground ml-2">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Test Status Summary</h3>
        <div className="text-sm text-blue-800">
          <p>✅ Passed: {testResults.filter(r => r.status === 'success').length}</p>
          <p>❌ Failed: {testResults.filter(r => r.status === 'error').length}</p>
          <p>⏳ Pending: {testResults.filter(r => r.status === 'pending').length}</p>
          <p>📝 Ready: {testCases.length - testResults.length}</p>
        </div>
      </div>
    </div>
  );
};
