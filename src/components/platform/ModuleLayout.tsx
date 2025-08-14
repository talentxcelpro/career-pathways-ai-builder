import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModuleConfig, ModuleName } from '@/types/platform';
import { usePlatformRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Shield, 
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface ModuleLayoutProps {
  module: ModuleConfig;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  headerActions?: React.ReactNode;
  enableRealtime?: boolean;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  ModuleErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Module Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Module Error</h3>
          <p className="text-muted-foreground mb-4">
            Something went wrong loading this module.
          </p>
          <Button 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Module
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function ModuleLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RealtimeIndicator({ 
  connectionHealth, 
  isConnected, 
  totalEvents 
}: {
  connectionHealth: 'healthy' | 'degraded' | 'disconnected';
  isConnected: boolean;
  totalEvents: number;
}) {
  const getIndicatorProps = () => {
    switch (connectionHealth) {
      case 'healthy':
        return {
          icon: <Wifi className="h-3 w-3" />,
          color: 'bg-green-500',
          text: 'Live Updates Active'
        };
      case 'degraded':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          color: 'bg-yellow-500',
          text: 'Connection Degraded'
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          color: 'bg-red-500',
          text: 'Offline Mode'
        };
    }
  };

  const { icon, color, text } = getIndicatorProps();

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`h-2 w-2 rounded-full ${color} animate-pulse`} />
      {icon}
      <span>{text}</span>
      {totalEvents > 0 && (
        <Badge variant="secondary" className="h-5 px-1 text-xs">
          {totalEvents}
        </Badge>
      )}
    </div>
  );
}

export function ModuleLayout({
  module,
  children,
  loading = false,
  error = null,
  onRetry,
  headerActions,
  enableRealtime = true
}: ModuleLayoutProps) {
  const { user } = useAuth();
  const realtimeUpdates = usePlatformRealtimeUpdates(enableRealtime ? user?.id : undefined);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Module Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{module.icon}</div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{module.title}</h1>
                <p className="text-muted-foreground">{module.description}</p>
              </div>
              
              {/* Premium Badge */}
              {module.isPremium && (
                <Badge variant="secondary" className="ml-2">
                  <Zap className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            {/* Real-time Status */}
            {enableRealtime && (
              <RealtimeIndicator
                connectionHealth={realtimeUpdates.overallHealth}
                isConnected={realtimeUpdates.isAnyConnected}
                totalEvents={realtimeUpdates.totalEvents}
              />
            )}
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {headerActions}
            
            {/* Security Indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            
            {/* Performance Indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Fast</span>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <ModuleErrorBoundary>
          <Suspense fallback={<ModuleLoadingFallback />}>
            {loading ? <ModuleLoadingFallback /> : children}
          </Suspense>
        </ModuleErrorBoundary>

        {/* Module Footer */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>TalentXcel {module.name} Module</span>
              <Badge variant="outline" className="h-5">
                v1.0.0
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
              {enableRealtime && realtimeUpdates.isAnyConnected && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleLayout;