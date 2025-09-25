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
import { Coins, Crown, Lock, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    txcCost?: number;
    requiredCompletions?: number;
    isPremium: boolean;
  } | null;
  userTXCBalance: number;
  completedToolsCount: number;
  onUnlockWithTXC: () => void;
  onViewRequirements: () => void;
}

export const ToolUnlockModal: React.FC<ToolUnlockModalProps> = ({
  isOpen,
  onClose,
  tool,
  userTXCBalance,
  completedToolsCount,
  onUnlockWithTXC,
  onViewRequirements
}) => {
  if (!tool) return null;

  const canAffordTXC = tool.txcCost ? userTXCBalance >= tool.txcCost : false;
  const meetsRequirements = tool.requiredCompletions ? completedToolsCount >= tool.requiredCompletions : true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              {tool.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {tool.name}
                {tool.isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
              </div>
              <DialogDescription className="text-left mt-1">
                {tool.description}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="bg-muted/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Unlock Requirements</span>
            </div>
            
            <div className="space-y-3">
              {tool.txcCost && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="text-sm">TXC Cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={canAffordTXC ? "default" : "destructive"}>
                      {tool.txcCost} TXC
                    </Badge>
                    {canAffordTXC && <Star className="w-4 h-4 text-success" />}
                  </div>
                </div>
              )}

              {tool.requiredCompletions && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Required Completions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={meetsRequirements ? "default" : "secondary"}>
                      {completedToolsCount}/{tool.requiredCompletions}
                    </Badge>
                    {meetsRequirements && <Star className="w-4 h-4 text-success" />}
                  </div>
                </div>
              )}

              {/* User Balance */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Your TXC Balance</span>
                <Badge variant="outline">{userTXCBalance} TXC</Badge>
              </div>
            </div>
          </div>

          {/* Unlock Options */}
          <div className="space-y-3">
            {tool.txcCost && (
              <Button
                onClick={onUnlockWithTXC}
                disabled={!canAffordTXC}
                className={cn(
                  "w-full justify-between h-12",
                  canAffordTXC 
                    ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                    : "opacity-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  <span>Unlock with TXC</span>
                </div>
                <Badge variant="secondary">{tool.txcCost} TXC</Badge>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onViewRequirements}
              className="w-full h-12"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>View Requirements</span>
              </div>
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Pro Tips</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Complete tools to earn TXC tokens</li>
                  <li>• Maintain daily streaks for bonus rewards</li>
                  <li>• Complete 3 tools per page to unlock the next one</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};