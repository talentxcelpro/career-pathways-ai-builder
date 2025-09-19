import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { 
  Users, 
  Gift, 
  Star, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  UserPlus,
  Coins,
  Trophy,
  Crown,
  Rocket
} from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';
import careerMascot from '@/assets/career-mascot.jpg';

const PersonalizedReferral: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { useReferralCode } = useReferralSystem();
  const [referrerProfile, setReferrerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchReferrerData = async () => {
      if (!username) return;

      try {
        // First, try to find by username in profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profile) {
          setReferrerProfile(profile);
          
          // Get their referral code
          const { data: referral } = await supabase
            .from('referrals')
            .select('referral_code')
            .eq('referrer_id', profile.id)
            .eq('status', 'pending')
            .single();
            
          if (referral) {
            setReferralCode(referral.referral_code);
          }
        }
      } catch (error) {
        console.error('Error fetching referrer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrerData();
  }, [username]);

  const handleApplyReferral = async () => {
    if (!referralCode || !user) return;

    setIsLoading(true);
    const success = await useReferralCode(referralCode);
    if (success) {
      setHasApplied(true);
    }
    setIsLoading(false);
  };

  const rewardTiers = [
    { friends: 5, reward: 'Early Access to Paid Tools', icon: Star, color: 'text-blue-500' },
    { friends: 25, reward: '1-Month Pro Upgrade', icon: Trophy, color: 'text-green-500' },
    { friends: 100, reward: '2-Month Pro Membership', icon: Sparkles, color: 'text-purple-500' },
    { friends: 300, reward: '3-Month Pro Membership', icon: Crown, color: 'text-orange-500' },
    { friends: 400, reward: '4-Month Pro + Bonus AI Tools', icon: Rocket, color: 'text-red-500' }
  ];

  const benefits = [
    'AI-Powered Resume Builder & Optimization',
    'Smart Job Matching & Application Tracking',
    'Career Insights & Personalized Recommendations',
    'Professional Networking & Community Access',
    'Advanced Analytics & Progress Tracking',
    'Priority Support & Early Feature Access'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading referral...</p>
        </div>
      </div>
    );
  }

  if (!referrerProfile) {
    return <Navigate to="/refer-and-earn" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Join TalentXcel through ${referrerProfile.full_name || 'a friend'}'s referral`}</title>
        <meta name="description" content={`${referrerProfile.full_name || 'Your friend'} invited you to join TalentXcel! Sign up and both of you earn TXC tokens.`} />
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 32 32%22 width%3D%2232%22 height%3D%2232%22 fill%3D%22none%22 stroke%3D%22rgb(0 0 0 / 0.05)%22%3E%3Cpath d%3D%22m0 2 30 30M2 0 32 30%22%2F%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <img 
                src={careerMascot} 
                alt="TalentXcel Mascot" 
                className="relative w-32 h-32 mx-auto rounded-full object-cover border-4 border-background shadow-xl"
              />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-lg">
                <UserPlus className="h-6 w-6 text-primary" />
                <span className="text-muted-foreground">You've been invited by</span>
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {referrerProfile.full_name || username}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Join TalentXcel through this exclusive referral and both of you will earn TXC tokens! 
                Start your AI-powered career journey today.
              </p>

              {referrerProfile.about && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl"></div>
                  <div className="relative p-6 bg-background/30 backdrop-blur-sm rounded-xl border border-border/20 max-w-2xl mx-auto">
                    <p className="text-muted-foreground italic">"{referrerProfile.about}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Referral Benefits */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
            <CardHeader className="relative text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <Gift className="h-8 w-8 text-primary" />
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Referral Benefits
                </span>
              </CardTitle>
              <p className="text-muted-foreground">What you'll get by joining through this referral</p>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl w-fit mx-auto">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Welcome Bonus</h3>
                  <Badge className="text-lg px-4 py-2">{formatTXC(500)} TXC</Badge>
                  <p className="text-sm text-muted-foreground">Instant welcome bonus when you sign up</p>
                </div>

                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl w-fit mx-auto">
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg">Referrer Reward</h3>
                  <Badge variant="secondary" className="text-lg px-4 py-2">{formatTXC(1000)} TXC</Badge>
                  <p className="text-sm text-muted-foreground">Your referrer gets rewarded too!</p>
                </div>

                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl w-fit mx-auto">
                    <Sparkles className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg">AI Tools Access</h3>
                  <Badge variant="outline" className="text-lg px-4 py-2">Free</Badge>
                  <p className="text-sm text-muted-foreground">Access to premium AI career tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Section */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/10"></div>
            <CardContent className="relative p-8 text-center space-y-6">
              {!user ? (
                <>
                  <h3 className="text-2xl font-bold text-foreground">Ready to start your career journey?</h3>
                  <p className="text-muted-foreground">Create your account to claim your referral bonus</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      onClick={() => window.location.href = `/auth/register?ref=${referralCode}`}
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Sign Up & Claim Bonus
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => window.location.href = `/auth/login?ref=${referralCode}`}
                    >
                      Already have an account? Login
                    </Button>
                  </div>
                </>
              ) : hasApplied ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-foreground">Referral Applied Successfully! 🎉</h3>
                  <p className="text-muted-foreground">Both you and your referrer have been rewarded with TXC tokens.</p>
                  <Button onClick={() => window.location.href = '/dashboard'}>
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Apply Referral Code</h3>
                  <p className="text-muted-foreground">Click below to apply this referral and earn your bonus!</p>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    onClick={handleApplyReferral}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Gift className="mr-2 h-5 w-5" />
                        Apply Referral & Earn {formatTXC(500)} TXC
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Star className="h-6 w-6 text-primary" />
                How TalentXcel Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-semibold">Sign Up</h4>
                  <p className="text-sm text-muted-foreground">Create your account with the referral code</p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-secondary">2</span>
                  </div>
                  <h4 className="font-semibold">Build Profile</h4>
                  <p className="text-sm text-muted-foreground">Complete your career profile with AI assistance</p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-accent">3</span>
                  </div>
                  <h4 className="font-semibold">Earn Tokens</h4>
                  <p className="text-sm text-muted-foreground">Complete activities and earn TXC rewards</p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/15 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary">4</span>
                  </div>
                  <h4 className="font-semibold">Grow Career</h4>
                  <p className="text-sm text-muted-foreground">Land your dream job with AI-powered tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedReferral;