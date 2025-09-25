import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TXCFeaturePurchase } from '@/components/txc/TXCFeaturePurchase';
import { 
  Lock, 
  Unlock, 
  Coins, 
  Star, 
  Crown, 
  Zap, 
  CheckCircle2,
  Target,
  Trophy,
  Gift,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolUnlockModalProps {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    txc_cost: number;
    icon: React.ComponentType<any>;
    unlockRequirement?: string;
  } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockSuccess: () => void;
  userTXCBalance: number;
  canUnlockWithProgress?: boolean;
  completedRequiredTools?: number;
  requiredToolsCount?: number;
}

export const ToolUnlockModal: React.FC<ToolUnlockModalProps> = ({
  tool,
  isOpen,
  onOpenChange,
  onUnlockSuccess,
  userTXCBalance,
  canUnlockWithProgress = false,
  completedRequiredTools = 0,
  requiredToolsCount = 3
}) => {
  const [unlockMode, setUnlockMode] = useState<'txc' | 'progress'>('txc');

  if (!tool) return null;

  const IconComponent = tool.icon;

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: Zap };
      case 'intermediate': return { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: Star };
      case 'advanced': return { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: Crown };
      default: return { color: 'bg-gray-500/10 text-gray-700 border-gray-500/20', icon: Star };
    }
  };

  const difficultyBadge = getDifficultyBadge(tool.difficulty);

  const progressPercentage = (completedRequiredTools / requiredToolsCount) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            Unlock Tool
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to unlock this premium tool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Preview */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{tool.name}</h3>
                    <Badge className={cn("border", difficultyBadge.color)}>
                      <difficultyBadge.icon className="w-3 h-3 mr-1" />
                      {tool.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>⏱️ {tool.estimatedTime}</span>
                    <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unlock Options */}
          <div className="space-y-3">
            {/* TXC Unlock */}
            <Card className={cn(
              "cursor-pointer transition-all duration-200 border-2",
              unlockMode === 'txc' 
                ? "border-primary bg-primary/5" 
                : "border-border/50 hover:border-primary/50"
            )}>
              <CardContent className="p-4" onClick={() => setUnlockMode('txc')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Coins className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Instant Unlock</p>
                      <p className="text-sm text-muted-foreground">Use TXC tokens</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{tool.txc_cost}</p>
                    <p className="text-xs text-muted-foreground">TXC</p>
                  </div>
                </div>
                
                {userTXCBalance < tool.txc_cost && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600">
                      Insufficient balance. You need {tool.txc_cost - userTXCBalance} more TXC.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Unlock */}
            {canUnlockWithProgress && (
              <Card className={cn(
                "cursor-pointer transition-all duration-200 border-2",
                unlockMode === 'progress' 
                  ? "border-green-500 bg-green-500/5" 
                  : "border-border/50 hover:border-green-500/50"
              )}>
                <CardContent className="p-4" onClick={() => setUnlockMode('progress')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Progress Unlock</p>
                        <p className="text-sm text-muted-foreground">Complete previous tools</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{completedRequiredTools}/{requiredToolsCount}</p>
                      <p className="text-xs text-muted-foreground">completed</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progressPercentage === 100 
                        ? "✅ Ready to unlock!" 
                        : `Complete ${requiredToolsCount - completedRequiredTools} more tools`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {unlockMode === 'txc' ? (
              <TXCFeaturePurchase
                featureId={`tool-${tool.id}`}
                featureName={tool.name}
                cost={tool.txc_cost}
                onSuccess={() => {
                  onUnlockSuccess();
                  onOpenChange(false);
                }}
                className="flex-1"
                disabled={userTXCBalance < tool.txc_cost}
              />
            ) : (
              <Button 
                onClick={() => {
                  if (progressPercentage === 100) {
                    onUnlockSuccess();
                    onOpenChange(false);
                  }
                }}
                disabled={progressPercentage < 100}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                {progressPercentage === 100 ? 'Unlock Now' : 'Complete Requirements'}
              </Button>
            )}
          </div>

          {/* Benefits Preview */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">What you'll get:</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Unlimited access to {tool.name}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Advanced AI-powered features
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Progress tracking & analytics
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};