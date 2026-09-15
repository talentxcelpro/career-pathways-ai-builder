import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useReferralData } from '@/hooks/useReferralData';
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  MessageCircle,
  Linkedin,
  Twitter,
  Send,
  TrendingUp,
  Clock,
  CheckCircle,
  Trophy,
  Flame,
  Award
} from 'lucide-react';

export const RealTimeReferralDashboard: React.FC = () => {
  const { 
    referralData, 
    loading: referralLoading,
    copyReferralLink,
    shareOnPlatform,
    getTierProgress,
    getReferralLink
  } = useReferralSystem();

  const {
    stats,
    activities,
    achievements,
    loading: dataLoading
  } = useReferralData();

  const loading = referralLoading || dataLoading;

  if (loading || !referralData) {
    return (
      <div className="w-full space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tierProgress = getTierProgress();
  const referralLink = getReferralLink();

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Mobile Header */}
      <div className="text-center block md:hidden">
        <h2 className="text-lg font-bold text-foreground mb-1">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Track your progress</p>
      </div>

      {/* Desktop Header */}
      <div className="text-center hidden md:block">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your Referral Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and share your success</p>
      </div>

      {/* Mobile Stats Cards - Horizontal Scroll */}
      <div className="block md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4">
          <Card className="min-w-[120px] flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Referrals</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Total clicks</p>
            </CardContent>
          </Card>

          <Card className="min-w-[120px] flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Success</CardTitle>
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-green-600">{stats.successfulReferrals}</div>
              <p className="text-xs text-muted-foreground">Joined</p>
            </CardContent>
          </Card>

          <Card className="min-w-[120px] flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Rate</CardTitle>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-primary">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success</p>
            </CardContent>
          </Card>

          <Card className="min-w-[120px] flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Rewards</CardTitle>
              <Gift className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-yellow-600">{stats.totalRewards}</div>
              <p className="text-xs text-muted-foreground">TXC</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Stats Cards - Grid */}
      <div className="hidden md:grid md:grid-cols-4 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">People clicked your link</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulReferrals}</div>
            <p className="text-xs text-muted-foreground">Friends who joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalRewards}</div>
            <p className="text-xs text-muted-foreground">TXC earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Compact Progress Section */}
      <Card className="bg-white/50 backdrop-blur border-primary/10">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Progress to Next Reward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress ({tierProgress.current} / {tierProgress.next})</span>
              <span>{Math.round(tierProgress.progress)}%</span>
            </div>
            <Progress value={tierProgress.progress} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            You need <strong>{tierProgress.remaining} more successful referrals</strong> to unlock your next reward!
          </p>
        </CardContent>
      </Card>

      {/* Compact Referral Link Section */}
      <Card className="bg-white/50 backdrop-blur border-primary/10">
        <CardHeader className="pb-2 p-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Share2 className="h-4 w-4" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-xs"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyReferralLink()}
              className="flex-shrink-0 h-7 px-2"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>

          {/* Mobile Social Sharing - 2x2 Grid */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs">Share on Social</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnPlatform('whatsapp')}
                className="justify-start h-8 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1 text-green-600" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnPlatform('linkedin')}
                className="justify-start h-8 text-xs"
              >
                <Linkedin className="h-3 w-3 mr-1 text-blue-600" />
                LinkedIn
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnPlatform('twitter')}
                className="justify-start h-8 text-xs"
              >
                <Twitter className="h-3 w-3 mr-1 text-blue-400" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigator.share?.({ title: 'Join TalentXcel', url: referralLink })}
                className="justify-start h-8 text-xs"
              >
                <Send className="h-3 w-3 mr-1 text-blue-500" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Achievements - Mobile Simplified */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent Activities - Mobile */}
        <Card className="bg-white/50 backdrop-blur border-primary/10">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.reward && (
                    <Badge variant="default" className="text-xs h-5">
                      +{activity.reward} TXC
                    </Badge>
                  )}
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  No activity yet. Start sharing your link!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements - Mobile */}
        <Card className="bg-white/50 backdrop-blur border-primary/10">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{achievement.title}</p>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Badge variant="default" className="text-xs h-4 px-1">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Streak - Mobile Compact */}
      {stats.currentStreak > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500 rounded-full">
                <Flame className="h-3 w-3 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-orange-700 text-sm">
                  🔥 {stats.currentStreak} Day Streak!
                </h3>
                <p className="text-xs text-orange-600">
                  You're on fire! Keep referring to maintain your streak.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};