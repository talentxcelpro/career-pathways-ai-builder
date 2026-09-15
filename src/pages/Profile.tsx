
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { ProfileShareDialog } from '@/components/profile/ProfileShareDialog';
import { PortfolioManager } from '@/components/profile/PortfolioManager';
import { FollowedCompanies } from '@/components/profile/FollowedCompanies';
import { ProfileViewers } from '@/components/profile/ProfileViewers';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, ExternalLink, MapPin, Briefcase } from 'lucide-react';
import { incrementProfileView } from '@/utils/profileHelpers';
import { useState } from 'react';
import { cn } from "@/lib/utils";
import ProBadge from '@/components/network/ProBadge';
import { TalentScoreWidget } from '@/components/talent-score/TalentScoreWidget';
import { BiometricSettings } from '@/components/profile/BiometricSettings';
import { NotificationControls } from '@/components/profile/NotificationControls';

const Profile = () => {
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Track profile view for Career Analytics.
  useEffect(() => {
    if (currentUser?.id && profile) {
      incrementProfileView(currentUser.id);
    }
  }, [currentUser?.id, profile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/auth/login');
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  const profileUrl = profile?.custom_profile_url 
    ? `${window.location.origin}/profile/${profile.custom_profile_url}`
    : `${window.location.origin}/profile/${currentUser.id}`;

  const socialPlatforms = {
    linkedin: 'LinkedIn',
    github: 'GitHub', 
    twitter: 'Twitter',
    website: 'Website'
  };

  return (
    <ProfileLayout 
      title="Profile" 
      description="View and manage your professional profile"
    >
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Profile Completion Banner */}
        <ProfileCompletionBanner profile={profile} />

        {/* TalentScore Widget */}
        <TalentScoreWidget />
        
        {/* Premium Profile Header */}
        <Card className="glass-pro border-white/20 shadow-2xl overflow-hidden rounded-[32px]">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          </div>
          <CardContent className="p-8 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white rounded-[32px] shadow-xl" />
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.full_name || 'Profile'}
                      className="w-32 h-32 rounded-[32px] object-cover relative z-10 border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 text-4xl font-apple-heavy relative z-10 border-4 border-white shadow-2xl">
                      {profile?.full_name 
                        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : currentUser.email?.[0]?.toUpperCase() || 'U'
                      }
                    </div>
                  )}
                  {profile?.pro_status && (
                    <div className="absolute -bottom-2 -right-2 z-20">
                      <ProBadge 
                        plan={profile.pro_status === 'starter' ? 'Starter' : 
                              profile.pro_status === 'business' ? 'Business' : 
                              profile.pro_status === 'elite' ? 'Elite' : 'Starter'} 
                        size="md" 
                      />
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left pb-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-4xl font-apple-heavy text-slate-950 tracking-tighter">
                      {profile?.full_name || currentUser.email || 'Your Profile'}
                    </h1>
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none px-3 py-1 font-apple-bold text-[10px] uppercase tracking-widest">
                      Online
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-apple-medium">
                    {profile?.title && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        <span>{profile.title}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-2">
                <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-slate-400" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button className="h-12 rounded-2xl bg-slate-950 text-white font-apple-bold px-8 hover:scale-105 transition-all shadow-xl" onClick={() => navigate('/profile/edit')}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 pt-0">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              {profile?.about && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full" />
                    Strategic Background
                  </h2>
                  <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-apple-medium whitespace-pre-wrap">
                    {profile.about}
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <h2 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full" />
                    Core Competencies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="rounded-xl bg-white border border-slate-200 text-slate-600 px-4 py-2 font-apple-bold text-xs hover:border-primary/30 transition-all shadow-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-8">
              {/* Stats Card */}
              <div className="p-6 rounded-[24px] bg-slate-900 text-white shadow-xl space-y-6">
                <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400">Ecosystem Matrix</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-apple-heavy tracking-tighter">
                      {profile?.profile_views_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-[10px] font-apple-heavy uppercase text-slate-500">Views</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-apple-heavy tracking-tighter">98th</p>
                    <p className="text-[10px] font-apple-heavy uppercase text-slate-500">Percentile</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                   <ProfileViewers 
                     profileUserId={currentUser.id} 
                     viewsCount={profile?.profile_views_count || 0} 
                   />
                </div>
              </div>

              {/* Contact & Social Info */}
              <div className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400">Professional Context</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Email', value: profile?.email },
                    { label: 'Phone', value: profile?.phone },
                    { label: 'Company', value: profile?.current_company },
                    { label: 'Industry', value: profile?.industry },
                    { label: 'Experience', value: profile?.experience_years ? `${profile.experience_years} Years` : null }
                  ].map((item, i) => item.value && (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-apple-heavy uppercase tracking-widest text-slate-400">{item.label}</span>
                      <span className="text-sm font-apple-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                  
                  {profile?.website && (
                    <div className="pt-2">
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-apple-bold text-sm hover:underline"
                      >
                        Personal Site <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {Object.entries(profile.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        title={socialPlatforms[platform as keyof typeof socialPlatforms] || platform}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Public Profile Link */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Public Profile</h3>
                <p className="text-sm text-gray-600">Share your profile with others</p>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {profileUrl}
                </code>
                <Button size="sm" variant="outline" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!profile && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Complete your profile to get started</p>
              <Button onClick={() => navigate('/profile/edit')}>
                Set Up Profile
              </Button>
            </div>
          )}
        {/* Security & Biometrics */}
        <BiometricSettings />

        {/* Notification Controls */}
        <NotificationControls />

        {/* Portfolio Section */}
        {currentUser?.id && (
          <PortfolioManager userId={currentUser.id} />
        )}

        {/* Followed Companies Section */}
        {currentUser?.id && (
          <div className="mb-6">
            <FollowedCompanies userId={currentUser.id} />
          </div>
        )}

        {/* Share Dialog */}
        <ProfileShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          profileUrl={profileUrl}
          userName={profile?.full_name || 'User'}
        />
      </div>
    </ProfileLayout>
  );
};

export default Profile;




