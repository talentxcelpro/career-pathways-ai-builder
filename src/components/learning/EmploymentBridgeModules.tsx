import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LessonViewer } from './LessonViewer';
import { 
  FileText, 
  Users, 
  MessageCircle, 
  Search, 
  Building, 
  Play,
  Lock,
  CheckCircle,
  Clock,
  Trophy,
  Download
} from 'lucide-react';
import { useLearningProgress } from '@/hooks/useLearningProgress';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  videos: number;
  icon: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Array<{
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'quiz' | 'assignment';
    duration: string;
    description?: string;
    videoUrl?: string;
    completed?: boolean;
  }>;
}

const employmentBridgeModules: Module[] = [
  {
    id: 'career-readiness',
    title: 'Career Readiness',
    description: 'Master resume building, cover letters, and LinkedIn optimization to stand out in the job market.',
    duration: '3-4 hours',
    videos: 8,
    icon: <FileText className="h-5 w-5" />,
    difficulty: 'Beginner',
    lessons: [
      { 
        id: 'resume-basics', 
        title: 'Resume Fundamentals', 
        type: 'video', 
        duration: '25 min',
        description: 'Learn the essential components of a compelling resume that gets noticed by employers.'
      },
      { 
        id: 'cover-letter', 
        title: 'Compelling Cover Letters', 
        type: 'video', 
        duration: '20 min',
        description: 'Master the art of writing cover letters that complement your resume perfectly.'
      },
      { 
        id: 'linkedin-opt', 
        title: 'LinkedIn Optimization', 
        type: 'video', 
        duration: '30 min',
        description: 'Optimize your LinkedIn profile to attract recruiters and expand your network.'
      },
      { 
        id: 'portfolio', 
        title: 'Digital Portfolio Creation', 
        type: 'video', 
        duration: '35 min',
        description: 'Build an impressive digital portfolio that showcases your skills and achievements.'
      },
      { 
        id: 'resume-quiz', 
        title: 'Resume Assessment', 
        type: 'quiz', 
        duration: '15 min',
        description: 'Test your knowledge of resume best practices and common mistakes to avoid.'
      },
      { 
        id: 'resume-template', 
        title: 'Templates & Examples', 
        type: 'pdf', 
        duration: '10 min',
        description: 'Download professional resume templates and real-world examples.'
      },
    ]
  },
  {
    id: 'soft-skills',
    title: 'Essential Soft Skills',
    description: 'Develop communication, teamwork, and time management skills crucial for workplace success.',
    duration: '4-5 hours',
    videos: 10,
    icon: <Users className="h-5 w-5" />,
    difficulty: 'Intermediate',
    lessons: [
      { 
        id: 'communication', 
        title: 'Effective Communication', 
        type: 'video', 
        duration: '30 min',
        description: 'Develop clear, confident communication skills for any workplace environment.'
      },
      { 
        id: 'teamwork', 
        title: 'Collaboration & Teamwork', 
        type: 'video', 
        duration: '25 min',
        description: 'Learn how to work effectively in teams and build strong professional relationships.'
      },
      { 
        id: 'time-mgmt', 
        title: 'Time Management Mastery', 
        type: 'video', 
        duration: '35 min',
        description: 'Master time management techniques to boost productivity and reduce stress.'
      },
      { 
        id: 'leadership', 
        title: 'Leadership Foundations', 
        type: 'video', 
        duration: '40 min',
        description: 'Develop leadership skills that will set you apart in any role.'
      },
      { 
        id: 'conflict-resolution', 
        title: 'Conflict Resolution', 
        type: 'video', 
        duration: '30 min',
        description: 'Learn strategies to handle workplace conflicts professionally and effectively.'
      },
      { 
        id: 'soft-skills-quiz', 
        title: 'Skills Assessment', 
        type: 'quiz', 
        duration: '20 min',
        description: 'Evaluate your soft skills and identify areas for improvement.'
      },
    ]
  },
  {
    id: 'interview-prep',
    title: 'Interview Preparation',
    description: 'Excel in interviews with mock sessions, common questions, and body language tips.',
    duration: '2-3 hours',
    videos: 6,
    icon: <MessageCircle className="h-5 w-5" />,
    difficulty: 'Intermediate',
    lessons: [
      { id: 'interview-types', title: 'Types of Interviews', type: 'video', duration: '20 min' },
      { id: 'common-questions', title: 'Common Interview Questions', type: 'video', duration: '30 min' },
      { id: 'body-language', title: 'Body Language & Presence', type: 'video', duration: '25 min' },
      { id: 'mock-interview', title: 'Mock Interview Session', type: 'video', duration: '45 min' },
      { id: 'follow-up', title: 'Post-Interview Follow-up', type: 'video', duration: '15 min' },
      { id: 'interview-quiz', title: 'Interview Readiness Check', type: 'quiz', duration: '15 min' },
    ]
  },
  {
    id: 'job-search',
    title: 'Job Search Strategies',
    description: 'Learn effective networking, online applications, and referral strategies to land your dream job.',
    duration: '3-4 hours',
    videos: 9,
    icon: <Search className="h-5 w-5" />,
    difficulty: 'Intermediate',
    lessons: [
      { id: 'job-market', title: 'Understanding Job Markets', type: 'video', duration: '25 min' },
      { id: 'networking', title: 'Networking Strategies', type: 'video', duration: '35 min' },
      { id: 'online-applications', title: 'Online Job Applications', type: 'video', duration: '30 min' },
      { id: 'referrals', title: 'Getting Referrals', type: 'video', duration: '25 min' },
      { id: 'salary-negotiation', title: 'Salary Negotiation', type: 'video', duration: '30 min' },
      { id: 'job-search-assignment', title: 'Job Search Plan', type: 'assignment', duration: '60 min' },
    ]
  },
  {
    id: 'workplace-adaptation',
    title: 'Workplace Adaptation',
    description: 'Navigate office culture, professional ethics, and workplace communication successfully.',
    duration: '2-3 hours',
    videos: 7,
    icon: <Building className="h-5 w-5" />,
    difficulty: 'Beginner',
    lessons: [
      { id: 'office-culture', title: 'Understanding Office Culture', type: 'video', duration: '25 min' },
      { id: 'professional-ethics', title: 'Professional Ethics', type: 'video', duration: '20 min' },
      { id: 'workplace-comm', title: 'Workplace Communication', type: 'video', duration: '30 min' },
      { id: 'first-day', title: 'Your First Day Success', type: 'video', duration: '20 min' },
      { id: 'career-growth', title: 'Career Growth Planning', type: 'video', duration: '25 min' },
      { id: 'workplace-quiz', title: 'Workplace Readiness', type: 'quiz', duration: '15 min' },
    ]
  }
];

export const EmploymentBridgeModules: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLessonViewerOpen, setIsLessonViewerOpen] = useState(false);
  const { progress } = useLearningProgress();

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.course_id === moduleId);
    return moduleProgress?.progress_percentage || 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'quiz': return <Trophy className="h-4 w-4" />;
      case 'assignment': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const totalModules = employmentBridgeModules.length;
  const completedModules = employmentBridgeModules.filter(
    module => getModuleProgress(module.id) === 100
  ).length;
  const overallProgress = (completedModules / totalModules) * 100;

  const handleLessonClick = (lesson: any, moduleTitle: string) => {
    setSelectedLesson({ ...lesson, moduleTitle });
    setIsLessonViewerOpen(true);
  };

  const handleLessonComplete = () => {
    // Update lesson completion status
    // In a real app, this would update the database
    console.log('Lesson completed:', selectedLesson);
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Employment Bridge Progress</span>
            <Badge variant="outline">{completedModules}/{totalModules} Modules</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employmentBridgeModules.map((module, index) => {
          const moduleProgress = getModuleProgress(module.id);
          const isCompleted = moduleProgress === 100;
          const isLocked = index > 0 && getModuleProgress(employmentBridgeModules[index - 1].id) < 100;

          return (
            <Card 
              key={module.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                isLocked ? 'opacity-60' : 'cursor-pointer'
              } ${selectedModule === module.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !isLocked && setSelectedModule(
                selectedModule === module.id ? null : module.id
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-100' : 'bg-primary/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : (
                        module.icon
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {module.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(moduleProgress)}%</div>
                    <Progress value={moduleProgress} className="w-16 h-2 mt-1" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4">{module.description}</p>
                
                {selectedModule === module.id && (
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <h4 className="font-semibold">Lessons ({module.lessons.length})</h4>
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => handleLessonClick(lesson, module.title)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded bg-background">
                              {getLessonIcon(lesson.type)}
                            </div>
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {lesson.type} • {lesson.duration}
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={lesson.completed ? "outline" : "default"}
                            disabled={isLocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson, module.title);
                            }}
                          >
                            {lesson.completed ? 'Completed' : 'Start'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    {module.videos} videos • {module.lessons.length} lessons
                  </div>
                  <Button 
                    variant={isCompleted ? "outline" : "default"}
                    disabled={isLocked}
                  >
                    {isCompleted ? 'Review' : isLocked ? 'Locked' : 'Continue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLesson && (
        <LessonViewer
          lesson={selectedLesson}
          isOpen={isLessonViewerOpen}
          onClose={() => setIsLessonViewerOpen(false)}
          onComplete={handleLessonComplete}
          moduleTitle={selectedLesson.moduleTitle}
        />
      )}
    </div>
  );
};