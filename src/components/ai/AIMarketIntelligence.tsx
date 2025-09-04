import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Users, MapPin, Clock, BarChart3, Globe } from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface MarketTrend {
  skill: string;
  growth: number;
  demand: 'high' | 'medium' | 'low';
  averageSalary: number;
  jobCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  forecastAccuracy: number;
}

interface LocationInsight {
  city: string;
  country: string;
  jobCount: number;
  averageSalary: number;
  costOfLiving: number;
  growthRate: number;
  topCompanies: string[];
  marketSaturation: number;
}

interface IndustryInsight {
  name: string;
  growth: number;
  jobOpenings: number;
  averageSalary: number;
  topSkills: string[];
  futureOutlook: 'excellent' | 'good' | 'moderate' | 'concerning';
  automationRisk: number;
}

const AIMarketIntelligence: React.FC = () => {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [locationInsights, setLocationInsights] = useState<LocationInsight[]>([]);
  const [industryInsights, setIndustryInsights] = useState<IndustryInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | '2y'>('6m');

  useEffect(() => {
    loadMarketData();
  }, [selectedTimeframe]);

  const loadMarketData = async () => {
    setIsAnalyzing(true);
    
    try {
      // TODO: Replace with actual API calls to fetch real market data
      // const trends = await marketIntelligenceAPI.getSkillTrends(selectedTimeframe);
      // const locations = await marketIntelligenceAPI.getLocationInsights(selectedTimeframe);
      // const industries = await marketIntelligenceAPI.getIndustryAnalysis(selectedTimeframe);
      
      // For now, clear data to show empty states until API integration
      setMarketTrends([]);
      setLocationInsights([]);
      setIndustryInsights([]);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'concerning':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <TieredAccessGuard feature="market_intelligence">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              AI Market Intelligence
            </h2>
            <p className="text-muted-foreground">Real-time insights into job market trends and opportunities</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1">
              {(['3m', '6m', '1y', '2y'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
            <Button onClick={loadMarketData} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={2} label="Market Intelligence Reports" />

        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skill Trends</TabsTrigger>
            <TabsTrigger value="locations">Location Insights</TabsTrigger>
            <TabsTrigger value="industries">Industry Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="space-y-4">
            {marketTrends.length === 0 && !isAnalyzing ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Market Trends Available</h3>
                <p className="text-muted-foreground">
                  Connect your API to start receiving real-time market intelligence
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketTrends.map((trend, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{trend.skill}</CardTitle>
                      {getTrendIcon(trend.trend)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Growth Rate</span>
                      <span className="font-semibold text-green-600">+{trend.growth}%</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Market Demand</span>
                        <Badge className={getDemandColor(trend.demand)}>{trend.demand}</Badge>
                      </div>
                      <Progress value={trend.growth} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg Salary</p>
                        <p className="font-semibold">${trend.averageSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Job Count</p>
                        <p className="font-semibold">{trend.jobCount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Forecast Accuracy</span>
                        <span className="font-medium">{trend.forecastAccuracy}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            {locationInsights.length === 0 && !isAnalyzing ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Location Insights Available</h3>
                <p className="text-muted-foreground">
                  Connect your API to analyze location-based job market data
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locationInsights.map((location, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {location.city}, {location.country}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Job Openings</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {location.jobCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Salary</p>
                        <p className="font-semibold flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {location.averageSalary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Growth Rate</span>
                        <span className="text-green-600 font-medium">+{location.growthRate}%</span>
                      </div>
                      <Progress value={location.growthRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Market Saturation</span>
                        <span className="font-medium">{location.marketSaturation}%</span>
                      </div>
                      <Progress value={location.marketSaturation} className="h-2" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Cost of Living Index</p>
                      <p className="font-medium">{location.costOfLiving}% of national average</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Top Companies</p>
                      <div className="flex flex-wrap gap-1">
                        {location.topCompanies.map((company) => (
                          <Badge key={company} variant="secondary">{company}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="industries" className="space-y-4">
            {industryInsights.length === 0 && !isAnalyzing ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Industry Analysis Available</h3>
                <p className="text-muted-foreground">
                  Connect your API to analyze industry trends and opportunities
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryInsights.map((industry, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{industry.name}</CardTitle>
                      <Badge className={getOutlookColor(industry.futureOutlook)}>
                        {industry.futureOutlook}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Growth Rate</p>
                        <p className="font-semibold text-green-600">+{industry.growth}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Job Openings</p>
                        <p className="font-semibold">{industry.jobOpenings.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Average Salary</p>
                      <p className="font-semibold text-lg">${industry.averageSalary.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Automation Risk</span>
                        <span className={`font-medium ${
                          industry.automationRisk > 50 ? 'text-red-600' :
                          industry.automationRisk > 30 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {industry.automationRisk}%
                        </span>
                      </div>
                      <Progress 
                        value={industry.automationRisk} 
                        className={`h-2 ${
                          industry.automationRisk > 50 ? '[&>div]:bg-red-500' :
                          industry.automationRisk > 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Top Skills in Demand</p>
                      <div className="flex flex-wrap gap-1">
                        {industry.topSkills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* AI Insights Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI-Generated Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Emerging Opportunities</h4>
                <p className="text-blue-800 text-sm">
                  AI and cloud computing skills show the highest growth potential with 40%+ projected increases. 
                  Consider specializing in these areas for maximum career impact.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Location Advantages</h4>
                <p className="text-green-800 text-sm">
                  Austin and Seattle offer the best balance of job growth, salary, and cost of living. 
                  Remote opportunities continue to expand across all locations.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Industry Forecast</h4>
                <p className="text-purple-800 text-sm">
                  Technology and healthcare sectors show strongest resilience to automation. 
                  Finance roles are transforming with fintech integration becoming essential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TieredAccessGuard>
  );
};

export default AIMarketIntelligence;