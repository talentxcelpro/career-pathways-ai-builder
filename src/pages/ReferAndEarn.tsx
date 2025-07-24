import React from 'react';
import { Link } from 'react-router-dom';
import { useEnhancedSEO } from '@/hooks/useEnhancedSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { ReferralDashboard } from '@/components/referral/ReferralDashboard';
import { SocialShare } from '@/components/shared/SocialShare';
import { 
  Gift, 
  Users, 
  Star, 
  Trophy, 
  Sparkles, 
  Target,
  CheckCircle,
  Zap,
  Crown,
  Rocket,
  ArrowRight,
  Share2
} from 'lucide-react';
import { TalentXcelNotificationLogo } from '@/assets/talentxcel-notification-logo';

const ReferAndEarn: React.FC = () => {
  const { referralData, loading } = useReferralSystem();

  useEnhancedSEO({
    title: 'Refer TalentXcel AI – Earn Free Pro Access, Tools & Priority Support',
    description: 'Invite friends to TalentXcel AI and unlock exclusive benefits like free Pro upgrades, advanced career tools, unlimited access, and AI-powered features. Share your referral link and earn big!',
    keywords: ['AI career tools', 'resume builder', 'job applications', 'freelancer services', 'career support', 'SEO resume', 'referral rewards', 'pro membership', 'professional growth platform', 'TalentXcel AI'],
    type: 'website',
    structuredData: JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "OfferCatalog",
      "name": "TalentXcel AI Referral Program",
      "description": "Refer friends and unlock exclusive benefits like free Pro upgrades, advanced career tools, and AI-powered features.",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "Early Access to Paid Tools",
          "description": "Get early access to premium AI career tools",
          "eligibleQuantity": { "@type": "QuantitativeValue", "value": 5 }
        },
        {
          "@type": "Offer", 
          "name": "1-Month Pro Upgrade",
          "description": "Full Pro membership for 1 month",
          "eligibleQuantity": { "@type": "QuantitativeValue", "value": 25 }
        },
        {
          "@type": "Offer",
          "name": "2-Month Pro Membership", 
          "description": "Extended Pro access for 2 months",
          "eligibleQuantity": { "@type": "QuantitativeValue", "value": 100 }
        },
        {
          "@type": "Offer",
          "name": "3-Month Pro Membership",
          "description": "Premium access for 3 months",
          "eligibleQuantity": { "@type": "QuantitativeValue", "value": 300 }
        },
        {
          "@type": "Offer",
          "name": "4-Month Pro + Bonus AI Tools",
          "description": "Maximum tier with 4 months Pro plus exclusive AI tools",
          "eligibleQuantity": { "@type": "QuantitativeValue", "value": 400 }
        }
      ]
    }),
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Refer & Earn', url: '/refer-and-earn' }
    ]
  });

  const rewardTiers = [
    { friends: 5, reward: 'Early Access to Paid Tools', icon: Star, color: 'bg-blue-500' },
    { friends: 25, reward: '1-Month Pro Upgrade', icon: Trophy, color: 'bg-green-500' },
    { friends: 100, reward: '2-Month Pro Membership', icon: Sparkles, color: 'bg-purple-500' },
    { friends: 300, reward: '3-Month Pro Membership', icon: Crown, color: 'bg-orange-500' },
    { friends: 400, reward: '4-Month Pro + Bonus AI Tools', icon: Rocket, color: 'bg-red-500' }
  ];

  const proFeatures = [
    'Enhanced AI-Powered Career Profile',
    'Unlimited Resume, Cover Letter & Job Applications', 
    'Advanced Analytics & Career Insights',
    'Priority Support & Early Access to New Tools',
    'Up to 100 Career Services in One Place',
    'TalentXcel AI Toolbox (Resume Scorer, Career Mapper, Smart Apply)',
    'Lead Generation Tools (for Freelancers & Coaches)'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo and Title */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-2 gradient-primary rounded-xl shadow-elegant">
                <TalentXcelNotificationLogo className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Refer Friends & Unlock <span className="bg-gradient-to-r from-primary to-brand-green bg-clip-text text-transparent">Pro Access</span>
            </h1>
            <h2 className="text-sm md:text-base text-muted-foreground mb-4">
              Share TalentXcel with your network and unlock premium AI career tools
            </h2>
          </div>
          
          {/* Stats Card */}
          {referralData && (
            <div className="max-w-md mx-auto mb-8">
              <Card className="gradient-card shadow-elegant border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{referralData.successful_referrals}</div>
                      <div className="text-sm text-muted-foreground">Friends Referred</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-green">Tier {referralData.current_tier || 1}</div>
                      <div className="text-sm text-muted-foreground">Current Level</div>
                    </div>
                    <div className="w-px h-12 bg-border"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange">Pro</div>
                      <div className="text-sm text-muted-foreground">Benefits</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button size="default" className="gradient-primary text-white hover:opacity-90 px-6 py-2 shadow-elegant" asChild>
              <a href="#dashboard">
                <Zap className="w-4 h-4 mr-2" />
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button size="default" variant="outline" className="px-6 py-2 border-primary/20 hover:bg-primary/5" asChild>
              <a href="#rewards">
                <Star className="w-4 h-4 mr-2" />
                View Rewards
              </a>
            </Button>
            <Button size="default" variant="secondary" className="px-6 py-2" asChild>
              <Link to="/pro/subscription">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reward Tiers Section */}
      <section id="rewards" className="py-16 px-4 gradient-hero">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Referral Reward Tiers
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every friend you refer gets you closer to unlocking premium features and exclusive AI-powered career tools.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {rewardTiers.map((tier, index) => {
                  const Icon = tier.icon;
                  const isUnlocked = referralData && referralData.successful_referrals >= tier.friends;
                  
                  return (
                    <Card key={index} className={`relative transition-smooth hover:scale-105 ${
                      isUnlocked 
                        ? 'gradient-card shadow-glow ring-2 ring-primary/50' 
                        : 'bg-card/50 opacity-75 hover:opacity-90'
                    }`}>
                      <CardHeader className="text-center pb-2">
                        <div className={`w-16 h-16 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-3 shadow-elegant`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-primary mb-1">{tier.friends}</div>
                        <div className="text-sm text-muted-foreground font-medium">Friends</div>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <div className="font-semibold text-foreground mb-3 text-sm leading-tight">{tier.reward}</div>
                        {isUnlocked ? (
                          <Badge className="bg-brand-green text-white border-0 shadow-sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            <Target className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                What You'll Unlock
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Premium AI-powered features to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proFeatures.map((feature, index) => (
              <Card key={index} className="gradient-card border-primary/10 hover:shadow-elegant transition-smooth">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-brand-green/10 rounded-full">
                      <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                    </div>
                    <span className="text-foreground font-medium text-sm leading-relaxed">{feature}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Dashboard */}
      {referralData && (
        <section id="dashboard" className="py-16 px-4 gradient-hero">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Referral Dashboard</h2>
              <p className="text-muted-foreground">Track your progress and share your referral link</p>
            </div>
            <ReferralDashboard />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="gradient-primary shadow-glow border-0 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full mr-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Ready to Start Earning?
                </h2>
              </div>
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
                Join thousands of professionals who are already earning Pro access by sharing TalentXcel. 
                It takes just 30 seconds to get your personalized referral link and start inviting your network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-4"
                  onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Start Referring Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4"
                  onClick={() => document.getElementById('rewards')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View All Rewards
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4"
                  asChild
                >
                  <Link to="/pro/subscription">
                    <Crown className="w-5 h-5 mr-2" />
                    Go Pro Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-8 px-4 text-center text-sm text-muted-foreground border-t">
        <div className="max-w-4xl mx-auto">
          <p>
            Keywords: AI career tools, resume builder, job applications, freelancer services, 
            career support, SEO resume, referral rewards, pro membership, professional growth platform, TalentXcel AI
          </p>
        </div>
      </section>
    </div>
  );
};

export default ReferAndEarn;