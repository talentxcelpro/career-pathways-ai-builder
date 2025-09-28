import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ResetResult {
  success: boolean;
  message: string;
  reset_count: number;
  remaining_balances: number;
  top_balances_before_reset?: any[];
}

export const TXCResetPanel: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('reset-txc-balances', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setResetResult(data);
        toast.success('TXC balances reset successfully!');
      } else {
        throw new Error(data?.error || 'Reset failed');
      }
    } catch (error) {
      console.error('Reset failed:', error);
      toast.error(`Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsResetting(false);
      setShowConfirmation(false);
    }
  };

  const ConfirmationDialog = () => (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <div className="space-y-3">
          <div className="font-semibold text-red-800">⚠️ CRITICAL ACTION: Reset All TXC Balances</div>
          <div className="text-sm text-red-700">
            This will permanently reset ALL user TXC balances to 0. This action cannot be undone.
          </div>
          <div className="text-sm text-red-700">
            <strong>Use cases:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Fresh start before comprehensive distribution</li>
              <li>Fixing data corruption issues</li>
              <li>Testing distribution systems</li>
            </ul>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleReset}
              disabled={isResetting}
              variant="destructive"
              size="sm"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Reset All Balances
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              size="sm"
              disabled={isResetting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <RotateCcw className="h-5 w-5" />
          TXC Balance Reset
        </CardTitle>
        <CardDescription className="text-red-600">
          Reset all user TXC balances to 0 before running fresh distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold">When to use TXC Reset:</div>
              <ul className="text-sm space-y-1">
                <li>• <strong>Fresh Distribution:</strong> Start with clean slate before comprehensive distribution</li>
                <li>• <strong>Data Correction:</strong> Fix issues with incorrect balances</li>
                <li>• <strong>Testing:</strong> Clean data before testing distribution systems</li>
              </ul>
              <div className="mt-2 text-sm">
                <strong>⚠️ Warning:</strong> This permanently removes all existing TXC balances!
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {!showConfirmation ? (
          <Button
            onClick={() => setShowConfirmation(true)}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All TXC Balances
          </Button>
        ) : (
          <ConfirmationDialog />
        )}

        {resetResult && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 text-lg">Reset Completed ✅</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{resetResult.reset_count}</div>
                  <div className="text-sm text-green-700">Balances Reset</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{resetResult.remaining_balances}</div>
                  <div className="text-sm text-green-700">Remaining Non-Zero</div>
                </div>
              </div>
              
              <Badge variant="secondary" className="w-fit">
                {resetResult.message}
              </Badge>

              {resetResult.top_balances_before_reset && resetResult.top_balances_before_reset.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-green-800 mb-2">
                    Top Balances Before Reset:
                  </div>
                  <div className="text-xs space-y-1 bg-white p-2 rounded border">
                    {resetResult.top_balances_before_reset.map((balance, index) => (
                      <div key={index} className="flex justify-between">
                        <span>User #{index + 1}</span>
                        <span className="font-mono">{balance.txc_balance.toLocaleString()} TXC</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="text-blue-800">
              <strong>Recommended Workflow:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1 text-sm">
                <li>Reset all TXC balances to 0 (this panel)</li>
                <li>Run comprehensive TXC distribution</li>
                <li>Verify final distribution amounts</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
};