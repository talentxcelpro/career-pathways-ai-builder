import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  GraduationCap,
  Building,
  Star,
  Award,
  DollarSign,
  BookOpen,
  Target,
  Zap,
  BarChart3,
  Trophy
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CollegeInsightsDashboardProps {
  colleges: any[];
}

export const CollegeInsightsDashboard: React.FC<CollegeInsightsDashboardProps> = ({
  colleges
}) => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['colleges-insights-analytics', colleges.length],
    queryFn: async () => {
      if (!colleges.length) return null;
      
      const collegeIds = colleges.map(c => c.id);
      const { data, error } = await supabase
        .from('college_analytics')
        .select('*')
        .in('college_id', collegeIds);
      
      if (error) throw error;
      return data;
    },
    enabled: colleges.length > 0
  });

  if (isLoading || !colleges.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate insights from college data
  const totalColleges = colleges.length;
  const verifiedColleges = colleges.filter(c => c.is_verified).length;
  const premiumColleges = colleges.filter(c => c.is_premium).length;
  const featuredColleges = colleges.filter(c => c.featured).length;

  // Calculate averages
  const placementColleges = colleges.filter(c => c.placement_percentage);
  const avgPlacement = placementColleges.length > 0 
    ? placementColleges.reduce((sum, c) => sum + (c.placement_percentage || 0), 0) / placementColleges.length
    : 0;

  const packageColleges = colleges.filter(c => c.average_package);
  const avgPackage = packageColleges.length > 0 
    ? packageColleges.reduce((sum, c) => sum + (c.average_package || 0), 0) / packageColleges.length
    : 0;

  const feeColleges = colleges.filter(c => c.average_fees_per_year);
  const avgFees = feeColleges.length > 0 
    ? feeColleges.reduce((sum, c) => sum + (c.average_fees_per_year || 0), 0) / feeColleges.length
    : 0;

  // State distribution
  const stateDistribution = colleges.reduce((acc, college) => {
    const state = college.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topStates = Object.entries(stateDistribution)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  // College type distribution
  const typeDistribution = colleges.reduce((acc, college) => {
    const type = college.college_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top performing colleges
  const topPlacementColleges = colleges
    .filter(c => c.placement_percentage)
    .sort((a, b) => (b.placement_percentage || 0) - (a.placement_percentage || 0))
    .slice(0, 5);

  const topRankedColleges = colleges
    .filter(c => c.ranking_national)
    .sort((a, b) => (a.ranking_national || Infinity) - (b.ranking_national || Infinity))
    .slice(0, 5);

  const insightCards = [
    {
      title: 'Total Colleges',
      value: totalColleges.toString(),
      description: 'colleges in database',
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Average Placement',
      value: `${avgPlacement.toFixed(1)}%`,
      description: 'across all colleges',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: avgPlacement > 75 ? 'up' : avgPlacement > 60 ? 'stable' : 'down'
    },
    {
      title: 'Average Package',
      value: `₹${(avgPackage / 100000).toFixed(1)}L`,
      description: 'per annum',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'up'
    },
    {
      title: 'Verified Colleges',
      value: `${verifiedColleges}`,
      description: `${((verifiedColleges / totalColleges) * 100).toFixed(1)}% verified`,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {card.trend && (
                  <div className="flex items-center">
                    {card.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {card.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {card.trend === 'stable' && <BarChart3 className="h-4 w-4 text-blue-500" />}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{card.value}</div>
              <div className="text-sm text-muted-foreground mb-1">{card.title}</div>
              <div className="text-xs text-muted-foreground">{card.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="rankings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Top Ranked Colleges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRankedColleges.map((college, index) => (
                    <div key={college.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">#{college.ranking_national}</Badge>
                        <div>
                          <div className="font-medium text-sm">{college.name}</div>
                          <div className="text-xs text-muted-foreground">{college.city}, {college.state}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {college.college_type || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Best Placement Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPlacementColleges.map((college, index) => (
                    <div key={college.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{college.placement_percentage}%</Badge>
                        <div>
                          <div className="font-medium text-sm">{college.name}</div>
                          <div className="text-xs text-muted-foreground">{college.city}, {college.state}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{((college.average_package || 0) / 100000).toFixed(1)}L
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top States by College Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStates.map(([state, count], index) => (
                    <div key={state} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{state}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{count as number} colleges</span>
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${((count as number) / totalColleges) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{Object.keys(stateDistribution).length}</div>
                    <div className="text-sm text-muted-foreground">States Covered</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{Math.round(totalColleges / Object.keys(stateDistribution).length)}</div>
                    <div className="text-sm text-muted-foreground">Avg per State</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>College Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(typeDistribution).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{count as number}</div>
                    <div className="text-sm text-muted-foreground capitalize">{type}</div>
                    <div className="text-xs text-muted-foreground">
                      {(((count as number) / totalColleges) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Placement Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Rate</span>
                  <span className="font-medium">{avgPlacement.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Above 90%</span>
                  <span className="font-medium">
                    {colleges.filter(c => (c.placement_percentage || 0) > 90).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Above 80%</span>
                  <span className="font-medium">
                    {colleges.filter(c => (c.placement_percentage || 0) > 80).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Package Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Package</span>
                  <span className="font-medium">₹{(avgPackage / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Above ₹15L</span>
                  <span className="font-medium">
                    {colleges.filter(c => (c.average_package || 0) > 1500000).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Above ₹10L</span>
                  <span className="font-medium">
                    {colleges.filter(c => (c.average_package || 0) > 1000000).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Verified</span>
                  <span className="font-medium">{((verifiedColleges / totalColleges) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Premium</span>
                  <span className="font-medium">{((premiumColleges / totalColleges) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Featured</span>
                  <span className="font-medium">{((featuredColleges / totalColleges) * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};