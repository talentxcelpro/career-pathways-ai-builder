
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Target, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  avgTimeInStage: string;
}

export const CandidatePipelineAnalyticsWidget = () => {
  const navigate = useNavigate();
  
  const pipelineStages: PipelineStage[] = [
    {
      id: '1',
      name: 'Applications',
      count: 245,
      percentage: 100,
      conversionRate: 35,
      trend: 'up',
      avgTimeInStage: '0 days'
    },
    {
      id: '2',
      name: 'Screening',
      count: 86,
      percentage: 35,
      conversionRate: 62,
      trend: 'up',
      avgTimeInStage: '2 days'
    },
    {
      id: '3',
      name: 'Interview',
      count: 53,
      percentage: 62,
      conversionRate: 47,
      trend: 'stable',
      avgTimeInStage: '5 days'
    },
    {
      id: '4',
      name: 'Final Review',
      count: 25,
      percentage: 47,
      conversionRate: 72,
      trend: 'up',
      avgTimeInStage: '3 days'
    },
    {
      id: '5',
      name: 'Offer',
      count: 18,
      percentage: 72,
      conversionRate: 89,
      trend: 'up',
      avgTimeInStage: '1 day'
    },
    {
      id: '6',
      name: 'Hired',
      count: 16,
      percentage: 89,
      conversionRate: 100,
      trend: 'up',
      avgTimeInStage: '7 days'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Target className="h-3 w-3 text-blue-600" />;
    }
  };

  const overallConversionRate = Math.round((16 / 245) * 100);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Pipeline Analytics</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {overallConversionRate}% overall conversion • 245 in pipeline
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/analytics/pipeline')}
          >
            Deep Dive
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {pipelineStages.map((stage, index) => (
          <div key={stage.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{stage.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {stage.count}
                </Badge>
                {getTrendIcon(stage.trend)}
              </div>
              <div className="text-xs text-slate-600">
                {stage.conversionRate}% convert
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Progress value={stage.percentage} className="flex-1 h-2" />
              <span className="text-xs text-slate-500 min-w-fit">
                {stage.avgTimeInStage}
              </span>
            </div>
            
            {index < pipelineStages.length - 1 && (
              <div className="flex justify-center">
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/analytics/pipeline')}
          >
            <span className="text-sm font-semibold text-blue-700">Optimize Pipeline</span>
            <Target className="h-3 w-3 text-blue-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
