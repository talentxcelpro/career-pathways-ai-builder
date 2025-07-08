import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Download, 
  Calendar
} from 'lucide-react';

interface CompanyAnalyticsProps {
  company: any;
  metrics: any;
  userRole: string;
}

export const CompanyAnalytics: React.FC<CompanyAnalyticsProps> = ({ 
  company, 
  metrics, 
  userRole 
}) => {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['company-analytics', company?.id, timeRange],
    queryFn: async () => {
      if (!company) return null;

      const [sessionsRes, jobStatsRes] = await Promise.all([
        supabase
          .from('company_analytics_sessions')
          .select('*')
          .eq('company_id', company.id)
          .order('session_date', { ascending: false }),
        supabase
          .from('analytics_job_stats')
          .select('*')
          .order('stat_date', { ascending: false })
      ]);

      return {
        sessions: sessionsRes.data || [],
        jobStats: jobStatsRes.data || []
      };
    },
    enabled: !!company
  });

  const totalPageViews = analyticsData?.sessions.reduce((sum, session) => sum + (session.page_views || 0), 0) || 0;
  const totalUniqueVisitors = analyticsData?.sessions.reduce((sum, session) => sum + (session.unique_visitors || 0), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-foreground">Company Analytics</h3>
          <p className="text-sm text-muted-foreground">Track your company's performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => {}}>
            <Download className="h-3 w-3 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Page Views</CardTitle>
            <Eye className="h-3 w-3 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">{totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total in {timeRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Unique Visitors</CardTitle>
            <Users className="h-3 w-3 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">{totalUniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unique people</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Engagement</CardTitle>
            <TrendingUp className="h-3 w-3 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-accent-foreground">{metrics?.engagement_score?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Performance</CardTitle>
            <BarChart3 className="h-3 w-3 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-secondary-foreground">
              {Math.round(((metrics?.engagement_score || 0) + (metrics?.content_performance_score || 0)) / 2)}
            </div>
            <p className="text-xs text-muted-foreground">Overall score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Overview</CardTitle>
          <CardDescription className="text-sm">Key metrics and trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Brand Visibility</span>
              <span className="font-medium">{metrics?.brand_reach || 0}</span>
            </div>
            <Progress value={Math.min((metrics?.brand_reach || 0) / 1000 * 100, 100)} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Engagement Score</span>
              <span className="font-medium">{metrics?.engagement_score?.toFixed(1) || 0}%</span>
            </div>
            <Progress value={metrics?.engagement_score || 0} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Content Performance</span>
              <span className="font-medium">{metrics?.content_performance_score?.toFixed(1) || 0}%</span>
            </div>
            <Progress value={metrics?.content_performance_score || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};