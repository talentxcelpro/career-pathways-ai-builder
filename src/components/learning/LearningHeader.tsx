import React from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Award, 
  Flame, 
  TrendingUp, 
  Calendar, 
  Star,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { LearningNavigation } from './LearningNavigation';

export const LearningHeader: React.FC = () => {
  const location = useLocation();
  const { displayName, streakDays } = useCurrentUserProfile();
  
  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'Professional Leader';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'Professional Leader';
    }
    return displayName;
  }, [displayName]);

  const getStreakLevel = () => {
    if (streakDays >= 30) return { level: 'Expert', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (streakDays >= 14) return { level: 'Advanced', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (streakDays >= 7) return { level: 'Committed', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    return { level: 'Getting Started', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  };

  const streakInfo = getStreakLevel();

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Executive Dark Mesh Header Synced with TalentXcel Brand */}
      <header className="relative bg-gradient-to-b from-[#0b0f19] via-[#0e1726] to-[#0b111e] text-white border-b border-slate-800/80 overflow-hidden select-none">
        
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Grid Mesh */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="learning-header-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#learning-header-grid)" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Welcome Section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
                  <Badge className={`${streakInfo.bg} ${streakInfo.color} border border-white/10 text-xs font-bold`}>
                    {streakDays} days • {streakInfo.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>Learning Streak</span>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back, <span className="bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#818CF8] bg-clip-text text-transparent">{friendlyName}</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Continue your learning journey with personalized skill pathways and verified industry-leading courses.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-white">12</div>
                  <div className="text-xs text-slate-400 font-medium">Active Courses</div>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-black text-white">8</div>
                  <div className="text-xs text-slate-400 font-medium">Certificates</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Pills */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/learning/my-courses">
              <Button 
                variant="outline" 
                className={`w-full h-11 rounded-xl text-xs font-bold transition-all group ${
                  isCurrentPath('/learning/my-courses')
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2 text-cyan-400 group-hover:scale-110 transition-transform" />
                My Courses
                <ArrowRight className="h-3 w-3 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            
            <Link to="/learning/paths">
              <Button 
                variant="outline" 
                className={`w-full h-11 rounded-xl text-xs font-bold transition-all group ${
                  isCurrentPath('/learning/paths')
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm'
                }`}
              >
                <Target className="h-4 w-4 mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
                Learning Paths
                <ArrowRight className="h-3 w-3 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            
            <Link to="/learning/quick-learn">
              <Button 
                variant="outline" 
                className={`w-full h-11 rounded-xl text-xs font-bold transition-all group ${
                  isCurrentPath('/learning/quick-learn')
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm'
                }`}
              >
                <Zap className="h-4 w-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform" />
                Quick Learn
                <ArrowRight className="h-3 w-3 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            
            <Link to="/learning/certificates">
              <Button 
                variant="outline" 
                className={`w-full h-11 rounded-xl text-xs font-bold transition-all group ${
                  isCurrentPath('/learning/certificates')
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-sm'
                }`}
              >
                <Award className="h-4 w-4 mr-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                Certificates
                <ArrowRight className="h-3 w-3 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </div>

          {/* Progress Insights Card */}
          <div className="mt-6 bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 border border-slate-800/90 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-2 uppercase tracking-wider text-slate-300">
                  This Week's Progress
                </h3>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>4.5 hours learned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-bold">+15% from last week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Top 10% in community</span>
                  </div>
                </div>
              </div>

              <div>
                <Link to="/learning/analytics">
                  <Button size="sm" className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm text-xs h-9">
                    View Analytics
                    <TrendingUp className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Learning Navigation */}
      <LearningNavigation />
    </>
  );
};