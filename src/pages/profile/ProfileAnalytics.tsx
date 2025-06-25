
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Eye, Users, MessageSquare, Download, Calendar } from "lucide-react";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfileAnalytics = () => {
  const analyticsData = {
    totalViews: 1247,
    weeklyViews: 89,
    connectionRequests: 23,
    messagesSent: 12,
    resumeDownloads: 45,
    searchAppearances: 156
  };

  const chartData = [
    { month: "Jan", views: 120, connections: 8 },
    { month: "Feb", views: 145, connections: 12 },
    { month: "Mar", views: 132, connections: 6 },
    { month: "Apr", views: 158, connections: 15 },
    { month: "May", views: 167, connections: 11 },
    { month: "Jun", views: 189, connections: 18 }
  ];

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
              <div className="text-xs text-green-600 mt-1">+12% this month</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.weeklyViews}</div>
              <div className="text-sm text-gray-600">Weekly Views</div>
              <div className="text-xs text-green-600 mt-1">+8% vs last week</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.connectionRequests}</div>
              <div className="text-sm text-gray-600">Connection Requests</div>
              <div className="text-xs text-green-600 mt-1">+15% this month</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.messagesSent}</div>
              <div className="text-sm text-gray-600">Messages Received</div>
              <div className="text-xs text-blue-600 mt-1">+3% this month</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Download className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.resumeDownloads}</div>
              <div className="text-sm text-gray-600">Resume Downloads</div>
              <div className="text-xs text-green-600 mt-1">+22% this month</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{analyticsData.searchAppearances}</div>
              <div className="text-sm text-gray-600">Search Appearances</div>
              <div className="text-xs text-green-600 mt-1">+18% this month</div>
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
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm mb-2"
                    style={{ height: `${(data.views / 200) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600">{data.month}</span>
                </div>
              ))}
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
              <div className="space-y-3">
                {[
                  { keyword: "Software Engineer", count: 45, percentage: 28 },
                  { keyword: "React Developer", count: 32, percentage: 20 },
                  { keyword: "Full Stack", count: 28, percentage: 17 },
                  { keyword: "JavaScript", count: 24, percentage: 15 },
                  { keyword: "Node.js", count: 20, percentage: 12 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.keyword}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{item.count}</span>
                    </div>
                  </div>
                ))}
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
                  <span className="text-lg font-bold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>✓ Profile Photo</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>✓ Professional Summary</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Video Resume</span>
                    <span className="text-orange-600">Missing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>⚠ Portfolio Projects</span>
                    <span className="text-orange-600">Needs More</span>
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
            <div className="space-y-4">
              {[
                { action: "Profile viewed by", user: "Sarah Chen", company: "Google", time: "2 hours ago", icon: Eye },
                { action: "Connection request from", user: "Mike Rodriguez", company: "Microsoft", time: "5 hours ago", icon: Users },
                { action: "Resume downloaded by", user: "Lisa Wang", company: "Apple", time: "1 day ago", icon: Download },
                { action: "Message received from", user: "John Smith", company: "Meta", time: "2 days ago", icon: MessageSquare },
                { action: "Profile appeared in search", user: "Anonymous", company: "Indeed", time: "3 days ago", icon: BarChart3 }
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="text-gray-600">{activity.action}</span>
                        <span className="font-medium"> {activity.user}</span>
                        {activity.company !== "Anonymous" && (
                          <span className="text-gray-600"> at {activity.company}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
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
