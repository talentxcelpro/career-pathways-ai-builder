import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { updateMetaTags } from "@/utils/metaTags";
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
  Play
} from "lucide-react";

// Debug: identify which LearningHub renders
console.info('[LearningHub ROOT] Component file: src/pages/LearningHub.tsx mounted');

export default function LearningHub() {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Learning Hub | TalentXcel',
      description: 'Discover courses, paths and analytics. Start learning with TalentXcel.'
    });
  }, []);
  const stats = [
    {
      title: "Available Courses",
      value: "10",
      description: "Expert-designed courses"
    },
    {
      title: "Learning Paths",
      value: "0",
      description: "Structured journeys"
    },
    {
      title: "Your Streak",
      value: "0 days",
      description: "Keep learning daily"
    },
    {
      title: "Skills Available",
      value: "150+",
      description: "Master new abilities"
    }
  ];

  const learningFeatures = [
    {
      icon: BookOpen,
      title: "10 courses",
      subtitle: "Browse All Courses",
      description: "Explore our comprehensive course catalog with advanced filtering and search",
      link: "/learning/courses",
      color: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/50"
    },
    {
      icon: Target,
      title: "0 paths",
      subtitle: "Learning Paths",
      description: "Structured learning journeys for specific career goals and skills",
      link: "/learning/paths",
      color: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/50"
    },
    {
      icon: TrendingUp,
      title: "Your progress",
      subtitle: "My Learning",
      description: "Track your progress, continue courses, and view achievements",
      link: "/learning/my-courses",
      color: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/50"
    },
    {
      icon: Award,
      title: "Career focused",
      subtitle: "Employment Bridge",
      description: "Job-focused courses and market trends to boost your career prospects",
      link: "/learning/employment-bridge",
      color: "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/50"
    },
    {
      icon: Lightbulb,
      title: "Microlearning",
      subtitle: "Quick Learning",
      description: "Bite-sized lessons, quizzes, and flashcards for learning on the go",
      link: "/learning/quick-learn",
      color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/50"
    },
    {
      icon: BarChart3,
      title: "Data insights",
      subtitle: "Learning Analytics",
      description: "Detailed insights into your learning progress and skill development",
      link: "/learning/analytics",
      color: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/50"
    }
  ];

  const careerPaths = [
    {
      icon: BarChart3,
      title: "Data Science Career Path",
      description: "Master data analysis, visualization, and machine learning",
      color: "text-blue-600"
    },
    {
      icon: Lightbulb,
      title: "AI & Machine Learning",
      description: "Deep dive into artificial intelligence and ML algorithms",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Business & Leadership",
      description: "Develop leadership skills and business acumen",
      color: "text-green-600"
    }
  ];

  const popularCourses = [
    {
      title: "Full Stack Web Development with React & Node.js",
      description: "Master modern web development with React, Node.js, Express, and MongoDB. Build real-world projects and deploy them to production.",
      level: "intermediate",
      students: 1247,
      duration: "120h",
      rating: 4.8
    },
    {
      title: "Data Science & Machine Learning with Python",
      description: "Comprehensive course covering data analysis, visualization, machine learning algorithms, and AI implementation using Python.",
      level: "intermediate",
      students: 892,
      duration: "100h",
      rating: 4.7
    },
    {
      title: "Digital Marketing Mastery",
      description: "Complete digital marketing course covering SEO, social media, content marketing, PPC, email marketing, and analytics.",
      level: "beginner",
      students: 1563,
      duration: "80h",
      rating: 4.9
    }
  ];

  const benefits = [
    "AI-powered career matching",
    "Earn industry-recognized certificates",
    "Learn at your own pace",
    "Job-ready skills for the future"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Welcome back,<br />TalentXcel Pro!
            </h1>
            <p className="text-lg text-muted-foreground">
              Continue your journey to master new skills and advance your career.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Learning Now
              </Button>
              <Button variant="outline" size="lg">
                Explore All Courses
              </Button>
            </div>
            
            {/* Streak Section */}
            <Card className="mt-4 bg-muted/30 border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">You're on a 0-0-day streak</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-sm text-muted-foreground">Complete today's lesson to grow your streak!</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Illustration image */}
          <div className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden border border-border bg-muted">
              <img
                src="/lovable-uploads/d97f4973-604b-4716-b6eb-374c3ee6effb.png"
                alt="TalentXcel learning hero illustration"
                loading="lazy"
                className="w-full h-80 object-contain p-4"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link to="/learning/my-courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-3">My Courses</h3>
              <Button size="sm" variant="outline">Resume</Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/learning/paths">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-3">Learning Paths</h3>
              <Button size="sm" variant="outline">Browse</Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/learning/certificates">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-3">Certificates</h3>
              <Button size="sm" variant="outline">View</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

{/* Stats Section removed to match provided design */}

        {/* Career Paths Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose a path. Advance your future.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {careerPaths.map((path, index) => {
              const IconComponent = path.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-6 flex items-center justify-center">
                      <IconComponent className={`h-8 w-8 ${path.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{path.title}</h3>
                    <p className="text-muted-foreground mb-6">{path.description}</p>
                    <Button className="w-full">
                      {index === 1 ? "Browse" : "Start Path"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

{/* Explore Learning Features removed to match the exact landing design */}

{/* Popular Courses section removed to match design */}

        {/* Why Learn Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why learn with TalentXcel?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-medium mb-2">"TalentXcel helped me land my dream job in 3 months!"</p>
                    <p className="text-sm text-muted-foreground">Ananya, Data Analyst</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Your career transformation starts today.</h2>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" size="lg">
                Start Learning for Free
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}