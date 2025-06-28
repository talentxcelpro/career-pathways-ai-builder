
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Play, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LearningPathStep {
  id: string;
  title: string;
  type: 'course' | 'project' | 'assessment';
  isCompleted: boolean;
  isCurrentStep: boolean;
  courseId?: string;
}

interface LearningPathProgressProps {
  pathId: string;
  pathTitle: string;
  steps: LearningPathStep[];
  overallProgress: number;
  estimatedDuration: string;
  skillsToLearn: string[];
}

export const LearningPathProgress: React.FC<LearningPathProgressProps> = ({
  pathId,
  pathTitle,
  steps,
  overallProgress,
  estimatedDuration,
  skillsToLearn
}) => {
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const currentStep = steps.find(step => step.isCurrentStep);
  const nextSteps = steps.filter(step => !step.isCompleted && !step.isCurrentStep).slice(0, 2);

  const getStepIcon = (step: LearningPathStep) => {
    if (step.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (step.isCurrentStep) {
      return <Play className="h-5 w-5 text-blue-600" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'assessment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            {pathTitle}
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Learning Path
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{completedSteps}/{steps.length} steps ({overallProgress}%)</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-sm text-gray-600">Estimated duration: {estimatedDuration}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step */}
        {currentStep && (
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Continue Learning
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStepIcon(currentStep)}
                <div>
                  <p className="font-medium">{currentStep.title}</p>
                  <Badge variant="outline" className={getStepTypeColor(currentStep.type)}>
                    {currentStep.type}
                  </Badge>
                </div>
              </div>
              {currentStep.courseId && (
                <Link to={`/learning/${currentStep.courseId}`}>
                  <Button size="sm">Continue</Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Next Steps Preview */}
        {nextSteps.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Coming Up</h4>
            <div className="space-y-2">
              {nextSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{step.title}</p>
                    <Badge variant="outline" className={`text-xs ${getStepTypeColor(step.type)}`}>
                      {step.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills to Learn */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Skills You'll Master</h4>
          <div className="flex flex-wrap gap-2">
            {skillsToLearn.map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-800">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to={`/learning/paths/${pathId}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Full Learning Path
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
