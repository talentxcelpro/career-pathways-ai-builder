
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
  Map, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Route,
  Target,
  Users,
  TrendingUp,
  Brain
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const CareerMapManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const careerPaths = [
    {
      id: '1',
      fromRole: 'Junior Developer',
      toRole: 'Senior Developer',
      industry: 'Technology',
      difficulty: 'Medium',
      timeEstimate: '2-3 years',
      users: 234,
      isActive: true,
      completionRate: 68
    },
    {
      id: '2',
      fromRole: 'Marketing Associate',
      toRole: 'Product Manager',
      industry: 'Business',
      difficulty: 'Hard',
      timeEstimate: '3-5 years',
      users: 189,
      isActive: true,
      completionRate: 45
    },
    {
      id: '3',
      fromRole: 'Data Analyst',
      toRole: 'Data Scientist',
      industry: 'Data Science',
      difficulty: 'Medium',
      timeEstimate: '1-2 years',
      users: 156,
      isActive: false,
      completionRate: 72
    }
  ];

  const careerStats = [
    { label: 'Career Paths', value: '245', icon: Route, color: 'text-blue-600' },
    { label: 'Active Users', value: '3,456', icon: Users, color: 'text-green-600' },
    { label: 'Completed Journeys', value: '1,234', icon: Target, color: 'text-purple-600' },
    { label: 'AI Recommendations', value: '12,456', icon: Brain, color: 'text-orange-600' }
  ];

  const popularTransitions = [
    { from: 'Developer', to: 'Senior Developer', count: 234 },
    { from: 'Analyst', to: 'Manager', count: 189 },
    { from: 'Designer', to: 'Product Designer', count: 156 },
    { from: 'Marketer', to: 'Product Manager', count: 134 }
  ];

  const industryBreakdown = [
    { industry: 'Technology', paths: 89, active: 76 },
    { industry: 'Finance', paths: 45, active: 38 },
    { industry: 'Healthcare', paths: 34, active: 29 },
    { industry: 'Education', paths: 28, active: 24 }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Map Management</h1>
              <p className="text-gray-600">Configure career journeys and AI recommendations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                AI Settings
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Career Path
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {careerStats.map((stat, index) => (
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
            {/* Career Paths Management */}
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search career paths..."
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

              {/* Career Paths Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Career Transition Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Career Transition</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {careerPaths.map((path) => (
                        <TableRow key={path.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{path.fromRole}</span>
                                <Route className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{path.toRole}</span>
                              </div>
                              <p className="text-sm text-gray-600">Est. {path.timeEstimate}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{path.industry}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              path.difficulty === 'Easy' ? 'default' :
                              path.difficulty === 'Medium' ? 'secondary' :
                              'destructive'
                            }>
                              {path.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {path.users} users
                              </p>
                              <p className="text-gray-600">{path.completionRate}% success rate</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={path.isActive} />
                              <span className="text-sm">
                                {path.isActive ? 'Active' : 'Inactive'}
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
              {/* Popular Transitions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Popular Transitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {popularTransitions.map((transition, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-medium">{transition.from} → {transition.to}</p>
                        </div>
                        <span className="text-xs text-gray-600">{transition.count} users</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Industry Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {industryBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{item.industry}</p>
                          <p className="text-xs text-gray-600">{item.active} active / {item.paths} total</p>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.active / item.paths) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto-generate paths</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Skill gap analysis</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market demand data</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Salary predictions</span>
                    <Switch />
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
                    Bulk Path Import
                  </Button>
                  <Button className="w-full" variant="outline">
                    Analytics Dashboard
                  </Button>
                  <Button className="w-full" variant="outline">
                    Skills Database
                  </Button>
                  <Button className="w-full" variant="outline">
                    Market Insights
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

export default CareerMapManagement;
