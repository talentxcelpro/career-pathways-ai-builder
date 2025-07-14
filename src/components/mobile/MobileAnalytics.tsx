import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Eye, Send, Calendar, Target, Award, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  profileViews: number;
  applicationsSent: number;
  interviewsScheduled: number;
  responseRate: number;
  avgResponseTime: number;
  topSkills: string[];
  industryInterest: { name: string; percentage: number }[];
  locationPreferences: { city: string; count: number }[];
  weeklyActivity: { day: string; applications: number; views: number }[];
}

export const MobileAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics: AnalyticsData = {
      profileViews: 847,
      applicationsSent: 23,
      interviewsScheduled: 5,
      responseRate: 34,
      avgResponseTime: 4.2,
      topSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
      industryInterest: [
        { name: 'Technology', percentage: 65 },
        { name: 'Finance', percentage: 20 },
        { name: 'Healthcare', percentage: 10 },
        { name: 'Education', percentage: 5 }
      ],
      locationPreferences: [
        { city: 'San Francisco', count: 12 },
        { city: 'New York', count: 8 },
        { city: 'Seattle', count: 6 },
        { city: 'Austin', count: 4 }
      ],
      weeklyActivity: [
        { day: 'Mon', applications: 3, views: 45 },
        { day: 'Tue', applications: 5, views: 62 },
        { day: 'Wed', applications: 2, views: 38 },
        { day: 'Thu', applications: 4, views: 71 },
        { day: 'Fri', applications: 6, views: 89 },
        { day: 'Sat', applications: 1, views: 23 },
        { day: 'Sun', applications: 2, views: 34 }
      ]
    };

    setAnalytics(mockAnalytics);
  }, [timeRange]);

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Job Search Analytics</h2>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Profile Views</span>
              </div>
              <div className="text-lg font-bold">{analytics.profileViews}</div>
              <div className="text-xs text-green-600">+12% vs last month</div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Applications</span>
              </div>
              <div className="text-lg font-bold">{analytics.applicationsSent}</div>
              <div className="text-xs text-green-600">+5% vs last month</div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Interviews</span>
              </div>
              <div className="text-lg font-bold">{analytics.interviewsScheduled}</div>
              <div className="text-xs text-green-600">+25% vs last month</div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Response Rate</span>
              </div>
              <div className="text-lg font-bold">{analytics.responseRate}%</div>
              <div className="text-xs text-red-600">-3% vs last month</div>
            </Card>
          </div>

          {/* Response Rate Progress */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Response Rate Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Rate</span>
                <span className="font-medium">{analytics.responseRate}%</span>
              </div>
              <Progress value={analytics.responseRate} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Industry average: 28% • Your goal: 40%
              </div>
            </div>
          </Card>

          {/* Top Skills */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Most Searched Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.topSkills.map((skill, index) => (
                <Badge key={skill} variant={index < 2 ? "default" : "secondary"}>
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {/* Weekly Activity Chart */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Weekly Activity</h3>
            <div className="space-y-3">
              {analytics.weeklyActivity.map((day) => (
                <div key={day.day} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{day.day}</span>
                    <span className="text-muted-foreground">
                      {day.applications} apps • {day.views} views
                    </span>
                  </div>
                  <Progress value={(day.applications / 6) * 100} className="h-1" />
                </div>
              ))}
            </div>
          </Card>

          {/* Average Response Time */}
          <Card className="p-4">
            <h3 className="font-medium mb-2">Average Response Time</h3>
            <div className="text-2xl font-bold">{analytics.avgResponseTime} days</div>
            <p className="text-sm text-muted-foreground">
              Companies typically respond within 5-7 business days
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Industry Interest */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Industry Interest</h3>
            <div className="space-y-3">
              {analytics.industryInterest.map((industry) => (
                <div key={industry.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{industry.name}</span>
                    <span className="font-medium">{industry.percentage}%</span>
                  </div>
                  <Progress value={industry.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Location Preferences */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Top Locations Applied
            </h3>
            <div className="space-y-2">
              {analytics.locationPreferences.map((location) => (
                <div key={location.city} className="flex justify-between items-center">
                  <span className="text-sm">{location.city}</span>
                  <Badge variant="outline">{location.count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recommendations
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Apply to 3-5 jobs per day to increase visibility</li>
              <li>• Focus on React and TypeScript roles (highest match rate)</li>
              <li>• Consider remote positions to expand opportunities</li>
              <li>• Update your profile weekly to stay active</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};