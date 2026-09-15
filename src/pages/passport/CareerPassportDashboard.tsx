import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useProfile } from '@/hooks/useProfile';
import { useUserScores } from '@/hooks/useUserScores';
import { useUsernameRouting } from '@/hooks/useUsernameRouting';
import { EnhancedCareerPassport } from '@/components/passport/EnhancedCareerPassport';
import { CareerPassportCard } from '@/components/passport/CareerPassportCard';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnhancedQRGenerator from '@/components/passport/EnhancedQRGenerator';
import ProfessionalCard from '@/components/passport/ProfessionalCard';
import { NetworkGrowthCard } from '@/components/passport/NetworkGrowthCard';
import { 
  QrCode, Share2, Download, ExternalLink, Copy, CheckCircle, 
  AlertTriangle, Zap, TrendingUp, Users, Award, Briefcase, 
  Shield, ArrowRight, Trophy, Target, Sparkles, Layout,
  CreditCard, Globe, Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CareerPassportCommandCenter() {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { userId: resolvedUserId, isLoading: usernameLoading, error: usernameError } = useUsernameRouting();
  const targetUserId = userId || resolvedUserId || user?.id;
  
  const { careerPassport, achievements, isLoading, trackJourneyEvent } = useCareerPassport();
  const navigate = useNavigate();
  const [publicPassportData, setPublicPassportData] = useState<any>(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [activeView, setActiveView] = useState<'card' | 'detailed'>('card');

  useEffect(() => {
    const initializeView = async () => {
      if (username && usernameError) {
        navigate('/404');
        return;
      }
      
      if (targetUserId && targetUserId !== user?.id) {
        setIsPublicView(true);
        await loadPublicPassportData(targetUserId);
      } else if (user?.id) {
        setIsPublicView(false);
      }
    };

    const loadPublicPassportData = async (targetUserId: string) => {
      setPublicLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, headline, location, profile_picture_url, talentxcel_id')
          .eq('id', targetUserId)
          .single();

        const { data: passportData } = await supabase
          .from('career_passport')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        const { data: achievementsData } = await supabase
          .from('career_achievements')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('is_public', true)
          .limit(5);

        setPublicPassportData({
          profile: profileData,
          passport: passportData,
          achievements: achievementsData || []
        });
      } catch (error) {
        console.error('Error loading public passport:', error);
      } finally {
        setPublicLoading(false);
      }
    };

    initializeView();
  }, [targetUserId, user?.id, username, usernameError, navigate]);

  const displayData = {
    profile: isPublicView ? publicPassportData?.profile : { 
      full_name: user?.user_metadata?.full_name || profile?.full_name,
      headline: profile?.headline,
      location: profile?.location,
      profile_picture_url: user?.user_metadata?.avatar_url || profile?.profile_picture_url,
      talentxcel_id: profile?.talentxcel_id
    },
    passport: isPublicView ? publicPassportData?.passport : careerPassport,
    achievements: isPublicView ? publicPassportData?.achievements : achievements,
    isOwner: !isPublicView
  };

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge">
      <Helmet>
        <title>{displayData.profile?.full_name ? `${displayData.profile.full_name} | TalentXcel Passport` : 'TalentXcel Passport'}</title>
      </Helmet>

      {/* Premium Header */}
      <div className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-slate-950 text-white border-0 rounded-lg px-3 py-1 font-apple-bold text-[10px] tracking-widest uppercase">TALENT IDENTITY</Badge>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verified Profile
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-apple-heavy text-slate-950 tracking-tighter">
                Professional <span className="text-blue-600">Passport</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl font-apple-medium mt-4">
                Your high-fidelity professional identity. Verified profile data, 
                performance milestones, and secure networking credentials.
              </p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[24px] border border-slate-200/50 shadow-sm">
              <Button
                variant={activeView === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('card')}
                className={cn("rounded-2xl px-8 font-apple-bold", activeView === 'card' ? "bg-slate-950 shadow-lg" : "text-slate-500")}
              >
                <CreditCard className="w-4 h-4 mr-2" /> View Card
              </Button>
              <Button
                variant={activeView === 'detailed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('detailed')}
                className={cn("rounded-2xl px-8 font-apple-bold", activeView === 'detailed' ? "bg-slate-950 shadow-lg" : "text-slate-500")}
              >
                <Layout className="w-4 h-4 mr-2" /> View Matrix
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {(isLoading || publicLoading || usernameLoading) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-[40px]" />)}
            </div>
          ) : displayData.profile ? (
            <div className="space-y-12">
              {/* Top Row: Verification & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    {activeView === 'card' ? (
                      <motion.div 
                        key="card" 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="flex justify-center md:justify-start"
                      >
                        <CareerPassportCard 
                          userProfile={displayData.profile}
                          isOwner={displayData.isOwner}
                          publicPassport={isPublicView ? publicPassportData : undefined}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="detailed"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                      >
                        <EnhancedCareerPassport 
                          userId={targetUserId || user?.id}
                          userProfile={displayData.profile}
                          isOwner={displayData.isOwner}
                          publicPassport={isPublicView ? publicPassportData : undefined}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-6">
                  {/* Bio Verification */}
                  <Card className="rounded-[32px] border-white/20 bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Fingerprint className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-apple-heavy text-slate-900 text-lg">Talent Profile</h3>
                        <p className="text-xs font-apple-bold text-slate-400 uppercase">Hardware Verified</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-apple-medium text-slate-600">Global Visibility</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0 rounded-lg text-[10px]">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-apple-medium text-slate-600">Response Rating</span>
                        </div>
                        <span className="text-sm font-apple-heavy text-slate-950">Sub-2h</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6 rounded-2xl bg-blue-600 text-white font-apple-bold py-6 hover:bg-blue-700 transition-colors">
                      <Share2 className="w-4 h-4 mr-2" /> Share Profile
                    </Button>
                  </Card>

                  {displayData.isOwner && <NetworkGrowthCard />}
                </div>
              </div>

              {/* QR & Professional Matrix */}
              {displayData.isOwner && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
                    <EnhancedQRGenerator profileData={displayData.profile} />
                  </motion.div>
                  <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                    <ProfessionalCard 
                      profile={displayData.profile} 
                      careerPassport={displayData.passport}
                      isOwner={true}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Target className="h-12 w-12 text-slate-300" />
              </div>
              <h2 className="text-3xl font-apple-heavy text-slate-950 mb-2">Identity Not Configured</h2>
              <p className="text-slate-500 font-apple-medium mb-8 max-w-sm mx-auto">
                This user hasn't activated their TalentXcel Passport matrix yet.
              </p>
              {displayData.isOwner && (
                <Button onClick={() => navigate('/profile/edit')} className="rounded-2xl bg-slate-950 px-8 py-6 font-apple-bold">
                  Activate TalentXcel Passport <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareerPassportCommandCenter;
