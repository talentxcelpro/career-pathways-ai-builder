import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Rocket,
  Zap,
  Database,
  Trash2,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { runProductionCleanup, checkProductionReadiness } from '@/utils/productionDataCleanup';
import { toast } from 'sonner';

export const ProductionCleanupRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<any>(null);
  const [readinessCheck, setReadinessCheck] = useState<any>(null);

  const executeCleanup = async () => {
    setIsRunning(true);
    
    try {
      toast.info('🧹 Starting production cleanup...');
      
      // Run comprehensive cleanup
      const results = await runProductionCleanup();
      setCleanupResults(results);
      
      // Check readiness after cleanup
      const readiness = await checkProductionReadiness();
      setReadinessCheck(readiness);
      
      if (results.productionReady) {
        toast.success('🎉 Production cleanup complete! 100% ready for launch');
      } else {
        toast.success(`✅ Cleanup complete: ${results.mockDataRemoved} mock items removed, ${results.inrReferencesFixed} currency references fixed`);
      }
      
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('❌ Cleanup failed - check console for details');
    } finally {
      setIsRunning(false);
    }
  };

  const checkReadiness = async () => {
    try {
      const readiness = await checkProductionReadiness();
      setReadinessCheck(readiness);
    } catch (error) {
      console.error('Readiness check error:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Production Cleanup & Launch Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Automatically clean mock data, fix currency references, and achieve 100% launch readiness.
          </p>
          
          <div className="flex gap-3">
            <Button 
              onClick={executeCleanup} 
              disabled={isRunning}
              size="lg"
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              {isRunning ? 'Running Cleanup...' : 'Execute Full Cleanup'}
            </Button>
            
            <Button 
              onClick={checkReadiness} 
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Readiness
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Results */}
      {cleanupResults && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Cleanup Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg bg-white">
                <div className="text-2xl font-bold text-blue-600">{cleanupResults.mockDataRemoved}</div>
                <p className="text-sm text-muted-foreground">Mock Data Cleaned</p>
                <Trash2 className="w-5 h-5 text-blue-500 mx-auto mt-2" />
              </div>
              <div className="text-center p-4 border rounded-lg bg-white">
                <div className="text-2xl font-bold text-green-600">{cleanupResults.inrReferencesFixed}</div>
                <p className="text-sm text-muted-foreground">Currency Fixed</p>
                <DollarSign className="w-5 h-5 text-green-500 mx-auto mt-2" />
              </div>
              <div className="text-center p-4 border rounded-lg bg-white">
                <div className="text-2xl font-bold text-purple-600">{cleanupResults.testContentCleaned}</div>
                <p className="text-sm text-muted-foreground">Templates Cleaned</p>
                <Database className="w-5 h-5 text-purple-500 mx-auto mt-2" />
              </div>
            </div>
            
            {cleanupResults.productionReady ? (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 <strong>100% PRODUCTION READY!</strong> All cleanup tasks completed successfully.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  Cleanup in progress. Run readiness check to see remaining issues.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Readiness Check */}
      {readinessCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Production Readiness Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">{readinessCheck.score}%</div>
                <p className="text-sm text-muted-foreground">Readiness Score</p>
              </div>
              <Badge 
                variant={readinessCheck.ready ? "default" : "secondary"}
                className="text-lg px-4 py-2"
              >
                {readinessCheck.ready ? "✅ READY" : "🔄 IN PROGRESS"}
              </Badge>
            </div>
            
            {readinessCheck.issues.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium text-red-600">Remaining Issues:</p>
                {readinessCheck.issues.map((issue: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {issue}
                  </div>
                ))}
              </div>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🚀 <strong>LAUNCH APPROVED!</strong> No issues detected. Ready for production deployment.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🧹 Data Cleanup</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Remove all test users, mock content, and placeholder data
              </p>
              <Badge variant="outline">Automated cleanup</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">💰 Currency Conversion</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Convert all INR references to TXC currency system
              </p>
              <Badge variant="outline">Smart replacement</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};