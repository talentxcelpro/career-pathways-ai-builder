
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Crown } from 'lucide-react';

interface ScoreCategory {
  name: string;
  score: number;
  issues: number;
  color: string;
  icon: React.ReactNode;
}

interface EnhancedResumeScoreCardProps {
  overallScore: number;
  totalIssues: number;
  categories: ScoreCategory[];
  upgradePrompt?: boolean;
}

export const EnhancedResumeScoreCard: React.FC<EnhancedResumeScoreCardProps> = ({
  overallScore,
  totalIssues,
  categories,
  upgradePrompt = true
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-50 to-green-100 border-green-200';
    if (score >= 60) return 'from-yellow-50 to-yellow-100 border-yellow-200';
    return 'from-red-50 to-red-100 border-red-200';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const getMotivationalMessage = (score: number) => {
    if (score >= 80) return 'Excellent! Your resume is ready to impress employers.';
    if (score >= 60) return 'Good foundation! A few improvements will make it stand out.';
    return 'Great potential! Some key updates will significantly boost your chances.';
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className={`bg-gradient-to-br ${getScoreBgColor(overallScore)} border-2 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            TalentXcel AI
          </Badge>
        </div>
        
        <CardHeader className="text-center pb-4 relative">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Your Resume Score
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6 relative">
          {/* Score Display */}
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                {overallScore}
              </div>
              <div className="text-lg font-semibold text-gray-600">out of 100</div>
            </div>
            
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                {getScoreGrade(overallScore)}
              </div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
          </div>

          {/* Issues Count */}
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-lg font-semibold text-gray-700">
              {totalIssues} {totalIssues === 1 ? 'Issue' : 'Issues'} Found
            </span>
          </div>

          {/* Motivational Message */}
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-gray-700 font-medium">
              {getMotivationalMessage(overallScore)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={overallScore} className="h-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Needs Work</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                  {category.issues > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {category.issues} issue{category.issues > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${category.color}`}>
                    {category.score}%
                  </span>
                  {category.score >= 80 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>
              <Progress value={category.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {upgradePrompt && overallScore < 85 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 mb-2">
                  Unlock Your Resume's Full Potential
                </h3>
                <p className="text-purple-800 mb-4">
                  Get detailed suggestions, ATS optimization tips, and industry-specific improvements to boost your score to 90+
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to TalentXcel Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
