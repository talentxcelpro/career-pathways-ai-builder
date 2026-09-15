import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BookOpen, 
  Award, 
  ArrowRight,
  Brain,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';

export const InternalMobility: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('john-doe');

  const employees = [
    {
      id: 'john-doe',
      name: 'John Doe',
      currentRole: 'Software Engineer',
      department: 'Engineering',
      careerScore: 85,
      skillGaps: ['Leadership', 'Product Management'],
      suggestedRoles: ['Senior Software Engineer', 'Tech Lead', 'Product Manager'],
      learningPath: ['Advanced React', 'Team Leadership', 'Product Strategy']
    },
    {
      id: 'sarah-smith',
      name: 'Sarah Smith',
      currentRole: 'Data Analyst',
      department: 'Analytics',
      careerScore: 92,
      skillGaps: ['Machine Learning', 'Python'],
      suggestedRoles: ['Data Scientist', 'ML Engineer', 'Analytics Manager'],
      learningPath: ['Python for Data Science', 'ML Fundamentals', 'Data Visualization']
    }
  ];

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              AI-Powered Internal Mobility & Career Pathing
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Identify and develop your existing employees with AI-driven career recommendations
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="employees">Employee Insights</TabsTrigger>
            <TabsTrigger value="paths">Career Paths</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Internal Hires</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">
                    +23% from last quarter
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time to Fill</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12 days</div>
                  <p className="text-xs text-muted-foreground">
                    60% faster than external
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-xs text-muted-foreground">
                    +8% improvement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Career Paths</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    Active pathways
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Movements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Internal Movements</CardTitle>
                <CardDescription>Latest career progressions within your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Alice Johnson', from: 'Junior Developer', to: 'Senior Developer', department: 'Engineering', date: '2 days ago' },
                    { name: 'Bob Wilson', from: 'Marketing Specialist', to: 'Marketing Manager', department: 'Marketing', date: '1 week ago' },
                    { name: 'Carol Brown', from: 'Data Analyst', to: 'Data Scientist', department: 'Analytics', date: '2 weeks ago' }
                  ].map((movement, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                          {movement.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{movement.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{movement.from}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{movement.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{movement.department}</Badge>
                        <p className="text-xs text-gray-500 mt-1">{movement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee List */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Profiles</CardTitle>
                  <CardDescription>Select an employee to view detailed insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employees.map((employee) => (
                      <Button
                        key={employee.id}
                        variant={selectedEmployee === employee.id ? "default" : "ghost"}
                        className="w-full justify-start p-4 h-auto"
                        onClick={() => setSelectedEmployee(employee.id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.currentRole}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Employee Details */}
              {selectedEmp && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Career Readiness Score
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {selectedEmp.careerScore}%
                        </div>
                        <Progress value={selectedEmp.careerScore} className="mb-2" />
                        <p className="text-sm text-gray-600">Ready for advancement</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-sm">Skill Gaps to Address:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedEmp.skillGaps.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Suggested Career Moves
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedEmp.suggestedRoles.map((role, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{role}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                                <span className="text-xs text-gray-600 ml-1">85% match</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended Learning Path
                </CardTitle>
                <CardDescription>
                  Personalized development plan for {selectedEmp?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEmp && (
                  <div className="space-y-4">
                    {selectedEmp.learningPath.map((course, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{course}</p>
                          <p className="text-sm text-gray-600">Duration: 2-3 weeks</p>
                        </div>
                        <Badge variant="outline">
                          {index === 0 ? 'In Progress' : index === 1 ? 'Next' : 'Planned'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Mobility Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { dept: 'Engineering', movements: 23, trend: '+15%' },
                      { dept: 'Marketing', movements: 12, trend: '+8%' },
                      { dept: 'Sales', movements: 18, trend: '+22%' },
                      { dept: 'Product', movements: 9, trend: '+5%' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{item.dept}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{item.movements} moves</span>
                          <Badge variant="outline" className="text-green-600">
                            {item.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">94%</div>
                      <p className="text-sm text-gray-600">Employee Satisfaction</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">40%</div>
                      <p className="text-sm text-gray-600">Reduction in Turnover</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">60%</div>
                      <p className="text-sm text-gray-600">Faster Internal Fills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};