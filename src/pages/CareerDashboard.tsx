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
  TrendingDown, Activity, Shield, Medal, Gift,
  Grid3X3, Layers
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ModulesLauncher } from '@/components/mobile/ModulesLauncher';

import { supabase } from '@/integrations/supabase/client';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { updateMetaTags } from '@/utils/metaTags';

interface CommandCenterStats {
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

const CareerCommandCenter = () => {
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
      title: 'TalentXcel Command Center | Performance Career Engine',
      description: 'Your premium TalentXcel Command Center with intelligent matching, performance indexing, and real-time career growth analytics.',
      url: `${window.location.origin}/dashboard`,
      keywords: ['TalentXcel', 'Career Engine', 'Performance Tracking', 'TalentScore', 'AI Career Navigator'],
      type: 'website'
    });
  }, []);

  // Mock data for demonstration (replace with real data)
  const stats: CommandCenterStats = {
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

  const [showLauncher, setShowLauncher] = useState(false);

  return (
    <>
      <ModulesLauncher isOpen={showLauncher} onClose={() => setShowLauncher(false)} />
      <Helmet>
        <title>TalentXcel Command Center | Performance Career Navigator</title>
        <meta name="description" content="Your personalized TalentXcel AI career command center with intelligent job matching, salary insights, and career growth recommendations." />
        <meta name="keywords" content="TalentXcel career command center, AI career Navigator, job matching, salary insights, career analytics, professional growth" />
        <link rel="canonical" href="https://talentxcel.in/career-dashboard" />
        <meta property="og:title" content="TalentXcel Command Center" />
        <meta property="og:description" content="Your Performance TalentXcel career command center for intelligent job matching and career growth." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/career-dashboard" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 mobile-optimized edge-to-edge">
        {/* Mobile-First Header */}
        <div className="bg-slate-950 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex-shrink-0 shadow-xl">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-apple-heavy tracking-tight truncate">
                    TalentXcel Command Center
                  </h1>
                  <p className="text-sm text-blue-300 font-apple-medium flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    High-Performance Career Engine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowLauncher(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl hidden sm:flex"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Launch Hub
                </Button>
                <Button 
                  onClick={() => navigate('/jobs')}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Opportunities
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Welcome & Status Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Message */}
            <div className="lg:col-span-2">
              <Card className="bg-white/40 backdrop-blur-xl border-white/40 shadow-xl rounded-[32px] overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                    <h2 className="text-xl font-apple-heavy text-slate-900">
                      Welcome, {userProfile?.full_name || 'Talent Architect'}
                    </h2>
                    <p className="text-sm text-slate-500 font-apple-medium">
                      Your TalentXcel AI identified <span className="font-bold text-blue-600">15 high-velocity matches</span> today.
                    </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TXC Balance & Level */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 rounded-[32px] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <span className="text-2xl font-apple-heavy text-gray-900">
                        {stats.txcBalance.toLocaleString()} TXC
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] font-apple-heavy border-0 rounded-lg">
                        EXPERT • LEVEL {stats.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-apple-heavy text-gray-400 uppercase tracking-widest">Rewards</div>
                    <div className="text-[10px] font-apple-bold text-slate-600 space-y-1">
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
            <Card className="bg-white/40 backdrop-blur-xl border-white/40 shadow-xl rounded-[32px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-apple-heavy flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  TalentXcel AI Career Navigator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search high-velocity opportunities..."
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    className="rounded-2xl h-12 border-slate-200 bg-white/50 backdrop-blur-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                  />
                  <Button onClick={handleAISearch} size="sm" className="h-12 w-12 rounded-2xl shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs h-10 rounded-xl border-slate-200"
                    onClick={() => navigate('/jobs?is_remote=true')}
                  >
                    Remote Tech
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs h-10 rounded-xl border-slate-200"
                    onClick={() => navigate('/jobs?sort_by=salary_max')}
                  >
                    High Salary
                  </Button>
                </div>

                <div className="space-y-2 text-xs font-apple-medium">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Skill Matching</span>
                    <span className="text-blue-600 font-apple-bold">AI analyzes your skills</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Role Fit</span>
                    <span className="text-emerald-600 font-apple-bold">Perfect position alignment</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Career Growth</span>
                    <span className="text-purple-600 font-apple-bold">Future-ready opportunities</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Quick Apply</span>
                    <span className="text-orange-600 font-apple-bold">One-click applications</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Progress Compass */}
            <Card className="bg-white/40 backdrop-blur-xl border-white/40 shadow-xl rounded-[32px] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-apple-heavy flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Performance Progress Compass
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-apple-bold">Career Readiness</span>
                    <span className="text-sm font-apple-heavy text-emerald-600">{stats.careerReadiness}%</span>
                  </div>
                  <Progress value={stats.careerReadiness} className="h-3 rounded-full" />
                  <p className="text-xs text-slate-500 mt-3 font-apple-medium">
                    You're {(100 - stats.careerReadiness).toFixed(1)}% away from your next performance milestone
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest mb-3">Skills to Boost Profile</h4>
                  <div className="space-y-2">
                    {['React Native', 'AWS Cloud', 'Docker Architecture'].map((skill) => (
                      <div 
                        key={skill} 
                        className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-slate-100 cursor-pointer hover:border-blue-200 transition-all shadow-sm group"
                        onClick={() => navigate(`/courses?search=${encodeURIComponent(skill)}`)}
                      >
                        <span className="text-sm font-apple-bold text-slate-700">{skill}</span>
                        <Badge variant="outline" className="text-[10px] font-apple-heavy border-blue-100 text-blue-600 bg-blue-50">HIGH IMPACT</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Daily Performance Challenges</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 hover:border-blue-300 transition-all group cursor-pointer shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-apple-bold text-slate-800">Profile Optimization</p>
                          <p className="text-[10px] font-apple-medium text-slate-500">Apply to 3 relevant jobs</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] rounded-lg font-apple-heavy">0/3</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Stats & Quick Apply */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Activity */}
            <Card className="rounded-[32px] overflow-hidden border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-apple-heavy flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Your Network Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 text-center mb-6">
                  <div 
                    className="cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-colors bg-slate-50/50 border border-slate-100"
                    onClick={() => navigate('/profile/saved-jobs')}
                  >
                    <div className="text-3xl font-apple-heavy text-purple-600">{stats.jobsSaved}</div>
                    <div className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-500 mt-1">Jobs Saved</div>
                  </div>
                  <div 
                    className="cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-colors bg-slate-50/50 border border-slate-100"
                    onClick={() => navigate('/profile/applications')}
                  >
                    <div className="text-3xl font-apple-heavy text-blue-600">{stats.jobsApplied}</div>
                    <div className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-500 mt-1">Applied</div>
                  </div>
                </div>
                <div className="text-center text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest mb-6">
                  <Eye className="h-3 w-3 inline mr-1" />
                  {stats.profileViews} profile views this week
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 rounded-2xl bg-slate-900 font-apple-bold"
                    onClick={() => navigate('/jobs')}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Opportunities
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-2xl border-slate-200 font-apple-bold"
                      onClick={() => navigate('/profile')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Identity
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-2xl border-slate-200 font-apple-bold"
                      onClick={() => navigate('/network')}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Ecosystem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Apply Center */}
            <Card className="rounded-[32px] overflow-hidden border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-apple-heavy flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Quick Apply Accelerator
                </CardTitle>
                <p className="text-xs text-slate-500 font-apple-medium">Lightning-fast applications with AI assistance</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center mb-6">
                  <div>
                    <div className="text-xl font-apple-heavy text-orange-600">{stats.streak}</div>
                    <div className="text-[10px] font-apple-heavy uppercase text-slate-400">Streak</div>
                  </div>
                  <div>
                    <div className="text-xl font-apple-heavy text-emerald-600">3</div>
                    <div className="text-[10px] font-apple-heavy uppercase text-slate-400">Today</div>
                  </div>
                  <div>
                    <div className="text-xl font-apple-heavy text-blue-600">78%</div>
                    <div className="text-[10px] font-apple-heavy uppercase text-slate-400">Rate</div>
                  </div>
                  <div>
                    <div className="text-xl font-apple-heavy text-purple-600">24h</div>
                    <div className="text-[10px] font-apple-heavy uppercase text-slate-400">Resp</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-3">Application Pipeline</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <div className="text-sm font-apple-heavy text-blue-600">12</div>
                      <div className="text-[8px] font-apple-heavy uppercase text-blue-400">Sent</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                      <div className="text-sm font-apple-heavy text-amber-600">4</div>
                      <div className="text-[8px] font-apple-heavy uppercase text-amber-400">Match</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
                      <div className="text-sm font-apple-heavy text-purple-600">2</div>
                      <div className="text-[8px] font-apple-heavy uppercase text-purple-400">Talks</div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                      <div className="text-sm font-apple-heavy text-emerald-600">1</div>
                      <div className="text-[8px] font-apple-heavy uppercase text-emerald-400">Offer</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-apple-bold shadow-lg shadow-orange-500/20"
                    onClick={() => navigate('/jobs?quick_apply=true')}
                  >
                    Quick Apply Matrix
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Medal className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-apple-heavy text-amber-800 uppercase tracking-widest">Global Champion</span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-apple-medium">
                    You're in the top 10% of applicants for response velocity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Career Recommendations */}
          <Card className="rounded-[32px] overflow-hidden border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-apple-heavy flex items-center gap-2">
                <Rocket className="h-5 w-5 text-indigo-600" />
                TalentXcel AI Career Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerRecommendations.slice(0, 2).map((rec) => (
                  <div 
                    key={rec.id} 
                    className="p-6 border border-slate-100 rounded-[24px] hover:border-indigo-200 transition-all cursor-pointer group bg-slate-50/30"
                    onClick={() => navigate(`/courses/${rec.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={cn("text-[10px] font-apple-heavy border-0 rounded-lg px-2 py-0.5", 
                        rec.impact === 'High' ? 'bg-emerald-100 text-emerald-700' : 
                        rec.impact === 'Medium' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      )}>
                        {rec.impact.toUpperCase()} IMPACT
                      </Badge>
                      <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">{rec.timeToComplete} READ</span>
                    </div>
                    <h4 className="font-apple-heavy text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-apple-medium leading-relaxed line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary Crystal Ball */}
          <Card className="rounded-[32px] overflow-hidden border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-apple-heavy flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Salary Crystal Ball
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-apple-heavy border-0 rounded-lg">LIVE DATA</Badge>
              </CardTitle>
              <p className="text-xs text-slate-500 font-apple-medium">Real-time salary insights and market transparency</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-[24px] border border-emerald-100">
                    <div className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest space-y-1 mb-4">
                      <div><strong className="text-slate-600">Role:</strong> Software Engineer</div>
                      <div><strong className="text-slate-600">Location:</strong> Bangalore, India</div>
                      <div><strong className="text-slate-600">EXP:</strong> 3-5 Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-apple-heavy text-emerald-600">₹11.5L</div>
                      <div className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mt-1">Median Market Value</div>
                      <div className="flex justify-between text-[10px] font-apple-heavy text-slate-500 mt-6 pt-4 border-t border-emerald-200/50">
                        <span>MIN: ₹8.0L</span>
                        <span>MAX: ₹15.0L</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Market Percentiles</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '25th', value: '₹8.0L', color: 'bg-slate-50' },
                        { label: 'Median', value: '₹11.5L', color: 'bg-emerald-50 text-emerald-700' },
                        { label: '75th', value: '₹15.0L', color: 'bg-slate-50' },
                        { label: '90th', value: '₹18.0L', color: 'bg-blue-50 text-blue-700' }
                      ].map((p, i) => (
                        <div key={i} className={cn("p-3 rounded-xl text-center border border-slate-100", p.color)}>
                          <div className="text-sm font-apple-heavy">{p.value}</div>
                          <div className="text-[8px] font-apple-heavy uppercase tracking-widest opacity-60">{p.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Market Intelligence</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Growth', value: '+15% annual velocity', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                      { label: 'Sector', value: 'Fintech remains lead payer', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { label: 'Remote', value: '+8% distributed premium', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                      { label: 'Skills', value: 'AI/ML premium verified', color: 'bg-orange-50 text-orange-700 border-orange-100' }
                    ].map((item, i) => (
                      <div key={i} className={cn("flex items-center justify-between p-3 rounded-2xl border text-[11px] font-apple-bold", item.color)}>
                        <span className="opacity-60">{item.label}</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-900 rounded-[24px] text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      <span className="text-[10px] font-apple-heavy uppercase tracking-widest">Negotiation AI</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-apple-medium leading-relaxed">
                      Based on your architecture profile, target <span className="text-white font-apple-bold">₹13.2L</span> by leveraging AI/ML verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-2xl border-slate-200 font-apple-bold text-xs"
                      onClick={() => navigate('/jobs')}
                    >
                      Filter Jobs
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-2xl border-slate-200 font-apple-bold text-xs"
                      onClick={() => navigate('/salary-insights')}
                    >
                      Insights
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CareerCommandCenter;
