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
      {/* Enhanced Hero Section with Apple-inspired design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/3 rounded-full translate-y-48 -translate-x-48"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-2 text-sm rounded-xl backdrop-blur-sm">
                AI Career Intelligence
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4 font-display">AI Career Roadmap</h1>
            <p className="text-lg text-purple-100 mb-8 max-w-xl mx-auto leading-relaxed">
              AI-powered career insights and personalized roadmaps for your professional growth.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link to="/career-map/ai-roadmap-builder">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 px-6 py-3 text-base font-semibold rounded-xl shadow-apple-medium">
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Building
                </Button>
              </Link>
              <Link to="/career-map/skills-gap">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-3 text-base font-semibold rounded-xl backdrop-blur-sm">
                  <Target className="h-5 w-5 mr-2" />
                  Analyze Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI-Powered Career Tools */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-4 font-display">AI-Powered Career Tools</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Leverage cutting-edge AI to make data-driven career decisions and accelerate your growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/career-map/ai-roadmap-builder">
              <Card className="group hover:shadow-apple-heavy transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-2xl hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-apple-medium">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-text-primary mb-3 font-display">AI Roadmap Builder</h3>
                  <p className="text-text-secondary text-base mb-4 leading-relaxed">Create personalized roadmaps</p>
                  <Badge className="bg-blue-50 text-blue-700 border-0 px-3 py-1 rounded-xl">Enhanced</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/my-roadmaps">
              <Card className="group hover:shadow-apple-heavy transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-2xl hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-apple-medium">
                    <Map className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-text-primary mb-3 font-display">My Roadmaps</h3>
                  <p className="text-text-secondary text-base mb-4 leading-relaxed">Track progress with timelines</p>
                  <Badge className="bg-emerald-50 text-emerald-700 border-0 px-3 py-1 rounded-xl">Active</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/switch">
              <Card className="group hover:shadow-apple-heavy transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-2xl hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-apple-medium">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-text-primary mb-3 font-display">Career Switch AI</h3>
                  <p className="text-text-secondary text-base mb-4 leading-relaxed">Smart risk assessment</p>
                  <Badge className="bg-orange-50 text-orange-700 border-0 px-3 py-1 rounded-xl">AI-Enhanced</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/skills-gap">
              <Card className="group hover:shadow-apple-heavy transition-all duration-300 border-0 bg-white/90 backdrop-blur-apple rounded-2xl hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-apple-medium">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-text-primary mb-3 font-display">Skills Gap Analyzer</h3>
                  <p className="text-text-secondary text-base mb-4 leading-relaxed">Market data insights</p>
                  <Badge className="bg-purple-50 text-purple-700 border-0 px-3 py-1 rounded-xl">Data-Driven</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Get Started Section - Enhanced */}
        {roadmaps.length === 0 && careerGoals.length === 0 && (
          <Card className="border-0 shadow-apple-heavy bg-white/95 backdrop-blur-apple rounded-2xl">
            <CardContent className="text-center py-20">
              <div className="max-w-3xl mx-auto">
                <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-apple-heavy">
                  <Brain className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-text-primary mb-6 font-display">Start Your AI-Powered Career Journey</h3>
                <p className="text-text-secondary text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
                  Leverage cutting-edge AI technology to create personalized career roadmaps and make data-driven decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link to="/career-map/ai-roadmap-builder">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-apple-medium">
                      <Brain className="h-6 w-6 mr-3" />
                      Create AI Roadmap
                    </Button>
                  </Link>
                  <Link to="/career-map/skills-gap">
                    <Button variant="outline" size="lg" className="border-gray-200 text-text-primary hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-2xl">
                      <Target className="h-6 w-6 mr-3" />
                      Analyze Skills Gap
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