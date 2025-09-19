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
    <div className="space-y-8">
      {/* Hero Stats Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl blur-sm"></div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 p-1">
          <Card className="group relative overflow-hidden hover-scale">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-primary mb-1">{completedReferrals.length}</p>
                  <p className="text-sm text-muted-foreground font-medium">Successful Referrals</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-2"></div>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                  <Users className="h-10 w-10 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover-scale">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/5"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-secondary mb-1">{formatTXC(totalTXCEarned)}</p>
                  <p className="text-sm text-muted-foreground font-medium">Total Earned</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-secondary to-accent rounded-full mt-2"></div>
                </div>
                <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl">
                  <Gift className="h-10 w-10 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover-scale">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-accent mb-1">{pendingReferrals.length}</p>
                  <p className="text-sm text-muted-foreground font-medium">Pending Referrals</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-accent to-primary rounded-full mt-2"></div>
                </div>
                <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl">
                  <TrendingUp className="h-10 w-10 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Code & Sharing */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Share Your Referral Code
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Your Referral Code</label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-sm"></div>
                <div className="relative flex gap-3">
                  <Input 
                    value={myReferralCode || 'Generating...'} 
                    readOnly 
                    className="font-mono text-lg font-bold bg-background/50 backdrop-blur-sm border-border/30"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => shareReferral('copy')}
                    disabled={!myReferralCode}
                    className="bg-background/50 backdrop-blur-sm border-border/30 hover:bg-primary/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Share on social media:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('whatsapp')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border-border/30 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('twitter')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border-border/30 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareReferral('linkedin')}
                  disabled={!myReferralCode}
                  className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border-border/30 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl"></div>
              <div className="relative p-6 bg-background/30 backdrop-blur-sm rounded-xl border border-border/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">How it works:</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Share your referral code with friends</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-secondary">2</span>
                    </div>
                    <span className="text-sm text-muted-foreground">They sign up using your code</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent">3</span>
                    </div>
                    <span className="text-sm text-muted-foreground">You both earn TXC tokens!</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">4</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Earn 1,000 TXC per successful referral</span>
                  </div>
                </div>
              </div>
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
        <Card className="lg:col-span-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Referral Rewards Tiers
              </span>
            </CardTitle>
            <p className="text-muted-foreground">Unlock higher rewards as you refer more friends</p>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl"></div>
                <div className="relative p-6 bg-background/30 backdrop-blur-sm rounded-xl border border-border/20 text-center hover-scale">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-4">
                    <span className="text-2xl font-bold text-primary">1-5</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">Referrals</div>
                  <Badge variant="outline" className="bg-background/50 mb-3">1,000 TXC each</Badge>
                  <p className="text-xs text-muted-foreground font-medium">Starter Bonus</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl"></div>
                <div className="relative p-6 bg-background/30 backdrop-blur-sm rounded-xl border-2 border-secondary/20 text-center hover-scale">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full mb-4">
                    <span className="text-2xl font-bold text-secondary">6-15</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">Referrals</div>
                  <Badge className="bg-secondary mb-3">1,500 TXC each</Badge>
                  <p className="text-xs text-muted-foreground font-medium">Super Referrer</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 rounded-xl"></div>
                <div className="relative p-6 bg-background/30 backdrop-blur-sm rounded-xl border-2 border-accent/20 text-center hover-scale">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/20 via-primary/15 to-secondary/20 rounded-full mb-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">16+</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">Referrals</div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 mb-3">2,000 TXC each</Badge>
                  <p className="text-xs text-muted-foreground font-medium">Elite Ambassador</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralCenter;