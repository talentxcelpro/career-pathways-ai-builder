import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain,
  Briefcase,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  Layers,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Search,
  Users,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublicTopicUrl, getPublicJobUrl } from '@/lib/seo/canonicalUrls';
import { buildBreadcrumbSchema, buildWebPageSchema } from '@/lib/seo/structuredDataSchemas';

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
    description: 'Forensic data on 10,250 accredited Indian universities and colleges, tuition-free global programs, government scholarships, and structured 6-step education pathways.',
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
  'resume-writing': {
    title: 'Resume Writing & ATS Optimization',
    tagline: 'ATS Parser Compatibility, Keyword Targeting & Professional Formatting',
    description: 'Master resume optimization strategies to pass applicant tracking systems, eliminate formatting rejections, and target role-specific technical skills.',
    keywords: ['ATS resume tips', 'resume formatting', 'ATS parser compatibility', 'CV optimization'],
    icon: FileText,
  },
  'job-search': {
    title: 'Job Search & Application Strategies',
    tagline: 'Targeted Applications, Hidden Job Markets & Direct Recruiter Outreach',
    description: 'Actionable job search playbooks, compensation benchmarking, company research frameworks, and recruiter outreach strategies.',
    keywords: ['job search strategy', 'finding tech jobs', 'job application tips', 'salary negotiation'],
    icon: Search,
  },
  'interview-preparation': {
    title: 'Interview Preparation & Practice',
    tagline: 'Technical Assessment Drills, Behavioral STAR Frameworks & Voice Practice',
    description: 'Structured mock interview engines, AI-generated role questions, and technical deep-dives to maximize your interview conversion rate.',
    keywords: ['interview preparation', 'STAR method practice', 'technical interview questions', 'mock interview AI'],
    icon: Target,
  },
};

export default function TopicHubPage() {
  const { topicSlug = 'artificial-intelligence' } = useParams<{ topicSlug: string }>();
  const normalizedSlug = topicSlug.toLowerCase().trim();
  const topic = TOPIC_REGISTRY[normalizedSlug] || TOPIC_REGISTRY['artificial-intelligence'];
  const TopicIcon = topic.icon;

  const canonicalUrl = getPublicTopicUrl(normalizedSlug);
  const pageTitle = `${topic.title} | Hub & Intelligence | TalentXcel`;
  const pageDescription = topic.description;

  // 1. Fetch Relevant Active Jobs
  const { data: topicJobs = [] } = useQuery({
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

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://talentxcel.in' },
    { name: 'Topics', url: 'https://talentxcel.in/topics/artificial-intelligence' },
    { name: topic.title, url: canonicalUrl },
  ]);

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

        <script type="application/ld+json">{JSON.stringify(topicSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbsSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-400">Topics</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-semibold">{topic.title}</span>
          </nav>

          {/* Topic Hero Card */}
          <header className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-600 dark:text-blue-400 shrink-0">
                <TopicIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {topic.title}
                </h1>
                <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold">
                  {topic.tagline}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </div>

            {/* Topic Navigation Pills */}
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-semibold mr-1">All Topics:</span>
              {Object.entries(TOPIC_REGISTRY).map(([key, item]) => (
                <Link key={key} to={`/topics/${key}`}>
                  <Badge
                    variant={key === normalizedSlug ? 'default' : 'secondary'}
                    className={`text-xs px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                      key === normalizedSlug
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {item.title.split('&')[0].trim()}
                  </Badge>
                </Link>
              ))}
            </div>
          </header>

          {/* 2 Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Opportunities */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Active Jobs & Roles
                </h2>
                <Link to="/jobs">
                  <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-700 font-semibold gap-1 h-7">
                    View All in Jobs Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {topicJobs.map((job: any) => (
                  <div key={job.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 hover:text-blue-600 transition-colors">
                        {job.title}
                      </div>
                      <div className="text-xs text-blue-600 font-semibold mt-0.5">{job.company_name || 'TalentXcel Services'}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" /> {job.location || 'India'}
                        </span>
                        <span>•</span>
                        <span>{job.employment_type || 'Full-time'}</span>
                      </div>
                    </div>

                    <Link to={`/jobs/${job.seo_slug || job.id}`}>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 font-semibold">
                        View Role
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Topics and Tools */}
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                  Topic Keywords
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topic.keywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-6 text-center space-y-3">
                <Sparkles className="w-7 h-7 text-blue-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Build Your Career Pathway</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Generate an AI-powered education and career roadmap tailored to your specific background and budget.
                </p>
                <Link to="/colleges/career-pathway" className="block pt-1">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8">
                    Generate My Pathway
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
