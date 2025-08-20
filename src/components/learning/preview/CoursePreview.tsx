import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Clock, 
  BookOpen, 
  Star, 
  Users, 
  Award,
  Download,
  Eye,
  Lock,
  CheckCircle,
  FileText,
  Video
} from 'lucide-react';

interface CoursePreviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: {
      name: string;
      avatar: string;
      rating: number;
      students: number;
    };
    rating: number;
    totalStudents: number;
    duration: number;
    lessons: number;
    price: number;
    isFree: boolean;
    previewVideo?: string;
    freeLessons: Array<{
      id: string;
      title: string;
      duration: number;
      type: 'video' | 'text' | 'quiz';
      isFree: boolean;
    }>;
    curriculum: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        duration: number;
        type: 'video' | 'text' | 'quiz' | 'assignment';
        isFree: boolean;
      }>;
    }>;
    projects: Array<{
      id: string;
      title: string;
      description: string;
      difficulty: 'easy' | 'medium' | 'hard';
      downloadable: boolean;
    }>;
  };
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({ course }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const totalFreeLessons = course.curriculum.reduce((total, section) => 
    total + section.lessons.filter(lesson => lesson.isFree).length, 0
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview Course
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Course Preview: {course.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Video */}
          {course.previewVideo && (
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  {activeVideo ? (
                    <video
                      controls
                      className="w-full h-full"
                      poster={course.thumbnail}
                    >
                      <source src={course.previewVideo} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div 
                      className="relative w-full h-full bg-cover bg-center cursor-pointer group"
                      style={{ backgroundImage: `url(${course.thumbnail})` }}
                      onClick={() => setActiveVideo(course.previewVideo)}
                    >
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="rounded-full w-16 h-16">
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                      </div>
                      <Badge className="absolute top-4 left-4 bg-primary">
                        Preview
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium">{formatDuration(course.duration)}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">{course.lessons}</div>
                  <div className="text-sm text-muted-foreground">Lessons</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">{course.totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="font-medium">{course.rating}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>

              {/* Free Trial Lessons */}
              {totalFreeLessons > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-green-500" />
                      Free Trial Lessons ({totalFreeLessons})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.freeLessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {lesson.type === 'video' ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : lesson.type === 'text' ? (
                              <FileText className="h-4 w-4 text-green-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-purple-500" />
                            )}
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDuration(lesson.duration)}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Free</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4">
              {course.curriculum.map((section, sectionIndex) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Section {sectionIndex + 1}: {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {lesson.type === 'video' ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : lesson.type === 'text' ? (
                              <FileText className="h-4 w-4 text-green-500" />
                            ) : lesson.type === 'quiz' ? (
                              <CheckCircle className="h-4 w-4 text-purple-500" />
                            ) : (
                              <Award className="h-4 w-4 text-orange-500" />
                            )}
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDuration(lesson.duration)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.isFree ? (
                              <Badge className="bg-green-100 text-green-800">Free</Badge>
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4">
                {course.projects.map((project) => (
                  <Card key={project.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{project.title}</h3>
                            <Badge variant="outline">
                              {project.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {project.description}
                          </p>
                        </div>
                        {project.downloadable && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Template
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{course.instructor.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{course.instructor.students.toLocaleString()} students</span>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {course.isFree ? (
                <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                  Free Course
                </Badge>
              ) : (
                <div className="text-2xl font-bold text-primary">
                  ${course.price}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                Add to Wishlist
              </Button>
              <Button>
                {course.isFree ? 'Enroll Now' : 'Enroll Course'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};