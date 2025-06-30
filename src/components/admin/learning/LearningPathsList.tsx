
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2,
  Clock
} from 'lucide-react';

interface LearningPathsListProps {
  learningPaths: any[];
  isLoading: boolean;
}

export const LearningPathsList: React.FC<LearningPathsListProps> = ({ 
  learningPaths, 
  isLoading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Paths ({learningPaths?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {learningPaths?.map((path) => (
              <div key={path.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{path.title}</h3>
                      {path.difficulty_level && (
                        <Badge variant="outline">{path.difficulty_level}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      {path.target_role && (
                        <span className="font-medium">Target: {path.target_role}</span>
                      )}
                      {path.estimated_duration_weeks && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {path.estimated_duration_weeks} weeks
                        </div>
                      )}
                      <span>Courses: {path.course_ids?.length || 0}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {path.description || 'No description available'}
                    </p>

                    <div className="text-sm text-gray-500">
                      Created: {new Date(path.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
