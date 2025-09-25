import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameProgressHeader } from '@/components/tools/GameProgressHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { updateMetaTags } from '@/utils/metaTags';
import { useRealToolsData } from '@/hooks/useRealToolsData';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Tools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Use real tools data
  const { 
    toolsByCategory, 
    userStats, 
    userName,
    userTXCBalance,
    isLoading 
  } = useRealToolsData();

  useEffect(() => {
    updateMetaTags({
      title: "AI-Powered Career Tools | TalentXcel",
      description: "Unlock your career potential with 25+ AI tools for resume building, interview prep, job search, and career growth. Start your journey today!",
      keywords: ["AI career tools", "resume builder", "interview preparation", "job search", "career development", "ATS optimization"]
    });
  }, []);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mb-4"></div>
              <div className="h-48 bg-muted rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Game Progress Header */}
          <GameProgressHeader
            userName={userName}
            totalTools={userStats.totalTools}
            completedTools={userStats.completedTools}
            currentStreak={userStats.currentStreak}
            totalTXC={userStats.totalTXC}
            userLevel={userStats.userLevel}
            nextLevelProgress={userStats.nextLevelProgress}
          />

          {/* Apple-style Tools Grid */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                AI-Powered Career Tools
              </h2>
              <p className="text-muted-foreground">
                25+ tools to accelerate your career growth
              </p>
            </div>
            
            {/* Simplified Tools Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">{category}</h3>
                  <div className="space-y-3">
                    {categoryTools.map((tool) => (
                      <div
                        key={tool.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all duration-200",
                          tool.isLocked 
                            ? "bg-muted/50 border-muted" 
                            : "bg-card border-border hover:border-primary/50 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            "p-2 rounded-lg",
                            tool.isLocked ? "bg-muted" : "bg-primary/10"
                          )}>
                            {React.createElement(tool.icon as any, { 
                              className: cn(
                                "w-5 h-5",
                                tool.isLocked ? "text-muted-foreground" : "text-primary"
                              )
                            })}
                          </div>
                          <div className="flex-1">
                            <h4 className={cn(
                              "font-medium",
                              tool.isLocked ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {tool.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                          {tool.isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                          {tool.isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {tool.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {tool.estimated_time}
                            </Badge>
                          </div>
                          {tool.txc_cost > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {tool.txc_cost} TXC
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Tools;