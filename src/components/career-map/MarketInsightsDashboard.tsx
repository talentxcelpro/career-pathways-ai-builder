import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, MapPin, DollarSign, Users, Building, BarChart3 } from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface MarketInsightsDashboardProps {
  targetRole: string;
  location?: string;
  industryFocus?: string;
}

const MarketInsightsDashboard: React.FC<MarketInsightsDashboardProps> = ({
  targetRole,
  location,
  industryFocus
}) => {
  const [marketData, setMarketData] = useState<any>(null);
  const { fetchMarketData, isFetchingMarketData } = useAICareerMapping();

  useEffect(() => {
    if (targetRole) {
      handleFetchMarketData();
    }
  }, [targetRole, location, industryFocus]);

  const handleFetchMarketData = async () => {
    try {
      const result = await fetchMarketData.mutateAsync({
        targetRole,
        location,
        industryFocus
      });
      setMarketData(result);
    } catch (error) {
      console.error('Market data fetch failed:', error);
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDemandBadge = (level: string) => {
    switch (level) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  if (!marketData && !isFetchingMarketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Insights Dashboard
          </CardTitle>
          <CardDescription>
            Get real-time market data for {targetRole} positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFetchMarketData} className="w-full">
            Load Market Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isFetchingMarketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Market Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Demand Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Job Market Overview
          </CardTitle>
          <CardDescription>Current demand for {targetRole}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getDemandColor(marketData.jobDemand?.level)}`}>
                <Badge variant={getDemandBadge(marketData.jobDemand?.level)}>
                  {marketData.jobDemand?.level?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Demand Level</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {marketData.jobDemand?.openPositions?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Open Positions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {marketData.jobDemand?.growthRate || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {marketData.jobDemand?.competitionIndex || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Competition Index</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${marketData.salaryInsights?.averageSalary?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Average Salary</p>
            </div>
            <div className="text-center">
              <div className="text-lg">
                ${marketData.salaryInsights?.salaryRange?.min?.toLocaleString() || 'N/A'} - 
                ${marketData.salaryInsights?.salaryRange?.max?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground">Salary Range</p>
            </div>
            <div className="text-center">
              <div className="space-y-1">
                <div className="text-sm">Entry: {(marketData.salaryInsights?.experienceMultiplier?.entry * 100 || 70)}%</div>
                <div className="text-sm">Mid: {(marketData.salaryInsights?.experienceMultiplier?.mid * 100 || 100)}%</div>
                <div className="text-sm">Senior: {(marketData.salaryInsights?.experienceMultiplier?.senior * 100 || 140)}%</div>
              </div>
              <p className="text-sm text-muted-foreground">Experience Multipliers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Skills in Demand */}
      <Card>
        <CardHeader>
          <CardTitle>Top Skills in Demand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.topSkills?.map((skill: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{skill.demand}% demand</Badge>
                    <Badge variant="default">{skill.growth} growth</Badge>
                  </div>
                </div>
                <Progress value={skill.demand} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.industryTrends?.map((trend: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{trend.trend}</h4>
                  <div className="flex gap-2">
                    <Badge variant={trend.impact === 'high' ? 'default' : 'secondary'}>
                      {trend.impact} impact
                    </Badge>
                    <Badge variant="outline">{trend.timeframe}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employment Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employment Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{marketData.employmentTypes?.fullTime || 0}%</div>
              <p className="text-sm text-muted-foreground">Full-time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{marketData.employmentTypes?.contract || 0}%</div>
              <p className="text-sm text-muted-foreground">Contract</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{marketData.employmentTypes?.partTime || 0}%</div>
              <p className="text-sm text-muted-foreground">Part-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Hiring Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Top Hiring Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketData.topHiringCompanies?.map((company: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{company.name}</span>
                  <Badge variant="outline" className="ml-2">{company.type}</Badge>
                </div>
                <Badge variant="default">{company.openings} openings</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Insights */}
      {marketData.locationInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {marketData.locationInsights.remotePercentage}%
                </div>
                <p className="text-sm text-muted-foreground">Remote Opportunities</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Top Cities</h4>
                {marketData.locationInsights.topCities?.map((city: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{city.city}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">${city.averageSalary?.toLocaleString()}</Badge>
                      <Badge variant={getDemandBadge(city.demand)}>{city.demand}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Roles */}
      {marketData.similarRoles && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketData.similarRoles.map((role: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{role.role}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{role.similarity}% match</Badge>
                    <Badge variant={role.transition === 'easy' ? 'default' : 'secondary'}>
                      {role.transition}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketInsightsDashboard;