import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TalentXcelNotificationLogo } from '@/assets/talentxcel-notification-logo';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { 
  Gift, 
  Users, 
  Star, 
  Sparkles, 
  ArrowRight,
  Crown,
  Zap
} from 'lucide-react';

interface ReferralNetworkAdProps {
  variant?: 'banner' | 'sidebar' | 'inline';
}

export const ReferralNetworkAd: React.FC<ReferralNetworkAdProps> = ({
  variant = 'banner'
}) => {
  const { referralData, loading, copyReferralLink } = useReferralSystem();

  if (loading) return null;

  const isNewUser = !referralData || referralData.successful_referrals === 0;
  const currentReferrals = referralData?.successful_referrals || 0;

  if (variant === 'sidebar') {
    return (
      <Card className="gradient-hero border-primary/20 shadow-elegant">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center p-1 shadow-sm">
                <img 
                  src="/talentxcel-official-logo.png" 
                  alt="TalentXcel" 
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground">Earn Pro Access</h3>
              <p className="text-sm text-muted-foreground">
                Refer friends, unlock premium features
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="secondary" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                <Users className="w-3 h-3 mr-1" />
                {currentReferrals} Referred
              </Badge>
            </div>
            <Button 
              size="sm" 
              className="w-full gradient-primary text-white hover:opacity-90"
              onClick={() => copyReferralLink()}
            >
              <Gift className="w-4 h-4 mr-2" />
              {referralData?.referral_code ? 'Copy Link' : 'Get Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <Card className="gradient-hero border-primary/20 shadow-elegant mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-1 bg-slate-900 rounded-lg border border-slate-700">
                <img 
                  src="/talentxcel-official-logo.png" 
                  alt="TalentXcel" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-foreground">
                  {isNewUser ? 'Unlock TalentXcel Pro for Free!' : `${currentReferrals} Friends Referred`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isNewUser 
                    ? 'Invite friends and get premium AI career tools' 
                    : 'Keep sharing to unlock more rewards'
                  }
                </p>
              </div>
            </div>
            <Button 
              className="gradient-primary text-white hover:opacity-90"
              onClick={() => copyReferralLink()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {referralData?.referral_code ? 'Copy Link' : 'Get Code'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner variant (default)
  return (
    <Card className="gradient-primary text-white shadow-glow border-0 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white mb-1">
                🎉 TalentXcel Refer & Earn Program
              </h2>
              <p className="text-white/90 text-sm">
                Share TalentXcel with friends and unlock Pro features, AI tools, and exclusive benefits
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            {!isNewUser && (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Users className="w-3 h-3 mr-1" />
                  {currentReferrals} Referred
                </Badge>
                <Badge variant="secondary" className="bg-brand-green/20 text-white border-brand-green/30">
                  <Star className="w-3 h-3 mr-1" />
                  Tier {referralData?.current_tier || 1}
                </Badge>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                asChild
              >
                <Link to="/refer-and-earn">
                  <Zap className="w-4 h-4 mr-2" />
                  {isNewUser ? 'Start Referring' : 'View Dashboard'}
                </Link>
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white border-white/30 hover:bg-white/10"
                asChild
              >
                <Link to="/refer-and-earn#rewards">
                  View Rewards
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};