
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ResumeScoreCardProps {
  score: number;
}

export const ResumeScoreCard: React.FC<ResumeScoreCardProps> = ({ score }) => {
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

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendation = (score: number) => {
    if (score >= 80) return 'Your resume is excellent and ready for most applications!';
    if (score >= 60) return 'Your resume is good but could use some improvements to stand out.';
    return 'Your resume needs significant improvements to be competitive.';
  };

  return (
    <Card className={`${getScoreBgColor(score)} border-2 relative overflow-hidden`}>
      <div className="absolute top-4 right-4">
        <Badge variant="secondary" className="bg-white/80">
          <Sparkles className="h-3 w-3 mr-1" />
          TalentXcel AI
        </Badge>
      </div>
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Your TalentXcel Resume Score</CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        {/* Score Circle */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
              className={score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
          </div>
        </div>
        
        {/* Score Label and Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className={`h-5 w-5 ${getScoreColor(score)}`} />
            <div className={`text-xl font-semibold ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={score} className="w-full h-3" />
            <p className="text-sm text-gray-600">
              {getRecommendation(score)}
            </p>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="bg-white/50 rounded-lg p-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">ATS Compatible:</span>
              <span className={`ml-2 ${score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                {score >= 70 ? '✓ Yes' : '✗ Needs Work'}
              </span>
            </div>
            <div>
              <span className="font-medium">Interview Ready:</span>
              <span className={`ml-2 ${score >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                {score >= 75 ? '✓ Ready' : '⚠ Almost'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
