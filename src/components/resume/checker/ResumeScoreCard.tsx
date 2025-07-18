
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

  return (
    <Card className={`${getScoreBgColor(score)} border-2`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Your Resume Score</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="relative">
          <div className="w-48 h-24 mx-auto relative overflow-hidden">
            <div className="absolute inset-0 rounded-t-full border-8 border-gray-200"></div>
            <div 
              className={`absolute inset-0 rounded-t-full border-8 ${
                score >= 80 ? 'border-green-500' : 
                score >= 60 ? 'border-yellow-500' : 'border-red-500'
              }`}
              style={{
                clipPath: `polygon(0 100%, ${score}% 100%, ${score}% 0, 100% 0, 100% 100%)`
              }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center mt-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
          </div>
        </div>
        
        <div>
          <div className={`text-xl font-semibold ${getScoreColor(score)} mb-2`}>
            {getScoreLabel(score)}
          </div>
          <Progress value={score} className="w-full h-3" />
        </div>
        
        <p className="text-sm text-gray-600">
          Your resume is {score >= 60 ? 'ready for most applications' : 'not quite ready yet'}.
          {score < 60 && ' Consider the improvements below to increase your chances.'}
        </p>
      </CardContent>
    </Card>
  );
};
