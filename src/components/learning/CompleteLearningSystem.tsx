import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award, 
  TrendingUp, 
  Target,
  Brain,
  Lightbulb,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
    avatar: string;
    title: string;
  };
  duration: string;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  progress?: number;
  category: string;
  price: number;
  isFree: boolean;
  skills: string[];
  completionRate: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  level: string;
  thumbnail: string;
  progress: number;
  skills: string[];
}

interface CompleteLearningSystemProps {
  className?: string;
}

export const CompleteLearningSystem: React.FC<CompleteLearningSystemProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - in real app, this would come from API
  const [featuredCourses] = useState<Course[]>([
    {
      id: 'course-1',
      title: 'Complete React Development Bootcamp',
      description: 'Master React from basics to advanced concepts with hands-on projects',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop',
      instructor: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60e9077?w=150&h=150&fit=crop',
        title: 'Senior React Developer'
      },
      duration: '40 hours',
      lessons: 120,
      level: 'Intermediate',
      rating: 4.8,
      students: 12400,
      progress: 65,
      category: 'Web Development',
      price: 89.99,
      isFree: false,
      skills: ['React', 'JavaScript', 'TypeScript', 'State Management'],
      completionRate: 85
    },
    {
      id: 'course-2',
      title: 'AI and Machine Learning Fundamentals',
      description: 'Learn the basics of artificial intelligence and machine learning',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop',
      instructor: {
        name: 'Dr. Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        title: 'AI Research Scientist'
      },
      duration: '25 hours',
      lessons: 80,
      level: 'Beginner',
      rating: 4.9,
      students: 8900,
      category: 'Data Science',
      price: 0,
      isFree: true,
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'Neural Networks'],
      completionRate: 78
    },
    {
      id: 'course-3',
      title: 'Product Management Masterclass',
      description: 'Learn product strategy, roadmapping, and team leadership',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
      instructor: {
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        title: 'VP of Product'
      },
      duration: '30 hours',
      lessons: 95,
      level: 'Advanced',
      rating: 4.7,
      students: 5600,
      category: 'Business',
      price: 129.99,
      isFree: false,
      skills: ['Strategy', 'Leadership', 'Analytics', 'User Research'],
      completionRate: 92
    }
  ]);

  const [learningPaths] = useState<LearningPath[]>([
    {
      id: 'path-1',
      title: 'Full-Stack Developer',
      description: 'Complete journey from frontend to backend development',
      courses: 8,
      duration: '6 months',
      level: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop',
      progress: 45,
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker']
    },
    {
      id: 'path-2',
      title: 'Data Science & Analytics',
      description: 'Master data analysis, visualization, and machine learning',
      courses: 6,
      duration: '4 months',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
      progress: 20,
      skills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Statistics']
    },
    {
      id: 'path-3',
      title: 'Digital Marketing Expert',
      description: 'Learn SEO, social media, content marketing, and analytics',
      courses: 5,
      duration: '3 months',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop',
      progress: 70,
      skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics', 'PPC']
    }
  ]);

  const [stats] = useState({
    coursesCompleted: 12,
    hoursLearned: 240,
    skillsAcquired: 35,
    certificatesEarned: 8,
    currentStreak: 15,
    totalPoints: 5420
  });

  const handleStartCourse = (courseId: string) => {
    navigate(`/learning/courses/${courseId}`);
  };

  const handleStartPath = (pathId: string) => {
    navigate(`/learning/paths/${pathId}`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Hub</h1>
          <p className="text-muted-foreground">Advance your career with expert-led courses</p>
        </div>
        <Button onClick={() => navigate('/learning/my-courses')}>
          <BookOpen className="w-4 h-4 mr-2" />
          My Courses
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="skills">Skill Assessment</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Learning Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{stats.coursesCompleted}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Hours</p>
                  <p className="text-xl font-bold">{stats.hoursLearned}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <p className="text-xl font-bold">{stats.skillsAcquired}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="text-xl font-bold">{stats.certificatesEarned}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-xl font-bold">{stats.currentStreak}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-xl font-bold">{stats.totalPoints}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Continue Learning */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
            <div className="grid gap-4">
              {featuredCourses.filter(course => course.progress).map((course) => (
                <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">{course.instructor.name}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={course.progress} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                  </div>
                  <Button onClick={() => handleStartCourse(course.id)}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Courses */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended for You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCourses.filter(course => !course.progress).map((course) => (
                <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={course.isFree ? 'secondary' : 'default'}>
                        {course.isFree ? 'Free' : `$${course.price}`}
                      </Badge>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <h4 className="font-medium line-clamp-2 mb-2">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{course.instructor.name}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{course.rating}</span>
                      </span>
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <Button 
                      className="w-full" 
                      variant={course.isFree ? 'default' : 'outline'}
                      onClick={() => handleStartCourse(course.id)}
                    >
                      {course.isFree ? 'Start Free' : 'Enroll Now'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Courses</h3>
              <Button onClick={() => navigate('/learning/comprehensive-courses')}>
                View All Courses
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={course.isFree ? 'secondary' : 'default'}>
                        {course.isFree ? 'Free' : `$${course.price}`}
                      </Badge>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <h4 className="font-medium line-clamp-2 mb-2">{course.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.lessons} lessons</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartCourse(course.id)}
                    >
                      {course.progress ? 'Continue' : 'Start Course'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Learning Paths</h3>
              <Button onClick={() => navigate('/learning/paths')}>
                View All Paths
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <div key={path.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={path.thumbnail} 
                    alt={path.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default">{path.level}</Badge>
                      <span className="text-sm text-muted-foreground">{path.duration}</span>
                    </div>
                    <h4 className="font-medium mb-2">{path.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span>{path.courses} courses</span>
                      <span>{path.skills.length} skills</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Progress value={path.progress} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{path.progress}%</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartPath(path.id)}
                    >
                      {path.progress > 0 ? 'Continue Path' : 'Start Path'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Skill Assessment</h3>
            <div className="text-center">
              <Lightbulb className="w-16 h-16 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Discover Your Skills</h4>
              <p className="text-muted-foreground mb-6">
                Take our comprehensive skill assessment to identify your strengths and areas for improvement
              </p>
              <Button onClick={() => navigate('/learning/skill-assessment')}>
                Start Assessment
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
            <div className="text-center">
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Unlock Achievements</h4>
              <p className="text-muted-foreground mb-6">
                Complete courses and learning paths to earn certificates and badges
              </p>
              <Button onClick={() => navigate('/learning/certificates')}>
                View Certificates
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};