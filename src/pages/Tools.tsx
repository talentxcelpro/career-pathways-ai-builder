
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  is_premium: boolean;
  popularity: number;
  estimated_time: string;
  path: string;
  features: string[];
}

const Tools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toolUsage, setToolUsage] = useState<Record<string, number>>({});

  // For now, show empty state as tools table doesn't exist yet
  const tools: Tool[] = [];
  const toolsLoading = false;

  const getToolIcon = (category: string) => {
    switch (category) {
      case 'career': return <Target className="h-6 w-6" />;
      case 'interview': return <MessageSquare className="h-6 w-6" />;
      case 'resume': return <FileText className="h-6 w-6" />;
      case 'job-search': return <Briefcase className="h-6 w-6" />;
      case 'skills': return <BookOpen className="h-6 w-6" />;
      case 'networking': return <Users className="h-6 w-6" />;
      case 'profile': return <User className="h-6 w-6" />;
      case 'analytics': return <BarChart3 className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  const categories = React.useMemo(() => [
    { id: 'all', name: 'All Tools', count: tools.length },
    { id: 'career', name: 'Career', count: tools.filter(t => t.category === 'career').length },
    { id: 'interview', name: 'Interview', count: tools.filter(t => t.category === 'interview').length },
    { id: 'resume', name: 'Resume', count: tools.filter(t => t.category === 'resume').length },
    { id: 'job-search', name: 'Job Search', count: tools.filter(t => t.category === 'job-search').length },
    { id: 'skills', name: 'Skills', count: tools.filter(t => t.category === 'skills').length },
    { id: 'networking', name: 'Networking', count: tools.filter(t => t.category === 'networking').length },
    { id: 'profile', name: 'Profile', count: tools.filter(t => t.category === 'profile').length },
    { id: 'analytics', name: 'Analytics', count: tools.filter(t => t.category === 'analytics').length }
  ], [tools]);

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
      query.includes('free') && !tool.is_premium,
      query.includes('premium') && tool.is_premium,
      query.includes('popular') && tool.popularity >= 85,
      query.includes('quick') && parseInt(tool.estimated_time?.split('-')[0] || '10') <= 5,
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

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    setSearchQuery(query);
  };

  const popularTools = React.useMemo(() => 
    tools.filter(tool => tool.popularity >= 85).sort((a, b) => b.popularity - a.popularity),
    [tools]
  );
  const freeTools = React.useMemo(() => 
    tools.filter(tool => !tool.is_premium),
    [tools]
  );

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
    if (tool.is_premium && !user) {
      toast.error('Please login to access premium tools');
      navigate('/auth/login');
      return;
    }

    // Track tool usage
    if (user) {
      try {
        await supabase.from('tool_usage').insert({
          user_id: user.id,
          tool_name: tool.name,
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
      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AI-Powered Career Tools</h1>
                <p className="text-blue-100 text-xs">Transform your career with intelligent tools</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs">
              <button 
                onClick={() => navigate('/tools?filter=used')}
                className="text-center hover:bg-white/10 rounded-lg p-2 transition-all duration-200 hover-scale cursor-pointer"
              >
                <div className="font-bold text-sm">{Object.values(toolUsage).reduce((a, b) => a + b, 0)}</div>
                <p className="text-blue-100">Used</p>
              </button>
              <button 
                onClick={() => navigate('/tools?filter=completed')}
                className="text-center hover:bg-white/10 rounded-lg p-2 transition-all duration-200 hover-scale cursor-pointer"
              >
                <div className="font-bold text-sm">2</div>
                <p className="text-blue-100">Done</p>
              </button>
              <button 
                onClick={() => navigate('/bookmarks')}
                className="text-center hover:bg-white/10 rounded-lg p-2 transition-all duration-200 hover-scale cursor-pointer"
              >
                <div className="font-bold text-sm">0</div>
                <p className="text-blue-100">Saved</p>
              </button>
              <button 
                onClick={() => navigate('/tools?filter=available')}
                className="text-center hover:bg-white/10 rounded-lg p-2 transition-all duration-200 hover-scale cursor-pointer"
              >
                <div className="font-bold text-sm">{tools.filter(t => !t.is_premium).length}</div>
                <p className="text-blue-100">Available</p>
              </button>
            </div>
          </div>
        </div>

        {/* AI-Powered Tools Search */}
        <div className="mb-4">
          <UniversalSearchBar
            searchType="jobs"
            onSearch={handleUniversalSearch}
            placeholder="Try: 'free tools to improve my resume for tech jobs'"
            showSuggestions={true}
            showFilters={false}
            className="mb-3"
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-200 ${
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

        {/* Empty State for Tools */}
        <div className="text-center py-16">
          <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Brain className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Tools Coming Soon
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Our AI-powered career tools are being prepared. They will be available soon to help accelerate your career growth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tools;
