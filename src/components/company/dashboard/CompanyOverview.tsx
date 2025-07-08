import React from 'react';
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
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({ 
  company, 
  metrics, 
  recentActivity, 
  userRole 
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_posted': return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'post_created': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'follower_gained': return <Heart className="h-4 w-4 text-pink-600" />;
      case 'application_received': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'profile_updated': return <Upload className="h-4 w-4 text-orange-600" />;
      case 'event_created': return <Calendar className="h-4 w-4 text-indigo-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'job_posted': return 'bg-blue-100';
      case 'post_created': return 'bg-green-100';
      case 'follower_gained': return 'bg-pink-100';
      case 'application_received': return 'bg-purple-100';
      case 'profile_updated': return 'bg-orange-100';
      case 'event_created': return 'bg-indigo-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Performance Overview
          </CardTitle>
          <CardDescription>Key metrics for your company presence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-blue-900">Brand Reach</h3>
              <p className="text-3xl font-bold text-blue-600">{metrics?.brand_reach || 0}</p>
              <p className="text-sm text-gray-600">Monthly impressions</p>
              <Progress value={75} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-green-900">Success Rate</h3>
              <p className="text-3xl font-bold text-green-600">{metrics?.success_rate || 0}%</p>
              <p className="text-sm text-gray-600">Application to hire</p>
              <Progress value={metrics?.success_rate || 0} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-semibold text-xl text-purple-900">Engagement</h3>
              <p className="text-3xl font-bold text-purple-600">{metrics?.avg_engagement || 0}</p>
              <p className="text-sm text-gray-600">Avg. interactions per post</p>
              <Progress value={metrics?.engagement_rate || 0} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and actions on your company profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                  <p className="text-gray-600 mb-4">Start by posting content or jobs to see activity here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your company presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Briefcase className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Company Growth Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Growth Insights
          </CardTitle>
          <CardDescription>Track your company's growth trajectory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">Followers Growth</h4>
              <p className="text-2xl font-bold text-blue-600">+12%</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-50">
              <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Profile Views</h4>
              <p className="text-2xl font-bold text-green-600">+24%</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Engagement</h4>
              <p className="text-2xl font-bold text-purple-600">+8%</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-semibold text-orange-900">Applications</h4>
              <p className="text-2xl font-bold text-orange-600">+18%</p>
              <p className="text-sm text-gray-600">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};