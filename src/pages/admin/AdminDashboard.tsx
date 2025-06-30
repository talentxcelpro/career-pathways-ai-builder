
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  Wrench, 
  GraduationCap, 
  Map, 
  Shield, 
  BarChart3,
  CreditCard,
  Lock,
  Home,
  Network
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  const adminModules = [
    {
      title: 'Admin Management',
      description: 'Manage other admins, roles, and permissions',
      icon: Shield,
      path: '/admin/admins',
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'User Management',
      description: 'View, manage, and moderate all users',
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Home & Dashboard',
      description: 'Manage homepage content and announcements',
      icon: Home,
      path: '/admin/home',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Network Management',
      description: 'Moderate posts, comments, and community content',
      icon: Network,
      path: '/admin/network',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Jobs Management',
      description: 'Approve jobs, manage categories, and monitor activity',
      icon: Briefcase,
      path: '/admin/jobs',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Resume Management',
      description: 'Manage templates, usage stats, and documents',
      icon: FileText,
      path: '/admin/resumes',
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      title: 'Tools Management',
      description: 'Configure AI tools, settings, and access levels',
      icon: Wrench,
      path: '/admin/tools',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Companies Management',
      description: 'Approve companies, verify profiles, and manage branding',
      icon: Building2,
      path: '/admin/companies',
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Learning Management',
      description: 'Create courses, manage paths, and track engagement',
      icon: GraduationCap,
      path: '/admin/learning',
      color: 'bg-pink-50 text-pink-600'
    },
    {
      title: 'Career Map',
      description: 'Configure career journeys and AI recommendations',
      icon: Map,
      path: '/admin/career-map',
      color: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Employer Requests',
      description: 'Approve/reject employer signups and monitor activity',
      icon: Building2,
      path: '/admin/employer-requests',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Pricing & Payments',
      description: 'Manage pricing plans, payments, and transactions',
      icon: CreditCard,
      path: '/admin/payments',
      color: 'bg-violet-50 text-violet-600'
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed reports and platform analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'bg-rose-50 text-rose-600'
    },
    {
      title: 'Security & Logs',
      description: 'View access logs, audit trails, and security settings',
      icon: Lock,
      path: '/admin/security',
      color: 'bg-gray-50 text-gray-600'
    }
  ];

  const quickStats = [
    { label: 'Total Users', value: '12,456', change: '+12%' },
    { label: 'Active Jobs', value: '2,341', change: '+8%' },
    { label: 'Companies', value: '856', change: '+15%' },
    { label: 'Monthly Revenue', value: '₹45,670', change: '+23%' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel - Master Controls</h1>
            <p className="text-gray-600">Manage all aspects of the TalentXcel platform</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminModules.map((module, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${module.color}`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  <Link to={module.path}>
                    <Button className="w-full" variant="outline">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">New employer request from TechCorp Solutions</span>
                  </div>
                  <span className="text-xs text-gray-500">5 mins ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">45 new job applications received</span>
                  </div>
                  <span className="text-xs text-gray-500">12 mins ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Content reported in Network module</span>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
