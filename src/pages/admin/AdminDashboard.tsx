
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  Building2, 
  BookOpen, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  // Platform Stats
  const platformStats = [
    { label: 'Total Users', value: '25,847', change: '+12%', icon: Users, color: 'text-blue-600' },
    { label: 'Active Users (30d)', value: '18,234', change: '+8%', icon: Activity, color: 'text-green-600' },
    { label: 'Jobs Posted', value: '3,456', change: '+23%', icon: Briefcase, color: 'text-purple-600' },
    { label: 'Companies', value: '1,234', change: '+15%', icon: Building2, color: 'text-orange-600' },
    { label: 'Course Enrollments', value: '12,567', change: '+18%', icon: BookOpen, color: 'text-indigo-600' },
    { label: 'Resume Created', value: '8,943', change: '+25%', icon: TrendingUp, color: 'text-pink-600' }
  ];

  // Pending Actions
  const pendingActions = [
    { label: 'Employer Requests', count: 12, icon: AlertTriangle, color: 'text-red-600', url: '/admin/employer-requests' },
    { label: 'Job Approvals', count: 8, icon: Clock, color: 'text-yellow-600', url: '/admin/jobs' },
    { label: 'Reported Content', count: 5, icon: AlertTriangle, color: 'text-red-600', url: '/admin/network' },
    { label: 'Company Verifications', count: 3, icon: CheckCircle, color: 'text-green-600', url: '/admin/companies' }
  ];

  // Chart Data
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Signups',
        data: [1200, 1900, 3000, 2500, 3200, 3800],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const jobApplicationsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Applications',
        data: [450, 620, 580, 720],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
      },
    ],
  };

  const userTypeData = {
    labels: ['Job Seekers', 'Employers', 'Premium Users'],
    datasets: [
      {
        data: [18500, 2200, 890],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
      },
    ],
  };

  const recentActivity = [
    { user: 'John Doe', action: 'Applied to Software Engineer at TechCorp', time: '5 mins ago' },
    { user: 'Jane Smith', action: 'Created a new resume template', time: '12 mins ago' },
    { user: 'TechStartup Inc.', action: 'Posted 3 new job openings', time: '25 mins ago' },
    { user: 'Mike Johnson', action: 'Completed React Development course', time: '1 hour ago' },
    { user: 'Sarah Wilson', action: 'Updated company profile', time: '2 hours ago' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <AdminGuard requiredPermission="canAccessDashboard">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening on TalentXcel.</p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {platformStats.map((stat, index) => (
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

            {/* Pending Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pendingActions.map((action, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <action.icon className={`h-5 w-5 ${action.color}`} />
                          <div>
                            <p className="font-medium text-sm">{action.label}</p>
                            <p className="text-xs text-gray-500">Needs attention</p>
                          </div>
                        </div>
                        <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {action.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Charts */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line data={userGrowthData} options={chartOptions} />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Bar data={jobApplicationsData} options={chartOptions} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Doughnut data={userTypeData} options={chartOptions} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-6">
                <AdminNotifications />

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-blue-200">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.user}</p>
                            <p className="text-sm text-gray-600">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminDashboard;
