import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const TXCSystemTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        addResult('Authentication', 'error', 'User not authenticated');
        setIsRunning(false);
        return;
      }
      addResult('Authentication', 'success', `User authenticated: ${user.email}`);

      // Test 2: Check if database function exists
      try {
        const { data: functionCheck, error: functionError } = await supabase
          .rpc('get_active_user_ids', { days_back: 30 });
        
        if (functionError) {
          addResult('Database Function', 'error', `Function error: ${functionError.message}`);
        } else {
          addResult('Database Function', 'success', `Function works, returned ${functionCheck?.length || 0} active users`);
        }
      } catch (error) {
        addResult('Database Function', 'error', `Function test failed: ${error}`);
      }

      // Test 3: Check current TXC balance
      try {
        const { data: balance, error: balanceError } = await supabase
          .from('user_txc_balances')
          .select('txc_balance, total_earned')
          .eq('user_id', user.id)
          .single();

        if (balanceError && balanceError.code !== 'PGRST116') {
          addResult('TXC Balance', 'error', `Balance check failed: ${balanceError.message}`);
        } else {
          addResult('TXC Balance', 'success', `Current balance: ${balance?.txc_balance || 0} TXC`, balance);
        }
      } catch (error) {
        addResult('TXC Balance', 'error', `Balance test failed: ${error}`);
      }

      // Test 4: Test TXC distribution function (dry run)
      try {
        const { data: distributionResult, error: distributionError } = await supabase.functions.invoke('simple-txc-distribution', {
          body: {
            phase: 'welcome',
            batchSize: 1,
            startOffset: 0,
            dryRun: true
          }
        });

        if (distributionError) {
          addResult('TXC Distribution', 'error', `Distribution test failed: ${distributionError.message}`);
        } else {
          addResult('TXC Distribution', 'success', 'Distribution function is working', distributionResult);
        }
      } catch (error) {
        addResult('TXC Distribution', 'error', `Distribution test failed: ${error}`);
      }

    } catch (error) {
      addResult('System Test', 'error', `Overall test failed: ${error}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          TXC System Diagnostics
        </CardTitle>
        <CardDescription>
          Test the TXC token system to identify any issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run TXC System Tests'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.data && (
                    <pre className="text-xs bg-background p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};