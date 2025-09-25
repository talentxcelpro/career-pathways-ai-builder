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
  console.log('🎯 Tools component mounted - VERIFY THIS APPEARS');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('👤 User in Tools:', user?.id);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Use real tools data
  console.log('🔧 About to call useRealToolsData...');
  const { 
    toolsByCategory, 
    userStats, 
    userName,
    userTXCBalance,
    isLoading 
  } = useRealToolsData();
  
  console.log('📊 useRealToolsData results:');
  console.log('- isLoading:', isLoading);
  console.log('- toolsByCategory:', toolsByCategory);
  console.log('- userStats:', userStats);
  console.log('- userName:', userName);
  console.log('- userTXCBalance:', userTXCBalance);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
        <div className="container mx-auto px-4 py-8">
          <GameProgressHeader 
            userName={userName}
            totalTools={userStats.totalTools}
            completedTools={userStats.completedTools}
            currentStreak={userStats.currentStreak}
            totalTXC={userStats.totalTXC}
            userLevel={userStats.userLevel}
            nextLevelProgress={userStats.nextLevelProgress}
          />

          <div className="mt-8 space-y-8">
            {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground capitalize">
                    {category} Tools
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {categoryTools.filter(tool => tool.isCompleted).length} / {categoryTools.length} completed
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map((tool) => (
                    <div
                      key={tool.id}
                      className={cn(
                        "p-6 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-lg",
                        tool.isLocked 
                          ? "bg-muted/50 border-muted" 
                          : "bg-card border-border hover:border-primary/50",
                        tool.isCompleted && "ring-2 ring-primary/20"
                      )}
                      onClick={() => !tool.isLocked && navigate(`/tools/${tool.slug}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "p-3 rounded-lg",
                          tool.isLocked 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {React.createElement(tool.icon as any, { size: 24 })}
                        </div>
                        <div className="flex items-center gap-2">
                          {tool.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                          {tool.isCompleted && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                      </div>

                      <h3 className={cn(
                        "font-semibold mb-2",
                        tool.isLocked ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {tool.name}
                      </h3>
                      
                      <p className={cn(
                        "text-sm mb-4 line-clamp-2",
                        tool.isLocked ? "text-muted-foreground" : "text-muted-foreground"
                      )}>
                        {tool.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            tool.difficulty === 'beginner' && "border-green-500 text-green-700",
                            tool.difficulty === 'intermediate' && "border-yellow-500 text-yellow-700",
                            tool.difficulty === 'advanced' && "border-red-500 text-red-700"
                          )}>
                            {tool.difficulty}
                          </Badge>
                          <span className="text-muted-foreground">{tool.estimated_time}</span>
                        </div>
                        
                        {tool.txc_cost > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {tool.txc_cost} TXC
                            </Badge>
                            <span className="text-muted-foreground">
                              Balance: {userTXCBalance}
                            </span>
                          </div>
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
    </PageTransition>
  );
};

export default Tools;