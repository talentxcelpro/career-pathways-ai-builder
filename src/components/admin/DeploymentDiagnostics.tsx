import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Zap,
  Monitor,
  GitBranch
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED' | 'QUEUED';
  type: string;
  created: number;
  ready?: number;
  buildingAt?: number;
  target?: string;
  source?: string;
  meta?: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
  };
}

interface DeploymentError {
  message: string;
  timestamp: number;
  source?: string;
}

export const DeploymentDiagnostics = () => {
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch deployments
  const { 
    data: deployments, 
    isLoading, 
    error: deploymentsError 
  } = useQuery({
    queryKey: ['vercel-deployments'],
    queryFn: async (): Promise<Deployment[]> => {
      const { data, error } = await supabase.functions.invoke('vercel-diagnostics', {
        body: { action: 'list-deployments' }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch deployments');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch deployments');
      }

      return data.deployments || [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Fetch deployment errors
  const { data: deploymentErrors } = useQuery({
    queryKey: ['deployment-errors', selectedDeployment],
    queryFn: async (): Promise<DeploymentError[]> => {
      if (!selectedDeployment) return [];

      const { data, error } = await supabase.functions.invoke('vercel-diagnostics', {
        body: { 
          action: 'get-deployment-errors',
          deploymentId: selectedDeployment
        }
      });

      if (error) {
        console.error('Error fetching deployment errors:', error);
        return [];
      }

      return data?.errors || [];
    },
    enabled: !!selectedDeployment,
    staleTime: 60000, // 1 minute
  });

  // Trigger redeploy mutation
  const redeployMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('vercel-diagnostics', {
        body: { action: 'trigger-redeploy' }
      });

      if (error) {
        throw new Error(error.message || 'Failed to trigger redeploy');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to trigger redeploy');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Redeploy triggered successfully!');
      queryClient.invalidateQueries({ queryKey: ['vercel-deployments'] });
    },
    onError: (error: Error) => {
      toast.error(`Redeploy failed: ${error.message}`);
    },
  });

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'READY':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'BUILDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Building</Badge>;
      case 'ERROR':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'CANCELED':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Canceled</Badge>;
      case 'QUEUED':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (start: number, end?: number) => {
    if (!end) return 'In progress...';
    const duration = Math.round((end - start) / 1000);
    return `${duration}s`;
  };

  if (deploymentsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Deployments</AlertTitle>
        <AlertDescription>
          {deploymentsError.message}
          <br />
          <small className="text-muted-foreground mt-2 block">
            Make sure VERCEL_TOKEN is configured in your secrets
          </small>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment Diagnostics</h2>
          <p className="text-muted-foreground">Monitor and manage your Vercel deployments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['vercel-deployments'] })}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => redeployMutation.mutate()}
            disabled={redeployMutation.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            {redeployMutation.isPending ? 'Triggering...' : 'Redeploy'}
          </Button>
        </div>
      </div>

      {/* Environment Variables Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Environment Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">VITE_SUPABASE_URL</span>
              <Badge variant={import.meta.env.VITE_SUPABASE_URL ? "default" : "destructive"}>
                {import.meta.env.VITE_SUPABASE_URL ? "✓" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">VITE_SUPABASE_PUBLISHABLE_KEY</span>
              <Badge variant={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "default" : "destructive"}>
                {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✓" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Build Environment</span>
              <Badge variant="secondary">
                {import.meta.env.DEV ? "Development" : "Production"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Mode</span>
              <Badge variant="outline">
                {import.meta.env.MODE}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
          <CardDescription>
            Last 5 deployments from Vercel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading deployments...
            </div>
          ) : !deployments?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No deployments found. Check your VERCEL_TOKEN configuration.
            </div>
          ) : (
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div
                  key={deployment.uid}
                  className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                    selectedDeployment === deployment.uid ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDeployment(
                    selectedDeployment === deployment.uid ? null : deployment.uid
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(deployment.state)}
                      <div>
                        <div className="font-medium">{deployment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {deployment.meta?.githubCommitMessage || deployment.target || 'No commit message'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDuration(deployment.buildingAt || deployment.created, deployment.ready)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(deployment.created)}
                      </div>
                    </div>
                  </div>
                  
                  {deployment.meta?.githubCommitSha && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      <span>{deployment.meta.githubCommitRef}</span>
                      <span>•</span>
                      <span>{deployment.meta.githubCommitSha.substring(0, 7)}</span>
                    </div>
                  )}

                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Click to {selectedDeployment === deployment.uid ? 'hide' : 'view'} details
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://vercel.com/${deployment.url}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Vercel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Errors */}
      {selectedDeployment && deploymentErrors && deploymentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Build Errors
            </CardTitle>
            <CardDescription>
              Errors from the selected deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deploymentErrors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Build Error</AlertTitle>
                  <AlertDescription className="font-mono text-sm">
                    {error.message}
                    {error.source && (
                      <div className="mt-1 text-xs">
                        Source: {error.source}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Fix Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">No Deployments Showing</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Check your Vercel token configuration:
              </p>
              <ol className="text-sm space-y-1 ml-4 list-decimal">
                <li>Go to Vercel Dashboard → Settings → Tokens</li>
                <li>Create a new token with appropriate permissions</li>
                <li>Add it as VERCEL_TOKEN in your Lovable secrets</li>
              </ol>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Build Failures</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Common causes:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Missing environment variables (VITE_SUPABASE_*)</li>
                <li>Node.js version mismatch</li>
                <li>Browser-incompatible modules (e.g., nodemailer)</li>
                <li>TypeScript errors</li>
              </ul>
            </div>

            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Auto-Deploy Not Working</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Check these settings in Vercel:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Git → Auto-Deploy is enabled</li>
                <li>Production Branch is set correctly</li>
                <li>Ignored Build Step is not preventing builds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};