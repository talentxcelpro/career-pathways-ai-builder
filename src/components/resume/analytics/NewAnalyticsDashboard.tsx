import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  Share2, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3
} from 'lucide-react';
import { useNewResumeAnalytics } from '@/hooks/useNewResumeAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface NewAnalyticsDashboardProps {
  resumeId: string;
}

export const NewAnalyticsDashboard: React.FC<NewAnalyticsDashboardProps> = ({ resumeId }) => {
  const { analytics, isLoading } = useNewResumeAnalytics(resumeId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">
            Start sharing your resume to see analytics data here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.total_views}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{analytics.total_downloads}</p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shares</p>
                <p className="text-2xl font-bold">{analytics.total_shares}</p>
              </div>
              <Share2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.top_sources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="capitalize">{source.source}</span>
                </div>
                <span className="font-medium">{source.count} visits</span>
              </div>
            ))}
            {analytics.top_sources.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No traffic sources recorded yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recent_events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {event.event_type === 'view' && <Eye className="h-4 w-4 text-blue-600" />}
                  {event.event_type === 'download' && <Download className="h-4 w-4 text-green-600" />}
                  {event.event_type === 'share' && <Share2 className="h-4 w-4 text-purple-600" />}
                  <div>
                    <p className="font-medium capitalize">{event.event_type}</p>
                    {event.event_data && (
                      <p className="text-sm text-muted-foreground">
                        {event.event_data.source && `from ${event.event_data.source}`}
                        {event.event_data.format && `as ${event.event_data.format}`}
                        {event.event_data.platform && `on ${event.event_data.platform}`}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(event.created_at)}
                </span>
              </div>
            ))}
            {analytics.recent_events.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Activity (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Chart visualization coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};