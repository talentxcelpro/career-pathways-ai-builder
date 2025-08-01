import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, ExternalLink, Users, Activity } from 'lucide-react';
import { useJobAnalytics } from '@/hooks/useJobAnalytics';

interface JobAnalyticsWidgetProps {
  jobId: string;
  isExternal?: boolean;
}

export const JobAnalyticsWidget: React.FC<JobAnalyticsWidgetProps> = ({ 
  jobId, 
  isExternal = false 
}) => {
  const { data: analytics, isLoading } = useJobAnalytics(jobId);

  if (!isExternal) {
    return null; // Only show for external jobs
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No analytics data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversionRate = analytics.redirect_conversion_rate || 0;
  const getConversionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Job Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Internal Applications</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.total_internal_applications}
            </div>
            <p className="text-xs text-muted-foreground">
              Applied through TalentXcel
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">External Redirects</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.total_external_redirects}
            </div>
            <p className="text-xs text-muted-foreground">
              Clicked "Complete Application"
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Conversion Rate</span>
            <Badge 
              variant="secondary" 
              className={getConversionColor(conversionRate)}
            >
              {conversionRate.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(conversionRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Percentage of users who completed external application after applying internally
          </p>
        </div>

        {analytics.last_updated && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            Last updated: {new Date(analytics.last_updated).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};