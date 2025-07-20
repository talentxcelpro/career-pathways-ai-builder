
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, TrendingUp, Target } from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface Suggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface AIInsightsPanelProps {
  suggestions: Suggestion[];
  resumeData: EnhancedResumeData;
  onApplySuggestion: (suggestion: Suggestion) => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  suggestions,
  resumeData,
  onApplySuggestion
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI-Powered Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
              <p className="text-muted-foreground">
                Your resume is well-optimized. No major issues detected.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getImpactIcon(suggestion.impact)}
                          <h4 className="font-semibold">{suggestion.title}</h4>
                          <Badge variant={getImpactColor(suggestion.impact) as any}>
                            {suggestion.impact} impact
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onApplySuggestion(suggestion)}
                      >
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Strength Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Strength Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {resumeData.experience.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Work Experiences
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {resumeData.skills.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Skills Listed
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {resumeData.personalInfo.summary ? resumeData.personalInfo.summary.split(' ').length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Summary Words
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'].map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'].map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
