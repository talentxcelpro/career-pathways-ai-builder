import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAchievements } from '@/hooks/useAchievements';
import { useRealTimeActivities } from '@/hooks/useRealTimeActivities';
import { 
  Trophy, 
  Target, 
  Flame, 
  Crown, 
  Share2, 
  Award,
  TrendingUp,
  Users,
  Calendar,
  Gift
} from 'lucide-react';
import { AchievementTracker } from '@/components/achievements/AchievementTracker';
import { ProgressMilestones } from '@/components/achievements/ProgressMilestones';
import { GamificationElements } from '@/components/achievements/GamificationElements';

export default function DynamicAchievementSystem() {
  const [activeSection, setActiveSection] = useState('overview');
  const { achievements, totalPoints, level, loading } = useAchievements();
  const { activities } = useRealTimeActivities();

  const quickStats = {
    totalAchievements: 20, // Total possible achievements
    unlockedAchievements: achievements.length || 0,
    totalPoints: totalPoints || 0,
    currentLevel: level || 1,
    currentStreak: 15, // This would come from a streak tracking system
    weeklyRank: Math.max(1, 10 - Math.floor(totalPoints / 500)) // Calculate rank based on points
  };

  const recentActivities = [
    {
      id: '1',
      type: 'achievement',
      title: 'Skill Master',
      description: 'Earned 5 verified skill badges',
      points: 200,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: Award
    },
    {
      id: '2',
      type: 'milestone',
      title: 'Daily Practice Streak',
      description: 'Completed 15 consecutive days of skill practice',
      points: 150,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: Flame
    },
    {
      id: '3',
      type: 'level_up',
      title: 'Level Up!',
      description: 'Reached Level 12 - Senior Professional',
      points: 500,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: Crown
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const shareProgress = () => {
    const shareText = `I've unlocked ${quickStats.unlockedAchievements} achievements and earned ${quickStats.totalPoints} points on TalentXcel! 🏆 #CareerGrowth #TalentXcel`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My TalentXcel Achievements',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Achievement Center</h1>
            <p className="text-lg text-muted-foreground">
              Track your progress, unlock achievements, and climb the leaderboard
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={shareProgress} variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Progress
            </Button>
            <Button className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Claim Rewards
            </Button>
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.unlockedAchievements}</p>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Points</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.currentLevel}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">#{quickStats.weeklyRank}</p>
              <p className="text-sm text-muted-foreground">Weekly Rank</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="milestones" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Milestones</span>
                </TabsTrigger>
                <TabsTrigger value="gamification" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Gaming</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievement Progress Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{quickStats.unlockedAchievements}/{quickStats.totalAchievements} ({Math.round((quickStats.unlockedAchievements / quickStats.totalAchievements) * 100)}%)</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(quickStats.unlockedAchievements / quickStats.totalAchievements) * 100}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">3</p>
                            <p className="text-sm text-muted-foreground">Common</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">3</p>
                            <p className="text-sm text-muted-foreground">Rare</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">2</p>
                            <p className="text-sm text-muted-foreground">Epic</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">0</p>
                            <p className="text-sm text-muted-foreground">Legendary</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="achievements">
                <AchievementTracker />
              </TabsContent>

              <TabsContent value="milestones">
                <ProgressMilestones />
              </TabsContent>

              <TabsContent value="gamification">
                <GamificationElements />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            +{activity.points} pts
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  View All Challenges
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Join Leaderboard Competition
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Browse All Achievements
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Your Progress
                </Button>
              </CardContent>
            </Card>

            {/* Achievement Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800">💡 Pro Tip</p>
                    <p className="text-blue-700">Complete daily challenges to maintain your streak and earn bonus XP!</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800">🎯 Next Goal</p>
                    <p className="text-green-700">You're 2 connections away from the "Network Builder" achievement!</p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="font-medium text-amber-800">⭐ Rare Opportunity</p>
                    <p className="text-amber-700">Limited-time "Master Class" challenge expires in 3 days!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}