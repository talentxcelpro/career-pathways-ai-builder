
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SearchAndFilters } from "@/components/learning/SearchAndFilters";
import { LearningHeader } from "@/components/learning/LearningHeader";
import { LearningTabs } from "@/components/learning/LearningTabs";
import { StatsCard } from "@/components/ui/stats-card";
import { ActionCard } from "@/components/ui/action-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Play,
  Zap,
  Activity,
  GraduationCap,
  Brain
} from "lucide-react";
import { Link } from 'react-router-dom';

const Learning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('courses');

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch learning paths
  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's enrolled courses
  const { data: userCourses = [] } = useQuery({
    queryKey: ['user_courses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_courses')
        .select('*, courses(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to enroll in courses');
        return;
      }

      const { error } = await supabase
        .from('user_courses')
        .insert({ user_id: user.id, course_id: courseId });

      if (error) throw error;
      toast.success('Successfully enrolled in course!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll in course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
  const isEnrolled = (courseId: string) => userCourses.some(uc => uc.course_id === courseId);

  const stats = [
    { 
      title: "Courses", 
      value: courses.length.toString(), 
      subtitle: "Available now",
      icon: BookOpen, 
      trend: { value: "+5 new", isPositive: true },
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      title: "Enrolled", 
      value: userCourses.length.toString(), 
      subtitle: "Active learning",
      icon: Play, 
      trend: { value: `${Math.round(userCourses.reduce((acc, course) => acc + (course.progress_percentage || 0), 0) / userCourses.length || 0)}% avg`, isPositive: true },
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      title: "Completed", 
      value: userCourses.filter(course => course.completed_at).length.toString(), 
      subtitle: "Certificates earned",
      icon: Trophy, 
      trend: { value: "+2 this month", isPositive: true },
      gradient: "from-purple-500 to-indigo-600"
    },
    { 
      title: "Study Time", 
      value: "24h", 
      subtitle: "This month",
      icon: Clock, 
      trend: { value: "+15%", isPositive: true },
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const quickActions = [
    {
      title: "Browse Courses",
      description: "Explore our comprehensive course catalog",
      icon: BookOpen,
      path: "/learning",
      gradient: "from-blue-500 to-purple-500",
      featured: true,
      badge: "Popular"
    },
    {
      title: "Learning Paths",
      description: "Structured learning journeys for career goals",
      icon: Target,
      path: "/learning/paths",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "My Progress",
      description: "Track your learning achievements",
      icon: TrendingUp,
      path: "/learning/my-courses",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "AI Recommendations",
      description: "Personalized course suggestions",
      icon: Sparkles,
      path: "/learning",
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Learning & Development Hub</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-6">
              Accelerate your career with industry-leading courses and certifications
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Zap className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Activity className="h-4 w-4 mr-2" />
                View Progress
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Learning Pathways</h2>
              <p className="text-sm text-gray-600">Choose your learning journey</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 text-xs">4 Categories</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
                onClick={() => {
                  if (action.title === "Browse Courses") {
                    setActiveTab('courses');
                  } else if (action.title === "My Progress") {
                    setActiveTab('my-learning');
                  } else if (action.title === "Learning Paths") {
                    setActiveTab('paths');
                  } else {
                    window.location.href = action.path;
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm mb-6">
          <CardContent className="p-6">
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              categories={categories}
            />
          </CardContent>
        </Card>

        {/* Learning Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm mb-8">
          <CardContent className="p-6">
            <LearningTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredCourses={filteredCourses}
              coursesLoading={coursesLoading}
              learningPaths={learningPaths}
              pathsLoading={pathsLoading}
              userCourses={userCourses}
              isEnrolled={isEnrolled}
              enrollInCourse={enrollInCourse}
            />
          </CardContent>
        </Card>

        {/* Enhanced CTA */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white border-0 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative z-10 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Ready to Level Up Your Skills?</h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals advancing their careers through continuous learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => setActiveTab('courses')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
              <Link to="/learning/certificates">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  <Award className="h-4 w-4 mr-2" />
                  View Certificates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning;
