
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
  Briefcase, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  Building2,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const JobsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const jobs = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'TechCorp',
      location: 'Mumbai, India',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      status: 'active',
      applications: 45,
      views: 234,
      postedAt: '2 days ago',
      isFeatured: true,
      isUrgent: false
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Bangalore, India',
      type: 'Full-time',
      salary: '₹20-30 LPA',
      status: 'pending',
      applications: 12,
      views: 89,
      postedAt: '1 day ago',
      isFeatured: false,
      isUrgent: true
    }
  ];

  const jobStats = [
    { label: 'Total Jobs', value: '2,456', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Active Jobs', value: '1,789', icon: Eye, color: 'text-green-600' },
    { label: 'Pending Approval', value: '34', icon: Clock, color: 'text-yellow-600' },
    { label: 'Featured Jobs', value: '123', icon: Star, color: 'text-purple-600' }
  ];

  const categories = [
    { name: 'Technology', count: 456, isActive: true },
    { name: 'Finance', count: 234, isActive: true },
    { name: 'Healthcare', count: 189, isActive: true },
    { name: 'Education', count: 156, isActive: false }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs Management</h1>
            <p className="text-gray-600">Approve jobs, manage categories, and monitor activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {jobStats.map((stat, index) => (
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
            {/* Main Jobs Table */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search jobs by title, company, or location..."
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

              {/* Jobs Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Details</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{job.title}</h3>
                                {job.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                {job.isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span>{job.type}</span>
                                <span>{job.salary}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{job.postedAt}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              {job.company}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{job.applications} applications</p>
                              <p className="text-gray-600">{job.views} views</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                              {job.status}
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
                              <Button variant="outline" size="sm">
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
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
              {/* Job Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <p className="text-sm text-gray-600">{category.count} jobs</p>
                        </div>
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
                    Bulk Approve Jobs
                  </Button>
                  <Button className="w-full" variant="outline">
                    Manage Categories
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export Job Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    Analytics Report
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

export default JobsManagement;
