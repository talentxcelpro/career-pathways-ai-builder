import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Settings,
  Menu,
  X,
  Award,
  Shield,
  ArrowRightLeft,
  Video,
  Send,
  DollarSign,
  Network,
  Edit3,
  Scissors,
  PieChart,
  ChevronRight,
  Sparkles,
  Crown,
  Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';
import { useToolsData } from '@/hooks/useToolsData';
import { toolsRoutes } from '@/navigation/toolsRoutes';

interface FeaturedTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPremium: boolean;
  isFeatured: boolean;
  estimatedTime: string;
  path: string;
  features: string[];
  popularity: number;
}

const Tools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    tools, 
    filteredTools, 
    toolUsage, 
    savedResults,
    isLoading,
    setSelectedCategory: setDataCategory,
    setSearchQuery: setDataSearchQuery,
    toolCategories,
    usageStats,
    logToolUsage
  } = useToolsData();

  // Featured tools configuration
  const featuredTools: FeaturedTool[] = [
    {
      id: 'ai-career-pathfinder',
      name: 'TalentXcel AI Career Pathfinder',
      description: 'Discover your ideal career path with TalentXcel AI-powered insights and personalized recommendations',
      icon: <Target className="h-6 w-6" />,
      category: 'career',
      isPremium: true,
      isFeatured: true,
      estimatedTime: '15-20 min',
      path: '/tools/ai-career-pathfinder',
      features: ['Career Mapping', 'Skill Analysis', 'Growth Recommendations'],
      popularity: 95
    },
    {
      id: 'ai-resume-builder',
      name: 'TalentXcel AI Resume Builder',
      description: 'Create professional resumes with TalentXcel AI assistance and ATS optimization',
      icon: <FileText className="h-6 w-6" />,
      category: 'resume',
      isPremium: false,
      isFeatured: true,
      estimatedTime: '10-15 min',
      path: '/tools/ai-resume-builder',
      features: ['ATS Optimization', 'Smart Templates', 'Real-time Feedback'],
      popularity: 92
    },
    {
      id: 'ai-job-match-gpt',
      name: 'TalentXcel AI Job Match',
      description: 'Find perfect job matches using TalentXcel AI matching algorithms',
      icon: <Briefcase className="h-6 w-6" />,
      category: 'job-search',
      isPremium: true,
      isFeatured: true,
      estimatedTime: '5-10 min',
      path: '/tools/ai-job-match-gpt',
      features: ['TalentXcel Smart Match', 'Salary Insights', 'Application Tracking'],
      popularity: 88
    },
    {
      id: 'cover-letter-generator',
      name: 'TalentXcel Cover Letter AI',
      description: 'Generate compelling cover letters with TalentXcel AI tailored to specific job applications',
      icon: <Edit3 className="h-6 w-6" />,
      category: 'profile',
      isPremium: false,
      isFeatured: true,
      estimatedTime: '8-12 min',
      path: '/tools/cover-letter-generator',
      features: ['Job-specific Content', 'Professional Tone', 'Multiple Templates'],
      popularity: 85
    },
    {
      id: 'career-growth-score',
      name: 'Career Growth Score',
      description: 'Analyze your career progress and get actionable growth recommendations',
      icon: <Award className="h-6 w-6" />,
      category: 'analytics',
      isPremium: false,
      isFeatured: false,
      estimatedTime: '5-8 min',
      path: '/tools/career-growth-score',
      features: ['Progress Tracking', 'Skill Assessment', 'Goal Setting'],
      popularity: 82
    },
    {
      id: 'mock-interview-simulator',
      name: 'TalentXcel AI Interview Coach',
      description: 'Practice interviews with TalentXcel AI-powered simulation and feedback',
      icon: <Video className="h-6 w-6" />,
      category: 'interview',
      isPremium: true,
      isFeatured: false,
      estimatedTime: '20-30 min',
      path: '/tools/mock-interview-simulator',
      features: ['Video Practice', 'TalentXcel AI Feedback', 'Industry-specific Questions'],
      popularity: 78
    },
    {
      id: 'ai-learning-path-generator',
      name: 'TalentXcel Learning AI',
      description: 'Create personalized learning paths with TalentXcel AI to advance your skills and career',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'skills',
      isPremium: false,
      isFeatured: false,
      estimatedTime: '12-18 min',
      path: '/tools/ai-learning-path-generator',
      features: ['Skill Roadmaps', 'Resource Recommendations', 'Progress Tracking'],
      popularity: 75
    },
    {
      id: 'professional-bio-writer',
      name: 'Professional Bio Writer',
      description: 'Craft compelling professional bios for LinkedIn and other platforms',
      icon: <User className="h-6 w-6" />,
      category: 'profile',
      isPremium: false,
      isFeatured: false,
      estimatedTime: '6-10 min',
      path: '/tools/professional-bio-writer',
      features: ['Platform Optimization', 'Tone Customization', 'Multiple Versions'],
      popularity: 72
    }
  ];

  // Category configuration with icons and colors
  const categoryConfig = {
    all: { name: 'All Tools', icon: <Settings className="h-4 w-4" />, color: 'bg-gray-100' },
    career: { name: 'Career', icon: <Target className="h-4 w-4" />, color: 'bg-blue-100' },
    analytics: { name: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-green-100' },
    interview: { name: 'Interview', icon: <MessageSquare className="h-4 w-4" />, color: 'bg-purple-100' },
    resume: { name: 'Resume', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-100' },
    'job-search': { name: 'Job Search', icon: <Briefcase className="h-4 w-4" />, color: 'bg-red-100' },
    skills: { name: 'Skills', icon: <BookOpen className="h-4 w-4" />, color: 'bg-yellow-100' },
    networking: { name: 'Networking', icon: <Users className="h-4 w-4" />, color: 'bg-pink-100' },
    profile: { name: 'Profile', icon: <User className="h-4 w-4" />, color: 'bg-indigo-100' }
  };

  // Tool categories for sidebar
  const toolsByCategory = {
    career: [
      { name: 'Career SWOT Analysis', isPremium: false, path: '/tools/career-swot-analysis' },
      { name: 'Role Fit Evaluator', isPremium: false, path: '/tools/role-fit-evaluator' },
      { name: 'Career Change Navigator', isPremium: false, path: '/tools/career-change-navigator' }
    ],
    analytics: [
      { name: 'Resume Performance Insights', isPremium: false, path: '/tools/resume-performance-insights' },
      { name: 'Job Application Funnel', isPremium: false, path: '/tools/job-application-funnel' },
      { name: 'Career Growth Score', isPremium: false, path: '/tools/career-growth-score' }
    ],
    'job-search': [
      { name: 'Smart Apply Tool', isPremium: true, path: '/tools/smart-apply-tool' },
      { name: 'Salary Benchmark Tool', isPremium: false, path: '/tools/salary-benchmark-tool' },
      { name: 'TalentXcel AI Job Match', isPremium: true, path: '/tools/ai-job-match-gpt' }
    ],
    interview: [
      { name: 'STAR Answer Generator', isPremium: false, path: '/tools/star-answer-generator' },
      { name: 'Interview Readiness Score', isPremium: false, path: '/tools/interview-readiness-score' },
      { name: 'TalentXcel AI Interview Coach', isPremium: true, path: '/tools/mock-interview-simulator' }
    ],
    resume: [
      { name: 'Resume Tailor Tool', isPremium: false, path: '/tools/resume-tailor-tool' },
      { name: 'Resume Gap Analyzer', isPremium: false, path: '/tools/resume-gap-analyzer' },
      { name: 'TalentXcel AI Resume Builder', isPremium: false, path: '/tools/ai-resume-builder' }
    ],
    networking: [
      { name: 'Network Growth Tracker', isPremium: false, path: '/tools/network-growth-tracker' },
      { name: 'TalentXcel AI Outreach Generator', isPremium: true, path: '/tools/ai-outreach-generator' },
      { name: 'Mentor Connect Tool', isPremium: false, path: '/tools/mentor-connect-tool' }
    ],
    profile: [
      { name: 'AI Profile Optimizer', isPremium: false, path: '/tools/ai-profile-optimizer' },
      { name: 'Professional Bio Writer', isPremium: false, path: '/tools/professional-bio-writer' },
      { name: 'TalentXcel Cover Letter AI', isPremium: false, path: '/tools/cover-letter-generator' }
    ],
    skills: [
      { name: 'Skill Gap Analyzer', isPremium: false, path: '/tools/skill-gap-analyzer' },
      { name: 'Skill Assessment Engine', isPremium: false, path: '/tools/skill-assessment-engine' },
      { name: 'TalentXcel Learning AI', isPremium: false, path: '/tools/ai-learning-path-generator' }
    ]
  };

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    setSearchQuery(query);
    setDataSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setDataCategory(category);
  };

  const handleToolClick = async (tool: FeaturedTool) => {
    if (tool.isPremium && !user) {
      toast.error('Please login to access premium tools');
      navigate('/auth/login');
      return;
    }

    // Log tool usage
    if (user) {
      await logToolUsage(tool.id, tool.name, { source: 'featured_tools' });
    }

    navigate(tool.path);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'career': return 'bg-blue-500';
      case 'analytics': return 'bg-green-500';
      case 'interview': return 'bg-purple-500';
      case 'resume': return 'bg-orange-500';
      case 'job-search': return 'bg-red-500';
      case 'skills': return 'bg-yellow-500';
      case 'networking': return 'bg-pink-500';
      case 'profile': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredFeaturedTools = featuredTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = !searchQuery || tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E2A78] via-[#1E2A78] to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-12 w-12 rounded-lg bg-white/10 p-2"
              />
              <div>
                <h1 className="text-2xl font-bold">AI-Powered Career Tools by TalentXcel</h1>
                <p className="text-blue-100 text-sm max-w-2xl">Transform your career with intelligent tools built to accelerate growth, enhance decisions, and guide you every step of the way.</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{usageStats.totalUsage}</div>
                <p className="text-blue-100">Tools Used</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{usageStats.completedUsage}</div>
                <p className="text-blue-100">Completed</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{usageStats.favoriteTools}</div>
                <p className="text-blue-100">Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static top-0 left-0 h-full lg:h-auto w-80 lg:w-72 bg-white/80 backdrop-blur-sm border-r border-gray-200 z-50 transition-transform duration-300 rounded-r-2xl lg:rounded-2xl shadow-apple-light overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Browse Tools</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-xl font-bold text-blue-700">{featuredTools.length}</div>
                  <div className="text-xs text-blue-600">Total Tools</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{featuredTools.filter(t => !t.isPremium).length}</div>
                  <div className="text-xs text-green-600">Free Tools</div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === key 
                          ? 'bg-gradient-to-r from-[#1E2A78] to-[#28C76F] text-white shadow-lg' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    onClick={() => handleCategorySelect(key)}
                  >
                    {config.icon}
                    <span className="font-medium">{config.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto text-xs ${
                        selectedCategory === key ? 'bg-white/20 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {key === 'all' ? featuredTools.length : featuredTools.filter(t => t.category === key).length}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Links</h3>
                {Object.entries(toolsByCategory).map(([category, tools]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      {categoryConfig[category as keyof typeof categoryConfig]?.icon}
                      <span>{categoryConfig[category as keyof typeof categoryConfig]?.name}</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      {tools.map((tool) => (
                        <button
                          key={tool.path}
                          onClick={() => navigate(tool.path)}
                          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 py-1"
                        >
                          <span>{tool.name}</span>
                          <div className="flex items-center gap-1">
                            {tool.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {/* Search and Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg border-gray-200"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <UniversalSearchBar
                  searchType="jobs"
                  onSearch={handleUniversalSearch}
                  placeholder="Search tools, features, or describe what you need..."
                  showSuggestions={true}
                  showFilters={false}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Featured Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFeaturedTools.map((tool) => (
                <Card
                  key={tool.id}
                  className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-apple-light hover:shadow-apple-medium transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-2xl"
                  onClick={() => handleToolClick(tool)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${getCategoryBadgeColor(tool.category)}/10 group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`text-${getCategoryBadgeColor(tool.category).replace('bg-', '').replace('-500', '-600')}`}>
                          {tool.icon}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {tool.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 px-2 py-1">
                            <Crown className="h-3 w-3 mr-1" />
                            PREMIUM
                          </Badge>
                        )}
                        {tool.isFeatured && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-2 py-1">
                            <Star className="h-3 w-3 mr-1" />
                            FEATURED
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {tool.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {tool.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tool.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {tool.popularity}% match
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {tool.features.slice(0, 3).map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-gray-100 text-gray-600 border-0"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        className={`w-full rounded-lg transition-all duration-200 ${
                          tool.isPremium 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToolClick(tool);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {tool.isPremium ? (
                            <>
                              <Crown className="h-4 w-4" />
                              Try Premium
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Try Tool
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredFeaturedTools.length === 0 && (
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  No tools found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Try adjusting your search or category filters to find the tools you need.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setDataSearchQuery('');
                    setDataCategory('all');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center py-8 mt-12">
          <p className="text-sm text-text-secondary">
            Powered by TalentXcel AI – India's Intelligent Career Platform
          </p>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Tools;