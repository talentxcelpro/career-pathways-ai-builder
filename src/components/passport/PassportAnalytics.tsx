import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Eye,
  Share2,
  Download,
  Users,
  Calendar,
  Clock,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PassportAnalyticsProps {
  passport?: any;
  metrics?: any;
  userScores?: any;
  isOwner?: boolean;
}

export function PassportAnalytics({ 
  passport, 
  metrics, 
  userScores, 
  isOwner = true 
}: PassportAnalyticsProps) {
  
  // Sample analytics data - in real app, this would come from backend
  const profileViews = [
    { date: '2024-01', views: 12, shares: 3 },
    { date: '2024-02', views: 18, shares: 5 },
    { date: '2024-03', views: 25, shares: 7 },
    { date: '2024-04', views: 32, shares: 9 },
    { date: '2024-05', views: 28, shares: 6 },
    { date: '2024-06', views: 35, shares: 11 }
  ];

  const skillMetrics = [
    { name: 'Technical Skills', value: 85, color: '#3b82f6' },
    { name: 'Soft Skills', value: 75, color: '#10b981' },
    { name: 'Leadership', value: 60, color: '#f59e0b' },
    { name: 'Communication', value: 90, color: '#ef4444' }
  ];

  const activityData = [
    { name: 'Profile Updates', value: 15 },
    { name: 'Resume Updates', value: 8 },
    { name: 'Job Applications', value: 23 },
    { name: 'Skill Additions', value: 12 },
    { name: 'Connections Made', value: 18 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const totalViews = profileViews.reduce((sum, item) => sum + item.views, 0);
  const totalShares = profileViews.reduce((sum, item) => sum + item.shares, 0);
  const avgViews = Math.round(totalViews / profileViews.length);

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Profile Views</p>
                <p className="text-2xl font-bold text-blue-800">{totalViews}</p>
                <p className="text-xs text-blue-600">+12% this month</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Shares</p>
                <p className="text-2xl font-bold text-green-800">{totalShares}</p>
                <p className="text-xs text-green-600">+25% this month</p>
              </div>
              <Share2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Connections</p>
                <p className="text-2xl font-bold text-purple-800">{metrics?.connections_count || 0}</p>
                <p className="text-xs text-purple-600">+8% this month</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Activity Score</p>
                <p className="text-2xl font-bold text-orange-800">{userScores?.activity_score || 0}</p>
                <p className="text-xs text-orange-600">+15% this month</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Views Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Profile Views & Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profileViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="shares" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Shares"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Skill Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillMetrics.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{skill.name}</span>
                  <Badge variant="outline" style={{ color: skill.color }}>
                    {skill.value}%
                  </Badge>
                </div>
                <Progress 
                  value={skill.value} 
                  className="h-2"
                  style={{ 
                    backgroundColor: `${skill.color}20`,
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              What's Working Well
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">High engagement on technical skills showcase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Consistent profile updates driving views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Strong networking activity</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Target className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Add more project showcases</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Increase job application frequency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Complete pending certifications</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Updated profile headline', time: '2 hours ago', type: 'profile' },
              { action: 'Connected with 3 professionals', time: '1 day ago', type: 'network' },
              { action: 'Applied to Software Engineer position', time: '3 days ago', type: 'job' },
              { action: 'Added Python certification', time: '1 week ago', type: 'certification' },
              { action: 'Updated resume with new project', time: '2 weeks ago', type: 'resume' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'profile' ? 'bg-blue-500' :
                  activity.type === 'network' ? 'bg-green-500' :
                  activity.type === 'job' ? 'bg-purple-500' :
                  activity.type === 'certification' ? 'bg-yellow-500' :
                  'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}