
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Search, 
  Download, 
  Calendar,
  Users,
  TrendingUp,
  Eye,
  FileText,
  Briefcase,
  Building2,
  GraduationCap
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AnalyticsReports = () => {
  const [dateRange, setDateRange] = useState('30d');

  const analyticsStats = [
    { label: 'Total Users', value: '12,456', change: '+12%', icon: Users, color: 'text-blue-600' },
    { label: 'Active Sessions', value: '8,234', change: '+8%', icon: Eye, color: 'text-green-600' },
    { label: 'Job Applications', value: '3,567', change: '+15%', icon: Briefcase, color: 'text-purple-600' },
    { label: 'Revenue', value: '₹2,45,670', change: '+23%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const moduleMetrics = [
    {
      module: 'Job Applications',
      totalUsers: 8234,
      activeUsers: 6789,
      growth: '+12%',
      engagement: '68%'
    },
    {
      module: 'Resume Builder',
      totalUsers: 5678,
      activeUsers: 4321,
      growth: '+18%',
      engagement: '76%'
    },
    {
      module: 'Learning Platform',
      totalUsers: 3456,
      activeUsers: 2567,
      growth: '+25%',
      engagement: '74%'
    },
    {
      module: 'Company Profiles',
      totalUsers: 2345,
      activeUsers: 1789,
      growth: '+8%',
      engagement: '76%'
    },
    {
      module: 'Career Mapping',
      totalUsers: 1890,
      activeUsers: 1234,
      growth: '+15%',
      engagement: '65%'
    }
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Monthly User Activity Report',
      type: 'User Analytics',
      generatedAt: '2024-01-15',
      size: '2.3 MB',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Job Application Trends',
      type: 'Jobs Analytics',
      generatedAt: '2024-01-14',
      size: '1.8 MB',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Revenue Report Q1',
      type: 'Financial',
      generatedAt: '2024-01-13',
      size: '956 KB',
      status: 'processing'
    }
  ];

  const topPerformingContent = [
    { content: 'React Developer Jobs', views: 12456, type: 'Job Category' },
    { content: 'Resume Templates - Modern', downloads: 8234, type: 'Template' },
    { content: 'Interview Prep Course', enrollments: 3456, type: 'Course' },
    { content: 'TechCorp Company Profile', visits: 2890, type: 'Company' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
              <p className="text-gray-600">View detailed reports and platform analytics</p>
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {analyticsStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Module Analytics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Module Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Module Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moduleMetrics.map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{module.module}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>{module.totalUsers} total users</span>
                            <span>{module.activeUsers} active</span>
                            <span>Engagement: {module.engagement}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">{module.growth}</span>
                          <p className="text-sm text-gray-600">Growth</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Generated Reports */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Generated Reports</CardTitle>
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{report.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <Badge variant="outline">{report.type}</Badge>
                            <span>Generated: {report.generatedAt}</span>
                            <span>Size: {report.size}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                          {report.status === 'ready' && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Performing Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformingContent.map((item, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <h4 className="font-medium text-sm">{item.content}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          <span className="text-sm font-semibold">
                            {item.views && `${item.views} views`}
                            {item.downloads && `${item.downloads} downloads`}
                            {item.enrollments && `${item.enrollments} enrollments`}
                            {item.visits && `${item.visits} visits`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-semibold">24.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Session Duration</span>
                    <span className="font-semibold">8m 42s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pages per Session</span>
                    <span className="font-semibold">4.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-semibold">3.8%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Report Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    User Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Job Market Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    Company Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Learning Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Report
                  </Button>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Export as CSV
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export as PDF
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export as Excel
                  </Button>
                  <Button className="w-full" variant="outline">
                    Schedule Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsReports;
