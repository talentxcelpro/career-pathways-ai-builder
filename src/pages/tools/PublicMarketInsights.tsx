import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Briefcase,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PublicMarketInsights() {
  const [selectedSkill, setSelectedSkill] = useState('Software Engineer');

  const topSkills = [
    { name: 'Software Engineer', growth: '+15%', salary: '₹18 LPA', demand: 'High' },
    { name: 'Data Scientist', growth: '+22%', salary: '₹20 LPA', demand: 'Very High' },
    { name: 'Product Manager', growth: '+18%', salary: '₹25 LPA', demand: 'High' },
    { name: 'DevOps Engineer', growth: '+25%', salary: '₹22 LPA', demand: 'Very High' },
    { name: 'UX Designer', growth: '+12%', salary: '₹15 LPA', demand: 'Medium' },
    { name: 'Cloud Architect', growth: '+30%', salary: '₹28 LPA', demand: 'Very High' }
  ];

  const industryTrends = [
    { industry: 'Technology', growth: '+28%', jobs: '15.2K', trend: 'up' },
    { industry: 'Healthcare', growth: '+18%', jobs: '8.7K', trend: 'up' },
    { industry: 'Finance', growth: '+12%', jobs: '12.1K', trend: 'up' },
    { industry: 'Education', growth: '+8%', jobs: '5.3K', trend: 'up' },
    { industry: 'Retail', growth: '-5%', jobs: '7.8K', trend: 'down' },
    { industry: 'Manufacturing', growth: '+3%', jobs: '9.2K', trend: 'up' }
  ];

  const cityInsights = [
    { city: 'Bangalore', avgSalary: '₹22 LPA', growth: '+20%', jobs: '8.5K' },
    { city: 'Mumbai', avgSalary: '₹24 LPA', growth: '+15%', jobs: '6.2K' },
    { city: 'Delhi', avgSalary: '₹21 LPA', growth: '+18%', jobs: '5.8K' },
    { city: 'Pune', avgSalary: '₹19 LPA', growth: '+25%', jobs: '4.1K' },
    { city: 'Hyderabad', avgSalary: '₹20 LPA', growth: '+22%', jobs: '3.9K' },
    { city: 'Chennai', avgSalary: '₹18 LPA', growth: '+16%', jobs: '3.2K' }
  ];

  const salaryBands = [
    { range: '₹5-10 LPA', percentage: 35, jobs: '5.2K' },
    { range: '₹10-15 LPA', percentage: 28, jobs: '4.1K' },
    { range: '₹15-25 LPA', percentage: 22, jobs: '3.3K' },
    { range: '₹25-40 LPA', percentage: 12, jobs: '1.8K' },
    { range: '₹40+ LPA', percentage: 3, jobs: '450' }
  ];

  return (
    <>
      <Helmet>
        <title>Career Market Insights | Salary Data & Job Trends - TalentXcel</title>
        <meta name="description" content="Get real-time career market insights, salary data, and job trends. Make informed career decisions with our comprehensive market analysis." />
        <meta name="keywords" content="career insights, salary data, job market trends, career guidance, market analysis" />
        <link rel="canonical" href="https://talentxcel.in/public/market-insights" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Real-Time Market Data
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Career Market Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Get data-driven insights into salary trends, skill demand, and market opportunities 
              to make informed career decisions.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-600 mb-1">₹18.5 LPA</div>
                <div className="text-sm text-muted-foreground">Avg Salary</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600 mb-1">+22%</div>
                <div className="text-sm text-muted-foreground">Job Growth</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600 mb-1">45K+</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/60 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <Briefcase className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-600 mb-1">2.8K+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="skills" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="skills">Top Skills</TabsTrigger>
              <TabsTrigger value="industries">Industries</TabsTrigger>
              <TabsTrigger value="cities">Cities</TabsTrigger>
              <TabsTrigger value="salaries">Salaries</TabsTrigger>
            </TabsList>

            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Most In-Demand Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {topSkills.map((skill, index) => (
                      <div key={skill.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                          <div>
                            <h3 className="font-semibold">{skill.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Avg Salary: {skill.salary}</span>
                              <Badge 
                                variant={skill.demand === 'Very High' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {skill.demand} Demand
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-semibold">{skill.growth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="industries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Industry Growth Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {industryTrends.map((industry) => (
                      <div key={industry.industry} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{industry.industry}</h3>
                          <p className="text-sm text-muted-foreground">{industry.jobs} active jobs</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {industry.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-semibold ${
                            industry.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {industry.growth}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Top Cities for Career Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cityInsights.map((city) => (
                      <Card key={city.city} className="p-4">
                        <div className="text-center">
                          <h3 className="font-semibold text-lg mb-2">{city.city}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Avg Salary</span>
                              <span className="font-semibold">{city.avgSalary}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Growth</span>
                              <span className="text-green-600 font-semibold">{city.growth}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Active Jobs</span>
                              <span className="font-semibold">{city.jobs}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="salaries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Salary Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salaryBands.map((band) => (
                      <div key={band.range} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{band.range}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{band.jobs} jobs</span>
                            <span className="font-semibold">{band.percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${band.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-12 mt-12">
            <h2 className="text-3xl font-bold mb-4">Want Personalized Insights?</h2>
            <p className="text-xl mb-8 opacity-90">
              Get customized market insights based on your profile, skills, and career goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <BarChart3 className="h-5 w-5 mr-2" />
                Get Personal Report
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Explore All Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}