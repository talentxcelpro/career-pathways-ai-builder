import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Users, Eye, MessageCircle, Heart, Share2, 
  Target, Award, Zap, Calendar, Brain, ArrowUp, ArrowDown
} from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const EnhancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, fetch from analytics service
  const overviewMetrics = {
    profileViews: { value: 2847, change: 12.5 },
    applications: { value: 23, change: -3.2 },
    connections: { value: 156, change: 8.7 },
    contentEngagement: { value: 89.3, change: 15.2 }
  };

  const engagementData = [
    { day: 'Mon', views: 340, applications: 4, connections: 8 },
    { day: 'Tue', views: 425, applications: 6, connections: 12 },
    { day: 'Wed', views: 389, applications: 3, connections: 6 },
    { day: 'Thu', views: 567, applications: 8, connections: 15 },
    { day: 'Fri', views: 634, applications: 2, connections: 9 },
    { day: 'Sat', views: 234, applications: 1, connections: 4 },
    { day: 'Sun', views: 178, applications: 0, connections: 2 }
  ];

  const skillsProgress = [
    { skill: 'React', progress: 85, trend: 'up' },
    { skill: 'Node.js', progress: 78, trend: 'up' },
    { skill: 'TypeScript', progress: 72, trend: 'stable' },
    { skill: 'Python', progress: 65, trend: 'up' },
    { skill: 'AWS', progress: 58, trend: 'down' }
  ];

  const industryComparison = [
    { metric: 'Profile Views', you: 2847, average: 1924, percentile: 75 },
    { metric: 'Response Rate', you: 23, average: 18, percentile: 68 },
    { metric: 'Skill Score', you: 89, average: 76, percentile: 82 },
    { metric: 'Network Growth', you: 156, average: 134, percentile: 72 }
  ];

  const MetricCard = ({ title, value, change, icon: Icon, suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}{suffix}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-muted-foreground ml-1">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Advanced insights into your career progress</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Profile Views"
              value={overviewMetrics.profileViews.value}
              change={overviewMetrics.profileViews.change}
              icon={Eye}
            />
            <MetricCard
              title="Applications"
              value={overviewMetrics.applications.value}
              change={overviewMetrics.applications.change}
              icon={Target}
            />
            <MetricCard
              title="Connections"
              value={overviewMetrics.connections.value}
              change={overviewMetrics.connections.change}
              icon={Users}
            />
            <MetricCard
              title="Engagement Rate"
              value={overviewMetrics.contentEngagement.value}
              change={overviewMetrics.contentEngagement.change}
              icon={Heart}
              suffix="%"
            />
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="applications" 
                    stackId="2" 
                    stroke="hsl(var(--secondary))" 
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(var(--primary))" />
                    <Bar dataKey="connections" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Direct', percentage: 45, color: 'hsl(var(--primary))' },
                    { source: 'Search', percentage: 28, color: 'hsl(var(--secondary))' },
                    { source: 'Social', percentage: 18, color: 'hsl(var(--accent))' },
                    { source: 'Referral', percentage: 9, color: 'hsl(var(--muted))' }
                  ].map((item) => (
                    <div key={item.source} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.source}</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-8">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillsProgress.map((skill) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{skill.progress}%</Badge>
                        {skill.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {skill.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                        {skill.trend === 'stable' && <span className="w-4 h-4 rounded-full bg-yellow-500" />}
                      </div>
                    </div>
                    <Progress value={skill.progress} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                See how you stack up against industry professionals
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {industryComparison.map((item) => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.metric}</span>
                      <Badge variant="secondary">{item.percentile}th percentile</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">You:</span>
                        <span className="font-medium">{item.you}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average:</span>
                        <span>{item.average}</span>
                      </div>
                    </div>
                    <Progress value={item.percentile} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};