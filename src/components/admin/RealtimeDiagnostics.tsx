import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { realtimeManager } from '@/lib/realtimeManager';
import { useSafeRealtimeContext } from '@/components/realtime/SafeRealtimeProvider';
import { useTXCRealtime } from '@/hooks/useTXCRealtime';
import { consolidatedRealtimeManager } from '@/lib/consolidatedRealtimeManager';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const RealtimeDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  
  const safeRealtime = useSafeRealtimeContext();
  const txcRealtime = useTXCRealtime();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {};

    try {
      // 1. Auth Status
      const { data: { session } } = await supabase.auth.getSession();
      results.auth = {
        status: session ? 'authenticated' : 'anonymous',
        userId: session?.user?.id || null,
        expires: session?.expires_at || null
      };

      // 2. Realtime Manager Status
      const managerStatus = realtimeManager.getStatus();
      results.realtimeManager = {
        initialized: realtimeManager.initialized,
        channelCount: Object.keys(managerStatus).length,
        connectedChannels: Object.values(managerStatus).filter(s => s === 'SUBSCRIBED').length,
        channels: managerStatus
      };

      // 3. Safe Realtime Provider Status
      results.safeProvider = {
        isConnected: safeRealtime.isConnected,
        lastUpdate: safeRealtime.lastUpdate?.table || null,
        connectionStatus: safeRealtime.connectionStatus,
        usePollingFallback: safeRealtime.usePollingFallback
      };

      // 4. Consolidated Realtime Status
      const consolidatedStatus = consolidatedRealtimeManager.getStatus();
      results.consolidatedRealtime = {
        authInitialized: consolidatedStatus.authInitialized,
        isAuthenticated: consolidatedStatus.isAuthenticated,
        totalSubscriptions: consolidatedStatus.totalSubscriptions
      };

      // 5. TXC Realtime Status
      results.txcRealtime = {
        isConnected: txcRealtime.isConnected,
        onlineUsers: txcRealtime.onlineUsers.length,
        recentTransactions: txcRealtime.recentTransactions.length
      };

      // 6. Database Connectivity Test
      try {
        const { data: testQuery } = await supabase
          .from('jobs')
          .select('id')
          .limit(1);
        results.database = {
          status: 'connected',
          canRead: !!testQuery
        };
      } catch (error) {
        results.database = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // 7. Publication Check
      try {
        const { data: publications } = await supabase.rpc('get_realtime_publications');
        results.publications = {
          available: !!publications,
          count: publications?.length || 0,
          tables: publications?.filter((p: any) => p.in_publication).map((p: any) => p.table_name) || []
        };
      } catch (error) {
        results.publications = {
          available: false,
          error: error instanceof Error ? error.message : 'Function not available'
        };
      }

      setDiagnostics(results);
    } catch (error) {
      console.error('Diagnostics error:', error);
      setDiagnostics({
        error: error instanceof Error ? error.message : 'Diagnostics failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    
    if (status === 'authenticated' || status === 'connected') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: boolean | string, label: string) => {
    const variant = 
      (typeof status === 'boolean' && status) || 
      status === 'authenticated' || 
      status === 'connected' 
        ? 'default' 
        : 'destructive';
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Realtime System Diagnostics</CardTitle>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {diagnostics.error ? (
          <div className="text-red-500">Error: {diagnostics.error}</div>
        ) : (
          <>
            {/* Authentication Status */}
            {diagnostics.auth && (
              <div className="space-y-2">
                <h4 className="font-semibold">Authentication</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.auth.status, diagnostics.auth.status)}
                  {diagnostics.auth.userId && (
                    <span className="text-sm text-muted-foreground">
                      User: {diagnostics.auth.userId.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Database Status */}
            {diagnostics.database && (
              <div className="space-y-2">
                <h4 className="font-semibold">Database Connectivity</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.database.status, diagnostics.database.status)}
                  {diagnostics.database.error && (
                    <span className="text-sm text-red-500">{diagnostics.database.error}</span>
                  )}
                </div>
              </div>
            )}

            {/* Publications */}
            {diagnostics.publications && (
              <div className="space-y-2">
                <h4 className="font-semibold">Realtime Publications</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.publications.available, 
                    diagnostics.publications.available ? 
                      `${diagnostics.publications.count} tables published` : 
                      'Not available'
                  )}
                </div>
                {diagnostics.publications.tables?.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Published: {diagnostics.publications.tables.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Realtime Manager */}
            {diagnostics.realtimeManager && (
              <div className="space-y-2">
                <h4 className="font-semibold">Realtime Manager</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.realtimeManager.initialized, 'Initialized')}
                  <span className="text-sm text-muted-foreground">
                    {diagnostics.realtimeManager.connectedChannels}/{diagnostics.realtimeManager.channelCount} channels
                  </span>
                </div>
                {Object.entries(diagnostics.realtimeManager.channels).map(([table, status]) => (
                  <div key={table} className="flex items-center gap-2 text-sm">
                    {getStatusIcon(status === 'SUBSCRIBED')}
                    <span>{table}: {status as string}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Safe Provider */}
            {diagnostics.safeProvider && (
              <div className="space-y-2">
                <h4 className="font-semibold">Safe Realtime Provider</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.safeProvider.isConnected, 'Connected')}
                  {diagnostics.safeProvider.lastUpdate && (
                    <span className="text-sm text-muted-foreground">
                      Last: {diagnostics.safeProvider.lastUpdate}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Consolidated Realtime */}
            {diagnostics.consolidatedRealtime && (
              <div className="space-y-2">
                <h4 className="font-semibold">Consolidated Realtime</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.consolidatedRealtime.authInitialized, 'Initialized')}
                  <span className="text-sm text-muted-foreground">
                    {diagnostics.consolidatedRealtime.totalSubscriptions} subscriptions
                  </span>
                </div>
              </div>
            )}

            {/* TXC Realtime */}
            {diagnostics.txcRealtime && (
              <div className="space-y-2">
                <h4 className="font-semibold">TXC Realtime</h4>
                <div className="flex items-center gap-2">
                  {getStatusBadge(diagnostics.txcRealtime.isConnected, 'Connected')}
                  <span className="text-sm text-muted-foreground">
                    {diagnostics.txcRealtime.onlineUsers} users, {diagnostics.txcRealtime.recentTransactions} transactions
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};