import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { 
  GraduationCap, 
  Plus, 
  BookOpen,
  Trophy,
  Calendar,
  Clock,
  Star,
  Target,
  TrendingUp,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const LearningProgress: React.FC = () => {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_id: '',
    course_title: '',
    course_provider: '',
    total_lessons: 0,
    skill_tags: [] as string[]
  });

  const { 
    progress, 
    streak, 
    isLoading, 
    updateProgress, 
    addCourse, 
    getRecommendations,
    isUpdating,
    isAdding
  } = useLearningProgress();

  const recommendations = getRecommendations();

  const handleAddCourse = () => {
    if (newCourse.course_title && newCourse.course_provider) {
      addCourse({
        ...newCourse,
        course_id: `course_${Date.now()}`, // Simple ID generation
      });
      setNewCourse({
        course_id: '',
        course_title: '',
        course_provider: '',
        total_lessons: 0,
        skill_tags: []
      });
      setIsAddCourseOpen(false);
    }
  };

  const addSkillTag = (tag: string) => {
    if (tag && !newCourse.skill_tags.includes(tag)) {
      setNewCourse(prev => ({
        ...prev,
        skill_tags: [...prev.skill_tags, tag]
      }));
    }
  };

  const removeSkillTag = (tag: string) => {
    setNewCourse(prev => ({
      ...prev,
      skill_tags: prev.skill_tags.filter(t => t !== tag)
    }));
  };

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Stats */}
      <Card className="shadow-elegant border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Learning Dashboard
            </span>
            <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course Title</label>
                    <Input
                      value={newCourse.course_title}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, course_title: e.target.value }))}
                      placeholder="e.g., React Advanced Patterns"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider</label>
                    <Input
                      value={newCourse.course_provider}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, course_provider: e.target.value }))}
                      placeholder="e.g., Udemy, Coursera"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Lessons</label>
                    <Input
                      type="number"
                      value={newCourse.total_lessons}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, total_lessons: parseInt(e.target.value) || 0 }))}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills</label>
                    <Input
                      placeholder="Add skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {newCourse.skill_tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            onClick={() => removeSkillTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddCourse} disabled={isAdding} className="w-full">
                    Add Course
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Courses */}
            <div className="bg-gradient-subtle rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {progress.filter(c => !c.is_completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Courses</div>
            </div>

            {/* Completed Courses */}
            <div className="bg-gradient-subtle rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {progress.filter(c => c.is_completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>

            {/* Learning Streak */}
            <div className="bg-gradient-subtle rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {streak?.current_streak || 0}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {streak && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-700">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">
                  🔥 {streak.current_streak} day learning streak! Keep it up!
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Courses */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No courses yet</p>
              <p className="text-xs">Add your first course to start tracking progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((course) => (
                <div
                  key={course.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    course.is_completed ? 'bg-green-50 border-green-200' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{course.course_title}</h3>
                        {course.is_completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Trophy className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          {course.course_provider}
                          <span>•</span>
                          <Clock className="h-4 w-4" />
                          {course.completed_lessons}/{course.total_lessons} lessons
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{course.progress_percentage}%</span>
                          </div>
                          <Progress value={course.progress_percentage} className="h-2" />
                        </div>

                        {course.skill_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.skill_tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Last accessed {formatDistanceToNow(new Date(course.last_accessed), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {!course.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProgress = Math.min(course.progress_percentage + 10, 100);
                          const newLessons = Math.min(course.completed_lessons + 1, course.total_lessons);
                          updateProgress({
                            courseId: course.course_id,
                            progressPercentage: newProgress,
                            completedLessons: newLessons
                          });
                        }}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Gaps & Recommendations */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skill Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Skill Gaps to Close
              </h4>
              <div className="space-y-3">
                {recommendations.skillGaps.map((gap, index) => (
                  <div key={index} className="p-3 bg-gradient-subtle rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{gap.skill_name}</span>
                      <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}>
                        {gap.priority}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current Level {gap.current_level}</span>
                        <span>Target Level {gap.target_level}</span>
                      </div>
                      <Progress value={(gap.current_level / gap.target_level) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Recommended: {gap.recommended_courses.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Recommended Courses
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.recommendedCourses.map((course, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm mb-1">{course}</div>
                    <div className="text-xs text-muted-foreground">Popular course</div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Add to Learning Path
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};