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
  const { applicationAnalytics: analytics, isLoading } = useJobAnalytics(90);

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

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Application Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm font-medium">Total Applications</span>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.total}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm font-medium">Interview Rate</span>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.interviewRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Pending: {analytics.pending}</div>
          <div>In Review: {analytics.inReview}</div>
          <div>Interviewed: {analytics.interviewed}</div>
        </div>
      </CardContent>
    </Card>
  );
};