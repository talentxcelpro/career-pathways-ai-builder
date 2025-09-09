import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { updateMetaTags } from "@/utils/metaTags";
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useLearningData } from '@/hooks/useLearningData';
import { 
  BookOpen, 
  Target, 
  Award, 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  Users,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Play,
  Zap,
  BrainCircuit,
  Briefcase
} from "lucide-react";

export default function LearningHub() {
  const { displayName, streakDays } = useCurrentUserProfile();
  const { courses, learningPaths, isLoading } = useLearningData();
  
  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Hub | TalentXcel',
      description: 'Your comprehensive learning platform with courses, paths, and employment bridge features.'
    });
  }, []);

  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'Learner';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'Learner';
    }
    return displayName;
  }, [displayName]);

  const stats = [
    {
      title: "Available Courses",
      value: courses?.length || 0,
      description: "Expert-designed courses",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Learning Paths",
      value: learningPaths?.length || 0,
      description: "Structured journeys",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Your Streak",
      value: `${streakDays} days`,
      description: "Keep learning daily",
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Skills Available",
      value: "150+",
      description: "Master new abilities",
      icon: BrainCircuit,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    }
  ];

  const learningFeatures = [
    {
      icon: BookOpen,
      title: "Browse All Courses",
      subtitle: `${courses?.length || 0} courses available`,
      description: "Explore our comprehensive course catalog with advanced filtering and search",
      link: "/learning/courses",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30",
      iconColor: "text-blue-600"
    },
    {
      icon: Target,
      title: "Learning Paths",
      subtitle: `${learningPaths?.length || 0} structured paths`,
      description: "Follow guided learning journeys for specific career goals and skills",
      link: "/learning/paths",
      color: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30",
      iconColor: "text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "My Learning",
      subtitle: "Track your progress",
      description: "Continue courses, view achievements, and monitor your learning journey",
      link: "/learning/my-courses",
      color: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30",
      iconColor: "text-green-600"
    },
    {
      icon: Briefcase,
      title: "Employment Bridge",
      subtitle: "Career-focused learning",
      description: "Job-focused courses and market trends to boost your career prospects",
      link: "/learning/employment-bridge",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30",
      iconColor: "text-orange-600"
    },
    {
      icon: Zap,
      title: "Quick Learning",
      subtitle: "Microlearning sessions",
      description: "Bite-sized lessons, quizzes, and flashcards for learning on the go",
      link: "/learning/quick-learn",
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/30",
      iconColor: "text-yellow-600"
    },
    {
      icon: BarChart3,
      title: "Learning Analytics",
      subtitle: "Data-driven insights",
      description: "Detailed insights into your learning progress and skill development",
      link: "/learning/analytics",
      color: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/30",
      iconColor: "text-indigo-600"
    }
  ];

  const popularCourses = [
    {
      title: "Full Stack Web Development",
      description: "Master React, Node.js, and modern web technologies",
      level: "Intermediate",
      students: 1247,
      duration: "120h",
      rating: 4.8
    },
    {
      title: "Data Science & ML with Python",
      description: "Learn data analysis, visualization, and machine learning",
      level: "Intermediate", 
      students: 892,
      duration: "100h",
      rating: 4.7
    },
    {
      title: "Digital Marketing Mastery",
      description: "Complete guide to SEO, social media, and online marketing",
      level: "Beginner",
      students: 1563,
      duration: "80h", 
      rating: 4.9
    }
  ];

  const benefits = [
    "AI-powered career matching",
    "Industry-recognized certificates", 
    "Learn at your own pace",
    "Job-ready skills for the future"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Welcome back,<br />
                <span className="text-primary">{friendlyName}!</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Continue your journey to master new skills and advance your career with TalentXcel Learning.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/learning/courses">
                <Button size="lg" className="w-full sm:w-auto">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning Now
                </Button>
              </Link>
              <Link to="/learning/paths">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Target className="h-4 w-4 mr-2" />
                  Explore Paths
                </Button>
              </Link>
            </div>
            
            {/* Streak Card */}
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500 rounded-full">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      {streakDays}-day learning streak
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {streakDays > 0 ? "Keep it up!" : "Start your streak today!"}
                    </p>
                  </div>
                </div>
                <Progress value={Math.min(streakDays * 10, 100)} className="h-2" />
              </CardContent>
            </Card>
          </div>
          
          {/* Hero Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden border border-border bg-muted/30">
              <img
                src="/lovable-uploads/d97f4973-604b-4716-b6eb-374c3ee6effb.png"
                alt="TalentXcel learning illustration"
                loading="lazy"
                className="w-full h-80 object-contain p-6"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {stat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning Features */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Explore Learning Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover all the tools and resources available to accelerate your learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link key={index} to={feature.link}>
                  <Card className={`${feature.color} border-0 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                          <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-primary">
                        Explore <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Courses</h2>
              <p className="text-muted-foreground">
                Start with these highly-rated courses from our catalog
              </p>
            </div>
            <Link to="/learning/courses">
              <Button variant="outline">
                View All Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularCourses.map((course, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{course.level}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({course.students} students)
                        </span>
                      </div>
                      <Button size="sm">Enroll</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Learn Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why learn with TalentXcel?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-medium mb-2 text-foreground">
                      "TalentXcel helped me land my dream job in just 3 months!"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ananya Singh, Data Analyst at TechCorp
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Your career transformation starts today.
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Join thousands of learners who have advanced their careers with TalentXcel. 
              Start your journey with our comprehensive learning platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/learning/courses">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning for Free
                </Button>
              </Link>
              <Link to="/learning/employment-bridge">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Explore Career Paths
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}