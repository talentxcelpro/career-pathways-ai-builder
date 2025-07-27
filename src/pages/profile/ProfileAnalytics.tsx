
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Eye, Users, MessageSquare, Download, Calendar } from "lucide-react";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileAnalytics = () => {
  const analyticsData = {
    totalViews: 0,
    weeklyViews: 0,
    connectionRequests: 0,
    messagesSent: 0,
    resumeDownloads: 0,
    searchAppearances: 0
  };

  const chartData = [];

  return (
    <ProfileLayout 
      title="Profile Analytics" 
      description="Track your profile performance and engagement metrics"
    >
      <div className="space-y-6">
        {/* Time Period Filter */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select defaultValue="30">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
              <div className="text-xs text-gray-500 mt-1">No data yet</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.weeklyViews}</div>
              <div className="text-sm text-gray-600">Weekly Views</div>
              <div className="text-xs text-gray-500 mt-1">No data yet</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.connectionRequests}</div>
              <div className="text-sm text-gray-600">Connection Requests</div>
              <div className="text-xs text-gray-500 mt-1">No data yet</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.messagesSent}</div>
              <div className="text-sm text-gray-600">Messages Received</div>
              <div className="text-xs text-gray-500 mt-1">No data yet</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Download className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.resumeDownloads}</div>
              <div className="text-sm text-gray-600">Resume Downloads</div>
              <div className="text-xs text-gray-500 mt-1">No data yet</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.searchAppearances}</div>
              <div className="text-sm text-gray-600">Search Appearances</div>
              <div className="text-xs text-gray-500 mt-1">No data yet</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Views Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Views Over Time</CardTitle>
            <CardDescription>Track how your profile visibility changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
                <p className="text-gray-600">Your profile analytics will appear here once you start getting views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Keywords</CardTitle>
              <CardDescription>Keywords that led people to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No keyword data available yet</div>
                <p className="text-sm text-gray-400">Keywords that lead people to your profile will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
              <CardDescription>Improve your profile to increase visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Completeness</span>
                  <span className="text-lg font-bold text-orange-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: '0%' }}></div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Profile Photo</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Professional Summary</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Video Resume</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Portfolio Projects</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions with your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">Your profile activity will appear here as people interact with it</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Tips to Improve Visibility</CardTitle>
            <CardDescription>Recommendations to boost your profile performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Wins</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Add 3-5 more portfolio projects</li>
                  <li>• Upload a professional video resume</li>
                  <li>• Get recommendations from colleagues</li>
                  <li>• Update your skills list regularly</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Long-term Strategy</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Share industry insights in posts</li>
                  <li>• Engage with others' content regularly</li>
                  <li>• Join relevant professional groups</li>
                  <li>• Attend virtual networking events</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default ProfileAnalytics;
