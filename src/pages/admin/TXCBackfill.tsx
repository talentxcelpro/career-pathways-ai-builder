import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calculator, Users, Coins, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import txcMascot from '@/assets/txc-mascot.jpg';
import { SimpleTXCDistribution } from '@/components/admin/SimpleTXCDistribution';
import { RealtimeTestPanel } from '@/components/admin/RealtimeTestPanel';
import { TXCResetPanel } from '@/components/admin/TXCResetPanel';

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

interface RetroactiveResult {
  success: boolean;
  message: string;
  total_rewards: number;
  users_rewarded: number;
}

interface ComprehensiveResult {
  success: boolean;
  message: string;
  phase1_users: number;
  phase2_users: number;
  phase3_users: number;
  total_txc_distributed: number;
}

const TXCBackfill = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRetroProcessing, setIsRetroProcessing] = useState(false);
  const [isComprehensiveProcessing, setIsComprehensiveProcessing] = useState(false);
  const [results, setResults] = useState<BackfillResult | null>(null);
  const [retroResults, setRetroResults] = useState<RetroactiveResult | null>(null);
  const [comprehensiveResults, setComprehensiveResults] = useState<ComprehensiveResult | null>(null);
  const { toast } = useToast();

  const handleBackfill = async () => {
    console.log('🚀 Starting TXC backfill process...');
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to perform this action');
      }
      
      const { data, error } = await supabase.functions.invoke('backfill-user-txc', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.success) {
        setResults(data.statistics);
        toast({
          title: "TXC Backfill Completed! 🎉",
          description: `Processed ${data.statistics?.processed_users || 0} users`,
        });
      } else {
        throw new Error(data?.error || 'Backfill failed');
      }
    } catch (error) {
      toast({
        title: "Backfill Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetroactiveRewards = async () => {
    console.log('🚀 Starting retroactive TXC rewards...');
    setIsRetroProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to perform this action');
      }
      
      const { data, error } = await supabase.functions.invoke('retroactive-txc-rewards', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.success) {
        setRetroResults(data);
        toast({
          title: "Retroactive TXC Rewards Completed! 🎉",
          description: `Awarded rewards to ${data.users_rewarded} users`,
        });
      } else {
        throw new Error(data?.error || 'Retroactive rewards failed');
      }
    } catch (error) {
      toast({
        title: "Retroactive Rewards Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsRetroProcessing(false);
    }
  };

  const handleComprehensiveDistribution = async () => {
    console.log('🚀 Starting comprehensive TXC distribution...');
    setIsComprehensiveProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to perform this action');
      }
      
      const { data, error } = await supabase.functions.invoke('comprehensive-txc-distribution', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);

      if (data?.success) {
        setComprehensiveResults(data);
        toast({
          title: "Comprehensive TXC Distribution Completed! 🎉",
          description: `Distributed ${data.total_txc_distributed} TXC across 3 phases`,
        });
      } else {
        throw new Error(data?.error || 'Comprehensive distribution failed');
      }
    } catch (error) {
      toast({
        title: "Comprehensive Distribution Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsComprehensiveProcessing(false);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-txc-connection');
      
      if (error) throw error;
      
      toast({
        title: data?.success ? "Connection Test Passed ✅" : "Connection Test Failed ❌",
        description: data?.message || "Unknown result",
        variant: data?.success ? "default" : "destructive"
      });
      
      console.log('Connection test result:', data);
    } catch (error) {
      toast({
        title: "Connection Test Failed ❌",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">TXC System Management</h1>
        <p className="text-muted-foreground">Manage TXC distribution, testing, and realtime monitoring</p>
      </div>

      <Tabs defaultValue="distribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
          <TabsTrigger value="reset">Reset TXC</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Tools</TabsTrigger>
          <TabsTrigger value="realtime">Realtime Test</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          {/* Simple TXC Distribution */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={txcMascot} alt="TXC Mascot" className="w-5 h-5 rounded-full object-cover" />
            Simple TXC Distribution (Recommended)
          </CardTitle>
          <CardDescription>
            Reliable phase-by-phase TXC distribution with batch processing and error handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleTXCDistribution />
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={txcMascot} alt="TXC Mascot" className="w-5 h-5 rounded-full object-cover" />
            TXC Connection Test
          </CardTitle>
          <CardDescription>
            Test the connection to TXC functions and database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Connection
          </Button>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="reset">
        <TXCResetPanel />
      </TabsContent>

      <TabsContent value="comprehensive" className="space-y-6">
        {/* Comprehensive TXC Distribution */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={txcMascot} alt="TXC Mascot" className="w-5 h-5 rounded-full object-cover" />
            Comprehensive TXC Distribution
          </CardTitle>
          <CardDescription>
            Execute platform-wide TXC distribution with welcome bonus, active user bonus, and retroactive rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">This will execute a 3-phase TXC distribution:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Phase 1:</strong> 500 TXC welcome bonus to ALL users</li>
              <li>• <strong>Phase 2:</strong> 150 TXC bonus to active users (last 30 days)</li>
              <li>• <strong>Phase 3:</strong> Retroactive rewards from 01-09-2025 (posts, connections, profile completion, job applications)</li>
            </ul>
          </div>

          <Button 
            onClick={handleComprehensiveDistribution}
            disabled={isComprehensiveProcessing}
            className="w-full"
            size="lg"
          >
            {isComprehensiveProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Comprehensive Distribution...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Execute Comprehensive TXC Distribution
              </>
            )}
          </Button>

          {comprehensiveResults && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comprehensive Distribution Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{comprehensiveResults.phase1_users}</div>
                    <div className="text-sm text-muted-foreground">Phase 1 Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{comprehensiveResults.phase2_users}</div>
                    <div className="text-sm text-muted-foreground">Phase 2 Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{comprehensiveResults.phase3_users}</div>
                    <div className="text-sm text-muted-foreground">Phase 3 Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{comprehensiveResults.total_txc_distributed.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total TXC</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="legacy" className="space-y-6">
        {/* Retroactive TXC Rewards */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={txcMascot} alt="TXC Mascot" className="w-5 h-5 rounded-full object-cover" />
            Retroactive TXC Rewards
          </CardTitle>
          <CardDescription>
            Award TXC to existing users based on their past activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">This will award TXC to users based on their existing posts, connections, and profile completion. Rewards include:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• +500 TXC joining bonus</li>
              <li>• Up to 10 posts (+150 each)</li>
              <li>• Up to 10 connections (+75 each)</li>
              <li>• +300 for completed profiles</li>
            </ul>
          </div>

          <Button 
            onClick={handleRetroactiveRewards}
            disabled={isRetroProcessing}
            className="w-full"
            size="lg"
          >
            {isRetroProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Retroactive Rewards...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Award Retroactive TXC
              </>
            )}
          </Button>

          {retroResults && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Retroactive Rewards Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{retroResults.users_rewarded}</div>
                    <div className="text-sm text-muted-foreground">Users Rewarded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{retroResults.total_rewards.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total TXC Awarded</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Historical Backfill */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={txcMascot} alt="TXC Mascot" className="w-5 h-5 rounded-full object-cover" />
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
              <li>• Awards 500 TXC joining bonus</li>
              <li>• Awards 150 TXC for each post created (up to 10 posts)</li>
              <li>• Awards 75 TXC for each connection made (up to 10 connections)</li>
              <li>• Awards 300 TXC for completed profiles (name, title, about, photo)</li>
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
      </TabsContent>

      <TabsContent value="realtime">
        <RealtimeTestPanel />
      </TabsContent>

      </Tabs>
    </div>
  );
};

export default TXCBackfill;