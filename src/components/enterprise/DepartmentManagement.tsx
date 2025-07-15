import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  MoreVertical,
  UserPlus,
  Settings,
  TrendingUp
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  headOfDepartment: string;
  budget: string;
  performance: number;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Human Resources',
    description: 'Talent acquisition and employee relations',
    memberCount: 12,
    headOfDepartment: 'Sarah Johnson',
    budget: '$245,000',
    performance: 92
  },
  {
    id: '2',
    name: 'Marketing',
    description: 'Brand management and growth strategies',
    memberCount: 8,
    headOfDepartment: 'Mike Chen',
    budget: '$180,000',
    performance: 87
  },
  {
    id: '3',
    name: 'Engineering',
    description: 'Product development and technical innovation',
    memberCount: 25,
    headOfDepartment: 'Alex Rodriguez',
    budget: '$520,000',
    performance: 95
  },
  {
    id: '4',
    name: 'Sales',
    description: 'Revenue generation and client relationships',
    memberCount: 15,
    headOfDepartment: 'Emily Davis',
    budget: '$320,000',
    performance: 89
  },
  {
    id: '5',
    name: 'Finance',
    description: 'Financial planning and analysis',
    memberCount: 6,
    headOfDepartment: 'Robert Kim',
    budget: '$150,000',
    performance: 94
  }
];

export const DepartmentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments] = useState<Department[]>(mockDepartments);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-muted-foreground">Organize and manage your company departments</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredDepartments.length} departments
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <Card key={department.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{department.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{department.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{department.memberCount} members</span>
                </div>
                <Badge variant="outline">{department.budget}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Performance</span>
                  <span className={getPerformanceColor(department.performance)}>
                    {department.performance}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${department.performance}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Head of Department</p>
                <p className="text-sm font-medium">{department.headOfDepartment}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add Member
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Department Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{departments.length}</p>
              <p className="text-sm text-muted-foreground">Total Departments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {departments.reduce((sum, dept) => sum + dept.memberCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(departments.reduce((sum, dept) => sum + dept.performance, 0) / departments.length)}%
              </p>
              <p className="text-sm text-muted-foreground">Average Performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};