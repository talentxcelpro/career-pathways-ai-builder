import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Star, Zap, Crown, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCMining } from '@/hooks/useTXCMining';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPremium: boolean;
  estimatedTime: string;
  path: string;
  txcCost?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredCompletions?: number;
}

interface AppleToolsGridProps {
  tools: Tool[];
  completedTools: string[];
  onToolComplete: (toolId: string) => void;
}

const TOOLS_PER_PAGE = 6;

export const AppleToolsGrid: React.FC<AppleToolsGridProps> = ({
  tools,
  completedTools,
  onToolComplete
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { availableBalance } = useTokenBalance();
  const { earnTXC } = useTXCMining();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [unlockedPages, setUnlockedPages] = useState<Set<number>>(new Set([0]));
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Split tools into pages
  const totalPages = Math.ceil(tools.length / TOOLS_PER_PAGE);
  const paginatedTools = Array.from({ length: totalPages }, (_, pageIndex) =>
    tools.slice(pageIndex * TOOLS_PER_PAGE, (pageIndex + 1) * TOOLS_PER_PAGE)
  );

  // Check page unlock status
  useEffect(() => {
    const newUnlockedPages = new Set([0]); // First page always unlocked
    
    for (let page = 1; page < totalPages; page++) {
      const previousPageTools = paginatedTools[page - 1];
      const completedOnPreviousPage = previousPageTools?.filter(tool => 
        completedTools.includes(tool.id)
      ).length || 0;
      
      // Unlock if 3+ tools completed on previous page
      if (completedOnPreviousPage >= 3) {
        newUnlockedPages.add(page);
      }
    }
    
    setUnlockedPages(newUnlockedPages);
  }, [completedTools, paginatedTools, totalPages]);

  const isPageUnlocked = (pageIndex: number) => unlockedPages.has(pageIndex);
  const isToolUnlocked = (tool: Tool, pageIndex: number) => {
    if (!isPageUnlocked(pageIndex)) return false;
    if (tool.requiredCompletions) {
      return completedTools.length >= tool.requiredCompletions;
    }
    return true;
  };

  const getPageProgress = (pageIndex: number) => {
    const pageTools = paginatedTools[pageIndex];
    if (!pageTools) return 0;
    
    const completed = pageTools.filter(tool => completedTools.includes(tool.id)).length;
    return Math.round((completed / pageTools.length) * 100);
  };

  const handleToolClick = async (tool: Tool, pageIndex: number) => {
    if (!user) {
      toast.error('Please login to access tools');
      navigate('/auth/login');
      return;
    }

    if (!isToolUnlocked(tool, pageIndex)) {
      if (tool.txcCost && availableBalance >= tool.txcCost) {
        // Show purchase option
        toast.info(`Unlock this tool for ${tool.txcCost} TXC tokens?`, {
          action: {
            label: 'Unlock',
            onClick: () => handleUnlockWithTXC(tool)
          }
        });
        return;
      } else {
        toast.error('Complete more tools to unlock this feature');
        return;
      }
    }

    // Award TXC for tool usage
    await earnTXC('tool_usage', { toolId: tool.id, toolName: tool.name });
    
    navigate(tool.path);
  };

  const handleUnlockWithTXC = async (tool: Tool) => {
    if (!tool.txcCost || availableBalance < tool.txcCost) {
      toast.error('Insufficient TXC balance');
      return;
    }
    
    // Implement TXC spending logic here
    toast.success(`${tool.name} unlocked with TXC!`);
    navigate(tool.path);
  };

  const handleUnlockPage = (pageIndex: number) => {
    const requiredCost = pageIndex * 50; // 50 TXC per page
    if (availableBalance >= requiredCost) {
      toast.info(`Unlock page ${pageIndex + 1} for ${requiredCost} TXC?`, {
        action: {
          label: 'Unlock',
          onClick: () => {
            setUnlockedPages(prev => new Set([...prev, pageIndex]));
            toast.success(`Page ${pageIndex + 1} unlocked!`);
          }
        }
      });
    } else {
      toast.error('Insufficient TXC balance');
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-500 text-white">Beginner</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-500 text-white">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-red-500 text-white">Advanced</Badge>;
      default:
        return null;
    }
  };

  const currentPageTools = paginatedTools[currentPage] || [];

  return (
    <div className="space-y-8">
      {/* Page Progress Header */}
      <div className="bg-gradient-to-r from-background via-primary/5 to-background rounded-3xl p-6 backdrop-blur-xl border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Tools Collection
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="w-4 h-4" />
            <span>{availableBalance} TXC</span>
          </div>
        </div>
        
        {/* Page Progress Indicators */}
        <div className="flex items-center gap-3 mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300",
                currentPage === i 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : isPageUnlocked(i)
                    ? "bg-muted hover:bg-muted/80 cursor-pointer"
                    : "bg-muted/50 opacity-50"
              )}
              onClick={() => isPageUnlocked(i) && setCurrentPage(i)}
            >
              {isPageUnlocked(i) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Page {i + 1}</span>
              <div className="text-xs opacity-70">{getPageProgress(i)}%</div>
            </div>
          ))}
        </div>

        {/* Unlock Next Page */}
        {!isPageUnlocked(currentPage + 1) && currentPage + 1 < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUnlockPage(currentPage + 1)}
            className="mb-4"
          >
            <Crown className="w-4 h-4 mr-2" />
            Unlock Next Page ({(currentPage + 1) * 50} TXC)
          </Button>
        )}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPageTools.map((tool, index) => {
          const isUnlocked = isToolUnlocked(tool, currentPage);
          const isCompleted = completedTools.includes(tool.id);
          const isHovered = hoveredTool === tool.id;

          return (
            <div
              key={tool.id}
              className={cn(
                "group relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer",
                "backdrop-blur-xl border border-border/50",
                isUnlocked 
                  ? "bg-gradient-to-br from-card/80 to-primary/5 hover:shadow-2xl hover:scale-105" 
                  : "bg-gradient-to-br from-muted/50 to-muted/30",
                isCompleted && "ring-2 ring-success bg-gradient-to-br from-success/10 to-success/5",
                isHovered && "shadow-glow transform-gpu"
              )}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              onClick={() => handleToolClick(tool, currentPage)}
            >
              {/* Completion Badge */}
              {isCompleted && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-success text-success-foreground p-2 rounded-full shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              )}

              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-white/80 mx-auto mb-2" />
                    {tool.txcCost && (
                      <div className="text-white/90 text-sm font-medium">
                        {tool.txcCost} TXC to unlock
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Tool Icon */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-primary/20 to-primary/10",
                  isHovered && "scale-110 shadow-lg"
                )}>
                  <div className="text-primary text-2xl">
                    {tool.icon}
                  </div>
                </div>

                {/* Tool Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-foreground leading-tight">
                      {tool.name}
                    </h3>
                    {tool.isPremium && (
                      <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDifficultyBadge(tool.difficulty)}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3" />
                        <span>{tool.estimatedTime}</span>
                      </div>
                    </div>
                    
                    {tool.txcCost && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Coins className="w-3 h-3" />
                        <span>{tool.txcCost}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Current Tool */}
                {isUnlocked && (
                  <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        isCompleted ? "bg-success w-full" : "bg-primary w-0"
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Hover Glow Effect */}
              {isHovered && isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};