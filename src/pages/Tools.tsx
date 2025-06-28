
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
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Career Tools</h1>
          <p className="text-gray-600">
            Fully functional AI tools with real results to supercharge your career growth
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tools, features, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {getCategoryIcon(category.id)}
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Tools Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Tools</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="free">Free Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  onClick={() => handleToolClick(tool)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          {tool.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          {tool.isPremium && (
                            <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-500">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
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
                        <div className="flex items-center justify-between text-sm">
                          <span>Popularity</span>
                          <span>{tool.popularity}%</span>
                        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  onClick={() => handleToolClick(tool)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          {tool.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge className="mt-1 bg-orange-100 text-orange-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  onClick={() => handleToolClick(tool)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          {tool.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge className="mt-1 bg-green-100 text-green-800">
                            Free
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
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

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tools found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters to find the tools you need.
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{tools.length}</div>
              <p className="text-sm text-gray-600">Total Tools</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{freeTools.length}</div>
              <p className="text-sm text-gray-600">Free Tools</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{tools.filter(t => t.isPremium).length}</div>
              <p className="text-sm text-gray-600">Premium Tools</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{Object.values(toolUsage).reduce((a, b) => a + b, 0)}</div>
              <p className="text-sm text-gray-600">Your Usage</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tools;
