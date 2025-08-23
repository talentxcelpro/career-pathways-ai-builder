import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AIStatusIndicator } from "@/components/ui/AIStatusIndicator";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  Download
} from "lucide-react";

interface RecruiterMetrics {
  activeJobs: number;
  totalApplications: number;
  shortlistedCandidates: number;
  scheduledInterviews: number;
  hireMade: number;
  conversionRate: number;
  avgTimeToHire: number;
  candidateQualityScore: number;
}

interface RecruitmentPipeline {
  stage: string;
  count: number;
  conversionRate: number;
  avgDuration: string;
}

interface TopCandidate {
  id: string;
  name: string;
  position: string;
  matchScore: number;
  status: string;
  appliedDate: string;
  skills: string[];
  experience: string;
}

export const RecruiterDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');

  // Fetch recruiter metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['recruiter-metrics', timeRange],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        activeJobs: 24,
        totalApplications: 1247,
        shortlistedCandidates: 186,
        scheduledInterviews: 45,
        hireMade: 12,
        conversionRate: 85.3,
        avgTimeToHire: 18,
        candidateQualityScore: 92
      } as RecruiterMetrics;
    }
  });

  // Fetch recruitment pipeline data
  const { data: pipeline } = useQuery({
    queryKey: ['recruitment-pipeline', timeRange],
    queryFn: async () => {
      return [
        { stage: 'Applications', count: 1247, conversionRate: 14.9, avgDuration: '2 days' },
        { stage: 'Screening', count: 186, conversionRate: 24.2, avgDuration: '3 days' },
        { stage: 'Interview', count: 45, conversionRate: 53.3, avgDuration: '5 days' },
        { stage: 'Final Review', count: 24, conversionRate: 50.0, avgDuration: '3 days' },
        { stage: 'Offer', count: 12, conversionRate: 100, avgDuration: '1 day' }
      ] as RecruitmentPipeline[];
    }
  });

  // Fetch top candidates
  const { data: topCandidates } = useQuery({
    queryKey: ['top-candidates'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Sarah Johnson',
          position: 'Senior Software Engineer',
          matchScore: 96,
          status: 'Interview Scheduled',
          appliedDate: '2024-01-15',
          skills: ['React', 'Node.js', 'AWS', 'Python'],
          experience: '5+ years'
        },
        {
          id: '2',
          name: 'Michael Chen',
          position: 'Product Manager',
          matchScore: 94,
          status: 'Under Review',
          appliedDate: '2024-01-14',
          skills: ['Product Strategy', 'Agile', 'Data Analysis'],
          experience: '7+ years'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          position: 'UX Designer',
          matchScore: 91,
          status: 'Shortlisted',
          appliedDate: '2024-01-13',
          skills: ['Figma', 'User Research', 'Design Systems'],
          experience: '4+ years'
        }
      ] as TopCandidate[];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Interview Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Shortlisted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (metricsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <AIStatusIndicator module="Recruiter" feature="AI-Powered Analytics">
            <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
          </AIStatusIndicator>
          <p className="text-muted-foreground mt-1">
            AI-powered recruitment analytics and candidate management
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalApplications?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +3.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgTimeToHire} days</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              -2 days improved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Recruitment Pipeline</TabsTrigger>
          <TabsTrigger value="candidates">Top Candidates</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        {/* Recruitment Pipeline */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
              <CardDescription>
                Track candidates through each stage of your hiring process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipeline?.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{stage.stage}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{stage.count} candidates</span>
                          <span>{stage.conversionRate}% conversion</span>
                          <span>{stage.avgDuration} avg duration</span>
                        </div>
                      </div>
                      <Progress value={stage.conversionRate} className="h-2" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {stage.count}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Candidates */}
        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Matched Top Candidates</CardTitle>
              <CardDescription>
                Candidates ranked by AI compatibility score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCandidates?.map((candidate) => (
                  <div key={candidate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <Badge variant="secondary">{candidate.matchScore}% Match</Badge>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {candidate.position} • {candidate.experience}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Applied on {new Date(candidate.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Insights</CardTitle>
                <CardDescription>Machine learning model effectiveness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Candidate Quality Score</span>
                  <span className="text-2xl font-bold text-green-600">{metrics?.candidateQualityScore}%</span>
                </div>
                <Progress value={metrics?.candidateQualityScore} className="h-2" />
                
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Resume Matching Accuracy</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Interview Success Prediction</span>
                    <span className="font-medium">87.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cultural Fit Assessment</span>
                    <span className="font-medium">91.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Efficiency Metrics</CardTitle>
                <CardDescription>Performance compared to industry benchmarks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time to Fill</span>
                      <span className="text-green-600 font-medium">15% faster</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cost per Hire</span>
                      <span className="text-green-600 font-medium">23% lower</span>
                    </div>
                    <Progress value={77} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quality of Hire</span>
                      <span className="text-green-600 font-medium">18% higher</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Intelligence</CardTitle>
                <CardDescription>Real-time talent market insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Talent Availability</span>
                      <Badge variant="outline" className="text-green-600">High</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      25% increase in qualified candidates this month
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Salary Competitiveness</span>
                      <Badge variant="outline" className="text-blue-600">Competitive</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your offers are 12% above market average
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Time to Hire Benchmark</span>
                      <Badge variant="outline" className="text-green-600">Excellent</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      30% faster than industry average
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>How you compare to similar companies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Application Rate</span>
                      <span className="text-green-600 font-medium">+35% vs avg</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Offer Acceptance Rate</span>
                      <span className="text-green-600 font-medium">+22% vs avg</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Employee Retention</span>
                      <span className="text-green-600 font-medium">+18% vs avg</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};