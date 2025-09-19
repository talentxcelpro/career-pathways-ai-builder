import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Calendar, Target, TrendingUp, Gift, Star, Crown, Medal, Award, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  current: number;
  reward: number;
  category: 'daily' | 'growth' | 'milestone';
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Task {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reward: number;
  completed: boolean;
  category: 'daily' | 'growth';
  streak?: number;
}

interface UserStats {
  level: number;
  totalTXC: number;
  todayTXC: number;
  potentialTXC: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  achievements: number;
  nextLevelProgress: number;
}

export default function GamificationCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'achievements' | 'leaderboard'>('overview');
  
  // Mock data - replace with actual API calls
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    totalTXC: 25840,
    todayTXC: 375,
    potentialTXC: 2210,
    currentStreak: 7,
    longestStreak: 23,
    tasksCompleted: 156,
    achievements: 28,
    nextLevelProgress: 65
  });

  const dailyTasks: Task[] = useMemo(() => [
    {
      id: 'daily_login',
      title: 'Daily Login',
      description: 'Log in daily to build your streak',
      icon: <Calendar className="h-4 w-4" />,
      reward: 75,
      completed: true,
      category: 'daily',
      streak: userStats.currentStreak
    },
    {
      id: 'apply_jobs',
      title: 'Apply to Jobs',
      description: 'Apply to at least one job per day',
      icon: <Target className="h-4 w-4" />,
      reward: 90,
      completed: false,
      category: 'daily'
    },
    {
      id: 'update_profile',
      title: 'Update Profile',
      description: 'Keep your profile information current',
      icon: <Star className="h-4 w-4" />,
      reward: 300,
      completed: false,
      category: 'daily'
    },
    {
      id: 'community_engagement',
      title: 'Community Engagement',
      description: 'Like, comment, or share community posts',
      icon: <TrendingUp className="h-4 w-4" />,
      reward: 150,
      completed: true,
      category: 'daily'
    }
  ], [userStats.currentStreak]);

  const growthTasks: Task[] = useMemo(() => [
    {
      id: 'make_connections',
      title: 'Make Connections',
      description: 'Connect with professionals in your field',
      icon: <Trophy className="h-4 w-4" />,
      reward: 200,
      completed: false,
      category: 'growth'
    },
    {
      id: 'add_skills',
      title: 'Add Skills',
      description: 'Complete courses and add skills to your profile',
      icon: <Medal className="h-4 w-4" />,
      reward: 250,
      completed: true,
      category: 'growth'
    },
    {
      id: 'complete_courses',
      title: 'Complete Courses',
      description: 'Finish learning modules and certifications',
      icon: <Award className="h-4 w-4" />,
      reward: 500,
      completed: false,
      category: 'growth'
    },
    {
      id: 'give_recommendations',
      title: 'Give Recommendations',
      description: 'Write recommendations for your connections',
      icon: <Crown className="h-4 w-4" />,
      reward: 300,
      completed: false,
      category: 'growth'
    }
  ], []);

  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'first_application',
      title: 'First Steps',
      description: 'Submit your first job application',
      icon: <Target className="h-4 w-4" />,
      requirement: 1,
      current: 1,
      reward: 100,
      category: 'milestone',
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Maintain a 30-day login streak',
      icon: <Flame className="h-4 w-4" />,
      requirement: 30,
      current: userStats.currentStreak,
      reward: 1000,
      category: 'daily',
      unlocked: false,
      rarity: 'epic'
    },
    {
      id: 'networking_pro',
      title: 'Networking Pro',
      description: 'Connect with 100 professionals',
      icon: <Trophy className="h-4 w-4" />,
      requirement: 100,
      current: 67,
      reward: 750,
      category: 'growth',
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: 'course_champion',
      title: 'Course Champion',
      description: 'Complete 25 learning modules',
      icon: <Award className="h-4 w-4" />,
      requirement: 25,
      current: 18,
      reward: 2000,
      category: 'growth',
      unlocked: false,
      rarity: 'legendary'
    }
  ], [userStats.currentStreak]);

  const completeTask = async (taskId: string) => {
    const task = [...dailyTasks, ...growthTasks].find(t => t.id === taskId);
    if (!task || task.completed) return;

    // Update task completion with animation
    setUserStats(prev => ({
      ...prev,
      todayTXC: prev.todayTXC + task.reward,
      totalTXC: prev.totalTXC + task.reward,
      tasksCompleted: prev.tasksCompleted + 1
    }));

    // Show celebration toast
    toast({
      title: "Task Complete! 🎉",
      description: `You earned ${task.reward} TXC tokens!`,
      className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none"
    });
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-slate-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Newcomer';
    if (level < 10) return 'Explorer';
    if (level < 20) return 'Professional';
    if (level < 30) return 'Expert';
    return 'Master';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gamification Center
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock your potential through achievements, build impressive streaks, and earn valuable TXC tokens in our engaging career advancement ecosystem.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg"
              onClick={() => setActiveTab('tasks')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Earning TXC
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('achievements')}>
              <Gift className="h-4 w-4 mr-2" />
              View Tips
            </Button>
          </div>
        </motion.div>

        {/* User Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold text-primary">{userStats.level}</p>
                  <p className="text-xs text-muted-foreground">{getLevelTitle(userStats.level)}</p>
                </div>
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <Progress value={userStats.nextLevelProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{userStats.nextLevelProgress}% to next level</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's TXC</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.todayTXC.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">+{((userStats.todayTXC / userStats.potentialTXC) * 100).toFixed(0)}% of potential</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{userStats.currentStreak} days</p>
                  <p className="text-xs text-muted-foreground">Best: {userStats.longestStreak} days</p>
                </div>
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total TXC</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.totalTXC.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{userStats.achievements} achievements</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="flex bg-muted p-1 rounded-lg">
            {[
              { id: 'overview', label: 'How It Works', icon: Target },
              { id: 'tasks', label: 'Daily Progress', icon: Calendar },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'leaderboard', label: 'Leaderboard', icon: Crown }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(id as any)}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  activeTab === id && "bg-background shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Complete Activities</h3>
                <p className="text-muted-foreground">Apply to jobs, complete your profile, make connections, and engage with the platform to unlock rewards.</p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Achievements</h3>
                <p className="text-muted-foreground">Unlock badges and achievements for reaching milestones and completing challenges.</p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Streaks</h3>
                <p className="text-muted-foreground">Maintain daily login and application streaks to maximize your TXC earnings.</p>
              </Card>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Daily Habits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Daily Habits
                    <Badge variant="secondary">{dailyTasks.reduce((sum, task) => sum + task.reward, 0)} TXC potential</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          task.completed ? "bg-green-500/10 text-green-600" : "bg-muted"
                        )}>
                          {task.icon}
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          {task.streak && (
                            <p className="text-xs text-orange-600 font-medium">🔥 {task.streak} day streak</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{task.reward} TXC</p>
                        {task.completed ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            Completed!
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => completeTask(task.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Complete Task
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Growth Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Growth Activities
                    <Badge variant="secondary">{growthTasks.reduce((sum, task) => sum + task.reward, 0)} TXC potential</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {growthTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          task.completed ? "bg-green-500/10 text-green-600" : "bg-muted"
                        )}>
                          {task.icon}
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-secondary">{task.reward} TXC</p>
                        {task.completed ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            Completed!
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => completeTask(task.id)}
                            className="bg-secondary hover:bg-secondary/90"
                          >
                            Complete Task
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  achievement.unlocked ? "bg-green-500/5 border-green-500/20" : "bg-card"
                )}>
                  <div className={cn(
                    "absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45",
                    getRarityColor(achievement.rarity)
                  )} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        achievement.unlocked ? "bg-green-500/10 text-green-600" : "bg-muted"
                      )}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <Badge variant="outline" className={cn("text-xs", getRarityColor(achievement.rarity), "text-white border-none")}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <div className="space-y-2">
                          <Progress 
                            value={(achievement.current / achievement.requirement) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {achievement.current}/{achievement.requirement}
                            </span>
                            <span className="font-bold text-primary">
                              {achievement.reward} TXC
                            </span>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-500/20">
                            ✓ Unlocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    TXC Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Coming Soon!</p>
                    <p className="text-muted-foreground">
                      Compete with other professionals and see how you rank in the TXC ecosystem.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}