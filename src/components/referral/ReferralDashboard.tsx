import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { SocialShare } from '@/components/shared/SocialShare';
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
  ExternalLink
} from 'lucide-react';

export const ReferralDashboard: React.FC = () => {
  const { 
    referralData, 
    referralEvents, 
    referralRewards,
    loading,
    generateReferralLink,
    copyReferralLink,
    shareOnPlatform,
    getTierProgress,
    getReferralLink
  } = useReferralSystem();

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralData.total_referrals}</div>
            <p className="text-xs text-muted-foreground">People clicked your link</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{referralData.successful_referrals}</div>
            <p className="text-xs text-muted-foreground">Friends who joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Tier {referralData.current_tier}</div>
            <p className="text-xs text-muted-foreground">Reward level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Reward</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tierProgress.remaining}</div>
            <p className="text-xs text-muted-foreground">More referrals needed</p>
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
                onClick={() => shareOnPlatform('whatsapp')}
                className="justify-start"
              >
                <Send className="h-4 w-4 mr-2 text-blue-500" />
                Telegram
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {event.referee_name || event.referee_email || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={event.status === 'registered' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {event.status}
                  </Badge>
                </div>
              ))}
              {referralEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No referrals yet. Start sharing your link!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rewards History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Rewards History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralRewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{reward.reward_description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reward.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={reward.status === 'granted' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {reward.status}
                  </Badge>
                </div>
              ))}
              {referralRewards.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No rewards yet. Keep referring to earn rewards!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};