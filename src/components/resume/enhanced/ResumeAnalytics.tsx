import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, Target, Award, AlertCircle, 
  CheckCircle, Lightbulb, Zap
} from 'lucide-react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface ResumeAnalyticsProps {
  resumeData: EnhancedResumeData;
  overallScore: number;
  atsScore: number;
  suggestions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export const ResumeAnalytics: React.FC<ResumeAnalyticsProps> = ({
  resumeData,
  overallScore,
  atsScore,
  suggestions
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Quality</span>
                <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </span>
              </div>
              <Progress value={overallScore} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              ATS Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ATS Score</span>
                <span className={`text-lg font-bold ${getScoreColor(atsScore)}`}>
                  {atsScore}%
                </span>
              </div>
              <Progress value={atsScore} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Section Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Personal Information</span>
                  <Badge variant="secondary">
                    {resumeData.personalInfo.fullName && resumeData.personalInfo.email ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
                <Progress value={resumeData.personalInfo.fullName && resumeData.personalInfo.email ? 100 : 50} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Work Experience</span>
                  <Badge variant="secondary">
                    {resumeData.experience.length > 0 ? 'Good' : 'Missing'}
                  </Badge>
                </div>
                <Progress value={resumeData.experience.length > 0 ? 80 : 0} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Skills</span>
                  <Badge variant="secondary">
                    {resumeData.skills.length >= 5 ? 'Excellent' : resumeData.skills.length > 0 ? 'Good' : 'Missing'}
                  </Badge>
                </div>
                <Progress value={resumeData.skills.length >= 5 ? 100 : resumeData.skills.length * 20} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Education</span>
                  <Badge variant="secondary">
                    {resumeData.education.length > 0 ? 'Complete' : 'Missing'}
                  </Badge>
                </div>
                <Progress value={resumeData.education.length > 0 ? 100 : 0} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Great job!</h3>
              <p className="text-gray-600">Your resume looks excellent. No major improvements needed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  {getImpactIcon(suggestion.impact)}
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'secondary'}>
                        {suggestion.impact} impact
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};