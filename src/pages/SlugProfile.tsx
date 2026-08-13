import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSlugProfile } from '@/hooks/useSlugProfile';
import { useSEO } from '@/hooks/useSEO';
import { useViewportProfileTracking } from '@/hooks/useViewportProfileTracking';
import { useAccurateProfileStats } from '@/hooks/useAccurateProfileStats';
import { getCta } from '@/config/ctaSystem';
import { Loader2, MapPin, ExternalLink, Calendar, Users, Eye, Phone, Mail, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SlugProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading, error } = useSlugProfile(username);
  const { data: stats } = useAccurateProfileStats(profile?.id);
  const { trackElementRef } = useViewportProfileTracking(
    profile?.id || '',
    'profile_page',
    {
      threshold: 0.5, // 50% visible
      minViewTime: 2000 // 2 seconds minimum view time
    }
  );
  
  const profileRef = React.useRef<HTMLDivElement>(null);
  
  // Set up viewport tracking for profile view
  React.useEffect(() => {
    if (profileRef.current && profile?.id) {
      trackElementRef(profileRef.current);
    }
  }, [trackElementRef, profile?.id]);

  // Profile indexability:
  // Index ONLY when is_public is explicitly true AND profile has meaningful content.
  // Meaningful = has a full_name AND (title OR at least 1 skill).
  const profileSlug = (profile as any)?.username || (profile as any)?.slug || username;
  const hasPublicFlag = (profile as any)?.is_public === true;
  const hasMeaningfulContent =
    profile?.full_name &&
    (profile?.title || ((profile as any)?.skills?.length ?? 0) > 0);
  const isIndexable = hasPublicFlag && hasMeaningfulContent;

  const canonicalUrl = `https://talentxcel.in/profile/${profileSlug}`;

  // Set up SEO
  useSEO({
    title: profile ? `${profile.full_name} (@${profileSlug}) - TalentXcel` : 'Profile - TalentXcel',
    description: profile
      ? `${profile.full_name}'s professional profile on TalentXcel. ${profile.title ? `${profile.title}. ` : ''}${profile.about ? profile.about.substring(0, 150) + '...' : 'Connect and explore their career journey.'}`
      : 'View professional profile on TalentXcel.',
    keywords: profile
      ? [profile.full_name, profileSlug, 'professional profile', 'TalentXcel', profile.title, profile.location].filter(Boolean)
      : ['professional profile', 'TalentXcel'],
    canonical: canonicalUrl,
  });


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return <Navigate to="/404" replace />;
  }

  const fullTitle = `${profile.full_name} | ${profile.title ?? 'TalentXcel'}`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    jobTitle: profile.title,
    url: `https://talentxcel.in/${(profile as any).username || profile.slug}`,
    sameAs: [profile.website, profile.linkedin_url, profile.github_url].filter(Boolean),
    email: profile.email,
    telephone: profile.phone,
    image: profile.profile_picture_url,
    description: profile.about,
    worksFor: {
      '@type': 'Organization',
      name: 'TalentXcel',
      url: 'https://talentxcel.in',
    },
    ...(profile.location ? { address: { '@type': 'PostalAddress', addressLocality: profile.location } } : {}),
  };

  const profileCta = getCta('Profile');

  return (
    <>
      <Helmet>
        {/* Robots: only index when the profile meets the quality gate */}
        <meta name="robots" content={isIndexable ? 'index,follow' : 'noindex,nofollow'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={profile.about ? profile.about.substring(0, 160) : `${profile.full_name}'s professional profile on TalentXcel.`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="profile" />
        {profile.profile_picture_url && <meta property="og:image" content={profile.profile_picture_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={profile.about ? profile.about.substring(0, 160) : `${profile.full_name}'s professional profile on TalentXcel.`} />
        {profile.profile_picture_url && <meta name="twitter:image" content={profile.profile_picture_url} />}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <div ref={profileRef} className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Cover Image Section */}
          {profile.cover_image_url && (
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
              <img 
                src={profile.cover_image_url} 
                alt={`${profile.full_name}'s cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32">
                    <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl font-semibold">
                      {profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    {profile.title && (
                      <p className="text-xl text-muted-foreground mt-1">{profile.title}</p>
                    )}
                    {profile.headline && (
                      <p className="text-foreground mt-2">{profile.headline}</p>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline">
                      Message
                    </Button>
                    {profile.website && (
                      <Button variant="outline" asChild>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats Card */}
                <div className="md:min-w-48">
                  <Card>
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold">Profile Stats</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link to="/profile/viewers" className="flex items-center justify-between hover:bg-accent p-2 rounded-lg transition-colors -m-2">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Profile Views</span>
                        </div>
                        <span className="font-semibold text-primary">{stats?.profileViews || 0} ({stats?.uniqueViewers || 0} unique)</span>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Connections</span>
                        </div>
                        <span className="font-semibold">{stats?.connections || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              {profile.about && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">About</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {profile.about}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Skills</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Contact</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${profile.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${profile.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Links</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.github_url && (
                      <a 
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a 
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Portfolio
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* CTA Section */}
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Work With Me
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download vCard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SlugProfile;