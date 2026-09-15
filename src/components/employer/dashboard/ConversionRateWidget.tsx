
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ConversionMetric {
  stage: string;
  rate: number;
  change: number;
  color: string;
}

export const ConversionRateWidget = () => {
  const navigate = useNavigate();
  
  const conversionMetrics: ConversionMetric[] = [
    { stage: 'View → Apply', rate: 12.5, change: +2.3, color: 'bg-blue-500' },
    { stage: 'Apply → Shortlist', rate: 35.8, change: +5.1, color: 'bg-purple-500' },
    { stage: 'Shortlist → Interview', rate: 44.4, change: -1.2, color: 'bg-orange-500' },
    { stage: 'Interview → Offer', rate: 37.5, change: +8.7, color: 'bg-green-500' },
    { stage: 'Offer → Hire', rate: 83.3, change: +12.1, color: 'bg-emerald-500' }
  ];

  const overallConversion = 5.2;
  const overallChange = +1.8;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Conversion Tracking</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                Stage-by-stage conversion rates
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">{overallConversion}%</div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${overallChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {overallChange >= 0 ? '+' : ''}{overallChange}%
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {conversionMetrics.map((metric, index) => (
          <div 
            key={metric.stage}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${metric.color}`}></div>
              <span className="text-sm font-medium text-slate-800">{metric.stage}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{metric.rate}%</span>
              <Badge 
                variant={metric.change >= 0 ? "default" : "destructive"} 
                className={`text-xs font-semibold ${metric.change >= 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
              >
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </Badge>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/analytics')}
          >
            <span className="text-sm font-semibold text-teal-700">View Conversion Funnel</span>
            <Target className="h-3 w-3 text-teal-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
