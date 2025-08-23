import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { AIStatusIndicator } from "@/components/ui/AIStatusIndicator";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Clock,
  Users,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface TrendingJob {
  id: string;
  title: string;
  growthRate: number;
  demandLevel: 'high' | 'medium' | 'low';
  averageSalary: number;
  openings: number;
  skillsInDemand: string[];
  locations: string[];
  industryGrowth: number;
  timeToFill: number;
}

interface JobMarketTrend {
  period: string;
  totalJobs: number;
  newJobs: number;
  growthRate: number;
  avgSalary: number;
  topCategories: Array<{
    category: string;
    count: number;
    growth: number;
  }>;
}

interface SkillDemand {
  skill: string;
  demandGrowth: number;
  jobCount: number;
  avgSalary: number;
  trend: 'rising' | 'stable' | 'declining';
}

export const TrendingJobsAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch trending jobs data
  const { data: trendingJobs, isLoading } = useQuery({
    queryKey: ['trending-jobs', timeRange, selectedCategory],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          title: 'AI/ML Engineer',
          growthRate: 145.2,
          demandLevel: 'high' as const,
          averageSalary: 125000,
          openings: 15420,
          skillsInDemand: ['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Kubernetes'],
          locations: ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi'],
          industryGrowth: 89.3,
          timeToFill: 45
        },
        {
          id: '2',
          title: 'DevOps Engineer',
          growthRate: 78.6,
          demandLevel: 'high' as const,
          averageSalary: 95000,
          openings: 12350,
          skillsInDemand: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
          locations: ['Pune', 'Bangalore', 'Chennai', 'Hyderabad'],
          industryGrowth: 67.2,
          timeToFill: 38
        },
        {
          id: '3',
          title: 'Cybersecurity Analyst',
          growthRate: 92.4,
          demandLevel: 'high' as const,
          averageSalary: 88000,
          openings: 8920,
          skillsInDemand: ['CISSP', 'Ethical Hacking', 'Incident Response', 'SIEM'],
          locations: ['Mumbai', 'Delhi', 'Bangalore', 'Pune'],
          industryGrowth: 134.7,
          timeToFill: 52
        }
      ] as TrendingJob[];
    }
  });

  // Fetch market trends
  const { data: marketTrends } = useQuery({
    queryKey: ['market-trends', timeRange],
    queryFn: async () => {
      return {
        period: 'Last 30 days',
        totalJobs: 245680,
        newJobs: 18450,
        growthRate: 8.1,
        avgSalary: 78500,
        topCategories: [
          { category: 'Technology', count: 89420, growth: 12.3 },
          { category: 'Healthcare', count: 45780, growth: 9.7 },
          { category: 'Finance', count: 38960, growth: 6.8 },
          { category: 'Education', count: 29580, growth: 15.2 },
          { category: 'Manufacturing', count: 21940, growth: 4.1 }
        ]
      } as JobMarketTrend;
    }
  });

  // Fetch skills demand
  const { data: skillsDemand } = useQuery({
    queryKey: ['skills-demand'],
    queryFn: async () => {
      return [
        { skill: 'Artificial Intelligence', demandGrowth: 156.8, jobCount: 23450, avgSalary: 128000, trend: 'rising' as const },
        { skill: 'Cloud Computing', demandGrowth: 89.2, jobCount: 45780, avgSalary: 98000, trend: 'rising' as const },
        { skill: 'Data Science', demandGrowth: 76.3, jobCount: 34560, avgSalary: 105000, trend: 'rising' as const },
        { skill: 'Blockchain', demandGrowth: 234.1, jobCount: 8920, avgSalary: 115000, trend: 'rising' as const },
        { skill: 'React.js', demandGrowth: 45.6, jobCount: 56780, avgSalary: 85000, trend: 'stable' as const }
      ] as SkillDemand[];
    }
  });

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
          <AIStatusIndicator module="Analytics" feature="AI-Powered Market Intelligence">
            <h1 className="text-3xl font-bold text-foreground">Trending Jobs Analytics</h1>
          </AIStatusIndicator>
          <p className="text-muted-foreground mt-1">
            Real-time job market trends and demand forecasting
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="all">All Categories</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
          </select>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Openings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketTrends?.totalJobs?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{marketTrends?.growthRate}% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Jobs This Month</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketTrends?.newJobs?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Growing at 8.1% monthly rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(marketTrends?.avgSalary || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +6.2% YoY growth
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketTrends?.topCategories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Technology leading at +12.3%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">Trending Jobs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="skills">Skills Demand</TabsTrigger>
          <TabsTrigger value="forecasts">AI Forecasts</TabsTrigger>
        </TabsList>

        {/* Trending Jobs */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trendingJobs?.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getDemandColor(job.demandLevel)}>
                          {job.demandLevel.toUpperCase()} DEMAND
                        </Badge>
                        <Badge variant="outline" className="text-green-600">
                          +{job.growthRate}% growth
                        </Badge>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg. Salary</span>
                      <div className="font-semibold">₹{job.averageSalary.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Openings</span>
                      <div className="font-semibold">{job.openings.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Fill</span>
                      <div className="font-semibold">{job.timeToFill} days</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Industry Growth</span>
                      <div className="font-semibold text-green-600">+{job.industryGrowth}%</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Top Skills in Demand</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.skillsInDemand.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skillsInDemand.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skillsInDemand.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Top Locations</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{job.locations.slice(0, 2).join(', ')}</span>
                      {job.locations.length > 2 && (
                        <span className="text-sm text-muted-foreground">
                          +{job.locations.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Categories Performance</CardTitle>
              <CardDescription>
                Growth rates and job counts across different industries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends?.topCategories?.map((category, index) => (
                  <div key={category.category} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{category.category}</h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-muted-foreground">{category.count.toLocaleString()} jobs</span>
                          <Badge variant="outline" className="text-green-600">
                            +{category.growth}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={category.growth * 5} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Demand */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skillsDemand?.map((skill) => (
              <Card key={skill.skill} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{skill.skill}</CardTitle>
                    {getTrendIcon(skill.trend)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Demand Growth</span>
                      <div className="text-xl font-bold text-green-600">
                        +{skill.demandGrowth}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Job Openings</span>
                      <div className="text-xl font-bold">
                        {skill.jobCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Average Salary</span>
                    <div className="text-xl font-bold">₹{skill.avgSalary.toLocaleString()}</div>
                  </div>
                  
                  <Progress value={Math.min(skill.demandGrowth / 2, 100)} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Forecasts */}
        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Market Forecasts</CardTitle>
              <CardDescription>
                Predictive analytics for job market trends over the next 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Market Prediction</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">Bullish</p>
                  <p className="text-sm text-muted-foreground">
                    15-20% growth expected in Q2-Q3
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Talent Pool</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">Expanding</p>
                  <p className="text-sm text-muted-foreground">
                    12% increase in qualified candidates
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold">Hiring Speed</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">Accelerating</p>
                  <p className="text-sm text-muted-foreground">
                    8% reduction in time-to-hire predicted
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">AI Insights</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Remote work positions showing 45% higher growth rate</li>
                  <li>• AI/ML roles expected to double in the next 6 months</li>
                  <li>• Cybersecurity demand surge due to increased digital adoption</li>
                  <li>• Green technology jobs emerging as fastest-growing segment</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};