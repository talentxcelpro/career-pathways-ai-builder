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
  const getPerformanceLevel = (userValue: number, percentile: number) => {
    if (userValue <= 0) return { level: 'Getting Started', color: 'text-amber-700 bg-amber-50 border border-amber-200', icon: '🌱' };
    if (percentile >= 90) return { level: 'Exceptional (Top 10%)', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200', icon: '🏆' };
    if (percentile >= 75) return { level: 'Above Average', color: 'text-blue-700 bg-blue-50 border border-blue-200', icon: '⭐' };
    if (percentile >= 50) return { level: 'On Track', color: 'text-sky-700 bg-sky-50 border border-sky-200', icon: '👍' };
    if (percentile >= 25) return { level: 'Growing', color: 'text-orange-700 bg-orange-50 border border-orange-200', icon: '📈' };
    return { level: 'Needs Growth', color: 'text-rose-700 bg-rose-50 border border-rose-200', icon: '🎯' };
  };

  const getComparisonIcon = (userValue: number, average: number) => {
    if (average <= 0) return <Minus className="h-4 w-4 text-gray-500" />;
    const diff = ((userValue - average) / average) * 100;
    if (diff > 5) return <ArrowUp className="h-4 w-4 text-emerald-500" />;
    if (diff < -5) return <ArrowDown className="h-4 w-4 text-rose-500" />;
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
    const performance = getPerformanceLevel(userValue, percentile);
    const comparisonIcon = getComparisonIcon(userValue, average);
    const difference = userValue - average;
    const differencePercent = average > 0 
      ? Math.min(999, Math.round(Math.abs((difference / average) * 100))) 
      : 0;

    return (
      <Card className="hover:shadow-lg transition-shadow border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-800">{title}</h3>
            </div>
            <Badge variant="outline" className={performance.color}>
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
                <div className="flex items-center justify-end gap-1">
                  {comparisonIcon}
                  <span className={`text-sm font-semibold ${
                    difference > 0 ? 'text-emerald-600' : 
                    difference < 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {difference > 0 ? '+' : difference < 0 ? '-' : ''}{differencePercent}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">vs peers</p>
              </div>
            </div>

            {/* Percentile Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Percentile Rank</span>
                <span className="font-semibold text-slate-800">
                  {userValue <= 0 ? 'Getting Started' : `${percentile}th percentile`}
                </span>
              </div>
              <Progress value={userValue <= 0 ? 5 : Math.max(5, percentile)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0th</span>
                <span>50th</span>
                <span>100th</span>
              </div>
            </div>

            {/* Industry Average */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Industry Average</span>
                <span className="font-medium text-slate-700">{average.toLocaleString()}{unit}</span>
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
            {data.benchmarks.connections.user <= 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-amber-900">Start Building Your Network</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Connecting with colleagues and industry leaders on TalentXcel unlocks 4x more visibility and job recommendations.
                    </p>
                  </div>
                </div>
              </div>
            ) : data.benchmarks.connections.percentile >= 50 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-emerald-900">Strong Professional Network</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      You have {data.benchmarks.connections.user} verified connections, positioning you in the {data.benchmarks.connections.percentile}th percentile among {data.role} peers.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Expand Your Network</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You have {data.benchmarks.connections.user} connections. Expanding your network towards the industry benchmark of {data.benchmarks.connections.average} will accelerate your market reach.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.benchmarks.profileViews.user > 0 ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Active Visibility Momentum</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your profile generated {data.benchmarks.profileViews.user} views this period. Continued activity across verified networks boosts recurrent views by up to 45%.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Increase Profile Visibility</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      No views recorded for this period yet. Share insights, update your skills, and engage with network posts to draw views.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.benchmarks.skills.user > 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-purple-900">Verified Skill Matrix</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      You have {data.benchmarks.skills.user} verified skills listed (Industry avg: {data.benchmarks.skills.average}). Your profile is well-positioned for matching talent searches.
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