import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  Settings,
  Zap,
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react";
import { aiService, AIFeatureStatus } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AIManagement = () => {
  const [features, setFeatures] = useState<AIFeatureStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuresData, analyticsData] = await Promise.all([
        aiService.getAllFeaturesStatus(),
        aiService.getUsageAnalytics(selectedTimeframe)
      ]);
      
      setFeatures(featuresData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load AI management data:', error);
      toast.error('Failed to load AI management data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_features_status')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', featureId);

      if (error) throw error;

      setFeatures(prev => 
        prev.map(feature => 
          feature.id === featureId 
            ? { ...feature, enabled }
            : feature
        )
      );

      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      toast.error('Failed to update feature status');
    }
  };

  const getStatusColor = (feature: AIFeatureStatus) => {
    if (!feature.enabled) return 'bg-gray-500';
    if (feature.last_error && !feature.last_success) return 'bg-red-500';
    if (feature.last_error && feature.last_success && new Date(feature.last_error) > new Date(feature.last_success)) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (feature: AIFeatureStatus) => {
    if (!feature.enabled) return 'Disabled';
    if (feature.last_error && !feature.last_success) return 'Error';
    if (feature.last_error && feature.last_success && new Date(feature.last_error) > new Date(feature.last_success)) return 'Warning';
    return 'Active';
  };

  const formatResponseTime = (time: number | null) => {
    if (!time) return 'N/A';
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  const groupFeaturesByModule = (features: AIFeatureStatus[]) => {
    return features.reduce((acc, feature) => {
      if (!acc[feature.module_name]) {
        acc[feature.module_name] = [];
      }
      acc[feature.module_name].push(feature);
      return acc;
    }, {} as Record<string, AIFeatureStatus[]>);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedFeatures = groupFeaturesByModule(features);
  const totalFeatures = features.length;
  const enabledFeatures = features.filter(f => f.enabled).length;
  const healthyFeatures = features.filter(f => f.enabled && (!f.last_error || (f.last_success && new Date(f.last_success) > new Date(f.last_error)))).length;
  const successRate = totalFeatures > 0 ? (healthyFeatures / totalFeatures) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              AI Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Monitor and manage AI features across TalentXcel platform</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadData} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Features</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFeatures}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enabled</p>
                  <p className="text-2xl font-bold text-green-600">{enabledFeatures}</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold text-blue-600">{successRate.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Est. Monthly Cost</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${analytics?.totalCost ? (analytics.totalCost * 30).toFixed(2) : '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList>
            <TabsTrigger value="features">AI Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-6">
            {Object.entries(groupedFeatures).map(([moduleName, moduleFeatures]) => (
              <Card key={moduleName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-lg">{moduleName} Module</span>
                    <Badge variant="outline">
                      {moduleFeatures.filter(f => f.enabled).length}/{moduleFeatures.length} enabled
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    AI features available in the {moduleName} module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {moduleFeatures.map((feature) => (
                      <div key={feature.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(feature)}`}></div>
                            <div>
                              <h4 className="font-medium text-gray-900">{feature.feature_name}</h4>
                              <p className="text-sm text-gray-500">{feature.feature_key}</p>
                            </div>
                          </div>
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={(checked) => toggleFeature(feature.id, checked)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge 
                              variant={getStatusText(feature) === 'Active' ? 'default' : 
                                     getStatusText(feature) === 'Warning' ? 'secondary' : 'destructive'}
                              className="ml-2"
                            >
                              {getStatusText(feature)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-500">Usage:</span>
                            <span className="ml-2 font-medium">{feature.usage_count}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Success Rate:</span>
                            <span className="ml-2 font-medium">
                              {feature.usage_count > 0 
                                ? `${((feature.success_count / feature.usage_count) * 100).toFixed(1)}%`
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Response:</span>
                            <span className="ml-2 font-medium">{formatResponseTime(feature.average_response_time)}</span>
                          </div>
                        </div>

                        {feature.error_message && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-red-800 text-sm">{feature.error_message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex gap-2 mb-4">
              {(['day', 'week', 'month'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
            </div>

            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Calls:</span>
                      <span className="font-medium">{analytics.totalCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful:</span>
                      <span className="font-medium text-green-600">{analytics.successfulCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed:</span>
                      <span className="font-medium text-red-600">{analytics.failedCalls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">
                        {analytics.totalCalls > 0 
                          ? `${((analytics.successfulCalls / analytics.totalCalls) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tokens:</span>
                      <span className="font-medium">{analytics.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response Time:</span>
                      <span className="font-medium">{formatResponseTime(analytics.averageResponseTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">${analytics.totalCost.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Module Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analytics.usageByModule).map(([module, stats]: [string, any]) => (
                      <div key={module} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{module}</span>
                          <span className="text-sm text-gray-600">{stats.calls} calls</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(stats.calls / analytics.totalCalls) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest AI feature usage and system events</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.recentActivity?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentActivity.map((log: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{log.module_name}.{log.feature_key}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {log.tokens_used} tokens • {formatResponseTime(log.response_time)}
                          </p>
                          {log.error_message && (
                            <p className="text-sm text-red-600">{log.error_message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIManagement;