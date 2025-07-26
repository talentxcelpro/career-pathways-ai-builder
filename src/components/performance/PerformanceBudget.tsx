import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Zap, Package } from 'lucide-react';
import { useBundleAnalysis } from '@/hooks/useBundleAnalysis';

interface BudgetMetric {
  name: string;
  current: number;
  budget: number;
  unit: string;
  critical: boolean;
}

export const PerformanceBudget: React.FC = () => {
  const { analysis, isAnalyzing, analyzeBundleSize, performanceScore } = useBundleAnalysis();

  const budgetMetrics: BudgetMetric[] = [
    {
      name: 'Total Bundle Size',
      current: analysis?.totalSize || 0,
      budget: 2000000, // 2MB
      unit: 'bytes',
      critical: true
    },
    {
      name: 'Gzipped Size',
      current: analysis?.gzippedSize || 0,
      budget: 500000, // 500KB
      unit: 'bytes',
      critical: true
    },
    {
      name: 'Main Chunk Size',
      current: analysis?.chunks.find(c => c.name === 'main')?.size || 0,
      budget: 800000, // 800KB
      unit: 'bytes',
      critical: false
    },
    {
      name: 'Vendor Chunk Size',
      current: analysis?.chunks.find(c => c.name === 'vendor')?.size || 0,
      budget: 600000, // 600KB
      unit: 'bytes',
      critical: false
    }
  ];

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getMetricStatus = (metric: BudgetMetric) => {
    const percentage = (metric.current / metric.budget) * 100;
    if (percentage <= 70) return 'good';
    if (percentage <= 90) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Budget
        </CardTitle>
        <CardDescription>
          Monitor bundle sizes against performance budgets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
          <div>
            <h3 className="font-semibold">Performance Score</h3>
            <p className="text-sm text-muted-foreground">Based on bundle analysis</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{performanceScore}/100</div>
            <Badge variant={performanceScore > 80 ? 'default' : performanceScore > 60 ? 'secondary' : 'destructive'}>
              {performanceScore > 80 ? 'Excellent' : performanceScore > 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </div>

        {/* Budget Metrics */}
        <div className="space-y-4">
          {budgetMetrics.map((metric) => {
            const status = getMetricStatus(metric);
            const percentage = Math.min((metric.current / metric.budget) * 100, 100);
            
            return (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-medium">{metric.name}</span>
                    {metric.critical && (
                      <Badge variant="outline" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <span className={`text-sm font-mono ${getStatusColor(status)}`}>
                    {formatSize(metric.current)} / {formatSize(metric.budget)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% of budget used</span>
                  <span>{formatSize(metric.budget - metric.current)} remaining</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analysis Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button 
            onClick={analyzeBundleSize}
            disabled={isAnalyzing}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Bundle Analysis'}
          </button>
        </div>

        {/* Recommendations */}
        {analysis?.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Optimization Recommendations</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {analysis.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};