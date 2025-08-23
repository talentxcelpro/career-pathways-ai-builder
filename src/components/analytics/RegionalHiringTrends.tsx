import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { AIStatusIndicator } from "@/components/ui/AIStatusIndicator";
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Globe,
  ArrowRight
} from "lucide-react";

interface RegionalData {
  region: string;
  state: string;
  jobGrowth: number;
  totalJobs: number;
  newJobs: number;
  averageSalary: number;
  unemploymentRate: number;
  skillDemand: string[];
  topIndustries: Array<{
    name: string;
    jobs: number;
    growth: number;
  }>;
  topCompanies: string[];
  emergingRoles: string[];
  remoteJobsPercentage: number;
}

interface HiringPattern {
  region: string;
  seasonalTrends: Array<{
    month: string;
    hiringIndex: number;
    popularRoles: string[];
  }>;
  peakHiringMonths: string[];
  averageTimeToHire: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

interface MigrationData {
  from: string;
  to: string;
  volume: number;
  averageSalaryIncrease: number;
  topReasons: string[];
  popularRoles: string[];
}

interface InfrastructureScore {
  region: string;
  overallScore: number;
  connectivity: number;
  coworkingSpaces: number;
  educationalInstitutions: number;
  techParks: number;
  transportScore: number;
  livingCost: number;
}

export const RegionalHiringTrends: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('South India');
  const [timeRange, setTimeRange] = useState('12m');

  // Fetch regional hiring data
  const { data: regionalData, isLoading } = useQuery({
    queryKey: ['regional-trends', selectedRegion, timeRange],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          region: 'Bangalore',
          state: 'Karnataka',
          jobGrowth: 18.5,
          totalJobs: 245680,
          newJobs: 38420,
          averageSalary: 1250000,
          unemploymentRate: 2.8,
          skillDemand: ['React.js', 'Python', 'AWS', 'Machine Learning', 'DevOps'],
          topIndustries: [
            { name: 'Software Development', jobs: 89420, growth: 22.1 },
            { name: 'Product Management', jobs: 34560, growth: 15.8 },
            { name: 'Data Science', jobs: 28940, growth: 34.5 }
          ],
          topCompanies: ['Infosys', 'Wipro', 'TCS', 'Accenture', 'IBM'],
          emergingRoles: ['AI Engineer', 'Cloud Architect', 'Product Designer'],
          remoteJobsPercentage: 42
        },
        {
          region: 'Mumbai',
          state: 'Maharashtra',
          jobGrowth: 12.3,
          totalJobs: 198750,
          newJobs: 24480,
          averageSalary: 1450000,
          unemploymentRate: 3.2,
          skillDemand: ['Finance', 'React.js', 'Java', 'Data Analysis', 'SAP'],
          topIndustries: [
            { name: 'Financial Services', jobs: 67890, growth: 14.2 },
            { name: 'Software Development', jobs: 45670, growth: 16.8 },
            { name: 'Media & Entertainment', jobs: 28540, growth: 8.9 }
          ],
          topCompanies: ['TCS', 'Reliance', 'HDFC Bank', 'Bajaj Finance', 'L&T'],
          emergingRoles: ['FinTech Developer', 'Risk Analyst', 'Digital Marketing'],
          remoteJobsPercentage: 35
        }
      ] as RegionalData[];
    }
  });

  // Fetch hiring patterns
  const { data: hiringPatterns } = useQuery({
    queryKey: ['hiring-patterns', selectedRegion],
    queryFn: async () => {
      return [
        {
          region: 'Bangalore',
          seasonalTrends: [
            { month: 'Jan', hiringIndex: 85, popularRoles: ['Software Engineer', 'Data Scientist'] },
            { month: 'Feb', hiringIndex: 92, popularRoles: ['Product Manager', 'DevOps Engineer'] },
            { month: 'Mar', hiringIndex: 78, popularRoles: ['UI/UX Designer', 'Frontend Developer'] }
          ],
          peakHiringMonths: ['February', 'July', 'October'],
          averageTimeToHire: 28,
          competitionLevel: 'high' as const
        }
      ] as HiringPattern[];
    }
  });

  // Fetch migration data
  const { data: migrationData } = useQuery({
    queryKey: ['talent-migration'],
    queryFn: async () => {
      return [
        {
          from: 'Delhi',
          to: 'Bangalore',
          volume: 12450,
          averageSalaryIncrease: 25.5,
          topReasons: ['Better Tech Opportunities', 'Startup Ecosystem', 'Climate'],
          popularRoles: ['Software Engineer', 'Product Manager', 'Data Scientist']
        },
        {
          from: 'Mumbai',
          to: 'Pune',
          volume: 8920,
          averageSalaryIncrease: 15.2,
          topReasons: ['Lower Cost of Living', 'Better Work-Life Balance', 'Proximity to Mumbai'],
          popularRoles: ['Software Developer', 'Business Analyst', 'Project Manager']
        }
      ] as MigrationData[];
    }
  });

  // Fetch infrastructure scores
  const { data: infrastructureData } = useQuery({
    queryKey: ['infrastructure-scores'],
    queryFn: async () => {
      return [
        {
          region: 'Bangalore',
          overallScore: 92,
          connectivity: 95,
          coworkingSpaces: 88,
          educationalInstitutions: 96,
          techParks: 94,
          transportScore: 75,
          livingCost: 68
        },
        {
          region: 'Hyderabad',
          overallScore: 89,
          connectivity: 92,
          coworkingSpaces: 85,
          educationalInstitutions: 91,
          techParks: 89,
          transportScore: 82,
          livingCost: 78
        }
      ] as InfrastructureScore[];
    }
  });

  const getTrendIcon = (growth: number) => {
    if (growth > 10) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth > 0) return <Activity className="h-4 w-4 text-blue-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 15) return 'text-green-600';
    if (growth > 5) return 'text-blue-600';
    return 'text-orange-600';
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
          <AIStatusIndicator module="Analytics" feature="Geographic Intelligence">
            <h1 className="text-3xl font-bold text-foreground">Regional Hiring Trends</h1>
          </AIStatusIndicator>
          <p className="text-muted-foreground mt-1">
            Geographic hiring patterns and talent migration insights
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="South India">South India</option>
            <option value="North India">North India</option>
            <option value="West India">West India</option>
            <option value="East India">East India</option>
          </select>
          
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="2y">Last 2 years</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Globe className="h-4 w-4 mr-2" />
            View Map
          </Button>
        </div>
      </div>

      {/* Regional Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regionalData?.map((region) => (
          <Card key={region.region} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {region.region}
                  </CardTitle>
                  <CardDescription>{region.state}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(region.jobGrowth)}
                  <Badge variant="outline" className={getGrowthColor(region.jobGrowth)}>
                    +{region.jobGrowth}% growth
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Jobs</span>
                  <div className="font-bold text-lg">{region.totalJobs.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">New Jobs</span>
                  <div className="font-bold text-lg text-green-600">+{region.newJobs.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg. Salary</span>
                  <div className="font-bold text-lg">₹{(region.averageSalary / 100000).toFixed(1)}L</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Unemployment</span>
                  <div className="font-bold text-lg">{region.unemploymentRate}%</div>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Top Industries</span>
                <div className="space-y-2 mt-2">
                  {region.topIndustries.map((industry) => (
                    <div key={industry.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{industry.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {industry.jobs.toLocaleString()}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          +{industry.growth}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">In-Demand Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {region.skillDemand.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {region.skillDemand.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{region.skillDemand.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Remote Jobs</span>
                <div className="flex items-center space-x-2">
                  <Progress value={region.remoteJobsPercentage} className="w-16 h-2" />
                  <span className="font-bold text-sm">{region.remoteJobsPercentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="migration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="migration">Talent Migration</TabsTrigger>
          <TabsTrigger value="patterns">Hiring Patterns</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="forecasts">Regional Forecasts</TabsTrigger>
        </TabsList>

        {/* Talent Migration */}
        <TabsContent value="migration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inter-City Talent Migration</CardTitle>
              <CardDescription>
                Major talent movement patterns across Indian cities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrationData?.map((migration) => (
                  <div key={`${migration.from}-${migration.to}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{migration.from}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-primary">{migration.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{migration.volume.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">professionals moved</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Avg. Salary Increase</span>
                        <div className="font-bold text-green-600">+{migration.averageSalaryIncrease}%</div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">Popular Roles</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {migration.popularRoles.slice(0, 2).map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">Top Reasons</span>
                        <div className="text-sm">
                          {migration.topReasons[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hiring Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Hiring Trends</CardTitle>
                <CardDescription>Month-wise hiring activity patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {hiringPatterns?.[0]?.seasonalTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between py-2">
                    <span className="font-medium">{trend.month}</span>
                    <div className="flex items-center space-x-3">
                      <Progress value={trend.hiringIndex} className="w-24 h-2" />
                      <span className="text-sm font-bold">{trend.hiringIndex}</span>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Peak Hiring Months</h4>
                  <div className="flex flex-wrap gap-1">
                    {hiringPatterns?.[0]?.peakHiringMonths.map((month) => (
                      <Badge key={month} className="bg-green-100 text-green-800">
                        {month}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Efficiency Metrics</CardTitle>
                <CardDescription>Regional hiring performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Time to Hire</span>
                    <span className="font-bold">{hiringPatterns?.[0]?.averageTimeToHire} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Competition Level</span>
                    <Badge className={
                      hiringPatterns?.[0]?.competitionLevel === 'high' ? 'bg-red-100 text-red-800' :
                      hiringPatterns?.[0]?.competitionLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {hiringPatterns?.[0]?.competitionLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Hiring Insights</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Q1 shows 23% higher hiring activity</li>
                    <li>• Tech roles fill 40% faster than average</li>
                    <li>• Remote positions have 60% more applications</li>
                    <li>• Senior roles take 45% longer to fill</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Infrastructure */}
        <TabsContent value="infrastructure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {infrastructureData?.map((infra) => (
              <Card key={infra.region} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{infra.region}</span>
                    <Badge variant="outline" className="text-primary">
                      {infra.overallScore}/100 Score
                    </Badge>
                  </CardTitle>
                  <CardDescription>Infrastructure & Business Environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Connectivity</span>
                        <span className="font-medium">{infra.connectivity}/100</span>
                      </div>
                      <Progress value={infra.connectivity} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tech Parks</span>
                        <span className="font-medium">{infra.techParks}/100</span>
                      </div>
                      <Progress value={infra.techParks} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Educational Institutions</span>
                        <span className="font-medium">{infra.educationalInstitutions}/100</span>
                      </div>
                      <Progress value={infra.educationalInstitutions} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Coworking Spaces</span>
                        <span className="font-medium">{infra.coworkingSpaces}/100</span>
                      </div>
                      <Progress value={infra.coworkingSpaces} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Transport Score</span>
                        <span className="font-medium">{infra.transportScore}/100</span>
                      </div>
                      <Progress value={infra.transportScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Living Cost (Lower is Better)</span>
                        <span className="font-medium">{infra.livingCost}/100</span>
                      </div>
                      <Progress value={100 - infra.livingCost} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Regional Forecasts */}
        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Regional Forecasts</CardTitle>
              <CardDescription>
                Predictive analytics for regional job market evolution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">Fastest Growing Region</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">Pune</p>
                  <p className="text-sm text-muted-foreground">
                    Expected 35% growth in tech jobs
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Emerging Hub</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">Kochi</p>
                  <p className="text-sm text-muted-foreground">
                    Rising as fintech & startup hub
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Talent Magnet</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">Bangalore</p>
                  <p className="text-sm text-muted-foreground">
                    Continues to attract top talent
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Regional Predictions for 2025</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Tier-2 cities expected to see 40% increase in tech job postings</li>
                  <li>• Remote work adoption will reduce geographic salary disparities by 15%</li>
                  <li>• Bangalore-Pune corridor emerging as India's Silicon Valley</li>
                  <li>• Government initiatives in northeast to create 50,000 new tech jobs</li>
                  <li>• Chennai positioned to become India's hardware manufacturing hub</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};