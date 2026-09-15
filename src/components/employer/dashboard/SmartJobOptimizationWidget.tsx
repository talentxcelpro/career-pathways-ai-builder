
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Target, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface OptimizationSuggestion {
  id: string;
  jobTitle: string;
  type: 'title' | 'description' | 'requirements' | 'benefits' | 'salary';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  currentMetric: string;
  expectedImprovement: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export const SmartJobOptimizationWidget = () => {
  const navigate = useNavigate();
  
  const optimizations: OptimizationSuggestion[] = [
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      type: 'title',
      suggestion: 'Add "React" to job title for better searchability',
      impact: 'high',
      currentMetric: '45 views/day',
      expectedImprovement: '+67% visibility',
      status: 'pending'
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      type: 'salary',
      suggestion: 'Salary range 15% below market average',
      impact: 'high',
      currentMetric: '12 applications',
      expectedImprovement: '+40% applications',
      status: 'pending'
    },
    {
      id: '3',
      jobTitle: 'UX Designer',
      type: 'description',
      suggestion: 'Add remote work flexibility mention',
      impact: 'medium',
      currentMetric: '23 applications',
      expectedImprovement: '+25% applications',
      status: 'applied'
    },
    {
      id: '4',
      jobTitle: 'DevOps Engineer',
      type: 'requirements',
      suggestion: 'Reduce years of experience requirement from 7 to 5',
      impact: 'medium',
      currentMetric: '8 applications',
      expectedImprovement: '+55% candidate pool',
      status: 'pending'
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'title': return <Target className="h-3 w-3" />;
      case 'salary': return <TrendingUp className="h-3 w-3" />;
      case 'description': return <Zap className="h-3 w-3" />;
      case 'requirements': return <AlertCircle className="h-3 w-3" />;
      case 'benefits': return <CheckCircle className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  const pendingCount = optimizations.filter(opt => opt.status === 'pending').length;
  const appliedCount = optimizations.filter(opt => opt.status === 'applied').length;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Job Optimization</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {pendingCount} pending • {appliedCount} applied
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/jobs/optimize')}
          >
            Optimize All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {optimizations.slice(0, 3).map((optimization) => (
          <div 
            key={optimization.id}
            className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer ${
              optimization.status === 'applied' ? 'bg-green-50/50 border border-green-100' : 'bg-slate-50/50'
            }`}
            onClick={() => navigate(`/employer/jobs/optimize/${optimization.id}`)}
          >
            <div className={`p-1.5 rounded-md ${
              optimization.status === 'applied' ? 'bg-green-500' : 'bg-amber-500'
            }`}>
              {optimization.status === 'applied' ? (
                <CheckCircle className="h-3 w-3 text-white" />
              ) : (
                getTypeIcon(optimization.type)
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{optimization.jobTitle}</h4>
                <Badge className={`text-xs ${getImpactColor(optimization.impact)}`}>
                  {optimization.impact} impact
                </Badge>
              </div>
              
              <p className="text-xs text-slate-700 mb-2">{optimization.suggestion}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Current: {optimization.currentMetric}</span>
                  <span className="text-xs text-green-600 font-medium">{optimization.expectedImprovement}</span>
                </div>
                {optimization.status === 'applied' && (
                  <Badge variant="secondary" className="text-xs">
                    Applied
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/jobs/optimize')}
            >
              <span className="text-sm font-semibold text-amber-700">View All</span>
              <Zap className="h-3 w-3 text-amber-700" />
            </div>
            <div 
              className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => navigate('/employer/analytics')}
            >
              <span className="text-sm font-semibold text-slate-700">Analytics</span>
              <TrendingUp className="h-3 w-3 text-slate-700" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
