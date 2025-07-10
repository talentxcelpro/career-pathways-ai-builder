import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { aiService, AIFeatureStatus } from '@/services/aiService';

interface AIHealthMonitorProps {
  compact?: boolean;
  showOnlyErrors?: boolean;
  modules?: string[];
}

const AIHealthMonitor: React.FC<AIHealthMonitorProps> = ({ 
  compact = false, 
  showOnlyErrors = false,
  modules 
}) => {
  const [features, setFeatures] = useState<AIFeatureStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadFeatureStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadFeatureStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFeatureStatus = async () => {
    try {
      const allFeatures = await aiService.getAllFeaturesStatus();
      let filteredFeatures = allFeatures;

      if (modules) {
        filteredFeatures = allFeatures.filter(f => modules.includes(f.module_name));
      }

      if (showOnlyErrors) {
        filteredFeatures = filteredFeatures.filter(f => 
          f.error_message || 
          (f.last_error && (!f.last_success || new Date(f.last_error) > new Date(f.last_success)))
        );
      }

      setFeatures(filteredFeatures);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to load AI feature status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (feature: AIFeatureStatus) => {
    if (!feature.enabled) return <XCircle className="h-4 w-4 text-gray-500" />;
    if (feature.error_message) return <XCircle className="h-4 w-4 text-red-500" />;
    if (feature.last_error && feature.last_success && new Date(feature.last_error) > new Date(feature.last_success)) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = (feature: AIFeatureStatus) => {
    if (!feature.enabled) return 'bg-gray-500';
    if (feature.error_message) return 'bg-red-500';
    if (feature.last_error && feature.last_success && new Date(feature.last_error) > new Date(feature.last_success)) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  const getSuccessRate = (feature: AIFeatureStatus) => {
    if (feature.usage_count === 0) return 0;
    return (feature.success_count / feature.usage_count) * 100;
  };

  const overallHealth = features.length > 0 
    ? (features.filter(f => 
        f.enabled && 
        (!f.error_message) && 
        (!f.last_error || (f.last_success && new Date(f.last_success) > new Date(f.last_error)))
      ).length / features.length) * 100 
    : 0;

  if (loading) {
    return (
      <Card className={compact ? 'w-80' : 'w-full'}>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center space-x-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="w-80 border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              AI Health Monitor
            </CardTitle>
            <Badge variant={overallHealth > 80 ? 'default' : overallHealth > 60 ? 'secondary' : 'destructive'}>
              {overallHealth.toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Progress value={overallHealth} className="h-2" />
          <div className="text-xs text-gray-600">
            {features.filter(f => f.enabled).length} of {features.length} features active
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {lastUpdate}
          </div>
          {showOnlyErrors && features.length === 0 && (
            <div className="text-center text-sm text-green-600 py-2">
              ✅ All AI features healthy
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Feature Health Monitor
            </CardTitle>
            <CardDescription>
              Real-time status of AI features across the platform
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={overallHealth > 80 ? 'default' : overallHealth > 60 ? 'secondary' : 'destructive'}>
              {overallHealth.toFixed(0)}% Healthy
            </Badge>
            <Button size="sm" variant="outline" onClick={loadFeatureStatus}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(feature)}
                  <div>
                    <div className="font-medium text-sm">{feature.feature_name}</div>
                    <div className="text-xs text-gray-500">{feature.module_name}</div>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(feature)}`}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Usage:</span>
                  <span className="ml-1 font-medium">{feature.usage_count}</span>
                </div>
                <div>
                  <span className="text-gray-500">Success:</span>
                  <span className="ml-1 font-medium">{getSuccessRate(feature).toFixed(0)}%</span>
                </div>
              </div>

              {feature.average_response_time && (
                <div className="text-xs">
                  <span className="text-gray-500">Avg Response:</span>
                  <span className="ml-1 font-medium">
                    {feature.average_response_time < 1000 
                      ? `${feature.average_response_time}ms` 
                      : `${(feature.average_response_time / 1000).toFixed(1)}s`
                    }
                  </span>
                </div>
              )}

              {feature.error_message && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="text-xs text-red-800 font-medium">Error:</div>
                  <div className="text-xs text-red-700">{feature.error_message}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {features.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {showOnlyErrors ? 'No AI feature errors detected' : 'No AI features found'}
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate} • Auto-refreshes every 30 seconds
        </div>
      </CardContent>
    </Card>
  );
};

export default AIHealthMonitor;