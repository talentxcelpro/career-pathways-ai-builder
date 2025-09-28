import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, DollarSign, Award, CheckCircle } from 'lucide-react';

interface DistributionResult {
  success: boolean;
  message: string;
  summary: {
    phase: string;
    processed_count: number;
    total_awarded: number;
    success_count: number;
    error_count: number;
    dry_run: boolean;
  };
}

export const SimpleTXCDistribution: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<DistributionResult | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<'welcome' | 'active' | 'retroactive'>('welcome');
  const [isDryRun, setIsDryRun] = useState(true);
  const { toast } = useToast();

  const executeDistribution = async (phase: 'welcome' | 'active' | 'retroactive', dryRun = true) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('simple-txc-distribution', {
        body: {
          phase,
          batchSize: 50,
          startOffset: 0,
          dryRun
        }
      });

      if (error) throw error;

      setLastResult(data);
      toast({
        title: `${dryRun ? 'Simulation' : 'Distribution'} Complete!`,
        description: data.message,
        variant: "default"
      });
    } catch (error) {
      console.error('Distribution error:', error);
      toast({
        title: "Error",
        description: "Failed to execute distribution. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const phaseConfig = {
    welcome: {
      title: 'Phase 1: Welcome Bonus',
      description: '500 TXC for new users without existing balance',
      icon: Users,
      color: 'bg-blue-500',
      estimated: '457 users × 500 TXC = 228,500 TXC'
    },
    active: {
      title: 'Phase 2: Active User Bonus', 
      description: '150 TXC for users active in last 30 days',
      icon: DollarSign,
      color: 'bg-green-500',
      estimated: '~8 users × 150 TXC = 1,200 TXC'
    },
    retroactive: {
      title: 'Phase 3: Retroactive Rewards',
      description: 'Variable rewards based on user contributions',
      icon: Award,
      color: 'bg-purple-500', 
      estimated: '~40-50 users × avg 800 TXC = 32,000 TXC'
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(phaseConfig).map(([phase, config]) => {
          const Icon = config.icon;
          const isSelected = selectedPhase === phase;
          
          return (
            <Card 
              key={phase}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedPhase(phase as typeof selectedPhase)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">{config.title}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-xs">
                  {config.estimated}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execute TXC Distribution</CardTitle>
          <CardDescription>
            Run the selected phase distribution. Always test with dry run first!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="dryRun"
              checked={isDryRun}
              onChange={(e) => setIsDryRun(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="dryRun" className="text-sm font-medium">
              Dry Run (simulation only - no actual TXC awarded)
            </label>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => executeDistribution(selectedPhase, isDryRun)}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isDryRun ? 'Simulate' : 'Execute'} {phaseConfig[selectedPhase].title}
            </Button>
          </div>

          {!isDryRun && (
            <Alert>
              <AlertDescription className="text-sm">
                ⚠️ <strong>WARNING:</strong> This will award real TXC tokens. Make sure you've tested with dry run first!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Last Distribution Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Phase</div>
                <div className="font-bold capitalize">{lastResult.summary.phase}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Processed</div>
                <div className="font-bold">{lastResult.summary.processed_count} users</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">TXC Awarded</div>
                <div className="font-bold">{lastResult.summary.total_awarded.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Success Rate</div>
                <div className="font-bold">
                  {lastResult.summary.processed_count > 0 
                    ? Math.round((lastResult.summary.success_count / lastResult.summary.processed_count) * 100)
                    : 0}%
                </div>
              </div>
            </div>
            
            {lastResult.summary.dry_run && (
              <Alert className="mt-4">
                <AlertDescription>
                  This was a simulation. No actual TXC was awarded.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Distribution Overview</CardTitle>
          <CardDescription>
            Total estimated distribution across all phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Phase 1 (Welcome):</span>
              <span className="font-mono">228,500 TXC</span>
            </div>
            <div className="flex justify-between">
              <span>Phase 2 (Active):</span>
              <span className="font-mono">1,200 TXC</span>
            </div>
            <div className="flex justify-between">
              <span>Phase 3 (Retroactive):</span>
              <span className="font-mono">32,000 TXC</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Estimated:</span>
              <span className="font-mono">261,700 TXC</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};