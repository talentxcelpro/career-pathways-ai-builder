import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Briefcase, 
  ArrowUpRight,
  Search,
  Brain,
  Target,
  Zap,
  Star,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SkillTrend {
  skill: string;
  demand: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
  marketData: {
    averageSalary: number;
    jobOpenings: number;
    growthPrediction: number;
  };
}

interface SkillDemandTrendsProps {
  trends: SkillTrend[];
}

export const SkillDemandTrends = ({ trends }: SkillDemandTrendsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Generate historical data for trending skills
  const generateHistoricalData = (skill: string, currentDemand: number, growth: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      demand: Math.max(0, currentDemand - ((11 - index) * growth / 12) + Math.random() * 5 - 2.5),
      jobOpenings: Math.floor(Math.random() * 1000) + 500,
      salary: Math.floor(Math.random() * 20000) + 80000
    }));
  };

  const filteredTrends = trends.filter(trend => 
    trend.skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topGrowingSkills = [...trends]
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5);

  const highestDemandSkills = [...trends]
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 5);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skill Intelligence Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Real-time market trends, demand forecasts, and salary insights for in-demand skills
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                My Skills
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trending Skills</p>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-green-600">+23% growth this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Job Openings</p>
                <p className="text-2xl font-bold">42.6K</p>
                <p className="text-xs text-green-600">+18% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Salary Growth</p>
                <p className="text-2xl font-bold">12.5%</p>
                <p className="text-xs text-green-600">Above market average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="demand">Demand Analysis</TabsTrigger>
          <TabsTrigger value="salary">Salary Trends</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        {/* Market Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Growing Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Fastest Growing Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topGrowingSkills.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{skill.skill}</p>
                          <p className="text-sm text-muted-foreground">
                            {skill.marketData.jobOpenings.toLocaleString()} jobs
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">+{skill.growth}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${(skill.marketData.averageSalary / 1000).toFixed(0)}K avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Highest Demand Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-500" />
                  Highest Demand Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highestDemandSkills.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{skill.skill}</p>
                          <p className="text-sm text-muted-foreground">
                            {skill.demand}% market demand
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(skill.trend)}
                          <span className={`font-medium ${
                            skill.trend === 'up' ? 'text-green-600' : 
                            skill.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {skill.growth > 0 ? '+' : ''}{skill.growth}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${(skill.marketData.averageSalary / 1000).toFixed(0)}K avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrends.map((skill) => (
                  <Card key={skill.skill} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-sm">{skill.skill}</h3>
                        <Badge variant="secondary" className={getTrendColor(skill.trend)}>
                          {getTrendIcon(skill.trend)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Demand</span>
                          <span className="font-medium">{skill.demand}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${skill.demand}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Growth</span>
                          <span className={`font-medium ${
                            skill.growth > 0 ? 'text-green-600' : 
                            skill.growth < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {skill.growth > 0 ? '+' : ''}{skill.growth}%
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{skill.marketData.jobOpenings.toLocaleString()} jobs</span>
                            <span>${(skill.marketData.averageSalary / 1000).toFixed(0)}K avg</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demand Analysis */}
        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Demand Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateHistoricalData('AI/ML', 95, 23)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Trends */}
        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary Trends by Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`$${(value / 1000).toFixed(0)}K`, 'Average Salary']}
                    />
                    <Bar dataKey="marketData.averageSalary" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Skill Recommendations
              </CardTitle>
              <p className="text-muted-foreground">
                Based on market trends and your profile, here are skills to focus on:
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">Priority: Focus on AI/ML</h4>
                      <p className="text-sm text-green-700 mt-1">
                        AI/ML skills are growing 23% this year with average salaries of $125K. 
                        High demand in your industry with 15,420+ job openings.
                      </p>
                      <Button size="sm" className="mt-3">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">Secondary: Data Science Skills</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Strong complement to your existing skills. 92% market demand with 
                        18% growth and $115K average salary.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Explore Courses
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};