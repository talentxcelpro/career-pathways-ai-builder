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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 translate-x-36"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                AI-Powered Career Intelligence
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-6">Your AI Career Roadmap</h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Navigate your career journey with AI-powered insights, market analysis, and personalized roadmaps.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/career-map/ai-roadmap-builder">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 px-8 py-3">
                  <Rocket className="h-5 w-5 mr-2" />
                  Start AI Roadmap
                </Button>
              </Link>
              <Link to="/career-map/skills-gap">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3">
                  <Target className="h-5 w-5 mr-2" />
                  Analyze Skills Gap
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI-Powered Career Tools */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Career Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Leverage cutting-edge AI to make data-driven career decisions and accelerate your growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/career-map/ai-roadmap-builder">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">AI Roadmap Builder</h3>
                  <p className="text-gray-600 text-sm mb-4">Create personalized roadmaps with AI analysis</p>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enhanced</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/my-roadmaps">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-100 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Map className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">My Roadmaps</h3>
                  <p className="text-gray-600 text-sm mb-4">Track progress with interactive timelines</p>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/switch">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-amber-100 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Career Switch AI</h3>
                  <p className="text-gray-600 text-sm mb-4">Smart risk assessment & predictions</p>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">AI-Enhanced</Badge>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/career-map/skills-gap">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-100 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Skills Gap Analyzer</h3>
                  <p className="text-gray-600 text-sm mb-4">Market data-driven insights</p>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">Data-Driven</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* AI Career Intelligence Dashboard */}
        <Card className="mb-8 border-0 shadow-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <Star className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">AI Career Intelligence</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Real-time market analysis and personalized career recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">+32%</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Market Growth</div>
                <div className="text-xs text-gray-500">Your target industry</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">$125K</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Salary Potential</div>
                <div className="text-xs text-gray-500">With skill upgrades</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">18mo</div>
                <div className="text-sm font-medium text-gray-900 mb-1">Optimal Timeline</div>
                <div className="text-xs text-gray-500">AI-calculated path</div>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link to="/career-map/ai-roadmap-builder">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3">
                  <Brain className="h-5 w-5 mr-2" />
                  Get Detailed AI Analysis
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Get Started Section - Enhanced */}
        {roadmaps.length === 0 && careerGoals.length === 0 && (
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Start Your AI-Powered Career Journey</h3>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  Leverage cutting-edge AI technology to create personalized career roadmaps and make data-driven decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/career-map/ai-roadmap-builder">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3">
                      <Brain className="h-5 w-5 mr-2" />
                      Create AI Roadmap
                    </Button>
                  </Link>
                  <Link to="/career-map/skills-gap">
                    <Button variant="outline" size="lg" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-8 py-3">
                      <Target className="h-5 w-5 mr-2" />
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