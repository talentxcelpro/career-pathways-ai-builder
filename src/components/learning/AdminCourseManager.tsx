import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Youtube, 
  Edit, 
  Trash2, 
  ExternalLink,
  Play,
  Eye,
  RefreshCw
} from 'lucide-react';
import { YouTubeImportDialog } from './YouTubeImportDialog';
import { useYouTubeIntegration } from '@/hooks/useYouTubeIntegration';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  youtube_channel_name?: string;
  content_type?: string;
  view_count?: number;
  like_count?: number;
  external_url?: string;
  is_active: boolean;
  created_at: string;
}

export const AdminCourseManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showYouTubeImport, setShowYouTubeImport] = useState(false);
  const queryClient = useQueryClient();
  const { syncYouTubeStats, loading } = useYouTubeIntegration();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.youtube_channel_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSyncStats = async (courseId: string) => {
    try {
      await syncYouTubeStats(courseId);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    } catch (error) {
      console.error('Error syncing stats:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleToggleActive = async (courseId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: !isActive })
        .eq('id', courseId);
      
      if (error) throw error;
      
      toast.success(`Course ${!isActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    } catch (error) {
      console.error('Error toggling course status:', error);
      toast.error('Failed to update course status');
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Button 
          onClick={() => setShowYouTubeImport(true)}
          className="flex items-center gap-2"
        >
          <Youtube className="w-4 h-4" />
          Import from YouTube
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading courses...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No courses found matching your search.' : 'No courses available.'}
              </div>
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          {!course.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {course.content_type && (
                            <Badge variant="outline">
                              {course.content_type === 'video' && <Youtube className="w-3 h-3 mr-1" />}
                              {course.content_type === 'playlist' && <Play className="w-3 h-3 mr-1" />}
                              {course.content_type}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Instructor: {course.youtube_channel_name || course.instructor_name}
                          </span>
                          {course.view_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{formatNumber(course.view_count)} views</span>
                            </div>
                          )}
                          <span className="text-xs">
                            Created: {new Date(course.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {course.external_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(course.external_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {(course.content_type === 'video' || course.content_type === 'playlist') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSyncStats(course.id)}
                            disabled={loading}
                          >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(course.id, course.is_active)}
                        >
                          {course.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <YouTubeImportDialog
        open={showYouTubeImport}
        onOpenChange={setShowYouTubeImport}
        onCourseCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
        }}
      />
    </div>
  );
};