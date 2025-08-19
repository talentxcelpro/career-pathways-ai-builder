import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { Target, Plus, Users, Clock } from 'lucide-react';

export const LearningPathsManagement: React.FC = () => {
  const { learningPaths, isLoading } = useEnhancedLearningManagement();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Learning Paths</h2>
          <p className="text-muted-foreground">Create structured learning journeys</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Path
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningPaths?.map((path: any) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {path.difficulty_level}
                </span>
              </div>
              <CardTitle className="line-clamp-2">{path.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {path.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{path.learning_path_enrollments?.[0]?.count || 0} enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{path.estimated_duration_weeks}w</span>
                </div>
              </div>
              <div className="text-sm mb-4">
                <strong>Courses:</strong> {path.learning_path_courses?.length || 0}
              </div>
              <Button variant="outline" className="w-full">
                Manage Path
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {learningPaths?.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No learning paths</h3>
            <p className="text-muted-foreground mb-4">Create structured pathways for learners</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Learning Path
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};