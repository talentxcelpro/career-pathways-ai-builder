import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Database, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { runProductionCleanup, checkProductionReadiness } from '@/utils/productionDataCleanup';
import { cleanupHardcodedKeys } from '@/utils/secureApiConfig';

export const Phase1CriticalFixes: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [readinessScore, setReadinessScore] = useState(0);

  const executePhase1 = async () => {
    setIsRunning(true);
    toast.info('🚀 Starting Phase 1: Critical Fixes...');

    try {
      // Step 1: Security cleanup
      toast.info('🔒 Step 1: Securing API keys...');
      cleanupHardcodedKeys();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Data cleanup
      toast.info('🧹 Step 2: Cleaning production data...');
      const cleanupResult = await runProductionCleanup();
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Readiness check
      toast.info('✅ Step 3: Checking production readiness...');
      const readinessResult = await checkProductionReadiness();
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResults({
        cleanup: cleanupResult,
        readiness: readinessResult
      });
      setReadinessScore(readinessResult.score);

      if (readinessResult.ready) {
        toast.success('🎉 Phase 1 Complete! Production ready.');
      } else {
        toast.warning(`⚠️ Phase 1 Complete. Score: ${readinessResult.score}%. Issues remaining.`);
      }

    } catch (error) {
      console.error('Phase 1 execution error:', error);
      toast.error('❌ Phase 1 failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Phase 1: Critical Launch Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Production Readiness</p>
              <div className={`text-3xl font-bold ${getScoreColor(readinessScore)}`}>
                {readinessScore}%
              </div>
            </div>
            <Button 
              onClick={executePhase1} 
              disabled={isRunning}
              size="lg"
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running Fixes...' : 'Execute Phase 1'}
            </Button>
          </div>
          
          {readinessScore > 0 && (
            <Progress value={readinessScore} className="mb-4" />
          )}
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Cleanup Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Cleanup Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.cleanup.mockDataRemoved}
                  </div>
                  <p className="text-sm text-muted-foreground">Mock Data Cleaned</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.cleanup.inrReferencesFixed}
                  </div>
                  <p className="text-sm text-muted-foreground">INR→TXC Converted</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.cleanup.testContentCleaned}
                  </div>
                  <p className="text-sm text-muted-foreground">Templates Cleaned</p>
                </div>
              </div>
              
              <Badge 
                variant={results.cleanup.productionReady ? 'default' : 'destructive'}
                className="w-full justify-center"
              >
                {results.cleanup.productionReady ? '✅ Data Production Ready' : '⚠️ More Cleanup Needed'}
              </Badge>
            </CardContent>
          </Card>

          {/* Readiness Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Production Readiness Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.readiness.issues.length > 0 ? (
                <div className="space-y-2">
                  {results.readiness.issues.map((issue: string, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{issue}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-600">
                    🎉 No critical issues found! Ready for production deployment.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {readinessScore >= 90 ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-semibold">🚀 Ready for Production Launch!</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ Critical security issues resolved</li>
                    <li>✅ Mock data cleaned up</li>
                    <li>✅ Currency conversion complete</li>
                    <li>✅ Authentication hardened</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Proceed with Phase 2: Performance optimization and final deployment preparation.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-yellow-600 font-semibold">⚠️ Additional fixes required before launch</p>
                  <p className="text-sm text-muted-foreground">
                    Address the remaining issues above, then re-run Phase 1 to verify readiness.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};