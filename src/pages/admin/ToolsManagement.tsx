
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  TrendingUp,
  Users,
  Activity,
  Settings
} from 'lucide-react';
import { useToolsManagement } from '@/hooks/useToolsManagement';

const ToolsManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    toolsStats,
    tools,
    isLoading,
    handleToggleToolStatus
  } = useToolsManagement();

  const statsCards = [
    { label: 'Total Tools', value: toolsStats?.totalTools || 0, icon: Wrench, color: 'text-blue-600' },
    { label: 'Active Tools', value: toolsStats?.activeTools || 0, icon: Activity, color: 'text-green-600' },
    { label: 'Total Usage', value: toolsStats?.totalUsage || 0, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Categories', value: toolsStats?.categories || 0, icon: Settings, color: 'text-orange-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Tools Management" 
      description="Manage AI tools, features, and user utilities"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tools by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Resume">Resume</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tools Table */}
        <Card>
          <CardHeader>
            <CardTitle>AI Tools ({tools?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools?.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-sm text-gray-600">{tool.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tool.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{tool.usage_count.toLocaleString()} uses</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={tool.is_active}
                            onCheckedChange={(checked) => handleToggleToolStatus(tool.id, checked)}
                          />
                          <Badge variant={tool.is_active ? 'default' : 'secondary'}>
                            {tool.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Resume Tools</span>
                  <Badge>2</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Interview Tools</span>
                  <Badge>1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Salary Tools</span>
                  <Badge>1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Daily Active Tools</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak Usage Hour</span>
                  <span className="font-medium">2-3 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Session Time</span>
                  <span className="font-medium">12 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New Tool
              </Button>
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Tool Settings
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Usage Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default ToolsManagement;
