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
    description: 'Master LinkedIn optimization, cover letter writing, and career preparation with real expert guidance.',
    duration: '1-2 hours',
    videos: 4,
    icon: <FileText className="h-5 w-5" />,
    difficulty: 'Beginner',
    lessons: [
      { 
        id: 'resume-basics', 
        title: 'Cover Letter Writing Mastery', 
        type: 'video', 
        duration: '8 min',
        videoUrl: 'https://www.youtube.com/watch?v=-Qw6_okGPnQ',
        description: 'Learn to write an amazing cover letter with a foolproof 3-part structure'
      },
      { 
        id: 'cover-letter', 
        title: 'LinkedIn Profile Optimization', 
        type: 'video', 
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/watch?v=QU5BHmuK140',
        description: 'Complete LinkedIn tutorial for beginners - fix your profile and get noticed'
      },
      { 
        id: 'linkedin-opt', 
        title: 'LinkedIn Job Search Strategy', 
        type: 'video', 
        duration: '10 min',
        videoUrl: 'https://www.youtube.com/watch?v=K6uO-52UHTw',
        description: 'Optimize your LinkedIn profile to attract recruiters and job opportunities'
      },
      { 
        id: 'portfolio', 
        title: 'LinkedIn Success Stories', 
        type: 'video', 
        duration: '15 min',
        videoUrl: 'https://www.youtube.com/watch?v=dQ6RNltrXro',
        description: 'How to optimize LinkedIn profile and get 20+ interview calls'
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
    description: 'Develop communication, teamwork, and workplace skills essential for career success.',
    duration: '2-3 hours',
    videos: 5,
    icon: <Users className="h-5 w-5" />,
    difficulty: 'Intermediate',
    lessons: [
      { 
        id: 'communication', 
        title: 'Workplace Communication Skills', 
        type: 'video', 
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/watch?v=QGHBq5OEsBM',
        description: 'Master effective communication skills in the workplace'
      },
      { 
        id: 'teamwork', 
        title: 'Essential Soft Skills Guide', 
        type: 'video', 
        duration: '10 min',
        videoUrl: 'https://www.youtube.com/watch?v=aRUvhkkcLAQ',
        description: 'Beginner\'s guide to soft skills that boost career success'
      },
      { 
        id: 'time-mgmt', 
        title: '5 Career-Making Soft Skills', 
        type: 'video', 
        duration: '15 min',
        videoUrl: 'https://www.youtube.com/watch?v=cKVSy525qnY',
        description: 'The 5 soft skills that will make or break your career'
      },
      { 
        id: 'leadership', 
        title: 'Communication & Soft Skills Training', 
        type: 'video', 
        duration: '8 min',
        videoUrl: 'https://www.youtube.com/watch?v=olJfMjhNADQ',
        description: 'Communication and soft skills orientation for professionals'
      },
      { 
        id: 'conflict-resolution', 
        title: 'Top 6 Workplace Soft Skills', 
        type: 'video', 
        duration: '6 min',
        videoUrl: 'https://www.youtube.com/watch?v=SFdSUHslLhU',
        description: 'Essential soft skills companies look for in employees'
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
    description: 'Master interview skills with body language tips, mock sessions, and expert guidance.',
    duration: '2-3 hours',
    videos: 5,
    icon: <MessageCircle className="h-5 w-5" />,
    difficulty: 'Intermediate',
    lessons: [
      { 
        id: 'interview-types', 
        title: 'Body Language for Interviews', 
        type: 'video', 
        duration: '8 min',
        videoUrl: 'https://www.youtube.com/watch?v=A9-FzOOWBf4',
        description: 'How to use your hands and body language effectively in job interviews'
      },
      { 
        id: 'common-questions', 
        title: '30-Minute Mock Interview Practice', 
        type: 'video', 
        duration: '30 min',
        videoUrl: 'https://www.youtube.com/watch?v=xVSdSxkj3CQ',
        description: 'Complete mock interview with 9 key questions to boost your skills'
      },
      { 
        id: 'body-language', 
        title: 'Interview Posture Mastery', 
        type: 'video', 
        duration: '5 min',
        videoUrl: 'https://www.youtube.com/watch?v=FiwsWp-stVc',
        description: 'Expert tips on mastering posture for job interviews'
      },
      { 
        id: 'mock-interview', 
        title: 'Power of Body Language', 
        type: 'video', 
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/watch?v=u49t2TYovn4',
        description: 'Understanding how 93% of communication is conveyed through body language'
      },
      { 
        id: 'follow-up', 
        title: 'Complete Interview Analysis', 
        type: 'video', 
        duration: '15 min',
        videoUrl: 'https://www.youtube.com/watch?v=HG68Ymazo18',
        description: 'Top interview tips covering questions, nonverbal communication, and etiquette'
      },
      { id: 'interview-quiz', title: 'Interview Readiness Check', type: 'quiz', duration: '15 min' },
    ]
  },
  {
    id: 'job-search',
    title: 'Job Search Strategies',
    description: 'Learn modern job search strategies, networking tactics, and career advancement tips.',
    duration: '3-4 hours',
    videos: 5,
    icon: <Search className="h-5 w-5" />,
    difficulty: 'Intermediate',
    lessons: [
      { 
        id: 'job-market', 
        title: '5 Modern Job Search Strategies', 
        type: 'video', 
        duration: '18 min',
        videoUrl: 'https://www.youtube.com/watch?v=8OTxZyR3tBE',
        description: '5 job search strategies that actually work in 2025'
      },
      { 
        id: 'networking', 
        title: 'Never Apply for Jobs Again', 
        type: 'video', 
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/watch?v=jqjiWlyfuvE',
        description: 'Weekly habit to attract job opportunities directly to you'
      },
      { 
        id: 'online-applications', 
        title: '2025 Job Search Trends', 
        type: 'video', 
        duration: '15 min',
        videoUrl: 'https://www.youtube.com/watch?v=67lzI0P9V8U',
        description: 'Latest job search advice and new trends for 2025'
      },
      { 
        id: 'referrals', 
        title: 'Salary-Specific Job Strategies', 
        type: 'video', 
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/watch?v=CzRq5zYuP2Y',
        description: 'Job search strategies for $60k, $120k, and $200k+ roles'
      },
      { 
        id: 'salary-negotiation', 
        title: 'Stop Wasting Time on Job Boards', 
        type: 'video', 
        duration: '14 min',
        videoUrl: 'https://www.youtube.com/watch?v=7kE3922CXCk',
        description: '3 job search hacks to avoid common mistakes'
      },
      { id: 'job-search-assignment', title: 'Job Search Plan', type: 'assignment', duration: '60 min' },
    ]
  },
  {
    id: 'workplace-adaptation',
    title: 'Workplace Adaptation',
    description: 'Navigate workplace culture, professional ethics, and modern work environments successfully.',
    duration: '2-3 hours',
    videos: 5,
    icon: <Building className="h-5 w-5" />,
    difficulty: 'Beginner',
    lessons: [
      { 
        id: 'office-culture', 
        title: 'Creating Conducive Work Environment', 
        type: 'video', 
        duration: '12 min',
        videoUrl: 'https://www.youtube.com/watch?v=CTruAWXUKuE',
        description: 'Guide to workplace cultural shifts and adaptation in 2025'
      },
      { 
        id: 'professional-ethics', 
        title: 'Ethical Office Politics', 
        type: 'video', 
        duration: '10 min',
        videoUrl: 'https://www.youtube.com/watch?v=it5MASGR8lA',
        description: 'How to navigate office politics the ethical way and win'
      },
      { 
        id: 'workplace-comm', 
        title: 'Modern Workplace Dynamics', 
        type: 'video', 
        duration: '25 min',
        videoUrl: 'https://www.youtube.com/watch?v=RYYFBR7X8FA',
        description: 'Understanding Gen Z work ethic and modern workplace culture'
      },
      { 
        id: 'first-day', 
        title: 'Psychological Safety at Work', 
        type: 'video', 
        duration: '18 min',
        videoUrl: 'https://www.youtube.com/watch?v=LhoLuui9gX8',
        description: 'Building a psychologically safe workplace environment'
      },
      { 
        id: 'career-growth', 
        title: 'Professional Business Etiquette', 
        type: 'video', 
        duration: '8 min',
        videoUrl: 'https://www.youtube.com/watch?v=8N3RUDDAHto',
        description: 'Corporate etiquette and professional conduct training'
      },
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