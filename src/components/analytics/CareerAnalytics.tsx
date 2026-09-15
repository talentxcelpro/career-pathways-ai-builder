import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Users, 
  Trophy,
  Zap,
  Brain,
  MapPin,
  Calendar,
  DollarSign,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CareerMetric {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target?: number;
  industry_average?: number;
}

interface CareerAnalyticsProps {
  userId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const CareerAnalytics: React.FC<CareerAnalyticsProps> = ({
  userId,
  timeRange = '30d'
}) => {
  const [metrics, setMetrics] = useState<CareerMetric[]>([
    {
      label: 'Career Readiness Score',
      value: 78,
      change: 12,
      changeType: 'increase',
      target: 85,
      industry_average: 65
    },
    {
      label: 'Market Competitiveness',
      value: 82,
      change: 8,
      changeType: 'increase',
      target: 90,
      industry_average: 70
    },
    {
      label: 'Profile Views',
      value: 156,
      change: 23,
      changeType: 'increase'
    },
    {
      label: 'Network Growth',
      value: 89,
      change: 15,
      changeType: 'increase'
    }
  ]);

  const skillGaps = [
    { skill: 'Machine Learning', current: 60, target: 85, industry: 75 },
    { skill: 'Data Analysis', current: 75, target: 90, industry: 70 },
    { skill: 'Project Management', current: 45, target: 80, industry: 65 },
    { skill: 'Communication', current: 80, target: 85, industry: 60 }
  ];

  const careerMilestones = [
    {
      title: 'Senior Developer Promotion',
      probability: 85,
      timeframe: '6 months',
      requirements: ['React Expert', 'Team Leadership', '2+ Years Experience']
    },
    {
      title: 'Tech Lead Position',
      probability: 65,
      timeframe: '12 months', 
      requirements: ['Architecture Design', 'Mentoring Skills', 'Strategic Thinking']
    },
    {
      title: 'Product Manager Transition',
      probability: 45,
      timeframe: '18 months',
      requirements: ['Product Strategy', 'Market Research', 'Stakeholder Management']
    }
  ];

  const industryBenchmarks = {
    avgSalary: 95000,
    topSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
    demandGrowth: 18,
    jobOpenings: 2847
  };

  const formatChange = (change: number, type: 'increase' | 'decrease' | 'neutral') => {
    const sign = type === 'increase' ? '+' : type === 'decrease' ? '-' : '';
    const color = type === 'increase' ? 'text-green-600' : type === 'decrease' ? 'text-red-600' : 'text-gray-600';
    const Icon = type === 'increase' ? TrendingUp : type === 'decrease' ? TrendingDown : Target;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{sign}{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </h3>
                  {formatChange(metric.change, metric.changeType)}
                </div>
                
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  
                  {metric.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress to Target</span>
                        <span>{metric.target}</span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {metric.industry_average && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Industry Avg:</span>
                      <span className={
                        metric.value > metric.industry_average 
                          ? 'text-green-600 font-medium' 
                          : 'text-orange-600 font-medium'
                      }>
                        {metric.industry_average}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="milestones">Career Path</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Skills Analysis */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skills Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillGaps.map((skill, index) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.skill}</span>
                      <Badge variant={skill.current >= skill.target ? 'default' : 'secondary'}>
                        {skill.current}/{skill.target}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <Progress value={(skill.current / skill.target) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {skill.current}%</span>
                        <span>Industry: {skill.industry}%</span>
                        <span>Target: {skill.target}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Milestones */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Career Progression Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerMilestones.map((milestone, index) => (
                  <div key={milestone.title} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {milestone.timeframe}
                          </div>
                          <Badge variant={milestone.probability >= 70 ? 'default' : 'secondary'}>
                            {milestone.probability}% likely
                          </Badge>
                        </div>
                      </div>
                      <Progress value={milestone.probability} className="w-20 h-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {milestone.requirements.map((req, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Insights */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Salary Benchmarking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${industryBenchmarks.avgSalary.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Industry Salary
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">25th Percentile</span>
                      <span className="font-medium">${(industryBenchmarks.avgSalary * 0.8).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">75th Percentile</span>
                      <span className="font-medium">${(industryBenchmarks.avgSalary * 1.3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">90th Percentile</span>
                      <span className="font-medium">${(industryBenchmarks.avgSalary * 1.6).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      +{industryBenchmarks.demandGrowth}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year-over-Year Growth
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-semibold">
                      {industryBenchmarks.jobOpenings.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Job Openings
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top In-Demand Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {industryBenchmarks.topSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Career Intelligence Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-lg font-semibold">Elite Tier</div>
                  <div className="text-sm text-muted-foreground">Top 15% in your field</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-semibold">High Velocity</div>
                  <div className="text-sm text-muted-foreground">Rapid skill development</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-lg font-semibold">Rising Star</div>
                  <div className="text-sm text-muted-foreground">Above average growth</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};