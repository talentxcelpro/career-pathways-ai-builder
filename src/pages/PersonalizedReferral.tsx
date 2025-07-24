import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEnhancedSEO } from '@/hooks/useEnhancedSEO';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserCircle, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Star,
  Trophy,
  Crown,
  Rocket,
  Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReferrerData {
  full_name: string;
  title?: string;
  avatar_url?: string;
  referral_code: string;
}

const PersonalizedReferral: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  
  const [referrerData, setReferrerData] = useState<ReferrerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrerData = async () => {
      if (!username) return;
      
      try {
        // Track the referral event
        if (referralCode) {
          await supabase.rpc('track_referral_event', {
            p_referral_code: referralCode,
            p_source_platform: 'direct',
            p_ip_address: null,
            p_user_agent: navigator.userAgent
          });
        }

        // Get referrer data
        const { data, error } = await supabase
          .from('user_referrals')
          .select(`
            referral_code,
            referrer_id
          `)
          .eq('referral_slug', username)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching referrer data:', error);
          setError('Referrer not found');
          return;
        }

        if (data) {
          // Get profile data separately
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, title')
            .eq('id', data.referrer_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile data:', profileError);
            setError('Profile not found');
            return;
          }

          setReferrerData({
            full_name: profile?.full_name || 'TalentXcel User',
            title: profile?.title,
            avatar_url: undefined, // Avatar not available in current schema
            referral_code: data.referral_code
          });
        }
      } catch (err) {
        console.error('Error in fetchReferrerData:', err);
        setError('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrerData();
  }, [username, referralCode]);

  useEnhancedSEO({
    title: referrerData 
      ? `Join ${referrerData.full_name} on TalentXcel AI – Get Free Career Tools & Pro Access`
      : 'Join TalentXcel AI – AI-Powered Career Platform',
    description: referrerData
      ? `${referrerData.full_name} invited you to join TalentXcel AI. Get access to AI-powered career tools, resume builders, job matching, and exclusive Pro features. Join now and accelerate your career!`
      : 'Join TalentXcel AI and get access to AI-powered career tools, resume builders, and job matching features.',
    keywords: ['TalentXcel AI', 'career tools', 'resume builder', 'job search', 'AI career guidance', 'professional networking', 'referral invitation'],
    type: 'profile',
    structuredData: referrerData ? JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Person",
      "name": referrerData.full_name,
      "jobTitle": referrerData.title,
      "image": referrerData.avatar_url,
      "memberOf": {
        "@type": "Organization",
        "name": "TalentXcel AI"
      }
    }) : undefined,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Referral', url: `/refer/${username}` }
    ]
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !referrerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Referral Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This referral link may be invalid or expired.
            </p>
            <Button asChild>
              <Link to="/auth/signup">Join TalentXcel AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Referrer Profile */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {referrerData.avatar_url ? (
                <img 
                  src={referrerData.avatar_url} 
                  alt={referrerData.full_name}
                  className="w-16 h-16 rounded-full border-4 border-primary"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
              <span className="text-primary">{referrerData.full_name}</span> invited you to join
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              TalentXcel AI Career Platform
            </h2>
            {referrerData.title && (
              <Badge variant="secondary" className="text-base px-4 py-2">
                {referrerData.title}
              </Badge>
            )}
          </div>

          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of professionals accelerating their careers with AI-powered tools
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to={`/auth/signup${referralCode ? `?ref=${referralCode}` : ''}`}>
                Join TalentXcel AI
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
              <Link to="/auth/signin">Already have an account?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Why Join TalentXcel AI?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-background border">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Program Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Gift className="w-8 h-8 text-primary" />
              You Can Earn Rewards Too!
            </h2>
            <p className="text-lg text-muted-foreground">
              Start your own referral journey and unlock exclusive benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {rewardTiers.map((tier, index) => {
              const Icon = tier.icon;
              
              return (
                <Card key={index} className="text-center">
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-2">
                      <Icon className={`w-8 h-8 ${tier.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-primary">{tier.friends}</div>
                    <div className="text-sm text-muted-foreground">Friends</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium text-foreground">{tier.reward}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join {referrerData.full_name} and thousands of other professionals on TalentXcel AI. 
              Get started today and unlock your career potential!
            </p>
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to={`/auth/signup${referralCode ? `?ref=${referralCode}` : ''}`}>
                Join Now - It's Free!
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PersonalizedReferral;