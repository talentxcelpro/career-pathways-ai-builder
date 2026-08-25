import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  Trophy,
  Code,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Share2,
  ExternalLink,
  MessageSquare,
  FileText,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntity, useEntityListings, useRankingHistory } from '@/hooks/useClaim1';
import { getPublicCompanyUrl, getPublicJobUrl, getPublicPostUrl } from '@/lib/seo/canonicalUrls';

export default function CompanyPublicProfile() {
  const { slug = 'talentxcel' } = useParams<{ slug: string }>();
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Fetch Claim #1 Leaderboard Entity
  const { data: entity, isLoading: entityLoading } = useEntity(normalizedSlug);
  const { data: listings = [] } = useEntityListings(entity?.id);

  // 2. Fetch Public Jobs for this Company
  const { data: publicJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['company-public-jobs', normalizedSlug],
    queryFn: async () => {
      const isTalentXcel = normalizedSlug.includes('talentxcel');
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .eq('job_status', 'open');

      if (isTalentXcel) {
        query = query.ilike('company_name', '%TalentXcel%');
      } else {
        query = query.ilike('company_name', `%${normalizedSlug}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) return [];
      return data || [];
    },
  });

  // 3. Fetch Public Posts from the Company / Team
  const { data: companyPosts = [] } = useQuery({
    queryKey: ['company-public-posts', normalizedSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(id, full_name, username, title, profile_picture_url)')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) return [];
      return data || [];
    },
  });

  const isTalentXcel = normalizedSlug.includes('talentxcel');
  const companyName = entity?.name || (isTalentXcel ? 'TalentXcel Services' : normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  const tagline = entity?.tagline || (isTalentXcel ? 'AI-Powered Career OS & Strategic Talent Solutions' : `${companyName} on TalentXcel`);
  const canonicalUrl = getPublicCompanyUrl(normalizedSlug);
  const websiteUrl = entity?.website_url || (isTalentXcel ? 'https://talentxcel.in' : undefined);
  const city = entity?.city || 'Noida';
  const countryName = entity?.country_name || 'India';

  const pageTitle = `${companyName} — AI Talent Platform, Jobs & Strategic Solutions | TalentXcel`;
  const pageDescription = entity?.description || (isTalentXcel
    ? 'TalentXcel Services is an AI-powered talent operating system connecting verified job seekers, students, and employers with intelligent job matching, ATS resume intelligence, higher education pathways, and corporate staffing solutions.'
    : `Explore ${companyName} on TalentXcel. View active job openings, company intelligence, team updates, and verified credentials.`);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    url: canonicalUrl,
    logo: 'https://talentxcel.in/talentxcel-official-logo.png',
    description: pageDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    sameAs: websiteUrl ? [websiteUrl] : ['https://talentxcel.in'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://talentxcel.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Companies',
        item: 'https://talentxcel.in/companies',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: companyName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://talentxcel.in/talentxcel-official-logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/companies" className="hover:text-white transition-colors">Companies</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium">{companyName}</span>
          </nav>
        </div>

        {/* Hero Header */}
        <header className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20 border border-blue-400/30">
                  {companyName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {companyName}
                    </h1>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 text-xs py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Entity
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1.5 text-base font-medium max-w-2xl leading-relaxed">
                    {tagline}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {city}, {countryName}
                    </span>
                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" /> {websiteUrl.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {entity?.company_size || 'Technology Organization'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
                <Link to="/jobs" className="flex-1 md:flex-initial">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-md shadow-blue-600/20">
                    <Briefcase className="w-4 h-4" /> View Open Jobs
                  </Button>
                </Link>
                <Link to="/services" className="flex-1 md:flex-initial">
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-200">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>

            {/* Leaderboard Position Banner (if registered) */}
            {listings.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap bg-blue-950/20 p-4 rounded-xl border border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Global AI Leaderboard Position</div>
                    <div className="text-sm font-semibold text-white">
                      Rank #{listings[0].current_rank} • {listings[0].scope?.name || 'AI Products'}
                    </div>
                  </div>
                </div>
                <Link to="/rankings/ai-products">
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                    View Live Board <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Core Company Intelligence */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> About {companyName}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {pageDescription}
              </p>

              {isTalentXcel && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" /> AI Career Operating System
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Equipping job seekers and professionals with ATS resume scoring, psychometric matching, and intelligent career roadmaps.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-400" /> Strategic Talent Acquisition
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Delivering full-lifecycle recruitment, RPO solutions, executive search, and technology staffing for fast-growing enterprises.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Strategic Pillars & Services */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Core Solutions & Capabilities
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">AI-Powered Recruitment & Matching</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Algorithmic skill matching, verified competency checks, and pre-screened technical candidate pipelines that compress time-to-hire.
                      </p>
                    </div>
                    <Link to="/services/ai-recruitment">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                        Learn More <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">Corporate Staffing & RPO Services</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        End-to-end talent outsourcing, contract-to-hire staffing, and dedicated technical recruiter augmentation.
                      </p>
                    </div>
                    <Link to="/services/staffing-recruitment">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                        Learn More <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">Higher Education & College Pathway Intelligence</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Forensic data across 10,250 Indian institutions, global scholarship directory, and 6-step AI education pathway maps.
                      </p>
                    </div>
                    <Link to="/colleges">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                        Learn More <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Active Job Openings */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" /> Active Job Openings ({publicJobs.length})
                </h2>
                <Link to="/jobs" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                  All Jobs <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {publicJobs.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No open job postings at this time.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {publicJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={getPublicJobUrl(job.seo_slug || job.id).replace('https://talentxcel.in', '')}
                      className="p-4 bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all block group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location || 'Noida, India'}
                            </span>
                            <Badge variant="outline" className="text-slate-300 border-slate-700 text-[10px] py-0">
                              {job.employment_type || 'Full-time'}
                            </Badge>
                            {job.salary_min && (
                              <span className="text-emerald-400 font-medium">
                                ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{((job.salary_max || job.salary_min) / 100000).toFixed(1)}L PA
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-700 text-xs shrink-0">
                          View & Apply
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Public Posts & Updates */}
            {companyPosts.length > 0 && (
              <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" /> Public Updates & Insights
                  </h2>
                  <Link to="/network" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    Feed <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {companyPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="p-4 bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 rounded-xl transition-all block group"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-white text-xs font-bold">
                          {post.author?.full_name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                            {post.author?.full_name || 'TalentXcel Team'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {post.author?.title || 'Professional'} • {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Quick Facts & Verification Details */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Organization Intelligence</h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Legal Entity</span>
                  <span className="font-medium text-white">TalentXcel Services Pvt Ltd</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Headquarters</span>
                  <span className="font-medium text-white">{city}, {countryName}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Industry</span>
                  <span className="font-medium text-white">HR Tech & AI Software</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Platform Origin</span>
                  <span className="font-medium text-white">https://talentxcel.in</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verification</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                    Verified Provider
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/40 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Partner with TalentXcel</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Accelerate technical hiring or connect your educational institution to our AI career intelligence network.
              </p>
              <div className="space-y-2">
                <Link to="/employer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs">
                    Employer Recruitment Portal
                  </Button>
                </Link>
                <Link to="/colleges/pathway">
                  <Button variant="outline" className="w-full border-slate-700 text-xs text-slate-300 hover:bg-slate-800">
                    Institution Career OS
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
