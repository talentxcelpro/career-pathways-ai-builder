
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface PredictiveInsight {
  id: string;
  title: string;
  type: 'hiring_forecast' | 'market_trend' | 'competition' | 'salary_trend' | 'candidate_behavior';
  prediction: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  actionable: boolean;
}

export const PredictiveAnalyticsWidget = () => {
  const navigate = useNavigate();
  
  const insights: PredictiveInsight[] = [
    {
      id: '1',
      title: 'Hiring Demand Forecast',
      type: 'hiring_forecast',
      prediction: 'Frontend developer demand will increase 23% next quarter',
      confidence: 89,
      impact: 'high',
      trend: 'up',
      timeframe: 'Next 3 months',
      actionable: true
    },
    {
      id: '2',
      title: 'Salary Market Trend',
      type: 'salary_trend',
      prediction: 'Product manager salaries trending 8% above budget',
      confidence: 76,
      impact: 'medium',
      trend: 'up',
      timeframe: 'Current quarter',
      actionable: true
    },
    {
      id: '3',
      title: 'Candidate Behavior',
      type: 'candidate_behavior',
      prediction: 'Remote work preference decreased 15% this month',
      confidence: 82,
      impact: 'medium',
      trend: 'down',
      timeframe: 'Last 30 days',
      actionable: false
    },
    {
      id: '4',
      title: 'Competition Analysis',
      type: 'competition',
      prediction: 'Similar roles receiving 34% more applications',
      confidence: 91,
      impact: 'high',
      trend: 'up',
      timeframe: 'Last 2 weeks',
      actionable: true
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'stable': return <Target className="h-3 w-3 text-blue-600" />;
      default: return <Target className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hiring_forecast': return <BarChart3 className="h-3 w-3" />;
      case 'market_trend': return <TrendingUp className="h-3 w-3" />;
      case 'competition': return <AlertTriangle className="h-3 w-3" />;
      case 'salary_trend': return <Target className="h-3 w-3" />;
      case 'candidate_behavior': return <BarChart3 className="h-3 w-3" />;
      default: return <BarChart3 className="h-3 w-3" />;
    }
  };

  const actionableInsights = insights.filter(insight => insight.actionable).length;
  const averageConfidence = Math.round(insights.reduce((acc, insight) => acc + insight.confidence, 0) / insights.length);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Predictive Analytics</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {actionableInsights} actionable insights • {averageConfidence}% avg. confidence
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/analytics/predictive')}
          >
            View Report
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer ${
              insight.actionable ? 'bg-blue-50/50 border border-blue-100' : 'bg-slate-50/50'
            }`}
            onClick={() => navigate(`/employer/analytics/predictive/${insight.id}`)}
          >
            <div className="p-1.5 bg-rose-100 rounded-md">
              {getTypeIcon(insight.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{insight.title}</h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(insight.trend)}
                  <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-slate-700 mb-2">{insight.prediction}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Confidence: {insight.confidence}%</span>
                  <span className="text-xs text-slate-500">{insight.timeframe}</span>
                </div>
                {insight.actionable && (
                  <Badge variant="secondary" className="text-xs">
                    Actionable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/analytics/predictive')}
          >
            <span className="text-sm font-semibold text-rose-700">Full Analytics Report</span>
            <BarChart3 className="h-3 w-3 text-rose-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
