
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Target, 
  TrendingUp, 
  Users, 
  Activity,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import { useCareerMapManagement } from '@/hooks/useCareerMapManagement';

const CareerMapManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    careerMapStats,
    careerGoals,
    careerSwitches,
    isLoading,
    deleteCareerGoal
  } = useCareerMapManagement();

  const statsCards = [
    { label: 'Total Roadmaps', value: careerMapStats?.totalRoadmaps || 0, icon: Map, color: 'text-blue-600' },
    { label: 'Active Goals', value: careerMapStats?.activeGoals || 0, icon: Target, color: 'text-green-600' },
    { label: 'Career Switches', value: careerMapStats?.careerSwitches || 0, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Active Users', value: careerMapStats?.activeUsers || 0, icon: Users, color: 'text-orange-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Career Map Management" 
      description="Manage career guidance, roadmaps, and user goals"
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
                  placeholder="Search career goals, roles, or positions..."
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Career Goals */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Career Goals ({careerGoals?.length || 0})</CardTitle>
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
                        <TableHead>User</TableHead>
                        <TableHead>Current → Target</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {careerGoals?.map((goal) => (
                        <TableRow key={goal.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {goal.profiles?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{goal.profiles?.full_name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-600">{goal.profiles?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">{goal.current_position || 'Not specified'}</p>
                              <p className="text-sm">→ {goal.target_role}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {goal.timeline_months ? `${goal.timeline_months} months` : 'Not set'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={goal.is_active ? 'default' : 'secondary'}>
                              {goal.is_active ? 'Active' : 'Inactive'}
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
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600"
                                onClick={() => deleteCareerGoal(goal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
          </div>

          {/* Career Switches */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Recent Career Switches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careerSwitches?.slice(0, 5).map((switchData) => (
                    <div key={switchData.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {switchData.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{switchData.profiles?.full_name}</p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {switchData.from_role} → {switchData.to_role}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Difficulty: {switchData.difficulty_score}/10
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(switchData.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default CareerMapManagement;
