import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { Share2, Copy, MessageCircle, Twitter, Linkedin, Users, Gift, TrendingUp } from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';

const ReferralCenter: React.FC = () => {
  const {
    referrals,
    myReferralCode,
    isLoading,
    generateReferralCode,
    shareReferral
  } = useReferralSystem();

  const completedReferrals = referrals.filter(r => r.status === 'completed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalTXCEarned = completedReferrals.reduce((sum, ref) => sum + ref.txc_reward, 0);

  const handleGenerateCode = async () => {
    if (!myReferralCode) {
      await generateReferralCode();
    }
  };

  React.useEffect(() => {
    handleGenerateCode();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{completedReferrals.length}</p>
                <p className="text-sm text-muted-foreground">Successful Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{formatTXC(totalTXCEarned)}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{pendingReferrals.length}</p>
                <p className="text-sm text-muted-foreground">Pending Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Code & Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex gap-2">
                <Input 
                  value={myReferralCode || 'Generating...'} 
                  readOnly 
                  className="font-mono text-lg"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => shareReferral('copy')}
                  disabled={!myReferralCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Share on social media:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('whatsapp')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('twitter')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('linkedin')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">How it works:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Share your referral code with friends</li>
                <li>• They sign up using your code</li>
                <li>• You both earn TXC tokens!</li>
                <li>• Earn 1,000 TXC per successful referral</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
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
                      <Badge 
                        variant={referral.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {referral.status}
                      </Badge>
                      {referral.status === 'completed' && (
                        <Badge variant="outline">+{referral.txc_reward} TXC</Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {referrals.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    And {referrals.length - 5} more...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start sharing your referral code to see your referrals here!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Tiers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Referral Rewards Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">1-5</div>
                <div className="text-sm text-muted-foreground mb-2">Referrals</div>
                <Badge variant="outline">1,000 TXC each</Badge>
                <p className="text-xs text-muted-foreground mt-2">Starter Bonus</p>
              </div>
              
              <div className="p-4 border rounded-lg text-center bg-primary/5">
                <div className="text-2xl font-bold text-primary">6-15</div>
                <div className="text-sm text-muted-foreground mb-2">Referrals</div>
                <Badge>1,500 TXC each</Badge>
                <p className="text-xs text-muted-foreground mt-2">Super Referrer</p>
              </div>
              
              <div className="p-4 border rounded-lg text-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="text-2xl font-bold text-primary">16+</div>
                <div className="text-sm text-muted-foreground mb-2">Referrals</div>
                <Badge variant="secondary">2,000 TXC each</Badge>
                <p className="text-xs text-muted-foreground mt-2">Elite Ambassador</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralCenter;