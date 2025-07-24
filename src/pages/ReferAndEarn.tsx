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
  Rocket
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Refer Friends & Unlock <span className="text-primary">Pro Access</span> to TalentXcel AI Career Tools
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground mb-8">
            Invite Your Network. Earn Premium Rewards. Grow With TalentXcel.
          </h2>
          
          {referralData && (
            <div className="mb-8">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                {referralData.successful_referrals} Friends Referred
              </Badge>
            </div>
          )}

          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <Link to="#dashboard">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Reward Tiers Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Referral Reward System
            </h2>
            <p className="text-lg text-muted-foreground">
              Clear Call-to-Actions for Every Milestone
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {rewardTiers.map((tier, index) => {
                  const Icon = tier.icon;
                  const isUnlocked = referralData && referralData.successful_referrals >= tier.friends;
                  
                  return (
                    <Card key={index} className={`relative transition-all duration-300 ${isUnlocked ? 'ring-2 ring-primary shadow-lg' : 'opacity-75'}`}>
                      <CardHeader className="text-center pb-2">
                        <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-primary">{tier.friends}</div>
                        <div className="text-sm text-muted-foreground">Friends</div>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="font-semibold text-foreground mb-2">{tier.reward}</div>
                        {isUnlocked && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Unlocked
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
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <Zap className="w-8 h-8 inline-block mr-2 text-primary" />
              TalentXcel Pro Includes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-card border">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Dashboard */}
      {referralData && (
        <section id="dashboard" className="py-16 px-4 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <ReferralDashboard />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              <Sparkles className="w-8 h-8 inline-block mr-2 text-primary" />
              Start Referring & Earn Your TalentXcel Pro Badge
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              TalentXcel AI empowers professionals like you with advanced job tools, personalized resume builders, 
              and deep analytics. Refer your friends today and unlock early access to AI-powered features, 
              lead generation tools, and priority support. The more you grow your network, the more you grow your career — it's that simple.
            </p>
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="#dashboard">Start Referring Now</Link>
            </Button>
          </div>
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