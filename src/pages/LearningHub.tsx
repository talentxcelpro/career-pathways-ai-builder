import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { CareerAgentWidget } from '@/components/learning/CareerAgentWidget';
import { AggregatedCourse, LearningProvider, CareerPathway, PersonalizedLearningPlan } from '@/types/learningAggregator';
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
  Building2,
  Rocket,
  Zap,
  Target,
  ChevronRight,
  Crown,
  Edit3,
  RefreshCw,
  Bot,
  GraduationCap,
  Globe
} from 'lucide-react';

// Crisp, High-Reliability Provider Logo Component (No Broken Image Icons)
function ProviderLogoBadge({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  // Helper for brand badge styling
  const getBrandBadge = () => {
    const n = name.toLowerCase();
    if (n.includes('microsoft')) {
      return <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">MS</div>;
    }
    if (n.includes('mit')) {
      return <div className="w-10 h-10 rounded-2xl bg-rose-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">MIT</div>;
    }
    if (n.includes('ibm')) {
      return <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">IBM</div>;
    }
    if (n.includes('freecodecamp')) {
      return <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">fCC</div>;
    }
    if (n.includes('aws') || n.includes('amazon')) {
      return <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-xs">AWS</div>;
    }
    if (n.includes('google')) {
      return <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">G</div>;
    }
    if (n.includes('harvard')) {
      return <div className="w-10 h-10 rounded-2xl bg-red-800 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">HU</div>;
    }
    return <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">{name.substring(0, 2).toUpperCase()}</div>;
  };

  if (imgError || !logoUrl) {
    return getBrandBadge();
  }

  return (
    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-muted p-1.5 flex items-center justify-center overflow-hidden border border-slate-200/80 shrink-0">
      <img 
        src={logoUrl} 
        alt={name} 
        onError={() => setImgError(true)}
        className="w-full h-full object-contain" 
      />
    </div>
  );
}

export default function LearningHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Feed');
  const [activeCategory, setActiveCategory] = useState('all');

  // Real user details state (Dynamically resolved per logged-in user)
  const [userInfo, setUserInfo] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || 'Learner',
    title: profile?.headline || profile?.title || 'Career Enthusiast',
    location: profile?.location || 'India',
    skills: ['Operations Strategy', 'Data Analytics', 'Project Execution'],
    avatarUrl: profile?.profile_picture_url || user?.user_metadata?.avatar_url || 'https://chatr.chat/assets/img/logo.png',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    async function loadRealProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user;

        if (profile || currentUser) {
          const fullName = profile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Learner';
          const title = profile?.headline || profile?.title || currentUser?.user_metadata?.title || 'Professional';
          const location = profile?.location || 'India';
          const avatar = profile?.profile_picture_url || (profile as any)?.avatar_url || currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || 'https://chatr.chat/assets/img/logo.png';
          
          setUserInfo({
            full_name: fullName,
            title: title,
            location: location,
            skills: ['Operations Strategy', 'Data Analytics', 'Project Execution'],
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

  const triggerAiPlanner = async (promptText: string) => {
    setAiPromptInput(promptText);
    setIsAiModalOpen(true);
    setIsGeneratingPlan(true);

    const plan = await learningAggregatorService.generatePersonalizedPlan(promptText);
    setTimeout(() => {
      setGeneratedPlan(plan);
      setIsGeneratingPlan(false);
    }, 400);
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
      
      {/* 1. SUB-HEADER PILL NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-full p-1.5 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
          {[
            { label: 'Feed', icon: BookOpen, path: null },
            { label: 'Career Advisor', icon: Bot, path: null },
            { label: 'Career Pathways', icon: Rocket, path: '/learning/paths' },
            { label: 'Skill Search', icon: Zap, path: '/learning/courses' },
            { label: 'Verified Providers', icon: Building2, path: '/learning/providers' },
            { label: 'Certificates', icon: Award, path: '/learning/certificates' }
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

      {/* 2. 3-COLUMN MAIN PLATFORM LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: REAL LOGGED-IN USER PROFILE */}
        <div className="lg:col-span-3 space-y-6">
          
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
                  alt={userInfo.full_name} 
                  onError={(e) => {
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
                  <h3 className="text-sm font-extrabold text-foreground">{userInfo.full_name}</h3>
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
                  <Crown className="h-3 w-3 text-amber-300" /> Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* CENTER COLUMN: MAIN FEED & CAREER INTELLIGENCE ADVISOR */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* TALENTXCEL CAREER ADVISOR WIDGET */}
          <CareerAgentWidget userProfile={userInfo} />

          {/* Verified Learning Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Verified Learning Feed</h3>
              <span className="text-xs text-muted-foreground font-semibold">2,650+ Courses Indexed</span>
            </div>

            {courses.map(course => (
              <Card key={course.id} className="rounded-3xl border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-sm p-6 space-y-4">
                
                {/* Course Header Attribution with ProviderLogoBadge */}
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => navigate(`/learning/providers/${course.provider_id || 'microsoft-learn'}`)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <ProviderLogoBadge name={course.provider_name} logoUrl={course.provider_logo} />

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

        {/* RIGHT COLUMN: MONETIZATION WIDGETS */}
        <div className="lg:col-span-3 space-y-6">
          
          <Card className="rounded-3xl border-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-6 space-y-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                Pro Subscriber
              </Badge>

              <Crown className="h-6 w-6 text-amber-300" />
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

        </div>

      </div>

    </div>
  );
}