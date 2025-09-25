import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameProgressHeader } from '@/components/tools/GameProgressHeader';
import { ToolTestDialog } from '@/components/tools/ToolTestDialog';
import { ToolBenefitsModal } from '@/components/tools/ToolBenefitsModal';
import { ToolUnlockModal } from '@/components/tools/ToolUnlockModal';
import { GameToolCard } from '@/components/tools/GameToolCard';
import { TXCFeaturePurchase } from '@/components/txc/TXCFeaturePurchase';
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
  unlock_level?: number;
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

  // Gaming logic: Calculate unlocked tools based on progression
  const unlockedToolsCount = useMemo(() => {
    const baseUnlocked = 3; // First 3 tools are always unlocked
    const completedCount = tools.filter(tool => tool.isCompleted).length;
    
    // Unlock 3 more tools for every 3 completed
    const progressUnlocked = Math.floor(completedCount / 3) * 3;
    
    return Math.min(baseUnlocked + progressUnlocked, tools.length);
  }, [tools]);

  // Apply gaming locks to tools
  const gameAwareTools = useMemo(() => {
    return tools.map((tool, index) => ({
      ...tool,
      isLocked: index >= unlockedToolsCount,
      txc_cost: index >= unlockedToolsCount ? UNLOCK_COSTS.individual : 0,
      unlock_level: Math.floor(index / 3) + 1,
      unlockRequirement: index >= unlockedToolsCount 
        ? `Complete ${Math.ceil((index + 1 - 3) / 3) * 3 - tools.filter(t => t.isCompleted).length} more tools`
        : undefined
    }));
  }, [tools, unlockedToolsCount]);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return gameAwareTools.filter(tool => {
      const matchesSearch = searchQuery === '' || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || tool.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [gameAwareTools, searchQuery, selectedCategory, selectedDifficulty]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
  const paginatedTools = filteredTools.slice(startIndex, startIndex + TOOLS_PER_PAGE);

  // Gaming: Check if current page should be unlocked
  const isPageUnlocked = (pageNum: number) => {
    const toolsOnPage = (pageNum - 1) * TOOLS_PER_PAGE;
    return toolsOnPage < unlockedToolsCount;
  };

  const canUnlockPageWithTXC = (pageNum: number) => {
    return userBalance >= UNLOCK_COSTS.page;
  };

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

  const handleStartTesting = () => {
    setShowBenefitsModal(false);
    setShowTestDialog(true);
  };

  const handleUnlockSuccess = () => {
    // Refresh data or update state as needed
    window.location.reload();
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
          userStats={{
            totalTools: tools.length,
            completedTools: tools.filter(t => t.isCompleted).length,
            currentStreak: userStats?.currentStreak || 0,
            totalTXC: userBalance || 0,
            userLevel: userStats?.userLevel || 1,
            nextLevelProgress: userStats?.nextLevelProgress || 0
          }}
          userName={userName || 'Player'}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredTools.length / TOOLS_PER_PAGE)}
          unlockedToolsCount={tools.filter(t => !t.isLocked).length}
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
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff === 'all' ? 'All Levels' : diff}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results info */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Showing {paginatedTools.length} of {filteredTools.length} tools
                {searchQuery && ` for "${searchQuery}"`}
              </span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>

          {/* Tools Grid - Gaming Style */}
          {!isPageUnlocked(currentPage) ? (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto border-border/50 bg-muted/20">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Page {currentPage} Locked</h3>
                    <p className="text-muted-foreground">
                      Complete more tools on previous pages to unlock this level
                    </p>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                      </Button>
                      {canUnlockPageWithTXC(currentPage) && (
                        <TXCFeaturePurchase
                          featureId={`page-${currentPage}`}
                          featureName={`Tools Page ${currentPage}`}
                          cost={UNLOCK_COSTS.page}
                          onSuccess={handleUnlockSuccess}
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6 mb-12",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {paginatedTools.map((tool) => (
                <GameToolCard 
                  key={tool.id}
                  tool={{
                    ...tool,
                    estimatedTime: tool.estimated_time || '5-10 min',
                    difficulty: tool.difficulty as 'beginner' | 'intermediate' | 'advanced',
                    isLocked: isToolLocked(tool),
                    txc_cost: tool.txc_cost || UNLOCK_COSTS.individual,
                    unlockRequirement: getUnlockMessage(tool)
                  }}
                  viewMode={viewMode}
                  onToolClick={handleToolClick}
                  onUnlockClick={handleToolClick}
                />
              ))}
            </div>
          )}

          {/* Gaming Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  const isUnlocked = isPageUnlocked(pageNum);
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => isUnlocked && setCurrentPage(pageNum)}
                      disabled={!isUnlocked}
                      className={cn(
                        "w-10 h-10 relative",
                        !isUnlocked && "opacity-50"
                      )}
                    >
                      {!isUnlocked && (
                        <Lock className="w-3 h-3 absolute -top-1 -right-1" />
                      )}
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  const nextPage = currentPage + 1;
                  if (isPageUnlocked(nextPage)) {
                    setCurrentPage(nextPage);
                  }
                }}
                disabled={currentPage === totalPages || !isPageUnlocked(currentPage + 1)}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Modals */}
        <ToolTestDialog 
          tool={selectedTool}
          isOpen={showTestDialog}
          onOpenChange={setShowTestDialog}
          onTest={async (toolSlug: string) => {
            console.log('Testing tool:', toolSlug);
            setShowTestDialog(false);
          }}
        />
        
        <ToolBenefitsModal 
          tool={selectedTool}
          isOpen={showBenefitsModal}
          onOpenChange={setShowBenefitsModal}
          onStartTesting={handleStartTesting}
        />

        <ToolUnlockModal
          tool={selectedTool}
          isOpen={showUnlockModal}
          onOpenChange={setShowUnlockModal}
          onUnlockSuccess={handleUnlockSuccess}
          userTXCBalance={userBalance || 0}
          canUnlockWithProgress={true}
          completedRequiredTools={tools.filter(t => t.isCompleted).length}
          requiredToolsCount={3}
        />
      </div>
    </PageTransition>
  );
};

export default Tools;