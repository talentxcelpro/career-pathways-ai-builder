import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Calendar, Users, BookOpen, ArrowRight, Plus, Brain, Map, Zap, Star, BarChart, Rocket, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareerMap = () => {
  const { data: careerGoals = [], isLoading } = useQuery({
    queryKey: ['career_goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: roadmaps = [] } = useQuery({
    queryKey: ['roadmaps_overview'],
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
      return data;
    }
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
      {/* Ultra-Compact Hero Section with Apple-inspired design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 px-2 py-0.5 text-xs rounded-md backdrop-blur-sm">
                AI Intelligence
              </Badge>
            </div>
            <h1 className="text-xl font-bold mb-1 font-display">AI Career Roadmap</h1>
            <p className="text-xs text-purple-100 mb-4">
              AI-powered career insights and personalized roadmaps
            </p>
            
            <div className="flex gap-2 justify-center">
              <Link to="/career-map/ai-roadmap-builder">
                <Button size="sm" className="bg-white text-indigo-600 hover:bg-white/90 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-apple-light">
                  <Rocket className="h-3 w-3 mr-1" />
                  Build
                </Button>
              </Link>
              <Link to="/career-map/skills-gap">
                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-apple-light">
                  <Target className="h-3 w-3 mr-1" />
                  Analyze
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
            <h2 className="text-lg font-bold text-text-primary mb-1 font-display">AI Career Tools</h2>
            <p className="text-xs text-text-secondary">
              Leverage AI to make data-driven career decisions
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

        {/* Get Started Section - Minimal and Elegant */}
        {roadmaps.length === 0 && careerGoals.length === 0 && (
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
      </div>
    </div>
  );
};

export default CareerMap;