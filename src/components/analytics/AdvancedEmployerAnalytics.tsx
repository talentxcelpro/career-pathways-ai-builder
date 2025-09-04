import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart3, TrendingUp, Users, Target, Eye, 
  Calendar, Download, Filter, RefreshCw,
  DollarSign, Briefcase, UserCheck, Clock,
  Award, Star, MessageCircle, Share2, Heart
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface EmployerAnalytics {
  overview: {
    totalJobPostings: number;
    activeJobs: number;
    totalApplications: number;
    hiredCandidates: number;
    profileViews: number;
    followerCount: number;
  };
  metrics: {
    applicationTrend: Array<{ date: string; applications: number; views: number }>;
    jobPerformance: Array<{ jobTitle: string; applications: number; hires: number; cost: number }>;
    candidateSource: Array<{ source: string; count: number; color: string }>;
    hiringFunnel: Array<{ stage: string; count: number; percentage: number }>;
  };
  insights: {
    bestPerformingJobs: Array<{ title: string; applications: number; conversionRate: number }>;
    topSkillsInDemand: Array<{ skill: string; demand: number; growth: number }>;
    competitorAnalysis: Array<{ company: string; averageSalary: number; jobCount: number }>;
  };
}

export const AdvancedEmployerAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch employer analytics data
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['employer-analytics', dateRange],
    queryFn: async () => {
      // Mock data - in real app, fetch from analytics API
      const mockData: EmployerAnalytics = {
        overview: {
          totalJobPostings: 24,
          activeJobs: 8,
          totalApplications: 1247,
          hiredCandidates: 15,
          profileViews: 5680,
          followerCount: 892
        },
        metrics: {
          applicationTrend: [
            { date: '2024-01-01', applications: 45, views: 320 },
            { date: '2024-01-02', applications: 52, views: 380 },
            { date: '2024-01-03', applications: 38, views: 290 },
            { date: '2024-01-04', applications: 65, views: 450 },
            { date: '2024-01-05', applications: 71, views: 510 },
            { date: '2024-01-06', applications: 58, views: 420 },
            { date: '2024-01-07', applications: 49, views: 370 }
          ],
          jobPerformance: [
            { jobTitle: 'Senior Software Engineer', applications: 89, hires: 2, cost: 1200 },
            { jobTitle: 'Product Manager', applications: 156, hires: 1, cost: 800 },
            { jobTitle: 'Data Scientist', applications: 67, hires: 3, cost: 1500 },
            { jobTitle: 'UX Designer', applications: 134, hires: 2, cost: 950 }
          ],
          candidateSource: [
            { source: 'Direct Applications', count: 540, color: '#8884d8' },
            { source: 'Referrals', count: 320, color: '#82ca9d' },
            { source: 'LinkedIn', count: 240, color: '#ffc658' },
            { source: 'Other Job Boards', count: 147, color: '#ff7c7c' }
          ],
          hiringFunnel: [
            { stage: 'Applications', count: 1247, percentage: 100 },
            { stage: 'Screening', count: 374, percentage: 30 },
            { stage: 'Interview', count: 125, percentage: 10 },
            { stage: 'Offer', count: 25, percentage: 2 },
            { stage: 'Hired', count: 15, percentage: 1.2 }
          ]
        },
        insights: {
          bestPerformingJobs: [
            { title: 'Senior Software Engineer', applications: 89, conversionRate: 2.2 },
            { title: 'Data Scientist', applications: 67, conversionRate: 4.5 },
            { title: 'Product Manager', applications: 156, conversionRate: 0.6 }
          ],
          topSkillsInDemand: [
            { skill: 'React', demand: 85, growth: 12 },
            { skill: 'Python', demand: 78, growth: 8 },
            { skill: 'Machine Learning', demand: 72, growth: 25 },
            { skill: 'Product Strategy', demand: 65, growth: 15 }
          ],
          competitorAnalysis: [
            { company: 'TechCorp Inc.', averageSalary: 95000, jobCount: 45 },
            { company: 'Innovation Labs', averageSalary: 88000, jobCount: 32 },
            { company: 'StartupXYZ', averageSalary: 78000, jobCount: 18 }
          ]
        }
      };

      return mockData;
    },
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  const calculateConversionRate = (hires: number, applications: number): string => {
    return ((hires / applications) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Employer Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Advanced insights to optimize your hiring process and employer brand
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{analytics?.overview.totalJobPostings}</p>
            <p className="text-sm text-muted-foreground">Total Jobs Posted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{analytics?.overview.activeJobs}</p>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{analytics?.overview.totalApplications.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <UserCheck className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{analytics?.overview.hiredCandidates}</p>
            <p className="text-sm text-muted-foreground">Candidates Hired</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{analytics?.overview.profileViews.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Profile Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{analytics?.overview.followerCount}</p>
            <p className="text-sm text-muted-foreground">Company Followers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Job Performance</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Application Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Application Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.metrics.applicationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                      name="Applications"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="2"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                      name="Job Views"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Candidate Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidate Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.metrics.candidateSource}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {analytics?.metrics.candidateSource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Hiring Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hiring Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.metrics.hiringFunnel.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {stage.count.toLocaleString()} candidates
                        </span>
                        <Badge variant="outline">
                          {stage.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.metrics.jobPerformance.map((job) => (
                  <div key={job.jobTitle} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{job.jobTitle}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applications} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          {job.hires} hired
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${job.cost} cost per hire
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {calculateConversionRate(job.hires, job.applications)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Conversion Rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Candidate Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.insights.topSkillsInDemand.map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{skill.demand}% demand</Badge>
                          <Badge variant="outline" className="text-green-600">
                            +{skill.growth}% growth
                          </Badge>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${skill.demand}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Performing Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.insights.bestPerformingJobs.map((job, index) => (
                    <div key={job.title} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{job.applications} applications</span>
                          <span>{job.conversionRate}% conversion</span>
                        </div>
                      </div>
                      <Award className="h-5 w-5 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.insights.competitorAnalysis.map((competitor) => (
                  <div key={competitor.company} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {competitor.company.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{competitor.company}</h4>
                        <p className="text-sm text-muted-foreground">
                          {competitor.jobCount} active jobs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${competitor.averageSalary.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Salary
                      </div>
                    </div>
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