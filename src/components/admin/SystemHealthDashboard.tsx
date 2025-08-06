import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Activity, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
  details?: any;
}

interface HealthReport {
  timestamp: string;
  overallStatus: 'healthy' | 'warning' | 'error';
  totalResponseTime: number;
  services: HealthCheckResult[];
  summary: {
    healthy: number;
    warnings: number;
    errors: number;
  };
}

export const SystemHealthDashboard = () => {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      console.log('🏥 Running system health check...');
      toast.loading('Running system health check...', { id: 'health-check' });

      const { data, error } = await supabase.functions.invoke('admin-health-check');

      if (error) {
        console.error('❌ Health check error:', error);
        throw error;
      }

      setHealthReport(data);
      setLastCheck(new Date());

      const status = data.overallStatus;
      if (status === 'healthy') {
        toast.success('✅ All systems healthy!', { id: 'health-check' });
      } else if (status === 'warning') {
        toast.warning('⚠️ Some systems have warnings', { id: 'health-check' });
      } else {
        toast.error('❌ Critical system errors detected', { id: 'health-check' });
      }

    } catch (error) {
      console.error('Health check failed:', error);
      toast.error(`❌ Health check failed: ${error.message}`, { id: 'health-check' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all admin system components
              </CardDescription>
            </div>
            <Button 
              onClick={runHealthCheck}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthReport ? (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(healthReport.overallStatus)}
                  <div>
                    <h3 className="font-semibold">Overall System Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {new Date(healthReport.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(healthReport.overallStatus)}
                  <p className="text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {healthReport.totalResponseTime}ms
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {healthReport.summary.healthy}
                  </div>
                  <div className="text-sm text-green-600">Healthy</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {healthReport.summary.warnings}
                  </div>
                  <div className="text-sm text-yellow-600">Warnings</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {healthReport.summary.errors}
                  </div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <h4 className="font-semibold">Service Details</h4>
                {healthReport.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h5 className="font-medium capitalize">
                          {service.service.replace('-', ' ')}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {service.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(service.status)}
                      {service.responseTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {service.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                {isLoading ? 'Running initial health check...' : 'Click refresh to run health check'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};