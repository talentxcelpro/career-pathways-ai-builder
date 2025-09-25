import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  CheckCircle2, 
  Star, 
  Clock, 
  TrendingUp,
  Crown,
  Coins,
  Zap,
  Play,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TXCFeaturePurchase } from '@/components/txc/TXCFeaturePurchase';

interface GameToolCardProps {
  tool: {
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
    txc_cost: number;
    unlockRequirement?: string;
    usageCount?: number;
  };
  onToolClick: (tool: any) => void;
  onUnlockClick: (tool: any) => void;
  viewMode: 'grid' | 'list';
}

export const GameToolCard: React.FC<GameToolCardProps> = ({
  tool,
  onToolClick,
  onUnlockClick,
  viewMode = 'grid'
}) => {
  const IconComponent = tool.icon;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: Zap };
      case 'intermediate': return { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: Star };
      case 'advanced': return { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: Crown };
      default: return { color: 'bg-gray-500/10 text-gray-700 border-gray-500/20', icon: Star };
    }
  };

  const difficultyBadge = getDifficultyBadge(tool.difficulty);

  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50",
        tool.isLocked ? "opacity-60" : "hover:shadow-xl hover:-translate-y-1",
        tool.isCompleted && "ring-2 ring-green-500/20 bg-green-50/50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className={cn(
              "relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300",
              tool.isLocked ? "bg-muted/50" : "bg-primary/10 group-hover:bg-primary/20",
              tool.isCompleted && "bg-green-500/10"
            )}>
              {tool.isLocked && <Lock className="absolute top-1 right-1 w-4 h-4 text-muted-foreground/60" />}
              {tool.isCompleted && <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-green-500" />}
              <IconComponent className={cn(
                "w-8 h-8 transition-all duration-300",
                tool.isLocked ? "text-muted-foreground/60" : "text-primary group-hover:text-primary/80",
                tool.isCompleted && "text-green-600"
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn("border", difficultyBadge.color)}>
                    <difficultyBadge.icon className="w-3 h-3 mr-1" />
                    {tool.difficulty}
                  </Badge>
                  {tool.usageCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {tool.usageCount} uses
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {tool.estimatedTime}
                  </div>
                  <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  {tool.isLocked ? (
                    tool.txc_cost > 0 ? (
                      <TXCFeaturePurchase
                        featureId={`tool-${tool.id}`}
                        featureName={tool.name}
                        cost={tool.txc_cost}
                        onSuccess={() => onUnlockClick(tool)}
                        size="sm"
                        variant="outline"
                      />
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled
                        className="text-muted-foreground"
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Locked
                      </Button>
                    )
                  ) : (
                    <Button 
                      onClick={() => onToolClick(tool)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {tool.isCompleted ? 'Use Again' : 'Start'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm",
      tool.isLocked ? "opacity-70 grayscale" : "hover:shadow-xl hover:-translate-y-2 hover:rotate-1",
      tool.isCompleted && "ring-2 ring-green-500/30 shadow-green-500/10"
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Lock overlay */}
      {tool.isLocked && (
        <div className="absolute inset-0 bg-muted/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/80 max-w-32">
              {tool.unlockRequirement || 'Unlock required'}
            </p>
          </div>
        </div>
      )}

      {/* Completion badge */}
      {tool.isCompleted && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
      )}

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shadow-lg",
            tool.isLocked ? "bg-muted/50" : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110",
            tool.isCompleted && "bg-green-500/20 ring-2 ring-green-500/30"
          )}>
            <IconComponent className={cn(
              "w-7 h-7 transition-all duration-300",
              tool.isLocked ? "text-muted-foreground/60" : "text-primary",
              tool.isCompleted && "text-green-600"
            )} />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge className={cn("border shadow-sm", difficultyBadge.color)}>
              <difficultyBadge.icon className="w-3 h-3 mr-1" />
              {tool.difficulty}
            </Badge>
            {tool.usageCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {tool.usageCount} uses
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
          {tool.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {tool.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        {/* Progress bar for completed tools */}
        {tool.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{tool.progress}%</span>
            </div>
            <Progress value={tool.progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {tool.estimatedTime}
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-background/50">
            {tool.category}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {tool.isLocked ? (
            <>
              {tool.txc_cost > 0 ? (
                <TXCFeaturePurchase
                  featureId={`tool-${tool.id}`}
                  featureName={tool.name}
                  cost={tool.txc_cost}
                  onSuccess={() => onUnlockClick(tool)}
                  className="w-full"
                  size="sm"
                />
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Complete Requirements
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={() => onToolClick(tool)}
              className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {tool.isCompleted ? 'Use Again' : 'Start Tool'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};