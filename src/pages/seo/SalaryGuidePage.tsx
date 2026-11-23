import React, { useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatCanonicalUrl } from '@/config/domainArchitecture';
import { SalaryBenchmarkEngine } from '@/services/salary/salaryBenchmarkEngine';
import { 
  DollarSign, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Calculator,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const formatSlug = (value?: string) => value
  ? value.split(/[-_]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  : '';

const formatLakhs = (amount: number): string => {
  if (!amount) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(amount / 100000).toFixed(1)} LPA`;
};

const formatMonthly = (amount: number): string => {
  if (!amount) return '₹0';
  const monthly = Math.round(amount / 12);
  if (monthly >= 100000) {
    return `₹${(monthly / 100000).toFixed(2)}L/mo`;
  }
  return `₹${(monthly / 1000).toFixed(0)}K/mo`;
};

const SalaryGuidePage: React.FC = () => {
  const { role, location, slug } = useParams<{ role?: string; location?: string; slug?: string }>();
  const routeLocation = useLocation();

  // Robust slug and parameter extraction
  const { rawRole, rawLocation } = useMemo(() => {
    let r = role || '';
    let loc = location || '';

    const target = slug || (r && r.includes('-in-') ? r : '');
    if (target) {
      const clean = target.replace(/-salary/g, '');
      const parts = clean.split('-in-');
      r = parts[0] || '';
      loc = parts.slice(1).join('-in-') || '';
    } else if (r && r.endsWith('-salary')) {
      r = r.replace(/-salary$/, '');
    }

    return {
      rawRole: r || 'software-engineer',
      rawLocation: loc || 'India',
    };
  }, [role, location, slug]);

  const roleName = formatSlug(rawRole) || 'Role';
  const locationName = rawLocation && rawLocation.toLowerCase() !== 'india' ? formatSlug(rawLocation) : 'India';
  const pageTitle = `${roleName} Salary Guide in ${locationName} (2026 Benchmark) | TalentXcel`;
  const pageDescription = `Explore verified compensation benchmarks, salary curves, and market ranges for ${roleName} in ${locationName} on TalentXcel Salary Intelligence.`;
  const canonical = formatCanonicalUrl(routeLocation.pathname || `/career-insights/salary/${rawRole}-salary-in-${rawLocation}`);

  // Compute deterministic benchmark from engine
  const benchmark = useMemo(() => {
    try {
      return SalaryBenchmarkEngine.getBenchmark({
        role: rawRole,
        location: rawLocation,
        experienceYears: 3,
      });
    } catch {
      return null;
    }
  }, [rawRole, rawLocation]);

  const inHand = useMemo(() => {
    if (!benchmark) return null;
    try {
      return SalaryBenchmarkEngine.calculateInHandBreakdown(benchmark.p50);
    } catch {
      return null;
    }
  }, [benchmark]);

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground pb-20">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonical}
        type="article"
      />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Occupation",
            "name": roleName,
            "description": `${roleName} compensation guide and salary benchmarks in ${locationName}`,
            "estimatedSalary": [
              {
                "@type": "MonetaryAmountDistribution",
                "name": "base",
                "currency": "INR",
                "median": benchmark?.p50 || 0,
                "percentile10": benchmark?.p10 || 0,
                "percentile90": benchmark?.p90 || 0
              }
            ]
          })
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/career-insights" className="hover:text-primary transition-colors">Career Insights</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/salary" className="hover:text-primary transition-colors">Salary Intelligence</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-foreground truncate">{roleName} ({locationName})</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-6 sm:p-10 overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/10 text-indigo-300 font-semibold px-3 py-1 text-xs">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                2026 Compensation Benchmark
              </Badge>
              <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 text-xs">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                Verified Market Intelligence
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {roleName} Salary in {locationName}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Comprehensive compensation distribution, percentile benchmarks, and take-home in-hand breakdown for <strong className="text-white">{roleName}</strong> professionals in <strong className="text-white">{locationName}</strong>. Compiled from verified industry requisitions and candidate disclosures.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20">
                <Link to={`/jobs?q=${encodeURIComponent(rawRole)}&location=${encodeURIComponent(rawLocation)}`}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Live {roleName} Jobs
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 rounded-xl">
                <Link to="/resume/ats-check">
                  <Award className="w-4 h-4 mr-2 text-amber-400" />
                  Free ATS Resume Check
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl text-xs">
                <Link to="/tools/salary-analyzer">
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  Salary Scenario Simulator
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4-Stat Metric Grid */}
        {benchmark && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5 space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                  <span>Entry Level (10th %)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatLakhs(benchmark.p10)}
                </div>
                <p className="text-[11px] text-muted-foreground">Baseline starting compensation</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-primary/30 shadow-md ring-1 ring-primary/20">
              <CardContent className="p-5 space-y-1.5">
                <div className="flex items-center justify-between text-primary text-xs font-bold">
                  <span>Median CTC (50th %)</span>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[10px] px-1.5 py-0">Market Median</Badge>
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-primary">
                  {formatLakhs(benchmark.p50)}
                </div>
                <p className="text-[11px] text-muted-foreground">Average industry median package</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5 space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                  <span>Senior / Lead (90th %)</span>
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatLakhs(benchmark.p90)}
                </div>
                <p className="text-[11px] text-muted-foreground">Top-tier verified compensation</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5 space-y-1.5">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                  <span>Estimated Take-Home</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {inHand?.estimatedMonthlyNet ? `₹${Math.round(inHand.estimatedMonthlyNet / 1000)}K/mo` : formatMonthly(benchmark.p50)}
                </div>
                <p className="text-[11px] text-muted-foreground">Estimated in-hand monthly payout</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* High-Value Skills Premium */}
        {benchmark && benchmark.topSkillsWithPremium && benchmark.topSkillsWithPremium.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Skills That Maximize {roleName} Compensation
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adding these competencies correlates with higher salary percentile placement in {locationName}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {benchmark.topSkillsWithPremium.slice(0, 6).map((sk) => (
                <div key={sk.skill} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">{sk.skill}</span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] shrink-0">
                    +{sk.premiumPercentage}% CTC
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contextual Career & Hiring CTA Card */}
        <section className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Are you being paid fairly as a {roleName}?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Upload your resume to evaluate your current compensation percentile against peer benchmarks in {locationName} and receive customized salary negotiation tips.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button asChild className="rounded-xl px-5 py-2 font-semibold text-xs shadow-md">
              <Link to="/tools/salary-analyzer">
                Run Personalized Analysis &rarr;
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SalaryGuidePage;
