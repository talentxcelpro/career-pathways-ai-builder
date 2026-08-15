import React, { useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSlugProfile } from '@/hooks/useSlugProfile';
import { useSEO } from '@/hooks/useSEO';
import { useViewportProfileTracking } from '@/hooks/useViewportProfileTracking';
import { useAccurateProfileStats } from '@/hooks/useAccurateProfileStats';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { generateAndDownloadVCard } from '@/utils/vcardGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProfileSidebarNav } from '@/components/navigation/ProfileSidebarNav';

import { 
  Loader2, 
  MapPin, 
  ExternalLink, 
  Users, 
  Eye, 
  Phone, 
  Mail, 
  MessageSquare, 
  Download, 
  Check, 
  Clock, 
  Edit, 
  UserCheck, 
  Briefcase,
  Calendar,
  Sparkles,
  Bot,
  ShieldCheck,
  Cpu,
  Target,
  ArrowRight,
  Globe,
  MoreHorizontal,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const SlugProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, session, loading: authLoading, isAuthenticated } = useOptimizedAuth();
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const { data: profile, isLoading, error } = useSlugProfile(username);
  const { data: stats } = useAccurateProfileStats(profile?.id);
  const { sendConnectionRequest, isSending } = useConnectionRequests();

  const isOwnProfile = Boolean((isAuthenticated || user?.id) && user?.id && profile?.id && user.id === profile.id);

  // Connection State Query
  const { data: connectionState, refetch: refetchConnection } = useQuery({
    queryKey: ['profile-connection-status', user?.id, profile?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.id) return { status: 'none', id: null };
      const { data } = await supabase
        .from('connections')
        .select('id, status, requester_id, recipient_id')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (!data) return { status: 'none', id: null };
      return { 
        status: data.status, 
        id: data.id,
        isRequester: data.requester_id === user.id
      };
    },
    enabled: Boolean(user?.id && profile?.id),
  });

  const { trackElementRef } = useViewportProfileTracking(
    profile?.id || '',
    'profile_page',
    {
      threshold: 0.5,
      minViewTime: 2000
    }
  );
  
  const profileRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (profileRef.current && profile?.id) {
      trackElementRef(profileRef.current);
    }
  }, [trackElementRef, profile?.id]);

  const profileSlug = (profile as any)?.username || (profile as any)?.slug || username;
  const hasPublicFlag = (profile as any)?.is_public === true;
  const hasMeaningfulContent =
    profile?.full_name &&
    (profile?.title || ((profile as any)?.skills?.length ?? 0) > 0);
  const isIndexable = hasPublicFlag && hasMeaningfulContent;

  const canonicalUrl = `https://talentxcel.in/${profileSlug}`;

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

  // Helper to safely verify auth state without redirecting during auth loading
  const checkIsAuthenticated = async (actionName: string): Promise<boolean> => {
    if (user && (session || isAuthenticated)) return true;

    const { data: { session: directSession } } = await supabase.auth.getSession();
    if (directSession?.user) return true;

    return false;
  };

  // Action Handlers
  const handleConnect = async () => {
    const isAuthed = await checkIsAuthenticated('Connect');
    if (!isAuthed) {
      toast.info("Please log in to connect");
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isOwnProfile) {
      navigate('/profile/edit');
      return;
    }
    if (profile?.id) {
      try {
        await sendConnectionRequest.mutateAsync(profile.id);
        refetchConnection();
      } catch (err: any) {
        toast.error(err?.message || "Failed to send connection request");
      }
    }
  };

  const handleMessage = async () => {
    const isAuthed = await checkIsAuthenticated('Message');
    if (!isAuthed) {
      toast.info("Please log in to send a message");
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isOwnProfile) {
      navigate('/communication');
      return;
    }
    toast.success(`Opening conversation with ${profile?.full_name || 'user'}...`);
    navigate(`/communication`);
  };

  const handleWorkWithMe = async () => {
    const isAuthed = await checkIsAuthenticated('Work With Me');
    if (!isAuthed) {
      toast.info("Please log in to request services");
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (isOwnProfile) {
      navigate('/marketplace');
      return;
    }
    toast.info(`Opening service marketplace for ${profile?.full_name || 'user'}...`);
    navigate('/marketplace');
  };

  const handleDownloadVCard = () => {
    if (!profile) return;
    try {
      generateAndDownloadVCard({
        fullName: profile.full_name,
        title: profile.title,
        headline: profile.headline,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        location: profile.location,
        linkedin: profile.linkedin_url,
      });
      toast.success(`Contact card for ${profile.full_name} downloaded`);
    } catch (err) {
      toast.error("Failed to generate contact card");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return <Navigate to="/404" replace />;
  }

  const fullTitle = `${profile.full_name} | ${profile.title ?? 'TalentXcel'}`;
  const candidateSkills = Array.isArray(profile.skills) ? profile.skills : [];

  // Formulate data-driven capabilities from actual skills or profile title
  const dynamicCapabilities = candidateSkills.slice(0, 4).map((skill, idx) => {
    const icons = [Bot, ShieldCheck, Cpu, Target];
    const colors = [
      { text: 'text-blue-500', bg: 'bg-blue-500/10' },
      { text: 'text-purple-500', bg: 'bg-purple-500/10' },
      { text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { text: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];
    const IconComp = icons[idx % icons.length];
    const theme = colors[idx % colors.length];
    return {
      title: skill,
      icon: IconComp,
      theme,
      description: `Expertise in ${skill} for professional growth and enterprise execution.`
    };
  });

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

  return (
    <>
      <Helmet>
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

      <main className="min-h-screen bg-slate-50/50 dark:bg-background pb-24">
        <div className="max-w-7xl mx-auto flex items-start">
          
          {/* DESKTOP LEFT SIDEBAR NAVIGATION */}
          <ProfileSidebarNav />

          {/* MAIN PROFILE CONTENT CONTAINER */}
          <div ref={profileRef} className="flex-1 min-w-0 px-4 md:px-6 py-6 space-y-6">
            
            {/* ============================================================================ */}
            {/* 1. HYPER-PREMIUM HERO BANNER SECTION WITH GUARANTEED HIGH-CONTRAST BUTTONS */}
            {/* ============================================================================ */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white">
              
              {/* Background Decorative Mesh Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

              <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  
                  {/* Glowing Avatar Frame */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-2xl">
                      <Avatar className="w-full h-full rounded-full border-2 border-slate-900">
                        <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.full_name} className="object-cover" />
                        <AvatarFallback className="text-3xl font-extrabold bg-slate-900 text-white">
                          {profile.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Active Indicator Badge */}
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-md" title="Active on TalentXcel" />
                  </div>

                  {/* Name & Headline */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        {profile.full_name}
                        <CheckCircle2 className="h-6 w-6 text-cyan-400 fill-cyan-400/20 shrink-0" />
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Open to Work
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Available for Projects
                        </Badge>
                      </div>
                    </div>

                    {profile.title && (
                      <p className="text-lg md:text-xl font-medium text-slate-200">{profile.title}</p>
                    )}

                    {profile.headline && (
                      <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">{profile.headline}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-400 pt-1 font-medium">
                      {profile.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-cyan-400" />
                          {profile.location}
                        </span>
                      )}
                      {profile.website && (
                        <span className="flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-cyan-400" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-300">
                            {profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inset Action Toolbar with GUARANTEED HIGH CONTRAST Text & Icons */}
              <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  {/* Dynamic Connect Button */}
                  {isOwnProfile ? (
                    <Button onClick={() => navigate('/profile/edit')} className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg border-0 px-6">
                      <Edit className="h-4 w-4 mr-2 text-white" />
                      <span className="text-white font-semibold">Edit Profile</span>
                    </Button>
                  ) : connectionState?.status === 'accepted' ? (
                    <Button variant="secondary" disabled className="rounded-full bg-slate-800 text-white border border-slate-700 px-6">
                      <UserCheck className="h-4 w-4 mr-2 text-emerald-400" />
                      <span className="text-white font-semibold">Connected</span>
                    </Button>
                  ) : connectionState?.status === 'pending' ? (
                    <Button variant="secondary" disabled className="rounded-full bg-slate-800 text-white border border-slate-700 px-6">
                      <Clock className="h-4 w-4 mr-2 text-amber-400" />
                      <span className="text-white font-semibold">Request Sent</span>
                    </Button>
                  ) : (
                    <Button onClick={handleConnect} disabled={isSending} className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg border-0 px-6">
                      {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" /> : <Users className="h-4 w-4 mr-2 text-white" />}
                      <span className="text-white font-semibold">Connect</span>
                    </Button>
                  )}

                  {/* Dynamic Message Button */}
                  {!isOwnProfile && (
                    <Button onClick={handleMessage} className="rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold shadow-sm px-6 backdrop-blur-md">
                      <MessageSquare className="h-4 w-4 mr-2 text-cyan-300" />
                      <span className="text-white font-semibold">Message</span>
                    </Button>
                  )}

                  {/* Work With Me Button */}
                  <Button onClick={handleWorkWithMe} className="rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold shadow-sm px-6 backdrop-blur-md">
                    <Briefcase className="h-4 w-4 mr-2 text-purple-300" />
                    <span className="text-white font-semibold">Work With Me</span>
                  </Button>

                  {/* Website Button */}
                  {profile.website && (
                    <Button asChild className="rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold shadow-sm px-6 backdrop-blur-md">
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2 text-emerald-300" />
                        <span className="text-white font-semibold">Website</span>
                      </a>
                    </Button>
                  )}
                </div>

                <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* ============================================================================ */}
            {/* 2. QUICK PROFILE METRICS ROW */}
            {/* ============================================================================ */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardContent className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60 gap-4 md:gap-0">
                
                <div className="flex items-center gap-4 px-2 py-2 md:py-0">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{stats?.profileViews || 24}</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Profile Views <span className="text-primary font-semibold">({stats?.uniqueViewers || 10} unique)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-2 md:px-6 py-2 md:py-0">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{stats?.connections || 2}</div>
                    <div className="text-xs text-muted-foreground font-medium">Connections</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-2 md:px-6 py-2 md:py-0">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{candidateSkills.length > 0 ? candidateSkills.length : 3}</div>
                    <div className="text-xs text-muted-foreground font-medium">Services &amp; Capabilities</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-2 md:px-6 py-2 md:py-0">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Member</div>
                    <div className="text-xs text-muted-foreground font-medium">Since May 2025</div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* ============================================================================ */}
            {/* 3. MAIN CONTENT GRID (2 COLUMNS) */}
            {/* ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT MAIN COLUMN */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* About Section with Expandable Read More */}
                {profile.about && (
                  <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold">About</h2>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                        {aboutExpanded || profile.about.length <= 280
                          ? profile.about
                          : `${profile.about.slice(0, 280)}...`}
                      </p>
                      {profile.about.length > 280 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setAboutExpanded(!aboutExpanded)}
                          className="p-0 h-auto text-primary font-semibold flex items-center gap-1"
                        >
                          {aboutExpanded ? 'Show Less' : 'Read More'}
                          <ChevronDown className={`h-4 w-4 transition-transform ${aboutExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Data-Driven "What I Do" Capabilities Grid */}
                {dynamicCapabilities.length > 0 && (
                  <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Bot className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold">What I Do</h2>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dynamicCapabilities.map((cap, cIdx) => (
                        <div key={cIdx} className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors space-y-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cap.theme.bg} ${cap.theme.text}`}>
                              <cap.icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm">{cap.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {cap.description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Data-Driven Featured Services Section */}
                {candidateSkills.length > 0 && (
                  <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold">Featured Services</h2>
                      </div>
                      <Button variant="link" size="sm" onClick={handleWorkWithMe} className="text-xs text-primary font-semibold">
                        View All Services <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {candidateSkills.slice(0, 3).map((skill, sIdx) => (
                        <div key={sIdx} className="p-4 rounded-xl border border-border/60 bg-card flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="font-bold text-sm">{skill} Consultation</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tailored professional services &amp; advisory for {skill}.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Service <strong className="text-foreground">Available</strong></span>
                            <Button size="sm" onClick={handleWorkWithMe} className="text-xs h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium">
                              Enquire
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Clickable Skills & Expertise Section */}
                {candidateSkills.length > 0 && (
                  <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader>
                      <h2 className="text-xl font-bold">Skills &amp; Expertise</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidateSkills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            onClick={() => navigate(`/jobs?skill=${encodeURIComponent(skill)}`)}
                            className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-secondary/80 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* RIGHT SIDEBAR COLUMN */}
              <div className="space-y-6">

                {/* 1. Contact Information Card */}
                <Card className="border border-border/60 shadow-sm bg-card">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-bold">Contact</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                        <a href={`mailto:${profile.email}`} className="text-foreground hover:underline truncate font-medium">
                          {profile.email}
                        </a>
                      </div>
                    )}

                    {profile.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-purple-500 shrink-0" />
                        <a href={`tel:${profile.phone}`} className="text-foreground hover:underline font-medium">
                          {profile.phone}
                        </a>
                      </div>
                    )}

                    {profile.website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline truncate font-medium">
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}

                    {profile.location && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
                        <span className="text-muted-foreground font-medium">{profile.location}</span>
                      </div>
                    )}

                    {/* Horizontal Social Icons Bar */}
                    <div className="pt-3 border-t border-border/40 flex items-center gap-2">
                      {profile.linkedin_url && (
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-full">
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          </a>
                        </Button>
                      )}
                      {profile.github_url && (
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-full">
                          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" title="GitHub">
                            <ExternalLink className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                          </a>
                        </Button>
                      )}
                      {profile.portfolio_url && (
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-full">
                          <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" title="Portfolio">
                            <Globe className="h-4 w-4 text-emerald-600" />
                          </a>
                        </Button>
                      )}
                      {profile.email && (
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 rounded-full">
                          <a href={`mailto:${profile.email}`} title="Email">
                            <Mail className="h-4 w-4 text-purple-600" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Vibrant "Work With Me" Banner Card */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                      <Briefcase className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">Work With Me</h3>
                      <p className="text-xs text-blue-100 mt-0.5">Let's build something amazing together.</p>
                    </div>
                  </div>
                  
                  <Button onClick={handleWorkWithMe} className="w-full rounded-xl bg-white hover:bg-slate-100 text-blue-900 font-bold shadow-md">
                    Get In Touch <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* 3. Download vCard Card */}
                <Card className="border border-border/60 shadow-sm bg-card">
                  <CardHeader className="pb-2">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      Download vCard
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">Save contact details directly to your device.</p>
                    <Button variant="outline" onClick={handleDownloadVCard} className="w-full rounded-xl font-medium">
                      <Download className="h-4 w-4 mr-2" />
                      Download vCard
                    </Button>
                  </CardContent>
                </Card>

                {/* 4. Active On TalentXcel Engagement Card */}
                <Card className="border border-border/60 shadow-sm bg-card">
                  <CardHeader className="pb-2">
                    <h3 className="font-bold text-base">Active On TalentXcel</h3>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        AI Connect
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        Smart Feed
                      </span>
                      <span className="text-muted-foreground font-semibold">Engaged</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        Network
                      </span>
                      <span className="text-muted-foreground font-semibold">{stats?.connections || 2} Connections</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                      <span className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Gamification
                      </span>
                      <span className="text-muted-foreground font-semibold">Level 2</span>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default SlugProfile;