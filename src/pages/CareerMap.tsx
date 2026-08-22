import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, Users, BookOpen, ArrowRight, Plus, Brain, Map, Zap, Star, BarChart, Rocket, Award, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { VisualRoadmapShowcase } from '@/components/roadmap/VisualRoadmapShowcase';
import { useRealCareerData } from '@/hooks/useRealCareerData';
import { useOptimizedCareerData } from '@/hooks/useOptimizedCareerData';
import { useSafeRealtimeContext } from '@/components/realtime/SafeRealtimeProvider';
import { InteractiveCareerPath } from '@/components/career-map/InteractiveCareerPath';
import { CareerInputModal } from '@/components/career-map/CareerInputModal';
import { toast } from 'sonner';

const CareerMap = () => {
  const navigate = useNavigate();
  // Real-time career data integration (with fallback)
  const { metrics, achievementTriggers, isLoading: careerLoading, refreshMetrics } = useRealCareerData();
  const { metrics: optimizedMetrics, insights, profile, isLoading: optimizedLoading } = useOptimizedCareerData();
  
  // Interactive path builder state
  const [showPathBuilder, setShowPathBuilder] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  
  // Safe realtime context
  const { isConnected, lastUpdate } = useSafeRealtimeContext();

  // Use optimized data when available, fallback to real career data
  const currentMetrics = optimizedMetrics || metrics;
  const isLoading = careerLoading || optimizedLoading;

  // Query for career goals with real-time updates
  const { data: careerGoals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['career_goals', lastUpdate?.table],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_career_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Fallback to legacy career_goals if exists
        const { data: fallbackData } = await supabase
          .from('career_goals' as any)
          .select('*')
          .eq('user_id', user.id);
        return fallbackData?.map((goal: any) => ({
          ...goal,
          clickable: true,
          link: `/career-map/goal/${goal.id}`
        })) || [];
      }
      return data?.map(goal => ({
        ...goal,
        title: goal.target_role,
        clickable: true,
        link: `/career-map/goal/${goal.id}`
      })) || [];
    },
    refetchOnWindowFocus: false,
    staleTime: isConnected ? 30000 : 5000, // Longer cache when realtime connected
  });

  // Query for roadmaps with real-time updates
  const { data: roadmaps = [], refetch: refetchRoadmaps } = useQuery({
    queryKey: ['roadmaps_overview', lastUpdate?.table],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data?.map(roadmap => ({
        ...roadmap,
        clickable: true,
        link: `/career-map/${roadmap.id}`
      })) || [];
    },
    refetchOnWindowFocus: false,
    staleTime: isConnected ? 30000 : 5000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <Brain className="h-6 w-6 text-indigo-600 absolute top-3 left-3 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-slate-700">Building your career map...</p>
          <p className="text-sm text-slate-500">AI is analyzing optimal paths</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with TalentXcel branding */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E2A78] via-purple-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-md">
                  <img 
                    src="/talentxcel-official-logo.png" 
                    alt="TalentXcel" 
                    className="h-full w-full object-contain"
                  />
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Link to="/ai" className="hover:opacity-80 transition-opacity">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                </Link>
                <Link to="/ai" className="hover:opacity-80 transition-opacity">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 text-sm rounded-md backdrop-blur-sm">
                    AI Intelligence
                  </Badge>
                </Link>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 font-display">TalentXcel AI-Powered Career Roadmaps Designed for You</h1>
            <p className="text-base text-purple-100 mb-6">
              Get personalized career roadmaps with TalentXcel AI-powered insights and smart recommendations
            </p>
            
            <div className="flex gap-3 justify-center">
              <Link to="/career-map/ai-roadmap-builder">
                <Button size="lg" className="bg-[#28C76F] text-white hover:bg-[#28C76F]/90 px-4 py-2 text-sm font-semibold rounded-lg shadow-apple-light">
                  <Rocket className="h-4 w-4 mr-2" />
                  Build Roadmap
                </Button>
              </Link>
              <Link to="/career-map/skills-gap">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-semibold rounded-lg shadow-apple-light">
                  <Target className="h-4 w-4 mr-2" />
                  Analyze Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* AI-Powered Career Tools - Ultra-Compact Design */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-text-primary mb-1 font-display">TalentXcel AI Career Tools</h2>
            <p className="text-xs text-text-secondary">
              Leverage TalentXcel AI to make data-driven career decisions
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to="/career-map/ai-roadmap-builder">
              <Card className="group hover:shadow-apple-medium transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-xl hover:-translate-y-0.5">
                <CardContent className="p-3 text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-apple-light">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-xs text-text-primary mb-1 font-display">AI Roadmap</h3>
                  <p className="text-text-secondary text-xs mb-1">Personalized paths</p>
                  <Badge className="bg-blue-50 text-blue-700 border-0 px-1.5 py-0.5 rounded-md text-xs">Enhanced</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/my-roadmaps">
              <Card className="group hover:shadow-apple-medium transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-xl hover:-translate-y-0.5">
                <CardContent className="p-3 text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-apple-light">
                    <Map className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-xs text-text-primary mb-1 font-display">My Roadmaps</h3>
                  <p className="text-text-secondary text-xs mb-1">Track progress</p>
                  <Badge className="bg-emerald-50 text-emerald-700 border-0 px-1.5 py-0.5 rounded-md text-xs">Active</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/switch">
              <Card className="group hover:shadow-apple-medium transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-xl hover:-translate-y-0.5">
                <CardContent className="p-3 text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-apple-light">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-xs text-text-primary mb-1 font-display">Career Switch</h3>
                  <p className="text-text-secondary text-xs mb-1">Risk assessment</p>
                  <Badge className="bg-orange-50 text-orange-700 border-0 px-1.5 py-0.5 rounded-md text-xs">AI-Enhanced</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/skills-gap">
              <Card className="group hover:shadow-apple-medium transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-xl hover:-translate-y-0.5">
                <CardContent className="p-3 text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-apple-light">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-xs text-text-primary mb-1 font-display">Skills Gap</h3>
                  <p className="text-text-secondary text-xs mb-1">Market insights</p>
                  <Badge className="bg-purple-50 text-purple-700 border-0 px-1.5 py-0.5 rounded-md text-xs">Data-Driven</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Real-time Career Progress - Enhanced */}
        {currentMetrics && (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-text-primary mb-1 font-display">Your Career Progress</h2>
              <div className="text-xs text-text-secondary flex items-center justify-center gap-2">
                Live data from your TalentXcel profile
                {isConnected && (
                  <Badge className="bg-green-50 text-green-700 border-0 px-1.5 py-0.5 rounded-md text-xs">
                    Live
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <Link to="/profile/edit">
                <Card className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <CardContent className="p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-xs text-text-primary mb-1">Profile</h3>
                    <p className="text-lg font-bold text-text-primary">{currentMetrics.profileCompletion}%</p>
                    <Progress value={currentMetrics.profileCompletion} className="h-1 mt-1" />
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/jobs/applications">
                <Card className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <CardContent className="p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-xs text-text-primary mb-1">Applications</h3>
                    <p className="text-lg font-bold text-text-primary">{currentMetrics.jobApplications}</p>
                    <p className="text-xs text-text-secondary">Jobs applied</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/network">
                <Card className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <CardContent className="p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-xs text-text-primary mb-1">Network</h3>
                    <p className="text-lg font-bold text-text-primary">{currentMetrics.connections}</p>
                    <p className="text-xs text-text-secondary">Connections</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/wallet/txc">
                <Card className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <CardContent className="p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-xs text-text-primary mb-1">TXC Earned</h3>
                    <p className="text-lg font-bold text-text-primary">{currentMetrics.totalTXCEarned}</p>
                    <p className="text-xs text-text-secondary">Tokens</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Achievement Progress */}
            {achievementTriggers && achievementTriggers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-text-primary mb-3">Next Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {achievementTriggers
                    .filter(achievement => !achievement.earned)
                    .slice(0, 4)
                    .map((achievement) => {
                      const handleAchievementClick = () => {
                        // Navigate to relevant section based on achievement type
                        switch (achievement.type) {
                          case 'profile':
                            navigate('/profile/edit');
                            break;
                          case 'networking':
                            navigate('/network');
                            break;
                          case 'applications':
                            navigate('/jobs/applications');
                            break;
                          case 'skills':
                            navigate('/profile/skills');
                            break;
                          case 'content':
                            navigate('/network/posts');
                            break;
                          case 'learning':
                            navigate('/learning');
                            break;
                          case 'tokens':
                            navigate('/wallet/txc');
                            break;
                          case 'streaks':
                            navigate('/dashboard/streaks');
                            break;
                          default:
                            navigate('/dashboard');
                        }
                      };
                      
                      return (
                        <Card 
                          key={achievement.id} 
                          className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                          onClick={handleAchievementClick}
                        >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-text-primary">{achievement.title}</h4>
                            <Badge className="bg-blue-50 text-blue-700 border-0 px-1.5 py-0.5 rounded-md text-xs">
                              {achievement.points} TXC
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(achievement.progress / achievement.requirement) * 100} 
                              className="h-1 flex-1" 
                            />
                            <span className="text-xs text-text-secondary">
                              {achievement.progress}/{achievement.requirement}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                     );
                    })}
                </div>
              </div>
            )}

            {/* Active Goals & Roadmaps */}
            {(careerGoals.length > 0 || roadmaps.length > 0) && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {careerGoals.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-text-primary mb-3 font-display">Active Career Goals</h3>
                      <div className="space-y-3">
                        {careerGoals.map((goal: any) => (
                          <Link key={goal.id} to={goal.link || `/career-map/goal/${goal.id}`}>
                            <Card className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-xs font-semibold text-text-primary">{goal.target_role || goal.title || 'Career Goal'}</h4>
                                  <Badge className="bg-purple-50 text-purple-700 border-0 px-1.5 py-0.5 rounded-md text-xs">
                                    {goal.timeline_months ? `${goal.timeline_months} mo` : 'Active'}
                                  </Badge>
                                </div>
                                {goal.target_location && (
                                  <p className="text-xs text-text-secondary">{goal.target_location}</p>
                                )}
                                {goal.current_readiness_score !== null && goal.current_readiness_score !== undefined && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <Progress value={goal.current_readiness_score} className="h-1 flex-1" />
                                    <span className="text-xs text-text-secondary">{goal.current_readiness_score}% readiness</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {roadmaps.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-text-primary mb-3 font-display">Active Roadmaps</h3>
                      <div className="space-y-3">
                        {roadmaps.map((roadmap: any) => (
                          <Link key={roadmap.id} to={roadmap.link || `/career-map/${roadmap.id}`}>
                            <Card className="border-0 bg-white/90 backdrop-blur-apple rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-xs font-semibold text-text-primary">{roadmap.title || roadmap.target_role}</h4>
                                  <Badge className="bg-emerald-50 text-emerald-700 border-0 px-1.5 py-0.5 rounded-md text-xs">
                                    {roadmap.status || 'Active'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-text-secondary mb-2">{roadmap.target_role ? `Target: ${roadmap.target_role}` : roadmap.description}</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={roadmap.progress_percentage || 0} className="h-1 flex-1" />
                                  <span className="text-xs text-text-secondary">{roadmap.progress_percentage || 0}%</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Get Started Section - Minimal and Elegant */}
        {(!currentMetrics || (roadmaps.length === 0 && careerGoals.length === 0)) && (
          <Card className="border-0 shadow-apple-light bg-white/95 backdrop-blur-apple rounded-xl">
            <CardContent className="text-center py-8">
              <div className="max-w-lg mx-auto">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-apple-light">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2 font-display">Start Your AI Journey</h3>
                <p className="text-text-secondary text-xs mb-6">
                  Create personalized career roadmaps with AI technology
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/career-map/ai-roadmap-builder">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 text-xs font-semibold rounded-lg shadow-apple-light">
                      <Brain className="h-3 w-3 mr-1" />
                      Create Roadmap
                    </Button>
                  </Link>
                  <Link to="/career-map/skills-gap">
                    <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-xs font-semibold rounded-lg shadow-apple-light">
                      <Target className="h-3 w-3 mr-1" />
                      Analyze Skills
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interactive Career Path Builder */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-2 font-display">
              Interactive Career Progression
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Build your personalized career path step by step
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowPathBuilder(!showPathBuilder)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 shadow-apple-light hover:shadow-apple-medium transition-all duration-300"
              >
                <Target className="h-4 w-4 mr-2" />
                {showPathBuilder ? 'Hide' : 'Build'} Career Path
              </Button>
              
              <Button
                onClick={() => setShowCareerModal(true)}
                variant="outline"
                className="px-4 py-2 hover:shadow-apple-medium transition-all duration-300"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Generate Path
              </Button>
            </div>
          </div>
          
          {showPathBuilder && (
            <InteractiveCareerPath
              onSave={async (path) => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    toast.error('Please sign in to save your career path');
                    return;
                  }
                  const { error } = await supabase.from('roadmaps').insert({
                    user_id: user.id,
                    title: (path as any)?.title || (path as any)?.targetRole || 'Career Roadmap',
                    target_role: (path as any)?.targetRole || '',
                    current_position: (path as any)?.currentRole || '',
                    description: (path as any)?.description || '',
                    roadmap_data: path as any,
                    status: 'active'
                  });
                  if (error) throw error;
                  toast.success('Career path saved successfully');
                  refetchRoadmaps();
                } catch (err: any) {
                  console.error('Error saving career path:', err);
                  toast.error('Failed to save career path');
                }
              }}
              className="mb-6"
            />
          )}
        </div>

        {/* Visual Roadmaps Section */}
        <div className="mb-8">
          <VisualRoadmapShowcase />
        </div>
        
        {/* Footer Note */}
        <div className="text-center py-8 mt-12">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <p className="text-sm text-text-secondary">
              Powered by TalentXcel AI – India's Intelligent Career Platform
            </p>
          </Link>
        </div>
      </div>

      {/* Career Input Modal */}
      <CareerInputModal
        open={showCareerModal}
        onOpenChange={setShowCareerModal}
        onSubmit={async (data) => {
          setShowCareerModal(false);
          setShowPathBuilder(true);
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { error } = await supabase.from('user_career_goals').insert({
                user_id: user.id,
                target_role: (data as any)?.targetRole || '',
                timeline_months: (data as any)?.timeline ? parseInt((data as any).timeline) : 12,
                status: 'active'
              });
              if (!error) {
                toast.success('Career goal saved');
                refetchGoals();
              }
            }
          } catch (err) {
            console.error('Error creating career goal:', err);
          }
        }}
      />
    </div>
  );
};

export default CareerMap;