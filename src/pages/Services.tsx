import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, Star, Crown, Shield, Zap, Users, Briefcase, FileText, Pickaxe, ArrowRight } from 'lucide-react';
import { TXCPricingCard } from '@/components/txc/TXCPricingCard';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCPurchase } from '@/hooks/useTXCPurchase';
import { 
  TXC_PROFILE_UPGRADES, 
  TXC_JOB_POSTING, 
  TXC_SUBSCRIPTION_TIERS,
  TXC_TOOLS_PRICING,
  formatTXC 
} from '@/types/txc-pricing';
import { useSEO } from '@/hooks/useSEO';

export default function Services() {
  // Set up SEO
  useSEO({
    title: 'TalentXcel Services - Powered by TXC Tokens | TalentXcel',
    description: 'Explore our comprehensive range of services powered by TalentXcel Coins (TXC). From profile upgrades to AI tools, all services use our token-based system - no traditional payments required.',
    keywords: [
      'TalentXcel services',
      'TXC tokens',
      'career services',
      'profile upgrades',
      'AI tools',
      'job posting',
      'token-based services'
    ],
    canonical: 'https://talentxcel.in/services'
  });

  const { availableBalance } = useTokenBalance();
  const { purchaseWithTXC, isLoading: isPurchasing } = useTXCPurchase();

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
          <Coins className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold">TalentXcel Services</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          All our services are powered by TalentXcel Coins (TXC). Mine tokens through activities and unlock premium features - no traditional payments required!
        </p>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-medium">Your TXC Balance: {formatTXC(availableBalance)}</span>
          </div>
          <div className="inline-block">
            <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Link to="/txc/mining" className="flex items-center gap-2">
                <Pickaxe className="h-4 w-4" />
                Start Mining TXC
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* TXC Subscription Tiers */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">TXC Monthly Subscriptions</h2>
          <p className="text-muted-foreground">Choose a plan that fits your career goals - all paid with TXC tokens</p>
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

      {/* Job Posting Services */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Job Posting Services</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {TXC_JOB_POSTING.map((posting) => (
            <TXCPricingCard key={posting.id} tier={posting} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Individual Tools & Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Tools & Individual Features</h2>
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
                  disabled={availableBalance < tool.cost || isPurchasing}
                  onClick={() => purchaseWithTXC({ 
                    featureId: tool.feature, 
                    cost: tool.cost, 
                    description: tool.description 
                  })}
                >
                  {isPurchasing ? 'Processing...' : availableBalance >= tool.cost ? 'Purchase with TXC' : 'Insufficient TXC'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Get TXC */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Pickaxe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">How to Get TXC Tokens</h2>
          </div>
          <p className="text-muted-foreground">Earn TalentXcel Coins through daily activities and engagement</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50/50">
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

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-blue-500" />
              <CardTitle className="text-lg">Profile Activities</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-2">100-500 TXC</div>
              <p className="text-sm text-muted-foreground">
                Complete profile, upload resume, add skills
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="text-center">
              <Briefcase className="h-8 w-8 mx-auto text-purple-500" />
              <CardTitle className="text-lg">Job Activities</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-purple-500 mb-2">100-300 TXC</div>
              <p className="text-sm text-muted-foreground">
                Apply to jobs, save favorites, get recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="text-center">
              <Star className="h-8 w-8 mx-auto text-amber-500" />
              <CardTitle className="text-lg">Social Activities</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-amber-500 mb-2">200-1000 TXC</div>
              <p className="text-sm text-muted-foreground">
                Post updates, connect with others, referrals
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Mining CTA */}
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Pickaxe className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-700">Start Mining Today!</h3>
            </div>
            <p className="text-green-600 mb-4">
              Join thousands of users earning TXC daily through platform engagement
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Link to="/txc/mining" className="flex items-center gap-2">
                <Pickaxe className="h-5 w-5" />
                Access Mining Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* No Traditional Payments */}
      <section className="text-center space-y-6">
        <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
              <Shield className="h-6 w-6" />
              100% TXC Token System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-600">
              All services use our TXC token system. No traditional payments, no credit cards - just earn and spend TXC tokens!
            </p>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">
                🎯 Complete daily activities to earn up to 1,000+ TXC per day
              </p>
            </div>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Link to="/txc/pricing" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                View All TXC Pricing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}