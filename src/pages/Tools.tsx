import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameProgressHeader } from '@/components/tools/GameProgressHeader';
import { ToolTestDialog } from '@/components/tools/ToolTestDialog';
import { ToolBenefitsModal } from '@/components/tools/ToolBenefitsModal';
import { PageTransition } from '@/components/ui/PageTransition';
import { updateMetaTags } from '@/utils/metaTags';
import { useRealToolsData } from '@/hooks/useRealToolsData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lock, 
  CheckCircle2, 
  Search, 
  Filter, 
  Star,
  Crown,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Grid3X3,
  List,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOLS_PER_PAGE = 9;

const Tools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  const { 
    tools,
    toolsByCategory, 
    userStats, 
    userName,
    userTXCBalance,
    isLoading 
  } = useRealToolsData();

  useEffect(() => {
    updateMetaTags({
      title: "AI-Powered Career Tools | TalentXcel",
      description: "Unlock your career potential with 26+ AI tools for resume building, interview prep, job search, and career growth. Start your journey today!",
      keywords: ["AI career tools", "resume builder", "interview preparation", "job search", "career development", "ATS optimization"]
    });
  }, []);

  // Filter and search tools
  const filteredTools = useMemo(() => {
    let filtered = tools;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tool => tool.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [tools, searchQuery, selectedCategory, selectedDifficulty]);

  // Pagination
  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE);
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
    return filteredTools.slice(startIndex, startIndex + TOOLS_PER_PAGE);
  }, [filteredTools, currentPage]);

  // Categories
  const categories = useMemo(() => {
    const cats = ['all', ...Object.keys(toolsByCategory)];
    return cats;
  }, [toolsByCategory]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              {/* Header skeleton */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-2xl w-64 mb-4"></div>
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              </div>
              
              {/* Tools grid skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Apple-style Header */}
          <div className="mb-12">
            <GameProgressHeader 
              userName={userName}
              totalTools={userStats.totalTools}
              completedTools={userStats.completedTools}
              currentStreak={userStats.currentStreak}
              totalTXC={userStats.totalTXC}
              userLevel={userStats.userLevel}
              nextLevelProgress={userStats.nextLevelProgress}
            />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-light text-slate-900 dark:text-white mb-6 tracking-tight">
              Career <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              26 AI-powered tools designed to accelerate your career journey. From resume optimization to interview mastery.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      placeholder="Search tools by name, description, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-2xl text-lg"
                    />
                  </div>

                  {/* Category Filter */}
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-shrink-0">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="px-6 py-2 rounded-xl font-medium capitalize data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
                        >
                          {category === 'all' ? 'All Tools' : category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-xl"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-xl"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Grid/List */}
          <div className="mb-12">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedTools.map((tool) => (
                  <Card
                    key={tool.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
                      "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50",
                      tool.isLocked ? "opacity-60" : "",
                      tool.isCompleted && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10"
                    )}
                    onClick={() => !tool.isLocked && navigate(`/tools/${tool.slug}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110",
                          tool.isLocked 
                            ? "bg-slate-100 dark:bg-slate-800" 
                            : "bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20"
                        )}>
                          {React.createElement(tool.icon as any, { 
                            className: cn(
                              "h-8 w-8 transition-colors",
                              tool.isLocked ? "text-slate-400" : "text-blue-600"
                            )
                          })}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {tool.isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                          {tool.isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          {tool.is_premium && <Crown className="h-4 w-4 text-amber-500" />}
                        </div>
                      </div>

                      <CardTitle className={cn(
                        "text-xl font-semibold leading-tight",
                        tool.isLocked ? "text-slate-500" : "text-slate-900 dark:text-white"
                      )}>
                        {tool.name}
                      </CardTitle>
                      
                      <CardDescription className="text-slate-600 dark:text-slate-300 line-clamp-2 text-base leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "rounded-full",
                                tool.difficulty === 'beginner' && "border-green-500 text-green-700 bg-green-50",
                                tool.difficulty === 'intermediate' && "border-yellow-500 text-yellow-700 bg-yellow-50",
                                tool.difficulty === 'advanced' && "border-red-500 text-red-700 bg-red-50"
                              )}
                            >
                              {tool.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3 w-3" />
                              {tool.estimated_time}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span>{tool.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${tool.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* TXC Cost */}
                        {tool.txc_cost > 0 && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{tool.txc_cost} TXC</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              Balance: {userTXCBalance}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <ToolTestDialog 
                              tool={tool} 
                              onTest={async (slug) => console.log('Testing:', slug)} 
                            />
                            <ToolBenefitsModal tool={tool} />
                          </div>
                          
                          <Button 
                            className={cn(
                              "w-full rounded-2xl font-medium transition-all duration-300",
                              tool.isLocked 
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200" 
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                            )}
                            disabled={tool.isLocked}
                          >
                            {tool.isLocked ? 'Locked' : tool.isCompleted ? 'Redo Tool' : 'Start Tool'}
                            {!tool.isLocked && <ChevronRight className="ml-2 h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {paginatedTools.map((tool) => (
                  <Card
                    key={tool.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-300 hover:shadow-lg",
                      "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50",
                      tool.isLocked ? "opacity-60" : "",
                      tool.isCompleted && "ring-2 ring-green-500/20"
                    )}
                    onClick={() => !tool.isLocked && navigate(`/tools/${tool.slug}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 flex-1">
                          <div className={cn(
                            "p-3 rounded-2xl",
                            tool.isLocked 
                              ? "bg-slate-100 dark:bg-slate-800" 
                              : "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                          )}>
                            {React.createElement(tool.icon as any, { 
                              className: cn(
                                "h-6 w-6",
                                tool.isLocked ? "text-slate-400" : "text-blue-600"
                              )
                            })}
                          </div>

                          <div className="flex-1">
                            <h3 className={cn(
                              "text-lg font-semibold mb-1",
                              tool.isLocked ? "text-slate-500" : "text-slate-900 dark:text-white"
                            )}>
                              {tool.name}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-1">
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="rounded-full">
                            {tool.difficulty}
                          </Badge>
                          
                          <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <Clock className="h-3 w-3" />
                            {tool.estimated_time}
                          </div>

                          <div className="flex items-center gap-2">
                            {tool.isLocked && <Lock className="h-4 w-4 text-slate-400" />}
                            {tool.isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {tool.is_premium && <Crown className="h-4 w-4 text-amber-500" />}
                          </div>

                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-2xl"
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-12 h-12 rounded-2xl"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-2xl"
              >
                Next
              </Button>
            </div>
          )}

          {/* Stats Footer */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 text-center">
              <CardContent className="p-6">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {filteredTools.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Available Tools
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 text-center">
              <CardContent className="p-6">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {userStats.completedTools}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Completed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {userStats.userLevel}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  User Level
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 text-center">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {userTXCBalance}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  TXC Balance
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Tools;