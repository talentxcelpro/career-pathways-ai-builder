
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Star,
  Users,
  BarChart3
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const ResumeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const templates = [
    {
      id: '1',
      name: 'Professional Modern',
      category: 'Corporate',
      usage: 1234,
      isPremium: false,
      isActive: true,
      rating: 4.8,
      downloads: 5678
    },
    {
      id: '2',
      name: 'Creative Designer',
      category: 'Creative',
      usage: 892,
      isPremium: true,
      isActive: true,
      rating: 4.6,
      downloads: 3421
    },
    {
      id: '3',
      name: 'Tech Minimal',
      category: 'Technology',
      usage: 2456,
      isPremium: false,
      isActive: false,
      rating: 4.9,
      downloads: 7890
    }
  ];

  const resumeStats = [
    { label: 'Total Templates', value: '45', icon: FileText, color: 'text-blue-600' },
    { label: 'Active Templates', value: '38', icon: Eye, color: 'text-green-600' },
    { label: 'Premium Templates', value: '12', icon: Star, color: 'text-purple-600' },
    { label: 'Total Downloads', value: '23,456', icon: Download, color: 'text-orange-600' }
  ];

  const usageAnalytics = [
    { template: 'Professional Modern', usage: 1234, trend: '+12%' },
    { template: 'Tech Minimal', usage: 892, trend: '+8%' },
    { template: 'Creative Designer', usage: 756, trend: '+15%' },
    { template: 'Executive Premium', usage: 543, trend: '+5%' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Management</h1>
              <p className="text-gray-600">Manage resume templates, usage stats, and documents</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {resumeStats.map((stat, index) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates Management */}
            <div className="lg:col-span-2">
              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search templates..."
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

              {/* Templates Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Resume Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <h3 className="font-medium">{template.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600">{template.rating}</span>
                                </div>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{template.downloads} downloads</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{template.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {template.usage} uses
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.isPremium ? 'default' : 'secondary'}>
                              {template.isPremium ? 'Premium' : 'Free'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={template.isActive} />
                              <span className="text-sm">
                                {template.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
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
              {/* Usage Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Usage Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageAnalytics.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{item.template}</p>
                          <p className="text-xs text-gray-600">{item.usage} uses</p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">{item.trend}</span>
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
                    Bulk Template Import
                  </Button>
                  <Button className="w-full" variant="outline">
                    Usage Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    Premium Settings
                  </Button>
                  <Button className="w-full" variant="outline">
                    Template Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Template Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Corporate</span>
                      <span className="text-xs text-gray-600">12 templates</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Creative</span>
                      <span className="text-xs text-gray-600">8 templates</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Technology</span>
                      <span className="text-xs text-gray-600">15 templates</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Executive</span>
                      <span className="text-xs text-gray-600">6 templates</span>
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

export default ResumeManagement;
