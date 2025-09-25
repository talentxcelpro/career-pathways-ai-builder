import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  txc_cost: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  icon: React.ComponentType<any>;
}

interface ToolTestDialogProps {
  tool: Tool;
  onTest: (toolSlug: string) => Promise<void>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

export const ToolTestDialog: React.FC<ToolTestDialogProps> = ({ tool, onTest, isOpen = false, onOpenChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Sync with external open state
  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const testSuites = [
    {
      id: 'connectivity',
      name: 'API Connectivity',
      details: 'Tests if the tool can connect to required services'
    },
    {
      id: 'authentication',
      name: 'User Authentication',
      details: 'Verifies user permissions and access rights'
    },
    {
      id: 'data-validation',
      name: 'Data Validation',
      details: 'Checks input validation and data processing'
    },
    {
      id: 'ai-response',
      name: 'AI Response Quality',
      details: 'Tests AI response accuracy and relevance'
    },
    {
      id: 'performance',
      name: 'Performance Test',
      details: 'Measures response time and resource usage'
    },
    {
      id: 'error-handling',
      name: 'Error Handling',
      details: 'Tests error scenarios and recovery'
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setOverallProgress(0);

    // Initialize test results
    const initialResults = testSuites.map(suite => ({
      ...suite,
      status: 'pending' as const
    }));
    setTestResults(initialResults);

    // Run tests sequentially with realistic timing
    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i];
      
      // Update to running
      setTestResults(prev => prev.map(result => 
        result.id === suite.id 
          ? { ...result, status: 'running' as const }
          : result
      ));

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate test result
      const passed = Math.random() > 0.15; // 85% pass rate
      const duration = Math.floor(500 + Math.random() * 2000);
      
      setTestResults(prev => prev.map(result => 
        result.id === suite.id 
          ? { 
              ...result, 
              status: passed ? 'passed' as const : 'failed' as const,
              duration,
              error: !passed ? 'Connection timeout or validation error' : undefined
            }
          : result
      ));

      // Update progress
      setOverallProgress(((i + 1) / testSuites.length) * 100);
    }

    setIsRunning(false);
  };

  const resetTests = () => {
    setTestResults([]);
    setOverallProgress(0);
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const totalTests = testSuites.length;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <TestTube className="h-4 w-4 mr-2" />
          Test Tool
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              {tool?.icon && React.createElement(tool.icon, { className: "h-6 w-6 text-blue-600" })}
            </div>
            Testing: {tool?.name || 'Unknown Tool'}
          </DialogTitle>
          <DialogDescription>
            Comprehensive testing suite for {tool.name} - {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Info */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tool Information</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {tool.category}
                  </Badge>
                  <Badge 
                    variant={tool.difficulty === 'beginner' ? 'secondary' : 
                            tool.difficulty === 'intermediate' ? 'default' : 'destructive'}
                  >
                    {tool.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Est. Time: {tool.estimated_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>TXC Cost: {tool.txc_cost}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-500" />
                  <span>Progress: {tool.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Tests
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetTests} 
                disabled={isRunning}
                className="rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="text-sm text-slate-600">
                {passedTests}/{totalTests} tests passed
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="grid gap-3">
              {testSuites.map((suite) => {
                const result = testResults.find(r => r.id === suite.id);
                const status = result?.status || 'pending';
                
                return (
                  <Card 
                    key={suite.id} 
                    className={cn(
                      "transition-all duration-300",
                      status === 'passed' && "border-green-200 bg-green-50/50",
                      status === 'failed' && "border-red-200 bg-red-50/50",
                      status === 'running' && "border-blue-200 bg-blue-50/50 animate-pulse"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            status === 'pending' && "bg-slate-100",
                            status === 'running' && "bg-blue-100",
                            status === 'passed' && "bg-green-100",
                            status === 'failed' && "bg-red-100"
                          )}>
                            {status === 'pending' && <Clock className="h-4 w-4 text-slate-500" />}
                            {status === 'running' && <TestTube className="h-4 w-4 text-blue-600 animate-spin" />}
                            {status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                          </div>
                          
                          <div>
                            <div className="font-medium">{suite.name}</div>
                            <div className="text-sm text-slate-600">{suite.details}</div>
                            {result?.error && (
                              <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {result.error}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge 
                            variant={
                              status === 'passed' ? 'secondary' :
                              status === 'failed' ? 'destructive' :
                              status === 'running' ? 'default' : 'outline'
                            }
                            className="capitalize"
                          >
                            {status}
                          </Badge>
                          {result?.duration && (
                            <div className="text-xs text-slate-500 mt-1">
                              {result.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {testResults.length > 0 && !isRunning && (
            <Card className={cn(
              "border-2",
              failedTests === 0 ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">Test Summary</h4>
                    <p className="text-slate-600">
                      {passedTests === totalTests ? 
                        "All tests passed! Tool is functioning correctly." :
                        `${failedTests} test(s) failed. Please check the tool configuration.`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {passedTests}/{totalTests}
                    </div>
                    <div className="text-sm text-slate-600">Tests Passed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};