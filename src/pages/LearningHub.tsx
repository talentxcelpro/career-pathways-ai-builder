import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { AggregatedCourse, LearningProvider, CareerPathway, PersonalizedLearningPlan } from '@/types/learningAggregator';
import { DOMAIN_TARGETS } from '@/data/learningTaxonomy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Award, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  GraduationCap,
  Code,
  BarChart3,
  Globe,
  Star,
  Users,
  Building2,
  TrendingUp,
  Cpu,
  Layers,
  Rocket,
  Zap,
  Target,
  FileSpreadsheet,
  Filter,
  Share2,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  MessageSquare,
  Compass,
  Trophy,
  Check,
  Crown,
  DollarSign
} from 'lucide-react';

export default function LearningHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Feed');
  const [activeCategory, setActiveCategory] = useState('all');

  // Real user details state
  const [userInfo, setUserInfo] = useState({
    name: 'Arshid Hussain Wani',
    username: 'talentxcelpro',
    title: 'Director Operations',
    location: 'TalentXcel Services • India',
    avatarUrl: 'https://chatr.chat/assets/img/logo.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  // Fetch real profile details from Supabase auth / profiles table
  useEffect(() => {
    async function loadRealProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user;

        if (profile || currentUser) {
          const fullName = profile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || 'Arshid Hussain Wani';
          const title = profile?.headline || profile?.title || currentUser?.user_metadata?.title || 'Director Operations';
          const location = profile?.location || 'TalentXcel Services • India';
          const avatar = profile?.profile_picture_url || (profile as any)?.avatar_url || currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || 'https://chatr.chat/assets/img/logo.png';
          
          setUserInfo({
            name: fullName,
            username: (profile as any)?.username || currentUser?.email?.split('@')[0] || 'talentxcelpro',
            title: title,
            location: location,
            avatarUrl: avatar,
            coverUrl: profile?.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
          });
        }
      } catch (err) {
        console.warn("Profile load notice:", err);
      }
    }
    loadRealProfile();
  }, [profile, user]);

  // AI Career Intent Planner Dialog State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<PersonalizedLearningPlan | null>(null);

  // Monetization Pro Modal State
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // Fetch verified aggregated courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['aggregated-courses-hub', activeCategory],
    queryFn: () => learningAggregatorService.getCourses({ category: activeCategory })
  });

  // Fetch verified providers
  const { data: providers = [] } = useQuery({
    queryKey: ['aggregated-providers-hub'],
    queryFn: () => learningAggregatorService.getProviders()
  });

  // Fetch career pathways
  const { data: pathways = [] } = useQuery({
    queryKey: ['aggregated-pathways-hub'],
    queryFn: () => learningAggregatorService.getCareerPathways()
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchQuery.toLowerCase().includes('hr')) {
      triggerAiPlanner("I have 5 years of HR experience and want to move into HR analytics. I have 6 hours per week.");
    } else if (searchQuery.toLowerCase().includes('data analyst')) {
      navigate('/learning/careers/data-analyst');
    } else if (searchQuery.toLowerCase().includes('ai')) {
      navigate('/learning/careers/ai-engineer');
    } else {
      navigate(`/learning/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const triggerAiPlanner = async (promptText: string) => {
    setAiPromptInput(promptText);
    setIsAiModalOpen(true);
    setIsGeneratingPlan(true);

    const plan = await learningAggregatorService.generatePersonalizedPlan(promptText);
    setTimeout(() => {
      setGeneratedPlan(plan);
      setIsGeneratingPlan(false);
    }, 800);
  };

  const handleCourseHandoff = async (course: AggregatedCourse, sourcePage: string) => {
    const monetizedUrl = await learningAggregatorService.trackHandoff({
      course_id: course.id,
      provider_id: course.provider_id,
      provider_name: course.provider_name,
      source_url: course.source_url,
      clicked_at: new Date().toISOString(),
      source_page: sourcePage
    });

    toast.success(`Redirecting to official course on ${course.provider_name}...`);
    window.open(monetizedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      
      {/* ============================================================================ */}
      {/* 1. SUB-HEADER PILL NAVIGATION BAR (MATCHING IMAGE 1 NETWORK SUB-HEADER) */}
      {/* ============================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
          {[
            { label: 'Feed', icon: BookOpen, path: null },
            { label: 'Smart Feed', icon: Sparkles, path: null },
            { label: 'Career Pathways', icon: Rocket, path: '/learning/paths' },
            { label: 'Skill Search', icon: Zap, path: '/learning/courses' },
            { label: 'Verified Providers', icon: Building2, path: '/learning/providers/microsoft-learn' },
            { label: 'Certificates', icon: Award, path: '/learning/certificates' },
            { label: 'AI Intent Planner', icon: Cpu, path: null }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  if (tab.path) {
                    navigate(tab.path);
                  } else if (tab.label === 'AI Intent Planner') {
                    triggerAiPlanner("I want to pivot my career into AI Engineering");
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================================ */}
      {/* 2. 3-COLUMN MAIN PLATFORM LAYOUT (MATCHING IMAGE 1 PERFECTLY) */}
      {/* ============================================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================================ */}
        {/* LEFT COLUMN: REAL USER PROFILE & QUICK NAV (3 COLS) */}
        {/* ============================================================================ */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Real User Profile Card */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden text-center">
            <div 
              className="h-24 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${userInfo.coverUrl})` }}
            >
              <div className="absolute inset-0 bg-slate-900/30"></div>
            </div>
            
            <CardContent className="px-5 pb-6 pt-0 relative space-y-4">
              <div 
                onClick={() => navigate('/profile')}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-card bg-white mx-auto -mt-10 overflow-hidden shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <img 
                  src={userInfo.avatarUrl} 
                  alt={userInfo.name} 
                  onError={(e) => {
                    // Fallback image if remote image fails
                    (e.target as HTMLImageElement).src = 'https://chatr.chat/assets/img/logo.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div 
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-sm font-extrabold text-foreground">{userInfo.name}</h3>
                  <CheckCircle2 className="h-4 w-4 fill-blue-600 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-semibold">{userInfo.title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{userInfo.location}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/profile')}
                  className="flex-1 rounded-2xl text-xs font-bold border-slate-300 cursor-pointer"
                >
                  Edit Profile
                </Button>

                <Button 
                  size="sm" 
                  onClick={() => setIsProModalOpen(true)}
                  className="flex-1 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm cursor-pointer"
                >
                  <Crown className="h-3 w-3 text-amber-300" /> Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Left Navigation Card */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-4 space-y-1">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-2">
              NAVIGATION
            </div>

            {[
              { label: 'Verified Catalogue', icon: ShieldCheck, path: '/learning/courses' },
              { label: 'My Learning', icon: BookOpen, path: '/learning/my-courses' },
              { label: 'Career Pathways', icon: Rocket, path: '/learning/paths' },
              { label: 'Saved Items', icon: Bookmark, path: '/learning/my-courses' },
              { label: 'My Progress', icon: Trophy, path: '/learning/my-progress' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-muted text-left transition-colors flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </Card>

        </div>

        {/* ============================================================================ */}
        {/* CENTER COLUMN: MAIN FEED & INTENT ENGINE (6 COLS) */}
        {/* ============================================================================ */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Search Bar Input (Matching Image 1) */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search courses, skills, providers, career paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-13 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border text-sm font-medium text-foreground shadow-xs focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            <button type="submit" className="absolute right-4 p-1.5 text-slate-400 hover:text-blue-600 cursor-pointer">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </form>

          {/* Create Enhanced Intent Post Card (Matching Image 1) */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600">
                <Sparkles className="h-4 w-4" />
                <span>Search Education Intent</span>
              </div>
              
              <Button 
                onClick={() => triggerAiPlanner("I want to become a Data Analyst")}
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs font-bold border-purple-300 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" /> TalentXcel Copilot
              </Button>
            </div>

            <textarea
              placeholder="What do you want to learn or become? (e.g., 'I have 5 years HR experience and want to move into HR analytics')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-foreground resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <button onClick={() => setSearchQuery('Python')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                  <Code className="h-4 w-4 text-blue-600" /> Python
                </button>
                <button onClick={() => setSearchQuery('SQL')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                  <BarChart3 className="h-4 w-4 text-emerald-600" /> SQL
                </button>
                <button onClick={() => setSearchQuery('Power BI')} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 text-amber-600" /> Power BI
                </button>
              </div>

              <Button
                onClick={handleSearchSubmit}
                className="rounded-xl px-5 h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm gap-1 cursor-pointer"
              >
                <span>Find Pathway</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          {/* Intent Navigation Grid ("What do you want to achieve?") */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">What do you want to achieve?</h3>
              <Badge variant="outline" className="text-[10px] font-bold border-blue-500 text-blue-600">
                Intent-Driven
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* CAREER PATHS */}
              <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-600" />
                  <h4 className="text-xs font-extrabold text-foreground">🚀 Start a Career</h4>
                </div>

                <div className="space-y-1.5">
                  {[
                    { name: 'Data Analyst', slug: 'data-analyst' },
                    { name: 'AI Engineer', slug: 'ai-engineer' },
                    { name: 'Cybersecurity Analyst', slug: 'cybersecurity' }
                  ].map((role, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/learning/careers/${role.slug}`)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-muted/40 hover:bg-blue-50 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between group cursor-pointer"
                    >
                      <span>{role.name}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* LEARN SKILLS */}
              <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-xs font-extrabold text-foreground">⚡ Learn a Skill</h4>
                </div>

                <div className="space-y-1.5">
                  {[
                    { name: 'Python for Data', count: '380 courses' },
                    { name: 'SQL & PostgreSQL', count: '215 courses' },
                    { name: 'Generative AI', count: '165 courses' }
                  ].map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/learning/courses?skill=${skill.name}`)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-muted/40 hover:bg-emerald-50 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between group cursor-pointer"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{skill.count}</span>
                    </button>
                  ))}
                </div>
              </Card>

            </div>
          </section>

          {/* Verified Learning Feed (Matching Image 1 Post Feed) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Verified Learning Feed</h3>
              <span className="text-xs text-muted-foreground font-semibold">2,650+ Courses Indexed</span>
            </div>

            {courses.map(course => (
              <Card key={course.id} className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-4">
                
                {/* Course Header Attribution */}
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => navigate(`/learning/providers/${course.provider_id || 'microsoft-learn'}`)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-muted p-1.5 flex items-center justify-center overflow-hidden border border-slate-200/80 group-hover:scale-105 transition-transform">
                      <img src={course.provider_logo || 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg'} alt={course.provider_name} className="w-full h-full object-contain" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-foreground group-hover:text-blue-600 transition-colors">{course.provider_name}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">{course.source_domain} • Verified Official</p>
                    </div>
                  </div>

                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold px-3 py-1">
                    {course.free_type.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h4 
                    onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                    className="text-base font-extrabold text-foreground hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {course.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {course.short_description}
                  </p>
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    <Clock className="h-3 w-3 mr-1 text-blue-600" /> {course.duration_text}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {course.level} Level
                  </Badge>
                  {course.talentxcel_match && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 text-[10px] font-extrabold">
                      <Sparkles className="h-3 w-3 mr-1" /> {course.talentxcel_match}% Match
                    </Badge>
                  )}
                </div>

                {/* Card Action Buttons with Monetization Tracking */}
                <div className="pt-3 border-t border-slate-100 dark:border-border/40 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/learning/courses/${course.slug || course.id}`)}
                    className="rounded-xl text-xs font-bold border-slate-300 cursor-pointer"
                  >
                    View Details
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleCourseHandoff(course, 'feed')}
                    className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm cursor-pointer"
                  >
                    <span>Start Course on {course.provider_name}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>

              </Card>
            ))}
          </div>

        </div>

        {/* ============================================================================ */}
        {/* RIGHT COLUMN: SPONSORED & MONETIZATION WIDGETS (3 COLS, MATCHING IMAGE 1) */}
        {/* ============================================================================ */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
            MONETIZATION & PRO
          </div>

          {/* SPONSORED PRO CARD (MATCHING EMERALD VIBRANT GRADIENT IN IMAGE 1) */}
          <Card className="rounded-3xl border-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-6 space-y-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                Pro Subscriber
              </Badge>

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/40 backdrop-blur-md flex items-center justify-center border border-white/20 rotate-45">
                <Crown className="h-6 w-6 text-amber-300 -rotate-45" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-extrabold tracking-tight">Boost Your Career with Pro</h4>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                Unlock AI Skill Gap Audit, employer direct placements, and verified Career Passport credentials.
              </p>
            </div>

            <Button
              onClick={() => setIsProModalOpen(true)}
              className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Upgrade to Pro ($19/mo)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Card>

          {/* DREAM JOB CARD (MATCHING PURPLE VIBRANT GRADIENT IN IMAGE 1) */}
          <Card className="rounded-3xl border-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-purple-900 text-white p-6 space-y-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                Jobs Engine
              </Badge>

              <div className="w-14 h-14 rounded-2xl bg-purple-500/40 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-extrabold tracking-tight">Find Your Dream Job</h4>
              <p className="text-xs text-purple-100 font-medium leading-relaxed">
                Browse thousands of verified job opportunities matched directly to your course skills.
              </p>
            </div>

            <Button
              onClick={() => navigate('/jobs')}
              className="w-full h-11 rounded-2xl bg-white hover:bg-slate-100 text-purple-900 font-extrabold text-xs shadow-xl cursor-pointer"
            >
              Explore Verified Jobs
            </Button>
          </Card>

          {/* MATCHING TALENTXCEL JOBS WIDGET */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h4 className="text-xs font-extrabold text-foreground">Matching Open Jobs</h4>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Junior Data Analyst', company: 'Savantis Solutions', salary: '₹8 - ₹12 LPA' },
                { title: 'BI Specialist', company: 'Nexgenn Services', salary: '₹10 - ₹16 LPA' }
              ].map((job, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/jobs')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border/40 space-y-1 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold text-foreground">{job.title}</h5>
                    <span className="text-[9px] font-bold text-emerald-600">{job.salary}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{job.company}</p>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => navigate('/jobs')}
              className="w-full rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              View All Matching Jobs
            </Button>
          </Card>

        </div>

      </div>

      {/* ============================================================================ */}
      {/* FLOATING MESSAGES BUTTON (MATCHING IMAGE 1 BOTTOM RIGHT) */}
      {/* ============================================================================ */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => navigate('/network')}
          className="rounded-full h-12 px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-2xl flex items-center gap-2 border-2 border-white cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Messages</span>
          <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-[10px] font-extrabold flex items-center justify-center">1</span>
        </Button>
      </div>

      {/* ============================================================================ */}
      {/* MONETIZATION & PRO PLAN SUBSCRIPTION DIALOG */}
      {/* ============================================================================ */}
      <Dialog open={isProModalOpen} onOpenChange={setIsProModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              <span>TalentXcel Pro Subscription</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-1">
              <div className="text-2xl font-extrabold">$19 / month <span className="text-xs font-normal text-blue-200">(₹999 / mo)</span></div>
              <p className="text-xs text-blue-100 font-medium">Accelerate your career with AI intelligence & direct employer placement</p>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {[
                'Full AI Skill Gap Audit across 340+ active job openings',
                'Priority Provider Handoff & Partner Referral Verification',
                'Verified Credly/TalentXcel Digital Badge Sync on Career Passport',
                'Direct Fast-Track Applications to Top Hiring Employers'
              ].map((perk, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                toast.success("Thank you for upgrading to TalentXcel Pro!");
                setIsProModalOpen(false);
              }}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Subscribe to Pro Now</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI CAREER INTENT PLANNER DIALOG */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-6 bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>TalentXcel AI Career Intent Plan</span>
            </DialogTitle>
          </DialogHeader>

          {isGeneratingPlan ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-muted-foreground">Synthesizing personalized 12-week learning plan from 2,650+ courses...</p>
            </div>
          ) : generatedPlan && (
            <div className="space-y-6 pt-2">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 space-y-1">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">Your Intent</div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">"{generatedPlan.user_intent}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-2">
                  <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Current Strengths
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan.current_strengths.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 space-y-2">
                  <div className="text-xs font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                    <Target className="h-4 w-4" /> Skills to Build
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {generatedPlan.skills_to_build.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-blue-300 text-blue-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setIsAiModalOpen(false);
                  navigate('/learning/careers/data-analyst');
                }}
                className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                View Selected 23 Free Courses for This Pathway
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}