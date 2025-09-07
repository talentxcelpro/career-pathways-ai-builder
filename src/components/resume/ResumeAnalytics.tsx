import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Eye, Download, Target, 
  MapPin, Clock, Users, Briefcase, Star, Award,
  BarChart3, PieChart, LineChart, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  views: number;
  downloads: number;
  applications: number;
  responseRate: number;
  topKeywords: string[];
  industryRanking: number;
  atsScore: number;
  improvementSuggestions: string[];
}

interface ResumeAnalyticsProps {
  resumeId?: string;
  isLive?: boolean;
  className?: string;
}

export const ResumeAnalytics: React.FC<ResumeAnalyticsProps> = ({
  resumeId,
  isLive = false,
  className
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    views: 247,
    downloads: 89,
    applications: 12,
    responseRate: 34,
    topKeywords: ['React', 'TypeScript', 'Leadership', 'Project Management'],
    industryRanking: 85,
    atsScore: 92,
    improvementSuggestions: [
      'Add more quantified achievements',
      'Include industry-specific keywords',
      'Optimize summary section length'
    ]
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const performanceMetrics = [
    {
      label: 'Profile Views',
      value: analytics.views,
      change: +23,
      icon: <Eye className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      label: 'Downloads',
      value: analytics.downloads,
      change: +15,
      icon: <Download className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      label: 'Applications',
      value: analytics.applications,
      change: +8,
      icon: <Briefcase className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      label: 'Response Rate',
      value: `${analytics.responseRate}%`,
      change: +12,
      icon: <Target className="h-4 w-4" />,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg bg-opacity-10", metric.color.replace('text-', 'bg-'))}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {metric.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={metric.change > 0 ? "text-green-500" : "text-red-500"}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ATS Score & Industry Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              ATS Compatibility Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {analytics.atsScore}%
                </div>
                <Progress value={analytics.atsScore} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Excellent ATS compatibility
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {analytics.topKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="bg-blue-100 text-blue-700">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Industry Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  Top {analytics.industryRanking}%
                </div>
                <Progress value={analytics.industryRanking} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Better than 85% of profiles in your field
                </p>
              </div>
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-4 w-4",
                      i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Button
                key={period}
                variant={timeRange === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Interactive chart showing resume performance over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{suggestion}</p>
                </div>
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};