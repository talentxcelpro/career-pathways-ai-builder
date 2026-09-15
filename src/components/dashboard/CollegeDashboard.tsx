import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  School, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  FileText,
  Building2,
  BarChart3,
  UserCheck,
  BookOpen,
  Award,
  Target
} from 'lucide-react';

export function CollegeDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">College Administrator Dashboard</h1>
        <p className="text-muted-foreground">
          Manage student placements, track progress, and connect with employers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">342</div>
                <div className="text-xs text-muted-foreground">Placed Students</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">89</div>
                <div className="text-xs text-muted-foreground">Partner Companies</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">78%</div>
                <div className="text-xs text-muted-foreground">Placement Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Students</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Employer Relations</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Schedule Events</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Placement Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Generate Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Course Management</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Placements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Recent Placements
                </span>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      AK
                    </div>
                    <div>
                      <h3 className="font-medium">Arjun Kumar</h3>
                      <p className="text-sm text-muted-foreground">Computer Science • 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">TechCorp Solutions</p>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                    <Badge variant="secondary" className="mt-1">₹8.5 LPA</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      SP
                    </div>
                    <div>
                      <h3 className="font-medium">Sneha Patel</h3>
                      <p className="text-sm text-muted-foreground">Electronics • 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Innovation Labs</p>
                    <p className="text-sm text-muted-foreground">Hardware Engineer</p>
                    <Badge variant="secondary" className="mt-1">₹7.2 LPA</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      RM
                    </div>
                    <div>
                      <h3 className="font-medium">Rahul Mehta</h3>
                      <p className="text-sm text-muted-foreground">Mechanical • 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">AutoTech Industries</p>
                    <p className="text-sm text-muted-foreground">Design Engineer</p>
                    <Badge variant="secondary" className="mt-1">₹6.8 LPA</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Placement Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                2024 Placement Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Target</span>
                  <span>342/450</span>
                </div>
                <Progress value={76} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">76% completed</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Computer Science</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Electronics</span>
                  <span>76%</span>
                </div>
                <Progress value={76} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Mechanical</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Civil</span>
                  <span>52%</span>
                </div>
                <Progress value={52} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Campus Drive - TechCorp</h4>
                  <Badge variant="outline" className="text-xs">Tomorrow</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Software roles • 150 positions
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Industry Expert Session</h4>
                  <Badge variant="outline" className="text-xs">This Week</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI & Machine Learning trends
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Job Fair 2024</h4>
                  <Badge variant="outline" className="text-xs">Next Week</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  25+ companies participating
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Department Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Package</span>
                <span className="font-medium">₹7.8 LPA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Highest Package</span>
                <span className="font-medium">₹24 LPA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dream Offers</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Super Dream Offers</span>
                <span className="font-medium">8</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}