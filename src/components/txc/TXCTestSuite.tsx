import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTXCPurchase } from '@/hooks/useTXCPurchase';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { PlayCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  description: string;
  featureId: string;
  cost: number;
  metadata?: Record<string, any>;
  expected: 'success' | 'failure';
}

const TEST_CASES: TestCase[] = [
  {
    id: 'subscription-starter',
    name: 'Pro Starter Subscription',
    description: 'Test subscription purchase for Pro Starter plan',
    featureId: 'pro_subscription',
    cost: 25000,
    metadata: { packageType: 'Pro Starter', isSubscription: true },
    expected: 'success'
  },
  {
    id: 'subscription-business',
    name: 'Pro Business Subscription',
    description: 'Test subscription purchase for Pro Business plan',
    featureId: 'pro_subscription',
    cost: 35000,
    metadata: { packageType: 'Pro Business', isSubscription: true },
    expected: 'success'
  },
  {
    id: 'feature-template',
    name: 'Premium Template',
    description: 'Test feature purchase for premium template',
    featureId: 'premium_resume_template',
    cost: 500,
    expected: 'success'
  },
  {
    id: 'insufficient-balance',
    name: 'Insufficient Balance Test',
    description: 'Test purchase with insufficient TXC balance',
    featureId: 'expensive_feature',
    cost: 999999,
    expected: 'failure'
  }
];

export const TXCTestSuite: React.FC = () => {
  const { toast } = useToast();
  const { purchaseWithTXC, canAfford, isLoading } = useTXCPurchase();
  const { availableBalance } = useTokenBalance();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'passed' | 'failed'>>({});
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [customTest, setCustomTest] = useState({
    featureId: '',
    cost: 0,
    description: ''
  });

  const runTest = async (testCase: TestCase) => {
    setRunningTest(testCase.id);
    
    try {
      console.log(`Running test: ${testCase.name}`);
      
      const result = await purchaseWithTXC({
        featureId: testCase.featureId,
        cost: testCase.cost,
        description: testCase.description,
        metadata: testCase.metadata
      });

      const passed = (result && testCase.expected === 'success') || 
                    (!result && testCase.expected === 'failure');

      setTestResults(prev => ({
        ...prev,
        [testCase.id]: passed ? 'passed' : 'failed'
      }));

      toast({
        title: passed ? "Test Passed" : "Test Failed",
        description: `${testCase.name}: ${passed ? 'Behaved as expected' : 'Unexpected result'}`,
        variant: passed ? "default" : "destructive"
      });

    } catch (error) {
      console.error(`Test ${testCase.name} error:`, error);
      setTestResults(prev => ({
        ...prev,
        [testCase.id]: testCase.expected === 'failure' ? 'passed' : 'failed'
      }));
    } finally {
      setRunningTest(null);
    }
  };

  const runCustomTest = async () => {
    if (!customTest.featureId || !customTest.cost || !customTest.description) {
      toast({
        title: "Invalid Test",
        description: "Please fill in all fields for the custom test",
        variant: "destructive"
      });
      return;
    }

    setRunningTest('custom');
    
    try {
      const result = await purchaseWithTXC({
        featureId: customTest.featureId,
        cost: customTest.cost,
        description: customTest.description
      });

      toast({
        title: result ? "Custom Test Passed" : "Custom Test Failed",
        description: `Purchase ${result ? 'completed successfully' : 'failed'}`,
        variant: result ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Custom test error:', error);
      toast({
        title: "Custom Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setRunningTest(null);
    }
  };

  const getResultIcon = (testId: string) => {
    const result = testResults[testId];
    if (runningTest === testId) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    switch (result) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <PlayCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResultBadge = (testId: string) => {
    const result = testResults[testId];
    if (runningTest === testId) {
      return <Badge variant="secondary">Running...</Badge>;
    }
    switch (result) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5" />
            <span>TXC Purchase Test Suite</span>
          </CardTitle>
          <div className="text-sm text-gray-600">
            Current TXC Balance: <span className="font-semibold">{availableBalance.toLocaleString()} TXC</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TEST_CASES.map((testCase) => (
              <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getResultIcon(testCase.id)}
                  <div>
                    <h4 className="font-medium">{testCase.name}</h4>
                    <p className="text-sm text-gray-600">{testCase.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Cost: {testCase.cost.toLocaleString()} TXC • Expected: {testCase.expected}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getResultBadge(testCase.id)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runTest(testCase)}
                    disabled={runningTest === testCase.id || isLoading}
                  >
                    Run Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="featureId">Feature ID</Label>
              <Input
                id="featureId"
                placeholder="e.g., pro_subscription"
                value={customTest.featureId}
                onChange={(e) => setCustomTest(prev => ({ ...prev, featureId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost (TXC)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="e.g., 500"
                value={customTest.cost || ''}
                onChange={(e) => setCustomTest(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Test purchase"
                value={customTest.description}
                onChange={(e) => setCustomTest(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <Button 
            onClick={runCustomTest} 
            disabled={runningTest === 'custom' || isLoading}
            className="w-full"
          >
            {runningTest === 'custom' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Custom Test...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Custom Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};