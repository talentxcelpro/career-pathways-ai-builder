
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Building2, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  CheckCircle,
  XCircle,
  Flag,
  Users,
  Briefcase
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const CompaniesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const companies = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      industry: 'Technology',
      size: '501-1000',
      location: 'Mumbai, India',
      status: 'verified',
      jobsPosted: 45,
      followers: 1234,
      joinedAt: '2023-12-15',
      isVerified: true,
      isFeatured: true
    },
    {
      id: '2',
      name: 'StartupXYZ',
      industry: 'E-commerce',
      size: '11-50',
      location: 'Bangalore, India',
      status: 'pending',
      jobsPosted: 8,
      followers: 234,
      joinedAt: '2024-01-10',
      isVerified: false,
      isFeatured: false
    },
    {
      id: '3',
      name: 'FinanceHub Ltd',
      industry: 'Finance',
      size: '201-500',
      location: 'Delhi, India',
      status: 'flagged',
      jobsPosted: 23,
      followers: 567,
      joinedAt: '2023-11-20',
      isVerified: true,
      isFeatured: false
    }
  ];

  const companyStats = [
    { label: 'Total Companies', value: '1,456', icon: Building2, color: 'text-blue-600' },
    { label: 'Verified Companies', value: '892', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending Approval', value: '34', icon: Eye, color: 'text-yellow-600' },
    { label: 'Featured Companies', value: '45', icon: Star, color: 'text-purple-600' }
  ];

  const recentActivity = [
    { company: 'TechCorp Solutions', action: 'Posted new job', time: '2 hours ago' },
    { company: 'StartupXYZ', action: 'Profile updated', time: '4 hours ago' },
    { company: 'FinanceHub Ltd', action: 'Verification requested', time: '1 day ago' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies Management</h1>
            <p className="text-gray-600">Approve companies, verify profiles, and manage branding</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {companyStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Companies Table */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Export</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Companies Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{company.name}</h3>
                                {company.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {company.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{company.size} employees • {company.location}</p>
                                <p>Joined {company.joinedAt}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{company.industry}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {company.jobsPosted} jobs posted
                              </p>
                              <p className="flex items-center gap-1 text-gray-600">
                                <Users className="h-3 w-3" />
                                {company.followers} followers
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                company.status === 'verified' ? 'default' : 
                                company.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {company.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {company.status === 'pending' && (
                                <>
                                  <Button variant="outline" size="sm" className="text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Flag className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="border-b pb-3 last:border-b-0">
                        <p className="font-medium text-sm">{activity.company}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Bulk Approve
                  </Button>
                  <Button className="w-full" variant="outline">
                    Verification Queue
                  </Button>
                  <Button className="w-full" variant="outline">
                    Featured Companies
                  </Button>
                  <Button className="w-full" variant="outline">
                    Industry Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Industry Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Technology</span>
                      <span className="text-xs text-gray-600">456 companies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Finance</span>
                      <span className="text-xs text-gray-600">234 companies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Healthcare</span>
                      <span className="text-xs text-gray-600">189 companies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">E-commerce</span>
                      <span className="text-xs text-gray-600">156 companies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CompaniesManagement;
