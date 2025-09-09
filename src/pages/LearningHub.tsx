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
    if (!displayName) return 'TalentXcel Pro';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'TalentXcel Pro';
    }
    return displayName;
  }, [displayName]);

  const quickActions = [
    {
      icon: BookOpen,
      title: "My Courses",
      action: "Resume",
      link: "/learning/my-courses"
    },
    {
      icon: Target, 
      title: "Learning Paths",
      action: "Browse",
      link: "/learning/paths"
    },
    {
      icon: Award,
      title: "Certificates", 
      action: "View",
      link: "/learning/certificates"
    }
  ];

  const careerPaths = [
    {
      icon: BarChart3,
      title: "Data Science Career Path",
      color: "bg-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: BrainCircuit,
      title: "AI & Machine Learning",
      color: "bg-purple-500", 
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: Briefcase,
      title: "Business & Leadership",
      color: "bg-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20"
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
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Welcome back,<br />
                <span className="text-primary">{friendlyName}!</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Continue your journey to master new skills and advance your career.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/learning/courses">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  Start Learning Now
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore All Courses
              </Button>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/lovable-uploads/ffceb438-8aed-4f19-80ea-0dfef909096d.png"
                alt="Learning illustration"
                className="w-full max-w-md h-auto"
              />
            </div>
          </div>
        </div>

        {/* Streak Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-6 bg-orange-500 rounded-full"></div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${Math.min((streakDays / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-foreground font-medium">
            You're on a {streakDays}-day streak
          </p>
          <p className="text-muted-foreground text-sm">
            Complete today's lesson to grow your streak!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                    <Button variant="outline" className="mt-2">
                      {action.action}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Choose a Path Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Choose a path. Advance your future.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {careerPaths.map((path, index) => {
              const IconComponent = path.icon;
              return (
                <Card key={index} className={`${path.bgColor} border-0 hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 ${path.color} rounded-lg flex items-center justify-center mx-auto mb-6`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-6">{path.title}</h3>
                    <Button className={`${path.color} hover:opacity-90`}>
                      {index === 1 ? "Browse" : "Start Path"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why Learn Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Why learn with TalentXcel?</h2>
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
                  <span className="text-primary-foreground font-semibold text-lg">A</span>
                </div>
                <div>
                  <p className="font-medium mb-2 text-foreground">
                    TalentXcel helped me land my dream job in 3 months!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ananya, Data Analyst
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Your career transformation starts today.
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                Start Learning for Free
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}