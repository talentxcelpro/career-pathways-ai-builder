import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calculator, Users, Coins } from 'lucide-react';

interface BackfillResult {
  total_users: number;
  processed_users: number;
  error_count: number;
  calculations: Array<{
    email: string;
    full_name: string;
    total_txc: number;
    posts_txc: number;
    connections_txc: number;
  }>;
}

const TXCBackfill = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BackfillResult | null>(null);
  const { toast } = useToast();

  const handleBackfill = async () => {
    console.log('🚀 Starting TXC backfill process...');
    setIsProcessing(true);
    
    try {
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to perform this action');
      }
      
      console.log('📡 Invoking backfill-user-txc function...');
      const { data, error } = await supabase.functions.invoke('backfill-user-txc', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('📊 Function response:', { data, error });

      if (error) {
        console.error('❌ Function error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        console.log('✅ Backfill completed successfully:', data.statistics);
        setResults(data.statistics);
        toast({
          title: "TXC Backfill Completed! 🎉",
          description: `Processed ${data.statistics?.processed_users || 0} users`,
          variant: "default"
        });
      } else {
        console.error('❌ Backfill failed:', data);
        throw new Error(data?.error || 'Backfill failed');
      }
    } catch (error) {
      console.error('❌ Backfill error:', error);
      toast({
        title: "Backfill Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            TXC Historical Backfill
          </CardTitle>
          <CardDescription>
            Calculate and award TXC tokens to all users based on their historical activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">What this process does:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Awards 150 TXC for each post created</li>
              <li>• Awards 75 TXC for each connection made</li>
              <li>• Awards 500 TXC joining bonus</li>
              <li>• Awards 300 TXC profile completion bonus</li>
              <li>• Awards daily login bonuses (75 TXC per day)</li>
              <li>• Awards weekly social activity bonuses (300 TXC per week)</li>
            </ul>
          </div>

          <Button 
            onClick={handleBackfill}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing TXC Backfill...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Start TXC Backfill Process
              </>
            )}
          </Button>

          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Backfill Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.total_users}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.processed_users}</div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{results.error_count}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>

                {results.calculations && results.calculations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Sample Calculations:</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {results.calculations.map((calc, index) => (
                        <div key={index} className="bg-muted rounded p-3 text-sm">
                          <div className="font-medium">{calc.full_name} ({calc.email})</div>
                          <div className="text-muted-foreground">
                            Total TXC: {calc.total_txc.toLocaleString()} 
                            (Posts: {calc.posts_txc}, Connections: {calc.connections_txc})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TXCBackfill;