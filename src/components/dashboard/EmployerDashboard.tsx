import React from 'react';
import { Link } from 'react-router-dom';
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
  Search, 
  Plus, 
  BarChart3, 
  Target, 
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function EmployerDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Employer Dashboard</h1>
          <p className="text-sm text-slate-600">
            Manage your hiring pipeline, review candidates, and grow your team.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
            <Link to="/jobs/post">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold">
            <Link to="/jobs/post/ai">
              <Sparkles className="h-4 w-4 mr-2 text-emerald-600" />
              AI Job Composer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/jobs/manage" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-8 w-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">8</div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Active Jobs <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employer/applications" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">147</div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Applications <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employer/interview/schedule" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">23</div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-purple-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Interviews <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employer/applications" className="block group">
              <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border-slate-200">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-slate-900">5</div>
                  <div className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                    Offers <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button asChild className="h-20 flex-col gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                  <Link to="/jobs/post">
                    <Plus className="h-5 w-5" />
                    <span className="text-xs font-bold">Post Job</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-blue-300 rounded-xl">
                  <Link to="/employer/crm/candidates">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Search Candidates</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-emerald-300 rounded-xl">
                  <Link to="/employer/applications">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Review Applications</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-purple-300 rounded-xl">
                  <Link to="/employer/interview/schedule">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-xs font-bold text-slate-700">Schedule Interviews</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-amber-300 rounded-xl">
                  <Link to="/employer/analytics">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-bold text-slate-700">View Analytics</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-1.5 hover:bg-slate-50 hover:border-slate-400 rounded-xl">
                  <Link to="/employer/profile">
                    <Building2 className="h-5 w-5 text-slate-700" />
                    <span className="text-xs font-bold text-slate-700">Company Profile</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Job Posts */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Recent Job Posts
                </span>
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-semibold">
                  <Link to="/jobs/manage">View All →</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/jobs/manage" className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Senior Frontend Developer</h3>
                    <p className="text-xs text-slate-500">Remote • Full-time</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">42 Applications</Badge>
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Posted 2 days ago</p>
                    <span className="inline-flex items-center justify-center mt-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                      Manage →
                    </span>
                  </div>
                </Link>
                
                <Link to="/jobs/manage" className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Product Manager</h3>
                    <p className="text-xs text-slate-500">San Francisco • Full-time</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">18 Applications</Badge>
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Posted 5 days ago</p>
                    <span className="inline-flex items-center justify-center mt-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                      Manage →
                    </span>
                  </div>
                </Link>

                <Link to="/jobs/manage" className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">UX Designer</h3>
                    <p className="text-xs text-slate-500">New York • Hybrid</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">67 Applications</Badge>
                      <Badge variant="outline" className="text-xs bg-slate-100 text-slate-600">Filled</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Posted 1 week ago</p>
                    <span className="inline-flex items-center justify-center mt-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                      Manage →
                    </span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hiring Pipeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Hiring Pipeline
                </span>
                <Link to="/employer/applications" className="text-xs font-bold text-blue-600 hover:underline">
                  View All →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/employer/applications" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  <span>New Applications</span>
                  <span>52</span>
                </div>
                <Progress value={85} className="h-2" />
              </Link>
              <Link to="/employer/applications" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  <span>Under Review</span>
                  <span>28</span>
                </div>
                <Progress value={60} className="h-2" />
              </Link>
              <Link to="/employer/interview/schedule" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-purple-600 transition-colors">
                  <span>Interviews Scheduled</span>
                  <span>12</span>
                </div>
                <Progress value={40} className="h-2" />
              </Link>
              <Link to="/employer/applications" className="block group">
                <div className="flex justify-between text-sm mb-1 font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                  <span>Offers Extended</span>
                  <span>3</span>
                </div>
                <Progress value={20} className="h-2" />
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Upcoming Interviews
                </span>
                <Link to="/employer/interview/schedule" className="text-xs font-bold text-blue-600 hover:underline">
                  Schedule →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/employer/interview/schedule" className="block p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">Sarah Johnson</h4>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Today</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Frontend Developer • 2:00 PM
                </p>
              </Link>
              <Link to="/employer/interview/schedule" className="block p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">Michael Chen</h4>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Tomorrow</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Product Manager • 10:00 AM
                </p>
              </Link>
              <Link to="/employer/interview/schedule" className="block p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">Emma Davis</h4>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Friday</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  UX Designer • 3:30 PM
                </p>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/jobs/manage" className="flex justify-between items-center hover:text-blue-600 transition-colors py-1 border-b border-slate-100">
                <span className="text-sm text-slate-600">Jobs Posted</span>
                <span className="font-bold text-slate-900">3</span>
              </Link>
              <Link to="/employer/applications" className="flex justify-between items-center hover:text-emerald-600 transition-colors py-1 border-b border-slate-100">
                <span className="text-sm text-slate-600">Applications</span>
                <span className="font-bold text-slate-900">89</span>
              </Link>
              <Link to="/employer/interview/schedule" className="flex justify-between items-center hover:text-purple-600 transition-colors py-1 border-b border-slate-100">
                <span className="text-sm text-slate-600">Interviews</span>
                <span className="font-bold text-slate-900">15</span>
              </Link>
              <Link to="/employer/applications" className="flex justify-between items-center hover:text-amber-600 transition-colors py-1">
                <span className="text-sm text-slate-600">Hires</span>
                <span className="font-bold text-slate-900">2</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}