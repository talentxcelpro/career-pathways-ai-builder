
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
  Wrench, 
  Search, 
  Plus, 
  Edit, 
  Settings, 
  Eye,
  BarChart3,
  Users,
  Zap,
  Shield
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const ToolsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const tools = [
    {
      id: '1',
      name: 'AI Resume Builder',
      category: 'Resume',
      usage: 2456,
      isActive: true,
      isPremium: false,
      accessLevel: 'All Users',
      lastUpdated: '2 days ago'
    },
    {
      id: '2',
      name: 'Interview Prep AI',
      category: 'Interview',
      usage: 1892,
      isActive: true,
      isPremium: true,
      accessLevel: 'Premium Only',
      lastUpdated: '1 week ago'
    },
    {
      id: '3',
      name: 'Salary Analyzer',
      category: 'Analytics',
      usage: 756,
      isActive: false,
      isPremium: false,
      accessLevel: 'All Users',
      lastUpdated: '3 days ago'
    }
  ];

  const toolStats = [
    { label: 'Total Tools', value: '24', icon: Wrench, color: 'text-blue-600' },
    { label: 'Active Tools', value: '18', icon: Zap, color: 'text-green-600' },
    { label: 'Premium Tools', value: '8', icon: Shield, color: 'text-purple-600' },
    { label: 'Total Usage', value: '45,678', icon: BarChart3, color: 'text-orange-600' }
  ];

  const usageMetrics = [
    { tool: 'AI Resume Builder', usage: 2456, trend: '+15%' },
    { tool: 'Job Matcher', usage: 1892, trend: '+12%' },
    { tool: 'Interview Prep', usage: 1234, trend: '+8%' },
    { tool: 'Profile Score', usage: 987, trend: '+22%' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tools Management</h1>
              <p className="text-gray-600">Configure AI tools, settings, and access levels</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Tool
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {toolStats.map((stat, index) => (
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
            {/* Tools Management */}
            <div className="lg:col-span-2">
              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search tools..."
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

              {/* Tools Table */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Tools & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tools.map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell>
                            <div>
                              <h3 className="font-medium">{tool.name}</h3>
                              <p className="text-sm text-gray-600">Updated {tool.lastUpdated}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tool.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{tool.usage} uses</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={tool.isPremium ? 'default' : 'secondary'}>
                              {tool.accessLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={tool.isActive} />
                              <span className="text-sm">
                                {tool.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
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
              {/* Usage Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Usage Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageMetrics.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{item.tool}</p>
                          <p className="text-xs text-gray-600">{item.usage} uses</p>
                        </div>
                        <span className="text-sm text-green-600 font-medium">{item.trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Access Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Access Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Free User Access</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Premium Features</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Rate Limiting</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Usage Analytics</span>
                    <Switch defaultChecked />
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
                    Global Settings
                  </Button>
                  <Button className="w-full" variant="outline">
                    API Configuration
                  </Button>
                  <Button className="w-full" variant="outline">
                    Usage Reports
                  </Button>
                  <Button className="w-full" variant="outline">
                    Tool Analytics
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

export default ToolsManagement;
