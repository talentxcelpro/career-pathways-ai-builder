import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, Users, Target, Award } from 'lucide-react';

interface CollegeAnalyticsProps {
  college: any;
  analytics?: {
    placementRate?: number;
    stateAverage?: number;
    popularityScore?: number;
    monthlyViews?: number;
    studentsSearched?: number;
    regionRank?: number;
    roiScore?: number;
  };
}

export const CollegeAnalytics: React.FC<CollegeAnalyticsProps> = ({
  college,
  analytics = {}
}) => {
  const {
    placementRate = college.placement_percentage || 75,
    stateAverage = 68,
    popularityScore = 85,
    monthlyViews = 1250,
    studentsSearched = 450,
    regionRank = 12,
    roiScore = 78
  } = analytics;

  const placementComparison = placementRate - stateAverage;
  const isAboveAverage = placementComparison > 0;

  const insights = [
    {
      label: 'Placement Performance',
      value: `${placementRate}%`,
      comparison: `${Math.abs(placementComparison)}% ${isAboveAverage ? 'above' : 'below'} state average`,
      trend: isAboveAverage ? 'up' : 'down',
      icon: Target,
      color: isAboveAverage ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Student Interest',
      value: `${studentsSearched}`,
      comparison: 'students searched this month',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Regional Ranking',
      value: `#${regionRank}`,
      comparison: `in ${college.state || 'region'}`,
      trend: 'up',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      label: 'Popularity Score',
      value: `${popularityScore}/100`,
      comparison: 'based on views & engagement',
      trend: 'up',
      icon: Eye,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
                {insight.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">{insight.value}</div>
              <div className="text-xs text-gray-600">{insight.label}</div>
              <div className="text-xs text-gray-500 mt-1">{insight.comparison}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Placement Rate vs State Average</span>
            <div className="flex items-center space-x-2">
              <Badge variant={isAboveAverage ? "default" : "secondary"} className="text-xs">
                {placementRate}% vs {stateAverage}%
              </Badge>
              {isAboveAverage ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Monthly Profile Views</span>
            <span className="font-medium">{monthlyViews.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ROI Score</span>
            <Badge variant="outline" className="text-xs">
              {roiScore}/100
            </Badge>
          </div>
          
          {college.state && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Best Colleges in {college.state}</span>
              <span className="font-medium">#{regionRank}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};