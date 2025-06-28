
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, DollarSign, Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface RecruitmentMetric {
  id: string;
  name: string;
  value: string;
  target: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'needs_improvement';
  description: string;
}

export const SmartRecruitmentMetricsWidget = () => {
  const navigate = useNavigate();
  
  const metrics: RecruitmentMetric[] = [
    {
      id: '1',
      name: 'Time to Hire',
      value: '18 days',
      target: '≤ 21 days',
      percentage: 85,
      trend: 'up',
      status: 'good',
      description: '3 days faster than last month'
    },
    {
      id: '2',
      name: 'Cost per Hire',
      value: '$3,200',
      target: '≤ $3,500',
      percentage: 91,
      trend: 'up',
      status: 'excellent',
      description: '8% reduction from last quarter'
    },
    {
      id: '3',
      name: 'Quality of Hire',
      value: '4.2/5',
      target: '≥ 4.0',
      percentage: 84,
      trend: 'stable',
      status: 'good',
      description: 'Based on 90-day performance reviews'
    },
    {
      id: '4',
      name: 'Offer Accept Rate',
      value: '89%',
      target: '≥ 85%',
      percentage: 89,
      trend: 'up',
      status: 'excellent',
      description: '4% increase this month'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'needs_improvement': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'Time to Hire': return <Clock className="h-3 w-3" />;
      case 'Cost per Hire': return <DollarSign className="h-3 w-3" />;
      case 'Quality of Hire': return <Trophy className="h-3 w-3" />;
      case 'Offer Accept Rate': return <TrendingUp className="h-3 w-3" />;
      default: return <BarChart3 className="h-3 w-3" />;
    }
  };

  const averagePerformance = Math.round(metrics.reduce((acc, metric) => acc + metric.percentage, 0) / metrics.length);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Recruitment KPIs</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {averagePerformance}% avg. performance • 4 key metrics
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/analytics/metrics')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {metrics.map((metric) => (
          <div 
            key={metric.id}
            className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/employer/analytics/metrics/${metric.id}`)}
          >
            <div className="p-1.5 bg-emerald-100 rounded-md">
              {getMetricIcon(metric.name)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{metric.name}</h4>
                <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-slate-900">{metric.value}</span>
                <span className="text-xs text-slate-500">Target: {metric.target}</span>
              </div>
              
              <div className="space-y-1">
                <Progress value={metric.percentage} className="h-1.5" />
                <p className="text-xs text-slate-600">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/analytics/metrics')}
          >
            <span className="text-sm font-semibold text-emerald-700">Performance Dashboard</span>
            <BarChart3 className="h-3 w-3 text-emerald-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
