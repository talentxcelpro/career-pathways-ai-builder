
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp,
  Download,
  Calendar,
  Activity
} from 'lucide-react';
import { useAnalyticsReports } from '@/hooks/useAnalyticsReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsReports = () => {
  const {
    dateRange,
    setDateRange,
    platformAnalytics,
    userGrowthData,
    topPerformingJobs
  } = useAnalyticsReports();

  const statsCards = [
    { label: 'Total Users', value: platformAnalytics?.totalUsers || 0, change: `+${platformAnalytics?.newUsers || 0}`, icon: Users, color: 'text-blue-600' },
    { label: 'Total Jobs', value: platformAnalytics?.totalJobs || 0, change: '+12%', icon: Briefcase, color: 'text-green-600' },
    { label: 'Applications', value: platformAnalytics?.totalApplications || 0, change: '+8%', icon: Activity, color: 'text-purple-600' },
    { label: 'Companies', value: platformAnalytics?.totalCompanies || 0, change: '+15%', icon: Building2, color: 'text-orange-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Analytics & Reports" 
      description="Platform analytics, insights, and performance metrics"
    >
      <div className="space-y-8">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformingJobs?.slice(0, 10).map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.companies?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.applications_count || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{job.views_count || 0}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">New User Registrations</span>
                  <Badge>{platformAnalytics?.newUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Jobs Posted</span>
                  <Badge variant="outline">{platformAnalytics?.totalJobs || 0}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Applications Submitted</span>
                  <Badge variant="secondary">{platformAnalytics?.totalApplications || 0}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Network Posts</span>
                  <Badge variant="outline">{platformAnalytics?.totalPosts || 0}</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Companies Registered</span>
                  <Badge>{platformAnalytics?.totalCompanies || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AnalyticsReports;
