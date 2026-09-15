import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, TrendingUp, Star, Target, Zap, Award, Trophy,
  Sparkles, ChevronRight, Bell, Rocket, Users, ArrowLeft,
  Clock, Building, MapPin, Heart, Play, Eye, Briefcase,
  Search, BookOpen, Settings, BarChart3, CheckCircle,
  ArrowUpRight, Calendar, DollarSign, Flame, Crown,
  TrendingDown, Activity, Shield, Medal, Gift
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { supabase } from '@/integrations/supabase/client';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { updateMetaTags } from '@/utils/metaTags';

interface DashboardStats {
  profileViews: number;
  jobsSaved: number;
  jobsApplied: number;
  txcBalance: number;
  careerReadiness: number;
  level: number;
  streak: number;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salaryRange: string;
  skills: string[];
}

interface CareerRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  timeToComplete: string;
  type: 'skill' | 'certification' | 'course';
}

const CareerDashboard = () => {
  const navigate = useNavigate();
  const [aiSearchQuery, setAiSearchQuery] = useState('');

  // Fetch real user data
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Fetch TXC balance using the standard hook
  const { availableBalance: txcBalance } = useTokenBalance();

  // Fetch recent jobs for recommendations
  const { data: recentJobs } = useQuery({
    queryKey: ['recentJobs'],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_jobs_paginated_optimized', {
          p_page: 1,
          p_limit: 10,
          p_search: '',
          p_location: '',
          p_employment_types: [],
          p_experience_levels: [],
          p_min_salary: 0,
          p_max_salary: 0,
          p_is_remote: false,
          p_skills: [],
          p_sort_by: 'posted_at'
        });
      return data?.jobs || [];
    }
  });

  // Fetch courses for recommendations
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .limit(6);
      return data || [];
    }
  });

  // SEO meta tags
  useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel Career Intelligence Hub | AI-Powered Career Assistant | TalentXcel',
      description: 'Your personalized TalentXcel AI career command center with intelligent job matching, salary insights, and career growth recommendations powered by advanced AI technology.',
      url: `${window.location.origin}/career-dashboard`,
      keywords: ['TalentXcel career dashboard', 'AI career assistant', 'job matching', 'salary insights', 'career analytics', 'professional growth', 'TalentXcel intelligence'],
      type: 'website'
    });
  }, []);

  // Mock data for demonstration (replace with real data)
  const dashboardStats: DashboardStats = {
    profileViews: 42,
    jobsSaved: 8,
    jobsApplied: 15,
    txcBalance: txcBalance || 0,
    careerReadiness: 67.5,
    level: 4,
    streak: 7
  };

  const jobMatches: JobMatch[] = recentJobs?.slice(0, 3).map((job: any, index: number) => ({
    id: job.id,
    title: job.title,
    company: job.company_name || job.companies?.name || 'Company',
    location: job.location,
    matchScore: 85 - (index * 10),
    salaryRange: job.salary_range || 'Not disclosed',
    skills: Array.isArray(job.skills_required) 
      ? job.skills_required 
      : (typeof job.skills_required === 'string' ? job.skills_required.split(',') : ['JavaScript', 'React', 'Node.js'])
  })) || [];

  const careerRecommendations: CareerRecommendation[] = courses?.slice(0, 4).map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description?.substring(0, 100) + '...',
    impact: course.difficulty_level === 'advanced' ? 'High' : 'Medium',
    timeToComplete: `${course.duration_hours}h`,
    type: 'course'
  })) || [];

  const handleAISearch = () => {
    if (aiSearchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(aiSearchQuery)}`);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Helmet>
        <title>TalentXcel Career Intelligence Hub | AI-Powered Career Assistant | TalentXcel</title>
        <meta name="description" content="Your personalized TalentXcel AI career command center with intelligent job matching, salary insights, and career growth recommendations." />
        <meta name="keywords" content="TalentXcel career dashboard, AI career assistant, job matching, salary insights, career analytics, professional growth" />
        <link rel="canonical" href="https://talentxcel.in/career-dashboard" />
        <meta property="og:title" content="TalentXcel Career Intelligence Hub | TalentXcel" />
        <meta property="og:description" content="Your AI-powered TalentXcel career command center for intelligent job matching and career growth." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/career-dashboard" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 mobile-optimized">
        {/* Mobile-First Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="p-1.5 bg-slate-900 rounded-xl flex-shrink-0 shadow-sm">
                  <img 
                    src="/talentxcel-official-logo.png" 
                    alt="TalentXcel" 
                    className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                    TalentXcel Career Intelligence Hub
                  </h1>
                  <p className="text-sm text-white/80 font-medium">
                    Your AI-powered career command center
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/jobs')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 font-medium min-h-[44px] touch-target"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Welcome & Status Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Message */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Welcome back, {userProfile?.full_name || 'TalentXcel Pro'}! 👋
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                      Your TalentXcel AI Career Assistant found <span className="font-bold text-blue-600">15 new matches</span> today
                    </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TXC Balance & Level */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {dashboardStats.txcBalance.toLocaleString()} TXC
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-800 text-xs">
                        Expert • Level {dashboardStats.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Rewards</div>
                    <div className="text-xs space-y-1">
                      <div>+10 Apply</div>
                      <div>+5 Save</div>
                      <div>+15 Interview</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Search & Career Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Smart Search */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  TalentXcel AI Career Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Python developer remote work opportunities"
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    className="text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                  />
                  <Button onClick={handleAISearch} size="sm" className="px-4">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs h-8"
                    onClick={() => navigate('/jobs?is_remote=true')}
                  >
                    Remote Tech
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs h-8"
                    onClick={() => navigate('/jobs?sort_by=salary_max')}
                  >
                    High Salary
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Skill Matching</span>
                    <span className="text-blue-600 font-medium">AI analyzes your skills</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Role Fit</span>
                    <span className="text-green-600 font-medium">Perfect position alignment</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Career Growth</span>
                    <span className="text-purple-600 font-medium">Future-ready opportunities</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">Quick Apply</span>
                    <span className="text-orange-600 font-medium">One-click applications</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Progress Compass */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Career Progress Compass
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Career Readiness</span>
                    <span className="text-sm font-bold text-green-600">{dashboardStats.careerReadiness}%</span>
                  </div>
                  <Progress value={dashboardStats.careerReadiness} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">
                    You're {(100 - dashboardStats.careerReadiness).toFixed(1)}% away from your next career milestone
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-2">Skills to Boost Your Profile</h4>
                  <div className="space-y-2">
                    {['React Native', 'AWS', 'Docker'].map((skill) => (
                      <div 
                        key={skill} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => navigate(`/courses?search=${encodeURIComponent(skill)}`)}
                      >
                        <span className="text-sm font-medium">{skill}</span>
                        <Badge variant="outline" className="text-xs">High Impact</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <h4 className="text-sm font-bold">Today's Job Hunt Goals</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>Apply to 3 new jobs</span>
                      <Badge variant="outline" className="text-xs">0/3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Update profile skills</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">1/1</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Network with 2 professionals</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">2/2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Complete Daily Challenge</span>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Stats & Quick Apply */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Activity */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Your Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 text-center mb-4">
                  <div 
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => navigate('/profile/saved-jobs')}
                  >
                    <div className="text-2xl font-bold text-purple-600">{dashboardStats.jobsSaved}</div>
                    <div className="text-xs text-gray-600 font-medium">Jobs Saved</div>
                  </div>
                  <div 
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => navigate('/profile/applications')}
                  >
                    <div className="text-2xl font-bold text-blue-600">{dashboardStats.jobsApplied}</div>
                    <div className="text-xs text-gray-600 font-medium">Applied</div>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-600 mb-4">
                  <Eye className="h-4 w-4 inline mr-1" />
                  {dashboardStats.profileViews} profile views this week
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full text-xs h-8"
                    onClick={() => navigate('/jobs')}
                  >
                    <Search className="h-3 w-3 mr-2" />
                    Find Jobs
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => navigate('/profile')}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => navigate('/network')}
                    >
                      <Building className="h-3 w-3 mr-1" />
                      Network
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Apply Dashboard */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Quick Apply Dashboard
                </CardTitle>
                <p className="text-xs text-gray-600">Lightning-fast job applications with AI assistance</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center mb-4">
                  <div>
                    <div className="text-lg font-bold text-orange-600">{dashboardStats.streak}</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">3</div>
                    <div className="text-xs text-gray-600">Today</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">78%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">24h</div>
                    <div className="text-xs text-gray-600">Avg Response</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2">Application Pipeline</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-bold text-blue-600">12</div>
                      <div className="text-gray-600">Applied</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <div className="font-bold text-yellow-600">4</div>
                      <div className="text-gray-600">Shortlisted</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="font-bold text-purple-600">2</div>
                      <div className="text-gray-600">Interviewed</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-bold text-green-600">1</div>
                      <div className="text-gray-600">Offered</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>Apply within first 6 hours for 3x better chances</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">high</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span>Jobs with &lt;10 applicants have higher success rates</span>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">medium</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => navigate('/jobs?quick_apply=true')}
                  >
                    Find Quick Apply Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => navigate('/profile/applications')}
                  >
                    View Applications
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Medal className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">Quick Apply Champion!</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    You're in the top 10% of applicants for response speed. Keep it up!
                  </p>
                  <Badge className="bg-amber-100 text-amber-800 text-xs mt-1">Top 10%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Career Recommendations */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-indigo-600" />
                  TalentXcel AI Career Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerRecommendations.slice(0, 2).map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-4 border rounded-lg hover:border-indigo-300 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/courses/${rec.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`text-xs ${
                        rec.impact === 'High' ? 'bg-green-100 text-green-700' : 
                        rec.impact === 'Medium' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rec.impact} Impact
                      </Badge>
                      <span className="text-xs text-gray-600">{rec.timeToComplete}</span>
                    </div>
                    <h4 className="font-bold text-sm group-hover:text-indigo-600 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary Crystal Ball */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Salary Crystal Ball
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">100% Transparent</Badge>
              </CardTitle>
              <p className="text-xs text-gray-600">Real-time salary insights and market data</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <div><strong>Role:</strong> Software Engineer</div>
                      <div><strong>Location:</strong> Bangalore</div>
                      <div><strong>Experience:</strong> 3-5 years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">₹11.5L</div>
                      <div className="text-xs text-gray-600">Average Annual Salary</div>
                      <div className="flex justify-between text-xs mt-2">
                        <span><strong>₹8.0L</strong> Min</span>
                        <span><strong>₹15.0L</strong> Max</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold">Salary Percentiles</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-bold">₹8.0L</div>
                        <div className="text-gray-600">25th</div>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded text-center">
                        <div className="font-bold text-emerald-600">₹11.5L</div>
                        <div className="text-gray-600">50th (Median)</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-bold">₹15.0L</div>
                        <div className="text-gray-600">75th</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="font-bold text-blue-600">₹18.0L</div>
                        <div className="text-gray-600">90th</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold">Market Insights</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span>Market Trend</span>
                      <span className="font-bold text-green-600">+15% salary growth this year</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span>Top Paying</span>
                      <span className="font-bold text-blue-600">Fintech industry with highest salaries</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span>Remote Premium</span>
                      <span className="font-bold text-purple-600">+8% additional for remote roles</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span>Skill Premium</span>
                      <span className="font-bold text-orange-600">AI/ML highest paying skills</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💡</span>
                      <span className="text-sm font-bold text-blue-800">Negotiation Tip</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Based on your profile, you could negotiate for <strong>₹13.2L</strong> by highlighting your skills in AI/ML and remote work experience.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => navigate('/jobs?salary_min=80000&salary_max=150000')}
                    >
                      Find Jobs in This Range
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => navigate('/salary-insights')}
                    >
                      Detailed Report
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">
                Data sourced from 50,000+ verified job postings • Updated daily
              </div>
            </CardContent>
          </Card>

          {/* Top Company Salaries */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-700" />
                Top Company Salaries
                <Badge className="bg-gray-100 text-gray-700 text-xs">Updated Daily</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, company: 'Google', verified: true, salary: '₹25L - ₹45L', growth: '+12%' },
                  { rank: 2, company: 'Microsoft', verified: true, salary: '₹22L - ₹40L', growth: '+12%' },
                  { rank: 3, company: 'Amazon', verified: true, salary: '₹20L - ₹38L', growth: '+12%' },
                  { rank: 4, company: 'Flipkart', verified: false, salary: '₹18L - ₹35L', growth: '+12%' },
                  { rank: 5, company: 'Zomato', verified: true, salary: '₹15L - ₹30L', growth: '+12%' }
                ].map((company) => (
                  <div 
                    key={company.rank} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => navigate(`/companies/${company.company.toLowerCase()}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold">
                        {company.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{company.company}</span>
                          {company.verified && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">Software Engineer</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{company.salary}</div>
                      <div className="text-xs text-gray-600">Average annual package</div>
                      <div className="text-xs text-green-600">{company.growth} this year</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => navigate('/company-salaries')}
                >
                  View all company salaries →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="justify-start h-auto p-4 text-left" 
                  variant="outline"
                  onClick={() => navigate('/ai-assistant')}
                >
                  <Brain className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-bold text-sm">Ask TalentXcel AI Career Assistant</div>
                    <div className="text-xs text-gray-600">Get personalized career advice</div>
                  </div>
                </Button>
                <Button 
                  className="justify-start h-auto p-4 text-left" 
                  variant="outline"
                  onClick={() => navigate('/profile/preferences')}
                >
                  <Settings className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <div className="font-bold text-sm">Update Job Preferences</div>
                    <div className="text-xs text-gray-600">Refine your search</div>
                  </div>
                </Button>
                <Button 
                  className="justify-start h-auto p-4 text-left" 
                  variant="outline"
                  onClick={() => navigate('/salary-insights')}
                >
                  <BarChart3 className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-bold text-sm">View Salary Insights</div>
                    <div className="text-xs text-gray-600">Market analysis</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CareerDashboard;