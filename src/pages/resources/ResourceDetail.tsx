import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchContentItem, categoryToCtaPageType, getCategoryLabel, ContentItem } from '@/config/contentRegistry';
import { getCta, CtaPageType } from '@/config/ctaSystem';
import { trackDiscoveryPageView, trackCtaClick } from '@/utils/growthTelemetry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, BookOpen, Briefcase, CheckCircle2, UserCheck, Sparkles,
  Loader2, AlertCircle, ArrowRight, TrendingUp, Users, Zap, Award, Star,
  ChevronRight,
} from 'lucide-react';
import NotFound from '@/pages/NotFound';

// ─── CTA Icon Map ────────────────────────────────────────────────────────────
const CTA_ICONS: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  book: <BookOpen className="w-5 h-5" />,
  user: <UserCheck className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  award: <Award className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  'trending-up': <TrendingUp className="w-5 h-5" />,
};

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
const Breadcrumb: React.FC<{ category: string; title: string }> = ({ category, title }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
    <ChevronRight className="w-3 h-3" />
    <Link to="/resources" className="hover:text-primary transition-colors">Resources</Link>
    <ChevronRight className="w-3 h-3" />
    <span className="text-foreground font-medium">{category}</span>
  </nav>
);

// ─── Contextual CTA Banner ───────────────────────────────────────────────────
const CtaBanner: React.FC<{ ctaPageType: string; title?: string }> = ({ ctaPageType, title }) => {
  const cta = getCta(ctaPageType as CtaPageType);
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {cta.headline ?? 'Accelerate Your Career with TalentXcel'}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {cta.subtext ?? 'Join TalentXcel to access career tools, skills assessment, and professional networking.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              asChild
              size="lg"
              className="font-semibold gap-2"
              onClick={() => trackCtaClick({ cta_type: 'primary', page_type: ctaPageType, destination: cta.primaryHref, source_page: window.location.pathname })}
            >
              <Link to={cta.primaryHref}>
                {cta.primaryIcon && CTA_ICONS[cta.primaryIcon]}
                {cta.primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            {cta.secondaryLabel && cta.secondaryHref && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-semibold"
                onClick={() => trackCtaClick({ cta_type: 'secondary', page_type: ctaPageType, destination: cta.secondaryHref!, source_page: window.location.pathname })}
              >
                <Link to={cta.secondaryHref}>{cta.secondaryLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main ResourceDetail ──────────────────────────────────────────────────────
export const ResourceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<ContentItem | null | undefined>(undefined);
  // undefined = loading, null = not found, ContentItem = loaded

  useEffect(() => {
    if (!slug) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setItem(undefined); // reset to loading state on slug change
    fetchContentItem(slug).then((result) => {
      if (!cancelled) {
        setItem(result);
        if (result) {
          trackDiscoveryPageView({
            page_type: result.category,
            role_slug: result.relatedRoles[0] ? result.relatedRoles[0].toLowerCase().replace(/\s+/g, '-') : undefined,
            category: result.category,
          });
        }
      }
    });
    return () => { cancelled = true; };
  }, [slug]);

  // Loading state
  if (item === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading guide...</p>
        </div>
      </div>
    );
  }

  // Not found — real 404, not a generic shell
  if (item === null) {
    return <NotFound />;
  }

  const ctaPageType = categoryToCtaPageType(item.category);
  const categoryLabel = getCategoryLabel(item.category);

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': item.schemaType || 'Article',
    headline: item.title,
    description: item.description,
    author: {
      '@type': 'Organization',
      name: item.author.name,
      url: item.author.sameAs || 'https://talentxcel.in',
    },
    datePublished: item.publishedDate,
    dateModified: item.updatedDate || item.publishedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': item.canonicalUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TalentXcel',
      url: 'https://talentxcel.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://talentxcel.in/talentxcel-logo.png',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://talentxcel.in' },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: 'https://talentxcel.in/resources' },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `https://talentxcel.in/resources` },
      { '@type': 'ListItem', position: 4, name: item.title, item: item.canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{item.title}</title>
        <meta name="description" content={item.description} />
        <link rel="canonical" href={item.canonicalUrl} />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={item.title} />
        <meta property="og:description" content={item.description} />
        <meta property="og:url" content={item.canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="TalentXcel" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={item.title} />
        <meta name="twitter:description" content={item.description} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb category={categoryLabel} title={item.title} />

        {/* Back nav */}
        <Link
          to="/resources"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Career Resources
        </Link>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs uppercase tracking-wide">
              {categoryLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Published: {new Date(item.publishedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {item.updatedDate && (
              <span className="text-xs text-muted-foreground">
                · Updated: {new Date(item.updatedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {item.title}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {item.intro}
          </p>

          <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground border-t border-border">
            <UserCheck className="w-4 h-4 text-primary shrink-0" />
            <span>
              By <strong className="text-foreground">{item.author.name}</strong>
              {item.author.role && <> — {item.author.role}</>}
            </span>
          </div>
        </header>

        {/* Primary CTA (above the fold for high-intent pages) */}
        <CtaBanner ctaPageType={ctaPageType} title={item.title} />

        {/* Content Body */}
        <main className="space-y-6">
          {item.bodySections.map((section, idx) => (
            <Card key={idx} className="border border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl font-bold flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  {section.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2 pl-2">
                    {section.bulletPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-sm text-foreground">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </main>

        {/* Career Graph — Related Entities */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
          {item.relatedSkills && item.relatedSkills.length > 0 && (
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Related Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {item.relatedSkills.slice(0, 8).map((skill, sIdx) => (
                  <Link key={sIdx} to={`/skills/${skill.toLowerCase().replace(/[\s/]+/g, '-')}`}>
                    <Badge variant="outline" className="hover:bg-primary/10 transition-colors text-xs cursor-pointer">
                      {skill}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {item.relatedRoles && item.relatedRoles.length > 0 && (
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Related Career Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {item.relatedRoles.slice(0, 6).map((role, rIdx) => (
                  <Link key={rIdx} to={`/roles/${role.toLowerCase().replace(/[\s/]+/g, '-')}`}>
                    <Badge variant="outline" className="hover:bg-primary/10 transition-colors text-xs cursor-pointer">
                      {role}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {item.relatedIndustries && item.relatedIndustries.length > 0 && (
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Related Industries
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {item.relatedIndustries.slice(0, 4).map((industry, iIdx) => (
                  <Badge key={iIdx} variant="secondary" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {item.relatedLocations && item.relatedLocations.length > 0 && (
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Key Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {item.relatedLocations.slice(0, 6).map((loc, lIdx) => (
                  <Badge key={lIdx} variant="secondary" className="text-xs">
                    {loc}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Secondary CTA — bottom of page */}
        <CtaBanner ctaPageType={ctaPageType} />
      </div>
    </div>
  );
};

export default ResourceDetail;
