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
  Crown,
  Zap,
  Play,
  Trophy,
  Sparkles,
  ArrowRight,
  Shield,
  Target
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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': 
        return { 
          color: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 border-emerald-500/30', 
          icon: Sparkles,
          gradient: 'from-emerald-500 to-green-500'
        };
      case 'intermediate': 
        return { 
          color: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-500/30', 
          icon: Target,
          gradient: 'from-amber-500 to-orange-500'
        };
      case 'advanced': 
        return { 
          color: 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 border-violet-500/30', 
          icon: Crown,
          gradient: 'from-violet-500 to-purple-500'
        };
      default: 
        return { 
          color: 'bg-gradient-to-r from-slate-500/10 to-gray-500/10 text-slate-700 border-slate-500/30', 
          icon: Shield,
          gradient: 'from-slate-500 to-gray-500'
        };
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
      "group relative overflow-hidden transition-all duration-700 ease-out border-0 bg-gradient-to-br from-background via-background/80 to-background/60 backdrop-blur-xl",
      "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]",
      tool.isLocked 
        ? "opacity-60 scale-95" 
        : "hover:scale-[1.02] hover:-translate-y-1",
      tool.isCompleted && "ring-1 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
    )}>
      
      {/* Apple-style gradient mesh */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
        `bg-gradient-to-br ${difficultyBadge.gradient}/10 via-primary/5 to-accent/10`
      )} />
      
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-60" />
      
      {/* Lock state overlay */}
      {tool.isLocked && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-md z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center p-6 space-y-3">
            <div className="w-12 h-12 mx-auto bg-muted/50 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground/70" />
            </div>
            <p className="text-sm text-muted-foreground/90 font-medium max-w-32 leading-relaxed">
              {tool.unlockRequirement || 'Complete previous tools'}
            </p>
          </div>
        </div>
      )}

      {/* Success state indicator */}
      {tool.isCompleted && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-2.5 rounded-full shadow-lg ring-2 ring-white/20">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
      )}

      <CardHeader className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          {/* Tool icon with Apple-style design */}
          <div className={cn(
            "relative flex items-center justify-center w-16 h-16 rounded-3xl transition-all duration-500 shadow-lg",
            "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:opacity-20",
            tool.isLocked 
              ? "bg-muted/30 before:from-muted before:to-muted/50" 
              : `bg-gradient-to-br ${difficultyBadge.gradient}/20 before:${difficultyBadge.gradient} group-hover:scale-110 group-hover:shadow-xl`,
            tool.isCompleted && "ring-2 ring-emerald-500/30 shadow-emerald-500/20"
          )}>
            <IconComponent className={cn(
              "relative z-10 w-8 h-8 transition-all duration-500",
              tool.isLocked 
                ? "text-muted-foreground/60" 
                : `text-transparent bg-gradient-to-br ${difficultyBadge.gradient} bg-clip-text group-hover:scale-110`,
              tool.isCompleted && "text-emerald-600"
            )} />
          </div>
          
          {/* Badges */}
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn(
              "border-0 shadow-sm font-medium px-3 py-1.5 text-xs",
              difficultyBadge.color
            )}>
              <difficultyBadge.icon className="w-3 h-3 mr-1.5" />
              {tool.difficulty.charAt(0).toUpperCase() + tool.difficulty.slice(1)}
            </Badge>
            {tool.usageCount > 0 && (
              <Badge variant="outline" className="text-xs bg-background/60 backdrop-blur-sm">
                {tool.usageCount} use{tool.usageCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="text-xl font-bold leading-tight mb-3 text-foreground group-hover:text-primary transition-colors duration-300 tracking-tight">
          {tool.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {tool.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 p-6 pt-2">
        {/* Progress indicator for active tools */}
        {tool.progress > 0 && (
          <div className="mb-5 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground">Progress</span>
              <span className="text-xs font-bold text-primary">{tool.progress}%</span>
            </div>
            <Progress value={tool.progress} className="h-2.5 bg-muted/30" />
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{tool.estimatedTime}</span>
          </div>
          <Badge variant="outline" className="text-xs bg-background/60 backdrop-blur-sm border-border/50 px-3 py-1">
            {tool.category}
          </Badge>
        </div>

        {/* CTA Button with Apple-style design */}
        <div className="space-y-3">
          {tool.isLocked ? (
            <>
              {tool.txc_cost > 0 ? (
                <TXCFeaturePurchase
                  featureId={`tool-${tool.id}`}
                  featureName={tool.name}
                  cost={tool.txc_cost}
                  onSuccess={() => onUnlockClick(tool)}
                  className="w-full"
                  size="default"
                />
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-12 bg-muted/20 border-muted/50 text-muted-foreground cursor-not-allowed" 
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
              className={cn(
                "w-full h-12 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl",
                "bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98]",
                tool.isCompleted 
                  ? "from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600" 
                  : `${difficultyBadge.gradient} hover:shadow-primary/25`
              )}
              size="default"
            >
              <div className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                <span>{tool.isCompleted ? 'Use Again' : 'Start Tool'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};