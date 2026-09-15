import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Youtube, 
  Edit, 
  Trash2, 
  ExternalLink,
  Play,
  Eye,
  RefreshCw,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react';
import { YouTubeImportDialog } from './YouTubeImportDialog';
import { CreateCourseDialog } from '@/components/admin/learning/CreateCourseDialog';
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { useLearningManagement } from '@/hooks/useLearningManagement';
import { CertificationCoursesAdmin } from './CertificationCoursesAdmin';

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
  const [showYouTubeImport, setShowYouTubeImport] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    courses,
    learningPaths,
    learningStats,
    isLoading,
    updateCourse,
    deleteCourse
  } = useEnhancedLearningManagement();
  
  const { handleToggleCourseStatus, handleDeleteCourse } = useLearningManagement();

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditCourse = (courseId: string) => {
    // TODO: Implement edit course functionality
    console.log('Edit course:', courseId);
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
        <h2 className="text-3xl font-bold">Course Management Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateCourse(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowYouTubeImport(true)}
            className="flex items-center gap-2"
          >
            <Youtube className="w-4 h-4" />
            Import from YouTube
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats?.totalCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {learningStats?.activeCourses || 0} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats?.totalEnrollments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats?.totalPaths || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available paths
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats?.certificatesIssued || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Completions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Certification Courses Section */}
          <CertificationCoursesAdmin />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">

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
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Categories</option>
                  {learningStats?.categories?.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
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
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCourseStatus(course.id, course.is_active)}
                        >
                          {course.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCourse(course.id)}
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
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningPaths?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No learning paths available.
                  </div>
                ) : (
                  learningPaths?.map((path: any) => (
                    <Card key={path.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg">{path.title}</h3>
                            <p className="text-muted-foreground line-clamp-2">
                              {path.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Difficulty: {path.difficulty_level}</span>
                              <span>Target Role: {path.target_role}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Course Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Lessons</span>
                    <span className="font-semibold">{learningStats?.totalLessons || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Assessments</span>
                    <span className="font-semibold">{learningStats?.totalAssessments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categories</span>
                    <span className="font-semibold">{learningStats?.categories?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue</span>
                    <span className="font-semibold">₹{learningStats?.totalRevenue || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {learningStats?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{activity.courses?.title}</span>
                      <span className="text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )) || (
                    <div className="text-muted-foreground text-sm">No recent activity</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <CreateCourseDialog
        open={showCreateCourse}
        onOpenChange={setShowCreateCourse}
      />

      <YouTubeImportDialog
        open={showYouTubeImport}
        onOpenChange={setShowYouTubeImport}
        onCourseCreated={() => {
          // Refresh data when course is created
        }}
      />
    </div>
  );
};