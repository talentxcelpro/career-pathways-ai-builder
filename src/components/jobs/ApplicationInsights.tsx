import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Trophy,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ApplicationInsightsProps {
  totalApplications: number;
  successRate: number;
  averageResponseTime: number;
  recentActivity: Array<{
    type: 'applied' | 'interview' | 'offer' | 'rejection';
    date: string;
    company: string;
    role: string;
  }>;
  recommendations: string[];
}

export const ApplicationInsights: React.FC<ApplicationInsightsProps> = ({
  totalApplications,
  successRate,
  averageResponseTime,
  recentActivity,
  recommendations
}) => {
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'applied': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'interview': return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      case 'offer': return <Trophy className="h-4 w-4 text-green-500" />;
      case 'rejection': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Application Insights</h2>
        <p className="text-muted-foreground">Analyze your job search performance and get actionable recommendations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(successRate)}`}>
                  {successRate}%
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-3">
              <Progress value={successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{averageResponseTime} days</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.type === 'applied' && 'Applied to '}
                      {activity.type === 'interview' && 'Interview scheduled with '}
                      {activity.type === 'offer' && 'Offer received from '}
                      {activity.type === 'rejection' && 'Application rejected by '}
                      <span className="text-primary">{activity.company}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.role} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keep applying to get personalized recommendations!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};