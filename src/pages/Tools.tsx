import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameProgressHeader } from '@/components/tools/GameProgressHeader';
import { ToolTestDialog } from '@/components/tools/ToolTestDialog';
import { ToolBenefitsModal } from '@/components/tools/ToolBenefitsModal';
import { ToolUnlockModal } from '@/components/tools/ToolUnlockModal';
import { GameToolCard } from '@/components/tools/GameToolCard';
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
  Activity,
  Coins,
  Trophy,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOLS_PER_PAGE = 6;

const UNLOCK_COSTS = {
  individual: 100,  // TXC cost to unlock individual tool
  page: 500,        // TXC cost to unlock entire page (6 tools)
  premium: 1000     // TXC cost for premium unlock bundle
};

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  icon: React.ComponentType<any>;
  slug: string;
  estimated_time: string;
  txc_cost: number;
}

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
    userTXCBalance: userBalance,
    isLoading: loading,
    getToolBySlug
  } = useRealToolsData();

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Update document meta tags
  useEffect(() => {
    updateMetaTags({
      title: "AI-Powered Career Tools | Transform Your Professional Journey",
      description: "Access 26+ AI tools for career development, resume building, interview prep, and job matching. Unlock premium features with TXC tokens.",
      keywords: ["AI career tools", "resume builder", "interview simulator", "job matching", "career development", "professional skills"]
    });
  }, []);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !searchQuery || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || tool.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [tools, searchQuery, selectedCategory, selectedDifficulty]);

  // Process and paginate tools with gaming logic
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
    const endIndex = startIndex + TOOLS_PER_PAGE;
    const pageTools = filteredTools.slice(startIndex, endIndex);
    
    // Apply gaming logic - lock tools based on progression
    return pageTools.map((tool, index) => {
      const globalIndex = startIndex + index;
      const pageIndex = Math.floor(globalIndex / TOOLS_PER_PAGE) + 1;
      
      // First page (6 tools) - unlock first 3, lock rest until progression
      if (pageIndex === 1) {
        const isInFirstThree = index < 3;
        const completedInFirstThree = pageTools.slice(0, 3).filter(t => t.isCompleted).length;
        const shouldUnlock = isInFirstThree || completedInFirstThree >= 3;
        
        return {
          ...tool,
          isLocked: !shouldUnlock && !tool.isCompleted,
          unlockRequirement: isInFirstThree ? null : 'Complete first 3 tools',
          txc_cost: isInFirstThree ? 0 : UNLOCK_COSTS.individual
        };
      }
      
      // Other pages - check if previous page is completed
      const prevPageStartIndex = (pageIndex - 2) * TOOLS_PER_PAGE;
      const prevPageEndIndex = prevPageStartIndex + TOOLS_PER_PAGE;
      const prevPageTools = filteredTools.slice(prevPageStartIndex, prevPageEndIndex);
      const prevPageCompleted = prevPageTools.filter(t => t.isCompleted).length;
      const pageUnlocked = prevPageCompleted >= 3;
      
      return {
        ...tool,
        isLocked: !pageUnlocked && !tool.isCompleted,
        unlockRequirement: pageUnlocked ? null : `Complete 3 tools from page ${pageIndex - 1}`,
        txc_cost: pageUnlocked ? 0 : UNLOCK_COSTS.individual
      };
    });
  }, [filteredTools, currentPage]);

  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Get unique categories and difficulties
  const categories = ['all', ...Array.from(new Set(tools.map(tool => tool.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Count completed tools for unlocking logic
  const completedToolsCount = tools.filter(tool => tool.isCompleted).length;

  // Progressive unlock system
  const isToolLocked = (tool: any) => {
    // First 3 tools are always unlocked (Level 1)
    if (tool.unlock_level === 1) return false;
    
    // Level 2 tools: need 3 completions
    if (tool.unlock_level === 2) return completedToolsCount < 3;
    
    // Level 3 tools: need 6 completions  
    if (tool.unlock_level === 3) return completedToolsCount < 6;
    
    // Level 4+ tools: need (level-1) * 3 completions
    const requiredCompletions = (tool.unlock_level - 1) * 3;
    return completedToolsCount < requiredCompletions;
  };

  const getUnlockMessage = (tool: any) => {
    if (tool.unlock_level === 2) return "Complete 3 tools to unlock Level 2";
    if (tool.unlock_level === 3) return "Complete 6 tools to unlock Level 3";
    return `Complete ${(tool.unlock_level - 1) * 3} tools to unlock Level ${tool.unlock_level}`;
  };

  const handleToolClick = (tool: any) => {
    const mappedTool: Tool = {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      difficulty: tool.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedTime: tool.estimated_time,
      isLocked: isToolLocked(tool),
      isCompleted: tool.isCompleted,
      progress: tool.progress,
      icon: tool.icon,
      slug: tool.slug,
      estimated_time: tool.estimated_time,
      txc_cost: tool.txc_cost
    };
    
    if (isToolLocked(tool)) {
      setSelectedTool(mappedTool);
      setShowUnlockModal(true);
      return;
    }
    
    setSelectedTool(mappedTool);
    setShowBenefitsModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mt-12 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className={cn(
                "w-10 h-10",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your personalized toolkit...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Game Progress Header */}
        <GameProgressHeader
          userName={userName}
          totalTools={tools.length}
          completedTools={completedToolsCount}
          currentStreak={userStats.currentStreak}
          totalTXC={userBalance}
          userLevel={userStats.userLevel}
          nextLevelProgress={userStats.nextLevelProgress}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Search and Filters */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 bg-background/50 border border-border/50 rounded-xl text-sm"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>
                      {diff === 'all' ? 'All Levels' : diff}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedTools.length} of {filteredTools.length} tools
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <p className="text-sm text-primary font-medium">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {/* Tools Grid */}
          {paginatedTools.length === 0 ? (
            <div className="text-center py-24">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No tools found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' 
                ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1 max-w-4xl mx-auto"
            )}>
              {paginatedTools.map((tool) => (
                <Card
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer",
                    "bg-gradient-to-br from-card to-card/90 backdrop-blur-xl",
                    "border-2 rounded-3xl p-8",
                    "transition-all duration-500 ease-out",
                    isToolLocked(tool) 
                      ? "border-border/30 opacity-75 hover:opacity-85" 
                      : "border-border/50 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/40",
                    tool.isCompleted && "ring-2 ring-green-500/20 border-green-500/30"
                  )}
                >
                  {/* Apple-style glassmorphism */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl" />
                  
                  {/* Level indicator */}
                  <div className={cn(
                    "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold",
                    "bg-gradient-to-r text-white shadow-lg",
                    tool.unlock_level === 1 && "from-emerald-500 to-green-600",
                    tool.unlock_level === 2 && "from-blue-500 to-cyan-600", 
                    tool.unlock_level === 3 && "from-purple-500 to-violet-600",
                    (tool.unlock_level || 1) >= 4 && "from-amber-500 to-orange-600"
                  )}>
                    L{tool.unlock_level || 1}
                  </div>
                  
                  {/* Lock overlay for locked tools */}
                  {isToolLocked(tool) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-background/95 to-background/85 backdrop-blur-md rounded-3xl flex items-center justify-center z-10">
                      <div className="text-center space-y-4 p-6">
                        <div className="relative">
                          <div className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border border-border/50">
                            <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
                          </div>
                          <div className="absolute -top-2 -right-2 p-2 bg-primary rounded-full">
                            <Crown className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-lg text-foreground">Level {tool.unlock_level || 1} Tool</p>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            {getUnlockMessage(tool)}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-xs text-primary">
                            <Zap className="w-3 h-3" />
                            {tool.txc_cost && `${tool.txc_cost} TXC to unlock instantly`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tool header */}
                  <div className="relative z-0 flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300",
                        isToolLocked(tool) 
                          ? "bg-muted/30 border-border/30" 
                          : "bg-primary/10 border-primary/20 group-hover:bg-primary/15"
                      )}>
                        <tool.icon className={cn(
                          "w-8 h-8 transition-colors",
                          isToolLocked(tool) ? "text-muted-foreground" : "text-primary"
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          "text-xl font-bold transition-colors",
                          isToolLocked(tool) 
                            ? "text-muted-foreground" 
                            : "text-foreground group-hover:text-primary"
                        )}>
                          {tool.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs font-medium",
                              isToolLocked(tool) ? "bg-muted/30" : "bg-secondary/50"
                            )}
                          >
                            {tool.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tool.estimated_time}
                          </span>
                          {tool.txc_cost && tool.txc_cost > 0 && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              <Coins className="w-3 h-3 mr-1" />
                              {tool.txc_cost}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {tool.isCompleted && (
                      <div className="p-2 bg-green-500/20 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="relative z-0 mb-6">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isToolLocked(tool) ? "text-muted-foreground/70" : "text-muted-foreground"
                    )}>
                      {tool.description}
                    </p>
                  </div>

                  {/* Progress bar or unlock info */}
                  <div className="relative z-0 space-y-3">
                    {!isToolLocked(tool) ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(tool.progress)}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${tool.progress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-2">
                        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                          <Lock className="w-3 h-3 mr-1" />
                          Click to unlock
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Hover effect arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={cn(
                      "p-2 rounded-full backdrop-blur-sm",
                      isToolLocked(tool) 
                        ? "bg-muted/30" 
                        : "bg-primary/20"
                    )}>
                      <ChevronRight className={cn(
                        "w-5 h-5",
                        isToolLocked(tool) ? "text-muted-foreground" : "text-primary"
                      )} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {renderPaginationControls()}
        </div>

        {/* Modals */}
        {selectedTool && (
          <>
            <ToolUnlockModal
              isOpen={showUnlockModal}
              onClose={() => setShowUnlockModal(false)}
              tool={{
                ...selectedTool,
                unlock_level: tools.find(t => t.id === selectedTool.id)?.unlock_level || 1,
                txc_cost: tools.find(t => t.id === selectedTool.id)?.txc_cost || 0,
                required_completions: tools.find(t => t.id === selectedTool.id)?.required_completions || 0,
                is_premium: tools.find(t => t.id === selectedTool.id)?.is_premium || false
              }}
              userTXCBalance={userBalance}
              completedToolsCount={completedToolsCount}
              userLevel={userStats.userLevel}
              onUnlockWithTXC={() => {
                // TODO: Implement TXC purchase
                console.log('Unlock with TXC');
                setShowUnlockModal(false);
              }}
              onViewRequirements={() => {
                setShowUnlockModal(false);
                setShowBenefitsModal(true);
              }}
            />
            <ToolTestDialog
              tool={selectedTool}
              isOpen={showTestDialog}
              onOpenChange={(open) => setShowTestDialog(open)}
              onTest={async (toolSlug: string) => {
                console.log('Testing tool:', toolSlug);
                setShowTestDialog(false);
              }}
            />
            <ToolBenefitsModal
              tool={selectedTool}
              isOpen={showBenefitsModal}
              onOpenChange={(open) => setShowBenefitsModal(open)}
              onStartTesting={() => {
                setShowBenefitsModal(false);
                setShowTestDialog(true);
              }}
            />
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Tools;