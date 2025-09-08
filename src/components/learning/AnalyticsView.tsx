import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Clock, Award, Target } from 'lucide-react';
import { useLearningJobIntegration } from '@/hooks/useLearningJobIntegration';

interface LearningAnalytic {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  time_period: string;
  comparison_value?: number;
  trend_direction: string;
  created_at: string;
}

export const AnalyticsView: React.FC = () => {
  const { userProgress, isLoading } = useLearningJobIntegration();

  // Calculate analytics from user progress
  const analytics: LearningAnalytic[] = [
    {
      id: '1',
      metric_name: 'Course Completion Rate',
      metric_value: userProgress.length > 0 ? 
        (userProgress.filter(p => p.completion_date).length / userProgress.length) * 100 : 0,
      metric_type: 'percentage',
      time_period: 'all_time',
      trend_direction: 'up',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      metric_name: 'Average Progress',
      metric_value: userProgress.length > 0 ? 
        userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / userProgress.length : 0,
      metric_type: 'percentage',
      time_period: 'current',
      trend_direction: 'up',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      metric_name: 'Total Learning Hours',
      metric_value: userProgress.reduce((sum, p) => sum + p.time_spent_hours, 0),
      metric_type: 'hours',
      time_period: 'all_time',
      trend_direction: 'up',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      metric_name: 'Skills Acquired',
      metric_value: [...new Set(userProgress.flatMap(p => p.skills_acquired))].length,
      metric_type: 'count',
      time_period: 'all_time',
      trend_direction: 'up',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      metric_name: 'Certificates Earned',
      metric_value: userProgress.filter(p => p.certificate_earned).length,
      metric_type: 'count',
      time_period: 'all_time',
      trend_direction: 'up',
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      metric_name: 'Average Performance Score',
      metric_value: userProgress.length > 0 ? 
        userProgress.reduce((sum, p) => sum + p.performance_score, 0) / userProgress.length : 0,
      metric_type: 'percentage',
      time_period: 'current',
      trend_direction: 'stable',
      created_at: new Date().toISOString()
    }
  ];

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('Completion') || metricName.includes('Progress')) return TrendingUp;
    if (metricName.includes('Hours') || metricName.includes('Time')) return Clock;
    if (metricName.includes('Skills')) return Target;
    if (metricName.includes('Certificates')) return Award;
    if (metricName.includes('Performance')) return BarChart3;
    return Users;
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? '↗' : direction === 'down' ? '↘' : '→';
  };

  const formatMetricValue = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'hours':
        return `${value.toFixed(1)}h`;
      case 'count':
        return value.toString();
      default:
        return value.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Learning Analytics</h2>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analytics.map((analytic) => {
          const IconComponent = getMetricIcon(analytic.metric_name);
          return (
            <Card key={analytic.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {analytic.metric_name}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {formatMetricValue(analytic.metric_value, analytic.metric_type)}
                  </div>
                  <div className={`flex items-center text-sm ${getTrendColor(analytic.trend_direction)}`}>
                    <span className="mr-1">
                      {getTrendIcon(analytic.trend_direction)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {analytic.time_period.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                {analytic.comparison_value && (
                  <p className="text-xs text-gray-600 mt-2">
                    vs {analytic.comparison_value} last period
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userProgress.length === 0 && (
              <p className="text-gray-600 italic">
                Start taking courses to see personalized learning insights.
              </p>
            )}
            
            {userProgress.length > 0 && (
              <>
                {analytics[0].metric_value > 80 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Award className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Excellent Progress!</p>
                      <p className="text-sm text-green-700">
                        Your completion rate is above 80%. Keep up the great work!
                      </p>
                    </div>
                  </div>
                )}
                
                {analytics[4].metric_value >= 3 && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Skill Builder</p>
                      <p className="text-sm text-purple-700">
                        You've earned {analytics[4].metric_value} certificates! Your skills are growing rapidly.
                      </p>
                    </div>
                  </div>
                )}
                
                {analytics[2].metric_value >= 50 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Dedicated Learner</p>
                      <p className="text-sm text-blue-700">
                        You've invested {analytics[2].metric_value.toFixed(0)} hours in learning. 
                        That's serious commitment!
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};