import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, ExternalLink, Users, Activity } from 'lucide-react';
import { useJobCareerAnalytics } from '@/hooks/useJobCareerAnalytics';

interface JobCareerAnalyticsWidgetProps {
  jobId: string;
  isExternal?: boolean;
}

export const JobCareerAnalyticsWidget: React.FC<JobCareerAnalyticsWidgetProps> = ({ 
  jobId, 
  isExternal = false 
}) => {
  const { applicationCareerAnalytics: CareerAnalytics, isLoading } = useJobCareerAnalytics(90);

  if (!isExternal) {
    return null; // Only show for external jobs
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading CareerAnalytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (!CareerAnalytics) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No CareerAnalytics data available yet
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
          Application CareerAnalytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm font-medium">Total Applications</span>
            <div className="text-2xl font-bold text-blue-600">
              {CareerAnalytics.total}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm font-medium">Interview Rate</span>
            <div className="text-2xl font-bold text-purple-600">
              {CareerAnalytics.interviewRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Pending: {CareerAnalytics.pending}</div>
          <div>In Review: {CareerAnalytics.inReview}</div>
          <div>Interviewed: {CareerAnalytics.interviewed}</div>
        </div>
      </CardContent>
    </Card>
  );
};



