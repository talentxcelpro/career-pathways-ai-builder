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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your Referral Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and share your success</p>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress to Next Reward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress ({tierProgress.current} / {tierProgress.next})</span>
              <span>{Math.round(tierProgress.progress)}%</span>
            </div>
            <Progress value={tierProgress.progress} className="h-3" />
          </div>
          <p className="text-sm text-muted-foreground">
            You need <strong>{tierProgress.remaining} more successful referrals</strong> to unlock your next reward!
          </p>
        </CardContent>
      </Card>

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyReferralLink()}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>

          {/* Social Sharing Buttons */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Share on Social Media</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnPlatform('whatsapp')}
                className="justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnPlatform('linkedin')}
                className="justify-start"
              >
                <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                LinkedIn
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnPlatform('twitter')}
                className="justify-start"
              >
                <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigator.share?.({ title: 'Join TalentXcel', url: referralLink })}
                className="justify-start"
              >
                <Send className="h-4 w-4 mr-2 text-blue-500" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.reward && (
                    <Badge variant="default" className="text-xs">
                      +{activity.reward} TXC
                    </Badge>
                  )}
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activity yet. Start sharing your link!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{achievement.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all"
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
                    <Badge variant="default" className="text-xs bg-green-500">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Streak */}
      {stats.currentStreak > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-orange-700">
                  🔥 {stats.currentStreak} Day Streak!
                </h3>
                <p className="text-sm text-orange-600">
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