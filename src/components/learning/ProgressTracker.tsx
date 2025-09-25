import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Calendar,
  Award
} from 'lucide-react';

interface ProgressTrackerProps {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  timeSpent: number;
  lastAccessed?: Date;
  certificateEarned?: boolean;
  skillsProgress?: Array<{
    skill: string;
    progress: number;
  }>;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  courseId,
  completedLessons,
  totalLessons,
  timeSpent,
  lastAccessed,
  certificateEarned,
  skillsProgress = []
}) => {
  const completionPercentage = Math.round((completedLessons / totalLessons) * 100);
  const hoursSpent = Math.round(timeSpent / 60);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-lg font-bold">{completedLessons}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold">{totalLessons - completedLessons}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold">{hoursSpent}h</div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Progress */}
      {skillsProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills Development
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillsProgress.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{skill.skill}</span>
                  <span className="font-medium">{skill.progress}%</span>
                </div>
                <Progress value={skill.progress} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastAccessed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Last Active</span>
              </div>
              <span className="text-sm font-medium">
                {lastAccessed.toLocaleDateString()}
              </span>
            </div>
          )}
          
          {certificateEarned && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Certificate Earned
              </Badge>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Keep up the great work! You're making excellent progress.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};