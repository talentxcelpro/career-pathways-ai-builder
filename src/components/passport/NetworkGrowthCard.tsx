import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { 
  Users, 
  TrendingUp, 
  Gift, 
  ChevronDown, 
  ChevronUp,
  Share2,
  Trophy,
  Star,
  Sparkles,
  Crown,
  Rocket,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const NetworkGrowthCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { referralData, loading, copyReferralLink } = useReferralSystem();

  if (loading || !referralData) return null;

  const rewardTiers = [
    { friends: 5, reward: 'Early Access', icon: Star, color: 'text-blue-500' },
    { friends: 25, reward: '1-Month Pro', icon: Trophy, color: 'text-green-500' },
    { friends: 100, reward: '2-Month Pro', icon: Sparkles, color: 'text-purple-500' },
    { friends: 300, reward: '3-Month Pro', icon: Crown, color: 'text-orange-500' },
    { friends: 400, reward: '4-Month Pro+', icon: Rocket, color: 'text-red-500' }
  ];

  const currentTier = rewardTiers.findIndex(tier => 
    referralData.successful_referrals < tier.friends
  );
  const nextTier = currentTier >= 0 ? rewardTiers[currentTier] : null;
  const progress = nextTier 
    ? (referralData.successful_referrals / nextTier.friends) * 100 
    : 100;

  return (
    <Card className="backdrop-blur-xl bg-background/60 border-border/50 overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-2.5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Network Growth</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {referralData.successful_referrals} referrals • Tier {referralData.current_tier || 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {referralData.successful_referrals}
              </div>
              <div className="text-xs text-muted-foreground">Referrals</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                Tier {referralData.current_tier || 1}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">
                {nextTier ? nextTier.friends - referralData.successful_referrals : 0}
              </div>
              <div className="text-xs text-muted-foreground">To Next</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextTier.reward}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Reward Tiers - Compact */}
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Reward Milestones
            </div>
            <div className="space-y-1.5">
              {rewardTiers.map((tier, index) => {
                const Icon = tier.icon;
                const isUnlocked = referralData.successful_referrals >= tier.friends;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isUnlocked ? 'bg-primary/10' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${tier.color}`} />
                      <span className="text-sm font-medium">{tier.friends} referrals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{tier.reward}</span>
                      {isUnlocked && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => {
                copyReferralLink();
                toast.success('Referral link copied!');
              }}
              className="flex-1"
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button 
              variant="outline"
              size="sm"
              asChild
            >
              <Link to="/refer-and-earn">
                <ExternalLink className="h-4 w-4 mr-2" />
                Full Details
              </Link>
            </Button>
          </div>

          {/* Referral Link Display */}
          {referralData.referral_code && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                  talentxcel.in/r/{referralData.referral_code}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    copyReferralLink();
                    toast.success('Copied!');
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
