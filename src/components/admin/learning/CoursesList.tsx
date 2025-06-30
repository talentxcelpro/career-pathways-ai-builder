
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  Users,
  Star
} from 'lucide-react';

interface CoursesListProps {
  courses: any[];
  isLoading: boolean;
  onToggleStatus: (courseId: string, isActive: boolean) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CoursesList: React.FC<CoursesListProps> = ({ 
  courses, 
  isLoading, 
  onToggleStatus,
  onDeleteCourse
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses ({courses?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {courses?.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <Badge className={course.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {course.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {course.is_free ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Free</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          ${course.price}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      {course.category && (
                        <span className="font-medium">{course.category}</span>
                      )}
                      {course.difficulty_level && (
                        <span>{course.difficulty_level}</span>
                      )}
                      {course.duration_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration_hours}h
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrolled_count || 0} enrolled
                      </div>
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {course.rating}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    <div className="text-sm text-gray-500">
                      Created: {new Date(course.created_at).toLocaleDateString()}
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onToggleStatus(course.id, !course.is_active)}
                    >
                      {course.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDeleteCourse(course.id)}
                    >
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
