import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Star, Target, Zap } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  points: number;
  category: 'profile' | 'networking' | 'skills' | 'career';
}

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'Profile Perfectionist',
    description: 'Complete 100% of your profile information',
    completed: false,
    progress: 75,
    points: 100,
    category: 'profile'
  },
  {
    id: '2',
    title: 'Network Builder',
    description: 'Connect with 50+ professionals',
    completed: false,
    progress: 60,
    points: 150,
    category: 'networking'
  },
  {
    id: '3',
    title: 'Skill Master',
    description: 'Add 10+ verified skills',
    completed: true,
    progress: 100,
    points: 200,
    category: 'skills'
  },
  {
    id: '4',
    title: 'Job Hunter',
    description: 'Apply to 20+ positions',
    completed: false,
    progress: 30,
    points: 120,
    category: 'career'
  },
  {
    id: '5',
    title: 'Content Creator',
    description: 'Share 5+ professional posts',
    completed: false,
    progress: 40,
    points: 80,
    category: 'networking'
  }
];

const categoryColors = {
  profile: 'bg-blue-100 text-blue-800',
  networking: 'bg-green-100 text-green-800',
  skills: 'bg-purple-100 text-purple-800',
  career: 'bg-orange-100 text-orange-800'
};

const categoryIcons = {
  profile: Target,
  networking: Star,
  skills: Zap,
  career: CheckCircle
};

export function CareerMilestones() {
  const completedCount = milestones.filter(m => m.completed).length;
  const totalPoints = milestones.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Career Milestones
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{completedCount}/{milestones.length} completed</span>
          <span>{totalPoints} points earned</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const CategoryIcon = categoryIcons[milestone.category];
            
            return (
              <div key={milestone.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                <div className={`p-2 rounded-full ${milestone.completed ? 'bg-green-100' : 'bg-muted'}`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium text-sm ${milestone.completed ? 'text-green-700' : ''}`}>
                      {milestone.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={categoryColors[milestone.category]}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        +{milestone.points}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  
                  {!milestone.completed && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}