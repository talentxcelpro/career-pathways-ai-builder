
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Users,
  Clock,
  Star,
  GraduationCap
} from 'lucide-react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { ExportButton } from '@/components/admin/ExportButton';

const LearningManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'courses' | 'paths'>('courses');
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses', searchTerm, categoryFilter, difficultyFilter],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty_level', difficultyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ['admin-learning-paths', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: learningStats } = useQuery({
    queryKey: ['learning-stats'],
    queryFn: async () => {
      const [
        { count: totalCourses },
        { count: activeCourses },
        { count: totalPaths },
        { data: categories }
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('learning_paths').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('category').not('category', 'is', null)
      ]);

      const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
      const totalEnrollments = courses?.reduce((sum, course) => sum + (course.enrolled_count || 0), 0) || 0;

      return {
        totalCourses: totalCourses || 0,
        activeCourses: activeCourses || 0,
        totalPaths: totalPaths || 0,
        totalEnrollments,
        categories: uniqueCategories
      };
    }
  });

  const toggleCourseStatus = useMutation({
    mutationFn: async ({ courseId, isActive }: { courseId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: isActive })
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update course status');
    }
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete course');
    }
  });

  return (
    <UnifiedAdminLayout 
      title="Learning Management" 
      description="Manage courses and learning paths"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{learningStats?.totalCourses?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Learning Paths</p>
                  <p className="text-2xl font-bold text-gray-900">{learningStats?.totalPaths?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{learningStats?.totalEnrollments?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{learningStats?.activeCourses?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'courses'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Courses ({courses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'paths'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Learning Paths ({learningPaths?.length || 0})
          </button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === 'courses' && (
                <>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Categories</option>
                    {learningStats?.categories?.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </>
              )}
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === 'courses' ? 'Course' : 'Path'}
              </Button>
              <ExportButton 
                data={activeTab === 'courses' ? (courses || []) : (learningPaths || [])} 
                filename={`${activeTab}-export`} 
                format="csv"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'courses' ? 'Courses' : 'Learning Paths'} 
              ({activeTab === 'courses' ? (courses?.length || 0) : (learningPaths?.length || 0)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(coursesLoading || pathsLoading) ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'courses' ? (
                  courses?.map((course) => (
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
                            onClick={() => toggleCourseStatus.mutate({ 
                              courseId: course.id, 
                              isActive: !course.is_active 
                            })}
                          >
                            {course.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteCourse.mutate(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  learningPaths?.map((path) => (
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
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default LearningManagement;
