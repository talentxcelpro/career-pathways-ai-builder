import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { TouchButton } from '@/components/mobile/TouchButton';
import { Share2, Copy, MessageCircle, Twitter, Linkedin, Users, Gift, TrendingUp, Trophy, Coins, Sparkles, ExternalLink } from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';
import { SocialShare } from '@/components/social/SocialShare';

export const ReferralDashboard: React.FC = () => {
  const {
    referrals,
    myReferralCode,
    isLoading,
    generateReferralCode,
    shareReferral,
    referralData,
    getReferralLink
  } = useReferralSystem();
  
  const { triggerHaptic } = useHapticFeedback();

  const completedReferrals = referrals.filter(r => r.status === 'completed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalTXCEarned = completedReferrals.reduce((sum, ref) => sum + (ref.txc_reward || 1000), 0);

  React.useEffect(() => {
    if (!myReferralCode) {
      generateReferralCode();
    }
  }, []);

  const referralLink = getReferralLink();

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden hover-scale animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary mb-1">{completedReferrals.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Successful</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden hover-scale animate-fade-in">
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <p className="text-3xl font-bold text-yellow-600">{formatTXC(totalTXCEarned)}</p>
                </div>
                <p className="text-sm text-muted-foreground font-medium">TXC Earned</p>
              </div>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden hover-scale animate-fade-in">
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-accent mb-1">{pendingReferrals.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Pending</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden hover-scale animate-fade-in">
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600 mb-1">{referralData?.current_tier || 1}</p>
                <p className="text-sm text-muted-foreground font-medium">Current Tier</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Code & Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-primary" />
              Share Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold">Your Referral Code</label>
              <div className="flex gap-3">
                <Input 
                  value={myReferralCode || 'Generating...'} 
                  readOnly 
                  className="font-mono text-lg font-bold"
                />
                <TouchButton 
                  variant="outline" 
                  size="md"
                  onClick={() => {
                    triggerHaptic('success');
                    shareReferral('copy');
                  }}
                  disabled={!myReferralCode}
                >
                  <Copy className="h-4 w-4" />
                </TouchButton>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Share on social media:</p>
              <div className="grid grid-cols-3 gap-3">
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('whatsapp')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('twitter')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </TouchButton>
                <TouchButton
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('linkedin')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </TouchButton>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="h-5 w-5 text-primary" />
                <h4 className="font-bold">How it works:</h4>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Share your referral code with friends</p>
                <p>2. They sign up using your code</p>
                <p>3. You both earn 1,000 TXC tokens!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.slice(0, 5).map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Code: {referral.referral_code}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                      {referral.status === 'completed' && (
                        <Badge variant="outline">+{referral.txc_reward || 1000} TXC</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet. Start sharing your code!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Social Share Component */}
      {referralLink && (
        <div className="text-center">
          <SocialShare 
            url={referralLink}
            title="Join TalentXcel and boost your career with AI!"
            description={`Use my referral code ${myReferralCode} and earn 1,000 TXC tokens!`}
            hashtags={['TalentXcel', 'CareerGrowth', 'AI']}
            showTitle={false}
          />
        </div>
      )}
    </div>
  );
};