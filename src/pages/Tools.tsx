
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Calculator, 
  FileText, 
  Users, 
  TrendingUp, 
  Search, 
  Star, 
  Clock, 
  Zap,
  Target,
  BookOpen,
  MessageSquare,
  BarChart3,
  Briefcase,
  User,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPremium: boolean;
  popularity: number;
  estimatedTime: string;
  path: string;
  features: string[];
}

const Tools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toolUsage, setToolUsage] = useState<Record<string, number>>({});

  const tools: Tool[] = [
    {
      id: 'salary-analyzer',
      name: 'Salary Analyzer',
      description: 'Analyze salary ranges and market rates for your role and location with real data',
      icon: <Calculator className="h-6 w-6" />,
      category: 'career',
      isPremium: false,
      popularity: 95,
      estimatedTime: '3-5 min',
      path: '/tools/salary-analyzer',
      features: ['Market Analysis', 'Location Comparison', 'Industry Benchmarks']
    },
    {
      id: 'interview-prep',
      name: 'AI Interview Prep',
      description: 'Practice interviews with AI-powered questions, tips, and performance tracking',
      icon: <MessageSquare className="h-6 w-6" />,
      category: 'interview',
      isPremium: true,
      popularity: 88,
      estimatedTime: '15-30 min',
      path: '/tools/interview-prep',
      features: ['Mock Interviews', 'AI Feedback', 'Question Bank']
    },
    {
      id: 'career-pathfinder',
      name: 'Career Pathfinder',
      description: 'Discover personalized career paths with AI-powered recommendations and roadmaps',
      icon: <Target className="h-6 w-6" />,
      category: 'career',
      isPremium: true,
      popularity: 84,
      estimatedTime: '8-12 min',
      path: '/tools/career-pathfinder',
      features: ['AI Recommendations', 'Career Roadmaps', 'Market Insights']
    },
    {
      id: 'resume-optimizer',
      name: 'Resume Optimizer',
      description: 'Optimize your resume with AI-powered analysis, ATS compatibility, and keyword suggestions',
      icon: <FileText className="h-6 w-6" />,
      category: 'resume',
      isPremium: false,
      popularity: 92,
      estimatedTime: '10-15 min',
      path: '/tools/resume-optimizer',
      features: ['ATS Optimization', 'Keyword Analysis', 'Section Scoring']
    },
    {
      id: 'network-builder',
      name: 'Network Builder',
      description: 'Build strategic professional connections with AI-powered networking recommendations',
      icon: <Users className="h-6 w-6" />,
      category: 'networking',
      isPremium: false,
      popularity: 76,
      estimatedTime: '5-10 min',
      path: '/tools/network-builder',
      features: ['Connection Matching', 'Message Templates', 'Industry Insights']
    },
    {
      id: 'skill-assessor',
      name: 'Skill Assessor',
      description: 'Assess your skills with AI-powered tests and get personalized improvement plans',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'skills',
      isPremium: false,
      popularity: 82,
      estimatedTime: '12-20 min',
      path: '/tools/skill-assessor',
      features: ['Skill Testing', 'Level Assessment', 'Learning Resources']
    },
    {
      id: 'job-matcher',
      name: 'AI Job Matcher',
      description: 'Find jobs that match your profile with AI precision and compatibility scoring',
      icon: <Briefcase className="h-6 w-6" />,
      category: 'job-search',
      isPremium: true,
      popularity: 90,
      estimatedTime: '2-5 min',
      path: '/tools/job-matcher',
      features: ['Smart Matching', 'Compatibility Score', 'Application Insights']
    },
    {
      id: 'profile-scorer',
      name: 'Profile Scorer',
      description: 'Get a comprehensive score for your professional profile with optimization tips',
      icon: <User className="h-6 w-6" />,
      category: 'profile',
      isPremium: false,
      popularity: 78,
      estimatedTime: '3-7 min',
      path: '/tools/profile-scorer',
      features: ['Profile Analysis', 'Optimization Tips', 'Visibility Score']
    },
    {
      id: 'market-insights',
      name: 'Market Insights',
      description: 'Get real-time job market insights, trends, and demand forecasting',
      icon: <TrendingUp className="h-6 w-6" />,
      category: 'analytics',
      isPremium: true,
      popularity: 86,
      estimatedTime: '5-8 min',
      path: '/tools/market-insights',
      features: ['Industry Trends', 'Demand Forecasting', 'Salary Trends']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tools', count: tools.length },
    { id: 'career', name: 'Career', count: tools.filter(t => t.category === 'career').length },
    { id: 'interview', name: 'Interview', count: tools.filter(t => t.category === 'interview').length },
    { id: 'resume', name: 'Resume', count: tools.filter(t => t.category === 'resume').length },
    { id: 'job-search', name: 'Job Search', count: tools.filter(t => t.category === 'job-search').length },
    { id: 'skills', name: 'Skills', count: tools.filter(t => t.category === 'skills').length },
    { id: 'networking', name: 'Networking', count: tools.filter(t => t.category === 'networking').length },
    { id: 'profile', name: 'Profile', count: tools.filter(t => t.category === 'profile').length },
    { id: 'analytics', name: 'Analytics', count: tools.filter(t => t.category === 'analytics').length }
  ];

  const filteredTools = tools.filter(tool => {
    if (!searchQuery) {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesCategory;
    }

    const query = searchQuery.toLowerCase();
    
    // Natural language search patterns
    const naturalLanguageMatches = [
      // Intent-based matching
      query.includes('interview') && tool.category === 'interview',
      query.includes('resume') && tool.category === 'resume',
      query.includes('salary') && tool.id.includes('salary'),
      query.includes('job') && (tool.category === 'job-search' || tool.id.includes('job')),
      query.includes('career') && tool.category === 'career',
      query.includes('skill') && tool.category === 'skills',
      query.includes('network') && tool.category === 'networking',
      query.includes('profile') && tool.category === 'profile',
      query.includes('market') && tool.id.includes('market'),
      
      // Feature-based matching
      query.includes('ai') && tool.description.toLowerCase().includes('ai'),
      query.includes('free') && !tool.isPremium,
      query.includes('premium') && tool.isPremium,
      query.includes('popular') && tool.popularity >= 85,
      query.includes('quick') && parseInt(tool.estimatedTime.split('-')[0]) <= 5,
      query.includes('analysis') && tool.description.toLowerCase().includes('analy'),
      query.includes('optimization') && tool.description.toLowerCase().includes('optimi'),
      query.includes('matching') && tool.description.toLowerCase().includes('match'),
      
      // Action-based matching
      query.includes('improve') && (tool.category === 'skills' || tool.category === 'profile'),
      query.includes('find') && tool.category === 'job-search',
      query.includes('practice') && tool.category === 'interview',
      query.includes('build') && (tool.category === 'networking' || tool.category === 'resume'),
      query.includes('assess') && tool.category === 'skills',
      query.includes('score') && tool.id.includes('score'),
    ];

    // Traditional keyword matching
    const keywordMatches = tool.name.toLowerCase().includes(query) ||
                          tool.description.toLowerCase().includes(query) ||
                          tool.features.some(feature => feature.toLowerCase().includes(query)) ||
                          tool.category.toLowerCase().includes(query);

    const matchesSearch = naturalLanguageMatches.some(match => match) || keywordMatches;
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularTools = tools.filter(tool => tool.popularity >= 85).sort((a, b) => b.popularity - a.popularity);
  const freeTools = tools.filter(tool => !tool.isPremium);

  useEffect(() => {
    // Load tool usage statistics
    const loadToolUsage = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('tool_usage')
          .select('tool_name, id')
          .eq('user_id', user.id);

        if (error) throw error;

        const usage: Record<string, number> = {};
        data?.forEach(record => {
          usage[record.tool_name] = (usage[record.tool_name] || 0) + 1;
        });
        setToolUsage(usage);
      } catch (error) {
        console.error('Error loading tool usage:', error);
      }
    };

    loadToolUsage();
  }, [user]);

  const handleToolClick = async (tool: Tool) => {
    if (tool.isPremium && !user) {
      toast.error('Please login to access premium tools');
      navigate('/auth/login');
      return;
    }

    // Track tool usage
    if (user) {
      try {
        await supabase.from('tool_usage').insert({
          user_id: user.id,
          tool_name: tool.id,
          session_data: { clicked_at: new Date().toISOString() }
        });
      } catch (error) {
        console.error('Error tracking tool usage:', error);
      }
    }

    navigate(tool.path);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career': return <Target className="h-4 w-4" />;
      case 'interview': return <MessageSquare className="h-4 w-4" />;
      case 'resume': return <FileText className="h-4 w-4" />;
      case 'job-search': return <Briefcase className="h-4 w-4" />;
      case 'skills': return <BookOpen className="h-4 w-4" />;
      case 'networking': return <Users className="h-4 w-4" />;
      case 'profile': return <User className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI-Powered Career Tools</h1>
                <p className="text-blue-100 text-sm">Transform your career with intelligent tools</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{tools.length}</div>
                <p className="text-blue-100">Tools</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{freeTools.length}</div>
                <p className="text-blue-100">Free</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{Object.values(toolUsage).reduce((a, b) => a + b, 0)}</div>
                <p className="text-blue-100">Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search tools naturally - try 'find free interview tools' or 'improve my resume'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl border-0 bg-white shadow-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 transition-all duration-200 ${
                  selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {getCategoryIcon(category.id)}
                {category.name}
                <Badge 
                  variant="secondary" 
                  className={`ml-1 text-xs ${
                    selectedCategory === category.id ? 'bg-white/20 text-white' : 'bg-gray-100'
                  }`}
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Tools */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              Most Popular Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {popularTools.slice(0, 3).map((tool) => (
                <Card 
                  key={tool.id} 
                  className="group cursor-pointer overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50"
                  onClick={() => handleToolClick(tool)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white group-hover:scale-110 transition-transform">
                          {tool.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold">{tool.name}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              <Zap className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                            {tool.isPremium && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{tool.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <TrendingUp className="h-4 w-4" />
                          <span>{tool.popularity}% popular</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Popularity</span>
                          <span className="font-bold text-blue-600">{tool.popularity}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={tool.popularity} className="h-3 bg-gray-100" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" style={{width: `${tool.popularity}%`}}></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-sm font-medium text-gray-900">Key Features:</span>
                        <div className="flex flex-wrap gap-2">
                          {tool.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {toolUsage[tool.id] && (
                        <div className="pt-3 border-t border-gray-100">
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Used {toolUsage[tool.id]} time{toolUsage[tool.id] > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            {selectedCategory === 'all' ? 'All Tools' : `${categories.find(c => c.id === selectedCategory)?.name} Tools`}
          </h2>
          
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12 p-1 bg-gray-100 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">All Tools</TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Popular</TabsTrigger>
              <TabsTrigger value="free" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Free Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                    onClick={() => handleToolClick(tool)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-300">
                            {tool.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{tool.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              {tool.isPremium && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{tool.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{tool.popularity}%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Progress value={tool.popularity} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-medium">Features:</span>
                          <div className="flex flex-wrap gap-1">
                            {tool.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {toolUsage[tool.id] && (
                          <div className="pt-2 border-t">
                            <span className="text-xs text-green-600">
                              ✓ Used {toolUsage[tool.id]} time{toolUsage[tool.id] > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                    onClick={() => handleToolClick(tool)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white transition-all duration-300">
                            {tool.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{tool.name}</CardTitle>
                            <Badge className="mt-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{tool.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{tool.popularity}% popular</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-medium">Features:</span>
                          <div className="flex flex-wrap gap-1">
                            {tool.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="free">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {freeTools.map((tool) => (
                  <Card 
                    key={tool.id} 
                    className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                    onClick={() => handleToolClick(tool)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:from-green-500 group-hover:to-emerald-500 group-hover:text-white transition-all duration-300">
                            {tool.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{tool.name}</CardTitle>
                            <Badge className="mt-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                              Free
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{tool.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{tool.popularity}% popular</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-medium">Features:</span>
                          <div className="flex flex-wrap gap-1">
                            {tool.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Brain className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No tools found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try adjusting your search or filters to find the tools you need. Our AI-powered tools are here to help accelerate your career.
            </p>
            <Button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
