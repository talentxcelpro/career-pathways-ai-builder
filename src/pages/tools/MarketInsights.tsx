
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  ArrowLeft, 
  BarChart3,
  DollarSign,
  Users,
  Globe,
  Target,
  AlertCircle,
  Calendar,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MarketData {
  industry: string;
  location: string;
  trends: {
    jobGrowth: number;
    salaryTrend: number;
    demandScore: number;
    competitionLevel: string;
  };
  topSkills: Array<{
    skill: string;
    demand: number;
    growth: string;
  }>;
  salaryData: {
    average: number;
    range: { min: number; max: number };
    byExperience: Array<{
      level: string;
      salary: number;
    }>;
  };
  jobOpportunities: {
    total: number;
    remote: number;
    hybrid: number;
    onsite: number;
  };
  forecast: {
    nextQuarter: string;
    yearEnd: string;
    longTerm: string;
  };
  insights: string[];
}

const MarketInsights = () => {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const analyzeMarket = async () => {
    if (!industry || !location) {
      toast.error('Please select both industry and location');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI market analysis
    setTimeout(() => {
      const mockData: MarketData = {
        industry,
        location,
        trends: {
          jobGrowth: 23,
          salaryTrend: 8.5,
          demandScore: 85,
          competitionLevel: 'High'
        },
        topSkills: [
          { skill: 'React', demand: 95, growth: '+15%' },
          { skill: 'Python', demand: 88, growth: '+22%' },
          { skill: 'AWS', demand: 82, growth: '+18%' },
          { skill: 'TypeScript', demand: 79, growth: '+12%' },
          { skill: 'Node.js', demand: 75, growth: '+8%' }
        ],
        salaryData: {
          average: 120000,
          range: { min: 85000, max: 180000 },
          byExperience: [
            { level: 'Entry (0-2 years)', salary: 85000 },
            { level: 'Mid (3-5 years)', salary: 120000 },
            { level: 'Senior (6-10 years)', salary: 160000 },
            { level: 'Lead (10+ years)', salary: 200000 }
          ]
        },
        jobOpportunities: {
          total: 12450,
          remote: 4980,
          hybrid: 3735,
          onsite: 3735
        },
        forecast: {
          nextQuarter: 'Strong growth expected with 15% increase in job postings',
          yearEnd: 'Market projected to expand by 25% by end of year',
          longTerm: 'Sustained growth with emerging technologies driving demand'
        },
        insights: [
          'Remote work opportunities have increased by 40% in the past year',
          'Companies are prioritizing full-stack developers with cloud experience',
          'AI/ML skills are becoming increasingly valuable with 35% salary premium',
          'Startup ecosystem is expanding rapidly, creating new opportunities',
          'Competition is high but demand consistently exceeds supply'
        ]
      };

      setMarketData(mockData);
      setIsAnalyzing(false);
      toast.success('Market analysis completed!');
    }, 3500);
  };

  const getTrendColor = (value: number) => {
    if (value > 15) return 'text-green-600';
    if (value > 5) return 'text-blue-600';
    if (value > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompetitionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Market Insights</h1>
              <p className="text-gray-600">Get real-time job market insights, trends, and demand forecasting</p>
            </div>
          </div>
        </div>

        {!marketData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Analysis Form */}
            <Card>
              <CardHeader>
                <CardTitle>Analyze Market Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Analyzing Market Data</h3>
                    <p className="text-gray-600 mb-4">AI is processing market trends across multiple data sources...</p>
                    <Progress value={78} className="w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="san-francisco">San Francisco, CA</SelectItem>
                          <SelectItem value="new-york">New York, NY</SelectItem>
                          <SelectItem value="seattle">Seattle, WA</SelectItem>
                          <SelectItem value="austin">Austin, TX</SelectItem>
                          <SelectItem value="boston">Boston, MA</SelectItem>
                          <SelectItem value="remote">Remote/Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobRole">Specific Job Role (Optional)</Label>
                      <Input
                        id="jobRole"
                        placeholder="e.g., Software Developer, Product Manager"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={analyzeMarket}
                      className="w-full"
                      disabled={!industry || !location}
                    >
                      Analyze Market
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Real-time Trends</h4>
                    <p className="text-sm text-gray-600">Live job market data and trending insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Salary Analytics</h4>
                    <p className="text-sm text-gray-600">Comprehensive salary data and trends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Demand Forecasting</h4>
                    <p className="text-sm text-gray-600">AI-powered predictions for future market trends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Geographic Insights</h4>
                    <p className="text-sm text-gray-600">Location-specific market analysis and opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Market Analysis for {marketData.industry}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {marketData.location}
                </p>
              </div>
              <Button variant="outline" onClick={() => setMarketData(null)}>
                New Analysis
              </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTrendColor(marketData.trends.jobGrowth)} mb-1`}>
                      +{marketData.trends.jobGrowth}%
                    </div>
                    <p className="text-sm text-gray-600">Job Growth</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTrendColor(marketData.trends.salaryTrend)} mb-1`}>
                      +{marketData.trends.salaryTrend}%
                    </div>
                    <p className="text-sm text-gray-600">Salary Growth</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {marketData.trends.demandScore}/100
                    </div>
                    <p className="text-sm text-gray-600">Demand Score</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getCompetitionColor(marketData.trends.competitionLevel)} mb-1`}>
                      {marketData.trends.competitionLevel}
                    </div>
                    <p className="text-sm text-gray-600">Competition</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Salary Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Salary Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Average Salary</h4>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${marketData.salaryData.average.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">
                      Range: ${marketData.salaryData.range.min.toLocaleString()} - ${marketData.salaryData.range.max.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">By Experience Level</h4>
                    <div className="space-y-2">
                      {marketData.salaryData.byExperience.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{item.level}</span>
                          <span className="font-medium">${item.salary.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Skills and Job Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Top In-Demand Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData.topSkills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{skill.skill}</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {skill.growth}
                            </Badge>
                            <span className="text-sm text-gray-600">{skill.demand}%</span>
                          </div>
                        </div>
                        <Progress value={skill.demand} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Job Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {marketData.jobOpportunities.total.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Total Active Jobs</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Remote</span>
                        <span className="font-medium">{marketData.jobOpportunities.remote.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hybrid</span>
                        <span className="font-medium">{marketData.jobOpportunities.hybrid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">On-site</span>
                        <span className="font-medium">{marketData.jobOpportunities.onsite.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Market Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Next Quarter</h4>
                    <p className="text-sm text-blue-800">{marketData.forecast.nextQuarter}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Year End</h4>
                    <p className="text-sm text-green-800">{marketData.forecast.yearEnd}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Long Term</h4>
                    <p className="text-sm text-purple-800">{marketData.forecast.longTerm}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Key Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {marketData.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketInsights;
