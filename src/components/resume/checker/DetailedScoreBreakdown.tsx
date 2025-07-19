
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DetailedScore {
  category: string;
  score: number;
  maxScore: number;
  checks: Array<{
    name: string;
    passed: boolean;
    description: string;
    impact: 'high' | 'medium' | 'low';
    suggestion?: string;
  }>;
}

interface DetailedScoreBreakdownProps {
  scores: DetailedScore[];
}

export const DetailedScoreBreakdown: React.FC<DetailedScoreBreakdownProps> = ({ scores }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Detailed Score Breakdown</h3>
      
      {scores.map((scoreCategory, index) => (
        <Collapsible key={index} className="space-y-2">
          <Card className={`${getScoreBgColor(scoreCategory.score)} border-2`}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium">
                      {scoreCategory.category}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {scoreCategory.checks.filter(c => c.passed).length}/{scoreCategory.checks.length} passed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${getScoreColor(scoreCategory.score)}`}>
                      {scoreCategory.score}%
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Progress 
                  value={scoreCategory.score} 
                  className="w-full h-2" 
                />
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {scoreCategory.checks.map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                      <div className="flex-shrink-0 mt-0.5">
                        {check.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{check.name}</h4>
                          <Badge variant={getImpactBadge(check.impact) as any} className="text-xs">
                            {check.impact} impact
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600">{check.description}</p>
                        
                        {!check.passed && check.suggestion && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{check.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};
