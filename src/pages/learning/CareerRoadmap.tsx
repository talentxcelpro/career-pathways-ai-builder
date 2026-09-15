import React, { useState } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Target, Clock, Star, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';

const CareerRoadmap = () => {
  const [selectedPath, setSelectedPath] = useState('frontend');

  React.useEffect(() => {
    updateMetaTags({
      title: 'Career Roadmap | TalentXcel Learning',
      description: 'Personalized career planning with step-by-step roadmaps to your dream job.'
    });
  }, []);

  // Mock roadmap data
  const careerPaths = {
    frontend: {
      title: 'Frontend Developer',
      description: 'Build beautiful, interactive user interfaces',
      currentLevel: 'Intermediate',
      targetRole: 'Senior Frontend Developer',
      progress: 65,
      timeToGoal: '8-12 months',
      averageSalary: '$85,000',
      phases: [
        {
          id: 1,
          title: 'Foundation',
          status: 'completed',
          duration: '2-3 months',
          skills: ['HTML', 'CSS', 'JavaScript'],
          courses: ['Web Development Basics', 'JavaScript Fundamentals'],
          completed: true
        },
        {
          id: 2,
          title: 'Framework Mastery',
          status: 'in-progress',
          duration: '3-4 months',
          skills: ['React', 'TypeScript', 'State Management'],
          courses: ['React Advanced', 'TypeScript Essentials', 'Redux Toolkit'],
          completed: false,
          currentProgress: 70
        },
        {
          id: 3,
          title: 'Advanced Concepts',
          status: 'upcoming',
          duration: '2-3 months',
          skills: ['Performance', 'Testing', 'Build Tools'],
          courses: ['React Performance', 'Testing with Jest', 'Webpack & Vite'],
          completed: false
        },
        {
          id: 4,
          title: 'Senior Skills',
          status: 'upcoming',
          duration: '2-4 months',
          skills: ['Architecture', 'Mentoring', 'System Design'],
          courses: ['Frontend Architecture', 'Team Leadership', 'System Design'],
          completed: false
        }
      ]
    },
    fullstack: {
      title: 'Full Stack Developer',
      description: 'Master both frontend and backend development',
      currentLevel: 'Beginner',
      targetRole: 'Full Stack Developer',
      progress: 35,
      timeToGoal: '12-18 months',
      averageSalary: '$95,000',
      phases: [
        {
          id: 1,
          title: 'Frontend Foundation',
          status: 'completed',
          duration: '3-4 months',
          skills: ['HTML', 'CSS', 'JavaScript', 'React'],
          courses: ['Web Basics', 'React Fundamentals'],
          completed: true
        },
        {
          id: 2,
          title: 'Backend Fundamentals',
          status: 'in-progress',
          duration: '4-5 months',
          skills: ['Node.js', 'Express', 'Databases'],
          courses: ['Node.js Backend', 'Database Design', 'API Development'],
          completed: false,
          currentProgress: 40
        },
        {
          id: 3,
          title: 'Full Stack Integration',
          status: 'upcoming',
          duration: '3-4 months',
          skills: ['Authentication', 'Deployment', 'DevOps'],
          courses: ['Auth Systems', 'Cloud Deployment', 'CI/CD Basics'],
          completed: false
        },
        {
          id: 4,
          title: 'Advanced Full Stack',
          status: 'upcoming',
          duration: '2-5 months',
          skills: ['Microservices', 'Scalability', 'Architecture'],
          courses: ['Microservices', 'System Scaling', 'Architecture Patterns'],
          completed: false
        }
      ]
    },
    datascience: {
      title: 'Data Scientist',
      description: 'Extract insights from data using advanced analytics',
      currentLevel: 'Beginner',
      targetRole: 'Data Scientist',
      progress: 25,
      timeToGoal: '15-20 months',
      averageSalary: '$110,000',
      phases: [
        {
          id: 1,
          title: 'Programming Foundation',
          status: 'in-progress',
          duration: '2-3 months',
          skills: ['Python', 'Statistics', 'SQL'],
          courses: ['Python for Data', 'Statistics Basics', 'SQL Mastery'],
          completed: false,
          currentProgress: 60
        },
        {
          id: 2,
          title: 'Data Analysis',
          status: 'upcoming',
          duration: '4-5 months',
          skills: ['Pandas', 'NumPy', 'Visualization'],
          courses: ['Data Manipulation', 'Data Visualization', 'EDA Techniques'],
          completed: false
        },
        {
          id: 3,
          title: 'Machine Learning',
          status: 'upcoming',
          duration: '5-6 months',
          skills: ['ML Algorithms', 'Scikit-learn', 'Model Evaluation'],
          courses: ['ML Fundamentals', 'Supervised Learning', 'Unsupervised Learning'],
          completed: false
        },
        {
          id: 4,
          title: 'Advanced ML & AI',
          status: 'upcoming',
          duration: '4-6 months',
          skills: ['Deep Learning', 'NLP', 'Computer Vision'],
          courses: ['Neural Networks', 'NLP with Python', 'Computer Vision'],
          completed: false
        }
      ]
    }
  };

  const currentPath = careerPaths[selectedPath as keyof typeof careerPaths];

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'upcoming': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Target className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Clock className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Roadmap</h1>
            <p className="text-gray-600">
              Personalized career planning with step-by-step guidance
            </p>
          </div>
        </div>

        {/* Career Path Selector */}
        <Tabs value={selectedPath} onValueChange={setSelectedPath} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="frontend">Frontend Developer</TabsTrigger>
            <TabsTrigger value="fullstack">Full Stack Developer</TabsTrigger>
            <TabsTrigger value="datascience">Data Scientist</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Career Overview */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Current Path</h3>
                <p className="text-2xl font-bold text-blue-600">{currentPath.title}</p>
                <p className="text-sm text-gray-600">{currentPath.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Progress</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={currentPath.progress} className="flex-1 h-3" />
                  <span className="text-sm font-medium">{currentPath.progress}%</span>
                </div>
                <p className="text-xs text-gray-600">{currentPath.currentLevel} Level</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Time to Goal</h3>
                <p className="text-xl font-bold text-green-600">{currentPath.timeToGoal}</p>
                <p className="text-xs text-gray-600">Estimated completion</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Salary Potential</h3>
                <p className="text-xl font-bold text-purple-600">{currentPath.averageSalary}</p>
                <p className="text-xs text-gray-600">Average market rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Phases */}
        <div className="space-y-6">
          {currentPath.phases.map((phase, index) => (
            <Card key={phase.id} className={`border-l-4 ${
              phase.status === 'completed' ? 'border-l-green-500' :
              phase.status === 'in-progress' ? 'border-l-blue-500' : 'border-l-gray-300'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPhaseIcon(phase.status)}
                    <div>
                      <CardTitle className="text-lg">
                        Phase {phase.id}: {phase.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{phase.duration}</p>
                    </div>
                  </div>
                  <Badge className={getPhaseStatusColor(phase.status)}>
                    {phase.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Skills to Learn
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {phase.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Courses */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Recommended Courses
                    </h4>
                    <ul className="space-y-1">
                      {phase.courses.map((course, courseIndex) => (
                        <li key={courseIndex} className="text-sm text-gray-600 flex items-center">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    {phase.status === 'in-progress' && phase.currentProgress && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current Progress</span>
                          <span>{phase.currentProgress}%</span>
                        </div>
                        <Progress value={phase.currentProgress} className="h-2" />
                      </div>
                    )}
                    
                    {phase.status === 'completed' ? (
                      <Button variant="outline" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </Button>
                    ) : phase.status === 'in-progress' ? (
                      <Button className="w-full">
                        Continue Learning
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Next
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Roadmap Tips */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Roadmap Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Focus on completing one phase at a time for better retention</li>
                  <li>• Practice building projects alongside theoretical learning</li>
                  <li>• Join communities and find mentors in your chosen field</li>
                  <li>• Regularly update your portfolio with new skills and projects</li>
                  <li>• Consider industry certifications to validate your expertise</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerRoadmap;