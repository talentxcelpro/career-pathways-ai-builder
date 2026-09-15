import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Plus, 
  Heart, 
  FileText, 
  Briefcase, 
  Calendar, 
  Upload, 
  BarChart3, 
  Target, 
  CheckCircle, 
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  Eye
} from 'lucide-react';

interface CompanyOverviewProps {
  company: any;
  metrics: any;
  recentActivity: any[];
  userRole: string;
  onTabChange?: (tab: string) => void;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({ 
  company, 
  metrics, 
  recentActivity, 
  userRole,
  onTabChange 
}) => {
  const navigate = useNavigate();
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_posted': return <Briefcase className="h-3 w-3 text-primary" />;
      case 'post_created': return <MessageSquare className="h-3 w-3 text-success" />;
      case 'follower_gained': return <Heart className="h-3 w-3 text-destructive" />;
      case 'application_received': return <FileText className="h-3 w-3 text-accent-foreground" />;
      case 'profile_updated': return <Upload className="h-3 w-3 text-secondary-foreground" />;
      case 'event_created': return <Calendar className="h-3 w-3 text-muted-foreground" />;
      default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'job_posted': return 'bg-primary/10 border border-primary/20';
      case 'post_created': return 'bg-success/10 border border-success/20';
      case 'follower_gained': return 'bg-destructive/10 border border-destructive/20';
      case 'application_received': return 'bg-accent/10 border border-accent/20';
      case 'profile_updated': return 'bg-secondary/20 border border-secondary/30';
      case 'event_created': return 'bg-muted/20 border border-muted/30';
      default: return 'bg-muted/10 border border-muted/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Performance Overview
          </CardTitle>
          <CardDescription className="text-sm">Key metrics for your company presence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-4 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Brand Reach</h3>
              <p className="text-xl font-bold text-primary">{metrics?.brand_reach || 0}</p>
              <p className="text-xs text-muted-foreground">Monthly impressions</p>
              <Progress value={75} className="mt-2 h-1" />
            </div>
            
            <div className="text-center">
              <div className="bg-success/10 rounded-full p-4 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Success Rate</h3>
              <p className="text-xl font-bold text-success">{metrics?.success_rate || 0}%</p>
              <p className="text-xs text-muted-foreground">Application to hire</p>
              <Progress value={metrics?.success_rate || 0} className="mt-2 h-1" />
            </div>
            
            <div className="text-center">
              <div className="bg-accent/20 rounded-full p-4 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Engagement</h3>
              <p className="text-xl font-bold text-accent-foreground">{metrics?.avg_engagement || 0}</p>
              <p className="text-xs text-muted-foreground">Avg. interactions per post</p>
              <Progress value={metrics?.engagement_rate || 0} className="mt-2 h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm">Latest updates and actions on your company profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-1.5 rounded-full ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-foreground mb-1">No Recent Activity</h3>
                  <p className="text-xs text-muted-foreground mb-3">Start by posting content or jobs to see activity here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm">Manage your company presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              className="w-full justify-start text-xs bg-primary hover:bg-primary/90"
              onClick={() => onTabChange?.('content')}
            >
              <Plus className="h-3 w-3 mr-2" />
              Create Post
            </Button>
            <Button 
              size="sm" 
              className="w-full justify-start text-xs" 
              variant="outline"
              onClick={() => navigate('/jobs/post')}
            >
              <Briefcase className="h-3 w-3 mr-2" />
              Post New Job
            </Button>
            <Button 
              size="sm" 
              className="w-full justify-start text-xs" 
              variant="outline"
              onClick={() => onTabChange?.('content')}
            >
              <Calendar className="h-3 w-3 mr-2" />
              Schedule Event
            </Button>
            <Button 
              size="sm" 
              className="w-full justify-start text-xs" 
              variant="outline"
              onClick={() => onTabChange?.('settings')}
            >
              <Upload className="h-3 w-3 mr-2" />
              Update Profile
            </Button>
            <Button 
              size="sm" 
              className="w-full justify-start text-xs" 
              variant="outline"
              onClick={() => onTabChange?.('analytics')}
            >
              <BarChart3 className="h-3 w-3 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Company Growth Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-success" />
            Growth Insights
          </CardTitle>
          <CardDescription className="text-sm">Track your company's growth trajectory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Users className="h-5 w-5 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-foreground">Followers Growth</h4>
              <p className="text-lg font-bold text-primary">+12%</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-success/5 border border-success/10">
              <Eye className="h-5 w-5 text-success mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-foreground">Profile Views</h4>
              <p className="text-lg font-bold text-success">+24%</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
              <MessageSquare className="h-5 w-5 text-accent-foreground mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-foreground">Engagement</h4>
              <p className="text-lg font-bold text-accent-foreground">+8%</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-secondary/20 border border-secondary/30">
              <FileText className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-foreground">Applications</h4>
              <p className="text-lg font-bold text-secondary-foreground">+18%</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};