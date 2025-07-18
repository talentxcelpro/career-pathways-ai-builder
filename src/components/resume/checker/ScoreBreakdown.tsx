
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  atsScore: number;
  contentScore: number;
  sectionsScore: number;
  designScore: number;
  issues: {
    quantifyImpact: number;
    repetition: number;
    spelling: number;
    fileFormat: boolean;
    design: boolean;
  };
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  atsScore,
  contentScore,
  sectionsScore,
  designScore,
  issues
}) => {
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreCategories = [
    {
      name: 'ATS Essentials',
      score: atsScore,
      description: 'How well your resume works with applicant tracking systems',
      issues: issues.fileFormat ? 1 : 0
    },
    {
      name: 'Content',
      score: contentScore,
      description: 'Quality and impact of your resume content',
      issues: issues.quantifyImpact + issues.repetition + issues.spelling
    },
    {
      name: 'Sections',
      score: sectionsScore,
      description: 'Completeness of essential resume sections',
      issues: 0
    },
    {
      name: 'Design',
      score: designScore,
      description: 'Visual appeal and professional formatting',
      issues: issues.design ? 1 : 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {scoreCategories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(category.score)}
                <span className="font-medium">{category.name}</span>
                {category.issues > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {category.issues} issue{category.issues > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <span className={`font-semibold ${getScoreColor(category.score)}`}>
                {category.score}%
              </span>
            </div>
            <Progress value={category.score} className="h-2" />
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
