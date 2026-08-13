import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameProgressHeader } from '@/components/tools/GameProgressHeader';
import { ToolBenefitsModal } from '@/components/tools/ToolBenefitsModal';
import { GameToolCard } from '@/components/tools/GameToolCard';
import { PageTransition } from '@/components/ui/PageTransition';
import { updateMetaTags } from '@/utils/metaTags';
import { ToolsErrorBoundary } from '@/components/common/ToolsErrorBoundary';
import { SafeToolsLoader } from '@/components/tools/SafeToolsLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOLS_PER_PAGE = 6;

const UNLOCK_COSTS = {
  individual: 100,  
  page: 500,        
  premium: 1000     
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

const ToolsContent = ({ tools, toolsByCategory, userStats, userName, userTXCBalance: userBalance, isLoading: loading }: any) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);

  // Calculate unlocked tools based on progression
  const unlockedToolsCount = useMemo(() => {
    const baseUnlocked = 3;
    const completedCount = tools.filter((tool: any) => tool.isCompleted).length;
    const progressUnlocked = Math.floor(completedCount / 3) * 3;
    return Math.min(baseUnlocked + progressUnlocked, tools.length);
  }, [tools]);

  // Apply gaming locks to tools
  const gameAwareTools = useMemo(() => {
    return tools.map((tool: any, index: number) => ({
      ...tool,
      isLocked: index >= unlockedToolsCount,
      txc_cost: index >= unlockedToolsCount ? UNLOCK_COSTS.individual : 0,
      unlock_level: Math.floor(index / 3) + 1,
      unlockRequirement: index >= unlockedToolsCount 
        ? `Complete ${Math.ceil((index + 1 - 3) / 3) * 3 - tools.filter((t: any) => t.isCompleted).length} more tools`
        : undefined
    }));
  }, [tools, unlockedToolsCount]);

  // Filter tools based on search, category & difficulty
  const filteredTools = useMemo(() => {
    return gameAwareTools.filter((tool: any) => {
      const matchesSearch = searchQuery === '' || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || tool.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [gameAwareTools, searchQuery, selectedCategory, selectedDifficulty]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE;
  const paginatedTools = filteredTools.slice(startIndex, startIndex + TOOLS_PER_PAGE);

  const handleToolClick = (tool: any) => {
    if (!tool || !tool.name || !tool.slug) {
      console.error('Invalid tool data:', tool);
      return;
    }

    const mappedTool: Tool = {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      difficulty: tool.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedTime: tool.estimated_time || tool.estimatedTime || '5 mins',
      isLocked: tool.isLocked,
      isCompleted: tool.isCompleted,
      progress: tool.progress || 0,
      icon: tool.icon,
      slug: tool.slug,
      estimated_time: tool.estimated_time || '5 mins',
      txc_cost: tool.txc_cost || 0
    };
    
    setSelectedTool(mappedTool);
    setShowBenefitsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Apple-grade Pro Toolkit...</p>
        </div>
      </div>
    );
  }

  const categoryList = toolsByCategory ? Object.keys(toolsByCategory) : [];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        
        {/* Apple-style Game Progression Banner */}
        <GameProgressHeader 
          userStats={{
            totalTools: tools.length,
            completedTools: tools.filter((t: any) => t.isCompleted).length,
            currentStreak: userStats?.currentStreak || 0,
            totalTXC: userBalance || 0,
            userLevel: userStats?.userLevel || 1,
            nextLevelProgress: userStats?.nextLevelProgress || 0
          }}
          userName={userName || 'Candidate'}
          currentPage={currentPage}
          totalPages={totalPages}
          unlockedToolsCount={tools.filter((t: any) => !t.isLocked).length}
        />

        {/* Apple App Store Filter Bar & Search */}
        <div className="mb-8 space-y-4">
          
          {/* Glass Search & Filter Control Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Pill */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search AI career tools by keyword, skill, or objective..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/30 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Stats / Total Pill */}
            <div className="hidden sm:flex items-center gap-2 px-4 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Showing {filteredTools.length} of {tools.length} Tools</span>
            </div>
          </div>

          {/* Apple Segmented Control Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none p-1.5 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                selectedCategory === 'all'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md shadow-slate-200/50 dark:shadow-none"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>All Tools</span>
              <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0 font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {tools.length}
              </Badge>
            </button>

            {categoryList.map((category) => {
              const count = toolsByCategory[category]?.length || 0;
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                    isSelected
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md shadow-slate-200/50 dark:shadow-none"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span>{category}</span>
                  <Badge variant="outline" className="text-[10px] rounded-full px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>

        </div>

        {/* Empty Search State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-md">
              <Wand2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tools found matching your criteria</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your search query or switching category filters to discover tools.
            </p>
            <Button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              variant="outline"
              className="rounded-full px-6 text-xs font-semibold"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Apple Store Style Tools Grid */}
        <div className={cn(
          "grid gap-5 sm:gap-6 mb-10",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {paginatedTools.map((tool: any, index: number) => (
            <div key={tool.id} className="h-full">
              <GameToolCard 
                tool={tool}
                viewMode="grid"
                onToolClick={handleToolClick}
                onUnlockClick={handleToolClick}
              />
            </div>
          ))}
        </div>

        {/* Apple-style Pagination Control */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Page <span className="text-slate-900 dark:text-white font-bold">{currentPage}</span> of {totalPages}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-10 rounded-2xl px-4 text-xs font-semibold border-slate-200 dark:border-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Previous
              </Button>
              
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                      currentPage === page 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-10 rounded-2xl px-4 text-xs font-semibold border-slate-200 dark:border-slate-800"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Tool Details & Benefits Modal */}
        {selectedTool && (
          <ToolBenefitsModal 
            tool={selectedTool}
            isOpen={showBenefitsModal}
            onOpenChange={setShowBenefitsModal}
            onStartTesting={() => setShowBenefitsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

const Tools = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: "AI Career OS Tools | TalentXcel Platform",
      description: "Explore 26+ AI tools for career development, resume building, interview practice, and job matching.",
      keywords: ["AI career tools", "resume builder", "interview simulator", "job matching", "career development", "professional skills"]
    });
  }, []);

  return (
    <PageTransition>
      <ToolsErrorBoundary>
        <SafeToolsLoader>
          {(toolsData) => <ToolsContent {...toolsData} />}
        </SafeToolsLoader>
      </ToolsErrorBoundary>
    </PageTransition>
  );
};

export default Tools;