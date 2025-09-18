import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, Star, Crown, Shield, Zap, Users, Briefcase, FileText } from 'lucide-react';
import { TXCPricingCard } from '@/components/txc/TXCPricingCard';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  TXC_PROFILE_UPGRADES, 
  TXC_JOB_POSTING, 
  TXC_SUBSCRIPTION_TIERS,
  TXC_TOOLS_PRICING,
  formatTXC 
} from '@/types/txc-pricing';

export default function TXCPricing() {
  const { availableBalance } = useTokenBalance();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile':
        return <Users className="h-5 w-5" />;
      case 'jobs':
        return <Briefcase className="h-5 w-5" />;
      case 'tools':
        return <Zap className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
      case 'verification':
        return <Shield className="h-5 w-5" />;
      default:
        return <Coins className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coins className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">TXC Pricing</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Use TalentXcel Coins (TXC) to unlock premium features, upgrade your profile, and access advanced tools
        </p>
        <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-medium">Your Balance: {formatTXC(availableBalance)}</span>
        </div>
      </div>

      {/* Subscription Tiers */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Monthly Subscriptions</h2>
          <p className="text-muted-foreground">Choose a plan that fits your career goals</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {TXC_SUBSCRIPTION_TIERS.map((tier) => (
            <TXCPricingCard key={tier.id} tier={tier} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Profile Upgrades */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Profile Upgrades</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {TXC_PROFILE_UPGRADES.map((upgrade) => (
            <TXCPricingCard key={upgrade.id} tier={upgrade} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Job Posting */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Job Posting</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {TXC_JOB_POSTING.map((posting) => (
            <TXCPricingCard key={posting.id} tier={posting} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Individual Tools */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Individual Features</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TXC_TOOLS_PRICING.map((tool) => (
            <Card key={tool.feature} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(tool.category)}
                    <CardTitle className="text-lg">
                      {tool.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-primary">
                    {formatTXC(tool.cost)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={availableBalance < tool.cost}
                >
                  {availableBalance >= tool.cost ? 'Purchase' : 'Insufficient TXC'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Get TXC */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">How to Earn TXC</h2>
          <p className="text-muted-foreground">Multiple ways to earn TalentXcel Coins</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="text-center">
              <FileText className="h-8 w-8 mx-auto text-green-500" />
              <CardTitle className="text-lg">Daily Login</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">50 TXC</div>
              <p className="text-sm text-muted-foreground">
                Log in daily to earn bonus tokens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-blue-500" />
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-2">500 TXC</div>
              <p className="text-sm text-muted-foreground">
                Complete your profile to 100%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Briefcase className="h-8 w-8 mx-auto text-purple-500" />
              <CardTitle className="text-lg">Job Applications</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-purple-500 mb-2">100 TXC</div>
              <p className="text-sm text-muted-foreground">
                Per successful job application
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Star className="h-8 w-8 mx-auto text-amber-500" />
              <CardTitle className="text-lg">Referrals</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-amber-500 mb-2">1000 TXC</div>
              <p className="text-sm text-muted-foreground">
                Per successful referral
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Purchase TXC */}
      <section className="text-center space-y-6">
        <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              Need More TXC?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Purchase TXC tokens to unlock all premium features immediately
            </p>
            <Button className="w-full" size="lg">
              Purchase TXC Tokens
            </Button>
            <p className="text-xs text-muted-foreground">
              Multiple payment options available
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}