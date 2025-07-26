import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, Gauge, Wifi } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export const PerformanceMonitor: React.FC = () => {
  const { metrics, score, grade, isOptimal } = usePerformanceMonitor();
  const [connectionInfo, setConnectionInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  }>({});

  useEffect(() => {
    // Get network information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionInfo({
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt
      });
    }
  }, []);

  const coreWebVitals = [
    {
      name: 'LCP',
      label: 'Largest Contentful Paint',
      value: metrics.lcp,
      unit: 'ms',
      good: 2500,
      poor: 4000,
      icon: <Clock className="h-4 w-4" />
    },
    {
      name: 'FID',
      label: 'First Input Delay',
      value: metrics.fid,
      unit: 'ms',
      good: 100,
      poor: 300,
      icon: <Activity className="h-4 w-4" />
    },
    {
      name: 'CLS',
      label: 'Cumulative Layout Shift',
      value: metrics.cls,
      unit: '',
      good: 0.1,
      poor: 0.25,
      icon: <Gauge className="h-4 w-4" />
    },
    {
      name: 'FCP',
      label: 'First Contentful Paint',
      value: metrics.fcp,
      unit: 'ms',
      good: 1800,
      poor: 3000,
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const getMetricStatus = (value: number | null, good: number, poor: number) => {
    if (value === null) return 'unknown';
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return 'Measuring...';
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === '') return value.toFixed(3);
    return `${value}${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>Real-time Core Web Vitals monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">{score?.overall || 0}/100</div>
              <Badge variant={isOptimal ? 'default' : (score?.overall || 0) > 70 ? 'secondary' : 'destructive'}>
                Grade: {grade}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`font-medium ${isOptimal ? 'text-green-600' : 'text-yellow-600'}`}>
                {isOptimal ? 'Optimal' : 'Needs Improvement'}
              </div>
            </div>
          </div>
          <Progress value={score?.overall || 0} className="h-2" />
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>Key performance metrics that affect user experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreWebVitals.map((vital) => {
              const status = getMetricStatus(vital.value, vital.good, vital.poor);
              return (
                <div key={vital.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {vital.icon}
                      <span className="font-medium">{vital.name}</span>
                    </div>
                    <Badge className={getStatusColor(status)} variant="outline">
                      {status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{vital.label}</div>
                    <div className="text-lg font-mono">
                      {formatValue(vital.value, vital.unit)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Good: ≤{vital.good}{vital.unit} | Poor: &gt;{vital.poor}{vital.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Network Information */}
      {connectionInfo.effectiveType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Network Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Connection Type</div>
                <div className="text-muted-foreground capitalize">
                  {connectionInfo.effectiveType}
                </div>
              </div>
              {connectionInfo.downlink && (
                <div>
                  <div className="font-medium">Download Speed</div>
                  <div className="text-muted-foreground">
                    {connectionInfo.downlink} Mbps
                  </div>
                </div>
              )}
              {connectionInfo.rtt && (
                <div>
                  <div className="font-medium">Round Trip Time</div>
                  <div className="text-muted-foreground">
                    {connectionInfo.rtt}ms
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};