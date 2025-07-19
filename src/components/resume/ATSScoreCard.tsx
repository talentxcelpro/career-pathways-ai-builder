import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ATSScoreCardProps {
  score: number;
  feedback?: {
    strengths: string[];
    improvements: string[];
    keywords: string[];
  };
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({ 
  score, 
  feedback 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          ATS Compatibility Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getScoreIcon(score)}
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
          <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
            {getScoreLabel(score)}
          </Badge>
        </div>
        
        <Progress value={score} className="w-full" />
        
        {feedback && (
          <div className="space-y-3 mt-4">
            {feedback.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Strengths
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-green-600">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {feedback.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Improvements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-600">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {feedback.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Suggested Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {feedback.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};