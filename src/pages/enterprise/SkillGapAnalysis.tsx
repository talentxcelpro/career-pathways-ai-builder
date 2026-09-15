import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingDown, 
  BookOpen, 
  Target, 
  Award, 
  Users,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

export const SkillGapAnalysis: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('engineering');

  const departments = [
    {
      id: 'engineering',
      name: 'Engineering',
      totalEmployees: 45,
      skillGaps: [
        { skill: 'React Native', gap: 78, priority: 'high', employees: 12 },
        { skill: 'DevOps', gap: 65, priority: 'high', employees: 8 },
        { skill: 'Machine Learning', gap: 45, priority: 'medium', employees: 6 },
        { skill: 'Cloud Architecture', gap: 38, priority: 'medium', employees: 10 }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      totalEmployees: 28,
      skillGaps: [
        { skill: 'Digital Analytics', gap: 72, priority: 'high', employees: 15 },
        { skill: 'Content Strategy', gap: 58, priority: 'high', employees: 12 },
        { skill: 'SEO/SEM', gap: 42, priority: 'medium', employees: 8 },
        { skill: 'Social Media Marketing', gap: 35, priority: 'low', employees: 5 }
      ]
    }
  ];

  const trainingProviders = [
    {
      name: 'Coursera for Business',
      rating: 4.8,
      courses: 847,
      specialization: 'Technology & Data Science',
      price: '$399/month',
      certification: true
    },
    {
      name: 'LinkedIn Learning',
      rating: 4.6,
      courses: 1250,
      specialization: 'Business & Creative Skills',
      price: '$299/month',
      certification: true
    },
    {
      name: 'Udemy Business',
      rating: 4.5,
      courses: 2100,
      specialization: 'Technical Skills',
      price: '$360/month',
      certification: false
    }
  ];

  const selectedDept = departments.find(dept => dept.id === selectedDepartment);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              Skill Gap Analysis & Corporate Training
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Analyze workforce skills and recommend targeted training programs from curated marketplace
          </p>
        </div>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Gap Analysis</TabsTrigger>
            <TabsTrigger value="training">Training Marketplace</TabsTrigger>
            <TabsTrigger value="tracking">Progress Tracking</TabsTrigger>
            <TabsTrigger value="roi">ROI Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            {/* Department Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Gaps</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <p className="text-xs text-muted-foreground">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments Analyzed</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive coverage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Budget</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45K</div>
                  <p className="text-xs text-muted-foreground">
                    Allocated this quarter
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">
                    Training programs
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Department Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Department</CardTitle>
                  <CardDescription>Choose a department to analyze skill gaps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <Button
                        key={dept.id}
                        variant={selectedDepartment === dept.id ? "default" : "ghost"}
                        className="w-full justify-start p-4 h-auto"
                        onClick={() => setSelectedDepartment(dept.id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {dept.totalEmployees} employees
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Gap Details */}
              {selectedDept && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      Skill Gaps - {selectedDept.name}
                    </CardTitle>
                    <CardDescription>
                      Critical skills missing in your {selectedDept.name.toLowerCase()} team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedDept.skillGaps.map((gap, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{gap.skill}</h3>
                              <Badge 
                                variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}
                              >
                                {gap.priority} priority
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-600">
                              {gap.employees} employees affected
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={gap.gap} className="flex-1" />
                            <span className="text-sm font-medium text-red-600">
                              {gap.gap}% gap
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {gap.gap > 70 ? 'Critical skill shortage requiring immediate training' :
                             gap.gap > 50 ? 'Moderate gap, consider upskilling programs' :
                             'Minor gap, can be addressed through workshops'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Curated Training Marketplace
                </CardTitle>
                <CardDescription>
                  Premium training providers matched to your skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingProviders.map((provider, index) => (
                    <Card key={index} className="border-2 hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                            <span className="text-sm font-medium">{provider.rating}</span>
                          </div>
                        </div>
                        <CardDescription>{provider.specialization}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Courses:</span>
                            <div className="font-medium">{provider.courses}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <div className="font-medium">{provider.price}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {provider.certification && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>

                        <Button className="w-full">
                          View Courses
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Active Training Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { course: 'React Native Fundamentals', participants: 12, progress: 65, completion: '3 weeks' },
                      { course: 'DevOps Best Practices', participants: 8, progress: 40, completion: '5 weeks' },
                      { course: 'Digital Marketing Analytics', participants: 15, progress: 80, completion: '1 week' }
                    ].map((program, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{program.course}</h3>
                          <Badge variant="outline">{program.participants} enrolled</Badge>
                        </div>
                        <Progress value={program.progress} />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{program.progress}% complete</span>
                          <span>Est. completion: {program.completion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recent Completions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'John Doe', course: 'Cloud Architecture', date: '2 days ago', rating: 4.8 },
                      { name: 'Sarah Smith', course: 'Machine Learning Basics', date: '1 week ago', rating: 4.9 },
                      { name: 'Mike Johnson', course: 'SEO Fundamentals', date: '2 weeks ago', rating: 4.7 }
                    ].map((completion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{completion.name}</p>
                          <p className="text-xs text-gray-600">{completion.course}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                            {completion.rating}
                          </div>
                          <p className="text-xs text-gray-500">{completion.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Training ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">340%</div>
                    <p className="text-sm text-gray-600">Return on investment</p>
                    <p className="text-xs text-gray-500 mt-2">
                      $3.40 return per $1 invested
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">$285K</div>
                    <p className="text-sm text-gray-600">Annual savings</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reduced hiring costs
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productivity Increase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">23%</div>
                    <p className="text-sm text-gray-600">Team efficiency</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Post-training improvement
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Training Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Technical Skills', amount: 45000, percentage: 45, color: 'bg-blue-500' },
                    { category: 'Leadership Development', amount: 25000, percentage: 25, color: 'bg-green-500' },
                    { category: 'Digital Marketing', amount: 20000, percentage: 20, color: 'bg-purple-500' },
                    { category: 'Compliance Training', amount: 10000, percentage: 10, color: 'bg-gray-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{item.category}</span>
                          <span className="font-medium">${item.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};