import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  Shield, 
  Crown,
  UserPlus,
  MapPin,
  Briefcase,
  Building,
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getStandardAvatarUrl } from '@/utils/avatarUtils';
import { generatePersonProfileSlug, getPublicProfilePath } from '@/utils/userProfileSlug';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CareerContentHub } from '@/components/social/CareerContentHub';
import { TalentXcelLogo } from "@/components/common/TalentXcelLogo";
import { SEOHead } from '@/components/seo/SEOHead';

interface ProfileRecord {
  id: string;
  full_name: string;
  title: string | null;
  profile_picture_url: string | null;
  headline: string | null;
  location: string | null;
  current_company: string | null;
  about: string | null;
  skills: string[] | null;
  slug: string | null;
  custom_profile_url: string | null;
  username: string | null;
  updated_at: string;
  created_at: string;
  completenessScore: number;
  hoursSinceUpdate: number;
  isRecentActive: boolean;
  isComplete: boolean;
}

interface PeopleSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badgeColor: string;
  people: ProfileRecord[];
}

function calculateCompleteness(p: any): number {
  let score = 0;
  const avatar = getStandardAvatarUrl(p.profile_picture_url);
  if (avatar) score += 30;
  if (p.title && p.title.trim().length > 2) score += 20;
  else if (p.headline && p.headline.trim().length > 2) score += 15;
  if (p.about && p.about.trim().length >= 20) score += 20;
  else if (p.about && p.about.trim().length > 0) score += 10;
  if (p.location && p.location.trim().length > 1) score += 15;
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 15;
  return score;
}

interface DiscoverProps {
  isEmbedded?: boolean;
}

export const Discover: React.FC<DiscoverProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabParam = searchParams.get('subtab') || 'people';
  const [activeSubTab, setActiveSubTab] = useState<'people' | 'articles'>(
    subtabParam === 'articles' ? 'articles' : 'people'
  );

  const handleSubTabChange = (mode: 'people' | 'articles') => {
    setActiveSubTab(mode);
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev);
      updated.set('subtab', mode);
      return updated;
    }, { replace: true });
  };

  const { sendConnectionRequest } = useConnectionRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'complete' | 'others'>('all');
  const queryClient = useQueryClient();

  // Real-time synchronization on profiles table
  useEffect(() => {
    const channel = supabase
      .channel('discover-profiles-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['discover-professionals-ranked'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ['discover-professionals-ranked'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, headline, location, current_company, about, skills, slug, custom_profile_url, username, updated_at, created_at')
        .not('full_name', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching discover profiles:', error);
        return [];
      }

      const now = Date.now();

      const scored: ProfileRecord[] = (data || [])
        .filter(p => {
          if (!p.full_name || p.full_name.trim().length < 2) return false;
          const lower = p.full_name.toLowerCase().trim();
          // Filter out synthetic/dummy/test probe artifacts so only authentic member profiles appear
          if (
            lower.includes('dummy') ||
            lower.includes('test') ||
            lower.includes('probe') ||
            lower === 'user' ||
            lower === 'account' ||
            lower === 'admin admin' ||
            lower.startsWith('test ') ||
            lower.endsWith(' test')
          ) {
            return false;
          }
          return true;
        })
        .map(p => {
          const completeness = calculateCompleteness(p);
          const updateTime = p.updated_at ? new Date(p.updated_at).getTime() : 0;
          const hoursSinceUpdate = updateTime > 0 ? (now - updateTime) / (1000 * 60 * 60) : 999999;
          
          const isRecentActive = hoursSinceUpdate <= 336;
          const isComplete = completeness >= 50;

          return {
            ...p,
            completenessScore: completeness,
            hoursSinceUpdate,
            isRecentActive,
            isComplete
          };
        });

      return scored;
    }
  });

  const categorizedSections: PeopleSection[] = useMemo(() => {
    let filtered = allProfiles;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.full_name.toLowerCase().includes(term) ||
        (p.title && p.title.toLowerCase().includes(term)) ||
        (p.headline && p.headline.toLowerCase().includes(term)) ||
        (p.current_company && p.current_company.toLowerCase().includes(term)) ||
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.skills && p.skills.some((s: string) => s.toLowerCase().includes(term)))
      );
    }

    if (selectedFilter === 'recent') {
      return [{
        id: 'recent',
        title: 'Recent Active Professionals',
        subtitle: 'Members who updated their verified career signals within the last 14 days',
        icon: <Zap className="h-4 w-4 text-emerald-500" />,
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        people: filtered.filter(p => p.isRecentActive)
      }];
    }

    if (selectedFilter === 'complete') {
      return [{
        id: 'complete',
        title: 'High-Completeness Profiles',
        subtitle: 'Professionals with 50%+ verified profile and capability information',
        icon: <Shield className="h-4 w-4 text-blue-500" />,
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        people: filtered.filter(p => p.isComplete && !p.isRecentActive)
      }];
    }

    if (selectedFilter === 'others') {
      return [{
        id: 'others',
        title: 'Discover Community Members',
        subtitle: 'Active participants across the TalentXcel global network',
        icon: <Users className="h-4 w-4 text-purple-500" />,
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        people: filtered.filter(p => !p.isRecentActive && !p.isComplete)
      }];
    }

    const recent = filtered.filter(p => p.isRecentActive);
    const complete = filtered.filter(p => p.isComplete && !p.isRecentActive);
    const others = filtered.filter(p => !p.isRecentActive && !p.isComplete);

    const sections: PeopleSection[] = [];

    if (recent.length > 0) {
      sections.push({
        id: 'recent',
        title: 'Recent Active Professionals',
        subtitle: 'Members who updated their verified career signals within the last 14 days',
        icon: <Zap className="h-4 w-4 text-emerald-500" />,
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        people: recent
      });
    }

    if (complete.length > 0) {
      sections.push({
        id: 'complete',
        title: 'High-Completeness Profiles',
        subtitle: 'Professionals with 50%+ verified profile and capability information',
        icon: <Shield className="h-4 w-4 text-blue-500" />,
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        people: complete
      });
    }

    if (others.length > 0) {
      sections.push({
        id: 'others',
        title: 'Community Members',
        subtitle: 'Active participants across the TalentXcel global network',
        icon: <Users className="h-4 w-4 text-purple-500" />,
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        people: others
      });
    }

    return sections;
  }, [allProfiles, searchTerm, selectedFilter]);

  const handleConnect = async (personId: string, personName: string) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      navigate('/login');
      return;
    }
    if (user.id === personId) {
      toast.info('This is your own profile');
      return;
    }

    try {
      await sendConnectionRequest.mutateAsync({
        recipientId: personId,
        message: `Hi ${personName}, I'd like to connect on TalentXcel!`
      });
      toast.success(`Connection request sent to ${personName}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send request');
    }
  };

  const handleFollow = async (personId: string, personName: string) => {
    if (!user) {
      toast.error('Please sign in to follow professionals');
      navigate('/login');
      return;
    }
    if (user.id === personId) {
      toast.info('This is your own profile');
      return;
    }
    try {
      await supabase.from('user_follows').upsert({
        follower_id: user.id,
        following_id: personId
      });
      toast.success(`You are now following ${personName}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to follow');
    }
  };

  const totalFilteredCount = categorizedSections.reduce((acc, s) => acc + s.people.length, 0);

  return (
    <div className={isEmbedded ? "space-y-4" : "min-h-screen bg-slate-50/50 dark:bg-background/95 py-4 px-3 sm:px-6"}>
      {!isEmbedded && (
        <SEOHead 
          title="Discover Professionals & Career Knowledge · TalentXcel"
          description="Discover ranked verified professionals, expert career guides, and actionable industry insights on TalentXcel."
          canonical="https://talentxcel.in/network/discover"
        />
      )}

      <div className={isEmbedded ? "w-full" : "max-w-7xl mx-auto space-y-4"}>
        {/* TOP DISCOVERY SWITCHER PILLS (PEOPLE vs ARTICLES) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-2 sm:p-2.5 shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSubTabChange('people')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'people'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/50'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Discover People</span>
              <Badge 
                variant={activeSubTab === 'people' ? 'secondary' : 'outline'} 
                className={`text-[10px] font-bold px-1.5 py-0 h-4 ml-1 ${
                  activeSubTab === 'people' ? 'bg-white/20 text-white' : ''
                }`}
              >
                {allProfiles.length || 591}
              </Badge>
            </button>

            <button
              onClick={() => handleSubTabChange('articles')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'articles'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted/50'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Articles &amp; Career Hub</span>
              <Badge 
                variant={activeSubTab === 'articles' ? 'secondary' : 'outline'} 
                className={`text-[10px] font-bold px-1.5 py-0 h-4 ml-1 ${
                  activeSubTab === 'articles' ? 'bg-white/20 text-white' : ''
                }`}
              >
                24 Articles
              </Badge>
            </button>
          </div>

          <span className="text-[11px] text-muted-foreground font-semibold px-2 hidden sm:inline">
            {activeSubTab === 'people' ? 'Ranked member discovery & smart connect' : 'High-authority publications & industry guides'}
          </span>
        </div>

        {/* 1. VIEW MODE: ARTICLES & CAREER CONTENT HUB */}
        {activeSubTab === 'articles' && (
          <div className="w-full">
            <CareerContentHub />
          </div>
        )}

        {/* 2. VIEW MODE: DISCOVER PEOPLE */}
        {activeSubTab === 'people' && (
          <div className="space-y-4">
            {/* People Discovery Header */}
            <div className="text-center space-y-2 py-4 bg-gradient-to-b from-blue-500/10 via-slate-500/5 to-transparent rounded-2xl border border-slate-200/80 dark:border-border/60 p-5 shadow-xs">
              <div className="flex items-center justify-center gap-3 mb-1">
                <TalentXcelLogo iconSize={36} textSize="text-2xl sm:text-3xl font-black" theme="auto" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60">
                  People Discovery
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium">
                Connect with verified professionals, industry leaders, and high-velocity talent across the global network.
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search professionals by name, title, company, skills, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-xs bg-slate-50 dark:bg-muted/40 border-slate-200 dark:border-border/60"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
                      selectedFilter === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-muted/80'
                    }`}
                  >
                    All ({allProfiles.length})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('recent')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
                      selectedFilter === 'recent' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-muted/80'
                    }`}
                  >
                    ⚡ Recent Active
                  </button>
                  <button
                    onClick={() => setSelectedFilter('complete')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
                      selectedFilter === 'complete' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-muted/80'
                    }`}
                  >
                    🛡️ Complete (50%+)
                  </button>
                  <button
                    onClick={() => setSelectedFilter('others')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
                      selectedFilter === 'others' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-muted/80'
                    }`}
                  >
                    👥 Community
                  </button>
                </div>
              </div>
            </div>

            {/* Profiles Ranked Grid */}
            {isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-semibold">Loading ranked professionals...</p>
              </div>
            ) : totalFilteredCount > 0 ? (
              <div className="space-y-5">
                {categorizedSections.map((section) => (
                  <Card key={section.id} className="border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card rounded-2xl overflow-hidden">
                    <CardHeader className="p-3.5 pb-2.5 border-b border-slate-100 dark:border-border/40 bg-slate-50/50 dark:bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-card shadow-2xs">
                            {section.icon}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-foreground tracking-tight flex items-center gap-2">
                              {section.title}
                              <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 ${section.badgeColor}`}>
                                {section.people.length}
                              </Badge>
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
                              {section.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {section.people.map((person) => {
                          const avatarUrl = getStandardAvatarUrl(person.profile_picture_url);
                          const initials = person.full_name
                            ?.split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || 'TX';

                          const profileSlug = (person as any).slug || (person as any).custom_profile_url || person.username || person.id;
                          const profileLink = getPublicProfilePath(profileSlug);

                          return (
                            <div 
                              key={person.id}
                              className="group relative bg-white dark:bg-card hover:bg-slate-50/80 dark:hover:bg-muted/30 border border-slate-200/90 dark:border-border/70 hover:border-blue-500/40 hover:shadow-md rounded-xl p-3.5 flex flex-col justify-between transition-all duration-200"
                            >
                              <div className="text-center space-y-2.5">
                                <Link to={profileLink} className="inline-block relative">
                                  <Avatar className="w-14 h-14 mx-auto ring-2 ring-slate-100 dark:ring-muted group-hover:ring-blue-500/40 transition-all shadow-xs">
                                    {avatarUrl ? (
                                      <AvatarImage src={avatarUrl} alt={person.full_name} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  {person.isRecentActive && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-card rounded-full shadow-2xs" title="Active recently" />
                                  )}
                                </Link>

                                <div className="space-y-1">
                                  <Link 
                                    to={profileLink}
                                    className="font-extrabold text-xs text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                                    title={person.full_name}
                                  >
                                    {person.full_name}
                                  </Link>

                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 font-medium" title={person.title || person.headline || 'TalentXcel Member'}>
                                    {person.title || person.headline || 'TalentXcel Member'}
                                  </p>

                                  {person.current_company && (
                                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                      <Building className="h-2.5 w-2.5 shrink-0 text-slate-400 dark:text-slate-500" />
                                      <span className="truncate">{person.current_company}</span>
                                    </div>
                                  )}

                                  {person.location && (
                                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                      <MapPin className="h-2.5 w-2.5 shrink-0 text-slate-400 dark:text-slate-500" />
                                      <span className="truncate">{person.location}</span>
                                    </div>
                                  )}

                                  {person.skills && person.skills.length > 0 && (
                                    <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                                      {person.skills.slice(0, 2).map((skill, idx) => (
                                        <span 
                                          key={idx}
                                          className="text-[9px] font-semibold bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                      {person.skills.length > 2 && (
                                        <span className="text-[9px] font-semibold text-muted-foreground">
                                          +{person.skills.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-border/60 flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 border-slate-200 dark:border-border cursor-pointer truncate"
                                  onClick={() => navigate(profileLink)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-[11px] h-7 px-2.5 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
                                  onClick={() => handleFollow(person.id, person.full_name)}
                                  title={`Follow ${person.full_name}`}
                                >
                                  Follow
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-[11px] h-7 px-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0 cursor-pointer shadow-2xs"
                                  onClick={() => handleConnect(person.id, person.full_name)}
                                  disabled={sendConnectionRequest.isPending}
                                  title={`Connect with ${person.full_name}`}
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Connect
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border/60">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h3 className="text-sm font-bold text-foreground">No matching professionals found</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Try a different search query or filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
