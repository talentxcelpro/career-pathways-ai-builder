import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain,
  Briefcase,
  GraduationCap,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Layers,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublicTopicUrl, getPublicJobUrl } from '@/lib/seo/canonicalUrls';

interface TopicDefinition {
  title: string;
  tagline: string;
  description: string;
  keywords: string[];
  icon: any;
}

const TOPIC_REGISTRY: Record<string, TopicDefinition> = {
  'artificial-intelligence': {
    title: 'Artificial Intelligence & Machine Learning',
    tagline: 'AI Product Intelligence, Engineering Roles & Autonomous Career Architecture',
    description: 'Explore AI career pathways, machine learning job opportunities, verified competencies, and real-time product leaderboards shaping the artificial intelligence workforce in India and globally.',
    keywords: ['AI recruitment', 'machine learning jobs', 'AI career operating system', 'AI leaderboards', 'AI engineering'],
    icon: Brain,
  },
  'recruitment': {
    title: 'Recruitment & Talent Acquisition',
    tagline: 'Strategic Sourcing, Candidate Matching & Executive Staffing Solutions',
    description: 'Discover modern talent acquisition strategies, recruitment process outsourcing (RPO), verified candidate benchmarking, and corporate hiring intelligence on TalentXcel.',
    keywords: ['recruitment platform', 'talent acquisition', 'RPO services', 'technical hiring', 'staffing agency'],
    icon: Briefcase,
  },
  'careers': {
    title: 'Career Roadmaps & Professional Growth',
    tagline: 'Skill Benchmarks, Career Passports & Verified Growth Pathways',
    description: 'Navigate modern career transitions with ATS resume optimization, psychometric matching, verifiable skill credentials, and customized milestones.',
    keywords: ['career pathways', 'ATS resume builder', 'career passport', 'job matching', 'interview prep'],
    icon: TrendingUp,
  },
  'education': {
    title: 'Higher Education & Degree Intelligence',
    tagline: '10,250 Verified Institutions, Global Scholarships & Degree Pathways',
    description: 'Forensic data on 10,250 accredited Indian universities and colleges, €0 tuition European programs, government scholarships, and structured 6-step education pathways.',
    keywords: ['Indian colleges data', 'AISHE colleges', 'global degree programs', 'tuition free scholarships', 'education pathway'],
    icon: GraduationCap,
  },
  'technology': {
    title: 'Technology & Software Engineering',
    tagline: 'Full-Stack Systems, Cloud Architecture & Tech Career Milestones',
    description: 'Discover software engineering vacancies, systems design guides, technical assessment frameworks, and developer career intelligence on TalentXcel.',
    keywords: ['software developer jobs', 'fullstack engineer', 'cloud architecture', 'tech hiring', 'coding skills'],
    icon: Layers,
  },
  'leadership': {
    title: 'Leadership & Executive Management',
    tagline: 'Executive Search, Strategic Workforce Planning & Organizational Culture',
    description: 'Strategic intelligence on leadership development, C-level executive hiring, corporate talent mobility, and executive career opportunities.',
    keywords: ['executive search', 'leadership coaching', 'workforce management', 'organizational performance'],
    icon: ShieldCheck,
  },
  'business': {
    title: 'Business Strategy & Workforce Operations',
    tagline: 'Enterprise Transformation, Commercial Staffing & Market Intelligence',
    description: 'Explore business operations roles, strategic consulting, commercial talent pipelines, and enterprise scaling solutions on TalentXcel.',
    keywords: ['business strategy', 'staffing solutions', 'B2B sales jobs', 'enterprise recruitment'],
    icon: FileText,
  },
};

export default function TopicHubPage() {
  const { slug = 'artificial-intelligence' } = useParams<{ slug: string }>();
  const normalizedSlug = slug.toLowerCase().trim();
  const topic = TOPIC_REGISTRY[normalizedSlug] || TOPIC_REGISTRY['artificial-intelligence'];
  const TopicIcon = topic.icon;

  const canonicalUrl = getPublicTopicUrl(normalizedSlug);
  const pageTitle = `${topic.title} — Career Insights, Jobs & Guides | TalentXcel`;
  const pageDescription = topic.description;

  // 1. Fetch Related Jobs
  const { data: relatedJobs = [] } = useQuery({
    queryKey: ['topic-jobs', normalizedSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .limit(6);
      return data || [];
    },
  });

  // 2. Fetch Related Posts
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['topic-posts', normalizedSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, author:profiles(id, full_name, username, title)')
        .order('created_at', { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  const topicSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.title,
    description: topic.description,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'TalentXcel',
      url: 'https://talentxcel.in',
    },
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

        <script type="application/ld+json">
          {JSON.stringify(topicSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-500">Topics</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium">{topic.title}</span>
          </nav>

          {/* Topic Hero Header */}
          <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-400">
                <TopicIcon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {topic.title}
                </h1>
                <p className="text-blue-400 text-sm font-medium">
                  {topic.tagline}
                </p>
                <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </div>

            {/* Other Topics Pills */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1">Explore Topics:</span>
              {Object.entries(TOPIC_REGISTRY).map(([key, item]) => (
                <Link key={key} to={`/topics/${key}`}>
                  <Badge
                    variant={key === normalizedSlug ? 'default' : 'outline'}
                    className={key === normalizedSlug ? 'bg-blue-600 text-white' : 'border-slate-800 text-slate-400 hover:text-white'}
                  >
                    {item.title.split('&')[0].trim()}
                  </Badge>
                </Link>
              ))}
            </div>
          </header>

          {/* Main Grid: Jobs & Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Jobs & Opportunities */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" /> Active Roles in {topic.title.split('&')[0].trim()}
                  </h2>
                  <Link to="/jobs" className="text-xs text-blue-400 hover:underline">
                    View All Jobs &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {relatedJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={getPublicJobUrl(job.seo_slug || job.id).replace('https://talentxcel.in', '')}
                      className="p-4 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all block group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                            <span>{job.company_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-700 text-xs">
                          Apply
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Community Insights */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" /> Topic Discussions
                </h2>
                <div className="space-y-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all block group"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                        {post.author?.full_name || 'Member'}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {post.content}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
