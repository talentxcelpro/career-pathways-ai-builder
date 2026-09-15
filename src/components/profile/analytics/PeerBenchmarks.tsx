import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Award, Target, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PeerBenchmarksProps {
  data: {
    industry: string;
    role: string;
    benchmarks: {
      connections: { user: number; average: number; percentile: number };
      profileViews: { user: number; average: number; percentile: number };
      skills: { user: number; average: number; percentile: number };
    };
  };
}

export const PeerBenchmarks = ({ data }: PeerBenchmarksProps) => {
  const getPerformanceLevel = (percentile: number) => {
    if (percentile >= 90) return { level: 'Excellent', color: 'text-green-600 bg-green-100', icon: '🏆' };
    if (percentile >= 75) return { level: 'Above Average', color: 'text-blue-600 bg-blue-100', icon: '⭐' };
    if (percentile >= 50) return { level: 'Average', color: 'text-yellow-600 bg-yellow-100', icon: '👍' };
    if (percentile >= 25) return { level: 'Below Average', color: 'text-orange-600 bg-orange-100', icon: '📈' };
    return { level: 'Needs Improvement', color: 'text-red-600 bg-red-100', icon: '🎯' };
  };

  const getComparisonIcon = (userValue: number, average: number) => {
    const diff = ((userValue - average) / average) * 100;
    if (diff > 10) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (diff < -10) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const BenchmarkCard = ({ 
    title, 
    userValue, 
    average, 
    percentile, 
    icon: Icon, 
    unit = '' 
  }: {
    title: string;
    userValue: number;
    average: number;
    percentile: number;
    icon: any;
    unit?: string;
  }) => {
    const performance = getPerformanceLevel(percentile);
    const comparisonIcon = getComparisonIcon(userValue, average);
    const difference = userValue - average;
    const differencePercent = Math.abs((difference / average) * 100).toFixed(0);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">{title}</h3>
            </div>
            <Badge className={performance.color}>
              {performance.icon} {performance.level}
            </Badge>
          </div>

          <div className="space-y-4">
            {/* User vs Average */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userValue.toLocaleString()}{unit}
                </p>
                <p className="text-sm text-muted-foreground">Your current</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {comparisonIcon}
                  <span className={`text-sm font-medium ${
                    difference > 0 ? 'text-green-600' : 
                    difference < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {difference > 0 ? '+' : ''}{differencePercent}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">vs peers</p>
              </div>
            </div>

            {/* Percentile Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Percentile Rank</span>
                <span className="font-medium">{percentile}th percentile</span>
              </div>
              <Progress value={percentile} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0th</span>
                <span>50th</span>
                <span>100th</span>
              </div>
            </div>

            {/* Industry Average */}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Industry Average</span>
                <span className="font-medium">{average.toLocaleString()}{unit}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Peer Benchmarks
          </CardTitle>
          <p className="text-muted-foreground">
            Compare your professional metrics with {data.role}s in {data.industry}
          </p>
        </CardHeader>
      </Card>

      {/* Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BenchmarkCard
          title="Professional Connections"
          userValue={data.benchmarks.connections.user}
          average={data.benchmarks.connections.average}
          percentile={data.benchmarks.connections.percentile}
          icon={Users}
        />

        <BenchmarkCard
          title="Profile Views"
          userValue={data.benchmarks.profileViews.user}
          average={data.benchmarks.profileViews.average}
          percentile={data.benchmarks.profileViews.percentile}
          icon={TrendingUp}
          unit=" views"
        />

        <BenchmarkCard
          title="Skills Listed"
          userValue={data.benchmarks.skills.user}
          average={data.benchmarks.skills.average}
          percentile={data.benchmarks.skills.percentile}
          icon={Award}
          unit=" skills"
        />
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.benchmarks.connections.percentile < 50 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Expand Your Network</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You have fewer connections than the average {data.role}. Consider connecting with 
                      colleagues, alumni, and industry professionals to reach the {data.benchmarks.connections.average} 
                      connection average.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.benchmarks.profileViews.percentile < 50 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Increase Profile Visibility</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your profile views are below average. Consider optimizing your headline, 
                      adding more skills, and sharing relevant content to increase visibility.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.benchmarks.skills.percentile >= 75 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-green-900">Strong Skill Profile</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Excellent! You have more skills listed than 75% of {data.role}s. 
                      Consider getting endorsements for your top skills to further strengthen your profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};