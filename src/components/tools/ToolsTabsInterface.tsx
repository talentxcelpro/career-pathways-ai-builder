import React, { useState, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  FileCheck, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Brain, 
  Award, 
  Users,
  Globe,
  Briefcase,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';

// Lazy load tool components
const ResumeCheck = lazy(() => import('@/pages/tools/ResumeCheck'));
const CoverLetter = lazy(() => import('@/pages/tools/CoverLetter'));
const SalaryAnalyzer = lazy(() => import('@/pages/tools/SalaryAnalyzer'));
const MarketInsights = lazy(() => import('@/pages/tools/MarketInsights'));
const InterviewPrep = lazy(() => import('@/pages/tools/InterviewPrep'));
const AICareerAssistant = lazy(() => import('@/pages/tools/AICareerAssistant'));
const ProfileScore = lazy(() => import('@/pages/tools/ProfileScore').then(m => ({ default: m.ProfileScore })));

interface Tool {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
  category: string;
  popular?: boolean;
  premium?: boolean;
  global?: boolean;
}

interface ToolCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  gradient: string;
  color: string;
}

const toolCategories = [
  {
    id: 'essentials',
    title: 'Career Essentials',
    subtitle: 'Core tools for every professional',
    icon: Briefcase,
    gradient: 'from-slate-600 to-slate-700',
    color: 'text-slate-800'
  },
  {
    id: 'ai-powered',
    title: 'AI-Powered Insights',
    subtitle: 'Advanced intelligence for career growth',
    icon: Brain,
    gradient: 'from-indigo-600 to-indigo-700',
    color: 'text-indigo-900'
  },
  {
    id: 'market-analysis',
    title: 'Market Intelligence',
    subtitle: 'Global market trends and analytics',
    icon: BarChart3,
    gradient: 'from-emerald-600 to-emerald-700',
    color: 'text-emerald-900'
  },
  {
    id: 'interview-suite',
    title: 'Interview Excellence',
    subtitle: 'Master any interview worldwide',
    icon: MessageSquare,
    gradient: 'from-amber-600 to-amber-700',
    color: 'text-amber-900'
  }
];

const tools: Tool[] = [
  {
    id: 'resume-check',
    title: 'Resume Optimizer',
    subtitle: 'ATS-optimized for global markets',
    icon: FileCheck,
    component: ResumeCheck,
    category: 'essentials',
    popular: true,
    global: true
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter AI',
    subtitle: 'Culturally-aware content generation',
    icon: FileText,
    component: CoverLetter,
    category: 'essentials',
    popular: true,
    global: true
  },
  {
    id: 'ai-assistant',
    title: 'Career Coach AI',
    subtitle: 'Personalized career guidance',
    icon: Brain,
    component: AICareerAssistant,
    category: 'ai-powered',
    premium: true
  },
  {
    id: 'salary-analyzer',
    title: 'Global Salary Intel',
    subtitle: 'Worldwide compensation insights',
    icon: DollarSign,
    component: SalaryAnalyzer,
    category: 'market-analysis',
    global: true
  },
  {
    id: 'market-insights',
    title: 'Market Pulse',
    subtitle: 'Real-time industry trends',
    icon: TrendingUp,
    component: MarketInsights,
    category: 'market-analysis'
  },
  {
    id: 'interview-prep',
    title: 'Interview Mastery',
    subtitle: 'Practice with global standards',
    icon: MessageSquare,
    component: InterviewPrep,
    category: 'interview-suite',
    popular: true,
    global: true
  },
  {
    id: 'profile-score',
    title: 'Profile Analytics',
    subtitle: 'Comprehensive profile scoring',
    icon: Award,
    component: ProfileScore,
    category: 'ai-powered'
  }
];

const ToolsTabsInterface = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTool, setActiveTool] = useState('resume-check');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = selectedCategory === 'all' 
    ? tools.filter(tool => tool.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tools.filter(tool => tool.category === selectedCategory && tool.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getToolsByCategory = (categoryId: string) => {
    return tools.filter(tool => tool.category === categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">TalentXcel Tools</h1>
                  <p className="text-sm text-muted-foreground">Professional career acceleration for global markets</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2">
                <Globe className="h-3 w-3" />
                Global Ready
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Zap className="h-3 w-3" />
                AI-Powered
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              All Tools
            </Button>
            {toolCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.title}
              </Button>
            ))}
          </div>

          {/* Category Sections */}
          {selectedCategory === 'all' ? (
            <div className="space-y-8">
              {toolCategories.map((category) => {
                const categoryTools = getToolsByCategory(category.id);
                if (categoryTools.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-br ${category.gradient} rounded-lg`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-lg font-bold ${category.color}`}>{category.title}</h2>
                        <p className="text-xs text-muted-foreground">{category.subtitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {categoryTools.map((tool) => (
                        <Card 
                          key={tool.id}
                          className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/90 hover:scale-[1.02]"
                          onClick={() => setActiveTool(tool.id)}
                        >
                          <div className="p-3">
                            <div className="flex flex-col items-center text-center space-y-2">
                              <div className={`p-2 bg-gradient-to-br ${category.gradient} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                                <tool.icon className="h-4 w-4 text-white" />
                              </div>
                              
                              <div className="space-y-1">
                                <h3 className={`font-semibold text-xs ${category.color} group-hover:text-primary transition-colors leading-tight`}>
                                  {tool.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-tight">{tool.subtitle}</p>
                              </div>

                              <div className="flex flex-wrap gap-1 justify-center">
                                {tool.popular && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                    <Star className="h-2 w-2 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                                {tool.premium && (
                                  <Badge className="text-xs px-1 py-0 h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                    <Shield className="h-2 w-2 mr-1" />
                                    Pro
                                  </Badge>
                                )}
                                {tool.global && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    <Globe className="h-2 w-2 mr-1" />
                                    Global
                                  </Badge>
                                )}
                              </div>

                              <Button 
                                size="sm" 
                                className="w-full h-6 text-xs px-2 gap-1 group-hover:gap-2 transition-all"
                                variant={tool.premium ? "default" : "outline"}
                              >
                                {tool.premium ? 'Try Pro' : 'Launch'}
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTools.map((tool) => {
                const category = toolCategories.find(cat => cat.id === tool.category);
                return (
                  <Card 
                    key={tool.id}
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/90 hover:scale-[1.02]"
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <div className="p-3">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className={`p-2 bg-gradient-to-br ${category?.gradient} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                          <tool.icon className="h-4 w-4 text-white" />
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className={`font-semibold text-xs ${category?.color} group-hover:text-primary transition-colors leading-tight`}>
                            {tool.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-tight">{tool.subtitle}</p>
                        </div>

                        <div className="flex flex-wrap gap-1 justify-center">
                          {tool.popular && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                              <Star className="h-2 w-2 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {tool.premium && (
                            <Badge className="text-xs px-1 py-0 h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              <Shield className="h-2 w-2 mr-1" />
                              Pro
                            </Badge>
                          )}
                          {tool.global && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                              <Globe className="h-2 w-2 mr-1" />
                              Global
                            </Badge>
                          )}
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full h-6 text-xs px-2 gap-1 group-hover:gap-2 transition-all"
                          variant={tool.premium ? "default" : "outline"}
                        >
                          {tool.premium ? 'Try Pro' : 'Launch'}
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Tool Modal/Overlay */}
        {activeTool && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {tools.find(t => t.id === activeTool)?.title}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTool('')}>
                  ×
                </Button>
              </div>
              <div className="p-6">
                {(() => {
                  const activeTool_obj = tools.find(t => t.id === activeTool);
                  if (activeTool_obj) {
                    const ToolComponent = activeTool_obj.component;
                    return (
                      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading tool...</div>}>
                        <ToolComponent />
                      </Suspense>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsTabsInterface;
