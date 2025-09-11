import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const statusColors: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  success: { variant: 'secondary', label: 'Healthy' },
  error: { variant: 'destructive', label: 'Error' },
  timeout: { variant: 'destructive', label: 'Timeout' },
  warning: { variant: 'outline', label: 'Warning' },
};

const EdgeFunctionsMonitor: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['function-health-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('function_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edge Functions Monitor</h1>
          <p className="text-sm text-muted-foreground">Live status, performance, and recent errors</p>
        </div>
        <button onClick={() => refetch()} className="px-3 py-2 rounded-md border hover:bg-muted transition-colors text-sm">
          Refresh
        </button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Function Activity</CardTitle>
          <a
            href={`https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/functions`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Open in Supabase
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading recent activity...</div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Failed to load logs. Ensure admin access and RLS policies allow viewing.
            </div>
          )}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="py-2 pr-4">Function</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Response (ms)</th>
                    <th className="py-2 pr-4">Requests</th>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((row: any) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{row.function_name}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={statusColors[row.status]?.variant || 'outline'}>
                          {statusColors[row.status]?.label || row.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">{row.response_time_ms ?? '—'}</td>
                      <td className="py-2 pr-4">{row.request_count ?? 1}</td>
                      <td className="py-2 pr-4 flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 text-muted-foreground max-w-[300px] truncate" title={row.error_message || ''}>
                        {row.error_message || '—'}
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          No recent issues detected.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeFunctionsMonitor;
