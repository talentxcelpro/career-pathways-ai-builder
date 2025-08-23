import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { AIStatusIndicator } from "@/components/ui/AIStatusIndicator";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Users,
  Award,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Briefcase,
  GraduationCap
} from "lucide-react";

interface SalaryData {
  role: string;
  minSalary: number;
  maxSalary: number;
  medianSalary: number;
  averageSalary: number;
  experienceLevel: string;
  location: string;
  growthRate: number;
  demandLevel: 'high' | 'medium' | 'low';
  marketPercentile: number;
  sampleSize: number;
}

interface LocationSalary {
  city: string;
  averageSalary: number;
  costOfLiving: number;
  adjustedSalary: number;
  jobCount: number;
  growthRate: number;
  topCompanies: string[];
}

interface IndustryComparison {
  industry: string;
  averageSalary: number;
  medianSalary: number;
  growthRate: number;
  bonusPercentage: number;
  benefitsScore: number;
  jobSecurity: number;
}

interface SkillPremium {
  skill: string;
  premiumPercentage: number;
  avgSalaryWithSkill: number;
  avgSalaryWithoutSkill: number;
  demandLevel: string;
  certificationRequired: boolean;
}

export const SalaryInsights: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [location, setLocation] = useState('all');

  // Fetch salary data
  const { data: salaryData, isLoading } = useQuery({
    queryKey: ['salary-insights', selectedRole, experienceLevel, location],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          role: 'Software Engineer',
          minSalary: 450000,
          maxSalary: 2500000,
          medianSalary: 850000,
          averageSalary: 1050000,
          experienceLevel: 'Mid-Level (3-6 years)',
          location: 'Bangalore',
          growthRate: 12.5,
          demandLevel: 'high' as const,
          marketPercentile: 75,
          sampleSize: 15420
        },
        {
          role: 'Data Scientist',
          minSalary: 600000,
          maxSalary: 3500000,
          medianSalary: 1200000,
          averageSalary: 1450000,
          experienceLevel: 'Senior (6+ years)',
          location: 'Mumbai',
          growthRate: 18.7,
          demandLevel: 'high' as const,
          marketPercentile: 82,
          sampleSize: 8930
        }
      ] as SalaryData[];
    }
  });

  // Fetch location comparison
  const { data: locationData } = useQuery({
    queryKey: ['location-salary', selectedRole],
    queryFn: async () => {
      return [
        {
          city: 'Bangalore',
          averageSalary: 1250000,
          costOfLiving: 85,
          adjustedSalary: 1470000,
          jobCount: 45890,
          growthRate: 15.2,
          topCompanies: ['Infosys', 'Wipro', 'TCS', 'Accenture']
        },
        {
          city: 'Mumbai',
          averageSalary: 1450000,
          costOfLiving: 120,
          adjustedSalary: 1208000,
          jobCount: 38760,
          growthRate: 11.8,
          topCompanies: ['TCS', 'Reliance', 'HDFC', 'Bajaj']
        },
        {
          city: 'Delhi',
          averageSalary: 1380000,
          costOfLiving: 110,
          adjustedSalary: 1254000,
          jobCount: 42150,
          growthRate: 13.4,
          topCompanies: ['HCL', 'IBM', 'Dell', 'Adobe']
        },
        {
          city: 'Hyderabad',
          averageSalary: 1180000,
          costOfLiving: 75,
          adjustedSalary: 1573000,
          jobCount: 29450,
          growthRate: 19.6,
          topCompanies: ['Microsoft', 'Google', 'Amazon', 'Apple']
        }
      ] as LocationSalary[];
    }
  });

  // Fetch industry comparison
  const { data: industryData } = useQuery({
    queryKey: ['industry-salary'],
    queryFn: async () => {
      return [
        {
          industry: 'Technology',
          averageSalary: 1350000,
          medianSalary: 1150000,
          growthRate: 16.8,
          bonusPercentage: 25,
          benefitsScore: 85,
          jobSecurity: 78
        },
        {
          industry: 'Financial Services',
          averageSalary: 1580000,
          medianSalary: 1280000,
          growthRate: 9.2,
          bonusPercentage: 35,
          benefitsScore: 92,
          jobSecurity: 88
        },
        {
          industry: 'Healthcare',
          averageSalary: 980000,
          medianSalary: 850000,
          growthRate: 12.4,
          bonusPercentage: 15,
          benefitsScore: 78,
          jobSecurity: 95
        },
        {
          industry: 'Consulting',
          averageSalary: 1420000,
          medianSalary: 1200000,
          growthRate: 8.7,
          bonusPercentage: 28,
          benefitsScore: 82,
          jobSecurity: 72
        }
      ] as IndustryComparison[];
    }
  });

  // Fetch skill premiums
  const { data: skillPremiums } = useQuery({
    queryKey: ['skill-premiums'],
    queryFn: async () => {
      return [
        {
          skill: 'Machine Learning',
          premiumPercentage: 45.2,
          avgSalaryWithSkill: 1650000,
          avgSalaryWithoutSkill: 1135000,
          demandLevel: 'Very High',
          certificationRequired: true
        },
        {
          skill: 'Cloud Architecture (AWS)',
          premiumPercentage: 38.7,
          avgSalaryWithSkill: 1580000,
          avgSalaryWithoutSkill: 1140000,
          demandLevel: 'High',
          certificationRequired: true
        },
        {
          skill: 'DevOps',
          premiumPercentage: 32.1,
          avgSalaryWithSkill: 1420000,
          avgSalaryWithoutSkill: 1075000,
          demandLevel: 'High',
          certificationRequired: false
        },
        {
          skill: 'Cybersecurity',
          premiumPercentage: 41.8,
          avgSalaryWithSkill: 1650000,
          avgSalaryWithoutSkill: 1165000,
          demandLevel: 'Very High',
          certificationRequired: true
        }
      ] as SkillPremium[];
    }
  });

  const formatSalary = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  if (isLoading) {
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

  const currentSalary = salaryData?.[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <AIStatusIndicator module="Analytics" feature="Real-time Salary Intelligence">
            <h1 className="text-3xl font-bold text-foreground">Comprehensive Salary Insights</h1>
          </AIStatusIndicator>
          <p className="text-muted-foreground mt-1">
            AI-powered salary analytics with real-time market data
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Product Manager">Product Manager</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
          
          <select 
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="all">All Experience</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-6 years)</option>
            <option value="senior">Senior (6+ years)</option>
          </select>
          
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm bg-background"
          >
            <option value="all">All Locations</option>
            <option value="bangalore">Bangalore</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
        </div>
      </div>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSalary(currentSalary?.averageSalary || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{currentSalary?.growthRate}% YoY growth
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Range</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatSalary(currentSalary?.minSalary || 0)} - {formatSalary(currentSalary?.maxSalary || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Median: {formatSalary(currentSalary?.medianSalary || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Percentile</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSalary?.marketPercentile}th</div>
            <p className="text-xs text-muted-foreground">
              Better than {currentSalary?.marketPercentile}% of roles
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sample Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSalary?.sampleSize?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Data points analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="locations">Location Analysis</TabsTrigger>
          <TabsTrigger value="industries">Industry Comparison</TabsTrigger>
          <TabsTrigger value="skills">Skill Premiums</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        {/* Location Analysis */}
        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salary by Location</CardTitle>
              <CardDescription>
                Compare salaries across major Indian cities with cost of living adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {locationData?.map((location) => (
                  <div key={location.city} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {location.city}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {location.jobCount.toLocaleString()} active jobs
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        +{location.growthRate}% growth
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Salary</span>
                        <span className="font-bold">{formatSalary(location.averageSalary)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cost of Living Index</span>
                        <span className="font-medium">{location.costOfLiving}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Adjusted Salary</span>
                        <span className="font-bold text-green-600">{formatSalary(location.adjustedSalary)}</span>
                      </div>
                      
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground">Top Companies</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {location.topCompanies.slice(0, 3).map((company) => (
                            <Badge key={company} variant="secondary" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry Comparison */}
        <TabsContent value="industries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Salary Comparison</CardTitle>
              <CardDescription>
                Comprehensive comparison across different industries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industryData?.map((industry, index) => (
                  <div key={industry.industry} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{industry.industry}</h3>
                          <p className="text-sm text-muted-foreground">
                            +{industry.growthRate}% growth rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatSalary(industry.averageSalary)}</div>
                        <div className="text-sm text-muted-foreground">
                          Median: {formatSalary(industry.medianSalary)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Avg. Bonus</span>
                        <div className="font-semibold">{industry.bonusPercentage}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Benefits Score</span>
                        <div className="font-semibold">{industry.benefitsScore}/100</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Job Security</span>
                        <div className="font-semibold">{industry.jobSecurity}/100</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Premiums */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>High-Value Skills Premium</CardTitle>
              <CardDescription>
                Additional salary potential from in-demand skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {skillPremiums?.map((skill) => (
                  <div key={skill.skill} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center">
                          <Award className="h-4 w-4 mr-2 text-yellow-600" />
                          {skill.skill}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-green-600">
                            +{skill.premiumPercentage}% premium
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {skill.demandLevel}
                          </Badge>
                          {skill.certificationRequired && (
                            <Badge variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              Cert Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">With Skill</span>
                        <span className="font-bold text-green-600">
                          {formatSalary(skill.avgSalaryWithSkill)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Without Skill</span>
                        <span className="font-medium">
                          {formatSalary(skill.avgSalaryWithoutSkill)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Premium Value</span>
                        <span className="font-bold text-primary">
                          +{formatSalary(skill.avgSalaryWithSkill - skill.avgSalaryWithoutSkill)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Salary Growth Trends</CardTitle>
                <CardDescription>Historical and projected salary growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2024 Growth</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-24 h-2" />
                      <span className="font-bold text-green-600">+12.5%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2023 Growth</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-24 h-2" />
                      <span className="font-medium">+8.2%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2022 Growth</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-24 h-2" />
                      <span className="font-medium">+5.8%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">2025 Predictions</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-powered forecast suggests 15-18% growth for tech roles,
                    driven by increased demand for AI/ML and cloud expertise.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Intelligence</CardTitle>
                <CardDescription>Real-time market insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-900">Market Opportunity</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Strong demand for {selectedRole} roles. Consider negotiating 
                    for 15-20% above current market rate.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Skill Recommendation</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Adding Machine Learning skills could increase your salary 
                    potential by up to {formatSalary(515000)}.
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">Best Time to Switch</span>
                  </div>
                  <p className="text-sm text-yellow-800">
                    Q1 and Q3 show highest salary increments. Consider timing 
                    your job search accordingly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};