import React, { useState } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningFilters } from './LearningFilters';
import { AIRecommendations } from './AIRecommendations';
import { SkillBasedLearning } from './SkillBasedLearning';
import { CommunityLearning } from './CommunityLearning';
import { TrendingCourses } from './TrendingCourses';
import { CourseCard } from './CourseCard';
import { GamificationDashboard } from '../gamification/GamificationDashboard';
import { LearningPathVisualizer } from '../path-visualizer/LearningPathVisualizer';
import { PersonalizedDashboard } from '../personalized/PersonalizedDashboard';
import { MicrolearningHub } from '../microlearning/MicrolearningHub';
import { useLearningData } from '@/hooks/useLearningData';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Trophy, 
  BookOpen, 
  Zap, 
  User,
  TrendingUp,
  Users,
  Sparkles
} from 'lucide-react';

export const LearningDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const {
    filteredCourses,
    filteredLearningPaths,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    isLoading
  } = useLearningData();
  const { displayName, streakDays } = useCurrentUserProfile();
  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'Learner';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'Learner';
    }
    return displayName;
  }, [displayName]);

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
  };

  const handleWishlist = (courseId: string) => {
    setWishlist(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Mock data for new features
  const mockUserStats = {
    level: 15,
    xp: 2450,
    xpToNext: 550,
    currentStreak: 7,
    longestStreak: 21,
    badges: [
      { id: '1', name: 'Fast Learner', description: 'Complete 5 courses in a week', icon: 'sparkles', rarity: 'rare' as const, unlockedAt: new Date() },
      { id: '2', name: 'Code Master', description: 'Master JavaScript fundamentals', icon: 'trophy', rarity: 'epic' as const, unlockedAt: new Date() },
      { id: '3', name: 'Consistency King', description: '30-day learning streak', icon: 'crown', rarity: 'legendary' as const },
    ],
    weeklyGoal: { target: 10, current: 7 },
    leaderboardRank: 42
  };

  const mockUserData = {
    name: friendlyName,
    currentStreak: streakDays,
    weeklyGoal: { target: 10, current: 7 },
    dailyGoal: { target: 2, current: 1.5 },
    skillGaps: [
      { skill: 'React Hooks', currentLevel: 3, targetLevel: 5, priority: 'high' as const },
      { skill: 'TypeScript', currentLevel: 2, targetLevel: 4, priority: 'medium' as const },
    ],
    upcomingDeadlines: [
      { title: 'JavaScript Project', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), type: 'assignment' as const },
    ],
    recommendations: [
      { title: 'Advanced React Patterns', reason: 'Based on your React progress', type: 'course' as const, duration: '4 hours' },
    ],
    recentActivity: [
      { action: 'Completed lesson', item: 'React State Management', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ]
  };

  const mockPathData = {
    id: 'react-path',
    title: 'Full Stack React Developer',
    description: 'Master React, Node.js, and modern web development',
    totalCourses: 8,
    completedCourses: 3,
    estimatedHours: 120,
    courses: [
      {
        id: 'react-basics',
        title: 'React Fundamentals',
        description: 'Learn the basics of React',
        duration: 15,
        difficulty: 'Beginner' as const,
        status: 'completed' as const,
        rating: 4.8,
        prerequisites: [],
        position: { x: 100, y: 100 }
      },
      {
        id: 'react-hooks',
        title: 'React Hooks Deep Dive',
        description: 'Master React Hooks',
        duration: 20,
        difficulty: 'Intermediate' as const,
        status: 'in-progress' as const,
        progress: 65,
        rating: 4.9,
        prerequisites: ['react-basics'],
        position: { x: 300, y: 100 }
      },
      {
        id: 'react-advanced',
        title: 'Advanced React Patterns',
        description: 'Learn advanced React concepts',
        duration: 25,
        difficulty: 'Advanced' as const,
        status: 'locked' as const,
        rating: 4.7,
        prerequisites: ['react-hooks'],
        position: { x: 500, y: 100 }
      }
    ]
  };

  const mockMicrolearning = {
    quickLessons: [
      {
        id: '1',
        title: 'Arrow Functions in 5 Minutes',
        description: 'Quick refresher on ES6 arrow functions',
        duration: 5,
        difficulty: 'easy' as const,
        category: 'JavaScript',
        completed: true,
        xpReward: 50
      },
      {
        id: '2',
        title: 'CSS Flexbox Basics',
        description: 'Master flexbox layout in minutes',
        duration: 8,
        difficulty: 'medium' as const,
        category: 'CSS',
        completed: false,
        xpReward: 75
      }
    ],
    quizzes: [
      {
        id: '1',
        title: 'React Hooks Quiz',
        questions: 10,
        timeLimit: 15,
        category: 'React',
        difficulty: 'medium' as const,
        highScore: 85,
        attempts: 3
      }
    ],
    flashcards: [
      {
        id: '1',
        topic: 'JavaScript Keywords',
        cardCount: 25,
        category: 'JavaScript',
        reviewSchedule: 'due' as const,
        nextReview: new Date()
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Don't change */}
      <LearningHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Learning Paths
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="microlearning" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Learn
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>


          <TabsContent value="dashboard">
            <PersonalizedDashboard userData={mockUserData} />
          </TabsContent>

          <TabsContent value="paths">
            <LearningPathVisualizer pathData={mockPathData} />
          </TabsContent>

          <TabsContent value="gamification">
            <GamificationDashboard userStats={mockUserStats} />
          </TabsContent>

          <TabsContent value="microlearning">
            <MicrolearningHub {...mockMicrolearning} />
          </TabsContent>

          <TabsContent value="community">
            <CommunityLearning 
              courses={filteredCourses.filter(course => course.enrolled_count > 100)}
              onEnroll={handleEnroll}
              onWishlist={handleWishlist}
              enrolledCourses={enrolledCourses}
              wishlist={wishlist}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};