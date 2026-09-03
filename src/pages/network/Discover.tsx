import React, { useState, useMemo } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getStandardAvatarUrl } from '@/utils/avatarUtils';
import { generatePersonProfileSlug, getPublicProfilePath } from '@/utils/userProfileSlug';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

// Calculate profile completeness score (0-100)
function calculateCompleteness(p: any): number {
  let score = 0;
  // Valid avatar URL
  const avatar = getStandardAvatarUrl(p.profile_picture_url);
  if (avatar) score += 30;
  // Professional title or headline
  if (p.title && p.title.trim().length > 2) score += 20;
  else if (p.headline && p.headline.trim().length > 2) score += 15;
  // Bio / about
  if (p.about && p.about.trim().length >= 20) score += 20;
  else if (p.about && p.about.trim().length > 0) score += 10;
  // Location
  if (p.location && p.location.trim().length > 1) score += 15;
  // Skills
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 15;
  return score;
}

export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendConnectionRequest, isSending } = useConnectionRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'complete' | 'others'>('all');

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

      // Process and score every profile
      const scored: ProfileRecord[] = (data || [])
        .filter(p => p.full_name && p.full_name.trim().length >= 2 && p.full_name.toLowerCase() !== 'user')
        .map(p => {
          const completeness = calculateCompleteness(p);
          const updateTime = p.updated_at ? new Date(p.updated_at).getTime() : 0;
          const hoursSinceUpdate = updateTime > 0 ? (now - updateTime) / (1000 * 60 * 60) : 999999;
          
          // Recent active: updated within the last 14 days (336 hours)
          const isRecentActive = hoursSinceUpdate <= 336;
          // Complete: completeness score >= 50%
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

  // Filter and prioritize profiles: 1) Recent Active -> 2) Complete Profile -> 3) Others
  const categorizedSections: PeopleSection[] = useMemo(() => {
    let filtered = allProfiles;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.full_name.toLowerCase().includes(term) ||
        (p.title && p.title.toLowerCase().includes(term)) ||
        (p.headline && p.headline.toLowerCase().includes(term)) ||
        (p.current_company && p.current_company.toLowerCase().includes(term)) ||
        (p.location && p.location.toLowerCase().includes(term))
      );
    }

    // TIER 1: Recent Active (sorted by hoursSinceUpdate ASC, then completeness DESC)
    const recentActive = filtered
      .filter(p => p.isRecentActive)
      .sort((a, b) => a.hoursSinceUpdate - b.hoursSinceUpdate || b.completenessScore - a.completenessScore);

    // TIER 2: Complete Profiles (not already in recent active, sorted by completeness DESC)
    const recentIds = new Set(recentActive.map(p => p.id));
    const completeProfiles = filtered
      .filter(p => !recentIds.has(p.id) && p.isComplete)
      .sort((a, b) => b.completenessScore - a.completenessScore);

    // TIER 3: Others (all remaining profiles)
    const usedIds = new Set([...recentActive.map(p => p.id), ...completeProfiles.map(p => p.id)]);
    const otherProfiles = filtered
      .filter(p => !usedIds.has(p.id))
      .sort((a, b) => b.completenessScore - a.completenessScore);

    if (selectedFilter === 'recent') {
      return [
        {
          id: 'recent-active',
          title: 'Recently Active Professionals',
          subtitle: 'Active members on TalentXcel with recent engagement and career updates',
          icon: <Zap className="h-4 w-4 text-emerald-600 animate-pulse" />,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
          people: recentActive
        }
      ];
    }

    if (selectedFilter === 'complete') {
      return [
        {
          id: 'complete-profiles',
          title: 'Complete Standout Profiles',
          subtitle: 'Verified complete profiles with detailed backgrounds, credentials, and portfolios',
          icon: <Star className="h-4 w-4 text-amber-500 fill-amber-500" />,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
          people: completeProfiles
        }
      ];
    }

    if (selectedFilter === 'others') {
      return [
        {
          id: 'community-talents',
          title: 'Community Network',
          subtitle: 'Growing talent network and rising industry specialists',
          icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
          people: otherProfiles
        }
      ];
    }

    // Default 'all': Render Tier 1 (Recent Active) -> Tier 2 (Complete) -> Tier 3 (Others)
    const sections: PeopleSection[] = [];

    if (recentActive.length > 0) {
      sections.push({
        id: 'recent-active',
        title: 'Recently Active Professionals',
        subtitle: 'Members active on TalentXcel with live platform updates and engagements',
        icon: <Zap className="h-4 w-4 text-emerald-600 animate-pulse" />,
        badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
        people: recentActive
      });
    }

    if (completeProfiles.length > 0) {
      sections.push({
        id: 'complete-profiles',
        title: 'Complete Standout Profiles',
        subtitle: 'Verified complete profiles with detailed career histories, skills, and credentials',
        icon: <Star className="h-4 w-4 text-amber-500 fill-amber-500" />,
        badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
        people: completeProfiles
      });
    }

    if (otherProfiles.length > 0) {
      sections.push({
        id: 'community-talents',
        title: 'Rising Community Talents',
        subtitle: 'Emerging professionals and connecting specialists across various industries',
        icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
        badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
        people: otherProfiles
      });
    }

    return sections;
  }, [allProfiles, searchTerm, selectedFilter]);

  const handleConnect = async (personId: string, personName: string) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      navigate('/auth/login');
      return;
    }
    if (user.id === personId) {
      toast.info("That's your own profile!");
      return;
    }
    try {
      await sendConnectionRequest({ recipientId: personId });
      toast.success(`Connection request sent to ${personName}!`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send request');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 mb-2">
                <Users className="h-3.5 w-3.5" />
                Live Professional Directory
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Discover Professionals
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Connect with industry leaders, active talents, and verified specialists. Ranked dynamically by recent platform activity and profile completeness.
              </p>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className="text-xs h-8 rounded-xl"
              >
                All Ranked
              </Button>
              <Button
                variant={selectedFilter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('recent')}
                className="text-xs h-8 rounded-xl gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Recently Active
              </Button>
              <Button
                variant={selectedFilter === 'complete' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('complete')}
                className="text-xs h-8 rounded-xl gap-1"
              >
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                Complete Profiles
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search professionals by name, title, current company, or location..." 
              className="pl-10 h-10 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* Categories / Ranked Sections */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse rounded-2xl border bg-white dark:bg-slate-900">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="p-4 border rounded-xl space-y-3 bg-muted/10">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categorizedSections && categorizedSections.length > 0 ? (
          <div className="space-y-8">
            {categorizedSections.map((section, sectionIdx) => (
              <Card key={section.id} className="border rounded-2xl shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="pb-4 border-b bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${section.badgeColor} font-bold text-xs py-0.5 px-2.5 rounded-lg flex items-center gap-1.5`}>
                          {section.icon}
                          {section.title}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-semibold">
                          ({section.people.length} members)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {section.people.map((person) => {
                      const avatarUrl = getStandardAvatarUrl(person.profile_picture_url);
                      const targetSlug = person.slug || person.custom_profile_url || generatePersonProfileSlug(person.full_name);
                      const profileLink = getPublicProfilePath(targetSlug);
                      
                      const initials = (person.full_name || 'U')
                        .split(' ')
                        .filter(Boolean)
                        .map(n => n.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join('');

                      return (
                        <div 
                          key={person.id} 
                          className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between"
                        >
                          {/* Active / Complete Indicators */}
                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            {person.isRecentActive && (
                              <span 
                                title="Active recently on TalentXcel"
                                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            )}
                            {person.completenessScore >= 80 && (
                              <span 
                                title={`${person.completenessScore}% profile complete`}
                                className="inline-flex items-center text-amber-500"
                              >
                                <Star className="h-3 w-3 fill-amber-500" />
                              </span>
                            )}
                          </div>

                          <div className="text-center space-y-3 pt-1">
                            {/* Avatar */}
                            <Link to={profileLink} className="inline-block relative">
                              <Avatar className="w-16 h-16 mx-auto ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all shadow-xs">
                                {avatarUrl ? (
                                  <AvatarImage src={avatarUrl} alt={person.full_name} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            
                            {/* Info */}
                            <div className="space-y-1">
                              <Link 
                                to={profileLink}
                                className="font-bold text-sm text-foreground hover:text-blue-600 transition-colors block truncate"
                                title={person.full_name}
                              >
                                {person.full_name}
                              </Link>

                              <p className="text-xs text-muted-foreground line-clamp-1 font-medium" title={person.title || person.headline || 'Professional'}>
                                {person.title || person.headline || 'Professional'}
                              </p>

                              {person.current_company && (
                                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/80 truncate">
                                  <Building className="h-3 w-3 shrink-0 text-slate-400" />
                                  <span className="truncate">{person.current_company}</span>
                                </div>
                              )}

                              {person.location && (
                                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/80 truncate">
                                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                  <span className="truncate">{person.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-8 rounded-lg font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                              onClick={() => navigate(profileLink)}
                            >
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs h-8 px-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0"
                              onClick={() => handleConnect(person.id, person.full_name)}
                              disabled={isSending}
                              title={`Connect with ${person.full_name}`}
                            >
                              <UserPlus className="h-3.5 w-3.5" />
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
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border">
            <div className="mx-auto mb-4 p-4 bg-muted/30 rounded-full w-fit">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">No matching professionals found</h3>
            <p className="text-muted-foreground text-xs max-w-sm mx-auto">
              Try adjusting your search terms or view all ranked profiles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;