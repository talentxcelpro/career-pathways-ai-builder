import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Target,
  Briefcase,
  Eye,
  Send,
  Calendar,
  DollarSign,
  MapPin,
  Building
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface MarketTrend {
  month: string;
  demand: number;
  avgSalary: number;
  openings: number;
}

interface SkillDemand {
  skill: string;
  demand: number;
  growth: number;
  avgSalary: number;
}

interface SalaryData {
  experience: string;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

interface LocationData {
  city: string;
  jobs: number;
  avgSalary: number;
  growth: number;
}

interface CompanyGrowth {
  company: string;
  hiring: number;
  trend: 'up' | 'down' | 'stable';
  industry: string;
}

export const CareerAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [activeTab, setActiveTab] = useState<'trends' | 'skills' | 'salary' | 'locations' | 'companies'>('trends');

  const { data: marketTrends = [] } = useQuery({
    queryKey: ['market-trends', timeRange],
    queryFn: async (): Promise<MarketTrend[]> => {
      return [
        { month: 'Jan', demand: 120, avgSalary: 850000, openings: 1200 },
        { month: 'Feb', demand: 135, avgSalary: 875000, openings: 1350 },
        { month: 'Mar', demand: 148, avgSalary: 890000, openings: 1480 },
        { month: 'Apr', demand: 162, avgSalary: 920000, openings: 1620 },
        { month: 'May', demand: 178, avgSalary: 945000, openings: 1780 },
        { month: 'Jun', demand: 195, avgSalary: 980000, openings: 1950 }
      ];
    }
  });

  const { data: skillDemands = [] } = useQuery({
    queryKey: ['skill-demands'],
    queryFn: async (): Promise<SkillDemand[]> => {
      return [
        { skill: 'React', demand: 95, growth: 25, avgSalary: 1200000 },
        { skill: 'Python', demand: 88, growth: 18, avgSalary: 1100000 },
        { skill: 'TypeScript', demand: 82, growth: 35, avgSalary: 1250000 },
        { skill: 'Node.js', demand: 78, growth: 22, avgSalary: 1150000 },
        { skill: 'AWS', demand: 85, growth: 28, avgSalary: 1300000 },
        { skill: 'Docker', demand: 72, growth: 30, avgSalary: 1180000 },
        { skill: 'Kubernetes', demand: 68, growth: 45, avgSalary: 1400000 },
        { skill: 'GraphQL', demand: 65, growth: 40, avgSalary: 1220000 }
      ];
    }
  });

  const { data: salaryData = [] } = useQuery({
    queryKey: ['salary-data'],
    queryFn: async (): Promise<SalaryData[]> => {
      return [
        { experience: '0-1 years', p25: 400000, p50: 600000, p75: 800000, p90: 1000000 },
        { experience: '2-4 years', p25: 800000, p50: 1200000, p75: 1600000, p90: 2000000 },
        { experience: '5-8 years', p25: 1500000, p50: 2000000, p75: 2500000, p90: 3000000 },
        { experience: '9+ years', p25: 2500000, p50: 3500000, p75: 4500000, p90: 6000000 }
      ];
    }
  });

  const { data: locationData = [] } = useQuery({
    queryKey: ['location-data'],
    queryFn: async (): Promise<LocationData[]> => {
      return [
        { city: 'Bangalore', jobs: 2850, avgSalary: 1400000, growth: 15 },
        { city: 'Mumbai', jobs: 2200, avgSalary: 1350000, growth: 12 },
        { city: 'Delhi NCR', jobs: 1950, avgSalary: 1320000, growth: 18 },
        { city: 'Hyderabad', jobs: 1650, avgSalary: 1250000, growth: 22 },
        { city: 'Pune', jobs: 1420, avgSalary: 1200000, growth: 25 },
        { city: 'Chennai', jobs: 1280, avgSalary: 1180000, growth: 8 }
      ];
    }
  });

  const { data: companyGrowth = [] } = useQuery({
    queryKey: ['company-growth'],
    queryFn: async (): Promise<CompanyGrowth[]> => {
      return [
        { company: 'TechCorp', hiring: 245, trend: 'up' as const, industry: 'Technology' },
        { company: 'InnovateX', hiring: 189, trend: 'up' as const, industry: 'Fintech' },
        { company: 'DataFlow', hiring: 156, trend: 'stable' as const, industry: 'Analytics' },
        { company: 'CloudTech', hiring: 134, trend: 'up' as const, industry: 'Cloud Services' },
        { company: 'StartupY', hiring: 98, trend: 'down' as const, industry: 'E-commerce' }
      ];
    }
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088'];

  const formatSalary = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const getTrendIcon = (trend: string, growth?: number) => {
    if (trend === 'up' || (growth && growth > 0)) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' || (growth && growth < 0)) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Career Analytics & Market Intelligence
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {['trends', 'skills', 'salary', 'locations', 'companies'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">1,950</div>
                <div className="text-sm text-gray-600">Active Job Openings</div>
                <div className="text-xs text-green-600">+15% this month</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{formatSalary(980000)}</div>
                <div className="text-sm text-gray-600">Avg Salary</div>
                <div className="text-xs text-green-600">+8% this month</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Target className="h-6 w-6 text-purple-600" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">78%</div>
                <div className="text-sm text-gray-600">Application Success Rate</div>
                <div className="text-xs text-green-600">+5% this month</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Eye className="h-6 w-6 text-orange-600" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">195</div>
                <div className="text-sm text-gray-600">Market Demand Index</div>
                <div className="text-xs text-green-600">+12% this month</div>
              </div>
            </div>

            {/* Market Trends Chart */}
            <div className="h-80 w-full">
              <h3 className="font-semibold mb-4">Job Market Trends</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgSalary' ? formatSalary(value as number) : value,
                      name === 'demand' ? 'Demand Index' : name === 'avgSalary' ? 'Avg Salary' : 'Job Openings'
                    ]}
                  />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="demand" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="openings" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <h3 className="font-semibold">In-Demand Skills Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <h4 className="font-medium mb-4">Skill Demand vs Growth</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillDemands}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#8884d8" />
                    <Bar dataKey="growth" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Top Skills by Salary Premium</h4>
                {skillDemands
                  .sort((a, b) => b.avgSalary - a.avgSalary)
                  .slice(0, 6)
                  .map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-gray-600">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{skill.skill}</div>
                          <div className="text-sm text-gray-600">
                            {skill.demand}% demand • {skill.growth}% growth
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatSalary(skill.avgSalary)}</div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon('up', skill.growth)}
                          <span className="text-sm text-green-600">+{skill.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-6">
            <h3 className="font-semibold">Salary Benchmarks by Experience</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="experience" />
                  <YAxis tickFormatter={formatSalary} />
                  <Tooltip formatter={(value) => formatSalary(value as number)} />
                  <Bar dataKey="p25" fill="#e3f2fd" />
                  <Bar dataKey="p50" fill="#90caf9" />
                  <Bar dataKey="p75" fill="#42a5f5" />
                  <Bar dataKey="p90" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Salary Negotiation Tips</h4>
                <ul className="text-sm space-y-2">
                  <li>• Research market rates for your specific skills</li>
                  <li>• Consider total compensation, not just base salary</li>
                  <li>• Highlight your unique value proposition</li>
                  <li>• Be prepared with specific examples of achievements</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Salary Growth Factors</h4>
                <ul className="text-sm space-y-2">
                  <li>• Learn high-demand skills like AI/ML</li>
                  <li>• Take on leadership responsibilities</li>
                  <li>• Contribute to open source projects</li>
                  <li>• Build a strong professional network</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-6">
            <h3 className="font-semibold">Job Market by Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <h4 className="font-medium mb-4">Jobs vs Average Salary by City</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={formatSalary} />
                    <Tooltip formatter={(value, name) => [
                      name === 'avgSalary' ? formatSalary(value as number) : value,
                      name === 'jobs' ? 'Job Openings' : 'Average Salary'
                    ]} />
                    <Bar yAxisId="left" dataKey="jobs" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="avgSalary" stroke="#82ca9d" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Top Growing Cities</h4>
                {locationData
                  .sort((a, b) => b.growth - a.growth)
                  .map((location, index) => (
                    <div key={location.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{location.city}</div>
                          <div className="text-sm text-gray-600">
                            {location.jobs} jobs available
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatSalary(location.avgSalary)}</div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon('up', location.growth)}
                          <span className="text-sm text-green-600">+{location.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-6">
            <h3 className="font-semibold">Company Hiring Trends</h3>
            <div className="space-y-4">
              {companyGrowth.map((company, index) => (
                <div key={company.company} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{company.company}</div>
                      <div className="text-sm text-gray-600">{company.industry}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{company.hiring} open positions</div>
                      <div className="text-sm text-gray-600">Currently hiring</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(company.trend)}
                      <Badge 
                        className={
                          company.trend === 'up' ? 'bg-green-100 text-green-800' :
                          company.trend === 'down' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {company.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
              <p className="text-sm text-blue-700">
                Companies with "up" trends are actively expanding their teams. 
                These are great targets for applications as they have higher chances of quick hiring decisions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};