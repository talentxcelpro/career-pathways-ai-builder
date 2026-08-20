import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  Crown,
  Zap,
  Play,
  Trophy,
  Sparkles,
  ArrowRight,
  Shield,
  Target,
  ChevronRight
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

  const getCategoryStyles = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('career') || cat.includes('growth')) {
      return { gradient: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    }
    if (cat.includes('interview') || cat.includes('prep')) {
      return { gradient: 'from-purple-600 to-pink-600', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
    }
    if (cat.includes('resume') || cat.includes('cv')) {
      return { gradient: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    }
    if (cat.includes('job') || cat.includes('search')) {
      return { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    }
    return { gradient: 'from-indigo-600 to-cyan-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': 
        return { 
          color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80', 
          icon: Sparkles,
        };
      case 'intermediate': 
        return { 
          color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80', 
          icon: Target,
        };
      case 'advanced': 
        return { 
          color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80', 
          icon: Crown,
        };
      default: 
        return { 
          color: 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800', 
          icon: Shield,
        };
    }
  };

  const difficultyBadge = getDifficultyBadge(tool.difficulty);
  const categoryStyle = getCategoryStyles(tool.category);

  return (
    <div className={cn(
      "group relative rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden",
      "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80",
      "shadow-md hover:shadow-2xl hover:-translate-y-1.5",
      tool.isLocked && "opacity-75 bg-slate-50/50 dark:bg-slate-900/40",
      tool.isCompleted && "ring-2 ring-emerald-500/30 border-emerald-200 dark:border-emerald-900"
    )}>
      
      {/* Top Header Card Info */}
      <div className="p-5 sm:p-6 pb-2">
        <div className="flex items-start justify-between mb-4">
          {/* iOS Squircle App Icon */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-md group-hover:scale-105",
            tool.isLocked
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
              : `bg-gradient-to-br ${categoryStyle.gradient} text-white shadow-indigo-500/20`
          )}>
            <IconComponent className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className={cn("text-[11px] font-semibold rounded-full px-2.5 py-0.5 border shadow-2xs", difficultyBadge.color)}>
              <difficultyBadge.icon className="w-3 h-3 mr-1" />
              {tool.difficulty.charAt(0).toUpperCase() + tool.difficulty.slice(1)}
            </Badge>
            {tool.isCompleted && (
              <Badge className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-emerald-500 text-white border-0 shadow-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </Badge>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
          {tool.description}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 sm:p-6 pt-3 space-y-4">
        {/* Meta pill bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-medium">TalentXcel • {tool.estimatedTime}</span>
          </span>
          <Badge variant="outline" className={cn("text-[11px] font-medium rounded-full px-2.5 py-0.5 border", categoryStyle.bg)}>
            {tool.category}
          </Badge>
        </div>

        {/* Action Button */}
        <div>
          {tool.isLocked ? (
            tool.txc_cost > 0 ? (
              <TXCFeaturePurchase
                featureId={`tool-${tool.id}`}
                featureName={tool.name}
                cost={tool.txc_cost}
                onSuccess={() => onUnlockClick(tool)}
                className="w-full rounded-2xl h-11 text-xs font-semibold shadow-md"
                size="default"
              />
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed" 
                disabled
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Locked
              </Button>
            )
          ) : (
            <Button 
              onClick={() => onToolClick(tool)}
              className={cn(
                "w-full h-11 rounded-2xl font-bold text-xs tracking-wide transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2",
                tool.isCompleted 
                  ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white" 
                  : `bg-gradient-to-r ${categoryStyle.gradient} text-white hover:opacity-95`
              )}
            >
              <span>{tool.isCompleted ? 'Run Again' : 'Launch Tool'}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};