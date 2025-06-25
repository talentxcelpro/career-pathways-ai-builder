
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ChevronRight } from "lucide-react";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  target_role: string;
  difficulty_level: string;
  estimated_duration_weeks: number;
  skills_gained: string[];
}

interface LearningPathCardProps {
  path: LearningPath;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">
            <TrendingUp className="h-3 w-3 mr-1" />
            Learning Path
          </Badge>
          <Badge variant={path.difficulty_level === 'beginner' ? 'default' : 
                 path.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
            {path.difficulty_level}
          </Badge>
        </div>
        <CardTitle className="text-xl">{path.title}</CardTitle>
        <CardDescription>{path.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Target Role: {path.target_role}</span>
            <span>{path.estimated_duration_weeks} weeks</span>
          </div>

          {path.skills_gained && path.skills_gained.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Skills you'll gain:</p>
              <div className="flex flex-wrap gap-1">
                {path.skills_gained.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button className="w-full">
            Start Learning Path
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
