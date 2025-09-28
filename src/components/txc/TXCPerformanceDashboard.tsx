import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Zap, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTXCPerformanceOptimizer } from '@/hooks/useTXCPerformanceOptimizer';

interface PerformanceMetricProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  threshold?: { good: number; warning: number };
  format?: 'number' | 'percentage' | 'time';
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  threshold,
  format = 'number'
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'time':
        return `${val.toFixed(0)}ms`;
      default:
        return val.toFixed(2);
    }
  };

  const getStatus = () => {
    if (!threshold) return 'default';
    
    if (format === 'percentage' || format === 'time') {
      // For percentages and times, higher is usually worse
      if (value <= threshold.good) return 'good';
      if (value <= threshold.warning) return 'warning';
      return 'bad';
    } else {
      // For other metrics, higher is usually better
      if (value >= threshold.good) return 'good';
      if (value >= threshold.warning) return 'warning';
      return 'bad';
    }
  };

  const getStatusColor = () => {
    const status = getStatus();
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'bad': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    const status = getStatus();
    switch (status) {
      case 'good': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'bad': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
          {getStatusIcon()}
        </div>
        <div className="mt-2">
          <span className={`text-2xl font-bold ${getStatusColor()}`}>
            {formatValue(value)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const TXCPerformanceDashboard: React.FC = () => {
  const { 
    metrics, 
    clearCache, 
    resetMetrics, 
    cacheSize 
  } = useTXCPerformanceOptimizer();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            TXC Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PerformanceMetric
              title="Response Time"
              value={metrics.averageResponseTime}
              unit=""
              icon={<Zap className="w-4 h-4" />}
              threshold={{ good: 100, warning: 500 }}
              format="time"
            />
            
            <PerformanceMetric
              title="Cache Hit Rate"
              value={metrics.cacheHitRate}
              unit=""
              icon={<Database className="w-4 h-4" />}
              threshold={{ good: 80, warning: 60 }}
              format="percentage"
            />
            
            <PerformanceMetric
              title="Error Rate"
              value={metrics.errorRate}
              unit=""
              icon={<AlertCircle className="w-4 h-4" />}
              threshold={{ good: 1, warning: 5 }}
              format="percentage"
            />
            
            <PerformanceMetric
              title="Last Operation"
              value={metrics.operationDuration}
              unit=""
              icon={<RefreshCw className="w-4 h-4" />}
              threshold={{ good: 50, warning: 200 }}
              format="time"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Cache Size</p>
              <p className="text-2xl font-bold">{cacheSize} entries</p>
            </div>
            <Badge variant="outline" className="text-sm">
              Memory: ~{(cacheSize * 0.5).toFixed(1)}KB
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearCache}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Clear Cache
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetMetrics}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Metrics
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Tip</Badge>
              <span>Cache hit rate above 80% indicates efficient caching</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Tip</Badge>
              <span>Response times under 100ms provide optimal user experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Tip</Badge>
              <span>Error rates above 5% may indicate system issues</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};