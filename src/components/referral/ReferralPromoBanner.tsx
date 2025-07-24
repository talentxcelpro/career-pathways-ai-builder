import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { 
  Gift, 
  Users, 
  TrendingUp, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ReferralPromoBannerProps {
  variant?: 'compact' | 'detailed';
  dismissible?: boolean;
  showProgress?: boolean;
}

export const ReferralPromoBanner: React.FC<ReferralPromoBannerProps> = ({
  variant = 'compact',
  dismissible = true,
  showProgress = true
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { referralData, getTierProgress, loading } = useReferralSystem();

  if (isDismissed || loading) return null;

  const tierProgress = getTierProgress();
  const isNewUser = !referralData || referralData.successful_referrals === 0;

  if (variant === 'compact') {
    return (
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  {isNewUser ? 'Start Earning Rewards!' : `${tierProgress.remaining} referrals to next reward`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isNewUser 
                    ? 'Invite friends and unlock Pro features for free'
                    : 'Keep sharing your referral link to unlock more benefits'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" asChild>
                <Link to="/refer-and-earn">
                  {isNewUser ? 'Get Started' : 'View Progress'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDismissed(true)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">
              {isNewUser ? 'Unlock Pro Features for Free!' : 'Your Referral Journey'}
            </CardTitle>
          </div>
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNewUser ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Invite friends to TalentXcel and unlock exclusive benefits like Pro upgrades, 
              advanced career tools, and AI-powered features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-lg">
                <Badge variant="secondary">5 Friends</Badge>
                <span className="text-sm">Early Access to Paid Tools</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-lg">
                <Badge variant="secondary">25 Friends</Badge>
                <span className="text-sm">1-Month Pro Upgrade</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-lg">
                <Badge variant="secondary">100+ Friends</Badge>
                <span className="text-sm">Multi-Month Pro Access</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{referralData?.successful_referrals} Friends Referred</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Tier {referralData?.current_tier}</span>
                </div>
              </div>
              <Badge variant="outline">
                {tierProgress.remaining} more for next reward
              </Badge>
            </div>
            
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress to next reward</span>
                  <span>{Math.round(tierProgress.progress)}%</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tierProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button asChild className="flex-1">
            <Link to="/refer-and-earn">
              <Gift className="w-4 h-4 mr-2" />
              {isNewUser ? 'Start Referring' : 'Manage Referrals'}
            </Link>
          </Button>
          {!isNewUser && (
            <Button variant="outline" asChild>
              <Link to="/refer-and-earn#share">Share Link</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};