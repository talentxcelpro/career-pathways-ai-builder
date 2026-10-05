import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Download, Target, Briefcase, TrendingUp } from 'lucide-react';
import { ResumeExamplesGallery } from '@/components/resume/examples/ResumeExamplesGallery';

const ResumeExamplesPage: React.FC = () => {
  const { role: roleParam } = useParams<{ role?: string }>();
  const navigate = useNavigate();

  const formattedRole = roleParam 
    ? roleParam.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Software Engineer';

  const pageTitle = roleParam
    ? `${formattedRole} Resume Examples & Writing Guide (2026) | TalentXcel`
    : `Top Professional Resume Examples & Achievement Templates | TalentXcel`;

  const pageDescription = roleParam
    ? `Proven, interview-winning ${formattedRole} resume examples. Free ATS-friendly bullet points, quantified impact formulas, and downloadable templates verified by tech recruiters.`
    : `Browse verified, interview-winning resume examples across 200+ tech and business roles. Includes ATS-friendly formats, impact metrics, and recruiter-approved bullet points.`;

  const canonicalUrl = roleParam
    ? `https://talentxcel.in/resume/examples/${roleParam}`
    : `https://talentxcel.in/resume/examples`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `${formattedRole} Resume Examples`,
    'description': pageDescription,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': `Senior ${formattedRole} Resume Example`,
        'url': canonicalUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': `Entry-Level ${formattedRole} Resume Example`,
        'url': canonicalUrl
      }
    ]
  };

  const handleExampleSelect = (example: any) => {
    navigate(`/resume/builder?template=${example.template}&role=${encodeURIComponent(formattedRole)}`);
  };

  const handleTemplateApply = (templateId: string) => {
    navigate(`/resume/builder?template=${templateId}&role=${encodeURIComponent(formattedRole)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-border/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Recruiter-Audited Examples
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Updated for 2026 Hiring
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {formattedRole} Resume Examples & Bullet Guides
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-3xl">
            Real resumes that passed tier-1 ATS filters and landed interviews at top global employers. 
            Use these achievement-driven bullet points and structural layouts for your application.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link to={`/resume/builder?role=${encodeURIComponent(formattedRole)}`}>
                <Sparkles className="h-4 w-4 mr-2" />
                Build My {formattedRole} Resume
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/resume/ats-check/${roleParam || 'software-engineer'}`}>
                <Target className="h-4 w-4 mr-2" />
                Score My Resume with ATS Check
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to={`/salary/${roleParam || 'software-engineer'}`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View {formattedRole} Salaries
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Gallery */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Recruiter Formula Box */}
        <Card className="border-primary/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-900/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              The Google 'X-Y-Z' Formula in Action
            </CardTitle>
            <CardDescription>
              "Accomplished [X], as measured by [Y], by doing [Z]"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-red-50/80 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900">
                <span className="font-semibold text-red-700 dark:text-red-400">❌ Weak Bullet:</span>
                <p className="text-muted-foreground mt-1">"Responsible for developing backend APIs and improving performance for the core application."</p>
              </div>
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-900">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">✅ High-Impact Bullet:</span>
                <p className="text-foreground mt-1">"Architected high-throughput async payment microservices, slashing p99 latency by 42% and processing \$14M+ in quarterly transactions."</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Component */}
        <ResumeExamplesGallery 
          onExampleSelect={handleExampleSelect}
          onTemplateApply={handleTemplateApply}
        />

        {/* Cross-Universe Authority Links */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Explore Related Career & Search Resources</CardTitle>
            <CardDescription>Cross-reference salary benchmarks, live openings, and interview rounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Link 
                to={`/jobs/role/${roleParam || 'software-engineer'}`}
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>{formattedRole} Jobs</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to={`/salary/${roleParam || 'software-engineer'}`}
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>Salary Insights</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to={`/interview-questions/${roleParam || 'software-engineer'}`}
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>Interview Prep</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link 
                to={`/resume/ats-check/${roleParam || 'software-engineer'}`}
                className="p-3 rounded-lg border hover:border-primary transition-colors flex items-center justify-between"
              >
                <span>ATS Resume Audit</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ResumeExamplesPage;
