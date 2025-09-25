import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Crown, Lock, Star, Zap, Trophy, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    txc_cost?: number;
    required_completions?: number;
    is_premium: boolean;
    unlock_level?: number;
    difficulty?: string;
    estimated_time?: string;
  } | null;
  userTXCBalance: number;
  completedToolsCount: number;
  userLevel: number;
  onUnlockWithTXC: () => void;
  onViewRequirements: () => void;
}

export const ToolUnlockModal: React.FC<ToolUnlockModalProps> = ({
  isOpen,
  onClose,
  tool,
  userTXCBalance,
  completedToolsCount,
  userLevel,
  onUnlockWithTXC,
  onViewRequirements
}) => {
  if (!tool) return null;

  const canAffordTXC = tool.txc_cost ? userTXCBalance >= tool.txc_cost : false;
  const meetsRequirements = tool.required_completions ? completedToolsCount >= tool.required_completions : true;
  const IconComponent = tool.icon;
  
  const progressToNext = tool.required_completions ? (completedToolsCount / tool.required_completions) * 100 : 100;
  const remainingTools = tool.required_completions ? Math.max(0, tool.required_completions - completedToolsCount) : 0;

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "from-emerald-500 to-green-600";
      case 2: return "from-blue-500 to-cyan-600";
      case 3: return "from-purple-500 to-violet-600";
      case 4: return "from-amber-500 to-orange-600";
      default: return "from-slate-500 to-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background/95 to-muted/50 border-border/50 backdrop-blur-xl">
        <DialogHeader className="text-center space-y-4">
          {/* Tool Icon and Badge */}
          <div className="flex items-center justify-center relative">
            <div className={cn(
              "p-6 rounded-3xl backdrop-blur-md border-2",
              "bg-gradient-to-br from-primary/10 to-primary/20",
              "border-primary/20 shadow-2xl"
            )}>
              <IconComponent className="w-16 h-16 text-primary" />
            </div>
            {tool.is_premium && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 text-xs font-bold">
                  <Crown className="w-3 h-3 mr-1" />
                  PREMIUM
                </Badge>
              </div>
            )}
          </div>

          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {tool.name}
          </DialogTitle>
          
          <DialogDescription className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-8">
          {/* Level and Progress Section */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-3xl p-6 border border-border/50">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "p-3 rounded-2xl bg-gradient-to-r text-white font-bold text-sm",
                getLevelColor(tool.unlock_level || 1)
              )}>
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Level {tool.unlock_level || 1} Tool</h3>
                <p className="text-sm text-muted-foreground">
                  {tool.difficulty} • {tool.estimated_time}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {tool.required_completions && tool.required_completions > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Unlock Progress</span>
                  <span className="font-medium">{completedToolsCount}/{tool.required_completions} tools</span>
                </div>
                <Progress 
                  value={progressToNext} 
                  className="h-3 bg-muted"
                />
                {remainingTools > 0 && (
                  <p className="text-sm text-center text-muted-foreground">
                    Complete {remainingTools} more tool{remainingTools > 1 ? 's' : ''} to unlock
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Unlock Requirements */}
          <div className="bg-muted/30 rounded-3xl p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <span className="font-bold text-xl">Unlock Options</span>
            </div>
            
            <div className="grid gap-4">
              {/* TXC Option */}
              {tool.txc_cost && tool.txc_cost > 0 && (
                <div className={cn(
                  "p-4 rounded-2xl border-2 transition-all duration-300",
                  canAffordTXC 
                    ? "border-primary/50 bg-primary/5 hover:border-primary" 
                    : "border-destructive/30 bg-destructive/5"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl",
                        canAffordTXC ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Instant Unlock</div>
                        <div className="text-sm text-muted-foreground">
                          Pay {tool.txc_cost} TXC tokens
                        </div>
                      </div>
                    </div>
                    <Badge variant={canAffordTXC ? "default" : "destructive"}>
                      {tool.txc_cost} TXC
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={onUnlockWithTXC}
                    disabled={!canAffordTXC}
                    className={cn(
                      "w-full mt-4 h-12 font-semibold",
                      canAffordTXC 
                        ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                        : "opacity-50"
                    )}
                  >
                    <Coins className="w-5 h-5 mr-2" />
                    {canAffordTXC ? "Unlock with TXC" : "Insufficient TXC"}
                  </Button>
                </div>
              )}

              {/* Progress Option */}
              <div className="p-4 rounded-2xl border-2 border-accent/30 bg-accent/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent text-accent-foreground">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">Earn Through Progress</div>
                      <div className="text-sm text-muted-foreground">
                        Complete tools to unlock naturally
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-accent text-accent">
                    FREE
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  onClick={onViewRequirements}
                  className="w-full h-12 border-accent hover:bg-accent/10"
                >
                  <Star className="w-5 h-5 mr-2" />
                  View Requirements
                </Button>
              </div>
            </div>

            {/* Current Balance Display */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
              <span className="text-sm text-muted-foreground">Your TXC Balance</span>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                  {userTXCBalance.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Gaming Tips */}
          <div className="bg-gradient-to-r from-accent/10 to-accent/20 rounded-3xl p-6 border border-accent/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-3 text-accent">Pro Gaming Tips 🎮</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent" />
                    Complete 3 tools per level to unlock the next tier
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    Maintain daily streaks for bonus TXC rewards
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Share achievements to earn social bonuses
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    Higher level tools provide better career insights
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};