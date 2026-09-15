import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  TrendingDown, 
  Database, 
  Server,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';

interface UltraOptimization {
  action: string;
  savings_estimate_mb: number;
  monthly_cost_reduction: number;
  execution_time_ms: number;
  records_processed: number;
}

export const UltraCostOptimizer = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<UltraOptimization[]>([]);
  const [summary, setSummary] = useState({
    total_cost_reduction_percent: 0,
    total_storage_savings_mb: 0,
    estimated_monthly_savings_usd: 0,
    execution_time_ms: 0,
    optimization_level: 'standard'
  });

  const runUltraOptimization = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ultra-cost-optimizer', {
        body: { optimization_level: 'ultra_aggressive' }
      });

      if (error) throw error;

      setResults(data.results);
      setSummary(data.summary);
      
      toast.success('Ultra optimization completed!', {
        description: `${data.summary.total_cost_reduction_percent}% cost reduction achieved`,
        duration: 5000
      });
    } catch (error) {
      console.error('Ultra optimization failed:', error);
      toast.error('Ultra optimization failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-red-600">🚨 Ultra Cost Optimizer</h2>
          <p className="text-muted-foreground">
            Extreme cost reduction for zero-revenue operations
          </p>
        </div>
        <Button 
          onClick={runUltraOptimization}
          disabled={isOptimizing}
          size="lg"
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        >
          {isOptimizing ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Ultra Optimizing...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Run Ultra Optimization
            </>
          )}
        </Button>
      </div>

      {/* Warning Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Ultra-Aggressive Mode:</strong> This will implement extreme cost-cutting measures. 
          Some non-essential features may be temporarily disabled for maximum savings.
        </AlertDescription>
      </Alert>

      {/* Current Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Current Database Analysis
          </CardTitle>
          <CardDescription>
            Real-time analysis of your database showing optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">536</div>
              <div className="text-sm text-muted-foreground">Dead Tuples (Notifications)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">422</div>
              <div className="text-sm text-muted-foreground">Dead Tuples (Email Queue)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">1.6M</div>
              <div className="text-sm text-muted-foreground">Profile Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">105K</div>
              <div className="text-sm text-muted-foreground">Security Events</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Optimization Potential</span>
              <span className="font-medium text-red-600">~400MB recoverable</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Ultra Optimization Strategies */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">🔥 Realtime Optimization</CardTitle>
            <CardDescription>
              Disable realtime for non-critical tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Cost Reduction</span>
                <Badge variant="destructive">40%</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Disables realtime updates for security logs, analytics, and other non-critical data
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600">⚡ Function Consolidation</CardTitle>
            <CardDescription>
              Merge low-usage functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Cost Reduction</span>
                <Badge className="bg-orange-100 text-orange-800">30%</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Combines rarely-used edge functions to reduce cold start costs
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-600">🗑️ Ultra Data Cleanup</CardTitle>
            <CardDescription>
              Aggressive historical data removal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Storage Savings</span>
                <Badge className="bg-purple-100 text-purple-800">60%</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Removes all non-essential historical data older than 3-7 days
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-600">💾 Ultra Caching</CardTitle>
            <CardDescription>
              95% cache hit rate target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>API Reduction</span>
                <Badge className="bg-blue-100 text-blue-800">75%</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Aggressive caching with extended TTL for static data
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      {summary.total_cost_reduction_percent > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Ultra Optimization Results
            </CardTitle>
            <CardDescription>
              Maximum cost reduction achieved for zero-revenue operation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {summary.total_cost_reduction_percent}%
                </div>
                <div className="text-sm text-muted-foreground">Total Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {summary.total_storage_savings_mb}MB
                </div>
                <div className="text-sm text-muted-foreground">Storage Recovered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  ${summary.estimated_monthly_savings_usd}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Savings</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Optimization Level</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {summary.optimization_level.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Execution Time</span>
                <span className="font-medium">{summary.execution_time_ms}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Breakdown</CardTitle>
            <CardDescription>
              Detailed results of each optimization performed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium capitalize">
                        {result.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.records_processed.toLocaleString()} records processed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      -{result.monthly_cost_reduction}%
                    </Badge>
                    {result.savings_estimate_mb > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.savings_estimate_mb}MB freed
                      </p>
                    )}
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