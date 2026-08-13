import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { SEOJobsBreadcrumb } from '@/components/seo/SEOJobsBreadcrumb';
import { JobsFilterSidebar } from '@/components/jobs/JobsFilterSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCta } from '@/config/ctaSystem';
import { trackDiscoveryPageView, trackCtaClick } from '@/utils/growthTelemetry';
import { JOB_CATEGORIES } from '@/utils/jobCategories';
import { LOCATION_HUBS, INDUSTRY_HUBS } from '@/config/publicIA';
import {
  ArrowRight, Briefcase, Sparkles, UserCheck, ShieldCheck, BookOpen,
  TrendingUp, Award, Building2, MapPin, CheckCircle2, GraduationCap,
  FileText, HelpCircle, Layers, Compass, ChevronRight, Zap
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  description: string;
  posted_at: string;
  external_url?: string;
  seo_slug?: string;
}

// ─── Taxonomy & Role Intelligence Resolvers ────────────────────────────────

interface CategoryMatch {
  name: string;
  roles: string[];
  skills: string[];
  overview: string;
  deliverables: string[];
  aiImpact: string;
}

function resolveRoleCategory(roleSlug: string): CategoryMatch {
  const cleanSlug = roleSlug.toLowerCase().replace(/[\s_-]+/g, '');

  for (const catKey of Object.keys(JOB_CATEGORIES)) {
    const cat = (JOB_CATEGORIES as any)[catKey];
    if (!cat || !cat.roles) continue;

    const matched = cat.roles.some((r: string) => {
      const cleanR = r.toLowerCase().replace(/[\s_-]+/g, '');
      return cleanSlug.includes(cleanR) || cleanR.includes(cleanSlug);
    });

    if (matched) {
      return {
        name: cat.name,
        roles: cat.roles,
        skills: cat.skills,
        overview: `${cat.name} professionals design, implement, and maintain critical organizational systems, workflows, and solutions.`,
        deliverables: [
          'Domain execution & project delivery',
          'Cross-functional stakeholder collaboration',
          'Quality assurance, compliance & performance optimization',
          'Process improvement & workflow automation',
        ],
        aiImpact: `AI tools and automation are accelerating baseline tasks in ${cat.name.toLowerCase()}, shifting high-value focus toward strategic problem solving, architecture design, and human-in-the-loop decision making.`,
      };
    }
  }

  // Default fallback for any custom role
  return {
    name: 'Professional Services',
    roles: ['Software Engineer', 'Data Analyst', 'Product Manager', 'HR Manager'],
    skills: ['Problem Solving', 'Project Execution', 'Strategic Communication', 'Data Analysis', 'Domain Management'],
    overview: 'Specialized professionals drive operational excellence, product innovation, and business growth across enterprise functions.',
    deliverables: [
      'Structured execution of operational roadmaps',
      'Stakeholder alignment & performance tracking',
      'Quality standards enforcement & risk mitigation',
    ],
    aiImpact: 'AI-assisted tools are augmenting research, documentation, and analysis, enabling professionals to execute complex projects faster.',
  };
}

function getCareerLadder(roleDisplay: string) {
  return [
    {
      stage: 'Junior / Entry Level',
      exp: '0 – 2 Years',
      focus: `Foundational execution, tool mastery, bug fixes/task completion, learning team standards under guidance.`,
      keySkills: ['Core Tool Proficiency', 'Task Execution', 'Documentation'],
    },
    {
      stage: 'Mid-Level Specialist',
      exp: '2 – 5 Years',
      focus: `Independent feature/project ownership, code/process optimization, technical reviews, and cross-functional coordination.`,
      keySkills: ['Module Ownership', 'Code/Process Optimization', 'Peer Mentoring'],
    },
    {
      stage: 'Senior Lead / Specialist',
      exp: '5 – 8 Years',
      focus: `Architecture & workflow design, strategic decision making, performance tuning, and mentoring junior team members.`,
      keySkills: ['Architecture Design', 'System Performance', 'Technical Mentorship'],
    },
    {
      stage: 'Principal / Lead Manager',
      exp: '8+ Years',
      focus: `Departmental strategy, enterprise alignment, resource planning, and high-impact organizational leadership.`,
      keySkills: ['Strategic Roadmap', 'Enterprise Leadership', 'Resource Optimization'],
    },
  ];
}

function resolveCityHub(citySlug: string) {
  const cleanSlug = citySlug.toLowerCase().replace(/[\s_-]+/g, '-');

  const hub = LOCATION_HUBS.find((l) => l.slug === cleanSlug || l.aliases.some((a) => a.toLowerCase().replace(/[\s_-]+/g, '-') === cleanSlug));
  if (hub) return hub;

  const cityDisplay = citySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    slug: citySlug,
    name: cityDisplay,
    aliases: [],
    state: cityDisplay,
    intro: `${cityDisplay} is an important commercial and employment center with growing technology, business services, and enterprise employers.`,
    sectors: ['Information Technology', 'Enterprise Services', 'Healthcare', 'Banking & Finance'],
  };
}

// ─── Main Mini Career Hub Component ──────────────────────────────────────────

export const JobsByRoleCity: React.FC = () => {
  const { role, city } = useParams<{ role: string; city: string }>();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Check misrouted UUID job URLs
  useEffect(() => {
    if (role && city) {
      const combinedSlug = `${role}-${city}`;
      const hasUuidPattern = /[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/i.test(combinedSlug);
      const isLongSlug = combinedSlug.length > 50;
      const hasUuidSuffix = /[a-f0-9]{8}$/i.test(city || '');

      if (hasUuidPattern || isLongSlug || hasUuidSuffix) {
        navigate(`/job/${combinedSlug}`, { replace: true });
        return;
      }
    }
  }, [role, city, navigate]);

  const roleSlug = role || 'software-engineer';
  const citySlug = city || 'bangalore';

  const roleDisplay = roleSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const cityHub = resolveCityHub(citySlug);
  const cityDisplay = cityHub.name;

  const catInfo = resolveRoleCategory(roleSlug);
  const careerLadder = getCareerLadder(roleDisplay);

  useEffect(() => {
    if (!role || !city) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const searchRole = role.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');

        const { data, error: fetchErr, count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`)
          .ilike('location', `%${searchCity}%`)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        if (fetchErr) throw fetchErr;

        setJobs(data || []);
        setTotalCount(count || 0);

        trackDiscoveryPageView({
          page_type: 'RoleLocationDiscovery',
          role_slug: role,
          city_slug: city,
        });
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Unable to load jobs at this time');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [role, city]);

  // SEO Metadata — WebPage / Occupation Schema (No fake JobPosting when 0 jobs exist)
  const pageTitle = `${roleDisplay} Careers, Skills & Opportunities in ${cityDisplay} | TalentXcel`;
  const pageDescription = `Explore ${roleDisplay} career paths, required skills, ATS resume guides, interview prep, and hiring market context in ${cityDisplay} on TalentXcel.`;
  const canonicalUrl = `https://talentxcel.in/jobs/${roleSlug}/${citySlug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://talentxcel.in' },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://talentxcel.in/jobs' },
      { '@type': 'ListItem', position: 3, name: roleDisplay, item: `https://talentxcel.in/roles/${roleSlug}` },
      { '@type': 'ListItem', position: 4, name: `${roleDisplay} in ${cityDisplay}`, item: canonicalUrl },
    ],
  };

  const occupationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: roleDisplay,
    description: `${roleDisplay} career opportunities, required skills, and employment ecosystem context in ${cityDisplay}.`,
    occupationLocation: {
      '@type': 'City',
      name: cityDisplay,
    },
    skills: catInfo.skills.slice(0, 8).join(', '),
    mainEntityOfPage: canonicalUrl,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const roleCta = getCta('RoleLocationDiscovery');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${roleDisplay} jobs, ${cityDisplay} jobs, ${roleDisplay} skills, ${cityDisplay} career ecosystem, ${roleDisplay} resume guide`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(occupationSchema)}</script>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Breadcrumb */}
        <SEOJobsBreadcrumb role={roleDisplay} city={cityDisplay} />

        {/* Page Header */}
        <header className="space-y-4 border-b border-border pb-8">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs uppercase tracking-wide">
              {catInfo.name}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-xs gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              {cityDisplay}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {roleDisplay} Careers & Opportunities in {cityDisplay}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            {catInfo.overview} Explore key skills hiring managers seek, career progression milestones, resume guidelines, and interview preparation for {roleDisplay} roles in {cityDisplay}.
          </p>

          {totalCount > 0 && (
            <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-semibold">
              <Briefcase className="w-4 h-4" />
              <span>{totalCount} Active Openings Currently Listed in {cityDisplay}</span>
            </div>
          )}
        </header>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <JobsFilterSidebar
                role={role}
                city={city}
                onFiltersChange={(filters) => {
                  console.log('Filters updated:', filters);
                }}
              />
            </div>

            {/* Main Discovery Body */}
            <div className="lg:col-span-3 space-y-10">
              {/* Active Jobs Listings (if any exist) */}
              {jobs.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Live {roleDisplay} Openings in {cityDisplay}
                    </h2>
                    <span className="text-xs text-muted-foreground">{jobs.length} roles</span>
                  </div>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 1 — ROLE OVERVIEW & EVOLUTION ────────────────── */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Compass className="w-5 h-5 text-primary" />
                    1. {roleDisplay} Role Overview & Industry Evolution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {roleDisplay} professionals play a vital role in {catInfo.name.toLowerCase()} initiatives, taking responsibility for end-to-end execution, solution design, and continuous optimization.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Core Deliverables
                      </h4>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {catInfo.deliverables.map((del, dIdx) => (
                          <li key={dIdx}>• {del}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI & Automation Impact
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {catInfo.aiImpact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── SECTION 2 — CAREER PROGRESSION LADDER ──────────────── */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    2. {roleDisplay} Career Progression Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Career growth in {roleDisplay} roles typically progresses across four structured capability milestones:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {careerLadder.map((step, sIdx) => (
                      <div key={sIdx} className="p-4 border border-border/60 rounded-xl bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Stage {sIdx + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {step.exp}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{step.stage}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.focus}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {step.keySkills.map((ks, kIdx) => (
                            <Badge key={kIdx} variant="secondary" className="text-[10px]">
                              {ks}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── SECTION 3 — SKILLS FOR THIS ROLE ───────────────────── */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    3. Essential Skills Employers Seek for {roleDisplay}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Hiring managers in {cityDisplay} evaluate candidates on technical proficiency, domain knowledge, and problem-solving capability:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {catInfo.skills.map((skill, skIdx) => {
                      const skillSlug = skill.toLowerCase().replace(/[\s/]+/g, '-');
                      return (
                        <Link key={skIdx} to={`/skills/${skillSlug}`}>
                          <Badge
                            variant="outline"
                            className="px-3 py-1.5 hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer text-xs font-medium gap-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-primary" />
                            {skill}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="pt-2">
                    <Button asChild variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary">
                      <Link to="/skills">
                        Explore All Verified Skill Hubs
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ── SECTION 4 & 5 — CITY ECOSYSTEM & ROLE-LOCATION CONNECT ─ */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Building2 className="w-5 h-5 text-primary" />
                    4. {cityDisplay} Career Ecosystem & Hiring Market
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {cityHub.intro}
                  </p>
                  <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      Dominant Hiring Sectors in {cityDisplay}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cityHub.sectors.map((sec, secIdx) => (
                        <Badge key={secIdx} variant="secondary" className="text-xs">
                          {sec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
                    <strong>{roleDisplay} in {cityDisplay}:</strong> Professionals in {cityDisplay} benefit from high concentrations of enterprise employers, GCC innovation hubs, and fast-growing technology companies. Candidates with verified skills are actively evaluated for competitive opportunities.
                  </p>
                </CardContent>
              </Card>

              {/* ── SECTION 6 & 7 — RESUME & INTERVIEW ACTION CENTERS ────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resume Action Center */}
                <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Resume Action Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Optimize your resume for {roleDisplay} roles in {cityDisplay}. Include high-intent ATS keywords, quantifiable impact metrics, and verified skills.
                    </p>
                    <ul className="text-xs space-y-1.5 text-foreground font-medium">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        ATS keyword density checklist
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        Action verbs & impact metrics
                      </li>
                    </ul>
                    <div className="pt-2 space-y-2">
                      <Button asChild size="sm" className="w-full font-semibold text-xs gap-1.5">
                        <Link to="/public/resume-builder">
                          Build ATS-Friendly Resume
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Link
                        to={`/resources/${roleSlug}-resume-guide`}
                        className="block text-center text-xs text-primary hover:underline font-medium"
                      >
                        Read {roleDisplay} Resume Guide →
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Action Center */}
                <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      Interview Action Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Prepare for {roleDisplay} interviews with structured behavioral framing (STAR method), technical question banks, and case study breakdowns.
                    </p>
                    <ul className="text-xs space-y-1.5 text-foreground font-medium">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        Technical & domain question bank
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        STAR answer framework generator
                      </li>
                    </ul>
                    <div className="pt-2 space-y-2">
                      <Button asChild variant="outline" size="sm" className="w-full font-semibold text-xs gap-1.5 border-primary/30">
                        <Link to="/tools/interview-prep">
                          Prepare for Your Interview
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Link
                        to={`/resources/${roleSlug}-interview-questions`}
                        className="block text-center text-xs text-primary hover:underline font-medium"
                      >
                        Read Top {roleDisplay} Questions →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── SECTION 8 & 9 — LEARNING & CAREER PASSPORT ──────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Learning Path */}
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Learning & Skill Acquisition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bridge your skill gaps in {catInfo.name} with curated learning courses and hands-on skill verification.
                    </p>
                    <Button asChild variant="secondary" size="sm" className="w-full text-xs font-semibold gap-1">
                      <Link to="/learning">
                        Explore TalentXcel Learning Courses
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Career Passport */}
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      TalentXcel Career Passport
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Present your verified identity, credentials, skills, and work history directly to hiring managers in {cityDisplay}.
                    </p>
                    <Button asChild size="sm" className="w-full text-xs font-semibold gap-1">
                      <Link to="/passport">
                        Create Your Career Passport
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* ── SECTION 10 — CENTRALIZED DISCOVERY CTA ─────────────── */}
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 overflow-hidden">
                <CardContent className="p-6 md:p-8 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    <Zap className="w-3.5 h-3.5" />
                    Career Acceleration in {cityDisplay}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {roleCta.headline ?? `Get Discovered by Top ${cityDisplay} Employers`}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    {roleCta.subtext ?? `Employers browse TalentXcel's verified talent directory to recruit qualified ${roleDisplay} candidates directly. Create your profile and Career Passport today.`}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="font-semibold gap-2"
                      onClick={() => trackCtaClick({ cta_type: 'primary', page_type: 'RoleLocationDiscovery', destination: roleCta.primaryHref, source_page: window.location.pathname, role_slug: roleSlug, city_slug: citySlug })}
                    >
                      <Link to={roleCta.primaryHref}>
                        {roleCta.primaryLabel}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    {roleCta.secondaryLabel && roleCta.secondaryHref && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="font-semibold"
                        onClick={() => trackCtaClick({ cta_type: 'secondary', page_type: 'RoleLocationDiscovery', destination: roleCta.secondaryHref!, source_page: window.location.pathname, role_slug: roleSlug, city_slug: citySlug })}
                      >
                        <Link to={roleCta.secondaryHref}>{roleCta.secondaryLabel}</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Related Career Discoveries & Internal Links */}
        <section className="mt-12 pt-8 border-t border-border space-y-6">
          <h2 className="text-xl font-bold text-foreground">
            Related Career Discoveries for {roleDisplay}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to={`/jobs/${roleSlug}/mumbai`}
              className="p-4 border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all space-y-1 block"
            >
              <div className="text-xs text-muted-foreground">Location Search</div>
              <div className="text-sm font-semibold text-foreground">{roleDisplay} in Mumbai</div>
            </Link>
            <Link
              to={`/jobs/${roleSlug}/delhi-ncr`}
              className="p-4 border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all space-y-1 block"
            >
              <div className="text-xs text-muted-foreground">Location Search</div>
              <div className="text-sm font-semibold text-foreground">{roleDisplay} in Delhi NCR</div>
            </Link>
            <Link
              to={`/roles/${roleSlug}`}
              className="p-4 border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all space-y-1 block"
            >
              <div className="text-xs text-muted-foreground">Career Role Hub</div>
              <div className="text-sm font-semibold text-foreground">{roleDisplay} Skill Roadmap</div>
            </Link>
            <Link
              to={`/locations/${citySlug}`}
              className="p-4 border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all space-y-1 block"
            >
              <div className="text-xs text-muted-foreground">City Career Hub</div>
              <div className="text-sm font-semibold text-foreground">{cityDisplay} Employment Hub</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default JobsByRoleCity;