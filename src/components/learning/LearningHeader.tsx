import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
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
  const { displayName, streakDays } = useCurrentUserProfile();
  
  const friendlyName = React.useMemo(() => {
    if (!displayName) return 'Future Leader';
    if (displayName.includes('@')) {
      const base = displayName.split('@')[0].replace(/[._-]+/g, ' ').trim();
      return base ? base.replace(/\b\w/g, c => c.toUpperCase()) : 'Future Leader';
    }
    return displayName;
  }, [displayName]);

  const getStreakLevel = () => {
    if (streakDays >= 30) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (streakDays >= 14) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (streakDays >= 7) return { level: 'Committed', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'Getting Started', color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const streakInfo = getStreakLevel();

  return (
    <>
      {/* Main Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            
            {/* Welcome Section */}
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <Badge className={`${streakInfo.bg} ${streakInfo.color} border-0`}>
                    {streakDays} days • {streakInfo.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-blue-100">Learning Streak</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{friendlyName}</span>
              </h1>
              
              <p className="text-lg text-blue-100 mb-4 max-w-2xl">
                Continue your learning journey with personalized recommendations and industry-leading courses.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                {/* Quick Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">12</div>
                      <div className="text-xs text-blue-100">Active Courses</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">8</div>
                      <div className="text-xs text-blue-100">Certificates</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Buttons */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/learning/my-courses">
              <Button 
                variant="outline" 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <BookOpen className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                My Courses
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            
            <Link to="/learning/paths">
              <Button 
                variant="outline" 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <Target className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Learning Paths
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            
            <Link to="/learning/quick-learn">
              <Button 
                variant="outline" 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Quick Learn
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            
            <Link to="/learning/certificates">
              <Button 
                variant="outline" 
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <Award className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Certificates
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </div>

          {/* Progress Insights */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">This Week's Progress</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-blue-100">4.5 hours learned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-blue-100">+15% from last week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-blue-100">Top 10% in community</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <Link to="/learning/analytics">
                  <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    View Analytics
                    <TrendingUp className="h-4 w-4 ml-2" />
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