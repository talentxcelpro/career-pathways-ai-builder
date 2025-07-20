
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Suggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface ATSScoreCardProps {
  score: number;
  overallScore: number;
  suggestions: Suggestion[];
  onOptimize: () => void;
  isOptimizing: boolean;
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  score,
  overallScore,
  suggestions,
  onOptimize,
  isOptimizing
}) => {
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', status: 'Excellent', icon: CheckCircle };
    if (score >= 60) return { color: 'text-yellow-600', status: 'Good', icon: AlertTriangle };
    return { color: 'text-red-600', status: 'Needs Improvement', icon: AlertTriangle };
  };

  const atsStatus = getScoreStatus(score);
  const overallStatus = getScoreStatus(overallScore);

  return (
    <div className="space-y-6">
      {/* ATS Score Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5" />
              ATS Compatibility Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-4xl font-bold mb-2 ${atsStatus.color}`}>
              {score}%
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <atsStatus.icon className={`h-5 w-5 ${atsStatus.color}`} />
              <span className={`font-medium ${atsStatus.color}`}>
                {atsStatus.status}
              </span>
            </div>
            <Progress value={score} className="mb-4" />
            <Button 
              onClick={onOptimize}
              disabled={isOptimizing}
              className="w-full"
            >
              {isOptimizing ? 'Analyzing...' : 'Optimize for ATS'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Overall Resume Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-4xl font-bold mb-2 ${overallStatus.color}`}>
              {overallScore}%
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <overallStatus.icon className={`h-5 w-5 ${overallStatus.color}`} />
              <span className={`font-medium ${overallStatus.color}`}>
                {overallStatus.status}
              </span>
            </div>
            <Progress value={overallScore} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Based on content completeness and quality
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ATS Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            ATS Optimization Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">✓ ATS-Friendly Practices</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use standard section headers</li>
                <li>• Include relevant keywords naturally</li>
                <li>• Use bullet points for achievements</li>
                <li>• Keep formatting simple and clean</li>
                <li>• Include measurable accomplishments</li>
                <li>• Use standard fonts and formatting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-red-600">✗ Things to Avoid</h4>
              <ul className="space-y-2 text-sm">
                <li>• Complex graphics or images</li>
                <li>• Tables and columns</li>
                <li>• Headers and footers</li>
                <li>• Unusual fonts or colors</li>
                <li>• Text boxes or special formatting</li>
                <li>• Acronyms without explanations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specific Recommendations */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ATS-Specific Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.filter(s => s.type === 'ats' || s.type === 'content').map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium">{suggestion.title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                  <Badge variant={suggestion.impact === 'high' ? 'destructive' : 'secondary'}>
                    {suggestion.impact}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Technical Keywords</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Industry Terms</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Action Verbs</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
