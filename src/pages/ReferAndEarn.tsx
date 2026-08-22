import React from 'react';
import { Link } from 'react-router-dom';
import { useEnhancedSEO } from '@/hooks/useEnhancedSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { RealTimeReferralDashboard } from '@/components/referral/RealTimeReferralDashboard';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
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
  Share2,
  Coins,
  Heart,
  DollarSign
} from 'lucide-react';
import { TalentXcelNotificationLogo } from '@/assets/talentxcel-notification-logo';

const ReferAndEarn: React.FC = () => {
  const { referralData, loading, generateReferralLink, copyReferralLink, shareOnPlatform } = useReferralSystem();
  const { triggerHaptic } = useHapticFeedback();

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

  const quickFeatures = [
    'AI-Powered Career Tools',
    'Priority Support', 
    'Advanced Analytics',
    'Early Access to New Features'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle native-app-style ios-scroll">
      {/* Mobile-Optimized Hero Section */}
      <section className="pt-6 pb-4 px-4 safe-area-top">
        <div className="max-w-4xl mx-auto text-center">
          {/* Compact Header */}
          <div className="mb-6">
            <div className="flex justify-center mb-3">
              <div className="relative bg-slate-900 rounded-lg p-1.5 border border-slate-700 shadow-sm">
                <img 
                  src="/talentxcel-official-logo.png" 
                  alt="TalentXcel" 
                  className="h-6 w-6 object-contain"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Referral Program
              </p>
              <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2">
                Refer & Earn Benefits
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Invite colleagues and unlock premium career tools, priority support, and AI features.
              </p>
            </div>
            
            {/* Compact TXC Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-3 py-1.5 border border-blue-200">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Coins className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-700">TXC Rewards</span>
            </div>
          </div>
          
          {/* Compact Stats Overview */}
          {referralData && (
            <div className="max-w-sm mx-auto mb-6">
              <Card className="native-card">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{referralData.successful_referrals}</div>
                      <div className="text-xs text-muted-foreground font-medium">Referrals</div>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <div className="text-lg font-bold text-blue-600">Tier {referralData.current_tier || 1}</div>
                      <div className="text-xs text-muted-foreground font-medium">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">Active</div>
                      <div className="text-xs text-muted-foreground font-medium">Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compact CTA Buttons */}
          <div className="flex flex-col gap-2 justify-center items-center">
            <Button 
              size="sm" 
              onClick={() => {
                triggerHaptic('success');
                if (referralData?.referral_code) {
                  copyReferralLink();
                } else {
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-medium w-full max-w-xs touch-feedback"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {referralData?.referral_code ? 'Copy Referral Link' : 'Start Referring'}
            </Button>
            
            <div className="flex gap-2 w-full max-w-xs">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  triggerHaptic('light');
                  document.getElementById('rewards')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-xs font-medium flex-1 touch-feedback"
              >
                <Trophy className="w-3 h-3 mr-1" />
                Rewards
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 text-xs font-medium flex-1 touch-feedback"
                asChild
              >
                <Link to="/pro/subscription">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Reward Tiers Section */}
      <section id="rewards" className="py-8 px-4 gradient-hero">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-primary mr-2" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Reward Tiers
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Every friend you refer unlocks premium features and AI-powered career tools.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 md:grid md:grid-cols-5 md:gap-3 pb-4 md:pb-0">
              {rewardTiers.map((tier, index) => {
                const Icon = tier.icon;
                const isUnlocked = referralData && referralData.successful_referrals >= tier.friends;
                
                return (
                  <Card key={index} className={`min-w-[140px] md:min-w-0 relative transition-smooth hover:scale-105 touch-feedback ${
                    isUnlocked 
                      ? 'gradient-card shadow-glow ring-2 ring-primary/50' 
                      : 'bg-card/50 opacity-75 hover:opacity-90'
                  }`}>
                    <CardHeader className="text-center pb-1 p-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-2 shadow-elegant`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-primary mb-1">{tier.friends}</div>
                      <div className="text-xs text-muted-foreground font-medium">Friends</div>
                    </CardHeader>
                    <CardContent className="text-center pt-0 p-3">
                      <div className="font-semibold text-foreground mb-2 text-xs leading-tight">{tier.reward}</div>
                      {isUnlocked ? (
                        <Badge className="bg-brand-green text-white border-0 shadow-sm text-xs">
                          <CheckCircle className="w-2 h-2 mr-1" />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                          <Target className="w-2 h-2 mr-1" />
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
      </section>

      {/* Quick Features Section */}
      <section className="py-6 px-4 bg-card/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-bold text-foreground mb-4">
            What You'll Unlock
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {quickFeatures.map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Dashboard */}
      {referralData && (
        <section id="dashboard" className="py-8 px-4 gradient-hero">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Your Dashboard</h2>
              <p className="text-sm text-muted-foreground">Track progress and share your link</p>
            </div>
            <RealTimeReferralDashboard />
          </div>
        </section>
      )}

      {/* Compact CTA Section */}
      <section className="py-8 px-4 safe-area-bottom">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="gradient-primary shadow-glow border-0 text-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-center mb-3">
                <div className="p-2 bg-white/20 rounded-full mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Ready to Start Earning?
                </h2>
              </div>
              <p className="text-sm md:text-base text-white/90 mb-6 leading-relaxed max-w-xl mx-auto">
                Join thousands earning Pro access by sharing TalentXcel. Get your referral link in 30 seconds.
              </p>
              <div className="flex flex-col gap-3 justify-center items-center">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-white/90 font-semibold text-sm px-6 py-3 w-full max-w-xs touch-feedback"
                  onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Start Referring Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="flex gap-2 w-full max-w-xs">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white border-white/30 hover:bg-white/10 text-xs px-4 py-2 flex-1 touch-feedback"
                    onClick={() => document.getElementById('rewards')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View Rewards
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-white border-white/30 hover:bg-white/10 text-xs px-4 py-2 flex-1 touch-feedback"
                    asChild
                  >
                    <Link to="/pro/subscription">
                      <Crown className="w-3 h-3 mr-1" />
                      Go Pro
                    </Link>
                  </Button>
                </div>
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