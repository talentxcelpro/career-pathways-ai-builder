import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  FileText,
  Search,
  Plus,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';

export function EmployerDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Employer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your hiring pipeline, review candidates, and grow your team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">8</div>
                <div className="text-xs text-muted-foreground">Active Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">147</div>
                <div className="text-xs text-muted-foreground">Applications</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">23</div>
                <div className="text-xs text-muted-foreground">Interviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs text-muted-foreground">Offers</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button className="h-20 flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Post Job</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Search className="h-6 w-6" />
                  <span className="text-sm">Search Candidates</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Review Applications</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Schedule Interviews</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Company Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Job Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recent Job Posts
                </span>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground">Remote • Full-time</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">42 Applications</Badge>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Posted 2 days ago</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">Product Manager</h3>
                    <p className="text-sm text-muted-foreground">San Francisco • Full-time</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">18 Applications</Badge>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Posted 5 days ago</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">UX Designer</h3>
                    <p className="text-sm text-muted-foreground">New York • Hybrid</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">67 Applications</Badge>
                      <Badge>Closed</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Posted 1 week ago</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hiring Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Hiring Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>New Applications</span>
                  <span>52</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Under Review</span>
                  <span>28</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Interviews Scheduled</span>
                  <span>12</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Offers Extended</span>
                  <span>3</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Sarah Johnson</h4>
                  <Badge variant="outline" className="text-xs">Today</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Frontend Developer • 2:00 PM
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Michael Chen</h4>
                  <Badge variant="outline" className="text-xs">Tomorrow</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Product Manager • 10:00 AM
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Emma Davis</h4>
                  <Badge variant="outline" className="text-xs">Friday</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  UX Designer • 3:30 PM
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Jobs Posted</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Applications</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interviews</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hires</span>
                <span className="font-medium">2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}