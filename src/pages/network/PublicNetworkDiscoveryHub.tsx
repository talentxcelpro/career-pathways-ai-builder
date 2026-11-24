import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Briefcase,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Share2,
  ArrowRight,
  MessageSquare,
  Award,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface PublicNetworkDiscoveryHubProps {
  type: 'location' | 'skill' | 'industry' | 'segment';
}

function formatSlugToTitle(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const PublicNetworkDiscoveryHub: React.FC<PublicNetworkDiscoveryHubProps> = ({ type }) => {
  const { slug } = useParams<{ slug: string }>();
  const entitySlug = (slug || '').toLowerCase().trim();
  const entityTitle = formatSlugToTitle(entitySlug);

  // 1. Fetch Inventory Readiness & Indexation Gate from Backend
  const { data: readinessData, isLoading: readinessLoading } = useQuery({
    queryKey: ['network-hub-readiness', type, entitySlug],
    queryFn: async () => {
      if (type === 'location') {
        const { data, error } = await supabase
          .from('growth_geo_cities' as any)
          .select('*')
          .eq('slug', entitySlug)
          .maybeSingle();
        return data as any;
      } else {
        const entityType = type === 'segment' ? 'career_segment' : type;
        const { data, error } = await supabase
          .from('growth_inventory_readiness' as any)
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_slug', entitySlug)
          .maybeSingle();
        return data as any;
      }
    },
    staleTime: 5 * 60 * 1000
  });

  // 2. Fetch Real Consented Professionals
  const { data: professionals, isLoading: prosLoading } = useQuery({
    queryKey: ['network-hub-professionals', type, entitySlug],
    queryFn: async () => {
      let query = supabase
        .from('public_profiles')
        .select('id, full_name, username, headline, location, skills, profile_picture_url, profile_photo_url, verification_status')
        .limit(12);

      if (type === 'location') {
        query = query.ilike('location', `%${entityTitle}%`);
      } else if (type === 'skill') {
        // Look for skill in skills array or title
        query = query.or(`headline.ilike.%${entityTitle}%,title.ilike.%${entityTitle}%`);
      } else if (type === 'industry') {
        query = query.ilike('industry', `%${entityTitle}%`);
      }

      const { data, error } = await query;
      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000
  });

  // 3. Fetch Real Active Jobs
  const { data: activeJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['network-hub-jobs', type, entitySlug],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, job_type, experience_level, created_at')
        .eq('is_active', true)
        .limit(6);

      if (type === 'location') {
        query = query.or(`location_city.ilike.%${entityTitle}%,location.ilike.%${entityTitle}%`);
      } else if (type === 'skill') {
        query = query.ilike('title', `%${entityTitle}%`);
      } else if (type === 'industry') {
        query = query.ilike('industry', `%${entityTitle}%`);
      } else if (type === 'segment') {
        if (entitySlug === 'freshers') {
          query = query.or('is_fresher_eligible.eq.true,experience_level.ilike.%fresher%,title.ilike.%fresher%');
        } else if (entitySlug === 'internships') {
          query = query.or('is_internship.eq.true,job_type.ilike.%intern%,title.ilike.%intern%');
        } else if (entitySlug === 'experienced') {
          query = query.or('experience_level.ilike.%senior%,experience_level.ilike.%lead%');
        }
      }

      const { data, error } = await query;
      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000
  });

  // Canonical and SEO Directives
  const isIndexable = readinessData
    ? (type === 'location' ? readinessData.indexation_gate === 'indexable' : readinessData.is_search_indexable === true)
    : false;

  const robotsDirective = isIndexable ? 'index, follow' : 'noindex, follow';
  const canonicalUrl = `https://talentxcel.in/network/${type === 'segment' ? 'segments' : type + 's'}/${entitySlug}`;
  const pageTitle = `${entityTitle} Professional Network | Connect, Discover & Grow | TalentXcel`;
  const pageDescription = `Discover verified professionals, active job opportunities, and career growth discussions in ${entityTitle} on the TalentXcel Global Professional Network.`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${canonicalUrl}?utm_source=network_share&utm_medium=referral`);
    toast.success('Hub link copied to clipboard!');
  };

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'TalentXcel',
      url: 'https://talentxcel.in'
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://talentxcel.in'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Professional Network',
          item: 'https://talentxcel.in/network'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: entityTitle,
          item: canonicalUrl
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content={robotsDirective} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TalentXcel" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Navigation Breadcrumb */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-slate-500">
            <nav className="flex items-center space-x-1.5 overflow-x-auto">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link to="/network" className="hover:text-primary transition-colors">Network</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{type}s</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{entityTitle}</span>
            </nav>
            <Button variant="ghost" size="sm" onClick={copyShareLink} className="h-7 text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Share Hub
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 via-transparent to-transparent py-10 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="capitalize text-primary border-primary/30">
                    {type === 'location' ? 'Global City Hub' : `${type} Directory`}
                  </Badge>
                  {isIndexable && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                      Verified Active Inventory
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  {entityTitle} Professional Network
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                  Connect with verified professionals, discover career opportunities, and collaborate with talent in {entityTitle}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="default" className="shadow-sm">
                  <Link to={`/network?filter=${encodeURIComponent(entitySlug)}`}>
                    Join {entityTitle} Community
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="default">
                  <Link to="/jobs">
                    Explore Jobs
                  </Link>
                </Button>
              </div>
            </div>

            {/* Real Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-medium">Consented Talent</div>
                <div className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                  {readinessData?.consented_professionals_count || professionals?.length || 0}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-medium">Active Jobs</div>
                <div className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                  {readinessData?.active_jobs_count || activeJobs?.length || 0}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-medium">Discussions</div>
                <div className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                  {readinessData?.discussions_count || 0}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-medium">Network Status</div>
                <div className="text-sm font-semibold mt-1.5 text-emerald-600 dark:text-emerald-400 capitalize">
                  {isIndexable ? 'Verified & Open' : 'Incubating'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
          {/* 1. Verified Professionals Directory */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Verified Professionals in {entityTitle}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Consented public profiles discoverable on TalentXcel</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                <Link to="/network">
                  View Full Network <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {prosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(n => (
                  <Skeleton key={n} className="h-44 w-full rounded-xl" />
                ))}
              </div>
            ) : professionals && professionals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {professionals.map(pro => {
                  const avatarUrl = pro.profile_picture_url || pro.profile_photo_url;
                  const profileLink = pro.username ? `/u/${pro.username}` : `/profile/${pro.id}`;
                  return (
                    <Card key={pro.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4 text-center flex flex-col items-center">
                        <Avatar className="w-16 h-16 mb-3 border-2 border-slate-100 dark:border-slate-800">
                          <AvatarImage src={avatarUrl} alt={pro.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {pro.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-sm truncate max-w-full">{pro.full_name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                          {pro.headline || 'TalentXcel Professional'}
                        </p>
                        {pro.location && (
                          <div className="flex items-center text-[11px] text-slate-400 mt-2 truncate max-w-full">
                            <MapPin className="w-3 h-3 mr-1 shrink-0" />
                            <span className="truncate">{pro.location}</span>
                          </div>
                        )}
                        <Button asChild variant="outline" size="sm" className="w-full mt-4 h-8 text-xs">
                          <Link to={profileLink}>View Profile</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <Users className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold">Be the first professional in {entityTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Create or claim your professional profile on TalentXcel and connect with local industry leaders.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link to="/network">Join TalentXcel Network</Link>
                </Button>
              </div>
            )}
          </div>

          {/* 2. Active Jobs & Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Active Opportunities in {entityTitle}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified hiring requisitions and internships</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                <Link to="/jobs">
                  Search All Jobs <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {jobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(n => (
                  <Skeleton key={n} className="h-36 w-full rounded-xl" />
                ))}
              </div>
            ) : activeJobs && activeJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeJobs.map(job => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold line-clamp-1">{job.title}</CardTitle>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {job.job_type || 'Full-time'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{job.company_name}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                        <span className="truncate">{job.location_city || job.location || 'Remote'}</span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {job.experience_level || 'All levels'}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary p-0">
                          <Link to={`/jobs/${job.id}`}>
                            View Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold">No active jobs in {entityTitle} right now</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Subscribe to job alerts or explore remote opportunities open globally.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/jobs">Browse All Opportunities</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicNetworkDiscoveryHub;
