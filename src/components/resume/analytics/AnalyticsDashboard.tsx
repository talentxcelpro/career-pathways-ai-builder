import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Eye, Download, Send, Star, Calendar, 
  Target, Clock, MapPin, Briefcase, Award, Users 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  resumeId,
  isOpen,
  onClose
}) => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data - would come from Supabase in real implementation
  const overviewStats = {
    totalViews: 1247,
    downloads: 89,
    applications: 23,
    avgViewTime: '2m 34s',
    viewsThisWeek: 156,
    viewsGrowth: 12.5
  };

  const viewsData = [
    { date: '2024-01-01', views: 45, downloads: 3 },
    { date: '2024-01-02', views: 52, downloads: 5 },
    { date: '2024-01-03', views: 38, downloads: 2 },
    { date: '2024-01-04', views: 67, downloads: 8 },
    { date: '2024-01-05', views: 71, downloads: 6 },
    { date: '2024-01-06', views: 59, downloads: 4 },
    { date: '2024-01-07', views: 83, downloads: 9 }
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 45, color: '#0077B5' },
    { name: 'Indeed', value: 28, color: '#2557A7' },
    { name: 'Direct Link', value: 15, color: '#16A34A' },
    { name: 'Email', value: 8, color: '#DC2626' },
    { name: 'Other', value: 4, color: '#6B7280' }
  ];

  const applicationData = [
    { company: 'Google', position: 'Senior Developer', status: 'Interview', appliedDate: '2024-01-05', response: 'Positive' },
    { company: 'Microsoft', position: 'Product Manager', status: 'Under Review', appliedDate: '2024-01-03', response: 'Pending' },
    { company: 'Amazon', position: 'Software Engineer', status: 'Rejected', appliedDate: '2024-01-01', response: 'No Match' },
    { company: 'Apple', position: 'UI Designer', status: 'Applied', appliedDate: '2024-01-07', response: 'Pending' }
  ];

  const skillsPerformance = [
    { skill: 'React', mentions: 89, trend: 'up' },
    { skill: 'TypeScript', mentions: 76, trend: 'up' },
    { skill: 'Node.js', mentions: 54, trend: 'stable' },
    { skill: 'Python', mentions: 43, trend: 'down' },
    { skill: 'AWS', mentions: 38, trend: 'up' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Resume Analytics & Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        
        <CardContent className="h-full overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="traffic">Traffic & Views</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold">{overviewStats.totalViews.toLocaleString()}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+{overviewStats.viewsGrowth}%</span>
                      <span className="text-muted-foreground ml-1">this week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Downloads</p>
                        <p className="text-2xl font-bold">{overviewStats.downloads}</p>
                      </div>
                      <Download className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-muted-foreground">7.1% conversion rate</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Applications</p>
                        <p className="text-2xl font-bold">{overviewStats.applications}</p>
                      </div>
                      <Send className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-muted-foreground">4 pending responses</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. View Time</p>
                        <p className="text-2xl font-bold">{overviewStats.avgViewTime}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-muted-foreground">+15s from last week</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Views & Downloads Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={viewsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="views" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                        <Area type="monotone" dataKey="downloads" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {sourceData.map((source) => (
                        <div key={source.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: source.color }}
                            />
                            <span className="text-sm">{source.name}</span>
                          </div>
                          <span className="text-sm font-medium">{source.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applicationData.map((app, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Briefcase className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{app.position}</h4>
                            <p className="text-sm text-muted-foreground">{app.company}</p>
                            <p className="text-xs text-muted-foreground">Applied {app.appliedDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              app.status === 'Interview' ? 'default' :
                              app.status === 'Under Review' ? 'secondary' :
                              app.status === 'Rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {app.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{app.response}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillsPerformance.map((skill) => (
                      <div key={skill.skill} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{skill.skill}</span>
                          <Badge variant="outline">
                            {skill.trend === 'up' ? '↗️' : skill.trend === 'down' ? '↘️' : '→'} 
                            {skill.trend}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{skill.mentions} mentions</span>
                          <Progress value={(skill.mentions / 100) * 100} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                      <h4 className="font-medium text-blue-900">Optimize for ATS</h4>
                      <p className="text-sm text-blue-700">Add 3 more technical keywords to improve ATS score by 15%</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                      <h4 className="font-medium text-green-900">Strong Performance</h4>
                      <p className="text-sm text-green-700">Your experience section performs 23% above industry average</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                      <h4 className="font-medium text-yellow-900">Improvement Opportunity</h4>
                      <p className="text-sm text-yellow-700">Consider adding quantified achievements to projects section</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Industry Benchmarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>ATS Compatibility</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                        <p className="text-xs text-muted-foreground">15% above average</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Keyword Optimization</span>
                          <span>72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                        <p className="text-xs text-muted-foreground">8% below average</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content Quality</span>
                          <span>91%</span>
                        </div>
                        <Progress value={91} className="h-2" />
                        <p className="text-xs text-muted-foreground">26% above average</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};