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
import { ToolsErrorBoundary } from '@/components/common/ToolsErrorBoundary';
import { SafeToolsLoader } from '@/components/tools/SafeToolsLoader';
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

const ToolsContent = ({ tools, toolsByCategory, userStats, userName, userTXCBalance: userBalance, isLoading: loading, getToolBySlug }: any) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

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

  const handleToolClick = (tool: any) => {
    // Validate tool data before setting
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
      estimatedTime: tool.estimated_time,
      isLocked: tool.isLocked,
      isCompleted: tool.isCompleted,
      progress: tool.progress,
      icon: tool.icon,
      slug: tool.slug,
      estimated_time: tool.estimated_time,
      txc_cost: tool.txc_cost
    };
    
    setSelectedTool(mappedTool);
    setShowBenefitsModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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

      <div className="container mx-auto px-4 py-12">
        <div className={cn(
          "grid gap-6 mb-12",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {paginatedTools.map((tool) => (
            <GameToolCard 
              key={tool.id}
              tool={tool}
              viewMode={viewMode}
              onToolClick={handleToolClick}
              onUnlockClick={handleToolClick}
            />
          ))}
        </div>
        
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
      title: "AI-Powered Career Tools | Transform Your Professional Journey",
      description: "Access 26+ AI tools for career development, resume building, interview prep, and job matching. Unlock premium features with TXC tokens.",
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