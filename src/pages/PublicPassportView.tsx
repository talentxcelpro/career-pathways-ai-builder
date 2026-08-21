import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicProfile, usePublicCareerPassport, usePublicAchievements } from '@/hooks/usePublicProfile';
import InstantProfileViewer from '@/components/passport/InstantProfileViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const PublicPassportView: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = usePublicProfile(identifier);
  const { data: careerPassport, isLoading: passportLoading } = usePublicCareerPassport(profile?.id);
  const { data: achievements, isLoading: achievementsLoading } = usePublicAchievements(profile?.id);

  const isLoading = profileLoading || passportLoading || achievementsLoading;

  // Error state
  if (profileError || (!isLoading && !profile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex items-center justify-center">
        <Helmet>
          <title>Profile Not Found - TalentXcel</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Profile Not Found</h1>
              <p className="text-muted-foreground">
                The professional profile you're looking for doesn't exist or has been made private.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href="/">Explore TalentXcel</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/auth/signup">Create Your Profile</a>
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background">
        <Helmet>
          <title>Loading Professional Profile - TalentXcel</title>
        </Helmet>
        
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-primary/20 h-64">
            <div className="container mx-auto px-4 py-12">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-muted rounded w-64"></div>
                  <div className="h-6 bg-muted rounded w-48"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://talentxcel.in/passport/public/${identifier || ''}`;

  // Success state
  return (
    <>
      <Helmet>
        <title>{profile.full_name} - Professional Career Passport | TalentXcel</title>
        <meta 
          name="description" 
          content={`${profile.full_name}${profile.title ? ` - ${profile.title}` : ''} | Professional career passport on TalentXcel. ${profile.headline || 'Connect with professionals and explore career opportunities.'}`}
        />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${profile.full_name} - Professional Career Passport`} />
        <meta property="og:description" content={profile.headline || `${profile.full_name}'s professional profile on TalentXcel`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        {profile.profile_picture_url && (
          <meta property="og:image" content={profile.profile_picture_url} />
        )}
        <meta property="og:site_name" content="TalentXcel" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.full_name} - Professional Career Passport`} />
        <meta name="twitter:description" content={profile.headline || `${profile.full_name}'s professional profile on TalentXcel`} />
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
            "url": canonicalUrl,
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
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <InstantProfileViewer
        profile={profile}
        careerPassport={careerPassport}
        achievements={achievements}
        isLoading={isLoading}
      />
    </>
  );
};

export default PublicPassportView;