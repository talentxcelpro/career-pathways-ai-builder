import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicProfile, usePublicCareerPassport, usePublicAchievements } from '@/hooks/usePublicProfile';
import InstantProfileViewer from '@/components/passport/InstantProfileViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Sparkles, Shield, Globe } from 'lucide-react';

const PublicPassportView: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = usePublicProfile(identifier);
  const { data: careerPassport, isLoading: passportLoading } = usePublicCareerPassport(profile?.id);
  const { data: achievements, isLoading: achievementsLoading } = usePublicAchievements(profile?.id);

  const isLoading = profileLoading || passportLoading || achievementsLoading;

  // Error state
  if (profileError || (!isLoading && !profile)) {
    return (
      <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl flex items-center justify-center edge-to-edge">
        <Helmet>
          <title>Identity Hub Not Found - TalentXcel</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        
        <Card className="max-w-md w-full mx-4 rounded-[40px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[28px] flex items-center justify-center shadow-inner">
              <AlertCircle className="h-10 w-10 text-slate-300" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Identity Not Found</h1>
              <p className="text-slate-500 font-apple-medium leading-relaxed">
                The professional identity hub you're looking for doesn't exist or has been synchronized to private mode.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full h-14 rounded-2xl bg-slate-950 text-white font-apple-heavy hover:scale-105 transition-all shadow-xl shadow-slate-950/20">
                <a href="/">Explore TalentXcel Hub</a>
              </Button>
              <Button variant="outline" asChild className="w-full h-14 rounded-2xl border-slate-200 bg-white font-apple-heavy hover:bg-slate-50 transition-all">
                <a href="/auth/signup">Initialize Your Identity</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge">
        <Helmet>
          <title>Synchronizing Professional Identity - TalentXcel</title>
        </Helmet>
        
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-slate-950 h-72 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
            <div className="max-w-7xl mx-auto px-8 py-16">
              <div className="flex items-start gap-10">
                <div className="w-40 h-40 bg-white/10 rounded-[40px] border-4 border-white/5"></div>
                <div className="flex-1 space-y-6 pt-4">
                  <div className="h-12 bg-white/10 rounded-2xl w-80"></div>
                  <div className="h-8 bg-white/10 rounded-xl w-64"></div>
                  <div className="h-4 bg-white/10 rounded-lg w-40"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="max-w-7xl mx-auto px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <div className="h-64 bg-white border border-slate-100 rounded-[40px]"></div>
                <div className="h-48 bg-white border border-slate-100 rounded-[40px]"></div>
              </div>
              <div className="space-y-10">
                <div className="h-80 bg-white border border-slate-100 rounded-[40px]"></div>
                <div className="h-48 bg-white border border-slate-100 rounded-[40px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="edge-to-edge">
      <Helmet>
        <title>{profile.full_name} - Professional Identity Hub | TalentXcel</title>
        <meta 
          name="description" 
          content={`${profile.full_name}${profile.title ? ` - ${profile.title}` : ''} | Professional identity hub on TalentXcel. ${profile.headline || 'Synchronize with elite professionals and explore ecosystem matches.'}`}
        />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${profile.full_name} - Professional Identity Hub`} />
        <meta property="og:description" content={profile.headline || `${profile.full_name}'s professional identity on TalentXcel`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        {profile.profile_picture_url && (
          <meta property="og:image" content={profile.profile_picture_url} />
        )}
        <meta property="og:site_name" content="TalentXcel" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.full_name} - Professional Identity Hub`} />
        <meta name="twitter:description" content={profile.headline || `${profile.full_name}'s professional identity on TalentXcel`} />
        {profile.profile_picture_url && (
          <meta name="twitter:image" content={profile.profile_picture_url} />
        )}
        
        {/* Structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": profile.full_name,
            "jobTitle": profile.title,
            "description": profile.headline,
            "url": window.location.href,
            "image": profile.profile_picture_url,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": profile.location
            },
            "sameAs": [
              profile.linkedin_url,
              profile.github_url,
              profile.portfolio_url
            ].filter(Boolean),
            "worksFor": {
              "@type": "Organization",
              "name": "TalentXcel"
            }
          })}
        </script>
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <InstantProfileViewer
        profile={profile}
        careerPassport={careerPassport}
        achievements={achievements}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PublicPassportView;