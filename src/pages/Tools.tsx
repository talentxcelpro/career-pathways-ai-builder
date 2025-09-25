import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppleToolsGrid } from '@/components/tools/AppleToolsGrid';
import { GameProgressHeader } from '@/components/tools/GameProgressHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { updateMetaTags } from '@/utils/metaTags';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  Brain, 
  Calculator, 
  FileText, 
  Users, 
  TrendingUp, 
  Target,
  BookOpen,
  MessageSquare,
  BarChart3,
  Briefcase,
  User,
  Award,
  Shield,
  ArrowRightLeft,
  Video,
  Send,
  DollarSign,
  Network,
  Edit3,
  Scissors,
  PieChart
} from "lucide-react";

interface AppleTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPremium: boolean;
  estimatedTime: string;
  path: string;
  txcCost?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredCompletions?: number;
}

const Tools = () => {
  const { user } = useAuth();
  const { availableBalance, lifetimeEarned } = useTokenBalance();
  const [completedTools, setCompletedTools] = useState<string[]>([]);

  // Get profile data for user greeting
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      return profileData;
    },
    enabled: !!user?.id
  });

  // Get user's first name from multiple sources
  const getUserFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  // SEO meta tags
  useEffect(() => {
    updateMetaTags({
      title: 'Apple-Inspired Career Tools | TalentXcel',
      description: 'Experience gamified career development with our Apple-inspired tools. Unlock features by completing tasks and earning TXC tokens.',
      url: `${window.location.origin}/tools`,
      keywords: ['career tools', 'gamified learning', 'Apple design', 'TXC tokens'],
      type: 'website'
    });
  }, []);

  // Apple-inspired tools configuration
  const appleTools: AppleTool[] = [
    {
      id: 'ai-resume-builder',
      name: 'AI Resume Builder',
      description: 'Create professional resumes with AI assistance and ATS optimization',
      icon: <FileText className="h-6 w-6" />,
      category: 'resume',
      isPremium: false,
      estimatedTime: '10-15 min',
      path: '/tools/ai-resume-builder',
      difficulty: 'beginner',
    },
    {
      id: 'salary-analyzer',
      name: 'Salary Analyzer',
      description: 'Get accurate salary insights and market analysis for your role',
      icon: <Calculator className="h-6 w-6" />,
      category: 'analytics',
      isPremium: false,
      estimatedTime: '5-8 min',
      path: '/tools/salary-analyzer',
      difficulty: 'beginner',
    },
    {
      id: 'interview-prep',
      name: 'Interview Prep Coach',
      description: 'Practice interviews with AI feedback and industry-specific questions',
      icon: <MessageSquare className="h-6 w-6" />,
      category: 'interview',
      isPremium: false,
      estimatedTime: '20-30 min',
      path: '/tools/interview-prep',
      difficulty: 'beginner',
    },
    {
      id: 'skill-assessor',
      name: 'Skill Assessor',
      description: 'Assess your skills and get recommendations for improvement',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'skills',
      isPremium: false,
      estimatedTime: '12-18 min',
      path: '/tools/skill-assessor',
      difficulty: 'beginner',
    },
    {
      id: 'network-builder',
      name: 'Network Builder',
      description: 'Build and expand your professional network strategically',
      icon: <Users className="h-6 w-6" />,
      category: 'networking',
      isPremium: false,
      estimatedTime: '8-12 min',
      path: '/tools/network-builder',
      difficulty: 'beginner',
    },
    {
      id: 'career-pathfinder',
      name: 'Career Pathfinder',
      description: 'Discover your ideal career path with personalized insights',
      icon: <Target className="h-6 w-6" />,
      category: 'career',
      isPremium: false,
      estimatedTime: '15-20 min',
      path: '/tools/career-pathfinder',
      difficulty: 'beginner',
    },
    // Page 2 tools (unlocked after completing 3 from page 1)
    {
      id: 'ai-job-match-gpt',
      name: 'AI Job Match GPT',
      description: 'Find perfect job matches using advanced AI matching algorithms',
      icon: <Briefcase className="h-6 w-6" />,
      category: 'job-search',
      isPremium: true,
      estimatedTime: '5-10 min',
      path: '/tools/ai-job-match-gpt',
      txcCost: 30,
      difficulty: 'intermediate',
      requiredCompletions: 3,
    },
    {
      id: 'cover-letter-generator',
      name: 'Cover Letter AI',
      description: 'Generate compelling cover letters tailored to specific job applications',
      icon: <Edit3 className="h-6 w-6" />,
      category: 'profile',
      isPremium: false,
      estimatedTime: '8-12 min',
      path: '/tools/cover-letter-generator',
      difficulty: 'intermediate',
      requiredCompletions: 3,
    },
    {
      id: 'career-growth-score',
      name: 'Career Growth Score',
      description: 'Analyze your career progress and get actionable growth recommendations',
      icon: <Award className="h-6 w-6" />,
      category: 'analytics',
      isPremium: false,
      estimatedTime: '5-8 min',
      path: '/tools/career-growth-score',
      difficulty: 'intermediate',
      requiredCompletions: 3,
    },
    {
      id: 'mock-interview-simulator',
      name: 'AI Interview Coach',
      description: 'Practice interviews with AI-powered simulation and detailed feedback',
      icon: <Video className="h-6 w-6" />,
      category: 'interview',
      isPremium: true,
      estimatedTime: '20-30 min',
      path: '/tools/mock-interview-simulator',
      txcCost: 40,
      difficulty: 'advanced',
      requiredCompletions: 3,
    },
    {
      id: 'ai-learning-path-generator',
      name: 'Learning Path AI',
      description: 'Create personalized learning paths to advance your skills and career',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'skills',
      isPremium: false,
      estimatedTime: '12-18 min',
      path: '/tools/ai-learning-path-generator',
      difficulty: 'intermediate',
      requiredCompletions: 3,
    },
    {
      id: 'professional-bio-writer',
      name: 'Bio Writer Pro',
      description: 'Craft compelling professional bios for LinkedIn and other platforms',
      icon: <User className="h-6 w-6" />,
      category: 'profile',
      isPremium: false,
      estimatedTime: '6-10 min',
      path: '/tools/professional-bio-writer',
      difficulty: 'intermediate',
      requiredCompletions: 3,
    }
  ];

  // Load completed tools from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedTools');
    if (saved) {
      setCompletedTools(JSON.parse(saved));
    }
  }, []);

  const handleToolComplete = (toolId: string) => {
    const newCompleted = [...completedTools, toolId];
    setCompletedTools(newCompleted);
    localStorage.setItem('completedTools', JSON.stringify(newCompleted));
  };

  // Get user stats for header
  const userLevel = Math.floor(completedTools.length / 3) + 1;
  const currentStreak = 7; // This would come from actual streak tracking
  const nextLevelProgress = ((completedTools.length % 3) / 3) * 100;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Game Progress Header */}
          <GameProgressHeader
            userName={getUserFirstName()}
            totalTools={appleTools.length}
            completedTools={completedTools.length}
            currentStreak={currentStreak}
            totalTXC={lifetimeEarned || 0}
            userLevel={userLevel}
            nextLevelProgress={nextLevelProgress}
          />

          {/* Apple Tools Grid */}
          <AppleToolsGrid
            tools={appleTools}
            completedTools={completedTools}
            onToolComplete={handleToolComplete}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default Tools;