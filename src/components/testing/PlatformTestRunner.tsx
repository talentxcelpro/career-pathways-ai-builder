import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestCaseRunner } from './TestCaseRunner';
import { testRunner } from '@/utils/testRunner';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';

export function PlatformTestRunner() {
  const [tests, setTests] = useState(testRunner.getTests());
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testId: string) => {
    setIsRunning(true);
    await testRunner.runTest(testId);
    setTests([...testRunner.getTests()]);
    setIsRunning(false);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    await testRunner.runAllTests();
    setTests([...testRunner.getTests()]);
    setIsRunning(false);
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Platform Test Runner
            {passedTests === totalTests && totalTests > 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">✓ {passedTests} Passed</span>
              <span className="text-red-600">✗ {failedTests} Failed</span>
              <span className="text-gray-600">Total: {totalTests}</span>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Run All Tests'}
            </Button>
          </div>
          
          <TestCaseRunner 
            testCases={tests}
            onRunTest={runTest}
          />
        </CardContent>
      </Card>
    </div>
  );
}